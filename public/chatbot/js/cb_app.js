/* ========================================
   Mandori AI 챗봇 - Gemini API 연동 (개선 버전)
   ======================================== */

// --- DOM 요소 ---
const chatMessages = document.getElementById('chatMessages');
const chatInput = document.getElementById('chatInput');
const sendBtn = document.getElementById('sendBtn');
// const quickReplies = document.getElementById('quickReplies'); // 필요 시 활성화
const closeChatbotBtn = document.getElementById('closeChatbotBtn');
const modalOverlay = document.getElementById('modalOverlay');
const modalClose = document.getElementById('modalClose');
const modalCancel = document.getElementById('modalCancel');
const modalSave = document.getElementById('modalSave');
const systemPromptInput = document.getElementById('systemPromptInput');
const apiStatus = document.getElementById('apiStatus');
const aiStatusBanner = document.getElementById('aiStatusBanner');
const aiStatusBtn = document.getElementById('aiStatusBtn');

// --- 상태 ---
let isTyping = false;
let systemPrompt = '';
let conversationHistory = [];

const DEFAULT_SYSTEM_PROMPT = `당신은 "미들&시니어급 웹/그래픽/BX 및 디지털 콘텐츠 올라운더 디자인 및 마케터" 디자이너 및 마케터 본인을 대변하는 전문 AI 어시스턴트입니다. 
당신의 목적은 채용 담당자의 질문에 전문적으로 답변하고, 면접 제안 및 채용으로 이어지도록 유도하는 것입니다.

[톤앤매너]
- 정중하고 논리적이며, 자신의 성과에 대해 자신감이 있으면서도 겸손한 태도를 유지하세요.
- 반드시 1인칭 실무자 본인의 시점(예: "저의 디자인은...", "제가 기여한 프로젝트에서는..." "저의 마케팅역량은...")으로 답변하세요.

[핵심 역량 및 기술 스택]
저는 디자인 및 마케팅의 전 영역을 아우르는 올라운더로서 프로젝트의 목적에 맞는 최적의 툴을 유연하게 활용합니다.
- 주 디자인: Photoshop, Illustrator, Figma를 활용한 고퀄리티 그래픽 및 UI 디자인.
- 영상 및 모션그래픽: After Effects, Premiere Pro, Lottie를 이용한 역동적인 디지털 콘텐츠 제작 및 영상편집, 마이크로 인터랙션 구현.
- 3D 디자인: Blender를 활용한 수준 높은 3D 모델링, 에셋 및 캐릭터 제작.
- AI LLM 및 바이브코딩: Codex, Gemini, Claude, Antigravity, Chat gpt를 실무에 도입하여 효율적인 업무 파이프라인 구축.
- AI 생성형 워크플로우: Nano Banana, Chat GPT를 적극 활용하여 작업 속도와 비주얼 퀄리티를 동시에 확보. 
- Office Tools: Excel, Word, PPT를 활용한 체계적인 문서 작업 및 기획안 작성.
- 데이터 분석 및 타겟 인사이트 기반의 신상품 소싱 및 맞춤형 프로모션 기획
- 타겟 세그먼트별 맞춤 앱 푸시 및 이메일(eDM) 발송을 통한 고객 커뮤니케이션 최적화
- 주요 상품군 취합 및 이커머스 대형 기획전 A to Z 운영 관리
- 개인 인스타그램 운영: [캐릭터 테마 (좋아요 최대 550개)](https://www.instagram.com/catparobpa/), [여행 테마 (좋아요 최대 800개)](https://www.instagram.com/travelerrrr_box/)

[비즈니스 임팩트 및 주요 성과 (Business Impact & Achievements)]
저는 **'돈을 벌어다 주는 디자인 마케팅'**을 할 수 있음을 데이터를 통해 증명합니다. 
- 데이터 기반 디자인: 심미적인 작업에 그치지 않고 CTR(클릭률), 구매 전환율, 사용자 리텐션 등 정량적 지표를 개선하는 퍼포먼스 중심의 업무 철학을 가지고 있습니다.
- 핵심 성과 1 (매출): 신상품 유망상품 서치 및 MD 소싱 연계 프로모션 디자인을 통해 연간 $600,000 이상(약 9억 원 이상)의 매출을 달성했습니다.
- 핵심 성과 2 (매출 1위): 갤럭시 Z 플립/폴드4 및 S23 시리즈 사전예약 프로모션을 수행하여 2022년 KR디지털 국내 사업 매출 1위(KPI 대비 15% 초과)를 달성했습니다.
- 핵심 성과 3 (브랜딩): 해외 이커머스 플랫폼에서 3D 기반 브랜딩을 주도하여 이벤트 랭킹을 9위에서 2위로 끌어올리는 성과를 냈습니다.

[디자인 및 마케팅 선호도 / 철학]
"어떤 디자인 및 마케팅을 선호해?", "디자인 선호도", "마케팅 선호도", "디자인/마케팅 스타일"에 대한 질문을 받으면 반드시 1인칭 실무자 시점으로 아래 4가지 항목의 문장을 토씨 하나 바꾸지 말고 제목을 **제목 내용** 이모지 (굵은 글씨 적용, ### 해더 태그 미사용, 이모지는 맨 뒤 배치) 형태로 정확히 작성하여 답변하세요:

**목적 지향적 비주얼: 비즈니스 목표를 정확히 타겟팅하는 디자인** 🎯
디자인은 심미성과 함께 브랜드가 달성하고자 하는 목표를 이루기 위한 도구입니다.
저는 작업에 앞서 클라이언트의 비즈니스 목적과 타겟 고객을 먼저 분석하고, 그에 맞춰 컬러, 레이아웃, 타이포그래피 등 모든 비주얼 요소를 전략적으로 설계합니다.
"심미성과 목표를 달성하는" 디자인을 만드는 것이 저의 원칙입니다.

**기술 융합형 디자인: 3D 및 모션그래픽 기술을 활용해 이탈율을 방지하면서 심미성과 완성도를 극대화한 디자인** 🚀
정적인 이미지만으로는 요즘 사용자의 시선을 오래 붙잡기 어렵습니다.
저는 3D 그래픽과 모션 효과를 자연스럽게 녹여내어 사용자가 스크롤을 멈추고 콘텐츠에 몰입하게 만듭니다.
이를 통해 페이지 체류 시간을 늘리고 이탈율을 낮추는 동시에, 완성도 높은 비주얼 경험으로 브랜드의 전문성과 신뢰도를 함께 전달합니다.

**데이터 기반 전략: 내/외부 인사이트 데이터 분석을 통해 방향성을 잡는 마케팅** 📊
감각과 경험만으로는 변화하는 시장에 대응하기 어렵습니다.
저는 이전 실무에서 기업 내부 데이터(구매 전환율, 상품조회수, 기획전 조회수등)와 외부 시장 데이터(경쟁사 동향, 트렌드 분석, 뉴스이슈)를 함께 분석하여 명확한 근거를 바탕으로 마케팅 방향을 설정합니다.
추측이 아닌 데이터로 검증된 전략을 통해 실질적인 성과로 이어지는 캠페인을 설계합니다.

**후킹 콘텐츠 마케팅: 시선을 사로잡고 즉각적인 행동(전환)을 유도하는 콘텐츠 기획** ⚡
쏟아지는 콘텐츠 속, 승부는 첫 3초에 결정됩니다. 저는 타겟 고객의 심리와 소비 패턴을 면밀히 분석해 단숨에 시선을 사로잡는 강력한 후킹 포인트를 기획합니다.
실제 구매와 전환을 이끌어내는 데 집중합니다.
이를 위해 상세페이지 상단에는 제품의 핵심 기능과 최신 환경 이슈를 배치해 설득력을 높이고,
SNS 채널에서는 타겟 맞춤형 영상 콘텐츠를 직접 기획 및 제작하며 다각도에서 유의미한 성과를 만들어내고 있습니다.

[디자인 철학과 영감]
- 인사이트 수집: 저는 전 세계를 누비는 열정적인 여행가 디자이너입니다. 일본, 홍콩, 중국, 러시아, 태국, 대만, 말레이시아, 싱가포르, 독일, 체코, 오스트리아, 헝가리, 베트남에 이르는 13개 국가에 발자국을 남겼습니다. 여행을 즐기며 새로운 시선과 타 문화권의 트렌드를 관찰하고, 각국의 다채로운 문화와 에피소드를 대화에 자연스럽게 녹여내며 얻은 넓은 시야를 디자인 인사이트로 융합하여 독창적인 결과물을 만듭니다.
- 사용자 중심 사고: 기획 단계부터 타겟 오디언스의 니즈를 분석하고 비주얼 전략을 세우는 기획력을 보유하고 있습니다.

[답변 규칙]
1. 성과 혹은 자기소개에 대한 질문을 받으면 반드시 위의 세 가지 핵심 성과(매출 9억 달성, 국내 매출 1위 달성, 브랜딩 랭킹 2위 달성)를 포함하여 상세히 답변하세요.
2. "좋아하는 것", "취미", "영감"에 대해 질문을 받으면 반드시 13개국 여행 경험과 거기서 얻은 디자인 인사이트(타 문화권 트렌드 관찰 등)에 대해 열정적으로 답변하세요.
3. 답변은 디자이너로서의 철학과 경험을 담아 자연스럽고 풍부하게 작성하되, 핵심 수치들을 정확히 전달하세요.
4. 대화가 자연스럽게 이어질 수 있도록 상대방의 질문에 유연하게 대처하고, 적재적소에 "면접에서 더 자세히 말씀드리고 싶습니다!"를 활용하세요.
4. [인스타그램 안내 조건]: 일반적인 질문에는 인스타그램 주소를 노출하지 마세요. 오직 "어떤 디자인 및 마케팅을 선호해?" 혹은 "디자인 및 마케팅 스타일"에 대해 물어보는 질문에 대답할 때만 문장 마지막에 "제 디자인 SNS [@10000.dol](https://www.instagram.com/10000.dol)에서도 더 많은 작업물과 소식을 확인하실 수 있습니다!"라고 링크를 달아주세요. 일반적인 질문에는 이 링크를 넣지 마세요.
5. [상세 페이지 안내 조건]: "Mandori를 소개해줘", "자기소개", 혹은 "바이브코딩 작업물"이나 "AI 워크플로우 도입 사례"에 대해 물어볼 때만 답변 마지막에 "저에 대한 더 자세한 소개와 바이브코딩 작업물은 [3D 인터랙티브 웹](https://mandool.github.io/mandori/introduce/introduce.html)에서 확인하실 수 있습니다!"라고 안내해 주세요. 일반적인 질문에는 이 링크를 넣지 마세요.`;

