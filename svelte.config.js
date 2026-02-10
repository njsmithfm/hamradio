// svelte.config.js
import adapter from '@sveltejs/adapter-cloudflare';
import preprocess from 'svelte-preprocess';   // <-- the only preprocess import you need

/** @type {import('@sveltejs/kit').Config} */
const config = {
  // -----------------------------------------------------------------
  // 1️⃣ Preprocess (optional – keep if you use SCSS, PostCSS, etc.)
  // -----------------------------------------------------------------
  preprocess: preprocess(),   // you can pass options here if you like

  // -----------------------------------------------------------------
  // 2️⃣ Kit configuration
  // -----------------------------------------------------------------
  kit: {
    // Cloudflare adapter – **fallback** creates a static index.html
    // that Pages can serve directly. All other routes go to the Worker.
    adapter: adapter({
      out: 'build',          // default, you can change it
      fallback: 'index.html' // <<< this is the crucial piece
    }),

    // If you ever need a base path (e.g. deploying under /myapp/)
    // leave it empty for a root‑domain deployment.
    paths: {
      base: '',
      assets: ''
    }
  }
};

export default config;