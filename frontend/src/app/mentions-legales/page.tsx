import styles from "@/components/Legal/legal.module.css";

export const metadata = {
  title: "Mentions légales — LinChoy",
};

export default function MentionsLegalesPage() {
  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Mentions légales</h1>
      <p className={styles.updated}>Dernière mise à jour : 29/08/2026</p>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Éditeur du site</h2>
        <p>
          Le site LinChoy (accessible à l&apos;adresse{" "}
          <span className={styles.highlight}>linchoy.com</span>) est édité, à
          titre non professionnel et personnel, par :
        </p>
        <p>
          <span className={styles.highlight}>Sebastien Fontaine</span>
          <br />
          Contact : <a href="mailto:contact@linchoy.com">contact@linchoy.com</a>
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Hébergement</h2>
        <p>Le site ainsi que les serveurs de jeu associés sont hébergés par :</p>
        <p>
          <span className={styles.highlight}>OVH SAS</span>
          <br />
          2 rue Kellermann, 59100 Roubaix, France
          <br />
          <a href="https://www.ovhcloud.com" target="_blank" rel="noopener noreferrer">
            www.ovhcloud.com
          </a>
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Nom de domaine</h2>
        <p>
          Le nom de domaine <span className={styles.highlight}>linchoy.com</span>{" "}
          est enregistré auprès d&apos;OVH. « LinChoy » n&apos;est pas une marque déposée.
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Jeux vidéo et serveurs</h2>
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

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Règles de la communauté</h2>
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

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Propriété intellectuelle</h2>
        <p>
          Sauf mention contraire, l&apos;ensemble des éléments propres au site
          LinChoy (charte graphique, textes, logo, code source) est la
          propriété de l&apos;éditeur. Toute reproduction non autorisée est
          interdite.
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Responsabilité</h2>
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