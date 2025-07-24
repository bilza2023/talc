// vite.config.js
import path from 'path';
import { defineConfig } from 'vite';
import { sveltekit } from '@sveltejs/kit/vite';

export default defineConfig({
  resolve: {
    
  },
  ssr: {
    noExternal: ['svelte-katex', 'taleem-pivot-player']
  },
  plugins: [sveltekit()]
});
