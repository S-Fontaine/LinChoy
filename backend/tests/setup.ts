import dotenv from "dotenv";
import {
  beforeAll,
  afterEach,
  afterAll,
  beforeEach,
  jest,
} from "@jest/globals";
import { MongoMemoryServer } from "mongodb-memory-server";
import { mailer } from "../src/utils/mailer.js";
import mongoose from "mongoose";

dotenv.config({ path: ".env.test" });
let mongod: MongoMemoryServer;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());
});
beforeEach(() => {
  jest.spyOn(mailer, "sendVerificationEmail").mockResolvedValue(undefined);
  jest.spyOn(mailer, "sendPasswordResetEmail").mockResolvedValue(undefined);
});
afterEach(async () => {
  const collections = mongoose.connection.collections;
  await Promise.all(
    Object.values(collections).map((collection) => collection.deleteMany({})),
  );
  jest.restoreAllMocks();
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongod.stop();
});
