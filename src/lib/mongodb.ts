import mongoose from "mongoose";

declare global {
  var _mongooseConn: Promise<typeof mongoose> | undefined;
}

export function connectToDatabase() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("Missing MONGODB_URI environment variable");

  if (!global._mongooseConn) {
    global._mongooseConn = mongoose.connect(uri, { dbName: "dotcoffie" });
  }
  return global._mongooseConn;
}
