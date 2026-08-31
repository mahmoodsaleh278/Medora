import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { GoogleGenAI } from "npm:@google/genai";

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
        JSON.stringify({ error: "Missing GEMINI_API_KEY in Supabase secrets." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const ai = new GoogleGenAI({ apiKey: apiKey.trim() });
    const body = await req.json();

    let rawBase64 = body.fileBase64 || body.file || body.pdfBase64 || body.base64;
    const mimeType = body.mimeType || body.fileType || body.type || "application/pdf";
    const textContent = body.textContent || body.text || body.lectureText || body.content || "";
    const prompt = body.prompt || "قم بتلخيص هذا المحتوى بدقة مع التركيز على المفاهيم الأساسية، المصطلحات، والنقاط المهمة باللغة العربية.";

    if (!rawBase64 && !textContent) {
      return new Response(
        JSON.stringify({ error: "لم يتم إرسال ملف أو نص للمحاضرة." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const contents: any[] = [];

    // إضافة الملف المرفوع إن وجد بعد تنظيف الـ Base64
    if (rawBase64) {
      const cleanBase64 = rawBase64.replace(/^data:[^;]+;base64,/, "").trim();
      contents.push({
        inlineData: {
          mimeType: mimeType,
          data: cleanBase64,
        },
      });
    }

    // إضافة النص والموجه
    contents.push({
      text: `${prompt}\n\n${textContent}`.trim(),
    });

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: contents,
      config: {
        systemInstruction: "You are an expert academic summarizer. Generate a clean, highly structured, well-formatted HTML output using tags like <h2>, <h3>, <p>, <ul>, <li>, <strong>, <table>, <blockquote>. Do NOT include <html>, <head>, or <body> tags. Do NOT wrap output in markdown code blocks like ```html. Return pure HTML only.",
      },
    });

    let resultText = response.text || "";
    resultText = resultText.replace(/^```html\s*/i, "").replace(/\s*```$/i, "").trim();

    return new Response(
      JSON.stringify({ html: resultText }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Server Error:", error);
    return new Response(
      JSON.stringify({ error: error?.message || "Internal Server Error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
