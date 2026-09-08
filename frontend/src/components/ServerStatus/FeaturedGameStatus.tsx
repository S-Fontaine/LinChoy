"use client";
import { memo } from "react";
import Image from "next/image";
import { starFilled } from "../icons/Icons";
import WhitelistButton from "./WhitelistButton";

interface IFeaturedGame {
  slug: string;
  type: string;
  state: "offline" | "starting" | "online";
  isOnline: boolean;
  name: string;
  servername: string;
  description: string;
  image: string;
  totalPlayer: number;
  playerOnLine: number;
  players: string[];
  onToggleFavorite: (slug: string) => void;
}

const cardBorderClass: Record<IFeaturedGame["state"], string> = {
  online: "border-choy-green",
  starting: "border-lin-orange",
  offline: "border-border",
};

const statusIndicatorClass: Record<IFeaturedGame["state"], string> = {
  online: "bg-choy-green shadow-[0_0_8px_var(--choy-green)]",
  starting:
    "bg-lin-orange shadow-[0_0_8px_var(--lin-orange)] animate-[pulse_1.5s_ease-in-out_infinite]",
  offline: "bg-text-low",
};

export { FeaturedGameStatusSkeleton } from "./FeaturedGameStatusSkeleton";
export const FeaturedGameStatus = memo(function FeaturedGameStatus(
  game: IFeaturedGame,
) {
  const statusLabel =
    game.state === "online"
      ? "En ligne"
      : game.state === "starting"
        ? "Démarrage..."
        : "Hors ligne";

  return (
    <div
      className={`flex min-h-100 overflow-hidden rounded-2xl border bg-[color-mix(in_srgb,var(--bg-main)_75%,transparent)] max-[700px]:flex-col ${cardBorderClass[game.state]}`}
    >
      <div className="relative min-h-70 flex-[0_0_40%] max-[700px]:h-50 max-[700px]:flex-none">
        <Image
          className={`object-cover transition-all duration-300 ease-smooth ${game.isOnline ? "" : "grayscale brightness-50"}`}
          src={game.image}
          alt={game.name}
          sizes="(max-width: 700px) 100vw, (max-width: 1298px) 40vw, 480px"
          fill
          loading="eager"
          fetchPriority="high"
        />
        <button
          className="absolute top-4 left-4 flex cursor-pointer items-center gap-1.5 rounded-full border border-lin-orange bg-[color-mix(in_srgb,var(--bg-main)_80%,transparent)] px-3 py-1.5 text-[0.8rem] font-semibold text-lin-orange backdrop-blur-xs [&_svg]:h-3.5 [&_svg]:w-3.5"
          onClick={() => game.onToggleFavorite(game.slug)}
          aria-label="Retirer des favoris"
        >
          {starFilled} Favori
        </button>
      </div>

      <div className="flex flex-1 flex-col gap-4 px-8 py-7">
        <div className="flex flex-col justify-between">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-[0.8rem] tracking-[0.5px] text-text-low uppercase">
              {game.name}
            </p>
            <div className="flex items-center gap-2">
              <p className="text-[12px] font-semibold text-text-high">
                {statusLabel}
              </p>
              <div
                className={`h-2.5 w-2.5 rounded-full ${statusIndicatorClass[game.state]}`}
              />
            </div>
          </div>
          <h2 className="mt-1 text-[1.6rem] font-bold text-text-high">
            {game.servername}
          </h2>
        </div>

        <p className="leading-normal text-text-medium">{game.description}</p>

        <div className="mt-auto border-y border-border">
          <div className="flex items-center justify-between">
            <p className="my-2.5 text-[0.85rem] text-text-low">
              Joueurs en ligne
            </p>
            <p className="text-[12px] font-semibold text-text-medium">
              {game.playerOnLine} / {game.totalPlayer} joueurs
            </p>
          </div>
          {game.players.length > 0 ? (
            <ul className="m-0 flex flex-wrap list-none gap-2 pb-2.5">
              {game.players.map((player) => (
                <li
                  key={player}
                  className="rounded-full border border-border bg-bg-input px-3.5 py-1.5 text-[0.85rem] text-text-high"
                >
                  {player}
                </li>
              ))}
            </ul>
          ) : (
            <p className="my-2.5 text-[0.9rem] text-text-low italic">
              Personne pour le moment
            </p>
          )}
        </div>
        <WhitelistButton slug={game.slug} gameType={game.type} />
      </div>
    </div>
  );
});