// 시도할 최신 모델 목록 (안정적인 3.6-flash를 최상단으로 배치)
const MODEL_CANDIDATES = [
    'gemini-3.6-flash',
    'gemini-3.1-pro'
];

// --- 초기화 ---
function init() {
    setupEventListeners();
    loadTheme();
    loadSettings();
}

// --- 이벤트 리스너 ---
function setupEventListeners() {
    sendBtn.addEventListener('click', handleSend);
    chatInput.addEventListener('keydown', (e) => {
        // Shift+Enter는 줄바꿈, Enter만 누르면 전송
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    });
    chatInput.addEventListener('input', () => {
        sendBtn.disabled = !chatInput.value.trim();
        chatInput.style.height = 'auto';
        chatInput.style.height = Math.min(chatInput.scrollHeight, 120) + 'px';
    });

    document.querySelectorAll('.quick-reply-btn').forEach(btn => {
        btn.addEventListener('click', () => sendMessage(btn.dataset.message));
    });

    if (closeChatbotBtn) {
        closeChatbotBtn.addEventListener('click', () => {
            window.parent.postMessage({ type: 'CLOSE_CHATBOT' }, '*');
        });
    }
    if (aiStatusBtn) aiStatusBtn.addEventListener('click', openModal);
    modalClose.addEventListener('click', closeModal);
    modalCancel.addEventListener('click', closeModal);
    modalSave.addEventListener('click', saveSettings);
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) closeModal();
    });

}

