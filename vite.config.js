import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
    plugins: [react()],
    base: '/mandori/',
    build: {
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'index.html'),
                introduce: resolve(__dirname, 'introduce/introduce.html'),
                project: resolve(__dirname, 'project/project.html'),
                vidiograpgy: resolve(__dirname, 'Vidiograpgy/Vidiograpgy.html'),
                // page 폴더 내의 상세 페이지들을 빌드 타겟에 추가
                page1: resolve(__dirname, 'page/page1.html'),
                page2: resolve(__dirname, 'page/page2.html'),
                page3: resolve(__dirname, 'page/page3.html'),
                page4: resolve(__dirname, 'page/page4.html'),
                page5: resolve(__dirname, 'page/page5.html'),
                page6: resolve(__dirname, 'page/page6.html'),
                page7: resolve(__dirname, 'page/page7.html'),
                page8: resolve(__dirname, 'page/page8.html'),
                page9: resolve(__dirname, 'page/page9.html'),
                page10: resolve(__dirname, 'page/page10.html'),
                page11: resolve(__dirname, 'page/page11.html'),
                page12: resolve(__dirname, 'page/page12.html'),
                page13: resolve(__dirname, 'page/page13.html'),
                page14: resolve(__dirname, 'page/page14.html'),
                page15: resolve(__dirname, 'page/page15.html'),
                page16: resolve(__dirname, 'page/page16.html'),
                page17: resolve(__dirname, 'page/page17.html'),
                page18: resolve(__dirname, 'page/page18.html'),
                pageV1: resolve(__dirname, 'page/pageV1.html'),
                pageV2: resolve(__dirname, 'page/pageV2.html'),
                pageV3: resolve(__dirname, 'page/pageV3.html'),
                pageV4: resolve(__dirname, 'page/pageV4.html'),
            }
        }
    }
});
