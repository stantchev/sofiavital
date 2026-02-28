<div align="center">

# 🟢 SofiaVital

### Къде е най-добре да живея в София?

**Интерактивна карта на качеството на живот в 24-те района на Столична община**

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Leaflet](https://img.shields.io/badge/Leaflet-1.9-199900?style=flat-square&logo=leaflet&logoColor=white)](https://leafletjs.com/)
[![License](https://img.shields.io/badge/License-MIT-22c55e?style=flat-square)](LICENSE)

</div>

---

## Какво е SofiaVital?

SofiaVital превръща стотици набора от градски данни в един прост въпрос: **"Кой квартал в София е най-добър за мен?"**

Картата зарежда реални GeoJSON граници и слоеве данни директно от [Софияплан](https://sofiaplan.bg) — официалния изследователски орган на Столична община — и ги комбинира в персонализиран **Vital Score**, различен за всеки профил на потребителя.

Изберете профил → Картата се оцветява моментално → Кликнете на район → Картата плавно приближава и показва детайлен анализ.

---

## Функционалности

| | |
|---|---|
| 🗺 **Интерактивна карта** | OpenStreetMap (CartoDB Dark) + реални GeoJSON полигони на 24-те района |
| 🎨 **Персонализирано оцветяване** | Vital Score се изчислява в реално време спрямо избрания профил |
| 👤 **Профили** | Семейство, Млад специалист, Пенсионер или напълно персонализирани тегла |
| 📊 **7 слоя данни** | Въздух, зеленина, метро, трамваи, топлинни острови, училища, застрояване |
| 🔍 **Zoom & Fly** | Плавно приближаване към избрания район от картата или от класацията |
| 🏆 **Класация** | 24-те района наредени по Vital Score за текущия профил |
| ⚙️ **Custom тегла** | Слайдери за всеки показател с реално-временно обновяване |
| 🌐 **Без API ключ** | Работи само с безплатни OSM тайлове — fork & run |

---

## Данни

Всички данни са от **[api.sofiaplan.bg](https://api.sofiaplan.bg)** — отвореният API на ОП „Софияплан". Заявките минават през вграден Next.js proxy (`/api/sofiaplan/[...path]`), за да избегнат CORS ограниченията.

| Слой | Dataset ID | Описание |
|---|---|---|
| Граници на районите | `350` | GeoJSON полигони — основа на картата |
| Паркове и градини | `235` | Зелени площи |
| Метро линии 1 и 2 | `32` | Релсова мрежа |
| Трамвайна мрежа | `254` | Градски транспорт |
| Въздух — ФПЧ10 | `579` | Концентрация на прах 2018 г. |
| Топлинни острови | `45` | ГТО интензивност (август 2019) |
| Училища | `281` | Имоти на образователни обекти |
| Застрояване | `628` | Разрешения за строеж след 2010 г. |

---

## Vital Score

Агрегиран показател от 0 до 100, изчислен динамично:

```
Vital Score = Σ ( стойност_на_показател × тегло_на_профила )
```

| Оценка | Описание |
|---|---|
| 75–100 | 🟢 Отлично |
| 65–74 | 🟩 Добро |
| 55–64 | 🟡 Средно |
| 45–54 | 🟠 Под средното |
| 0–44 | 🔴 Слабо |

**Тегла по профил:**

| Показател | 👨‍👩‍👧 Семейство | 💼 Млад специалист | 🌿 Пенсионер |
|---|---|---|---|
| Зеленина | 25% | 15% | 22% |
| Образование | 28% | 5% | 3% |
| Тишина | 20% | 15% | 28% |
| Въздух | 15% | 15% | 25% |
| Транспорт | 5% | 30% | 5% |
| Прохлада | 4% | 10% | 15% |
| Застрояване | 3% | 10% | 2% |

---

## Технологии

| | |
|---|---|
| **Next.js 15** | React framework с App Router |
| **TypeScript 5** | Type safety навсякъде |
| **Leaflet 1.9** | Интерактивна карта + `flyTo` анимации |
| **CartoDB Dark** | Тъмна базова карта без API ключ |
| **Anime.js 3** | Hero анимации, animated counters и score bars |
| **SofiaPlan API** | 100+ набора реални данни за София |

---

## Инсталация

```bash
# 1. Клонирай
git clone https://github.com/YOUR_USERNAME/sofiavital.git
cd sofiavital

# 2. Инсталирай зависимостите
npm install

# 3. Стартирай
npm run dev
```

Отвори [http://localhost:3000](http://localhost:3000).

> **Без `.env` файл.** Без API ключове. Всички данни са публично достъпни.

---

## Структура

```
sofiavital/
├── app/
│   ├── page.tsx                           # Главна страница
│   ├── layout.tsx                         # Root layout + metadata
│   ├── globals.css                        # Design tokens, анимации, Leaflet overrides
│   └── api/sofiaplan/[...path]/route.ts   # Proxy → api.sofiaplan.bg (CORS fix)
│
├── components/
│   ├── HeroScreen.tsx        # Входен екран с Anime.js stagger анимация
│   ├── MapView.tsx           # Leaflet карта + GeoJSON полигони + flyTo
│   ├── DistrictPanel.tsx     # Sidebar с детайли и animated score bars
│   ├── TopBar.tsx            # Навигация + profile switcher
│   ├── LayerPanel.tsx        # Превключване на 7-те слоя данни
│   ├── RankingPanel.tsx      # Класация на 24-те района
│   ├── CustomWeightsBar.tsx  # Слайдери за персонализирани тегла
│   └── Legend.tsx            # Цветова легенда
│
└── lib/
    └── data.ts               # Типове, данни, helpers, профили, слоеве
```

---

## Roadmap

- [ ] AI асистент — чат с Anthropic API за въпроси за конкретни райони
- [ ] Сравнение — side-by-side на 2–3 района
- [ ] Шумови карти — реална интеграция на данни за шум от Софияплан
- [ ] Имотни цени — dataset `#624` (наеми и покупки по ГЕ)
- [ ] Share — споделяне на резултата с персонализиран линк
- [ ] Mobile — адаптивен дизайн за телефон

---

## Принос

Pull requests са добре дошли. За по-голями промени, моля отворете issue първо.

```bash
git checkout -b feature/my-idea
git commit -m 'feat: describe your change'
git push origin feature/my-idea
# → отворете Pull Request
```

---

## Лиценз

[MIT](LICENSE)

---

<div align="center">

Данни: [Софияплан](https://sofiaplan.bg) &nbsp;·&nbsp; Карти: [OpenStreetMap](https://openstreetmap.org) / [CARTO](https://carto.com)

**Направен с ❤️ за София**

</div>
