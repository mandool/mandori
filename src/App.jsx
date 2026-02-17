import React, { Suspense, useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { useGLTF, Environment, ContactShadows, Float, PresentationControls } from '@react-three/drei';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

function Model({ url }) {
    const { scene } = useGLTF(url);
    const gsapGroupRef = useRef();

    useEffect(() => {
        if (gsapGroupRef.current) {
            // 초기 회전 설정 (정면 응시)
            gsapGroupRef.current.rotation.set(0, 0, 0);
            gsapGroupRef.current.position.y = -0.8; // 텍스트 아래 적절한 위치로 하향 조정

            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: '#hero',
                    start: 'top top',
                    end: 'bottom top',
                    scrub: 0.5, // 지연 시간을 줄여 응답성 강화
                    fastScrollEnd: true, // 빠른 스크롤 시 즉시 최종 상태로 렌더링
                }
            });

            tl.to(gsapGroupRef.current.rotation, {
                x: Math.PI,
                y: 0,
                ease: 'none',
            });

            // 가시성 및 위치 조절: 실제 개별 .card 영역 도달 시 숨김 (타이밍 극대화)
            gsap.to(gsapGroupRef.current.position, {
                y: -20,
                scrollTrigger: {
                    trigger: '.card',
                    start: 'top 80%',
                    end: 'top center',
                    scrub: 0.5, // 동일하게 응답성 강화
                    fastScrollEnd: true,
                    immediateRender: false,
                }
            });
        }
    }, []);

    return (
        <group ref={gsapGroupRef}>
            <primitive object={scene} scale={2.2} position={[0, 0, 0]} />
        </group>
    );
}

function Scene({ interactionEnabled }) {
    return (
        <>
            <ambientLight intensity={0.5} />
            <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} />
            <pointLight position={[-10, -10, -10]} intensity={0.5} />
            <Suspense fallback={null}>
                <PresentationControls
                    enabled={interactionEnabled} // 인터랙션 활성화 여부 제어
                    global={true}
                    cursor={interactionEnabled} // 커서 표시 여부 제어
                    snap={true}
                    speed={2}
                    zoom={1}
                    rotation={[0, 0, 0]}
                    polar={[-Math.PI / 4, Math.PI / 4]}
                    azimuth={[-Math.PI / 2, Math.PI / 2]}
                    config={{ mass: 2, tension: 400 }}
                >
                    <Float
                        speed={2.6} // 기존 2에서 1.3배 증속
                        rotationIntensity={2} // 회전 흔들림 강화
                        floatIntensity={2} // 유영 높이 강화
                        floatingRange={[-0.5, 0.5]} // 이동 범위 확대
                    >
                        <Model url={`${import.meta.env.BASE_URL}Web_catparobpha.glb`} />
                    </Float>
                </PresentationControls>
                <ContactShadows position={[0, -2.5, 0]} opacity={0.4} scale={10} blur={2} far={4.5} />
                <Environment preset="city" />
            </Suspense>
        </>
    );
}

import LoadingScreen from './LoadingScreen';

export default function App() {
    const [interactionEnabled, setInteractionEnabled] = React.useState(true);

    useEffect(() => {
        // 첫 번째 .card가 보이기 시작하면 캐릭터 인터랙션 비활성화
        ScrollTrigger.create({
            trigger: '.card',
            start: 'top 80%',
            onEnter: () => setInteractionEnabled(false),
            onLeaveBack: () => setInteractionEnabled(true)
        });
    }, []);

    return (
        <>
            <LoadingScreen />
            <Canvas
                shadows
                camera={{ position: [0, 0, 5], fov: 45 }}
                eventSource={document.body} // body 전체를 이벤트 소스로 활용
                style={{ pointerEvents: 'auto', position: 'fixed', top: 0, left: 0 }}
            >
                <Scene interactionEnabled={interactionEnabled} />
            </Canvas>
        </>
    );
}
