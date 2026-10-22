import path from 'path'
import fs from 'fs'
import { build, defineConfig, type Plugin, type UserConfig } from 'vite'
import preact from '@preact/preset-vite'

// Every bundle under web/ is built from this one config.
//
//   vite build                 -> Skill Search (assets/skill-search.*), then every LIBS entry
//   vite build --mode <name>   -> only that bundle ('skill-search' or a LIBS key); add --watch to rebuild on change
//   vite                       -> one dev server rooted at web/: / (Skill Search), /cms-plugin/dev/dev.html,
//                                 /cms-tl-plugins/dev/dev.html
//
// Each LIBS entry is one self-contained ES module in assets/cms/: they derive their URLs from import.meta.url and the
// wiki-cms admin portal imports them by URL. Rolldown rejects `codeSplitting: false` with several inputs (shared code
// would land in a chunk), so each one is its own build pass; a plugin runs them after the main pass.

const root = import.meta.dirname

const LIBS = {
  // the team-formation plugin of the wiki-cms admin portal and the Team Creator submit form
  'lah-team-formation': 'web/cms-plugin/index.ts',
  // the Team Creator page app; a separate bundle so the admin portal never downloads the list
  'team-creator': 'web/team-creator/index.tsx',
  // the contributor editor, imported by assets/main.js only when a reader clicks Edit / Suggest
  editor: 'web/editor/index.tsx',
  // the moderator plugins of the wiki-cms admin portal
  'lah-voice-tl': 'web/cms-tl-plugins/voice.ts',
  'lah-bio-tl': 'web/cms-tl-plugins/bio.ts',
  'lah-page-edit': 'web/cms-tl-plugins/page-edit.ts',
}
type LibName = keyof typeof LIBS
const isLib = (mode: string): mode is LibName => Object.hasOwn(LIBS, mode)

// TanStack Table and Downshift (Skill Search) target React, so alias react/react-dom to preact/compat (standard Preact
// interop). The preset already sets most of this up; the explicit aliases keep deep imports (react/jsx-runtime) working.
const resolve: UserConfig['resolve'] = {
  alias: {
    react: 'preact/compat',
    'react-dom': 'preact/compat',
    'react/jsx-runtime': 'preact/jsx-runtime',
  },
}

function libConfig(name: LibName): UserConfig {
  return {
    root,
    publicDir: false,
    plugins: [preact()],
    resolve,
    build: {
      target: 'es2022',
      minify: false, // lib ES builds skip whitespace minification in vite; rolldown's output.minify below does it
      cssCodeSplit: false,
      // assets/ holds many committed files: emptyOutDir MUST stay false.
      outDir: path.resolve(root, 'assets/cms'),
      emptyOutDir: false,
      lib: {
        entry: path.resolve(root, LIBS[name]),
        formats: ['es'],
        fileName: () => `${name}.js`,
      },
      rollupOptions: { output: { codeSplitting: false, minify: true } },
    },
  }
}

/** After the main pass, builds every LIBS entry (one pass each, see above). */
function buildLibs(): Plugin {
  return {
    name: 'build-libs',
    apply: 'build',
    async closeBundle() {
      for (const name of Object.keys(LIBS) as LibName[]) await build({ configFile: false, ...libConfig(name) })
    },
  }
}

// Serve a repo-root folder (assets/, api/, the head script) through the dev server so the dev pages resolve the same
// absolute paths the published site uses.
function serveRepoFolder(name: string): Plugin {
  const dir = path.resolve(root, name)
  return {
    name: `serve-repo-${name}`,
    configureServer(server) {
      server.middlewares.use(`/${name}`, (req, res, next) => {
        // Resolve then verify the result stays inside dir to prevent path traversal (e.g. req.url = '/../../../etc/passwd').
        const file = path.resolve(dir, (req.url ?? '').split('?')[0].replace(/^\/+/, ''))
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

export default defineConfig(({ command, mode }): UserConfig => {
  if (command === 'build' && isLib(mode)) return libConfig(mode)
  return {
    // Sources and the Skill Search dev entry (web/index.html) live under web/ so they don't collide with the wiki
    // homepage (root index.html).
    root: path.resolve(root, 'web'),
    plugins: [
      preact(),
      serveRepoFolder('assets'),
      serveRepoFolder('api'),
      serveRepoFolder('_includes/js'),
      ...(command === 'build' && mode !== 'skill-search' ? [buildLibs()] : []),
    ],
    resolve,
    build: {
      // Emit the bundle into the site's assets/ folder. emptyOutDir MUST stay false: assets/ holds many committed
      // files (main.js, tippy.js, ...).
      outDir: path.resolve(root, 'assets'),
      emptyOutDir: false,
      rollupOptions: {
        // Build straight from the entry module (no HTML), so no index.html is written into assets/.
        input: path.resolve(root, 'web/src/main.tsx'),
        output: {
          entryFileNames: 'skill-search.js',
          chunkFileNames: 'skill-search-[name].js',
          assetFileNames: (info) => (info.name?.endsWith('.css') ? 'skill-search.css' : 'skill-search-[name][extname]'),
        },
      },
    },
  }
})