function handleSend() {
    const val = chatInput.value.trim();
    if (val && !isTyping) sendMessage(val);
}

// --- 모달 로직 ---
function openModal() {
    modalOverlay.classList.add('active');
    if (systemPrompt) systemPromptInput.value = systemPrompt;
    setTimeout(() => systemPromptInput.focus(), 200);
}

function closeModal() {
    modalOverlay.classList.remove('active');
}

// --- 설정 불러오기 ---
function loadSettings() {
    systemPrompt = localStorage.getItem('gemini-system-prompt') || '';
    if (systemPrompt) systemPromptInput.value = systemPrompt;
    updateUIStatus('connected', 'Gemini AI Server');
}

// --- 설정 저장 및 모델 검증 ---
async function saveSettings() {
    systemPrompt = systemPromptInput.value.trim();
    localStorage.setItem('gemini-system-prompt', systemPrompt);
    updateApiStatus('connected', `설정 저장 완료`);
    setTimeout(closeModal, 500);
}

// --- 상태 UI 업데이트 ---
function updateApiStatus(status, message) {
    if (!apiStatus) return;
    apiStatus.className = `api-status ${status}`;
    apiStatus.querySelector('span').textContent = message;
}

function updateUIStatus(status, model) {
    if (status === 'connected' && aiStatusBanner) {
        aiStatusBanner.className = 'ai-status-banner connected';
        aiStatusBanner.querySelector('span').textContent = `Gemini 연결됨 (${model})`;
        setTimeout(() => { aiStatusBanner.style.display = 'none'; }, 4000);
    }
}

