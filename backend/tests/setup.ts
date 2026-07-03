import dotenv from "dotenv";
import { beforeAll, afterEach, afterAll } from "@jest/globals";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";

dotenv.config({ path: ".env.test" });
let mongod: MongoMemoryServer;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());
});

afterEach(async () => {
  await mongoose.connection.db!.dropDatabase();
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongod.stop();
});
