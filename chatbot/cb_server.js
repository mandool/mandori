import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// 환경 변수 설정
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3005;

// 미들웨어
app.use(cors());
app.use(express.json());

// 정적 파일 서빙 (프론트엔드 호스팅)
app.use(express.static(__dirname));

// 기본 주소 접속 시 cb_index.html로 리다이렉트
app.get('/', (req, res) => {
    res.redirect('/cb_index.html');
});

// 채팅 API (Proxy)
app.post('/api/chat', async (req, res) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        return res.status(500).json({ error: '서버에 API 키가 설정되지 않았습니다.' });
    }

    const { model, systemInstruction, contents } = req.body;
    
    // 2.5-flash 모델은 하루 20회 제한의 실험 버전으로 확인되어 오늘 한도가 모두 소진되었습니다.
    // 무제한(하루 1,500회)이 보장되는 가장 가벼운 정식 모델인 'gemini-2.5-flash-lite'로 최종 변경합니다.
    const targetModel = model || 'gemini-2.5-flash-lite';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${targetModel}:streamGenerateContent?alt=sse&key=${apiKey}`;

    console.log(`\n[채팅 요청] 모델: ${targetModel} / 질문 전송 중...`);

    let maxRetries = 2;
    let attempt = 0;

    while (attempt <= maxRetries) {
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ systemInstruction, contents })
            });

            if (!response.ok) {
                const errorText = await response.text();
                
                // 429 에러(속도 제한)인 경우 즉시 에러 반환 (사용자 피드백 속도 개선)
                // 기존의 긴 대기시간(35초+)은 사용자에게 멈춘 듯한 인상을 줄 수 있으므로, 
                // 즉시 '과부화' 메시지를 보여주는 것이 UX 측면에서 더 좋습니다.
                if (response.status === 429) {
                    console.warn(`\n⚠️ 429 속도 제한 발동! 즉시 에러 응답을 반환합니다.\n`);
                } else {
                    console.error('Gemini API Error:', response.status, errorText);
                }

                // 원본 에러 정보를 서버 로그에 기록하고, 클라이언트에는 정제된 정보만 전달 (보안 강화)
                console.error(`[Gemini API 오류] Status: ${response.status}`, errorText);
                
                let userFriendlyError = 'AI 응답 중 오류가 발생했습니다.';
                if (response.status === 429) {
                    userFriendlyError = 'RATE_LIMIT_EXCEEDED'; // 프론트엔드에서 특정 멘트로 처리
                } else if (response.status === 400) {
                    userFriendlyError = '잘못된 요청 형식입니다.';
                } else if (response.status === 401 || response.status === 403) {
                    userFriendlyError = 'API 인증에 실패했습니다.';
                } else if (response.status >= 500) {
                    userFriendlyError = '구글 서버에 일시적인 장애가 발생했습니다.';
                }

                return res.status(response.status).json({ 
                    error: userFriendlyError,
                    status: response.status
                });
            }

            // 헤더 설정 (SSE 스트리밍 응답 전달)
            res.setHeader('Content-Type', 'text/event-stream');
            res.setHeader('Cache-Control', 'no-cache');
            res.setHeader('Connection', 'keep-alive');

            // ReadableStream을 프론트엔드로 그대로 파이핑
            if (response.body) {
                // Node 18+ Web Streams API -> Express res pipe
                const reader = response.body.getReader();
                const pump = async () => {
                    while (true) {
                        const { done, value } = await reader.read();
                        if (done) break;
                        res.write(value);
                    }
                    res.end();
                };
                pump().catch(err => {
                    console.error("Stream piping error:", err);
                    if (!res.headersSent) res.status(500).end();
                });
            } else {
                res.status(500).json({ error: '응답 본문이 비어있습니다.' });
            }
            
            return; // 성공 시 함수 종료

        } catch (err) {
            console.error('Server error:', err);
            return res.status(500).json({ error: '서버 내부 오류가 발생했습니다.' });
        }
    }
});

app.listen(PORT, () => {
    console.log(`🤖 서버가 작동 중입니다. [최신 버전 v2.0] http://localhost:${PORT}`);
});
