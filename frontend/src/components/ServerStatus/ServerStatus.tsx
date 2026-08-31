"use client";
import { useState, useEffect } from "react";
import styles from "./ServerStatus.module.css";
import { GameStatus } from "./GameStatus";
import {
  FeaturedGameStatus,
  FeaturedGameStatusSkeleton,
} from "./FeaturedGameStatus";
import { fetchWithAuth } from "@/lib/fetchWithAuth";
import { useAuth } from "@/context/AuthContext";
import { type IGamesList } from "@/app/page";
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

interface SingleGameData {
  result: boolean;
  data: {
    state: "offline" | "starting" | "online";
    online: boolean;
    name: string;
    servername: string;
    description: string;
    image: string;
    totalPlayer: number;
    playerOnLine: number;
    players: string[];
  };
}

function getGroupOrder(game: IGamesList): number {
  if (game.comingSoon) return 1;
  if (game.status.state === "online" || game.status.state === "starting") {
    return 0;
  }
  return 2;
}

function sortGames(games: IGamesList[]): IGamesList[] {
  return [...games].sort((a, b) => {
    const groupDiff = getGroupOrder(a) - getGroupOrder(b);
    if (groupDiff !== 0) return groupDiff;
    return a.name.localeCompare(b.name, "fr");
  });
}

export default function ServerStatus({
  gamesList,
}: {
  gamesList: IGamesList[];
}) {
  const { user, setUser } = useAuth();
  const [gamesDataMap, setGamesDataMap] = useState<
    Record<string, SingleGameData>
  >({});
  const [favoriteLoading, setFavoriteLoading] = useState(false);

  useEffect(() => {
    if (!user) return;

    const eventSource = new EventSource(`${BACKEND_URL}/games/stream`);
    eventSource.onmessage = (event) => {
      const serverData = JSON.parse(event.data);
      setGamesDataMap((prev) => ({
        ...prev,
        [serverData.slug]: {
          result: true,
          data: {
            state: serverData.state,
            online: serverData.online,
            name: serverData.name,
            servername: serverData.servername,
            description: serverData.description,
            image: serverData.image,
            totalPlayer: serverData.totalPlayer,
            playerOnLine: serverData.playerOnLine,
            players: serverData.players,
          },
        },
      }));
    };
    return () => {
      eventSource.close();
    };
  }, [user]);

  async function toggleFavorite(slug: string) {
    if (!user || favoriteLoading) return;
    const newFavorite = user.favoriteServer === slug ? null : slug;

    setFavoriteLoading(true);
    const previousUser = user;
    setUser({ ...user, favoriteServer: newFavorite });

    try {
      const res = await fetchWithAuth(`/users/${user.id}/favorite-server`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: newFavorite }),
      });
      if (!res.ok) {
        setUser(previousUser);
      }
    } catch {
      setUser(previousUser);
    } finally {
      setFavoriteLoading(false);
    }
  }

  const sorted = sortGames(gamesList);
  const favoriteGame = sorted.find((g) => g.slug === user?.favoriteServer);
  const otherGames = sorted.filter((g) => g.slug !== user?.favoriteServer);

  function renderFavorite(game: IGamesList) {
    const gameData = gamesDataMap[game.slug];

    return (
      <div className={styles.favoriteWrapper}>
        {gameData ? (
          <FeaturedGameStatus
            state={gameData.data.state}
            isOnline={gameData.data.online}
            name={gameData.data.name}
            servername={gameData.data.servername}
            image={gameData.data.image}
            totalPlayer={gameData.data.totalPlayer}
            playerOnLine={gameData.data.playerOnLine}
            players={gameData.data.players}
            description={gameData.data.description}
            onToggleFavorite={() => toggleFavorite(game.slug)}
          />
        ) : (
          <FeaturedGameStatusSkeleton />
        )}
      </div>
    );
  }
  function renderCard(game: IGamesList, isFavorite: boolean) {
    const gameData = gamesDataMap[game.slug];

    if (!gameData) {
      return (
        <div key={game.slug} className={styles.cardSkeleton}>
          <div className={styles.skeletonImage} />
          <div className={styles.skeletonLine} style={{ width: "60%" }} />
          <div className={styles.skeletonLine} style={{ width: "40%" }} />
        </div>
      );
    }

    return (
      <div
        key={game.slug}
        className={`${styles.cardWrapper} ${isFavorite ? styles.favoriteWrapper : ""}`}
      >
        <GameStatus
          state={gameData.data.state}
          isOnline={gameData.data.online}
          name={gameData.data.name}
          servername={gameData.data.servername}
          image={gameData.data.image}
          totalPlayer={gameData.data.totalPlayer}
          playerOnLine={gameData.data.playerOnLine}
          players={gameData.data.players}
          description={gameData.data.description}
          isFavorite={isFavorite}
          onToggleFavorite={() => toggleFavorite(game.slug)}
        />
        {game.comingSoon && (
          <div className={styles.comingSoonOverlay}>
            <span className={styles.comingSoonBadge}>Bientôt disponible</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <main className={styles.mainContent}>
      <div className={styles.serverGrid}>
        {favoriteGame && renderFavorite(favoriteGame)}
        {otherGames.map((game) => renderCard(game, false))}
      </div>
    </main>
  );
}
