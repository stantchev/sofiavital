# SofiaVital

> **Къде е най-добре да живея в София?**

Интерактивна карта на качеството на живот в 24-те официални района на Столична община. Данни в реално време от [Софияплан](https://sofiaplan.bg) API.

---

## Бърз старт

```bash
npm install
npm run dev
```

Отвори [http://localhost:3000](http://localhost:3000)

---

## Стек

| | |
|---|---|
| **Framework** | Next.js 15 (App Router) |
| **Карта** | Leaflet.js + CartoDB Dark tiles (без API key) |
| **Данни** | SofiaPlan API → `/api/sofiaplan/[...path]` proxy |
| **Анимации** | Anime.js 3 |
| **Типове** | TypeScript |

---

## Структура

```
sofiavital/
├── app/
│   ├── page.tsx                        # Главна страница
│   ├── layout.tsx                      # Root layout
│   ├── globals.css                     # Design tokens + base styles
│   └── api/sofiaplan/[...path]/route.ts  # CORS proxy → api.sofiaplan.bg
│
├── components/
│   ├── HeroScreen.tsx     # Анимиран hero с Anime.js
│   ├── MapView.tsx        # Leaflet карта + GeoJSON слоеве
│   ├── DistrictPanel.tsx  # Sidebar с детайли за район
│   ├── TopBar.tsx         # Навигация + профили
│   ├── LayerPanel.tsx     # Селектор на слоеве
│   ├── RankingPanel.tsx   # Класация на 24-те района
│   ├── CustomWeightsBar.tsx # Персонализирани тегла
│   └── Legend.tsx         # Цветова легенда
│
└── lib/
    └── data.ts            # Всички данни, типове, helpers
```

---

## SofiaPlan API слоеве

| Слой | Dataset ID | Описание |
|---|---|---|
| Райони (граници) | 350 | GeoJSON полигони на 24-те района |
| Паркове | 235 | Паркове и градини |
| Метро | 32 | Метро линии 1 и 2 |
| Трамваи | 254 | Трамвайна мрежа |
| Въздух (PM10) | 579 | Замърсяване с ФПЧ10 |
| Топлинни острови | 45 | ГТО интензивност |
| Училища | 281 | Имоти на училища |
| Застрояване | 628 | Разрешения за строеж |

Всички заявки минават през `/api/sofiaplan/datasets/:id` proxy за избягване на CORS. Кешът е 1 час.

---

## Vital Score

Изчислява се динамично на база профила на потребителя:

```
score = Σ (indicator_value × profile_weight)
```

| Профил | Приоритет |
|---|---|
| 👨‍👩‍👧 Семейство | Зеленина 25%, Образование 28%, Тишина 20% |
| 💼 Млад специалист | Транспорт 30%, Въздух 15%, Зеленина 15% |
| 🌿 Пенсионер | Тишина 28%, Въздух 25%, Зеленина 22% |
| ⚙️ По избор | Слайдери за всеки показател |

---

## Следващи стъпки

- [ ] AI чат асистент (Anthropic API)
- [ ] Сравнение на 2–3 района
- [ ] Реални данни за шум от SofiaPlan
- [ ] Филтър по наемни цени (dataset #624)
- [ ] Share/export на резултати
- [ ] Mobile responsive layout

---

© 2026 — данни от Софияплан, карти от OpenStreetMap / CARTO
