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
    description:
      "Capture, élève et combat aux côtés de tes Pals dans un monde open-world qui mélange survie et créatures fantastiques. Serveur PvE, jusqu'à 4 joueurs, sans wipe régulier. Construction de base, exploration et raids de donjons au programme.",
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
    description:
      "Plonge dans l'univers cubique de Minecraft, où la créativité et l'aventure se rencontrent. Serveur PvE, sans mods — difficulté hard. Explore, construis et survive dans un monde généré aléatoirement.",
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
    description:
      "Deviens un vampire redouté, bâtis ton château dans ce monde gothique impitoyable. Serveur PvE, rates normal. Chasse, artisanat et diplomatie entre clans.",
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
    description:
      "Embarque pour les terres de Valheim, où vikings et créatures légendaires s'affrontent dans un monde généré procéduralement. Serveur PvE, sans mods — difficulté standard. Idéal pour explorer, bâtir et affronter les boss en groupe.",
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
