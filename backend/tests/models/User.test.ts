import { describe, it, expect } from "@jest/globals";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import User from "../../src/models/User.js";

async function getValidationError(
  user: InstanceType<typeof User>,
): Promise<mongoose.Error.ValidationError | undefined> {
  try {
    await user.validate();
    return undefined;
  } catch (err) {
    return err as mongoose.Error.ValidationError;
  }
}

describe("Test modèle: User", () => {
  const payload = {
    username: "linchoyTest",
    email: "fake@linchoy.com",
    password: "adminLinchoyTest!",
  };

  it("Refuse un user sans username", async () => {
    const user = new User({ email: payload.email, password: payload.password });
    const err = await getValidationError(user);
    expect(err?.errors.username).toBeDefined();
  });

  it("Refuse un user sans email", async () => {
    const user = new User({
      username: payload.username,
      password: payload.password,
    });
    const err = await getValidationError(user);
    expect(err?.errors.email).toBeDefined();
  });

  it("Refuse un user sans password", async () => {
    const user = new User({ email: payload.email, username: payload.username });
    const err = await getValidationError(user);
    expect(err?.errors.password).toBeDefined();
  });

  it("Refuse un password trop court", async () => {
    const user = new User({
      email: payload.email,
      username: payload.username,
      password: "Court1!",
    });
    const err = await getValidationError(user);

    expect(err?.errors.password).toBeDefined();
  });

  it("Refuse un password sans majuscule", async () => {
    const user = new User({
      email: payload.email,
      username: payload.username,
      password: "motdepasse123!",
    });
    const err = await getValidationError(user);

    expect(err?.errors.password).toBeDefined();
  });

  it("Refuse un password sans caractère spécial", async () => {
    const user = new User({
      email: payload.email,
      username: payload.username,
      password: "MotDePasse1234",
    });
    const err = await getValidationError(user);

    expect(err?.errors.password).toBeDefined();
  });

  it("Accepte un password valide", async () => {
    const user = new User(payload);
    const err = await getValidationError(user);

    expect(err).toBeUndefined();
  });

  it("Hash le password avant sauvegarde réelle en DB", async () => {
    const user = await User.create(payload);

    expect(user.password).not.toBe(payload.password);
    expect(user.password?.startsWith("$2")).toBe(true);
  });

  it("Compare que le hash correspond bien au mot de passe hashé", async () => {
    const user = await User.create(payload);
    const match = await bcrypt.compare(payload.password, user.password!);

    expect(match).toBe(true);
  });

  it("Accepte un user avec tous les champs requis", async () => {
    const user = new User(payload);
    const err = await getValidationError(user);

    expect(err).toBeUndefined();
    expect(user.username).toBe(payload.username);
    expect(user.email).toBe(payload.email);
  });
});