import crypto from "crypto";
import { getDatabase } from "@/lib/mongodb";

const DEFAULT_ADMIN_PASSWORD = "vinayak073s";
const AUTH_SECRET = process.env.AUTH_SECRET || "vinaya-portfolio-secret-key-2026";

// Hash a password using PBKDF2 with a random salt
export function hashPassword(password: string): { hash: string; salt: string } {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, "sha512").toString("hex");
  return { hash, salt };
}

// Verify a password against stored hash and salt
export function verifyPassword(password: string, hash: string, salt: string): boolean {
  const verifyHash = crypto.pbkdf2Sync(password, salt, 10000, 64, "sha512").toString("hex");
  return crypto.timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(verifyHash, "hex"));
}

// Generate a signed session token
export function generateSessionToken(): string {
  const payload = {
    role: "admin",
    timestamp: Date.now(),
    nonce: crypto.randomBytes(8).toString("hex"),
  };
  const data = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto.createHmac("sha256", AUTH_SECRET).update(data).digest("base64url");
  return `${data}.${signature}`;
}

// Verify a session token (valid for 7 days)
export function verifySessionToken(token: string): boolean {
  if (!token || typeof token !== "string") return false;
  const parts = token.split(".");
  if (parts.length !== 2) return false;

  const [data, signature] = parts;
  const expectedSignature = crypto.createHmac("sha256", AUTH_SECRET).update(data).digest("base64url");
  if (signature !== expectedSignature) return false;

  try {
    const payload = JSON.parse(Buffer.from(data, "base64url").toString("utf8"));
    if (payload.role !== "admin") return false;
    const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days
    if (Date.now() - payload.timestamp > maxAge) return false;
    return true;
  } catch {
    return false;
  }
}

// Initialize admin auth in MongoDB if not already created
export async function ensureAdminAuth(): Promise<void> {
  try {
    const db = await getDatabase();
    if (!db) return;

    const existing = await db.collection("admin_auth").findOne({});
    if (!existing) {
      const { hash, salt } = hashPassword(DEFAULT_ADMIN_PASSWORD);
      await db.collection("admin_auth").insertOne({
        username: "admin",
        hash,
        salt,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      console.log("Admin authentication initialized in MongoDB with encrypted password.");
    }
  } catch (err) {
    console.warn("Could not ensure admin auth in MongoDB:", err);
  }
}

// Check admin credentials against MongoDB
export async function authenticateAdmin(password: string): Promise<boolean> {
  try {
    const db = await getDatabase();
    if (!db) {
      // Fallback: direct check against default password if database is offline
      return password === DEFAULT_ADMIN_PASSWORD;
    }

    let authDoc = await db.collection("admin_auth").findOne({});
    if (!authDoc) {
      await ensureAdminAuth();
      authDoc = await db.collection("admin_auth").findOne({});
    }

    if (!authDoc || !authDoc.hash || !authDoc.salt) {
      return password === DEFAULT_ADMIN_PASSWORD;
    }

    return verifyPassword(password, authDoc.hash, authDoc.salt);
  } catch (err) {
    console.warn("Authentication verification error, using fallback:", err);
    return password === DEFAULT_ADMIN_PASSWORD;
  }
}
