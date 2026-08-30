import type { Metadata } from "next";
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
  title: "LinChoy",
  description: "Projet LinChoy",
  icons: {
    icon: "/favicon.ico",
  },
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
