import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
	plugins: [sveltekit()],
	server: {
		// Add any extra directories you want Vite to serve statically
		fs: {
			// Allow the entire project root plus the folder you need
			allow: [
				// default allowed paths (you can keep them)
				'..', // project root
				// add your custom folder – adjust the absolute path as needed
				path.resolve(__dirname, 'static/LCARSassets')
			]
		}
	}
});
