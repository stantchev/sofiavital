// ─── TYPES ───────────────────────────────────────────────────────────────────

export interface District {
  id: string;
  name: string;
  score: number;
  pop: number;
  air: number;
  green: number;
  transit: number;
  schools: number;
  noise: number;
  heat: number;
  build: number;
  // NEW v2
  kindergartens: number; // детски градини
  cycling: number;       // велосипедна мрежа
  flood: number;         // риск от наводнения (100 = без риск)
}

export type IndicatorKey =
  | "air" | "green" | "transit" | "schools" | "noise"
  | "heat" | "build" | "kindergartens" | "cycling" | "flood";

export type Weights = Record<IndicatorKey, number>;

export interface Profile {
  label: string;
  icon: string;
  description: string;
  weights: Weights;
}

export interface Layer {
  id: string;
  label: string;
  icon: string;
  color: string;
  apiId: number;
  description: string;
}

// ─── DISTRICTS ───────────────────────────────────────────────────────────────

export const DISTRICTS: District[] = [
  { id: "vitosha",      name: "Витоша",        score: 85, pop: 62345,  air: 88, green: 92, transit: 70, schools: 82, noise: 85, heat: 88, build: 80, kindergartens: 82, cycling: 55, flood: 90 },
  { id: "oborishte",   name: "Оборище",        score: 80, pop: 29876,  air: 78, green: 75, transit: 88, schools: 90, noise: 65, heat: 72, build: 70, kindergartens: 88, cycling: 72, flood: 85 },
  { id: "bankya",      name: "Банкя",           score: 78, pop: 12678,  air: 92, green: 88, transit: 55, schools: 70, noise: 92, heat: 90, build: 85, kindergartens: 60, cycling: 30, flood: 78 },
  { id: "lozenets",    name: "Лозенец",         score: 78, pop: 30234,  air: 80, green: 78, transit: 82, schools: 88, noise: 68, heat: 70, build: 60, kindergartens: 85, cycling: 78, flood: 88 },
  { id: "izgrev",      name: "Изгрев",          score: 76, pop: 33478,  air: 82, green: 72, transit: 78, schools: 85, noise: 72, heat: 75, build: 65, kindergartens: 80, cycling: 65, flood: 90 },
  { id: "pancharevo",  name: "Панчарево",       score: 75, pop: 15678,  air: 95, green: 95, transit: 45, schools: 65, noise: 95, heat: 92, build: 88, kindergartens: 55, cycling: 20, flood: 55 },
  { id: "triaditza",   name: "Триадица",        score: 74, pop: 63212,  air: 75, green: 70, transit: 85, schools: 80, noise: 62, heat: 68, build: 58, kindergartens: 78, cycling: 70, flood: 82 },
  { id: "mladost",     name: "Младост",         score: 72, pop: 98765,  air: 70, green: 68, transit: 90, schools: 78, noise: 58, heat: 62, build: 45, kindergartens: 82, cycling: 80, flood: 70 },
  { id: "sredets",     name: "Средец",          score: 72, pop: 38791,  air: 65, green: 65, transit: 92, schools: 88, noise: 52, heat: 58, build: 55, kindergartens: 85, cycling: 88, flood: 80 },
  { id: "krasno_selo", name: "Красно село",     score: 71, pop: 82156,  air: 72, green: 65, transit: 82, schools: 75, noise: 60, heat: 65, build: 52, kindergartens: 76, cycling: 75, flood: 82 },
  { id: "studentski",  name: "Студентски",      score: 70, pop: 67234,  air: 68, green: 62, transit: 80, schools: 72, noise: 62, heat: 60, build: 50, kindergartens: 65, cycling: 60, flood: 75 },
  { id: "ovcha_kupel", name: "Овча купел",      score: 68, pop: 45678,  air: 75, green: 65, transit: 65, schools: 68, noise: 68, heat: 70, build: 60, kindergartens: 65, cycling: 45, flood: 72 },
  { id: "slatina",     name: "Слатина",         score: 66, pop: 52634,  air: 65, green: 58, transit: 72, schools: 65, noise: 55, heat: 58, build: 48, kindergartens: 62, cycling: 52, flood: 65 },
  { id: "novi_iskar",  name: "Нови Искър",      score: 65, pop: 20456,  air: 78, green: 72, transit: 48, schools: 60, noise: 75, heat: 72, build: 65, kindergartens: 55, cycling: 25, flood: 35 },
  { id: "vazrazhdane", name: "Възраждане",      score: 65, pop: 49358,  air: 60, green: 55, transit: 85, schools: 68, noise: 48, heat: 52, build: 50, kindergartens: 68, cycling: 65, flood: 72 },
  { id: "ilinden",     name: "Илинден",         score: 64, pop: 31678,  air: 62, green: 52, transit: 78, schools: 62, noise: 50, heat: 55, build: 48, kindergartens: 60, cycling: 55, flood: 68 },
  { id: "iskar",       name: "Искър",           score: 64, pop: 72345,  air: 60, green: 55, transit: 70, schools: 65, noise: 52, heat: 55, build: 45, kindergartens: 62, cycling: 48, flood: 38 },
  { id: "lyulin",      name: "Люлин",           score: 62, pop: 110234, air: 65, green: 58, transit: 72, schools: 65, noise: 55, heat: 60, build: 42, kindergartens: 70, cycling: 42, flood: 78 },
  { id: "serdika",     name: "Сердика",         score: 60, pop: 44567,  air: 58, green: 50, transit: 68, schools: 60, noise: 48, heat: 52, build: 40, kindergartens: 58, cycling: 38, flood: 70 },
  { id: "vrabnitsa",   name: "Връбница",        score: 60, pop: 47890,  air: 62, green: 55, transit: 65, schools: 58, noise: 52, heat: 55, build: 42, kindergartens: 55, cycling: 35, flood: 72 },
  { id: "krasna_pol",  name: "Красна поляна",   score: 58, pop: 68234,  air: 58, green: 48, transit: 70, schools: 60, noise: 45, heat: 50, build: 38, kindergartens: 60, cycling: 40, flood: 75 },
  { id: "poduyane",    name: "Подуяне",         score: 58, pop: 66445,  air: 55, green: 48, transit: 68, schools: 58, noise: 45, heat: 48, build: 38, kindergartens: 58, cycling: 35, flood: 60 },
  { id: "nadezhda",    name: "Надежда",         score: 56, pop: 76543,  air: 55, green: 45, transit: 65, schools: 55, noise: 42, heat: 48, build: 35, kindergartens: 55, cycling: 32, flood: 65 },
  { id: "kremikovtsi", name: "Кремиковци",      score: 52, pop: 23456,  air: 40, green: 65, transit: 35, schools: 48, noise: 55, heat: 58, build: 70, kindergartens: 40, cycling: 15, flood: 42 },
];

