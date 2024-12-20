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
      include: ['src/**/*.js'],
      exclude: ['node_modules', 'test', 'src/seeding', 'src/media', 'src/libs', 'src/routes', 'src/index.js', 'src/server.js', 'src/config'], // File yang diabaikan
      all: true,
    },
  }
});
