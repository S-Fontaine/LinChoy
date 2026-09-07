import "dotenv/config";
import { connectDB, disconnectDB } from "../models/connection.js";
import GameServer from "../models/GameServer.js";

const servers = [
  {
    name: "Palworld",
    connectionInfo: {
      address: process.env.PALWORLD_ADDRESS,
      port: Number(process.env.PALWORLD_PORT),
      password: process.env.PALWORLD_PASSWORD,
    },
    playerInfo: { maxPlayers: 4 },
    serverInfo: {
      image: "/assets/palworld.webp",
      description:
        "Capture, élève et combat aux côtés de tes Pals dans un monde open-world qui mélange survie et créatures fantastiques. Serveur PvE, jusqu'à 4 joueurs, sans wipe régulier. Construction de base, exploration et raids de donjons au programme.",
    },
    gameData: {
      type: "palworld",
      containerName: "palworld-server",
      slug: "palworld",
    },
  },
  {
    name: "Minecraft",
    connectionInfo: {
      address: process.env.MINECRAFT_ADDRESS,
      port: Number(process.env.MINECRAFT_PORT),
      queryPort: Number(process.env.MINECRAFT_QUERY_PORT),
    },
    serverInfo: {
      image: "/assets/minecraft.webp",
      description:
        "Plonge dans l'univers cubique de Minecraft, où la créativité et l'aventure se rencontrent. Serveur PvE, sans mods — difficulté hard. Explore, construis et survive dans un monde généré aléatoirement.",
    },
    gameData: {
      type: "minecraft",
      containerName: "minecraft-solocorp",
      slug: "minecraft-hard",
    },
  },
  {
    name: "VRising",
    connectionInfo: {
      address: process.env.VRISING_ADDRESS,
      port: Number(process.env.VRISING_PORT),
      password: process.env.VRISING_PASSWORD,
      queryPort: Number(process.env.VRISING_QUERY_PORT),
    },
    serverInfo: {
      image: "/assets/vrising.webp",
      description:
        "Deviens un vampire redouté, bâtis ton château dans ce monde gothique impitoyable. Serveur PvE, rates normal. Chasse, artisanat et diplomatie entre clans.",
    },
    gameData: {
      type: "protocol-valve",
      containerName: "vrising-server",
      slug: "vrising",
    },
  },
  {
    name: "Valheim",
    connectionInfo: {
      address: process.env.VALHEIM_ADDRESS,
      port: Number(process.env.VALHEIM_PORT),
      password: process.env.VALHEIM_PASSWORD,
      queryPort: Number(process.env.VALHEIM_QUERY_PORT),
    },
    serverInfo: {
      image: "/assets/valheim.webp",
      description:
        "Embarque pour les terres de Valheim, où vikings et créatures légendaires s'affrontent dans un monde généré procéduralement. Serveur PvE, sans mods — difficulté standard. Idéal pour explorer, bâtir et affronter les boss en groupe.",
    },
    gameData: {
      type: "protocol-valve",
      containerName: "valheim-server",
      slug: "valheim",
    },
    statusInfo: {
      comingSoon: true,
    },
  },
];

async function seed() {
  await connectDB();
  for (const server of servers) {
    const { name, ...config } = server;
    await GameServer.findOneAndUpdate(
      { name },
      { $set: config },
      { upsert: true, returnDocument: "after" },
    );
    console.log(`[seed] ${name} synchronisé`);
  }
  await disconnectDB();
}

seed();
