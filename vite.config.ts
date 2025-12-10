import { defineConfig, loadEnv } from 'vite';
import { resolve } from 'path';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '');

    return {
        build: {
            lib: {
                entry: resolve(__dirname, 'src/main.ts'),
                name: 'WalkmanJS',
                fileName: 'tour',
                formats: ['iife'],
            },
            rollupOptions: {
                output: {
                    inlineDynamicImports: true,
                },
            },
            minify: 'esbuild',
        },
        define: {
            __CONVEX_URL__: JSON.stringify(env.CONVEX_URL || ''),
        },
    };
});
