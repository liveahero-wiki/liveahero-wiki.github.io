import path from 'path'
import fs from 'fs'
import { defineConfig } from 'vite'
import preact from '@preact/preset-vite'

// TanStack Table and Downshift target React, so alias react/react-dom to
// preact/compat (standard Preact interop). The preset already sets most of
// this up; the explicit aliases keep deep imports (react/jsx-runtime) working.
export default defineConfig({
  plugins: [
    preact(),
    // Serve Jekyll's /assets/ folder during Vite dev so scripts like
    // tippy.js (loaded via <script src="/assets/tippy.js">) resolve correctly.
    {
      name: 'serve-jekyll-assets',
      configureServer(server) {
        const assetsDir = path.resolve(__dirname, '../assets')
        server.middlewares.use('/assets', (req, res, next) => {
          const file = path.join(assetsDir, req.url)
          if (fs.existsSync(file) && fs.statSync(file).isFile()) {
            res.setHeader('Content-Type', 'application/javascript')
            fs.createReadStream(file).pipe(res)
          } else {
            next()
          }
        })
      },
    },
  ],
  resolve: {
    alias: {
      react: 'preact/compat',
      'react-dom': 'preact/compat',
      'react/jsx-runtime': 'preact/jsx-runtime',
    },
  },
})
