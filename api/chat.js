const { createClient } = require('@supabase/supabase-js');

// Supabase 클라이언트 초기화 (환경 변수 존재 시)
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = (supabaseUrl && supabaseKey) ? createClient(supabaseUrl, supabaseKey) : null;

// Gemini API Key 및 백업 모델 설정
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const DEFAULT_MODEL = process.env.GEMINI_MODEL || 'gemini-1.5-flash';

module.exports = async function handler(req, res) {
  // CORS 헤더 설정
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // OPTIONS 예비 요청 처리
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  if (!GEMINI_API_KEY) {
    console.error('GEMINI_API_KEY environment variable is not configured.');
    return res.status(500).json({ error: 'Server Configuration Error: GEMINI_API_KEY is missing in Vercel Environment Variables.' });
  }

  try {
    const { systemInstruction, contents } = req.body || {};

    if (!contents || !Array.isArray(contents) || contents.length === 0) {
      return res.status(400).json({ error: 'Invalid Request: contents array is required.' });
    }

    // 최신 사용자 메시지 추출 (Supabase 기록용)
    const lastUserMsg = contents.filter(c => c.role === 'user').slice(-1)[0];
    const userPromptText = lastUserMsg?.parts?.[0]?.text || '';

    // Gemini API payload 구성
    const payload = {
      contents: contents
    };
    if (systemInstruction) {
      payload.systemInstruction = systemInstruction;
    }

    // Gemini REST API 스트리밍 호출 (alt=sse)
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${DEFAULT_MODEL}:streamGenerateContent?alt=sse&key=${GEMINI_API_KEY}`;

    const geminiRes = await fetch(geminiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      console.error(`Gemini API Error [${geminiRes.status}]:`, errText);
      
      if (geminiRes.status === 429) {
        return res.status(429).json({ error: 'RATE_LIMIT_EXCEEDED' });
      }
      return res.status(geminiRes.status).json({ error: `Gemini API Error (${geminiRes.status}): ${errText}` });
    }

    // SSE 스트리밍 응답 헤더 설정
    res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');

    let fullAiResponse = '';
    const reader = geminiRes.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunkStr = decoder.decode(value, { stream: true });
      res.write(chunkStr);

      // Supabase 대화 로그 저장을 위해 응답 텍스트 파싱
      const lines = chunkStr.split('\n');
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6).trim());
            const textChunk = data?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (textChunk) {
              fullAiResponse += textChunk;
            }
          } catch (e) {
            // Partial JSON chunk, proceed
          }
        }
      }
    }

    res.end();

    // Supabase DB에 대화 로그 비동기 저장 (응답 종료 후)
    if (supabase && userPromptText) {
      supabase.from('chat_logs').insert([
        {
          user_message: userPromptText,
          bot_response: fullAiResponse || null,
          created_at: new Date().toISOString()
        }
      ]).then(({ error }) => {
        if (error) console.error('Supabase DB Insert Error:', error.message);
      }).catch(err => {
        console.error('Supabase DB Exception:', err);
      });
    }

  } catch (error) {
    console.error('Vercel API Serverless Error:', error);
    if (!res.headersSent) {
      return res.status(500).json({ error: error.message || 'Internal Server Error' });
    } else {
      res.end();
    }
  }
};
