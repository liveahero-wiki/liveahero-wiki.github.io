import path from 'path'
import { defineConfig } from 'vite'
import preact from '@preact/preset-vite'

// The contributor editor (web/editor): one self-contained ES module, assets/cms/editor.js. It is imported
// only when a reader clicks Edit / Suggest (assets/main.js), so pages do not get heavier. The markdown preview
// bundles wiki_plugins/markdown and wiki_plugins/lib, the same code the site build runs.
export default defineConfig({
  root: import.meta.dirname,
  publicDir: false,
  plugins: [preact()],
  build: {
    target: 'es2022',
    minify: false, // lib ES builds skip whitespace minification in vite; rolldown's output.minify below does it
    cssCodeSplit: false,
    // assets/cms/ also holds team-creator.js, lah-team-formation.js and more: emptyOutDir MUST stay false.
    outDir: path.resolve(import.meta.dirname, 'assets/cms'),
    emptyOutDir: false,
    lib: {
      entry: path.resolve(import.meta.dirname, 'web/editor/index.tsx'),
      formats: ['es'],
      fileName: () => 'editor.js',
    },
    rollupOptions: {
      // One file, no chunks: the JSON endpoints are derived from import.meta.url of this module (assets/cms/ -> ../../api/).
      output: { codeSplitting: false, minify: true },
    },
  },
})
