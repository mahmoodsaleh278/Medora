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
        JSON.stringify({ error: "Missing GEMINI_API_KEY environment variable" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body = await req.json();
    console.log("Incoming Request Body Keys:", Object.keys(body));
    console.log("Full Incoming Body:", JSON.stringify(body).slice(0, 300)); // طباعة أول 300 حرف للمعاينة

    // فحص جميع الاحتمالات الممكنة لأسماء الحقول
    const fileBase64 = body.fileBase64 || body.file || body.pdfBase64 || body.base64;
    const mimeType = body.mimeType || body.fileType || body.type || "application/pdf";
    const textContent = body.textContent || body.text || body.lectureText || body.content || body.lecture;
    const prompt = body.prompt;

    if (!fileBase64 && !textContent) {
      console.error("Validation Failed: No file or text detected in body", body);
      return new Response(
        JSON.stringify({ 
          error: "تعذّر استلام محتوى المحاضرة: الحقول المستلمة فارغة.",
          receivedKeys: Object.keys(body)
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const systemInstruction = `
      You are an expert academic summarizer. 
      Generate a clean, highly structured, well-formatted HTML output (using tags like <h2>, <h3>, <p>, <ul>, <li>, <strong>, <table>, <blockquote>).
      Do NOT include <html>, <head>, or <body> tags. Do NOT wrap output in markdown code blocks like \`\`\`html. Return pure HTML only.
    `;

    const parts: any[] = [];

    if (fileBase64) {
      parts.push({
        inline_data: {
          mime_type: mimeType,
          data: fileBase64,
        },
      });
    }

    const userPrompt = prompt || "قم بتلخيص هذا المحتوى بدقة مع التركيز على المفاهيم الأساسية، المصطلحات، والنقاط المهمة.";
    parts.push({ text: `${userPrompt}\n\n${textContent || ""}` });

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const geminiResponse = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemInstruction }] },
        contents: [{ role: "user", parts }],
      }),
    });

    if (!geminiResponse.ok) {
      const errData = await geminiResponse.json();
      console.error("Gemini API Error:", errData);
      return new Response(
        JSON.stringify({ error: "Gemini API Error", details: errData }),
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
    console.error("Function Handler Exception:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});    const systemInstruction = `
      You are an expert academic summarizer. 
      Generate a clean, highly structured, well-formatted HTML output (using tags like <h2>, <h3>, <p>, <ul>, <li>, <strong>, <table>, <blockquote>).
      Do NOT include <html>, <head>, or <body> tags. Do NOT wrap output in markdown code blocks like \`\`\`html. Return pure HTML only.
    `;

    const parts: any[] = [];

    if (fileBase64 && mimeType) {
      parts.push({
        inline_data: {
          mime_type: mimeType,
          data: fileBase64,
        },
      });
    }

    const userPrompt = prompt || "قم بتلخيص هذا المحتوى بدقة مع التركيز على المفاهيم الأساسية، المصطلحات، والنقاط المهمة.";
    parts.push({ text: `${userPrompt}\n\n${textContent || ""}` });

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const geminiResponse = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemInstruction }] },
        contents: [{ role: "user", parts }],
      }),
    });

    if (!geminiResponse.ok) {
      const errData = await geminiResponse.json();
      return new Response(
        JSON.stringify({ error: "Gemini API Error", details: errData }),
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
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
