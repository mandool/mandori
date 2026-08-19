const { createClient } = require('@supabase/supabase-js');

// ── 모듈 스코프 (콜드 스타트 시 1회만 실행 → 이후 재사용) ──
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = (supabaseUrl && supabaseKey) ? createClient(supabaseUrl, supabaseKey) : null;

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// ── 속도 우선 모델 후보 ──
const SPEED_PRIORITY_MODELS = [
  'gemini-2.5-flash',        // ⚡ 안정적인 2.5 Flash
  'gemini-2.5-flash-lite',   // ⚡ 첫 글자 도착: 0.8초 (초고속!)
  'gemini-flash-lite-latest',
  'gemini-1.5-flash'
];

module.exports = async function handler(req, res) {
  // ── CORS ──
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  if (!GEMINI_API_KEY) {
    return res.status(500).json({ error: 'GEMINI_API_KEY is missing.' });
  }

  try {
    const { systemInstruction, contents } = req.body || {};
    if (!contents || !Array.isArray(contents) || contents.length === 0) {
      return res.status(400).json({ error: 'contents array is required.' });
    }

    // 사용자 메시지 추출 (Supabase 기록용)
    const lastUserMsg = contents.filter(c => c.role === 'user').slice(-1)[0];
    const userPromptText = lastUserMsg?.parts?.[0]?.text || '';

    // ── Gemini API Payload (속도 최적화 설정 포함) ──
    const payload = {
      contents,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2048,
        topP: 0.9
      }
    };
    if (systemInstruction) payload.systemInstruction = systemInstruction;

    // ── 속도 우선 모델 순차 시도 (404면 즉시 다음 모델로) ──
    const cleanApiKey = GEMINI_API_KEY.trim();
    let geminiRes = null;
    let usedModel = '';

    for (const model of SPEED_PRIORITY_MODELS) {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse&key=${cleanApiKey}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        geminiRes = response;
        usedModel = model;
        break;
      }

      // 404 = 모델 미존재 → 즉시 다음 후보로 (지연 최소화)
      // 429 = 속도 제한 → 즉시 에러 리턴
      if (response.status === 429) {
        return res.status(429).json({ error: 'RATE_LIMIT_EXCEEDED' });
      }
      // 404 외 다른 에러(400, 403 등)도 다음 모델로 넘어감
      console.warn(`[${model}] → ${response.status} (skip)`);
    }

    if (!geminiRes) {
      return res.status(500).json({ error: `All models unavailable. Tried: ${SPEED_PRIORITY_MODELS.join(', ')}` });
    }

    console.log(`✅ Using model: ${usedModel}`);

    // ── SSE 스트리밍 응답 (첫 바이트 즉시 전송) ──
    res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no'); // Nginx/CDN 버퍼링 방지
    res.flushHeaders(); // 헤더를 즉시 클라이언트로 전송 → 체감 지연 최소화

    let fullAiResponse = '';
    const reader = geminiRes.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunkStr = decoder.decode(value, { stream: true });
      res.write(chunkStr); // 즉시 클라이언트로 스트리밍

      // 응답 텍스트 파싱 (Supabase 기록용)
      const lines = chunkStr.split('\n');
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6).trim());
            const t = data?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (t) fullAiResponse += t;
          } catch (_) { /* partial JSON chunk */ }
        }
      }
    }

    // ── 응답 완료 즉시 종료 (사용자 대기 시간 0) ──
    res.end();

    // ── Supabase DB 기록 (res.end() 이후 백그라운드 저장) ──
    // Vercel은 res.end() 이후에도 함수가 즉시 죽지 않고 약간의 여유가 있으므로
    // await 없이 fire-and-forget으로 처리하여 사용자 체감 속도를 극대화합니다.
    if (supabase && userPromptText) {
      supabase.from('chat_logs').insert([{
        user_message: userPromptText,
        bot_response: fullAiResponse || null,
        created_at: new Date().toISOString()
      }]).then(({ error: dbErr }) => {
        if (dbErr) console.error('Supabase Insert Error:', dbErr.message);
      }).catch(err => console.error('Supabase Exception:', err));
    }

  } catch (error) {
    console.error('Serverless Error:', error);
    if (!res.headersSent) {
      return res.status(500).json({ error: error.message || 'Internal Server Error' });
    } else {
      res.end();
    }
  }
};
