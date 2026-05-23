import type { Metadata } from "next";
import AppClientWrapper from "@/components/AppClientWrapper";

export const metadata: Metadata = {
  title: "Карта — SofiaVital",
  description:
    "Интерактивна карта на качеството на живот в 24-те района на София. Избери профил, разгледай кварталите, сравни районите по 10 показателя.",
  robots: { index: true, follow: true },
};

export default function MapPage() {
  return <AppClientWrapper />;
}
