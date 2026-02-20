import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useProgress } from '@react-three/drei';

export default function LoadingScreen() {
    const { active, progress } = useProgress();
    const [show, setShow] = useState(true);

    useEffect(() => {
        const preventDefault = (e) => {
            if (show) {
                e.preventDefault();
            }
        };

        if (show) {
            // CSS 잠금
            document.body.style.overflow = 'hidden';
            document.documentElement.style.overflow = 'hidden';
            document.body.style.height = '100%';
            document.documentElement.style.height = '100%';

            // 이벤트 잠금 (더 강력한 조치)
            window.addEventListener('wheel', preventDefault, { passive: false });
            window.addEventListener('touchmove', preventDefault, { passive: false });
        } else {
            // 해제
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
            const timeout = setTimeout(() => setShow(false), 800); // 넉넉하게 0.8초 대기
            return () => clearTimeout(timeout);
        }
    }, [active, progress]);

    if (!show) return null;

    // React Portal을 사용하여 #root를 탈출하고 document.body 바로 아래에 렌더링 (최상단 노출 보장)
    return createPortal(
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: '#000',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 999999, // 압도적인 숫자로 최상단 보장
            transition: 'opacity 0.6s ease',
            opacity: (!active && progress === 100) ? 0 : 1,
            pointerEvents: show ? 'all' : 'none',
            color: '#fff',
            fontFamily: 'Archivo, sans-serif'
        }}>
            <div style={{
                fontSize: '2.5rem',
                fontWeight: 900,
                marginBottom: '30px',
                letterSpacing: '0.2em',
                fontStyle: 'italic'
            }}>
                Loading..
            </div>
            <div style={{
                width: '260px',
                height: '4px',
                backgroundColor: 'rgba(255,255,255,0.1)',
                position: 'relative',
                borderRadius: '10px',
                overflow: 'hidden'
            }}>
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    height: '100%',
                    backgroundColor: '#ffd936',
                    width: `${progress}%`,
                    transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    boxShadow: '0 0 15px rgba(255, 217, 54, 0.5)'
                }} />
            </div>
            <div style={{
                marginTop: '15px',
                fontSize: '1rem',
                fontWeight: 600,
                color: '#ffd936'
            }}>
                {Math.round(progress)}%
            </div>
        </div>,
        document.body
    );
}
