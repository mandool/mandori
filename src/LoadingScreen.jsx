import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useProgress } from '@react-three/drei';

export default function LoadingScreen() {
    const { active, progress } = useProgress();
    const [show, setShow] = useState(true);
    const [revealed, setRevealed] = useState(false); // 마스크(구멍) 확장 시작 상태

    // 사용자 요청에 따라 로딩 중 스크롤 잠금 로직이 제거되었습니다.
    useEffect(() => {
        return () => { };
    }, []);

    useEffect(() => {
        if (!active && progress === 100) {
            // 로딩 100% 도달 후 요소들이 먼저 페이드 아웃될 시간을 줌
            const maskTimeout = setTimeout(() => {
                setRevealed(true);
                // 마스크 확장 애니메이션 완료 후 컴포넌트 완전히 제거
                const exitTimeout = setTimeout(() => setShow(false), 1000);
                return () => clearTimeout(exitTimeout);
            }, 800);
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
            zIndex: 999999,
            pointerEvents: revealed ? 'none' : 'all',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden'
        }}>
            {/* 시네마틱 Hole Punch 마스크 레이어 */}
            <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: revealed ? '250vmax' : '0px',
                height: revealed ? '250vmax' : '0px',
                borderRadius: '50%',
                backgroundColor: 'transparent',
                boxShadow: '0 0 0 250vmax #ffffff',
                transition: `width 1.2s ${easeInQuart}, height 1.2s ${easeInQuart}`,
                zIndex: -1
            }} />

            {/* 로딩 컨텐츠 (디자인 시안 반영) */}
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: revealed ? 0 : 1,
                transition: 'opacity 0.4s ease',
                color: '#19181d',
                fontFamily: 'Archivo, sans-serif'
            }}>
                <div style={{
                    fontSize: '2.8rem', // 시안에 맞춰 약간 확대
                    fontWeight: 800, // Archivo Extra Bold
                    marginBottom: '20px',
                    letterSpacing: '0.05em', // 시안은 자간이 좁은 편
                    textAlign: 'center'
                }}>
                    LOADING..
                </div>
                <div style={{
                    width: '320px', // 바 너비 약간 확대
                    height: '3px', // 조금 더 얇게
                    backgroundColor: 'rgba(25, 24, 29, 0.1)',
                    position: 'relative',
                    borderRadius: '0px', // 직각 형태
                    overflow: 'hidden',
                }}>
                    <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        height: '100%',
                        backgroundColor: '#19181d',
                        width: `${progress}%`,
                        transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                        borderRadius: '0px',
                    }} />
                </div>
                <div style={{
                    marginTop: '20px',
                    fontSize: '1.2rem',
                    fontWeight: 600, // Archivo Semi Bold
                }}>
                    {Math.round(progress)}%
                </div>
            </div>
        </div>,
        document.body
    );
}
