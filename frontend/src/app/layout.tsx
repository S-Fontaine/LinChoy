import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AuthProvider } from "@/context/AuthContext";
import { AppUIProvider } from "@/context/AppUIContext";
import "../styles/globals.css";
import Footer from "@/components/Footer/Footer";
import Header from "@/components/Header/Header";
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://linchoy.com"),
  title: {
    default:
      "LinChoy — Serveurs privés Minecraft, Valheim, V Rising & Palworld",
    template: "%s | LinChoy",
  },
  description:
    "Suis en direct l'état de nos serveurs de jeux et rejoins la communauté LinChoy pour build ou survivre avec nous !",
  keywords: [
    "serveur minecraft privé",
    "serveur valheim",
    "serveur v rising",
    "serveur palworld",
    "communauté gaming",
    "LinChoy",
  ],
  authors: [{ name: "LinChoy" }],
  creator: "LinChoy",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: "https://linchoy.com",
    siteName: "LinChoy",
    title: "LinChoy — Serveurs privés Minecraft, Valheim, V Rising & Palworld",
    description:
      "Suis en direct l'état de nos serveurs de jeux et rejoins la communauté pour build ou survivre avec nous !",
    images: [
      { url: "/og-image.png", width: 1200, height: 630, alt: "LinChoy" },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "LinChoy — Serveurs privés de jeux",
    description:
      "Suis en direct l'état de nos serveurs et rejoins la communauté.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: "#0f0f10",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body>
        <AuthProvider>
          <AppUIProvider>
            <div className="glowWrapper">
              <div className="glowOrange" />
              <div className="glowGreen" />
            </div>
            <div
              style={{
                minHeight: "100vh",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <Header />
              {children}
              <Footer />
            </div>
          </AppUIProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
