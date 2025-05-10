// import mongoose from "mongoose";

// const MONGODB_URI = process.env.MONGODB_URI;

// if (!MONGODB_URI) {
//   throw new Error("Please define the MONGODB_URI environment variable");
// }

// /**
//  * Cached connection for MongoDB.
//  */
// let cached = global.mongoose;

// if (!cached) {
//   cached = global.mongoose = { conn: null, promise: null };
// }

// async function dbConnect() {
//   if (cached.conn) {
//     return cached.conn;
//   }

//   if (!cached.promise) {
//     cached.promise = mongoose.connect(MONGODB_URI).then((mongoose) => {
//       return mongoose;
//     });
//   }
//   cached.conn = await cached.promise;
//   return cached.conn;
// }

// export default dbConnect;

import mongoose from "mongoose";

const MONGODB_URI: string = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable");
}

// Define interface for the cached connection
interface MongooseCache {
  conn: mongoose.Connection | null;
  promise: Promise<typeof mongoose> | null;
}

// Add mongoose cache to globalThis to persist across hot reloads
declare global {
  let mongooseCache: MongooseCache | undefined;
}

const globalWithMongoose = globalThis as typeof globalThis & {
  mongooseCache: MongooseCache;
};

// Initialize global cache if not present
if (!globalWithMongoose.mongooseCache) {
  globalWithMongoose.mongooseCache = {
    conn: null,
    promise: null,
  };
}

const cached = globalWithMongoose.mongooseCache;

export async function connectToDatabase(): Promise<mongoose.Connection> {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI).then((mongoose) => mongoose);
  }

  cached.conn = (await cached.promise).connection;
  return cached.conn;
}

export async function disconnectFromDatabase(): Promise<void> {
  if (cached.conn) {
    await mongoose.disconnect();
    cached.conn = null;
    cached.promise = null;
  }
}

// User interface and schema
interface IUser {
  name?: string;
  email: string;
  password?: string;
  role: "member" | "trainer" | "admin";
  createdAt: Date;
}

const userSchema = new mongoose.Schema<IUser>({
  name: String,
  email: { type: String, required: true, unique: true },
  password: String,
  role: {
    type: String,
    enum: ["member", "trainer", "admin"],
    default: "member",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const User = (mongoose.models.User as mongoose.Model<IUser>) ||
  mongoose.model<IUser>("User", userSchema);
