/* eslint-disable @typescript-eslint/no-require-imports -- Node runs this isolated test harness as CommonJS. */
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const { test, beforeEach, afterEach } = require("node:test");
const ts = require("typescript");
const { NextRequest } = require("next/server");

const sourceRoot = path.resolve(__dirname, "../src");
const secret = "security-test-secret-only-0123456789abcdef";
const password = "test-only-password-with-enough-entropy";
const salt = "0123456789abcdef0123456789abcdef";
const credential = {
  username: "admin",
  passwordVersion: 2,
  iterations: 210000,
  salt,
  hash: crypto.pbkdf2Sync(password, salt, 210000, 64, "sha512").toString("hex"),
};
const originalEnvironment = {
  AUTH_SECRET: process.env.AUTH_SECRET,
  NODE_ENV: process.env.NODE_ENV,
};

beforeEach(() => {
  process.env.AUTH_SECRET = secret;
  process.env.NODE_ENV = "test";
});

afterEach(() => {
  for (const [name, value] of Object.entries(originalEnvironment)) {
    if (value === undefined) delete process.env[name];
    else process.env[name] = value;
  }
});

const mutationCases = [
  { route: "profile", method: "PUT", update: "updateProfileData", read: "getProfileData", body: { name: "Test" } },
  { route: "projects", method: "PUT", update: "updateProjectsData", read: "getProjectsData", body: [{ title: "Test" }] },
  { route: "skills", method: "PUT", update: "updateSkillsData", read: "getSkillsData", body: { categories: [] } },
  { route: "certifications", method: "PUT", update: "updateCertificationsData", read: "getCertificationsData", body: [{ title: "Test" }] },
  { route: "experience", method: "PUT", update: "updateExperienceData", read: "getExperienceData", body: { items: [] } },
  { route: "timeline", method: "PUT", update: "updateTimelineData", read: "getTimelineData", body: [{ title: "Test" }] },
  { route: "socials", method: "PUT", update: "updateSocialsData", read: "getSocialsData", body: [{ name: "Test" }] },
  { route: "seed", method: "POST", update: "seedDatabase", body: {} },
];

// Compile the application's actual TypeScript without writing generated files.
// Explicit imports isolate these tests from MongoDB and all external services.
function fixture(settingsStore = { document: null }) {
  const state = { calls: [], auth: { ...credential }, database: "available" };
  const cache = new Map();
  const db = {};
  for (const item of mutationCases) {
    db[item.update] = async (...args) => {
      state.calls.push({ method: item.update, args });
      return item.route === "seed" ? { seeded: true } : args[0];
    };
    if (item.read) {
      db[item.read] = async () => {
        state.calls.push({ method: item.read, args: [] });
        return item.body;
      };
    }
  }
  db.getAllPortfolioData = async () => {
    state.calls.push({ method: "getAllPortfolioData", args: [] });
    return { profile: { name: "Public portfolio" } };
  };

  const mongodb = {
    async getDatabase() {
      state.calls.push({ method: "getDatabase", args: [] });
      if (state.database === "unavailable") return null;
      if (state.database === "failure") throw new Error("Simulated database failure");
      return {
        collection(name) {
          if (name === "admin_settings") {
            return {
              async findOne(query) {
                assert.deepEqual(query, { _id: "session-signing-key" });
                state.calls.push({ method: "readSessionKey", args: [] });
                return settingsStore.document;
              },
              async updateOne(query, update, options) {
                assert.deepEqual(query, { _id: "session-signing-key" });
                assert.deepEqual(options, { upsert: true });
                state.calls.push({ method: "createSessionKey", args: [] });
                if (state.keyWriteFailure) throw new Error("Simulated key storage failure");
                settingsStore.document ??= { _id: query._id, ...update.$setOnInsert };
                if (state.duplicateKeyRace) throw Object.assign(new Error("Duplicate key"), { code: 11000 });
              },
            };
          }
          assert.equal(name, "admin_auth");
          return {
            async findOne(query) {
              assert.deepEqual(query, { username: "admin" });
              state.calls.push({ method: "findOne", args: [query] });
              return state.auth;
            },
          };
        },
      };
    },
  };

  function load(relativePath) {
    if (cache.has(relativePath)) return cache.get(relativePath).exports;
    const file = path.join(sourceRoot, relativePath);
    const output = ts.transpileModule(fs.readFileSync(file, "utf8"), {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
        esModuleInterop: true,
      },
      fileName: file,
    }).outputText;
    const compiledModule = { exports: {} };
    cache.set(relativePath, compiledModule);
    const isolatedRequire = (specifier) => {
      if (specifier === "@/lib/db") return db;
      if (specifier === "@/lib/mongodb") return mongodb;
      if (specifier === "@/lib/auth") return load("lib/auth.ts");
      if (specifier === "@/lib/require-admin") return load("lib/require-admin.ts");
      if (["next/server", "node:crypto", "node:util"].includes(specifier)) return require(specifier);
      throw new Error(`Unexpected import in isolated security test: ${specifier}`);
    };
    new Function("require", "module", "exports", output)(isolatedRequire, compiledModule, compiledModule.exports);
    return compiledModule.exports;
  }

  return { state, auth: load("lib/auth.ts"), route: (name) => load(`app/api/${name}/route.ts`) };
}

