import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Charge les variables d'environnement depuis .env ou Render
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    server: {
      port: 3000,
      host: '0.0.0.0', // permet l'accès depuis Render
    },
    define: {
      // API key si nécessaire pour d'autres services
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      // URL du backend
      'process.env.VITE_API_URL': JSON.stringify(env.VITE_API_URL),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'), // alias pratique pour importer depuis src
      },
    },
    build: {
      outDir: 'dist', // dossier de build
      sourcemap: true, // utile pour debugging
    },
    css: {
      postcss: {
        plugins: [
          require('tailwindcss'),
          require('autoprefixer'),
        ],
      },
    },
  };
});
