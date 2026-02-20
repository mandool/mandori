import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useProgress } from '@react-three/drei';

export default function LoadingScreen() {
    const { active, progress } = useProgress();
    const [show, setShow] = useState(true);
    const [revealed, setRevealed] = useState(false); // 마스크 애니메이션 시작 상태

    useEffect(() => {
        const preventDefault = (e) => {
            if (show) {
                e.preventDefault();
            }
        };

        if (show) {
            document.body.style.overflow = 'hidden';
            document.documentElement.style.overflow = 'hidden';
            document.body.style.height = '100%';
            document.documentElement.style.height = '100%';
            window.addEventListener('wheel', preventDefault, { passive: false });
            window.addEventListener('touchmove', preventDefault, { passive: false });
        } else {
            document.body.style.overflow = '';
            document.documentElement.style.overflow = '';
            document.body.style.height = '';
            document.documentElement.style.height = '';
            window.removeEventListener('wheel', preventDefault);
            window.removeEventListener('touchmove', preventDefault);
        }

        return () => {
            document.body.style.overflow = '';
            document.documentElement.style.overflow = '';
            document.body.style.height = '';
            document.documentElement.style.height = '';
            window.removeEventListener('wheel', preventDefault);
            window.removeEventListener('touchmove', preventDefault);
        };
    }, [show]);

    useEffect(() => {
        if (!active && progress === 100) {
            // 로딩 100% 도달 후 요소들이 먼저 페이드 아웃될 시간을 줌 (0.5초)
            const maskTimeout = setTimeout(() => {
                setRevealed(true);
                // 마스크 애니메이션(1.0초) 완료 후 완전히 제거
                const exitTimeout = setTimeout(() => setShow(false), 1000);
                return () => clearTimeout(exitTimeout);
            }, 600);
            return () => clearTimeout(maskTimeout);
        }
    }, [active, progress]);

    if (!show) return null;

    // 가속도(Ease-in)를 위한 베지어 곡선
    const easeInQuart = 'cubic-bezier(0.895, 0.03, 0.685, 0.22)';

    return createPortal(
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: '#ffffff',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 999999,
            // 텍스트/바가 사라지는 동안은 배경 유지, 그 후 마스크 반경을 키워서 투명 구멍 생성
            transition: `mask-image 1s ${easeInQuart}, -webkit-mask-image 1s ${easeInQuart}`,
            WebkitMaskImage: revealed
                ? 'radial-gradient(circle at 50% 50%, transparent 100%, black 100%)'
                : 'radial-gradient(circle at 50% 50%, transparent 0%, black 0%)',
            maskImage: revealed
                ? 'radial-gradient(circle at 50% 50%, transparent 100%, black 100%)'
                : 'radial-gradient(circle at 50% 50%, transparent 0%, black 0%)',
            WebkitMaskSize: '100% 100%',
            maskSize: '100% 100%',
            color: '#19181d',
            fontFamily: 'Archivo, sans-serif',
            pointerEvents: 'all'
        }}>
            <div style={{
                fontSize: '2.5rem',
                fontWeight: 900,
                marginBottom: '30px',
                letterSpacing: '0.2em',
                fontStyle: 'italic',
                opacity: revealed ? 0 : 1,
                transition: 'opacity 0.4s ease'
            }}>
                Loading..
            </div>
            <div style={{
                width: '260px',
                height: '4px',
                backgroundColor: 'rgba(25, 24, 29, 0.1)',
                position: 'relative',
                borderRadius: '10px',
                overflow: 'hidden',
                opacity: revealed ? 0 : 1,
                transition: 'opacity 0.4s ease'
            }}>
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    height: '100%',
                    backgroundColor: '#19181d',
                    width: `${progress}%`,
                    transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                }} />
            </div>
            <div style={{
                marginTop: '15px',
                fontSize: '1rem',
                fontWeight: 600,
                color: '#19181d',
                opacity: revealed ? 0 : 1,
                transition: 'opacity 0.4s ease'
            }}>
                {Math.round(progress)}%
            </div>
        </div>,
        document.body
    );
}
