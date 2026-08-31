import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get("GEMINI_API_KEY");
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "مفتاح GEMINI_API_KEY غير موجود في Supabase Secrets" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body = await req.json();
    let rawBase64 = body.fileBase64 || body.file || body.pdfBase64 || body.base64;
    const mimeType = body.mimeType || body.fileType || body.type || "application/pdf";
    const textContent = body.textContent || body.text || body.lectureText || body.content || "";
    const prompt = body.prompt;

    if (!rawBase64 && !textContent) {
      return new Response(
        JSON.stringify({ error: "لم يتم إرسال ملف أو نص للمحاضرة." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const parts: any[] = [];

    // تنظيف وإضافة ملف المحاضرة
    if (rawBase64) {
      const cleanBase64 = rawBase64.replace(/^data:[^;]+;base64,/, "").trim();
      parts.push({
        inline_data: {
          mime_type: mimeType,
          data: cleanBase64,
        },
      });
    }

    // إضافة نص الموجه والمحاضرة
    const userPrompt = prompt || "قم بتلخيص هذه المحاضرة بدقة واحترافية باللغة العربية مع إبراز المفاهيم الأساسية، العناوين، والتفاصيل المهمة بتنسيق HTML واضح ومميز.";
    parts.push({
      text: `${userPrompt}\n\n${textContent}`.trim(),
    });

    const systemPrompt = "You are an expert academic summarizer. Generate structured, clean HTML output with tags (<h2>, <h3>, <p>, <ul>, <li>, <strong>, <table>, <blockquote>). Do NOT include <html>, <head>, or <body> tags. Do NOT wrap output in markdown code fences like ```html. Return HTML only.";

    const payload = {
      system_instruction: {
        parts: [{ text: systemPrompt }],
      },
      contents: [
        {
          role: "user",
          parts: parts,
        },
      ],
    };

    // استدعاء الموديل الرسمي
    const apiUrl = `[https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=$](https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=$){apiKey.trim()}`;

    const geminiResponse = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await geminiResponse.json();

    if (!geminiResponse.ok) {
      const detailedErr = data?.error?.message || JSON.stringify(data);
      console.error("Gemini Error:", detailedErr);
      return new Response(
        JSON.stringify({ error: `Gemini API Error: ${detailedErr}` }),
        { status: geminiResponse.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let resultText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    resultText = resultText.replace(/^```html\s*/i, "").replace(/\s*```$/i, "").trim();

    return new Response(
      JSON.stringify({ html: resultText }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Server catch:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal Server Error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
