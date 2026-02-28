import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SofiaVital — Къде е най-добре да живея в София?",
  description:
    "Интерактивна карта на качеството на живот в 24-те района на София. Данни за въздух, зеленина, шум, транспорт, образование и застрояване.",
  keywords: ["София", "квартали", "качество на живот", "карта", "данни"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="bg">
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body>{children}</body>
    </html>
  );
}
