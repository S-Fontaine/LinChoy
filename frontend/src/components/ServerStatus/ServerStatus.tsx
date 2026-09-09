"use client";
import { useCallback, useState } from "react";
import { GameStatus } from "./GameStatus";
import {
  FeaturedGameStatus,
  FeaturedGameStatusSkeleton,
} from "./FeaturedGameStatus";
import { fetchWithAuth } from "@/lib/fetchWithAuth";
import { useAuth } from "@/context/AuthContext";
import { useGameServersStream } from "@/hooks/useGameServersStream";
import { type IGamesList } from "@/app/page";

const skeletonBarClass = "rounded bg-border";
const favoriteWrapperClass = "col-span-full";

function getGroupOrder(game: IGamesList): number {
  if (game.statusInfo.comingSoon) return 1;
  if (game.statusInfo.state === "online" || game.statusInfo.state === "starting") {
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
  const { gamesDataMap } = useGameServersStream();
  const [favoriteLoading, setFavoriteLoading] = useState(false);

  const toggleFavorite = useCallback(
    async (slug: string) => {
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
    },
    [user, favoriteLoading, setUser],
  );

  const sorted = sortGames(gamesList);
  const favoriteGame = sorted.find((g) => g.gameData.slug === user?.favoriteServer);
  const otherGames = sorted.filter((g) => g.gameData.slug !== user?.favoriteServer);

  function renderFavorite(game: IGamesList) {
    const gameData = gamesDataMap[game.gameData.slug];

    return (
      <div className={favoriteWrapperClass}>
        {gameData ? (
          <FeaturedGameStatus
            slug={game.gameData.slug}
            type={game.gameData.type}
            state={gameData.data.state}
            isOnline={gameData.data.online}
            name={gameData.data.name}
            servername={gameData.data.servername}
            image={gameData.data.image}
            totalPlayer={gameData.data.totalPlayer}
            playerOnLine={gameData.data.playerOnLine}
            players={gameData.data.players}
            description={gameData.data.description}
            onToggleFavorite={toggleFavorite}
          />
        ) : (
          <FeaturedGameStatusSkeleton />
        )}
      </div>
    );
  }

  function renderCard(game: IGamesList, isFavorite: boolean, isPriority: boolean) {
    const gameData = gamesDataMap[game.gameData.slug];

    if (!gameData) {
      return (
        <div key={game.gameData.slug} className="relative h-full">
          <div className="flex h-[clamp(600px,calc(975px-93.75vw),675px)] max-w-145 flex-col overflow-hidden rounded-2xl border border-border bg-[color-mix(in_srgb,var(--bg-main)_75%,transparent)]">
            <div className="mx-6 flex items-center justify-between border-b border-border">
              <h2 className="my-3">
                <span className={`inline-block h-5 w-28 ${skeletonBarClass}`} />
              </h2>
              <div className={`h-4 w-14 ${skeletonBarClass}`} />
            </div>
            <div className="relative m-4 h-60 overflow-hidden rounded-[10px]">
              <div className="absolute inset-0 animate-[shimmer_1.5s_infinite] bg-[linear-gradient(90deg,var(--border)_25%,color-mix(in_srgb,var(--border)_60%,transparent)_50%,var(--border)_75%)] bg-size-[200%_100%]" />
            </div>
            <div className="flex min-h-25 flex-1 flex-col gap-3 px-5 pb-5">
              <div className="flex items-start justify-between">
                <div className={`h-5.5 w-32 ${skeletonBarClass}`} />
                <div className="h-8 w-24 rounded-[20px] bg-border" />
              </div>
              <div className="flex h-full flex-col justify-between">
                <div className={`min-h-11 w-full ${skeletonBarClass}`} />
                <div className="mt-3 h-10.5 w-full rounded-lg bg-border" />
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div
        key={game.gameData.slug}
        className={`relative h-full ${isFavorite ? favoriteWrapperClass : ""}`}
      >
        <GameStatus
          slug={game.gameData.slug}
          type={game.gameData.type}
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
          priority={isPriority}
          onToggleFavorite={toggleFavorite}
        />
        {game.statusInfo.comingSoon && (
          <div className="absolute inset-0 flex items-center justify-center rounded-2xl border border-border bg-[color-mix(in_srgb,var(--bg-main)_70%,transparent)] backdrop-blur-[6px]">
            <span className="rounded-full border border-border bg-bg-main px-5 py-2.5 text-[0.85rem] font-semibold tracking-[0.5px] text-text-high uppercase">
              Bientôt disponible
            </span>
          </div>
        )}
      </div>
    );
  }

  return (
    <main className="relative z-10 mx-auto max-w-312.5 px-6">
      <div className="my-8 grid grid-cols-[repeat(auto-fit,minmax(min(100%,340px),1fr))] gap-6">
        {favoriteGame && renderFavorite(favoriteGame)}
        {otherGames.map((game, index) =>
          renderCard(game, false, !favoriteGame && index === 0),
        )}
      </div>
    </main>
  );
}
