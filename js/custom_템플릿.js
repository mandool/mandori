   var animationData = /*파일/*;
    var params = {
        // container: document.getElementById('lottie'),
        container: document.querySelector('#lottie'),
        loop: true,
        autoplay: true,
        animationData: animationData
    };

    var anim;

    anim = lottie.loadAnimation(params);

    // 부모 요소 크기를 동적으로 설정
    function resizeLottie() {
        const lottieContainer = document.querySelector('#lottie');
        const parentContainer = document.querySelector('.parent');
    
        if (lottieContainer && parentContainer) {
            const parentWidth = parentContainer.clientWidth;
            const parentHeight = parentContainer.clientHeight;
    
            lottieContainer.style.width = `${parentWidth}px`;
            lottieContainer.style.height = `${parentHeight}px`;
        } else {
            console.error("Lottie 컨테이너나 부모 요소를 찾을 수 없습니다.");
        }
    }
    
    // 초기 크기 설정 및 윈도우 리사이즈 이벤트 연결
    resizeLottie();
    window.addEventListener('resize', resizeLottie);