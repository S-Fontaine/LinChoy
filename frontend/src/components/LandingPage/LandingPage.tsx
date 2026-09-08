"use client";
import { type IGamesList } from "@/app/page";
import { useAppUI } from "@/context/AppUIContext";

interface ILandingPage {
  gamesList: IGamesList[];
}

export default function LandingPage({ gamesList }: ILandingPage) {
  const { openAuth } = useAppUI();
  const scrollToSection = () => {
    const section = document.getElementById("server-status");
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="relative min-h-full pb-6">
      <main className="relative z-10 mx-auto max-w-312.5 px-6">
        <section className="mx-auto max-w-200 p-8 text-center">
          <h1 className="mb-6 text-[clamp(2.5rem,5vw,4rem)] leading-[1.15] font-extrabold tracking-[-1.5px] text-text-high">
            Rejoins notre communauté de <br />
            <span className="bg-linear-to-r from-lin-orange to-choy-green-light bg-clip-text text-transparent">
              Joueurs & Serveurs privés
            </span>
          </h1>
          <p className="mx-auto mb-10 max-w-150 text-[1.15rem] leading-[1.7] text-text-medium">
            Suis en direct l&apos;état de nos serveurs de jeux et rejoins la
            communauté pour build ou survivre avec nous !
          </p>
          <div className="flex justify-center gap-4">
            <button
              className="cursor-pointer rounded-lg border-0 bg-text-high px-7 py-3.5 text-[0.95rem] font-semibold text-bg-main transition-all duration-300 ease-smooth"
              onClick={openAuth}
            >
              Inscription
            </button>
            <button
              className="cursor-pointer rounded-lg border-0 bg-text-high px-7 py-3.5 text-[0.95rem] font-semibold text-bg-main transition-all duration-300 ease-smooth"
              onClick={scrollToSection}
            >
              Voir l&apos;état des serveurs
            </button>
          </div>
        </section>
        <section
          id="server-status"
          className="mt-10 grid grid-cols-[repeat(auto-fit,minmax(350px,1fr))] gap-6"
        >
          {/* Box 1 : Les Serveurs (Large) */}
          <div className="col-span-full flex flex-col justify-start rounded-2xl border border-border bg-[color-mix(in_srgb,var(--bg-main)_75%,transparent)] p-8">
            <h2>Nos Serveurs</h2>
            <div className="mt-2.5 grid min-h-20 grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-4">
              {gamesList?.map((game) => (
                <div
                  key={game.gameData.slug}
                  className="flex items-center justify-between rounded-xl border border-border bg-bg-input p-4"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-medium text-text-high">
                      {game.name}
                    </span>
                  </div>
                  <span
                    className={`rounded-md border px-2 py-1 text-xs font-semibold ${
                      game.statusInfo.comingSoon
                        ? "border-border text-text-low"
                        : "border-(--choy-green-glow) text-choy-green"
                    }`}
                  >
                    {game.statusInfo.comingSoon
                      ? "Bientôt disponible"
                      : "Disponible"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Box 2 : Cross-Platform */}
          <div className="relative flex flex-col justify-start rounded-2xl border border-border bg-[color-mix(in_srgb,var(--bg-main)_75%,transparent)] p-8">
            <span className="absolute top-5 right-5 rounded-full border border-border px-2.5 py-1 text-[0.7rem] font-semibold tracking-[0.5px] text-text-low uppercase">
              Bientôt disponible
            </span>
            <h2>Liaison Multi-Plateforme</h2>
            <p className="mb-6 text-text-medium">
              Connecte tes comptes pour synchroniser ta progression et retrouver
              tes amis en un clic. Une fonctionnalité en cours de développement.
            </p>
          </div>

          {/* Box 3 : Communauté / Chat */}
          <div className="relative flex flex-col justify-start rounded-2xl border border-border bg-[color-mix(in_srgb,var(--bg-main)_75%,transparent)] p-8">
            <span className="absolute top-5 right-5 rounded-full border border-border px-2.5 py-1 text-[0.7rem] font-semibold tracking-[0.5px] text-text-low uppercase">
              Bientôt disponible
            </span>
            <h2>Chat & Notes</h2>
            <p className="text-text-medium">
              Un espace de discussion intégré directement lié à tes serveurs,
              pour partager tes retours sur tes parties. Arrive prochainement.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
