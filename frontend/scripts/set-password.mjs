import { MongoClient } from "mongodb";
import nextEnv from "@next/env";
import { pbkdf2Sync, randomBytes } from "node:crypto";
import { createInterface } from "node:readline";
import { Writable } from "node:stream";
import { fileURLToPath } from "node:url";

nextEnv.loadEnvConfig(fileURLToPath(new URL("../", import.meta.url)));

const iterations = 210000;

function readHiddenPassword(prompt) {
  return new Promise((resolve, reject) => {
    // Readline still handles editing and paste; its output never echoes secrets.
    const hiddenOutput = new Writable({
      write(_chunk, _encoding, callback) {
        callback();
      },
    });
    const reader = createInterface({
      input: process.stdin,
      output: hiddenOutput,
      terminal: true,
    });
    let answered = false;
    process.stdout.write(prompt);
    reader.once("SIGINT", () => reader.close());
    reader.once("close", () => {
      process.stdout.write("\n");
      if (!answered) reject(new Error("Password setup cancelled."));
    });
    reader.question("", (answer) => {
      answered = true;
      reader.close();
      resolve(answer);
    });
  });
}

async function getPassword() {
  let password = process.argv[2] || process.env.ADMIN_PASSWORD;
  if (process.env.ADMIN_PASSWORD) delete process.env.ADMIN_PASSWORD;

  if (!password) {
    if (!process.stdin.isTTY || !process.stdout.isTTY) {
      throw new Error("Provide password as argument, set ADMIN_PASSWORD, or run in a terminal for a hidden prompt.");
    }
    password = await readHiddenPassword("New admin password (input hidden): ");
    const confirmation = await readHiddenPassword("Confirm admin password (input hidden): ");
    if (password !== confirmation) throw new Error("Passwords do not match.");
  }

  if (Array.from(password).length < 8 || Buffer.byteLength(password, "utf8") > 1024) {
    throw new Error("The admin password must contain at least 8 characters and no more than 1024 UTF-8 bytes.");
  }
  return password;
}

async function main() {
  let password;
  try {
    password = await getPassword();
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
    return;
  }

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("MONGODB_URI must be configured in frontend/.env.local or the environment.");
    process.exitCode = 1;
    return;
  }

  let client;
  try {
    const salt = randomBytes(16).toString("hex");
    const hash = pbkdf2Sync(password, salt, iterations, 64, "sha512").toString("hex");
    password = undefined;
    client = new MongoClient(uri, { serverSelectionTimeoutMS: 5000 });
    await client.connect();
    await client.db(process.env.MONGODB_DB || "portfolio_db").collection("admin_auth").updateOne(
      { username: "admin" },
      {
        $set: {
          username: "admin",
          passwordVersion: 2,
          iterations,
          hash,
          salt,
          updatedAt: new Date(),
        },
        $setOnInsert: { createdAt: new Date() },
      },
      { upsert: true }
    );
    console.log("Admin password updated successfully.");
  } catch {
    // Driver errors can contain connection details. Keep those out of output.
    console.error("Password update failed. Check your MongoDB connection and database permissions.");
    process.exitCode = 1;
  } finally {
    if (client) await client.close();
  }
}

await main();
