import { jest, describe, it, expect } from "@jest/globals";
import { generateAccessToken } from "../../../src/utils/auth/jwt.js";
import User from "../../../src/models/User.js";

jest.unstable_mockModule("os", () => ({
  default: {
    loadavg: () => [0.5, 1.2, 0.8],
    uptime: () => 90061,
    totalmem: () => 8 * 1024 ** 3,
    freemem: () => 2 * 1024 ** 3,
  },
}));

const { default: app } = await import("../../../src/app.js");
const request = (await import("supertest")).default;

describe("Test route: GET /server/status", () => {
  it("Refuse la requête sans authentification", async () => {
    const res = await request(app).get("/server/status");
    expect(res.status).toBe(401);
  });

  it("Renvoie le statut serveur correctement formaté une fois authentifié", async () => {
    const user = await User.create({
      username: "linchoyTest",
      email: "fake@linchoy.com",
      password: "MotDePasse123!",
    });
    const token = generateAccessToken({ userId: user._id.toString() });

    const res = await request(app)
      .get("/server/status")
      .set("Cookie", `accessToken=${token}`);

    expect(res.status).toBe(200);
    expect(res.body.status).toContain("1 Jours");
    expect(res.body.statusRAM).toContain("2.00 GB");
    expect(res.body.statusRAM).toContain("8.00 GB");
    expect(res.body.statusCharge1).toBe("Charge 1min : 0.50");
    expect(res.body.statusCharge5).toBe("Charge 5min : 1.20");
    expect(res.body.statusCharge15).toBe("Charge 15min : 0.80");
  });
});
