import path from 'path'
import fs from 'fs'
import { defineConfig } from 'vite'
import preact from '@preact/preset-vite'

// Serve a repo-root folder (assets/, api/) through the Vite dev server so the
// standalone dev page resolves the same absolute paths the published Jekyll
// site uses. __dirname is the repo root (this config lives there).
function serveRepoFolder(name: string) {
  const dir = path.resolve(__dirname, name)
  return {
    name: `serve-repo-${name}`,
    configureServer(server: any) {
      server.middlewares.use(`/${name}`, (req: any, res: any, next: any) => {
        // Resolve then verify the result stays inside dir to prevent path
        // traversal (e.g. req.url = '/../../../etc/passwd').
        const file = path.resolve(dir, (req.url ?? '').replace(/^\/+/, ''))
        if (!file.startsWith(dir + path.sep) && file !== dir) return next()
        if (fs.existsSync(file) && fs.statSync(file).isFile()) {
          if (file.endsWith('.json')) res.setHeader('Content-Type', 'application/json')
          else if (file.endsWith('.js')) res.setHeader('Content-Type', 'application/javascript')
          fs.createReadStream(file).pipe(res)
        } else {
          next()
        }
      })
    },
  }
}

// TanStack Table and Downshift target React, so alias react/react-dom to
// preact/compat (standard Preact interop). The preset already sets most of
// this up; the explicit aliases keep deep imports (react/jsx-runtime) working.
export default defineConfig({
  // Source + dev entry (web/index.html) live under web/ so they don't collide
  // with the Jekyll homepage (root index.html).
  root: 'web',
  plugins: [
    preact(),
    // /assets/tippy.js etc. and /api/skill-index*.json are served from the
    // repo root during dev (mirrors how Jekyll serves them in production),
    // which removes the need for a sync-index copy step.
    serveRepoFolder('assets'),
    serveRepoFolder('api'),
  ],
  resolve: {
    alias: {
      react: 'preact/compat',
      'react-dom': 'preact/compat',
      'react/jsx-runtime': 'preact/jsx-runtime',
    },
  },
  build: {
    // Emit the bundle into the Jekyll assets/ folder. emptyOutDir MUST stay
    // false — assets/ holds many committed files (main.js, tippy.js, ...).
    outDir: '../assets',
    emptyOutDir: false,
    rollupOptions: {
      // Build straight from the entry module (no HTML), so no index.html is
      // written into assets/.
      input: path.resolve(__dirname, 'web/src/main.tsx'),
      output: {
        entryFileNames: 'skill-search.js',
        chunkFileNames: 'skill-search-[name].js',
        assetFileNames: (info) =>
          info.name?.endsWith('.css') ? 'skill-search.css' : 'skill-search-[name][extname]',
      },
    },
  },
})
