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
});
