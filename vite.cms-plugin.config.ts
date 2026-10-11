import path from 'path'
import fs from 'fs'
import { defineConfig } from 'vite'
import preact from '@preact/preset-vite'

// Two modes in one config:
//   vite build [--watch]  -> the single self-contained ES module assets/cms/lah-team-formation.js
//   vite (dev server)     -> the standalone harness at /dev.html (web/cms-plugin/dev/)

// Serve the repo's api/ folder in dev so the harness can also use the real api/team-roster.json.
function serveRepoApi() {
  const dir = path.resolve(__dirname, 'api')
  return {
    name: 'serve-repo-api',
    configureServer(server: any) {
      server.middlewares.use('/api', (req: any, res: any, next: any) => {
        const file = path.resolve(dir, (req.url ?? '').split('?')[0].replace(/^\/+/, ''))
        if (!file.startsWith(dir + path.sep)) return next() // no path traversal
        if (fs.existsSync(file) && fs.statSync(file).isFile()) {
          if (file.endsWith('.json')) res.setHeader('Content-Type', 'application/json')
          fs.createReadStream(file).pipe(res)
        } else next()
      })
    },
  }
}

export default defineConfig(({ command }) => ({
  root: command === 'serve' ? path.resolve(__dirname, 'web/cms-plugin/dev') : __dirname,
  publicDir: false,
  plugins: [preact(), ...(command === 'serve' ? [serveRepoApi()] : [])],
  build: {
    target: 'es2022',
    minify: false, // lib ES builds skip whitespace minification in vite; rolldown's output.minify below does it
    cssCodeSplit: false,
    // assets/ holds many committed files: emptyOutDir MUST stay false.
    outDir: path.resolve(__dirname, 'assets/cms'),
    emptyOutDir: false,
    lib: {
      entry: path.resolve(__dirname, 'web/cms-plugin/index.ts'),
      formats: ['es'],
      fileName: () => 'lah-team-formation.js',
    },
    rollupOptions: {
      // One file, no chunks: the roster URL is derived from import.meta.url of this module.
      output: { codeSplitting: false, minify: true },
    },
  },
}))
