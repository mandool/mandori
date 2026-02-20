import React, { useEffect, useState } from 'react';
import { useProgress } from '@react-three/drei';

export default function LoadingScreen() {
    const { active, progress } = useProgress();
    const [show, setShow] = useState(true);

    useEffect(() => {
        if (show) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }

        return () => {
            document.body.style.overflow = '';
        };
    }, [show]);

    useEffect(() => {
        if (!active && progress === 100) {
            // 로딩이 완료되면 약간의 지연 후 제거 (부드러운 전환을 위해)
            const timeout = setTimeout(() => setShow(false), 500);
            return () => clearTimeout(timeout);
        }
    }, [active, progress]);

    if (!show) return null;

    return (
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
            zIndex: 9999,
            transition: 'opacity 0.5s ease',
            opacity: active ? 1 : 0,
            pointerEvents: active ? 'all' : 'none',
            color: '#fff',
            fontFamily: 'Pretendard, sans-serif'
        }}>
            <div style={{
                fontSize: '2rem',
                fontWeight: 900,
                marginBottom: '20px',
                letterSpacing: '0.1em'
            }}>
                MANDORI
            </div>
            <div style={{
                width: '200px',
                height: '2px',
                backgroundColor: '#333',
                position: 'relative',
                overflow: 'hidden'
            }}>
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    height: '100%',
                    backgroundColor: '#fff',
                    width: `${progress}%`,
                    transition: 'width 0.3s ease'
                }} />
            </div>
            <div style={{
                marginTop: '10px',
                fontSize: '0.9rem',
                opacity: 0.5
            }}>
                {Math.round(progress)}%
            </div>
        </div>
    );
}
