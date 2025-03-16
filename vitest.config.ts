import { defineConfig } from 'vitest/config';


export default defineConfig({
  plugins: [
  ],
  resolve: {
  },
  test: {
    cache: false,
    environment: 'node',
    include: ['./src/**/*.test.ts'],
    isolate: false,
    mockReset: true,
    pool: 'forks',
    poolOptions: {
      forks: {
        maxForks: 10,
        minForks: 1,
      },
    },
    reporters: ['verbose'],
    testTimeout: 120_000,
  },
});
