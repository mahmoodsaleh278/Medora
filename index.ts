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
        JSON.stringify({ error: "Missing GEMINI_API_KEY secret in Supabase" }),
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

    // تنظيف الـ Base64 في حال أرسلت الواجهة البادئة Data-URL
    let cleanBase64 = null;
    if (rawBase64) {
      cleanBase64 = rawBase64.replace(/^data:[^;]+;base64,/, "").trim();
    }

    const systemInstruction = `
      You are an expert academic summarizer. 
      Generate a clean, highly structured, well-formatted HTML output (using tags like <h2>, <h3>, <p>, <ul>, <li>, <strong>, <table>, <blockquote>).
      Do NOT include <html>, <head>, or <body> tags. Do NOT wrap output in markdown code blocks like \`\`\`html. Return pure HTML only.
    `;

    const parts: any[] = [];

    // إرسال الملف بالهيكل القياسي لـ Gemini REST API
    if (cleanBase64) {
      parts.push({
        inlineData: {
          mimeType: mimeType,
          data: cleanBase64,
        },
      });
    }

    const userPrompt = prompt || "قم بتلخيص هذا المحتوى بدقة مع التركيز على المفاهيم الأساسية، المصطلحات، والنقاط المهمة.";
    parts.push({ text: `${userPrompt}\n\n${textContent}` });

    // استخدام موديل مستقر مع إرسال المفتاح عبر الـ Headers
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent`;

    const geminiResponse = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey.trim(),
      },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemInstruction }] },
        contents: [{ role: "user", parts }],
      }),
    });

    if (!geminiResponse.ok) {
      const errData = await geminiResponse.json();
      console.error("Gemini API Detailed Error:", JSON.stringify(errData));
      
      const errorMessage = errData?.error?.message || "خطأ غير معروف من Google Gemini API";
      return new Response(
        JSON.stringify({ error: `Gemini API Error: ${errorMessage}` }),
        { status: geminiResponse.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await geminiResponse.json();
    let resultText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    resultText = resultText.replace(/^```html\s*/i, "").replace(/\s*```$/i, "").trim();

    return new Response(
      JSON.stringify({ html: resultText }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Handler error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
