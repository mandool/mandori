document.addEventListener('DOMContentLoaded', () => {
    console.log('Navigation scroll script loaded');
    const nav = document.querySelector('nav');
    
    if (nav) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                nav.classList.add('scrolled');
            } else {
                nav.classList.remove('scrolled');
            }
        });
    } else {
        console.error('Navigation element not found');
    }

    // 모바일 메뉴 링크 클릭 시 메뉴 닫기 기능 추가
    const navBtn = document.querySelector('.menu-btn');
    const navList = document.querySelector('.nav-list');

    if (navBtn && navList) {
        const navLinks = navList.querySelectorAll('a');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                // 메뉴가 열려있을 때만 닫기 동작 수행
                if (navList.classList.contains('active')) {
                    navList.classList.remove('active');
                    navBtn.classList.remove('active');
                    navBtn.src = "/mandori/menu-01.svg";
                }
            });
        });
    }
});
