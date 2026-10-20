import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  test: {
    environment: 'happy-dom',
    include: ['tests/**/*.test.ts'],
    alias: {
      'astro:content': path.resolve(__dirname, 'tests/__mocks__/astro-content.ts'),
      'astro/loaders': path.resolve(__dirname, 'tests/__mocks__/astro-loaders.ts'),
      'astro:middleware': path.resolve(__dirname, 'tests/__mocks__/astro-middleware.ts'),
    },
  },
});