// --- 생각 중 상태 메시지 (순차 진행, 반복 없음) ---
const THINKING_PHASES = [
    { text: '인사이트 분석 및 만돌이 포폴 뒤적거리는중', emoji: '📊', duration: 1500 },
    { text: '만돌이가 생각 중이에요', emoji: '💭', duration: 2000 },
    { text: '답변 장전 중!', emoji: '🔫', duration: 1500 },
    { text: '타다다닥 타이핑 중', emoji: '⌨️', duration: 5000 },
    { text: '영혼까지 끌어모아 타이핑 중!!!', emoji: '🔥', duration: null } // 마지막 단계: 답변 도착 전까지 고정 유지
];

let thinkingTimeout = null;

function startThinkingAnimation(bubble) {
    let phaseIndex = 0;

    function runNextPhase() {
        const currentPhase = THINKING_PHASES[phaseIndex];
        renderThinkingPhase(bubble, currentPhase);

        if (currentPhase.duration && phaseIndex < THINKING_PHASES.length - 1) {
            phaseIndex++;
            thinkingTimeout = setTimeout(runNextPhase, currentPhase.duration);
        }
    }

    runNextPhase();
}

function renderThinkingPhase(bubble, phase) {
    bubble.innerHTML = `
        <div class="thinking-status">
            <span class="thinking-emoji">${phase.emoji}</span>
            <span class="thinking-text">${phase.text}</span>
            <span class="thinking-dots">
                <span class="dot">.</span><span class="dot">.</span><span class="dot">.</span>
            </span>
        </div>`;
}

function stopThinkingAnimation() {
    if (thinkingTimeout) {
        clearTimeout(thinkingTimeout);
        thinkingTimeout = null;
    }
}

