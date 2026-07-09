import type { Metadata } from "next";
import { Bricolage_Grotesque, IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import { IdentityProvider } from "@/lib/identity";

const display = Bricolage_Grotesque({ subsets: ["latin"], variable: "--font-bricolage" });
const sans = IBM_Plex_Sans({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-plex" });
const mono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-plex-mono" });

export const metadata: Metadata = {
  title: { default: "Cardio AI Hub", template: "%s · Cardio AI Hub" },
  description:
    "Prompt library, AI tools catalog, ideas board and AI-in-cardiology news for the cardiology product team.",
};

const themeInit = `try{var t=localStorage.getItem("cah-theme");if(t==="light"||t==="dark")document.documentElement.dataset.theme=t}catch(e){}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${sans.variable} ${mono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
      </head>
      <body className="min-h-screen bg-bg font-sans text-ink antialiased">
        <IdentityProvider>
          <Header />
          <main className="mx-auto w-full max-w-6xl px-4 pb-16 pt-8 sm:px-6">{children}</main>
          <footer className="border-t border-line py-6">
            <p className="text-center font-mono text-[11px] uppercase tracking-[0.14em] text-faint">
              Cardio AI Hub · internal tool · never paste patient data
            </p>
          </footer>
        </IdentityProvider>
      </body>
    </html>
  );
}
