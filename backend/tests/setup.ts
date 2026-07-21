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
});
afterEach(async () => {
  await mongoose.connection.db!.dropDatabase();
  jest.restoreAllMocks();
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongod.stop();
});
