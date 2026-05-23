import type { Metadata, Viewport } from "next";
import "./globals.css";

// ── Constants ─────────────────────────────────────────────────────────────────
const SITE_URL  = "https://sofiavital.bg";
const SITE_NAME = "SofiaVital";
const TITLE     = "SofiaVital • Къде е най-добре да живея в София?";
const DESC      = "Интерактивна карта на качеството на живот в 24-те района на София. Сравни въздух, зеленина, транспорт, училища, детски градини, велосипеди и риск от наводнения по твоя профил.";

// ── Viewport ──────────────────────────────────────────────────────────────────
export const viewport: Viewport = {
  width:               "device-width",
  initialScale:        1,
  maximumScale:        5,
  themeColor:          "#03070f",
  colorScheme:         "dark",
};

// ── Metadata ──────────────────────────────────────────────────────────────────
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),

  title: {
    default:  TITLE,
    template: `%s • ${SITE_NAME}`,
  },
  description: DESC,

  keywords: [
    "Sofia", "София", "квартали", "район", "качество на живот",
    "карта", "интерактивна карта", "въздух", "зеленина", "транспорт",
    "училища", "детски градини", "велосипеди", "наводнения",
    "Витоша", "Лозенец", "Младост", "Оборище", "Триадица",
    "Красно село", "Студентски", "Люлин", "Надежда",
    "sofiaplan", "открити данни", "sofia quality of life",
    "where to live sofia", "best neighborhood sofia",
    "sofia districts map", "sofia vital score",
  ],

  authors:   [{ name: SITE_NAME, url: SITE_URL }],
  creator:   SITE_NAME,
  publisher: SITE_NAME,

  alternates: {
    canonical: SITE_URL,
    languages: {
      "bg":    SITE_URL,
      "en-US": `${SITE_URL}/en`,
    },
  },

  robots: {
    index:                    true,
    follow:                   true,
    googleBot: {
      index:                  true,
      follow:                 true,
      "max-video-preview":    -1,
      "max-image-preview":    "large",
      "max-snippet":          -1,
    },
  },

  // ── Open Graph ──────────────────────────────────────────────────────────────
  openGraph: {
    type:        "website",
    locale:      "bg_BG",
    url:         SITE_URL,
    siteName:    SITE_NAME,
    title:       TITLE,
    description: DESC,
    images: [
      {
        url:    `${SITE_URL}/og-image.png`,
        width:  1200,
        height: 630,
        alt:    "SofiaVital • Интерактивна карта на качеството на живот в София",
      },
    ],
  },

  // ── Twitter / X ─────────────────────────────────────────────────────────────
  twitter: {
    card:        "summary_large_image",
    title:       TITLE,
    description: DESC,
    images:      [`${SITE_URL}/og-image.png`],
    creator:     "@sofiavital",
  },

  // ── Verification (add your codes when ready) ─────────────────────────────────
  verification: {
    google: "YOUR_GOOGLE_VERIFICATION_CODE",
  },

  // ── App / PWA ────────────────────────────────────────────────────────────────
  applicationName: SITE_NAME,
  category:        "map, urban data, real estate",
  manifest:        "/manifest.json",

  // ── Icons ────────────────────────────────────────────────────────────────────
  icons: {
    icon:        [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon.ico" },
    ],
    apple:       [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
    other:       [{ rel: "mask-icon", url: "/safari-pinned-tab.svg", color: "#34d399" }],
  },
};

// ── Layout ────────────────────────────────────────────────────────────────────
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="bg" dir="ltr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://api.sofiaplan.bg" />
        <link rel="dns-prefetch" href="https://a.basemaps.cartocdn.com" />
      </head>
      <body>{children}</body>
    </html>
  );
}
