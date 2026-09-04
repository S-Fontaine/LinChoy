import mongoose, { type Document } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  authProvider: string;
  isVerified: boolean;
  favoriteServer: string | null;
  comparePassword(userPassword: string): Promise<boolean>;
  steamId: string | null;
  minecraftUuid: string | null;
  minecraftUsername: string | null;
  minecraftVerified: boolean;
  minecraftLinkedAt: Date | null;
}

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim: true,
    unique: true,
    validate: {
      validator: function (value: string): boolean {
        if (!value) return true;
        const hasMinLength = value.length >= 3;
        const hasMaxLength = value.length <= 15;
        return hasMinLength && hasMaxLength;
      },
      message:
        "Le nom d'utilisateur doit contenir un minimum de 3 caractères et un maximum de 15 caractères.",
    },
  },
  email: {
    type: String,
    required: true,
    trim: true,
    unique: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, "Email invalide"],
  },
  password: {
    type: String,
    required: function (this: IUser) {
      return this.authProvider === "local";
    },
    validate: {
      validator: function (value: string): boolean {
        if (!value) return true;
        const hasMinLength = value.length >= 12;
        const hasUppercase = /[A-Z]/.test(value);
        const hasSpecialChar = /[^A-Za-z0-9]/.test(value);
        return hasMinLength && hasUppercase && hasSpecialChar;
      },
      message:
        "Le mot de passe doit contenir au moins 12 caractères, une majuscule et un caractère spécial.",
    },
  },
  authProvider: {
    type: String,
    enum: ["local", "google", "github"],
    default: "local",
  },
  isVerified: {
    type: Boolean,
    required: true,
    default: false,
  },
  favoriteServer: {
    type: String,
    default: null,
  },
  steamId: {
    type: String,
    default: null,
  },
  minecraftUuid: { type: String, default: null },
  minecraftUsername: { type: String, default: null },
  minecraftVerified: { type: Boolean, default: false },
  minecraftLinkedAt: { type: Date, default: null },
});
userSchema.index(
  { steamId: 1 },
  { unique: true, partialFilterExpression: { steamId: { $type: "string" } } },
);
userSchema.index(
  { minecraftUuid: 1 },
  {
    unique: true,
    partialFilterExpression: { minecraftUuid: { $type: "string" } },
  },
);
userSchema.pre("save", async function () {
  if (!this.isModified("password") || !this.password) {
    return;
  }

  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.comparePassword = async function (
  userPassword: string,
): Promise<boolean> {
  if (!this.password) return false;
  return bcrypt.compare(userPassword, this.password);
};

export default mongoose.model<IUser>("User", userSchema);
