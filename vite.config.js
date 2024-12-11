// vite.config.js
import { defineConfig } from 'vite';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    watch: false,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/**/*.js'], // File yang ingin diukur coverage-nya
      exclude: ['node_modules', 'test'], // File yang diabaikan
      all: true, // Mengukur coverage untuk semua file, bahkan yang tidak diuji
    },
  }
});
