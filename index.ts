// supabase/functions/generate-summary/index.ts
//
// بتستقبل من الموقع: { fileBase64, mimeType, prompt }
// بترجع: { html: "..." }
//
// بتقرأ مفتاح Gemini من متغيّر بيئة اسمه GEMINI_API_KEY
// (يُضاف عبر: supabase secrets set GEMINI_API_KEY=xxxx)

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
const GEMINI_MODEL = "gemini-2.5-flash"; // بديل أرخص: gemini-2.5-flash-lite / أدق: gemini-2.5-pro
const GEMINI_URL =
  `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

// عدّل هون دومين موقعك الحقيقي بدل * لتقييد من فيه يستدعي الدالة
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req: Request) => {
  // متصفحات بترسل طلب OPTIONS (preflight) قبل الطلب الفعلي
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS_HEADERS });
  }

  if (req.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  if (!GEMINI_API_KEY) {
    return json({ error: "لم يتم إعداد مفتاح Gemini على الخادم بعد." }, 500);
  }

  let body: { fileBase64?: string; mimeType?: string; prompt?: string };
  try {
    body = await req.json();
  } catch {
    return json({ error: "طلب غير صالح (JSON خاطئ)." }, 400);
  }

  const { fileBase64, mimeType, prompt } = body;
  if (!fileBase64 || !mimeType || !prompt) {
    return json({ error: "بيانات ناقصة: fileBase64 / mimeType / prompt مطلوبة." }, 400);
  }

  // Gemini بيدعم مباشرة PDF وصور كـ inlineData بدون استخراج نص مسبق
  const allowed = mimeType === "application/pdf" || mimeType.startsWith("image/");
  if (!allowed) {
    return json({ error: "نوع الملف غير مدعوم، الرجاء رفع PDF أو صورة." }, 400);
  }

  const geminiPayload = {
    contents: [
      {
        role: "user",
        parts: [
          { text: prompt },
          { inlineData: { mimeType, data: fileBase64 } },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.4,
      maxOutputTokens: 8192,
    },
  };

  try {
    const geminiRes = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(geminiPayload),
    });

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      console.error("Gemini error:", errText);
      return json({ error: "فشل الاتصال بخدمة الذكاء الاصطناعي." }, 502);
    }

    const data = await geminiRes.json();
    const rawText: string | undefined =
      data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawText) {
      return json({ error: "لم يرجع النموذج أي محتوى، حاول مرة أخرى." }, 502);
    }

    // تنظيف احتياطي لو النموذج حط الرد جوا ```html ... ```
    const html = rawText
      .replace(/^```html\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/```\s*$/i, "")
      .trim();

    return json({ html });
  } catch (err) {
    console.error(err);
    return json({ error: "حدث خطأ غير متوقع أثناء توليد الملخص." }, 500);
  }
});

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
  });
}
