import { NextRequest, NextResponse } from "next/server";

// ── Rate limiting ─────────────────────────────────────────────────────────────
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const FREE_LIMIT = 10;
const WINDOW_MS  = 24 * 60 * 60 * 1000;

function getRateLimitKey(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown"
  );
}

function checkRateLimit(key: string): { allowed: boolean; remaining: number } {
  const now    = Date.now();
  const record = rateLimitMap.get(key);
  if (!record || now > record.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true, remaining: FREE_LIMIT - 1 };
  }
  if (record.count >= FREE_LIMIT) return { allowed: false, remaining: 0 };
  record.count++;
  return { allowed: true, remaining: FREE_LIMIT - record.count };
}

// ── System prompt ─────────────────────────────────────────────────────────────
const DISTRICT_CONTEXT = `
Ти си AI асистент на SofiaVital — интерактивна карта за качеството на живот в София.
Отговаряш САМО на български. Бъди конкретен и кратък (2-4 изречения, освен ако не се иска повече).
Когато препоръчваш район, ЗАДЪЛЖИТЕЛНО цитирай конкретните числа от таблицата.

ПОКАЗАТЕЛИ (0–100, по-висок = по-добър):
- Въздух: концентрация PM10 (2018), по-висок = по-чист въздух
- Зеленина: паркове и зелени площи
- Транспорт: метро + трамвай покритие
- Училища: брой и достъпност на училища
- Тишина: обратно на шума (по-висок = по-тихо)
- Прохлада: обратно на топлинни острови
- Застрояване: обратно на строителна активност (по-висок = по-малко строеж)
- Детски градини: брой и достъпност на ясли/градини
- Велосипеди: изградена веломрежа 2021
- Без наводнения: обратно на риска от заливане (по-висок = по-безопасен)

ДАННИ ЗА 24-ТЕ РАЙОНА:
| Район         | Общ | Въздух | Зеленина | Транспорт | Училища | Тишина | Прохлада | Застрояване | Детски гр. | Велосипеди | Без навод. |
|---------------|-----|--------|----------|-----------|---------|--------|----------|-------------|------------|------------|------------|
| Витоша        | 85  | 88     | 92       | 70        | 82      | 85     | 88       | 80          | 82         | 55         | 90         |
| Оборище       | 80  | 78     | 75       | 88        | 90      | 65     | 72       | 70          | 88         | 72         | 85         |
| Банкя         | 78  | 92     | 88       | 55        | 70      | 92     | 90       | 85          | 60         | 30         | 78         |
| Лозенец       | 78  | 80     | 78       | 82        | 88      | 68     | 70       | 60          | 85         | 78         | 88         |
| Изгрев        | 76  | 82     | 72       | 78        | 85      | 72     | 75       | 65          | 80         | 65         | 90         |
| Панчарево     | 75  | 95     | 95       | 45        | 65      | 95     | 92       | 88          | 55         | 20         | 55         |
| Триадица      | 74  | 75     | 70       | 85        | 80      | 62     | 68       | 58          | 78         | 70         | 82         |
| Младост       | 72  | 70     | 68       | 90        | 78      | 58     | 62       | 45          | 82         | 80         | 70         |
| Средец        | 72  | 65     | 65       | 92        | 88      | 52     | 58       | 55          | 85         | 88         | 80         |
| Красно село   | 71  | 72     | 65       | 82        | 75      | 60     | 65       | 52          | 76         | 75         | 82         |
| Студентски    | 70  | 68     | 62       | 80        | 72      | 62     | 60       | 50          | 65         | 60         | 75         |
| Овча купел    | 68  | 75     | 65       | 65        | 68      | 68     | 70       | 60          | 65         | 45         | 72         |
| Слатина       | 66  | 65     | 58       | 72        | 65      | 55     | 58       | 48          | 62         | 52         | 65         |
| Нови Искър    | 65  | 78     | 72       | 48        | 60      | 75     | 72       | 65          | 55         | 25         | 35         |
| Възраждане    | 65  | 60     | 55       | 85        | 68      | 48     | 52       | 50          | 68         | 65         | 72         |
| Илинден       | 64  | 62     | 52       | 78        | 62      | 50     | 55       | 48          | 60         | 55         | 68         |
| Искър         | 64  | 60     | 55       | 70        | 65      | 52     | 55       | 45          | 62         | 48         | 38         |
| Люлин         | 62  | 65     | 58       | 72        | 65      | 55     | 60       | 42          | 70         | 42         | 78         |
| Сердика       | 60  | 58     | 50       | 68        | 60      | 48     | 52       | 40          | 58         | 38         | 70         |
| Връбница      | 60  | 62     | 55       | 65        | 58      | 52     | 55       | 42          | 55         | 35         | 72         |
| Красна поляна | 58  | 58     | 48       | 70        | 60      | 45     | 50       | 38          | 60         | 40         | 75         |
| Подуяне       | 58  | 55     | 48       | 68        | 58      | 45     | 48       | 38          | 58         | 35         | 60         |
| Надежда       | 56  | 55     | 45       | 65        | 55      | 42     | 48       | 35          | 55         | 32         | 65         |
| Кремиковци    | 52  | 40     | 65       | 35        | 48      | 55     | 58       | 70          | 40         | 15         | 42         |

ПРОФИЛИ:
- Семейство: детски градини 20%, зеленина 18%, училища 18%, тишина 15%, въздух 12%
- Млад специалист: транспорт 25%, велосипеди 15%, въздух 15%, зеленина 12%, тишина 12%
- Пенсионер: тишина 25%, въздух 22%, зеленина 18%, прохлада 15%, без наводнения 8%

Данните са от Софияплан (api.sofiaplan.bg). Въздух = PM10 2018, топлинни острови = авг. 2019, веломрежа = 2021.
`;

// ── POST /api/chat ─────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const ipKey = getRateLimitKey(req);
  const { allowed, remaining } = checkRateLimit(ipKey);

  if (!allowed) {
    return NextResponse.json(
      { error: "Достигнат е дневният лимит от 10 въпроса. Опитай утре.", limitReached: true },
      { status: 429 }
    );
  }

  let messages: { role: string; content: string }[];
  try {
    const body = await req.json();
    messages = body.messages;
    if (!Array.isArray(messages) || messages.length === 0) throw new Error();
  } catch {
    return NextResponse.json({ error: "Невалидна заявка." }, { status: 400 });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "API ключът не е конфигуриран." }, { status: 500 });
  }

  const geminiMessages = messages.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  try {
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: DISTRICT_CONTEXT }] },
          contents: geminiMessages,
          generationConfig: { temperature: 0.7, maxOutputTokens: 600, topP: 0.9 },
          safetySettings: [
            { category: "HARM_CATEGORY_HARASSMENT",        threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_HATE_SPEECH",       threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" },
          ],
        }),
      }
    );

    if (!geminiRes.ok) {
      console.error("Gemini error:", await geminiRes.text());
      return NextResponse.json({ error: "Грешка от AI услугата. Опитай отново." }, { status: 502 });
    }

    const data = await geminiRes.json();
    const text: string = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "Няма отговор.";

    return NextResponse.json({ text, remaining });
  } catch (err) {
    console.error("Chat error:", err);
    return NextResponse.json({ error: "Неочаквана грешка. Опитай отново." }, { status: 500 });
  }
}
