import adapter from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/**
 * Port map:
 * 3000 → taleem website
 * 4000 → admin app
 * 5000 → API (sqlite)
 * 8000 → local-first slide editor (this project)
 */

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: adapter({
			out: 'build',
			precompress: false,
			env: {
				host: '0.0.0.0',
				port: 8000          // ← changed from 3000 to 8000
			}
		})
	},
	preprocess: vitePreprocess()
};

export default config;
