import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useProgress } from '@react-three/drei';

export default function LoadingScreen() {
    const { active, progress } = useProgress();
    const [show, setShow] = useState(true);
    const [revealed, setRevealed] = useState(false); // 마스크(구멍) 확장 시작 상태

    // [변경] 사용자 요청에 따라 로딩 중 스크롤 잠금 로직을 모두 제거했습니다.
    useEffect(() => {
        // 이전의 overflow: hidden 및 이벤트 차단 로직이 삭제되었습니다.
        return () => {
            // 이 컴포넌트가 마운트/언마운트 되어도 스크롤 상태에 영향을 주지 않습니다.
        };
    }, []);

    useEffect(() => {
        if (!active && progress === 100) {
            // 로딩 100% 도달 후 요소들이 먼저 페이드 아웃될 시간을 줌 (0.6초)
            const maskTimeout = setTimeout(() => {
                setRevealed(true);
                // 마스크 확장 애니메이션(1.0초) 완료 후 컴포넌트 완전히 제거
                const exitTimeout = setTimeout(() => setShow(false), 1000);
                return () => clearTimeout(exitTimeout);
            }, 600);
            return () => clearTimeout(maskTimeout);
        }
    }, [active, progress]);

    if (!show) return null;

    // 가속도(Ease-in)를 위한 베지어 곡선 - 묵직하게 시작해서 확 터지는 느낌
    const easeInQuart = 'cubic-bezier(0.895, 0.03, 0.685, 0.22)';

    return createPortal(
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 999999,
            pointerEvents: revealed ? 'none' : 'all', // 구멍이 뚫리기 시작하면 클릭 등이 아래 레이어로 전달되게 함
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden'
        }}>
            {/* [핵심] 시네마틱 Hole Punch 마스크 레이어 */}
            <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: revealed ? '250vmax' : '0px',
                height: revealed ? '250vmax' : '0px',
                borderRadius: '50%',
                backgroundColor: 'transparent',
                // 매우 거대한 흰색 그림자를 사용하여 구멍을 제외한 나머지 영역을 덮음
                boxShadow: '0 0 0 250vmax #ffffff',
                transition: `width 1s ${easeInQuart}, height 1s ${easeInQuart}`,
                zIndex: -1
            }} />

            {/* 로딩 컨텐츠 (텍스트 및 바) */}
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
                    fontSize: '2.5rem',
                    fontWeight: 900,
                    marginBottom: '30px',
                    letterSpacing: '0.2em',
                    fontStyle: 'italic',
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
                }}>
                    {Math.round(progress)}%
                </div>
            </div>
        </div>,
        document.body
    );
}
