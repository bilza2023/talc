// vite.config.js
/// <reference types="vitest" />
import path from 'path';
import { defineConfig } from 'vite';
import { sveltekit } from '@sveltejs/kit/vite';

export default defineConfig({
  resolve: {
    // add aliases here if you use them
    alias: {
      $lib: path.resolve('./src/lib')
    }
  },
  ssr: {
    noExternal: ['svelte-katex', 'taleem-pivot-player']
  },
  plugins: [sveltekit()],
  // Vitest v3 config — run tests single-threaded, no cross-file concurrency
  test: {
    sequence: { concurrent: false },           // do NOT run files concurrently
    pool: 'threads',                           // worker pool type
    poolOptions: { threads: { singleThread: true } }, // one worker only
    testTimeout: 20000
  }
});
