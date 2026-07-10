import type { Metadata } from "next";
import { Figtree, Nunito_Sans } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";

const display = Figtree({ subsets: ["latin"], weight: ["500", "600", "700", "800", "900"], variable: "--font-figtree" });
const sans = Nunito_Sans({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800"], variable: "--font-nunito" });

export const metadata: Metadata = {
  title: { default: "Cardio AI Hub", template: "%s · Cardio AI Hub" },
  description:
    "Prompt library, AI tools catalog, ideas board and AI-in-cardiology news for the cardiology product team.",
};

const themeInit = `try{var t=localStorage.getItem("cah-theme");if(t==="light"||t==="dark")document.documentElement.dataset.theme=t}catch(e){}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
      </head>
      <body className="min-h-screen bg-bg font-sans text-ink antialiased">
        <Header />
        <main className="mx-auto w-full max-w-6xl px-6 pb-16 pt-8">{children}</main>
        <footer className="border-t border-line py-6">
          <p className="text-center text-[11px] font-bold uppercase tracking-widest text-faint">
            Cardio AI Hub · Internal tool · Never paste patient data
          </p>
        </footer>
      </body>
    </html>
  );
}
