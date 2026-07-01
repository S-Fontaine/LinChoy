import mongoose from "mongoose";

export async function connectDB(): Promise<void> {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error("MONGODB_URI n'est pas défini dans le .env");
  }

  mongoose.connection.on("connected", () => {
    console.log("[db]: Connecté à MongoDB");
  });

  mongoose.connection.on("error", (err) => {
    console.error("[db]: Erreur de connexion MongoDB", err);
  });

  mongoose.connection.on("disconnected", () => {
    console.warn("[db]: Déconnecté de MongoDB");
  });

  await mongoose.connect(uri);
}

export async function disconnectDB(): Promise<void> {
  await mongoose.connection.close();
}