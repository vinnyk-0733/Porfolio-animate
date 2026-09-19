import { MongoClient, Db } from "mongodb";

const uri = process.env.MONGODB_URI || "";
const dbName = process.env.MONGODB_DB || "portfolio_db";

let client: MongoClient | null = null;
let clientPromise: Promise<MongoClient> | null = null;

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

export function isMongoConfigured(): boolean {
  return Boolean(process.env.MONGODB_URI && process.env.MONGODB_URI.trim().length > 0);
}

export async function getMongoClient(): Promise<MongoClient | null> {
  if (!isMongoConfigured()) {
    return null;
  }

  try {
    if (process.env.NODE_ENV === "development") {
      if (!global._mongoClientPromise) {
        client = new MongoClient(uri, {
          serverSelectionTimeoutMS: 3000,
        });
        global._mongoClientPromise = client.connect();
      }
      return await global._mongoClientPromise;
    } else {
      if (!clientPromise) {
        client = new MongoClient(uri, {
          serverSelectionTimeoutMS: 4000,
        });
        clientPromise = client.connect();
      }
      return await clientPromise;
    }
  } catch (error) {
    // Retry after transient DNS/network failures instead of caching a rejected
    // connection for the lifetime of a hosting instance.
    global._mongoClientPromise = undefined;
    clientPromise = null;
    if (client) void client.close().catch(() => {});
    client = null;
    console.warn("Could not connect to MongoDB:", error instanceof Error ? error.name : "Connection error");
    return null;
  }
}

export async function getDatabase(): Promise<Db | null> {
  try {
    const mongoClient = await getMongoClient();
    if (!mongoClient) return null;
    return mongoClient.db(dbName);
  } catch (error) {
    console.warn("Failed to get MongoDB database:", error instanceof Error ? error.name : "Database error");
    return null;
  }
}