// ─── PROFILES ────────────────────────────────────────────────────────────────

export const PROFILES: Record<string, Profile> = {
  family: {
    label: "Семейство",
    icon: "👨‍👩‍👧",
    description: "Зеленина, детски градини, училища, тишина",
    weights: {
      green: 0.18, kindergartens: 0.20, schools: 0.18, noise: 0.15,
      air: 0.12, transit: 0.05, heat: 0.04, build: 0.03, cycling: 0.03, flood: 0.02,
    },
  },
  young: {
    label: "Млад специалист",
    icon: "💼",
    description: "Транспорт, велосипеди, въздух, зеленина",
    weights: {
      transit: 0.25, cycling: 0.15, air: 0.15, green: 0.12, noise: 0.12,
      heat: 0.08, build: 0.07, flood: 0.03, schools: 0.02, kindergartens: 0.01,
    },
  },
  pensioner: {
    label: "Пенсионер",
    icon: "🌿",
    description: "Тишина, въздух, зеленина, прохлада",
    weights: {
      noise: 0.25, air: 0.22, green: 0.18, heat: 0.15, flood: 0.08,
      transit: 0.05, cycling: 0.03, schools: 0.02, kindergartens: 0.01, build: 0.01,
    },
  },
  custom: {
    label: "По избор",
    icon: "⚙️",
    description: "Персонализирай сам теглата",
    weights: {
      green: 0.10, kindergartens: 0.10, schools: 0.10, noise: 0.10,
      air: 0.10, transit: 0.10, heat: 0.10, build: 0.10, cycling: 0.10, flood: 0.10,
    },
  },
};

// ─── LAYERS ──────────────────────────────────────────────────────────────────

export const LAYERS: Layer[] = [
  { id: "green",    label: "Зелени площи",       icon: "🌿", color: "#4ade80", apiId: 235, description: "Паркове и градини" },
  { id: "metro",    label: "Метро",               icon: "🚇", color: "#a78bfa", apiId: 32,  description: "Метро линии 1 и 2" },
  { id: "tram",     label: "Трамваи",             icon: "🚋", color: "#60a5fa", apiId: 254, description: "Трамвайна мрежа" },
  { id: "cycling",  label: "Велосипедна мрежа",   icon: "🚲", color: "#34d399", apiId: 606, description: "Изградена веломрежа 2021" },
  { id: "air",      label: "Въздух (PM10)",        icon: "💨", color: "#f472b6", apiId: 579, description: "Замърсяване ФПЧ10 2018" },
  { id: "heat",     label: "Топлинни острови",     icon: "🔥", color: "#fb923c", apiId: 45,  description: "ГТО интензивност авг. 2019" },
  { id: "schools",  label: "Училища",              icon: "📚", color: "#fbbf24", apiId: 281, description: "Имоти на училища" },
  { id: "kindergartens", label: "Детски градини",  icon: "🧒", color: "#e879f9", apiId: 52,  description: "Детски градини и ясли" },
  { id: "flood",    label: "Риск наводнения",      icon: "🌊", color: "#38bdf8", apiId: 446, description: "Зони с висока вероятност за заливане" },
  { id: "build",    label: "Застрояване",          icon: "🏗️", color: "#94a3b8", apiId: 628, description: "Разрешения за строеж след 2010 г." },
];

// ─── INDICATOR LABELS ─────────────────────────────────────────────────────────

export const INDICATOR_LABELS: Record<IndicatorKey, string> = {
  air:           "Въздух",
  green:         "Зеленина",
  transit:       "Транспорт",
  schools:       "Училища",
  noise:         "Тишина",
  heat:          "Прохлада",
  build:         "Застрояване",
  kindergartens: "Детски градини",
  cycling:       "Велосипеди",
  flood:         "Без наводнения",
};

// ─── HELPERS ──────────────────────────────────────────────────────────────────

export function calcPersonalScore(district: District, weights: Weights): number {
  return Math.round(
    (Object.keys(weights) as IndicatorKey[]).reduce(
      (sum, k) => sum + ((district[k] as number) ?? 50) * weights[k],
      0
    )
  );
}

export function scoreColor(score: number): string {
  if (score >= 75) return "#4ade80";
  if (score >= 65) return "#86efac";
  if (score >= 55) return "#fbbf24";
  if (score >= 45) return "#f97316";
  return "#f87171";
}

export function scoreLabel(score: number): string {
  if (score >= 75) return "Отлично";
  if (score >= 65) return "Добро";
  if (score >= 55) return "Средно";
  if (score >= 45) return "Под средното";
  return "Слабо";
}
