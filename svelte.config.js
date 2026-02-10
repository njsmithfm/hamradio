// src/svelte.config.js
import adapter from '@sveltejs/adapter-static';
import preprocess from 'svelte-preprocess';

export default {
  preprocess,
  kit: {
    adapter: adapter({
      pages: 'build',      // output folder
      assets: 'build',
      // Uncomment ONE of the following, depending on your routing style:
      // fallback: '200.html',   // SPA fallback (single‑page app)
      strict: true            // keep strict for full prerender (default)
    })
  }
};