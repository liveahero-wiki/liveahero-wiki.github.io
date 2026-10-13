import path from 'path'
import { defineConfig } from 'vite'
import preact from '@preact/preset-vite'

// The Team Creator page app (web/team-creator): one self-contained ES module, assets/cms/team-creator.js.
// It imports components from web/cms-plugin but is a separate bundle, so the admin portal (which loads the
// plugin) never downloads the list.
export default defineConfig({
  root: import.meta.dirname,
  publicDir: false,
  plugins: [preact()],
  build: {
    target: 'es2022',
    minify: false, // lib ES builds skip whitespace minification in vite; rolldown's output.minify below does it
    cssCodeSplit: false,
    // assets/cms/ also holds lah-team-formation.js and assets/ many committed files: emptyOutDir MUST stay false.
    outDir: path.resolve(import.meta.dirname, 'assets/cms'),
    emptyOutDir: false,
    lib: {
      entry: path.resolve(import.meta.dirname, 'web/team-creator/index.tsx'),
      formats: ['es'],
      fileName: () => 'team-creator.js',
    },
    rollupOptions: {
      // One file, no chunks: the roster URL is derived from import.meta.url of this module (assets/cms/ -> ../../api/).
      output: { codeSplitting: false, minify: true },
    },
  },
})
