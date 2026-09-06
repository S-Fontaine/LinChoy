import { describe, it, expect } from "@jest/globals";
import mongoose from "mongoose";
import ServerWhitelist from "../../src/models/ServerWhitelist.js"

describe("Test modèle: ServerWhitelist", () => {
  it("Crée un document valide avec whitelistedAt par défaut", async () => {
    const before = Date.now();
    const entry = await ServerWhitelist.create({
      user: new mongoose.Types.ObjectId(),
      gameServer: new mongoose.Types.ObjectId(),
    });

    expect(entry.whitelistedAt.getTime()).toBeGreaterThanOrEqual(before);
  });

  it("Exige user et gameServer", async () => {
    await expect(ServerWhitelist.create({})).rejects.toThrow();
  });

  it("Refuse un doublon (même user + même gameServer)", async () => {
    const user = new mongoose.Types.ObjectId();
    const gameServer = new mongoose.Types.ObjectId();

    await ServerWhitelist.create({ user, gameServer });

    await expect(ServerWhitelist.create({ user, gameServer })).rejects.toThrow();
  });

  it("Autorise le même utilisateur whitelisté sur deux serveurs différents", async () => {
    const user = new mongoose.Types.ObjectId();

    await ServerWhitelist.create({ user, gameServer: new mongoose.Types.ObjectId() });

    await expect(
      ServerWhitelist.create({ user, gameServer: new mongoose.Types.ObjectId() }),
    ).resolves.toBeDefined();
  });

  it("Autorise deux utilisateurs différents whitelistés sur le même serveur", async () => {
    const gameServer = new mongoose.Types.ObjectId();

    await ServerWhitelist.create({ user: new mongoose.Types.ObjectId(), gameServer });

    await expect(
      ServerWhitelist.create({ user: new mongoose.Types.ObjectId(), gameServer }),
    ).resolves.toBeDefined();
  });
});