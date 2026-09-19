/* eslint-disable @typescript-eslint/no-require-imports -- Node test harness uses CommonJS. */
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const { test } = require("node:test");
const ts = require("typescript");
const { NextRequest } = require("next/server");

const password = "test-only-password";
const salt = "0123456789abcdef0123456789abcdef";
const credential = {
  username: "admin", passwordVersion: 2, iterations: 210000, salt,
  hash: crypto.pbkdf2Sync(password, salt, 210000, 64, "sha512").toString("hex"),
};
const routes = [
  ["profile", "updateProfileData", "getProfileData", { name: "Test" }],
  ["projects", "updateProjectsData", "getProjectsData", [{ title: "Test" }]],
  ["skills", "updateSkillsData", "getSkillsData", { categories: [] }],
  ["certifications", "updateCertificationsData", "getCertificationsData", [{ title: "Test" }]],
  ["experience", "updateExperienceData", "getExperienceData", { nodes: [] }],
  ["timeline", "updateTimelineData", "getTimelineData", [{ title: "Test" }]],
  ["socials", "updateSocialsData", "getSocialsData", [{ label: "Test" }]],
  ["seed", "seedDatabase", null, {}],
];

function fixture() {
  const state = { saved: { ...credential }, database: "available", calls: [], requests: [] };
  const db = {};
  for (const [route, update, read, body] of routes) {
    db[update] = async (value) => {
      state.calls.push({ method: update, value });
      return route === "seed" ? { seeded: true } : value;
    };
    if (read) db[read] = async () => body;
  }
  db.getAllPortfolioData = async () => ({ profile: { name: "Test" } });
  const mongodb = {
    async getDatabase() {
      if (state.database === "unavailable") return null;
      if (state.database === "failure") throw new Error("Simulated database failure");
      return {
        collection(name) {
          assert.equal(name, "admin_auth", "Password checks must not need settings or session storage");
          return {
            async findOne(query) {
              assert.deepEqual(query, { username: "admin" });
              return state.saved;
            },
          };
        },
      };
    },
  };
  const cache = new Map();
  function load(relativePath) {
    if (cache.has(relativePath)) return cache.get(relativePath).exports;
    const filename = path.resolve(__dirname, "../src", relativePath);
    const output = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
      fileName: filename,
    }).outputText;
    const compiled = { exports: {} };
    cache.set(relativePath, compiled);
    const isolatedRequire = (name) => {
      if (name === "@/lib/mongodb") return mongodb;
      if (name === "@/lib/db") return db;
      if (name === "@/lib/edit-password") return load("lib/edit-password.ts");
      if (["next/server", "node:crypto", "node:util"].includes(name)) return require(name);
      throw new Error("Unexpected import: " + name);
    };
    const fakeFetch = async (url, options) => {
      state.requests.push({ url, options });
      return new Response(JSON.stringify({ success: true }));
    };
    new Function("require", "module", "exports", "window", "fetch", output)(
      isolatedRequire, compiled, compiled.exports,
      { location: { origin: "https://portfolio.test" } }, fakeFetch
    );
    return compiled.exports;
  }
  return { state, load, route: (name) => load("app/api/" + name + "/route.ts") };
}

function request(route, { method = "POST", supplied, body = {}, rawBody, headers = {} } = {}) {
  const headerValues = new Headers(headers);
  headerValues.set("content-type", "application/json");
  if (supplied !== undefined) headerValues.set("x-edit-password", Buffer.from(supplied).toString("base64"));
  const req = new NextRequest("https://portfolio.test/api/" + route, {
    method, headers: headerValues,
    body: method === "GET" ? undefined : rawBody ?? JSON.stringify(body),
  });
  let reads = 0;
  const read = req.json.bind(req);
  req.json = async () => { reads++; return read(); };
  return { req, reads: () => reads };
}

test("correct password unlocks editing with no cookies, tokens or session records", async () => {
  const app = fixture();
  const response = await app.route("edit-mode").POST(request("edit-mode", { body: { password } }).req);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { success: true });
  assert.equal(response.headers.get("set-cookie"), null);
  assert.equal(response.headers.get("cache-control"), "no-store");
  assert.deepEqual(app.state.calls, []);
});

test("wrong password returns a simple unsuccessful check, not a login/account error", async () => {
  const app = fixture();
  const response = await app.route("edit-mode").POST(request("edit-mode", { body: { password: "wrong" } }).req);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { success: false, error: "Incorrect password.", code: "incorrect" });
  assert.equal(response.headers.get("set-cookie"), null);
});

test("stored passwords work without credential-version or account-role metadata", async () => {
  const app = fixture();
  delete app.state.saved.passwordVersion;
  assert.equal(await app.load("lib/edit-password.ts").checkPassword(password), "correct");
});

test("older saved password hashes are verified with their original iteration count", async () => {
  const app = fixture();
  app.state.saved = { salt, hash: crypto.pbkdf2Sync(password, salt, 10000, 64, "sha512").toString("hex") };
  assert.equal(await app.load("lib/edit-password.ts").checkPassword(password), "correct");
  assert.equal(await app.load("lib/edit-password.ts").checkPassword("wrong"), "incorrect");
});