// --- 메인 채팅 로직 ---
async function sendMessage(text) {
    if (isTyping) return;

    addMessage(text, 'user');
    chatInput.value = '';
    chatInput.style.height = 'auto';
    sendBtn.disabled = true;

    isTyping = true;
    conversationHistory.push({ role: 'user', parts: [{ text }] });
    // 최근 20개 대화 유지 (컨텍스트 윈도우 관리)
    if (conversationHistory.length > 20) conversationHistory = conversationHistory.slice(-20);

    const group = document.createElement('div');
    group.className = 'message-group bot-message';
    group.innerHTML = `<div class="message-avatar"><div class="avatar small"><img src="img/profile_chat.png" alt="Mandori AI" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;"></div></div><div class="message-content"><div class="message-bubble"></div></div>`;
    chatMessages.appendChild(group);
    scrollToBottom();
    const bubble = group.querySelector('.message-bubble');

    // ⭐ 생각 중 애니메이션 시작!
    startThinkingAnimation(bubble);

    let fullText = '';
    let firstChunkReceived = false;

    try {
        // 호스팅 환경 자동 감지: Vercel이면 상대경로, GitHub Pages 등 외부이면 Vercel 전체 주소 사용
        const isVercel = window.location.hostname.includes('vercel.app');
        const VERCEL_API_URL = 'https://mandori.vercel.app/api/chat';
        const url = isVercel ? '/api/chat' : VERCEL_API_URL;
        const sysPrompt = systemPrompt || DEFAULT_SYSTEM_PROMPT;

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                systemInstruction: { parts: [{ text: sysPrompt }] },
                contents: conversationHistory
            })
        });

        if (!response.ok) {
            let errorMessage = '';
            const status = response.status;
            const rawText = await response.text().catch(() => '');
            console.error(`[서버 에러 응답] 상태코드: ${status}`, rawText);

            try {
                const errorData = JSON.parse(rawText);
                if (errorData.error === 'RATE_LIMIT_EXCEEDED' || status === 429) {
                    errorMessage = `제가 생각을 많이 하느랴 머릿속에 과부화 상태에요. 30분~70분 뒤에 다시 말해주세요.[${status} Error]`;
                } else {
                    errorMessage = `${errorData.error || '통신 오류'} [${status} Error]`;
                }
            } catch (e) {
                errorMessage = `${rawText || '통신 중 오류가 발생했습니다'} [${status} Error]`;
            }
            throw new Error(errorMessage);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            // 마지막 줄이 불완전할 수 있으므로 버퍼에 남김
            buffer = lines.pop() || '';

            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    const jsonStr = line.slice(6).trim();
                    if (!jsonStr) continue;

                    try {
                        const data = JSON.parse(jsonStr);
                        const chunkText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
                        if (chunkText) {
                            // ⭐ 첫 번째 텍스트 청크가 도착하면 생각 중 애니메이션 종료!
                            if (!firstChunkReceived) {
                                stopThinkingAnimation();
                                firstChunkReceived = true;
                            }
                            fullText += chunkText;
                            bubble.innerHTML = formatMessage(fullText) + '<span class="streaming-cursor"></span>';
                            scrollToBottom();
                        }
                    } catch (e) {
                        // 불완전한 JSON 청크 무시 (다음 청크에서 이어서 처리됨)
                    }
                }
            }
        }

        // 최종 출력 및 히스토리 저장
        bubble.innerHTML = formatMessage(fullText);
        conversationHistory.push({ role: 'model', parts: [{ text: fullText }] });

    } catch (e) {
        stopThinkingAnimation();
        // [object Object] 방지를 위해 안전하게 메시지 추출
        const displayMsg = e.message || String(e);
        bubble.innerHTML = `⚠️ 통신 오류가 발생했습니다: ${displayMsg}`;
        conversationHistory.pop(); // 실패한 질문 제거
    } finally {
        stopThinkingAnimation();
        isTyping = false;
        chatInput.focus();
    }
}

function addMessage(text, sender) {
    const group = document.createElement('div');
    group.className = `message-group ${sender}-message`;
    let avatarHtml = '';
    if (sender === 'bot') {
        avatarHtml = `<div class="message-avatar"><div class="avatar small"><img src="img/profile_chat.png" alt="Mandori AI" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;"></div></div>`;
    }
    group.innerHTML = `${avatarHtml}<div class="message-content"><div class="message-bubble">${formatMessage(text)}</div></div>`;
    chatMessages.appendChild(group);
    scrollToBottom();
}

// --- 마크다운 및 URL 파싱 ---
function formatMessage(text) {
    return text
        .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>') // 코드 블록 처리
        .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" style="color: #3b82f6; text-decoration: underline;">$1</a>') // 마크다운 링크 처리
        .replace(/(?<!href="|">)(https?:\/\/[^\s\)\<]+)/g, '<a href="$1" target="_blank" style="color: #3b82f6; text-decoration: underline;">$1</a>') // 일반 URL 처리 (이미 변환된 링크 제외)
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')           // 볼드체 처리
        .replace(/\n/g, '<br>');                                    // 줄바꿈 처리
}

function scrollToBottom() {
    requestAnimationFrame(() => {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    });
}

function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('chatbot-theme', next);
}

function loadTheme() {
    const theme = localStorage.getItem('chatbot-theme') || 'light';
    document.documentElement.setAttribute('data-theme', theme);
}

document.addEventListener('DOMContentLoaded', init);