function request(route, { method = "GET", token, body, rawBody, headers = {} } = {}) {
  const requestHeaders = new Headers(headers);
  if (token) requestHeaders.set("cookie", `admin_token=${token}`);
  if (body !== undefined || rawBody !== undefined) requestHeaders.set("content-type", "application/json");
  const req = new NextRequest(`https://portfolio.test/api/${route}`, {
    method,
    headers: requestHeaders,
    body: rawBody !== undefined ? rawBody : body === undefined ? undefined : JSON.stringify(body),
  });
  let bodyReads = 0;
  const parseJson = req.json.bind(req);
  req.json = async () => {
    bodyReads += 1;
    return parseJson();
  };
  return { req, bodyReads: () => bodyReads };
}

function signPayload(payload) {
  const data = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${data}.${crypto.createHmac("sha256", secret).update(data).digest("base64url")}`;
}

function sessionPayload(timestamp = Date.now()) {
  return { version: 2, role: "admin", timestamp, nonce: "a".repeat(32) };
}

function tamper(token) {
  const [data, signature] = token.split(".");
  return `${data}.${signature[0] === "A" ? "B" : "A"}${signature.slice(1)}`;
}

for (const item of mutationCases) {
  for (const tokenKind of ["absent", "tampered", "expired"]) {
    test(`${item.method} /api/${item.route} rejects ${tokenKind} session before reading body or database`, async () => {
      const app = fixture();
      const token = tokenKind === "absent" ? undefined
        : tokenKind === "tampered" ? tamper(await app.auth.generateSessionToken())
          : signPayload(sessionPayload(Date.now() - app.auth.SESSION_MAX_AGE * 1000 - 1000));
      const input = request(item.route, { method: item.method, token, rawBody: "invalid JSON" });
      const response = await app.route(item.route)[item.method](input.req);
      assert.equal(response.status, 401);
      assert.equal(response.headers.get("cache-control"), "no-store");
      assert.equal(input.bodyReads(), 0);
      assert.deepEqual(app.state.calls, []);
    });
  }

  test(`${item.method} /api/${item.route} allows an authenticated same-origin update`, async () => {
    const app = fixture();
    const input = request(item.route, {
      method: item.method,
      token: await app.auth.generateSessionToken(),
      body: item.body,
      headers: { origin: "https://portfolio.test" },
    });
    const response = await app.route(item.route)[item.method](input.req);
    assert.equal(response.status, 200);
    assert.equal((await response.json()).success, true);
    assert.equal(input.bodyReads(), 1);
    assert.deepEqual(app.state.calls, [{ method: item.update, args: [item.route === "seed" ? false : item.body] }]);
  });

  test(`${item.method} /api/${item.route} blocks cross-origin authenticated mutations`, async () => {
    const app = fixture();
    const input = request(item.route, {
      method: item.method,
      token: await app.auth.generateSessionToken(),
      body: item.body,
      headers: { origin: "https://attacker.test" },
    });
    assert.equal((await app.route(item.route)[item.method](input.req)).status, 403);
    assert.equal(input.bodyReads(), 0);
    assert.deepEqual(app.state.calls, []);
  });
}

for (const item of [...mutationCases.filter((item) => item.read), { route: "portfolio", read: "getAllPortfolioData" }]) {
  test(`GET /api/${item.route} remains public`, async () => {
    const app = fixture();
    const response = await app.route(item.route).GET(request(item.route).req);
    assert.equal(response.status, 200);
    assert.deepEqual(app.state.calls, [{ method: item.read, args: [] }]);
  });
}

test("seed has no GET handler, so Next.js can reject unsafe GET requests", () => {
  const app = fixture();
  assert.equal(app.route("seed").GET, undefined);
  assert.deepEqual(app.state.calls, []);
});

for (const force of [false, true]) {
  test(`seed passes explicit force=${force} unchanged to the database`, async () => {
    const app = fixture();
    const response = await app.route("seed").POST(request("seed", {
      method: "POST", token: await app.auth.generateSessionToken(), body: { force },
    }).req);
    assert.equal(response.status, 200);
    assert.deepEqual(app.state.calls, [{ method: "seedDatabase", args: [force] }]);
  });
}

for (const body of [{ force: "false" }, { force: "true" }, { force: 1 }, { force: 0 }, { force: null }, { force: [] }, null, [], "true"]) {
  test(`seed rejects unsafe payload ${JSON.stringify(body)}`, async () => {
    const app = fixture();
    const response = await app.route("seed").POST(request("seed", {
      method: "POST", token: await app.auth.generateSessionToken(), body,
    }).req);
    assert.equal(response.status, 400);
    assert.deepEqual(app.state.calls, []);
  });
}

test("seed rejects malformed JSON before any database operation", async () => {
  const app = fixture();
  const response = await app.route("seed").POST(request("seed", {
    method: "POST", token: await app.auth.generateSessionToken(), rawBody: "{broken",
  }).req);
  assert.equal(response.status, 400);
  assert.deepEqual(app.state.calls, []);
});

test("new admin sessions verify and have unique nonces", async () => {
  const { auth } = fixture();
  const first = await auth.generateSessionToken();
  const second = await auth.generateSessionToken();
  assert.equal(await auth.verifySessionToken(first), true);
  assert.equal(await auth.verifySessionToken(second), true);
  assert.notEqual(first, second);
  assert.equal(await auth.verifySessionToken(tamper(first)), false);
});

for (const setting of [undefined, "", "short-secret", " ".repeat(32)]) {
  test(`login works with the saved password without a valid AUTH_SECRET (${JSON.stringify(setting)})`, async () => {
    if (setting === undefined) delete process.env.AUTH_SECRET;
    else process.env.AUTH_SECRET = setting;
    const store = { document: null };
    const app = fixture(store);
    const response = await app.route("auth").POST(request("auth", { method: "POST", body: { password } }).req);
    assert.equal(response.status, 200);
    assert.equal((await response.json()).success, true);
    const token = response.cookies.get("admin_token").value;
    assert.match(store.document.secret, /^[a-f0-9]{64}$/);
    assert.notEqual(store.document.secret, setting);
    const otherInstance = fixture(store);
    assert.equal(await otherInstance.auth.verifySessionToken(token), true);
    const updated = await otherInstance.route("profile").PUT(request("profile", {
      method: "PUT", token, body: { name: "Authenticated edit" },
    }).req);
    assert.equal(updated.status, 200);
    assert.ok(otherInstance.state.calls.some((call) => call.method === "updateProfileData"));
  });
}

test("a wrong password cannot create the automatic signing key or enable editing", async () => {
  delete process.env.AUTH_SECRET;
  const store = { document: null };
  const app = fixture(store);
  const response = await app.route("auth").POST(request("auth", {
    method: "POST", body: { password: "incorrect-password" },
  }).req);
  assert.equal(response.status, 401);
  assert.equal(response.cookies.get("admin_token"), undefined);
  assert.equal(store.document, null);
  assert.equal(app.state.calls.some((call) => call.method === "createSessionKey"), false);
});

test("verification without a stored key never provisions one", async () => {
  delete process.env.AUTH_SECRET;
  const store = { document: null };
  const app = fixture(store);
  assert.equal(await app.auth.verifySessionToken(signPayload(sessionPayload())), false);
  assert.equal(store.document, null);
  assert.equal(app.state.calls.some((call) => call.method === "createSessionKey"), false);
});

test("automatic sessions remain valid after another login and a server restart", async () => {
  delete process.env.AUTH_SECRET;
  const store = { document: null };
  const first = fixture(store);
  const firstToken = await first.auth.generateSessionToken();
  const key = store.document.secret;
  const second = fixture(store);
  const secondToken = await second.auth.generateSessionToken();
  assert.equal(store.document.secret, key);
  assert.equal(await second.auth.verifySessionToken(firstToken), true);
  assert.equal(await fixture(store).auth.verifySessionToken(secondToken), true);
  assert.equal(second.state.calls.some((call) => call.method === "createSessionKey"), false);
});

test("concurrent key provisioning reuses the winning unique database record", async () => {
  delete process.env.AUTH_SECRET;
  const store = { document: null };
  const app = fixture(store);
  app.state.duplicateKeyRace = true;
  const token = await app.auth.generateSessionToken();
  assert.equal(await fixture(store).auth.verifySessionToken(token), true);
});

test("failed session key storage never issues an authenticated cookie", async () => {
  delete process.env.AUTH_SECRET;
  const app = fixture();
  app.state.keyWriteFailure = true;
  const response = await app.route("auth").POST(request("auth", { method: "POST", body: { password } }).req);
  assert.equal(response.status, 503);
  assert.equal(response.cookies.get("admin_token"), undefined);
});

test("verification fails closed during database failure when using automatic keys", async () => {
  delete process.env.AUTH_SECRET;
  const store = { document: null };
  const app = fixture(store);
  const token = await app.auth.generateSessionToken();
  app.state.database = "failure";
  assert.equal(await app.auth.verifySessionToken(token), false);
});

test("signed expired, future, malformed timestamp, and legacy sessions are rejected", async () => {
  const { auth } = fixture();
  const invalidPayloads = [
    sessionPayload(Date.now() - auth.SESSION_MAX_AGE * 1000),
    sessionPayload(Date.now() + 60000),
    ...[null, "invalid", String(Date.now()), -1, 0, 1.5, Number.MAX_SAFE_INTEGER + 1].map(sessionPayload),
    { ...sessionPayload(), timestamp: undefined },
    { timestamp: Date.now() },
    { ...sessionPayload(), version: 1 },
    { ...sessionPayload(), role: "viewer" },
    { ...sessionPayload(), nonce: undefined },
    { ...sessionPayload(), nonce: "invalid" },
    null,
  ];
  for (const payload of invalidPayloads) {
    assert.equal(await auth.verifySessionToken(signPayload(payload)), false, JSON.stringify(payload));
  }
  for (const token of ["", "not.a.token", "a.b", "x".repeat(1025)]) {
    assert.equal(await auth.verifySessionToken(token), false);
  }
});

test("login with a provisioned password sets a secure HttpOnly session without returning its token", async () => {
  process.env.NODE_ENV = "production";
  const app = fixture();
  const response = await app.route("auth").POST(request("auth", { method: "POST", body: { password } }).req);
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("cache-control"), "no-store");
  const data = await response.json();
  assert.equal(data.success, true);
  assert.equal(data.token, undefined);
  const cookie = response.cookies.get("admin_token");
  assert.ok(cookie);
  assert.equal(await app.auth.verifySessionToken(cookie.value), true);
  assert.equal(JSON.stringify(data).includes(cookie.value), false);
  const header = response.headers.get("set-cookie");
  assert.match(header, /HttpOnly/i);
  assert.match(header, /Secure/i);
  assert.match(header, /SameSite=strict/i);
  assert.match(header, /Path=\//i);
  assert.match(header, new RegExp(`Max-Age=${app.auth.SESSION_MAX_AGE}`));
});

for (const failure of ["wrong password", "missing credentials", "legacy credentials", "malformed credentials", "database unavailable", "database failure"]) {
  test(`login fails closed for ${failure}`, async () => {
    const app = fixture();
    if (failure === "missing credentials") app.state.auth = null;
    if (failure === "legacy credentials") delete app.state.auth.passwordVersion;
    if (failure === "malformed credentials") app.state.auth.hash = "invalid";
    if (failure === "database unavailable") app.state.database = "unavailable";
    if (failure === "database failure") app.state.database = "failure";
    const submittedPassword = failure === "wrong password" ? "wrong-password" : password;
    const response = await app.route("auth").POST(request("auth", {
      method: "POST", body: { password: submittedPassword },
    }).req);
    assert.equal(response.status, 401);
    assert.equal(response.cookies.get("admin_token"), undefined);
    assert.equal((await response.json()).success, false);
    assert.equal(await app.auth.authenticateAdmin("admin123"), false);
  });
}

for (const body of [null, {}, { password: "" }, { password: 123 }, { password: "x".repeat(1025) }]) {
  test(`login rejects invalid password input (${typeof body?.password}) before database access`, async () => {
    const app = fixture();
    const response = await app.route("auth").POST(request("auth", { method: "POST", body }).req);
    assert.equal(response.status, 400);
    assert.deepEqual(app.state.calls, []);
  });
}

test("session status reports authentication and logout clears the HttpOnly cookie", async () => {
  const app = fixture();
  const route = app.route("auth");
  const token = await app.auth.generateSessionToken();
  assert.deepEqual(await (await route.GET(request("auth").req)).json(), { authenticated: false });
  assert.deepEqual(await (await route.GET(request("auth", { token }).req)).json(), { authenticated: true });
  const response = await route.DELETE(request("auth", { method: "DELETE", token }).req);
  assert.equal(response.status, 200);
  assert.equal(response.cookies.get("admin_token").value, "");
  assert.match(response.headers.get("set-cookie"), /Max-Age=0/i);
  assert.match(response.headers.get("set-cookie"), /HttpOnly/i);
  assert.deepEqual(app.state.calls, []);
});

for (const method of ["POST", "DELETE"]) {
  test(`auth ${method} rejects cross-site requests before body or database access`, async () => {
    const app = fixture();
    const input = request("auth", { method, body: { password }, headers: { "sec-fetch-site": "cross-site" } });
    assert.equal((await app.route("auth")[method](input.req)).status, 403);
    assert.equal(input.bodyReads(), 0);
    assert.deepEqual(app.state.calls, []);
  });
}
