(function() {
    // 현재 스크립트의 경로를 찾아 baseUrl 계산
    const scripts = document.getElementsByTagName('script');
    let scriptUrl = '';
    for (let i = 0; i < scripts.length; i++) {
        if (scripts[i].src && scripts[i].src.includes('cb_widget.js')) {
            scriptUrl = scripts[i].src;
            break;
        }
    }
    
    const jsIndex = scriptUrl.indexOf('/js/cb_widget.js');
    const baseUrl = jsIndex >= 0 ? scriptUrl.substring(0, jsIndex) : '.';

    const iconUrl = baseUrl + '/img/cpai_icon.png';
    const iframeUrl = baseUrl + '/chatbot/cb_index.html';

    // 위젯 CSS 삽입
    const styleString = `
        #cpai-widget-container {
            position: fixed;
            bottom: 30px;
            right: 30px;
            z-index: 99999;
            display: flex;
            flex-direction: column;
            align-items: flex-end;
            font-family: sans-serif;
            pointer-events: none;
        }

        #cpai-button {
            width: 65px;
            height: 65px;
            border-radius: 50%;
            cursor: pointer;
            box-shadow: 0 4px 20px rgba(9, 160, 170, 0.15); /* #09A0AA 15% opacity */
            transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            pointer-events: auto;
            border: none;
            background: #ffffff; /* 원 fill #ffffff */
            padding: 14px; /* 아이콘 크기 줄임 효과 */
            box-sizing: border-box;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
        }
        
        #cpai-button:hover {
            transform: scale(1.1);
        }

        #cpai-button img {
            width: 100%;
            height: 100%;
            object-fit: contain;
        }

        /* 챗봇이 열렸을 때 버튼 숨기기 */
        #cpai-widget-container.is-open #cpai-button {
            display: none;
        }

        #cpai-iframe-container {
            position: absolute;
            bottom: 80px; /* 기본 위치: 버튼 위 */
            right: 0;
            width: 420px;
            height: 650px;
            max-height: calc(100vh - 120px);
            background: white;
            border-radius: 20px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.15);
            overflow: hidden;
            opacity: 0;
            visibility: hidden;
            transform: translateY(20px) scale(0.95);
            transform-origin: bottom right;
            transition: all 0.3s cubic-bezier(0.19, 1, 0.22, 1);
            pointer-events: auto;
        }

        /* 챗봇이 열렸을 때 위치를 버튼 자리(하단)로 내리기 */
        #cpai-widget-container.is-open #cpai-iframe-container {
            bottom: 0;
        }

        #cpai-iframe-container.active {
            opacity: 1;
            visibility: visible;
            transform: translateY(0) scale(1);
        }

        #cpai-iframe {
            width: 100%;
            height: 100%;
            border: none;
        }

        @media screen and (max-width: 480px) {
            #cpai-widget-container {
                bottom: 20px;
                right: 20px;
            }
            #cpai-button {
                width: 52px;
                height: 52px;
                padding: 11px;
            }
            #cpai-iframe-container {
                position: fixed;
                bottom: 0;
                right: 0;
                left: 0;
                top: 0;
                width: 100%;
                height: 100dvh;
                max-height: none;
                border-radius: 0;
                z-index: 100000;
            }
        }
    `;

    const styleElement = document.createElement('style');
    styleElement.innerHTML = styleString;
    document.head.appendChild(styleElement);

    // 위젯 DOM 생성
    const widgetContainer = document.createElement('div');
    widgetContainer.id = 'cpai-widget-container';

    // Iframe 컨테이너
    const iframeContainer = document.createElement('div');
    iframeContainer.id = 'cpai-iframe-container';
    
    const iframe = document.createElement('iframe');
    iframe.id = 'cpai-iframe';
    iframe.src = iframeUrl;
    iframe.allow = "microphone;";
    iframeContainer.appendChild(iframe);

    // 플로팅 버튼
    const button = document.createElement('button');
    button.id = 'cpai-button';
    button.setAttribute('aria-label', 'AI 챗봇 열기');
    
    const buttonImg = document.createElement('img');
    buttonImg.src = iconUrl;
    buttonImg.alt = 'AI Chatbot Icon';
    button.appendChild(buttonImg);

    // DOM 트리에 추가
    widgetContainer.appendChild(iframeContainer);
    widgetContainer.appendChild(button);
    document.body.appendChild(widgetContainer);

    // 이벤트 리스너
    button.addEventListener('click', () => {
        const isActive = iframeContainer.classList.contains('active');
        if (isActive) {
            closeChatbot();
        } else {
            openChatbot();
        }
    });

    function openChatbot() {
        iframeContainer.classList.add('active');
        widgetContainer.classList.add('is-open');
    }

    function closeChatbot() {
        iframeContainer.classList.remove('active');
        widgetContainer.classList.remove('is-open');
    }

    // iframe 내부에서 닫기 요청 수신
    window.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'CLOSE_CHATBOT') {
            closeChatbot();
        }
    });
})();