for (const database of ["unavailable", "failure"]) {
  test("database " + database + " is reported separately from a wrong password", async () => {
    const app = fixture();
    app.state.database = database;
    const response = await app.route("edit-mode").POST(request("edit-mode", { body: { password } }).req);
    assert.equal(response.status, 503);
    const result = await response.json();
    assert.equal(result.code, "unavailable");
    assert.match(result.error, /database/);
    assert.equal(response.headers.get("set-cookie"), null);
  });
}

for (const saved of [null, {}, { ...credential, hash: "invalid" }, { ...credential, iterations: 5 }]) {
  test("missing or malformed saved password is not accepted", async () => {
    const app = fixture();
    app.state.saved = saved;
    const response = await app.route("edit-mode").POST(request("edit-mode", { body: { password } }).req);
    assert.equal(response.status, 503);
    assert.equal((await response.json()).code, "not-set");
  });
}

for (const body of [null, {}, { password: 1 }, { password: "" }, { password: "x".repeat(1025) }]) {
  test("invalid password input is rejected before unlocking", async () => {
    const response = await fixture().route("edit-mode").POST(request("edit-mode", { body }).req);
    assert.equal(response.status, 400);
    assert.equal(response.headers.get("set-cookie"), null);
  });
}

for (const [route, update, read, body] of routes) {
  const method = route === "seed" ? "POST" : "PUT";
  for (const supplied of [undefined, "wrong"]) {
    test(route + " cannot be changed without the correct password", async () => {
      const app = fixture();
      const input = request(route, { method, supplied, rawBody: "invalid-json" });
      const response = await app.route(route)[method](input.req);
      assert.equal(response.status, supplied === undefined ? 400 : 403);
      assert.equal(input.reads(), 0);
      assert.deepEqual(app.state.calls, []);
    });
  }
  test(route + " saves with the correct password and no session", async () => {
    const app = fixture();
    const input = request(route, { method, supplied: password, body });
    const response = await app.route(route)[method](input.req);
    assert.equal(response.status, 200);
    assert.deepEqual(app.state.calls, [{ method: update, value: route === "seed" ? false : body }]);
  });
  test(route + " rejects cross-origin writes before checking the body", async () => {
    const app = fixture();
    const input = request(route, { method, supplied: password, body, headers: { origin: "https://other.test" } });
    const response = await app.route(route)[method](input.req);
    assert.equal(response.status, 403);
    assert.equal(input.reads(), 0);
    assert.deepEqual(app.state.calls, []);
  });
  if (read) {
    test(route + " remains publicly readable without a password", async () => {
      const response = await fixture().route(route).GET();
      assert.equal(response.status, 200);
    });
  }
}

test("old login cookies cannot enable a save without the password", async () => {
  const app = fixture();
  const response = await app.route("profile").PUT(request("profile", {
    method: "PUT", body: { name: "Invalid" }, headers: { cookie: "admin_token=obsolete-token" },
  }).req);
  assert.equal(response.status, 400);
  assert.deepEqual(app.state.calls, []);
});

test("changing the saved password immediately prevents saves using the previous password", async () => {
  const app = fixture();
  const checker = app.load("lib/edit-password.ts");
  assert.equal(await checker.checkPassword(password), "correct");
  app.state.saved.hash = crypto.pbkdf2Sync("changed-password", salt, 210000, 64, "sha512").toString("hex");
  const response = await app.route("profile").PUT(request("profile", { method: "PUT", supplied: password }).req);
  assert.equal(response.status, 403);
  assert.deepEqual(app.state.calls, []);
});

test("the reset endpoint cannot reset data through GET", () => {
  assert.equal(fixture().route("seed").GET, undefined);
});

for (const force of [false, true, "true", null]) {
  test("reset accepts force only when boolean: " + JSON.stringify(force), async () => {
    const app = fixture();
    const response = await app.route("seed").POST(request("seed", { supplied: password, body: { force } }).req);
    assert.equal(response.status, typeof force === "boolean" ? 200 : 400);
    assert.deepEqual(app.state.calls, typeof force === "boolean" ? [{ method: "seedDatabase", value: force }] : []);
  });
}

test("save helper sends Unicode passwords only to the site's API, without cookies or redirects", async () => {
  const app = fixture();
  const value = "test-🔒-పాస్వర్డ్";
  const sender = app.load("lib/edit-request.ts");
  await sender.sendEditRequest("/api/profile", value, { method: "PUT", body: "{}" });
  const { url, options } = app.state.requests[0];
  assert.equal(url, "/api/profile");
  assert.equal(Buffer.from(options.headers.get("x-edit-password"), "base64").toString("utf8"), value);
  assert.equal(options.credentials, "omit");
  assert.equal(options.redirect, "error");
  assert.throws(() => sender.sendEditRequest("https://other.test/api/profile", value), /this website/);
  assert.throws(() => sender.sendEditRequest("//other.test/api/profile", value), /this website/);
  assert.throws(() => sender.sendEditRequest("/not-an-api", value), /this website/);
  assert.equal(app.state.requests.length, 1);
});

test("unlock endpoint rejects cross-origin attempts", async () => {
  const response = await fixture().route("edit-mode").POST(request("edit-mode", {
    body: { password }, headers: { origin: "https://other.test" },
  }).req);
  assert.equal(response.status, 403);
});
