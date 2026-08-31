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
        JSON.stringify({ error: "مفتاح GEMINI_API_KEY غير موجود في إعدادات Supabase Secrets" }),
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

    // إزالة أي بادئة Data URL
    let cleanBase64 = null;
    if (rawBase64) {
      cleanBase64 = rawBase64.replace(/^data:[^;]+;base64,/, "").trim();
    }

    const systemText = "You are an expert academic summarizer. Generate a clean, highly structured, well-formatted HTML output using tags like <h2>, <h3>, <p>, <ul>, <li>, <strong>, <table>, <blockquote>. Do NOT include <html>, <head>, or <body> tags. Do NOT wrap output in markdown code blocks like ```html. Return pure HTML only.";

    const parts: any[] = [];

    // إضافة الملف
    if (cleanBase64) {
      parts.push({
        inline_data: {
          mime_type: mimeType,
          data: cleanBase64,
        },
      });
    }

    // إضافة النص والموجه
    const userPrompt = prompt || "قم بتلخيص هذا المحتوى بدقة مع التركيز على المفاهيم الأساسية، المصطلحات، والنقاط المهمة باللغة العربية.";
    parts.push({ text: `${userPrompt}\n\n${textContent}` });

    const apiUrl = `[https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=$](https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=$){apiKey.trim()}`;

    const payload = {
      system_instruction: {
        parts: [{ text: systemText }]
      },
      contents: [
        {
          role: "user",
          parts: parts
        }
      ]
    };

    const geminiResponse = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!geminiResponse.ok) {
      const errData = await geminiResponse.json();
      console.error("Gemini Error Details:", JSON.stringify(errData));
      
      const detailedMessage = errData?.error?.message || "خطأ غير معروف من خادم Gemini";
      return new Response(
        JSON.stringify({ error: `خطأ Gemini API: ${detailedMessage}` }),
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
    console.error("Internal Server Error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "حدث خطأ داخلي في الخادم" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
