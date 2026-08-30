import styles from "@/components/Legal/legal.module.css";

export const metadata = {
  title: "Politique de confidentialité — LinChoy",
};

export default function ConfidentialitePage() {
  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Politique de confidentialité</h1>
      <p className={styles.updated}>Dernière mise à jour : 29/08/2026</p>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Responsable du traitement</h2>
        <p>
          Le responsable du traitement des données collectées sur LinChoy est{" "}
          <span className={styles.highlight}>Sebastien Fontaine</span>,
          joignable à l&apos;adresse{" "}
          <a href="mailto:contact@linchoy.com">contact@linchoy.com</a>.
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Données collectées</h2>
        <p>Lors de la création d&apos;un compte, LinChoy collecte uniquement :</p>
        <ul>
          <li>Une adresse email</li>
          <li>Un nom d&apos;utilisateur (pseudonyme)</li>
          <li>Un mot de passe, stocké sous forme hachée (l&apos;éditeur n&apos;y a jamais accès en clair)</li>
        </ul>
        <p>
          Des cookies strictement nécessaires au fonctionnement du site
          (maintien de la connexion) sont également déposés — voir la section
          « Cookies » ci-dessous.
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Finalité et base légale</h2>
        <p>
          Ces données sont collectées dans le seul but de permettre la
          création d&apos;un compte utilisateur et l&apos;accès aux
          fonctionnalités de la plateforme (suivi des serveurs de jeu,
          préférences personnelles). Le traitement repose sur
          l&apos;exécution du service demandé par l&apos;utilisateur au
          moment de son inscription.
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Destinataires des données</h2>
        <p>
          Les données ne sont ni vendues, ni cédées, ni partagées avec des
          tiers. Elles sont uniquement accessibles à l&apos;éditeur du site
          dans le cadre strict de l&apos;administration de la plateforme.
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Hébergement des données</h2>
        <p>
          Les données sont hébergées chez OVH SAS (France). Aucune donnée
          n&apos;est transférée en dehors de l&apos;Union européenne.
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Durée de conservation</h2>
        <p>
          Les données sont conservées tant que le compte utilisateur existe.
          En cas de suppression du compte, l&apos;ensemble des données
          associées (email, pseudonyme, mot de passe, préférences) est
          supprimé définitivement et immédiatement de la base de données.
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Cookies</h2>
        <p>
          LinChoy utilise uniquement des cookies strictement nécessaires au
          fonctionnement du service (maintien de la session de connexion via
          des jetons d&apos;authentification sécurisés). Ces cookies ne
          nécessitent pas de consentement préalable au titre de la
          réglementation applicable, puisqu&apos;ils sont indispensables au
          fonctionnement du site demandé par l&apos;utilisateur.
        </p>
        <p>
          À la date de rédaction de cette page, LinChoy n&apos;utilise aucun
          cookie tiers, aucun outil d&apos;analyse d&apos;audience (analytics)
          et aucun cookie publicitaire.
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Vos droits</h2>
        <p>
          Conformément au Règlement Général sur la Protection des Données
          (RGPD), vous disposez d&apos;un droit d&apos;accès, de
          rectification, d&apos;effacement, de limitation et
          d&apos;opposition concernant vos données personnelles.
        </p>
        <p>
          Vous pouvez à tout moment supprimer vous-même votre compte et
          l&apos;ensemble des données associées depuis les paramètres de
          votre compte. Pour toute autre demande, vous pouvez nous contacter à{" "}
          <a href="mailto:contact@linchoy.com">contact@linchoy.com</a>.
        </p>
        <p>
          Vous disposez également du droit d&apos;introduire une réclamation
          auprès de la Commission Nationale de l&apos;Informatique et des
          Libertés (
          <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer">
            www.cnil.fr
          </a>
          ).
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Sécurité</h2>
        <p>
          Les mots de passe sont hachés avant stockage (aucun mot de passe
          n&apos;est jamais conservé ou consultable en clair). Les échanges
          entre votre navigateur et le serveur sont chiffrés (HTTPS), et les
          jetons de connexion sont stockés dans des cookies sécurisés,
          inaccessibles en JavaScript.
        </p>
      </section>
    </div>
  );
}