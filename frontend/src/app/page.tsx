import HomeView from "./HomeView";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export interface IGamesList {
  name: string;
  gameData: {
    type: string;
    slug: string;
  };
  playerInfo: {
    playerCount: number;
  };
  serverInfo: {
    image: string;
    description: string;
  };
  statusInfo: {
    online: boolean;
    comingSoon: boolean;
    state: "offline" | "starting" | "online";
    lastChecked: Date;
  };
}

async function getGamesList(): Promise<IGamesList[]> {
  try {
    const response = await fetch(`${BACKEND_URL}/games`, {
      method: "GET",
      cache: "no-store",
    });
    const data = await response.json();
    if (data?.result && Array.isArray(data.servers)) {
      return data.servers;
    }
  } catch (err) {
    console.error("Erreur de récupération :", err);
  }
  return [];
}

export default async function Home() {
  const gamesList = await getGamesList();
  return <HomeView gamesList={gamesList} />;
}
