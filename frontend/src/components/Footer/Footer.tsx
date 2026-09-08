import Link from "next/link";

const linkClass = "text-[0.85rem] text-text-medium no-underline hover:text-choy-green";

export default function Footer() {
  return (
    <footer className="relative mt-auto border-t border-border bg-[color-mix(in_srgb,var(--bg-main)_75%,transparent)] px-5 py-6 shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
      <div className="mx-auto flex max-w-275 flex-wrap items-center justify-between gap-4 max-[500px]:flex-col max-[500px]:text-center">
        <p className="text-[0.85rem] text-text-low">
          &copy; {new Date().getFullYear()} LinChoy. Tous droits réservés.
        </p>
        <nav className="flex gap-6 max-[500px]:gap-4">
          <Link href="/mentions-legales" className={linkClass}>
            Mentions légales
          </Link>
          <Link href="/confidentialite" className={linkClass}>
            Politique de confidentialité
          </Link>
          <a href="mailto:contact@linchoy.com" className={linkClass}>
            Contact
          </a>
        </nav>
      </div>
    </footer>
  );
}
