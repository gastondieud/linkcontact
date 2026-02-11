import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Charger les variables d'environnement depuis le fichier .env
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    server: {
      port: 3000,
      host: '0.0.0.0', // obligatoire pour Render
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    define: {
      // Les variables d'environnement accessibles dans le code frontend
      'process.env': {
        VITE_API_URL: JSON.stringify(env.VITE_API_URL),
        GEMINI_API_KEY: JSON.stringify(env.GEMINI_API_KEY),
      },
    },
    build: {
      outDir: 'dist', // dossier de build
      sourcemap: false,
      rollupOptions: {
        output: {
          // Eviter les gros chunks
          manualChunks(id) {
            if (id.includes('node_modules')) {
              return 'vendor';
            }
          },
        },
      },
    },
    css: {
      postcss: path.resolve(__dirname, './postcss.config.js'), // si tu as postcss + tailwind
    },
  };
});
