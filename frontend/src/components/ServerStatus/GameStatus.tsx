"use client";
import { memo, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { starOutline, starFilled } from "../icons/Icons";
import WhitelistButton from "./WhitelistButton";

interface IGame {
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
  isFavorite?: boolean;
  onToggleFavorite?: (slug: string) => void;
  priority?: boolean;
}

const cardStateClass: Record<IGame["state"], string> = {
  online: "border-choy-green shadow-[0_0_15px_rgba(50,205,50,0.15)]",
  starting: "border-lin-orange shadow-[0_0_15px_rgba(255,165,0,0.15)]",
  offline: "border-border",
};

const statusIndicatorClass: Record<IGame["state"], string> = {
  online: "bg-choy-green shadow-[0_0_10px_var(--choy-green)]",
  starting:
    "bg-lin-orange shadow-[0_0_10px_var(--lin-orange)] animate-[pulse_1.5s_ease-in-out_infinite]",
  offline: "bg-border",
};

const tooltipHiddenClass = "invisible opacity-0 translate-y-1 pointer-events-none";
const tooltipVisibleClass = "visible opacity-100 translate-y-0 pointer-events-auto";

export const GameStatus = memo(function GameStatus(game: IGame) {
  const isServerOn = game.isOnline;
  const hasOnlinePlayers = game.playerOnLine > 0 && game.players.length > 0;
  const [isTooltipOpen, setIsTooltipOpen] = useState(false);
  const badgeRef = useRef<HTMLDivElement>(null);
  const statusLabel =
    game.state === "online"
      ? "En ligne"
      : game.state === "starting"
        ? "Démarrage..."
        : "Hors ligne";

  useEffect(() => {
    if (!isTooltipOpen) return;

    function handleClickOutside(event: MouseEvent | TouchEvent) {
      if (
        badgeRef.current &&
        !badgeRef.current.contains(event.target as Node)
      ) {
        setIsTooltipOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isTooltipOpen]);

  return (
    <div
      className={`flex h-full max-w-145 flex-col overflow-hidden rounded-2xl border bg-[color-mix(in_srgb,var(--bg-main)_75%,transparent)] text-text-high [transition:border-color_0.3s_ease,box-shadow_0.3s_ease,transform_0.2s_ease] hover:-translate-y-1 ${cardStateClass[game.state]}`}
    >
      <div className="mx-6 flex items-center justify-between border-b border-border">
        <h2 className="my-3">{game.name}</h2>
        <div className="flex items-center gap-3">
          {game.onToggleFavorite && (
            <button
              className={`flex cursor-pointer border-0 bg-transparent p-1 transition-all duration-300 ease-smooth hover:text-lin-orange ${game.isFavorite ? "text-lin-orange" : "text-text-low"}`}
              onClick={() => game.onToggleFavorite?.(game.slug)}
              aria-label={
                game.isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"
              }
            >
              {game.isFavorite ? starFilled : starOutline}
            </button>
          )}
          <div className="flex items-center">
            <p className="mr-2 text-[12px] font-extrabold">{statusLabel}</p>
            <div
              className={`h-3 w-3 rounded-full transition-all duration-300 ease-smooth ${statusIndicatorClass[game.state]}`}
            ></div>
          </div>
        </div>
      </div>
      <div className="relative m-4 h-60 overflow-hidden rounded-[10px]">
        <Image
          className={`object-cover [transition:filter_0.3s_ease] ${isServerOn ? "grayscale-0" : "grayscale"}`}
          src={game.image}
          alt={game.name}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 45vw, 380px"
          fill
          preload={game.priority}
          loading={game.priority ? "eager" : undefined}
          fetchPriority={game.priority ? "high" : undefined}
        />
      </div>
      <div className="flex min-h-25 flex-1 flex-col gap-3 px-5 pb-5">
        <div className="flex items-start justify-between">
          <h3 className="flex items-center text-[1.1rem] font-bold">
            {game.servername}
          </h3>
          <div
            ref={badgeRef}
            className={`group relative ml-2 inline-flex items-center justify-center gap-2 rounded-[20px] border border-border bg-[rgba(255,255,255,0.05)] px-3 py-1.5 text-[0.85rem] font-semibold whitespace-nowrap ${
              hasOnlinePlayers ? "cursor-pointer hover:z-30" : "cursor-default"
            } ${isTooltipOpen ? "z-30" : ""}`}
            onClick={() => hasOnlinePlayers && setIsTooltipOpen((v) => !v)}
          >
            <span>
              {game.playerOnLine} / {game.totalPlayer} joueurs
            </span>
            {hasOnlinePlayers && (
              <div
                className={`absolute right-0 bottom-[calc(100%+8px)] z-30 min-w-40 max-w-55 rounded-[10px] border border-border bg-bg-main px-3 py-2.5 text-text-high whitespace-normal shadow-[0_8px_20px_rgba(0,0,0,0.35)] transition-[opacity,transform,visibility] duration-200 ease-[ease] after:absolute after:inset-x-0 after:top-full after:h-3 after:content-[''] group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-hover:pointer-events-auto ${
                  isTooltipOpen ? tooltipVisibleClass : tooltipHiddenClass
                }`}
              >
                <p className="mb-1.5 text-[0.7rem] font-bold tracking-wider text-[#aaa] uppercase">
                  En ligne
                </p>
                <ul className="m-0 flex max-h-40 list-none flex-col gap-1 p-0 text-[0.85rem] font-medium text-text-high overflow-y-auto">
                  {game.players.map((player) => (
                    <li key={player}>{player}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
        <div className="flex h-full flex-col justify-between">
          <p className="text-[0.9rem] leading-normal text-[#aaa]">
            {game.description}
          </p>
          <WhitelistButton slug={game.slug} gameType={game.type} />
        </div>
      </div>
    </div>
  );
});
