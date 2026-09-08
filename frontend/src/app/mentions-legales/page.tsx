import {
  pageClass,
  titleClass,
  updatedClass,
  sectionClass,
  sectionTitleClass,
  highlightClass,
} from "@/components/Legal/legal.styles";

export const metadata = {
  title: "Mentions légales — LinChoy",
};

export default function MentionsLegalesPage() {
  return (
    <div className={pageClass}>
      <h1 className={titleClass}>Mentions légales</h1>
      <p className={updatedClass}>Dernière mise à jour : 29/08/2026</p>

      <section className={sectionClass}>
        <h2 className={sectionTitleClass}>Éditeur du site</h2>
        <p>
          Le site LinChoy (accessible à l&apos;adresse{" "}
          <span className={highlightClass}>linchoy.com</span>) est édité, à
          titre non professionnel et personnel, par :
        </p>
        <p>
          <span className={highlightClass}>Sebastien Fontaine</span>
          <br />
          Contact : <a href="mailto:contact@linchoy.com">contact@linchoy.com</a>
        </p>
      </section>

      <section className={sectionClass}>
        <h2 className={sectionTitleClass}>Hébergement</h2>
        <p>Le site ainsi que les serveurs de jeu associés sont hébergés par :</p>
        <p>
          <span className={highlightClass}>OVH SAS</span>
          <br />
          2 rue Kellermann, 59100 Roubaix, France
          <br />
          <a href="https://www.ovhcloud.com" target="_blank" rel="noopener noreferrer">
            www.ovhcloud.com
          </a>
        </p>
      </section>

      <section className={sectionClass}>
        <h2 className={sectionTitleClass}>Nom de domaine</h2>
        <p>
          Le nom de domaine <span className={highlightClass}>linchoy.com</span>{" "}
          est enregistré auprès d&apos;OVH. « LinChoy » n&apos;est pas une marque déposée.
        </p>
      </section>

      <section className={sectionClass}>
        <h2 className={sectionTitleClass}>Jeux vidéo et serveurs</h2>
        <p>
          LinChoy propose un accès à des serveurs privés hébergeant des jeux
          vidéo tiers (Palworld, Minecraft, V Rising, Valheim, et d&apos;autres
          à venir). L&apos;éditeur de LinChoy n&apos;est ni l&apos;éditeur, ni
          le développeur, ni affilié de quelque manière que ce soit aux
          sociétés éditrices de ces jeux. Tous les noms, marques, logos et
          contenus associés à ces jeux restent la propriété exclusive de leurs
          détenteurs respectifs.
        </p>
        <p>
          L&apos;éditeur du site administre uniquement l&apos;infrastructure
          technique des serveurs (installation, maintenance, disponibilité) et
          peut être amené à exercer un rôle de modération de la communauté sur
          ces serveurs et sur le site.
        </p>
      </section>

      <section className={sectionClass}>
        <h2 className={sectionTitleClass}>Règles de la communauté</h2>
        <p>
          L&apos;utilisation de LinChoy et de ses serveurs de jeu implique le
          respect des autres joueurs, quel que soit leur sexe, leur
          orientation sexuelle, leurs opinions politiques, leurs convictions
          religieuses ou toute autre caractéristique personnelle. Tout
          comportement irrespectueux, discriminatoire ou harcelant pourra
          entraîner un avertissement, une exclusion temporaire ou définitive
          des serveurs et/ou du site, à la discrétion de l&apos;administrateur.
        </p>
      </section>

      <section className={sectionClass}>
        <h2 className={sectionTitleClass}>Propriété intellectuelle</h2>
        <p>
          Sauf mention contraire, l&apos;ensemble des éléments propres au site
          LinChoy (charte graphique, textes, logo, code source) est la
          propriété de l&apos;éditeur. Toute reproduction non autorisée est
          interdite.
        </p>
      </section>

      <section className={sectionClass}>
        <h2 className={sectionTitleClass}>Responsabilité</h2>
        <p>
          LinChoy est un projet personnel fourni « en l&apos;état ». L&apos;éditeur
          s&apos;efforce d&apos;assurer la disponibilité et le bon
          fonctionnement du site et des serveurs, sans garantie de continuité
          de service. Des interruptions peuvent survenir pour des raisons
          techniques ou de maintenance.
        </p>
      </section>
    </div>
  );
}