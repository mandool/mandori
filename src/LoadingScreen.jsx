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
            // 로딩 100% 도달 후 0.5초 대기했다가 마스크 애니메이션 시작
            const maskTimeout = setTimeout(() => {
                setRevealed(true);
                // 마스크 애니메이션(1.2초) 완료 후 완전히 제거
                const exitTimeout = setTimeout(() => setShow(false), 1200);
                return () => clearTimeout(exitTimeout);
            }, 500);
            return () => clearTimeout(maskTimeout);
        }
    }, [active, progress]);

    if (!show) return null;

    return createPortal(
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: '#ffffff', // 배경색 흰색으로 변경
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 999999,
            transition: 'clip-path 1.2s cubic-bezier(0.85, 0, 0.15, 1)', // 시네마틱 원형 마스크 전환
            clipPath: revealed ? 'circle(0% at 50% 50%)' : 'circle(150% at 50% 50%)', // 커지면서 사라지는 구멍 연출
            pointerEvents: show ? 'all' : 'none',
            color: '#19181d', // 텍스트 컬러 변경
            fontFamily: 'Archivo, sans-serif'
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
                backgroundColor: 'rgba(25, 24, 29, 0.1)', // 진회색 기반 배경 바
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
                    backgroundColor: '#19181d', // 프로그레스 바 컬러 변경
                    width: `${progress}%`,
                    transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                }} />
            </div>
            <div style={{
                marginTop: '15px',
                fontSize: '1rem',
                fontWeight: 600,
                color: '#19181d', // 퍼센트 수치 컬러 변경
                opacity: revealed ? 0 : 1,
                transition: 'opacity 0.4s ease'
            }}>
                {Math.round(progress)}%
            </div>
        </div>,
        document.body
    );
}
