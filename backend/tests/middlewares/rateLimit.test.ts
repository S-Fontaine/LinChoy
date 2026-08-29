import { describe, it, expect, beforeAll, afterAll } from "@jest/globals";
import express from "express";
import request from "supertest";
process.env.NODE_ENV = "production";

describe("authLimiter - configuration réelle (production-like)", () => {
  let app: express.Express;
  const originalNodeEnv = process.env.NODE_ENV;

  beforeAll(async () => {
    process.env.NODE_ENV = "production";

    const { authLimiter } = await import("../../src/middlewares/rateLimit.js");

    app = express();
    app.use(express.json());
    app.get("/authLimiter", authLimiter, (req, res) => {
      res.status(200).json({ ok: true });
    });
  });

  afterAll(() => {
    process.env.NODE_ENV = originalNodeEnv;
  });

  it("Bloque après 10 tentatives", async () => {
    for (let i = 0; i < 10; i++) {
      const res = await request(app).get("/authLimiter");
      expect(res.status).toBe(200);
    }

    const res = await request(app).get("/authLimiter");
    expect(res.status).toBe(429);
    expect(res.body.message).toBe("Trop de tentatives. Réessaie plus tard.");
  });
});

describe("authLimiter - configuration réelle (production-like)", () => {
  let app: express.Express;
  const originalNodeEnv = process.env.NODE_ENV;

  beforeAll(async () => {
    process.env.NODE_ENV = "production";

    const { resendVerificationLimiter } =
      await import("../../src/middlewares/rateLimit.js");

    app = express();
    app.use(express.json());
    app.get(
      "/resendVerificationLimiter",
      resendVerificationLimiter,
      (req, res) => {
        res.status(200).json({ ok: true });
      },
    );
  });

  afterAll(() => {
    process.env.NODE_ENV = originalNodeEnv;
  });

  it("Bloque après 3 tentatives", async () => {
    for (let i = 0; i < 3; i++) {
      const res = await request(app).get("/resendVerificationLimiter");
      expect(res.status).toBe(200);
    }

    const res = await request(app).get("/resendVerificationLimiter");
    expect(res.status).toBe(429);
    expect(res.body.message).toBe("Trop de tentatives. Réessaie plus tard.");
  });
});

describe("forgotPasswordLimiter - configuration réelle (production-like)", () => {
  let app: express.Express;
  const originalNodeEnv = process.env.NODE_ENV;

  beforeAll(async () => {
    process.env.NODE_ENV = "production";

    const { forgotPasswordLimiter } =
      await import("../../src/middlewares/rateLimit.js");

    app = express();
    app.use(express.json());
    app.get("/forgotPasswordLimiter", forgotPasswordLimiter, (req, res) => {
      res.status(200).json({ ok: true });
    });
  });

  afterAll(() => {
    process.env.NODE_ENV = originalNodeEnv;
  });

  it("Bloque après 3 tentatives", async () => {
    for (let i = 0; i < 3; i++) {
      const res = await request(app).get("/forgotPasswordLimiter");
      expect(res.status).toBe(200);
    }

    const res = await request(app).get("/forgotPasswordLimiter");
    expect(res.status).toBe(429);
    expect(res.body.message).toBe("Trop de tentatives. Réessaie plus tard.");
  });
});
