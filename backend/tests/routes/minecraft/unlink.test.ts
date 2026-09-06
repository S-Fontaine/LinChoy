import { jest, describe, it, expect, beforeEach } from "@jest/globals";

const revokeAllWhitelistsForUserMock =
  jest.fn<
    (userId: string, accountType: string, identifier: string) => Promise<void>
  >();

jest.unstable_mockModule("../../../src/utils/linking/gameWhitelist.js", () => ({
  revokeAllWhitelistsForUser: revokeAllWhitelistsForUserMock,
}));

const { default: app } = await import("../../../src/app.js");
const { default: User } = await import("../../../src/models/User.js");
const { generateAccessToken } = await import("../../../src/utils/auth/jwt.js");
const request = (await import("supertest")).default;

const userPayload = {
  username: "linchoyTest",
  email: "fake@linchoy.com",
  password: "MotDePasse123!",
};

describe("Test route: DELETE /minecraft/link", () => {
  beforeEach(() => {
    revokeAllWhitelistsForUserMock.mockReset();
    revokeAllWhitelistsForUserMock.mockResolvedValue(undefined);
  });

  it("Refuse la requête sans authentification", async () => {
    const res = await request(app).delete("/minecraft/link");
    expect(res.status).toBe(401);
  });

  it("Délie le compte et révoque les whitelists existantes", async () => {
    const user = await User.create({
      ...userPayload,
      minecraftUuid: "uuid-1",
      minecraftUsername: "Notch",
      minecraftVerified: true,
    });
    const token = generateAccessToken({ userId: user._id.toString() });

    const res = await request(app)
      .delete("/minecraft/link")
      .set("Cookie", `accessToken=${token}`);

    expect(res.status).toBe(200);
    expect(revokeAllWhitelistsForUserMock).toHaveBeenCalledWith(
      user._id.toString(),
      "minecraft",
      "Notch",
    );

    const updated = await User.findById(user._id);
    expect(updated?.minecraftUuid).toBeNull();
    expect(updated?.minecraftUsername).toBeNull();
    expect(updated?.minecraftVerified).toBe(false);
  });

  it("Ne tente pas de révocation si aucun compte Minecraft n'était lié", async () => {
    const user = await User.create(userPayload);
    const token = generateAccessToken({ userId: user._id.toString() });

    const res = await request(app)
      .delete("/minecraft/link")
      .set("Cookie", `accessToken=${token}`);

    expect(res.status).toBe(200);
    expect(revokeAllWhitelistsForUserMock).not.toHaveBeenCalled();
  });
});
