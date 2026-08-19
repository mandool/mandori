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

    // Google Gemini API v1beta 호환 모델 후보 (최신 1.5-flash 최우선)
    const MODEL_CANDIDATES = [
      'gemini-1.5-flash',
      'gemini-2.0-flash',
      'gemini-1.5-flash-8b',
      'gemini-1.5-pro'
    ];

    let geminiRes = null;
    let lastErrText = '';
    const cleanApiKey = GEMINI_API_KEY.trim();

    for (const model of MODEL_CANDIDATES) {
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse&key=${cleanApiKey}`;
      try {
        const response = await fetch(geminiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (response.ok) {
          geminiRes = response;
          break;
        } else {
          lastErrText = await response.text();
          console.warn(`Gemini Model [${model}] failed (${response.status}):`, lastErrText);
          if (response.status === 429) {
            return res.status(429).json({ error: 'RATE_LIMIT_EXCEEDED' });
          }
        }
      } catch (e) {
        lastErrText = e.message;
      }
    }

    if (!geminiRes) {
      const maskedKey = cleanApiKey ? `${cleanApiKey.slice(0, 6)}...${cleanApiKey.slice(-4)}` : 'MISSING';
      console.error(`All Gemini Models Failed. Key: ${maskedKey}. Last Error:`, lastErrText);
      return res.status(500).json({ 
        error: `Gemini API Key [${maskedKey}] Auth/Model Error. Google API response: ${lastErrText}` 
      });
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

    // Supabase DB에 대화 로그 저장 (res.end() 전에 await로 확실히 완료)
    if (supabase && userPromptText) {
      try {
        const { error: dbErr } = await supabase.from('chat_logs').insert([
          {
            user_message: userPromptText,
            bot_response: fullAiResponse || null,
            created_at: new Date().toISOString()
          }
        ]);
        if (dbErr) {
          console.error('Supabase DB Insert Error:', dbErr.message);
        } else {
          console.log('Successfully recorded chat log into Supabase DB.');
        }
      } catch (err) {
        console.error('Supabase DB Exception:', err);
      }
    }

    res.end();

    // Vercel Serverless Function - Gemini API & Supabase 연동 완료
  } catch (error) {
    console.error('Vercel API Serverless Error:', error);
    if (!res.headersSent) {
      return res.status(500).json({ error: error.message || 'Internal Server Error' });
    } else {
      res.end();
    }
  }
};
