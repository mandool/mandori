    var params = {
        // container: document.getElementById('lottie'),
        container: document.querySelector('#lottie'),
        renderer: 'canvas',
        loop: true,
        autoplay: true,
        animationData: animationData
    };

    var anim;

    anim = lottie.loadAnimation(params);