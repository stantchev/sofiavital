// Server Component — SSR, fully indexed by Google
import type { Metadata } from "next";
import { DISTRICTS } from "@/lib/data";
import SofiaHeroWrapper from "@/components/ui/SofiaHeroWrapper";
import LandingSections from "@/components/ui/LandingSections";

export const metadata: Metadata = {
  title: "SofiaVital — Къде е най-добре да живея в София?",
  description:
    "Открий кой район или квартал в София е най-добър за теб. Интерактивна карта с реални данни за въздух, зеленина, транспорт, училища, детски градини, велосипеди и наводнения от Sofiaplan.",
};

const SITE_URL = "https://sofiavital.bg";

const FAQ_ITEMS = [
  {
    q: "Какво е SofiaVital?",
    a: "SofiaVital е безплатна интерактивна карта, която показва качеството на живот в 24-те официални района на Столична община. Данните идват от Sofiaplan — официалния изследователски орган на общината.",
  },
  {
    q: "Кой район в Sofia има най-чист въздух?",
    a: "Панчарево (95/100), Банкя (92/100) и Изгрев (82/100) са с най-чист въздух. Кремиковци има най-замърсен (40/100) заради индустриалната зона.",
  },
  {
    q: "Кой квартал е най-добър за семейство с деца?",
    a: "Витоша, Оборище и Лозенец — добри оценки за детски градини, училища, зеленина и тишина.",
  },
  {
    q: "Кои райони имат риск от наводнения?",
    a: "Нови Искър (35/100), Искър (38/100) и Кремиковци (42/100) — заради близостта до река Искър.",
  },
  {
    q: "Как се изчислява Vital Score?",
    a: "Среднопретеглена оценка от 10 показателя. Теглата се определят от профила (Семейство, Млад специалист, Пенсионер) или се настройват ручно с 10 слайдера.",
  },
  {
    q: "Откъде идват данните?",
    a: "Всички данни са от Sofiaplan API (api.sofiaplan.bg) — официалния отворен API на ОП Sofiaplan, Столична община.",
  },
  {
    q: "Безплатно ли е?",
    a: "Да, напълно безплатно. AI асистентът е ограничен до 10 въпроса на ден на IP.",
  },
  {
    q: "Работи ли на телефон?",
    a: "Да. Пълна мобилна версия с bottom navigation, bottom sheet и AI чат.",
  },
];

const schemas = [
  {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "SofiaVital",
    url: SITE_URL,
    description: "Интерактивна карта за качеството на живот в 24-те района на Столична община по 10 показателя.",
    applicationCategory: "LifestyleApplication",
    operatingSystem: "Web",
    offers: { "@type": "Offer", price: "0", priceCurrency: "BGN" },
    inLanguage: "bg",
    author: { "@type": "Organization", name: "SofiaVital", url: SITE_URL },
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_ITEMS.map(({ q, a }) => ({
      "@type": "Question",
      name: q,
      acceptedAnswer: { "@type": "Answer", text: a },
    })),
  },
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Начало", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Карта", item: `${SITE_URL}/map` },
    ],
  },
];

const TOP_DISTRICTS = [...DISTRICTS].sort((a, b) => b.score - a.score).slice(0, 5);

export default function HomePage() {
  return (
    <>
      {schemas.map((s, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(s) }} />
      ))}

      <div style={{ background: "#000", color: "#e8f0fe", minHeight: "100vh", overflowX: "hidden" }}>
        {/* ── Hero (client, canvas + GSAP) ───────────────────────────────── */}
        <SofiaHeroWrapper />

        {/* ── All interactive sections (client) ──────────────────────────── */}
        <LandingSections faqItems={FAQ_ITEMS} topDistricts={TOP_DISTRICTS} />

        {/* ── SSO SEO content — indexed by Google ────────────────────────── */}
        <div aria-hidden="true" style={{ position: "absolute", left: "-9999px", top: 0, width: 1, overflow: "hidden" }}>
          <h1>SofiaVital — Интерактивна карта за качеството на живот в Sofia</h1>
          <h2>Кой район в Sofia е най-добър за теб?</h2>
          <section>
            <h2>Всички 24 района на Sofia</h2>
            <ul>
              {DISTRICTS.map((d) => (
                <li key={d.id}>
                  <h3>Район {d.name} — Vital Score {d.score}/100</h3>
                  <p>Население: {d.pop.toLocaleString("bg-BG")} жители. Въздух: {d.air}/100. Зеленина: {d.green}/100. Транспорт: {d.transit}/100. Училища: {d.schools}/100. Тишина: {d.noise}/100. Детски градини: {d.kindergartens}/100. Велосипеди: {d.cycling}/100. Наводнения: {d.flood}/100.</p>
                </li>
              ))}
            </ul>
          </section>
          <section>
            <h2>Често задавани въпроси</h2>
            <dl>
              {FAQ_ITEMS.map(({ q, a }) => (
                <div key={q}><dt><strong>{q}</strong></dt><dd>{a}</dd></div>
              ))}
            </dl>
          </section>
        </div>

      </div>
    </>
  );
}
