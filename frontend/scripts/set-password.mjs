import { MongoClient } from "mongodb";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env.local if present
const envLocalPath = path.resolve(__dirname, "../.env.local");
const envPath = path.resolve(__dirname, "../.env");

function loadEnvFile(filePath) {
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, "utf-8");
    content.split(/\r?\n/).forEach((line) => {
      line = line.trim();
      if (!line || line.startsWith("#")) return;
      const eqIdx = line.indexOf("=");
      if (eqIdx !== -1) {
        const key = line.substring(0, eqIdx).trim();
        let val = line.substring(eqIdx + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    });
  }
}

loadEnvFile(envLocalPath);
loadEnvFile(envPath);

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || "portfolio_db";
const newPassword = process.argv[2] || "vinayakr073@s";

if (!uri) {
  console.error("Error: MONGODB_URI is not defined in .env.local or environment.");
  process.exit(1);
}

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, "sha512").toString("hex");
  return { hash, salt };
}

function verifyPassword(password, hash, salt) {
  const verifyHash = crypto.pbkdf2Sync(password, salt, 10000, 64, "sha512").toString("hex");
  return crypto.timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(verifyHash, "hex"));
}

async function main() {
  console.log(`Connecting to MongoDB...`);
  const client = new MongoClient(uri, { serverSelectionTimeoutMS: 5000 });

  try {
    await client.connect();
    console.log("Connected successfully to MongoDB Atlas.");

    const db = client.db(dbName);
    const collection = db.collection("admin_auth");

    const { hash, salt } = hashPassword(newPassword);

    // Verify hashing integrity
    if (!verifyPassword(newPassword, hash, salt)) {
      throw new Error("Password verification check failed internally.");
    }

    const result = await collection.updateOne(
      { username: "admin" },
      {
        $set: {
          username: "admin",
          hash,
          salt,
          updatedAt: new Date(),
        },
        $setOnInsert: {
          createdAt: new Date(),
        },
      },
      { upsert: true }
    );

    console.log("\nPassword update result:");
    console.log(`- Matched: ${result.matchedCount}`);
    console.log(`- Modified: ${result.modifiedCount}`);
    console.log(`- Upserted: ${result.upsertedCount ? result.upsertedId : "No (updated existing)"}`);
    console.log(`\nSuccessfully encrypted and stored new password in collection 'admin_auth'!`);
    console.log(`Password verification confirmed valid.`);
  } catch (error) {
    console.error("Failed to update password in MongoDB:", error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

main();
