import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { lectureText, pastQuestions } = await req.json();

    if (!lectureText) {
      return new Response(
        JSON.stringify({ error: "لم يتم إرسال نص المحاضرة" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const apiKey = Deno.env.get('GEMINI_API_KEY');
    if (!apiKey) {
      throw new Error("مفتاح GEMINI_API_KEY غير معرّف في الـ Secrets");
    }

    const prompt = `
أنت مساعد أكاديمي ذكي لمنصة MEDORA التعليمية.
قم بتحليل نص المحاضرة التالي وتوليد ملخص شامل ومنظم بنقاط واضحة.
${pastQuestions ? `\nمع مراعاة أسئلة السنوات السابقة التالية والتركيز على مفاهيمها:\n${pastQuestions}` : ''}

نص المحاضرة:
${lectureText}
`;

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const geminiResponse = await fetch(geminiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    const geminiData = await geminiResponse.json();

    if (!geminiResponse.ok) {
      throw new Error(geminiData.error?.message || "فشل الاتصال بـ Gemini");
    }

    const outputText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || "لم يتم توليد رد.";

    return new Response(
      JSON.stringify({ summary: outputText }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
