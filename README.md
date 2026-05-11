<div align="center">

<br />

# Sofia Vital

**Интерактивна карта за качеството на живот в 24-те района на Столична община**

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Leaflet](https://img.shields.io/badge/Leaflet-1.9-199900?style=flat-square&logo=leaflet&logoColor=white)](https://leafletjs.com/)
[![Gemini](https://img.shields.io/badge/Gemini-Flash-4285F4?style=flat-square&logo=google&logoColor=white)](https://aistudio.google.com/)
[![License](https://img.shields.io/badge/License-MIT-22c55e?style=flat-square)](LICENSE)
[![Deploy](https://img.shields.io/badge/Deploy-Vercel-black?style=flat-square&logo=vercel)](https://vercel.com/)

<br />

> *Кой квартал в София е най-добър за мен?*
> SofiaVital отговаря с данни, не с мнения.

<br />

</div>

---

## Какво е SofiaVital?

SofiaVital превръща данните на [Софияплан](https://sofiaplan.bg) - официалния изследователски орган на Столична община - в персонализирана карта на качеството на живот. Изберете профил (семейство, млад специалист, пенсионер), картата се оцветява моментално. Кликнете на район за детайлен анализ по 10 показателя. Питайте AI асистента на естествен език.

**Работи и на телефон.** Пълна мобилна версия с bottom navigation, drag-to-dismiss sheets и AI чат.

---

## Скрийншоти

| Desktop - карта | Desktop - район | Мобилна версия |
|:---:|:---:|:---:|
| ![Desktop map](docs/screenshot-map.png) | ![District panel](docs/screenshot-district.png) | ![Mobile](docs/screenshot-mobile.png) |

> Добави скрийншоти в `docs/` след deploy. Препоръчителни размери: 1280x800 за desktop, 390x844 за mobile.

---

## Функционалности

### Карта и данни
- **24 района** с реални GeoJSON полигони от Софияплан API
- **10 показателя** - въздух, зеленина, транспорт, образование, тишина, прохлада, детски градини, велосипеди, риск от наводнения, застрояване
- **Цветово оцветяване** в реално време според избрания профил
- **flyTo анимация** - плавно приближаване при избор на район
- **10 слоя данни** - метро, трамваи, веломрежа, паркове, въздух, топлинни острови, училища, детски градини, наводнения, застрояване

### Профили и персонализация
- **3 готови профила** - Семейство, Млад специалист, Пенсионер
- **Custom режим** - 10 слайдера за индивидуално настройване на тегла
- **Класация** - 24-те района наредени по персонализиран score

### AI асистент (Gemini Flash)
- Отговаря на въпроси за районите на естествен български
- Знае всичките 10 показателя и данните за всички 24 района
- 10 безплатни въпроса на ден на IP адрес
- Примери: *"Кой район е най-добър за алергик?"*, *"Сравни Лозенец и Младост за млад специалист"*

### Мобилна версия
- Пълен мобилен UI - не просто responsive, а изцяло преработен за телефон
- Bottom navigation с 4 таба - Карта, Класация, Слоеве, AI
- District bottom sheet с drag-to-dismiss
- Мобилен hero screen
- Поддръжка на safe-area-inset за iPhone notch

---

## Данни

Всички данни са от **[api.sofiaplan.bg](https://api.sofiaplan.bg)** - отвореният API на Софияплан. Заявките минават през Next.js proxy route (`/api/sofiaplan/[...path]`) за избягване на CORS.

| Показател | Dataset | Описание |
|---|---|---|
| Граници на районите | `350` | GeoJSON полигони - основа на картата |
| Паркове и градини | `235` | Зелени площи |
| Метро линии 1 и 2 | `32` | Релсова мрежа |
| Трамвайна мрежа | `254` | Градски транспорт |
| Велосипедна мрежа | `606` | Изградена веломрежа 2021 |
| Въздух - ФПЧ10 | `579` | Концентрация на прах 2018 |
| Топлинни острови | `45` | ГТО интензивност авг. 2019 |
| Риск от наводнения | `446` | Зони с висока вероятност за заливане |
| Училища | `281` | Имоти на образователни обекти |
| Детски градини | `52` | Детски градини и ясли |
| Застрояване | `628` | Разрешения за строеж след 2010 |

---

## Vital Score

Агрегиран показател от 0 до 100, изчислен динамично според профила:

```
Vital Score = sum( стойност_на_показател * тегло_на_профила )
```

| Оценка | Ниво |
|---|---|
| 75 - 100 | Отлично |
| 65 - 74 | Добро |
| 55 - 64 | Средно |
| 45 - 54 | Под средното |
| 0 - 44 | Слабо |

**Тегла по профил:**

| Показател | Семейство | Млад специалист | Пенсионер |
|---|---|---|---|
| Детски градини | 20% | 1% | 1% |
| Зеленина | 18% | 12% | 18% |
| Училища | 18% | 2% | 2% |
| Тишина | 15% | 12% | 25% |
| Въздух | 12% | 15% | 22% |
| Транспорт | 5% | 25% | 5% |
| Велосипеди | 3% | 15% | 3% |
| Прохлада | 4% | 8% | 15% |
| Без наводнения | 2% | 3% | 8% |
| Застрояване | 3% | 7% | 1% |

---

## Технологии

| | |
|---|---|
| **Next.js 15** | App Router, server components, API routes |
| **TypeScript 5** | Strict mode навсякъде |
| **Leaflet 1.9** | Интерактивна карта, flyTo анимации, GeoJSON слоеве |
| **CartoDB Dark** | Тъмна базова карта без API ключ |
| **Anime.js 3** | Hero stagger анимации, animated counters |
| **Gemini Flash** | AI асистент с 10 безплатни въпроса/ден |
| **Sofiaplan API** | 100+ набора реални данни за София |

---

## Инсталация

```bash
# 1. Клонирай
git clone https://github.com/YOUR_USERNAME/sofiavital.git
cd sofiavital

# 2. Инсталирай
npm install

# 3. Конфигурирай (опционално - само за AI асистента)
cp .env.example .env.local
# Попълни GEMINI_API_KEY от https://aistudio.google.com

# 4. Стартирай
npm run dev
```

Отвори [http://localhost:3000](http://localhost:3000).

> Картата работи без `.env` файл. Само AI чатът изисква Gemini API ключ.

---

## Deploy на Vercel

```bash
npx vercel
```

За AI асистента добави environment variable в Vercel dashboard:

```
Settings -> Environment Variables -> Add New
Key:   GEMINI_API_KEY
Value: [твоя ключ от aistudio.google.com]
```

След промяна на env variables е нужен нов deploy (Deployments -> Redeploy).

---

## Структура на проекта

```
sofiavital/
├── app/
│   ├── page.tsx                           # Root - device detection, desktop/mobile router
│   ├── layout.tsx                         # HTML layout + metadata
│   ├── globals.css                        # Design tokens, анимации, Leaflet overrides
│   ├── api/
│   │   ├── sofiaplan/[...path]/route.ts   # Proxy към api.sofiaplan.bg (решава CORS)
│   │   └── chat/route.ts                  # Gemini Flash AI endpoint + rate limiting
│
├── components/
│   ├── MobileLayout.tsx      # Цялото мобилно приложение (hero, tabs, sheets)
│   ├── HeroScreen.tsx        # Desktop hero с Anime.js stagger анимация
│   ├── MapView.tsx           # Leaflet карта + GeoJSON + flyTo
│   ├── DistrictPanel.tsx     # Desktop sidebar с animated score bars
│   ├── TopBar.tsx            # Desktop навигация + profile switcher
│   ├── LayerPanel.tsx        # Desktop слоеве панел
│   ├── RankingPanel.tsx      # Desktop класация
│   ├── CustomWeightsBar.tsx  # Desktop слайдери за тегла
│   ├── ChatWidget.tsx        # Desktop floating AI chat
│   └── Legend.tsx            # Цветова легенда
│
├── lib/
│   └── data.ts               # Типове, данни за 24 района, профили, helpers
│
└── types/
    └── animejs.d.ts          # Ръчни TypeScript типове за animejs
```

---

## Roadmap

- [ ] Реален шум - интеграция на шумови карти от Софияплан dataset #...
- [ ] Имотни цени - dataset #624 (наеми по ГЕ) за price/quality анализ
- [ ] Сравнение - side-by-side на 2-3 района
- [ ] Квартален drill-down - от район към квартал (dataset #297, 700+ квартала)
- [ ] Share - персонализиран линк към резултата с профил и тегла
- [ ] Исторически тренд - промяна на показателите с времето

---

## Принос

Pull requests са добре дошли. За по-големи промени отвори issue първо.

```bash
git checkout -b feature/my-idea
git commit -m "feat: describe your change"
git push origin feature/my-idea
```

---

## Лиценз

[MIT](LICENSE)

---

<div align="center">

Данни: [Софияплан](https://sofiaplan.bg) &nbsp;·&nbsp; Карти: [OpenStreetMap](https://openstreetmap.org) / [CARTO](https://carto.com) &nbsp;·&nbsp; AI: [Google Gemini](https://aistudio.google.com)

**Направен с love за София**

</div>
