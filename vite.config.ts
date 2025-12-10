import { defineConfig, loadEnv } from 'vite';
import { resolve } from 'path';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '');

    // Check if building for demo or library
    const isDemo = mode === 'demo' || env.BUILD_DEMO === 'true';

    if (isDemo) {
        // Demo build - outputs a full website for testing
        return {
            build: {
                outDir: 'dist-demo',
            },
            define: {
                __CONVEX_URL__: JSON.stringify(env.CONVEX_URL || ''),
            },
        };
    }

    // Library build - outputs tour.js for embedding
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
