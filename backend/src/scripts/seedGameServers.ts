import "dotenv/config";
import { connectDB, disconnectDB } from "../models/connection.js";
import GameServer from "../models/GameServer.js";

const servers = [
  {
    name: "Palworld",
    type: "palworld",
    image: "/assets/palworld.png",
    address: process.env.PALWORLD_API_ADDRESS,
    port: Number(process.env.PALWORLD_API_PORT),
  },
  {
    name: "Minecraft",
    type: "minecraft",
    image: "/assets/minecraft.png",
    address: process.env.MINECRAFT_ADDRESS,
    port: Number(process.env.MINECRAFT_PORT) || 25565,
  },
  {
    name: "V Rising",
    type: "vrising",
    image: "/assets/vrising.png",
    address: process.env.VRISING_ADDRESS,
    port: Number(process.env.VRISING_PORT),
  },
  {
    name: "Valheim",
    type: "valheim",
    image: "/assets/valheim.png",
    address: process.env.VALHEIM_ADDRESS,
    port: Number(process.env.VALHEIM_PORT),
    comingSoon: true,
  },
];

async function seed() {
  await connectDB();
  for (const server of servers) {
    const { name, ...config } = server;
    await GameServer.findOneAndUpdate(
      { name },
      {
        $set: config,
        $setOnInsert: {
          status: { online: false, playerCount: 0 },
        },
      },
      { upsert: true, returnDocument: "after" },
    );
    console.log(`[seed] ${name} synchronisé`);
  }
  await disconnectDB();
}

seed();