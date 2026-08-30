import "dotenv/config";
import { connectDB, disconnectDB } from "../models/connection.js";
import GameServer from "../models/GameServer.js";

const servers = [
  {
    name: "Palworld",
    slug: "palworld",
    type: "palworld",
    containerName: "palworld-server",
    image: "/assets/palworld.webp",
    address: process.env.PALWORLD_API_ADDRESS,
    port: Number(process.env.PALWORLD_API_PORT),
  },
  {
    name: "Minecraft",
    slug: "minecraft-hard",
    type: "minecraft",
    containerName: "minecraft-solocorp",
    image: "/assets/minecraft.webp",
    address: process.env.MINECRAFT_ADDRESS,
    port: Number(process.env.MINECRAFT_PORT),
    queryPort: Number(process.env.MINECRAFT_QUERY_PORT),
  },
  {
    name: "V Rising",
    slug: "vrising",
    type: "protocol-valve",
    containerName: "vrising-server",
    image: "/assets/vrising.webp",
    address: process.env.VRISING_ADDRESS,
    port: Number(process.env.VRISING_PORT),
    queryPort: Number(process.env.VRISING_QUERY_PORT),
  },
  {
    name: "Valheim",
    slug: "valheim",
    type: "protocol-valve",
    containerName: "valheim-server",
    image: "/assets/valheim.webp",
    address: process.env.VALHEIM_ADDRESS,
    port: Number(process.env.VALHEIM_PORT),
    queryPort: Number(process.env.VALHEIM_QUERY_PORT),
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
