<div align="center">

<br/>

```
 ███████╗ ██████╗ ███████╗██╗ █████╗     ██╗   ██╗██╗████████╗ █████╗ ██╗
 ██╔════╝██╔═══██╗██╔════╝██║██╔══██╗    ██║   ██║██║╚══██╔══╝██╔══██╗██║
 ███████╗██║   ██║█████╗  ██║███████║    ██║   ██║██║   ██║   ███████║██║
 ╚════██║██║   ██║██╔══╝  ██║██╔══██║    ╚██╗ ██╔╝██║   ██║   ██╔══██║██║
 ███████║╚██████╔╝██║     ██║██║  ██║     ╚████╔╝ ██║   ██║   ██║  ██║███████╗
 ╚══════╝ ╚═════╝ ╚═╝     ╚═╝╚═╝  ╚═╝     ╚═══╝  ╚═╝   ╚═╝   ╚═╝  ╚═╝╚══════╝
```

**Интерактивна карта за качеството на живот в 24-те района на Столична община**

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Leaflet](https://img.shields.io/badge/Leaflet-1.9-199900?style=flat-square&logo=leaflet&logoColor=white)](https://leafletjs.com/)
[![Gemini](https://img.shields.io/badge/Gemini-Flash-4285F4?style=flat-square&logo=google&logoColor=white)](https://aistudio.google.com/)
[![License](https://img.shields.io/badge/License-MIT-22c55e?style=flat-square)](LICENSE)
[![Deploy](https://img.shields.io/badge/Deploy-Vercel-black?style=flat-square&logo=vercel)](https://vercel.com/)

<br/>

> *Кой квартал в Sofia е най-добър за мен?*
> SofiaVital отговаря с данни, не с мнения.

<br/>

</div>

---

## Маршрути

| Route | Тип | Описание |
|---|---|---|
| `/` | `○ Static SSR` | Landing page — маркетинг, SEO, FAQ, Schema.org |
| `/map` | `○ Static SSR` | Интерактивна карта (client-side Leaflet) |
| `/blog` | `○ Static SSR` | Блог листинг с всички публикации |
| `/blog/[slug]` | `● SSG` | Индивидуален блог пост (MDX) |
| `/api/sofiaplan/[...path]` | `ƒ Dynamic` | CORS proxy към api.sofiaplan.bg |
| `/api/chat` | `ƒ Dynamic` | Gemini Flash AI + rate limiting |
| `/sitemap.xml` | `○ Auto` | Автоматично генериран с всички routes |

---

## Какво е SofiaVital?

SofiaVital превръща данните на [Sofiaplan](https://sofiaplan.bg) в персонализирана карта на качеството на живот. Изберете профил — картата се оцветява. Кликнете на район — получавате кварталнo ниво с реален spatial score и вградена класация. Питайте AI асистента на естествен български.

**Архитектура:** SSR Server Components за SEO + client-side Leaflet за интерактивността. Чисто разделение — `/` и `/blog` са изцяло SSR, `/map` е client-side.

---

## Функционалности

### Карта (`/map`)

| | |
|---|---|
| **24 района** | Реални GeoJSON граници от Sofiaplan API |
| **700+ квартала** | Drill-down при клик на район |
| **Spatial scoring** | Score за всеки квартал от 5 реални datasets |
| **10 показателя** | Въздух, зеленина, транспорт, образование и още |
| **flyTo анимация** | Плавно приближаване при избор |
| **Point-in-polygon** | Ray-casting за точна квартална граница |
| **10 слоя данни** | Toggle с живо зареждане от API |
| **AI асистент** | Gemini Flash на български, 10 въпроса/ден |
| **Кварталска класация** | Вградена в DistrictPanel — таб "Квартали" |

### Профили и персонализация

| Профил | Приоритет |
|---|---|
| 👨‍👩‍👧 Семейство | Детски градини 20% · Зеленина 18% · Училища 18% |
| 💼 Млад специалист | Транспорт 25% · Велосипеди 15% · Въздух 15% |
| 🌿 Пенсионер | Тишина 25% · Въздух 22% · Зеленина 18% |
| ⚙️ По избор | 10 слайдера за пълен контрол |

### SEO архитектура

```
GET /          → Server Component (SSR)
               → Schema.org: WebApplication + Dataset + FAQPage + BreadcrumbList
               → Open Graph + Twitter Cards
               → FAQ секция с 8 въпроса (индексирани)
               → Всички 24 района с данни (aria-hidden, за ботове)

GET /blog      → Server Component (SSR)
               → Schema.org: Blog + BlogPosting за всеки пост
               → Client card components (BlogPostCard) за hover ефекти

GET /blog/[slug] → SSG (generateStaticParams)
               → Schema.org: BlogPosting с datePublished, author, keywords
               → MDX рендиране с custom стилизирани компоненти
               → Canonical URL + Open Graph per-post
```

### Блог (`/blog`, `/blog/[slug]`)

- MDX файлове в `content/blog/*.md`
- Frontmatter: `title`, `description`, `date`, `tags`, `readingTime`
- SSG — всеки пост е pre-rendered при build
- Custom MDX компоненти: `h1-h3`, `p`, `a`, `ul/ol/li`, `blockquote`, `code`, `pre`, `table`
- Schema.org `BlogPosting` за всеки пост
- Напълно responsive — mobile-first дизайн

### Мобилна версия

- Bottom navigation с 4 таба и indicator line
- MapView **винаги mounted** — слоевете не изчезват при смяна на таб
- District bottom sheet: drag-to-dismiss, expand/collapse, 2 таба
- Hero screen с анимирани тагове и stats
- `safe-area-inset-bottom` за iPhone notch

---

## Данни и Spatial Scoring

```
lib/spatialScore.ts — scoring engine за кварталнo ниво

score(kvartal) = weighted_average(
  green_score   ← park_area / kvartal_area (+ proximity decay 600m)
  transit_score ← distance_to_metro×0.6 + distance_to_tram×0.4
  air_score     ← avg(PM10 grid cells inside kvartal) [inverse]
  school_score  ← count(schools within 800m)
  build_score   ← density(permits/km²) [inverse]
)
```

**Datasets от Sofiaplan:**

| Dataset | ID | Използва се за |
|---|---|---|
| Граници на районите | `350` | Основа на картата |
| Квартали | `297` | Drill-down ниво |
| Паркове | `235` | Зеленина score |
| Метро | `32` | Транспорт score |
| Трамваи | `254` | Транспорт score |
| Велосипеди | `606` | Показател + слой |
| Въздух PM10 | `579` | Въздух score (spatial avg) |
| Топлинни острови | `45` | Прохлада показател |
| Наводнения | `446` | Flood показател |
| Училища | `281` | Образование score |
| Детски градини | `52` | Показател |
| Застрояване | `628` | Застрояване score |

Datasets се **кешират client-side** след първото зареждане. Смяна на профил рескорва без нов fetch.

---

## Технологии

```
Next.js 15 App Router ─── SSR + SSG + API routes + sitemap
TypeScript 5          ─── Strict mode навсякъде
Leaflet 1.9           ─── Карта, flyTo, GeoJSON, ray-casting PIP
GSAP 3 + ScrollTrigger ── Hero canvas анимации
Anime.js 3            ─── Score counter анимации
react-icons/tb        ─── Иконки навсякъде
Gemini Flash          ─── AI асистент (10 въпроса/ден безплатно)
next-mdx-remote       ─── MDX рендиране за блог постове
gray-matter           ─── Frontmatter parsing
CartoDB Dark          ─── Тъмна базова карта без API ключ
Greengoth font        ─── Заглавия, лога
```

---

## Инсталация

```bash
# 1. Clone
git clone https://github.com/YOUR_USERNAME/sofiavital.git
cd sofiavital

# 2. Install
npm install

# 3. Configure (optional — AI chat only)
cp .env.example .env.local
# Add: GEMINI_API_KEY=your_key_from_aistudio.google.com

# 4. Run
npm run dev
```

Отвори [http://localhost:3000](http://localhost:3000)

> **Без `.env`** — картата и блогът работят изцяло без API ключ. Само AI чатът изисква Gemini key.

---

## Deploy на Vercel

```bash
npx vercel
```

**Environment Variables:**
```
GEMINI_API_KEY = [от aistudio.google.com — безплатно]
```

**Стъпки след deploy:**
1. Добави `GEMINI_API_KEY` → Vercel Dashboard → Settings → Env Vars → **Redeploy**
2. Google Search Console → Add property → верифицирай
3. Замени `YOUR_GOOGLE_VERIFICATION_CODE` в `app/layout.tsx`
4. Добави `og-image.png` (1200×630) в `public/`
5. Submit sitemap: `https://sofiavital.bg/sitemap.xml`

---

## Структура

```
sofiavital/
│
├── app/
│   ├── page.tsx                         # / — SSR landing page
│   ├── layout.tsx                       # Root layout, metadata, OG
│   ├── globals.css                      # Design tokens, Greengoth font
│   ├── sitemap.ts                       # Auto sitemap (/, /map, /blog, posts)
│   ├── map/page.tsx                     # /map — зарежда AppClientWrapper
│   ├── blog/
│   │   ├── page.tsx                     # /blog — SSR listing
│   │   └── [slug]/page.tsx              # /blog/[slug] — SSG MDX post
│   └── api/
│       ├── sofiaplan/[...path]/route.ts # CORS proxy + 1h cache
│       └── chat/route.ts               # Gemini Flash + rate limiting
│
├── content/
│   └── blog/
│       ├── top-raioni-sofia-2024.md
│       ├── kvartali-sofia-spatialen-analiz.md
│       └── vazduh-sofia-rajoni.md
│
├── components/
│   ├── AppClient.tsx            # Интерактивно приложение ("use client")
│   ├── AppClientWrapper.tsx     # Dynamic import wrapper
│   ├── MobileLayout.tsx         # Мобилно приложение
│   ├── MapView.tsx              # Leaflet + drill-down + spatial
│   ├── DistrictPanel.tsx        # Sidebar с показатели + кварталска класация
│   ├── TopBar.tsx               # Навигация с профил dropdown
│   ├── RankingPanel.tsx         # Класация с mini bars
│   ├── LayerPanel.tsx           # Слоеве панел
│   ├── CustomWeightsBar.tsx     # Слайдери за тегла
│   ├── ChatWidget.tsx           # Floating AI chat (desktop)
│   ├── Legend.tsx               # Цветова легенда
│   └── ui/
│       ├── SofiaHero.tsx        # Canvas hero с GSAP + ASCII орб
│       ├── SofiaHeroWrapper.tsx # Dynamic import wrapper за hero
│       ├── LandingSections.tsx  # Карусели, FAQ, features, footer
│       └── BlogPostCard.tsx     # Client card с hover ефекти
│
├── lib/
│   ├── data.ts                  # 24 района, профили, типове, helpers
│   ├── spatialScore.ts          # Spatial scoring engine
│   ├── blog.ts                  # MDX reader, frontmatter parser
│   └── dateUtils.ts             # Client-safe date formatting
│
├── public/
│   ├── Greengoth_Expanded.ttf   # Custom шрифт
│   ├── robots.txt               # Allow: /
│   ├── manifest.json            # PWA manifest
│   └── og-image.png             # [добави сам, 1200×630]
│
└── types/
    └── animejs.d.ts             # TypeScript типове за animejs
```

---

## Добавяне на блог пост

Създай файл в `content/blog/my-post.md`:

```markdown
---
title: "Заглавие на публикацията"
description: "Кратко описание за SEO и preview."
date: "2025-03-01"
author: "SofiaVital"
tags: ["sofia", "данни", "райони"]
readingTime: 4
---

Съдържание тук...

## Заглавие 2

Параграф с **bold** и *italic* текст.
```

Постът автоматично се появява в `/blog` и получава своя URL `/blog/my-post`.

---

## Roadmap

- [ ] Класация на квартали в RankingPanel при drill-down
- [ ] Имотни цени — Sofiaplan dataset `#624`
- [ ] Share — персонализиран линк с профил и тегла
- [ ] Сравнение side-by-side на 2-3 района
- [ ] Исторически тренд на показателите
- [ ] i18n — English version
- [ ] Dark/light mode toggle

---

## Принос

Pull requests са добре дошли.

```bash
git checkout -b feature/my-feature
git commit -m "feat: describe change"
git push origin feature/my-feature
# → Open Pull Request
```

---

## Лиценз

[MIT](LICENSE) © 2025 SofiaVital

---

<div align="center">

Данни: [Sofiaplan](https://sofiaplan.bg) &nbsp;·&nbsp;
Карти: [OpenStreetMap](https://openstreetmap.org) / [CARTO](https://carto.com) &nbsp;·&nbsp;
AI: [Google Gemini](https://aistudio.google.com)

<br/>

**Направен с ♥ за Sofia**

</div>
