/**
 * nav.js - 네비게이션 스크롤 효과 및 모바일 햄버거 메뉴 관리 스크립트
 */

// SVG 인라인 Data URI (외부 파일 경로 문제 발생 시 100% 안전하게 작동하는 백업 아이콘)
// menu-01.svg (햄버거 메뉴 아이콘: 가로선 3줄)
const MENU_SVG = 'data:image/svg+xml;utf8,<svg id="Layer_1" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 28"><defs><style>.cls-1{fill:%23fff;}</style></defs><rect class="cls-1" x="0.24" y="4.47" width="23.3" height="2"/><rect class="cls-1" x="6.3" y="13" width="17.23" height="2"/><rect class="cls-1" x="0.24" y="21.53" width="23.3" height="2"/></svg>';

// menu-x-01.svg (닫기 아이콘: X 모양)
const CLOSE_SVG = 'data:image/svg+xml;utf8,<svg id="Layer_1" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 28"><defs><style>.cls-1{fill:%23fff;}</style></defs><rect class="cls-1" x="11" y="2.94" width="2" height="23.3" transform="translate(-6.8 12.76) rotate(-45)"/><rect class="cls-1" x="0.35" y="13.59" width="23.3" height="2" transform="translate(-6.8 12.76) rotate(-45)"/></svg>';

const initNav = () => {
    if (window.__navInitialized) return;
    window.__navInitialized = true;

    const nav = document.querySelector('nav');

    // 메인 배경 영상 반응형(PC / 모바일) 전환 관리
    const bgVideo = document.getElementById('bg-video');
    if (bgVideo) {
        const mobileSource = bgVideo.querySelector('source[media]');
        const defaultSource = bgVideo.querySelector('source:not([media])');
        if (mobileSource && defaultSource) {
            const mobileQuery = window.matchMedia('(max-width: 768px)');
            const updateVideoSource = (e) => {
                const targetSrc = e.matches ? mobileSource.getAttribute('src') : defaultSource.getAttribute('src');
                if (targetSrc && bgVideo.getAttribute('src') !== targetSrc) {
                    bgVideo.setAttribute('src', targetSrc);
                    bgVideo.load();
                    bgVideo.play().catch(() => {});
                }
            };
            updateVideoSource(mobileQuery);
            mobileQuery.addEventListener('change', updateVideoSource);
        }
    }

    // 스크롤 시 nav 배경 변경
    if (nav) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                nav.classList.add('scrolled');
            } else {
                nav.classList.remove('scrolled');
            }
        });
    }

    // 모바일 햄버거 메뉴 및 드롭다운 관리
    const navBtn = document.querySelector('.menu-btn');
    const navList = document.querySelector('.nav-list');

    if (navBtn && navList) {
        // 중복 초기화 방지
        if (navBtn.dataset.navInitialized === 'true') return;
        navBtn.dataset.navInitialized = 'true';

        // 초기 아이콘을 안전한 인라인 SVG로 보장 (경로 오류/깨짐 원천 방지)
        navBtn.src = MENU_SVG;

        // 이미지 로드 에러(404 등) 발생 시 인라인 Data URI로 자동 즉시 복구
        navBtn.addEventListener('error', () => {
            const isOpen = navList.classList.contains('active');
            navBtn.src = isOpen ? CLOSE_SVG : MENU_SVG;
        });

        const setMenuState = (isOpen) => {
            navList.classList.toggle('active', isOpen);
            navBtn.classList.toggle('active', isOpen);
            // isOpen이 true이면 닫기 아이콘(X), false이면 햄버거 아이콘(3줄)
            navBtn.src = isOpen ? CLOSE_SVG : MENU_SVG;
        };

        // 햄버거 버튼 클릭 이벤트
        navBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = !navList.classList.contains('active');
            setMenuState(isOpen);
        });

        // 모바일 메뉴 링크 클릭 시 메뉴 닫기
        const navLinks = navList.querySelectorAll('a');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (navList.classList.contains('active')) {
                    setMenuState(false);
                }
            });
        });

        // 메뉴 바깥 영역 클릭 시 메뉴 닫기
        document.addEventListener('click', (e) => {
            if (navList.classList.contains('active') && !navList.contains(e.target) && e.target !== navBtn) {
                setMenuState(false);
            }
        });

        // ESC 키 입력 시 메뉴 닫기
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && navList.classList.contains('active')) {
                setMenuState(false);
            }
        });
    }
};

// DOM 로드 완료 시 초기화 (이미 로드된 경우 즉시 실행)
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initNav);
} else {
    initNav();
}
