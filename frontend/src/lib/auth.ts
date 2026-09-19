import crypto from "node:crypto";
import { promisify } from "node:util";
import { getDatabase } from "@/lib/mongodb";

export const SESSION_MAX_AGE = 7 * 24 * 60 * 60;
const PASSWORD_ITERATIONS = 210000;
const pbkdf2 = promisify(crypto.pbkdf2);

async function getAuthSecret(create = false): Promise<string | null> {
  const configuredSecret = process.env.AUTH_SECRET;
  if (configuredSecret && Buffer.byteLength(configuredSecret.trim(), "utf8") >= 32) {
    return configuredSecret;
  }

  // Persist a private random key so separate hosting instances share sessions.
  // Only successful password authentication may create it; verification is read-only.
  const db = await getDatabase();
  if (!db) return null;
  const settings = db.collection<{ _id: string; secret: string }>("admin_settings");
  const keyId = "session-signing-key";
  let setting = await settings.findOne({ _id: keyId });
  if (!setting && create) {
    try {
      await settings.updateOne(
        { _id: keyId },
        { $setOnInsert: { secret: crypto.randomBytes(32).toString("hex") } },
        { upsert: true }
      );
    } catch (error) {
      // A concurrent first sign-in may win the unique _id insertion.
      if (!error || typeof error !== "object" || !("code" in error) || error.code !== 11000) throw error;
    }
    setting = await settings.findOne({ _id: keyId });
  }
  return setting && /^[a-f0-9]{64}$/.test(setting.secret) ? setting.secret : null;
}

export async function generateSessionToken(): Promise<string> {
  const secret = await getAuthSecret(true);
  if (!secret) throw new Error("Admin session storage is unavailable");

  const payload = {
    version: 2,
    role: "admin",
    timestamp: Date.now(),
    nonce: crypto.randomBytes(16).toString("hex"),
  };
  const data = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto.createHmac("sha256", secret).update(data).digest("base64url");
  return `${data}.${signature}`;
}

export async function verifySessionToken(token: string): Promise<boolean> {
  if (typeof token !== "string" || token.length > 1024) return false;
  const parts = token.split(".");
  if (parts.length !== 2) return false;

  const [data, signature] = parts;
  if (!/^[A-Za-z0-9_-]+$/.test(data) || !/^[A-Za-z0-9_-]{43}$/.test(signature)) return false;
  try {
    const payload = JSON.parse(Buffer.from(data, "base64url").toString("utf8"));
    if (!payload || payload.version !== 2 || payload.role !== "admin") return false;
    if (!Number.isSafeInteger(payload.timestamp) || payload.timestamp <= 0) return false;
    const age = Date.now() - payload.timestamp;
    if (age < 0 || age >= SESSION_MAX_AGE * 1000
      || typeof payload.nonce !== "string" || !/^[a-f0-9]{32}$/.test(payload.nonce)) return false;

    const secret = await getAuthSecret();
    if (!secret) return false;
    const expected = crypto.createHmac("sha256", secret).update(data).digest();
    const actual = Buffer.from(signature, "base64url");
    return actual.length === expected.length && crypto.timingSafeEqual(actual, expected);
  } catch {
    return false;
  }
}

// Only explicitly provisioned credentials are accepted. Legacy credentials may
// contain the former public default password and must be reset with db:password.
export async function authenticateAdmin(password: string): Promise<boolean> {
  if (typeof password !== "string" || !password || Buffer.byteLength(password) > 1024) return false;

  try {
    const db = await getDatabase();
    if (!db) return false;
    const auth = await db.collection("admin_auth").findOne({ username: "admin" });
    if (!auth || auth.passwordVersion !== 2 || auth.iterations !== PASSWORD_ITERATIONS
      || typeof auth.hash !== "string" || !/^[a-f0-9]{128}$/.test(auth.hash)
      || typeof auth.salt !== "string" || !/^[a-f0-9]{32}$/.test(auth.salt)) return false;

    const candidate = await pbkdf2(password, auth.salt, PASSWORD_ITERATIONS, 64, "sha512");
    return crypto.timingSafeEqual(Buffer.from(auth.hash, "hex"), candidate);
  } catch {
    // Database failures must never enable a fallback login.
    return false;
  }
}
