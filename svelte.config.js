import adapter from '@sveltejs/adapter-vercel';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://svelte.dev/docs/kit/integrations
	// for more information about preprocessors
	preprocess: vitePreprocess(),

	kit: {
		// See https://svelte.dev/docs/kit/adapter-vercel for more information about the Vercel adapter
		adapter: adapter({
			// Use Node.js serverless functions for API routes
			runtime: 'nodejs22.x'
		})
	}
};

export default config;
