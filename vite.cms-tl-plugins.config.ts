import path from 'path'
import { build, defineConfig, type InlineConfig, type Plugin } from 'vite'

// Three moderator plugins for the wiki-cms admin portal (sources: web/cms-tl-plugins/), each built into its own
// self-contained ES module under assets/cms/ (the admin portal imports each one by URL):
//   vite build  -> lah-voice-tl.js, lah-bio-tl.js, lah-page-edit.js
//   vite        -> the standalone harness at /dev.html (web/cms-tl-plugins/dev/)
// The wiki /api/*.json URLs are derived from import.meta.url of the loaded module.
//
// Rolldown rejects `codeSplitting: false` with several inputs, and without it shared code would land in a chunk,
// so this one invocation does one build per plugin: the main build is the first plugin, and a plugin hook runs
// the others through the JS API once it is done.

const ENTRIES: Record<string, string> = {
  'lah-voice-tl': 'web/cms-tl-plugins/voice.ts',
  'lah-bio-tl': 'web/cms-tl-plugins/bio.ts',
  'lah-page-edit': 'web/cms-tl-plugins/page-edit.ts',
}
const [first, ...others] = Object.keys(ENTRIES)

function pluginBuild(name: string): InlineConfig['build'] {
  return {
    target: 'es2022',
    minify: false, // lib ES builds skip whitespace minification in vite; rolldown's output.minify below does it
    cssCodeSplit: false,
    // assets/ holds many committed files: emptyOutDir MUST stay false.
    outDir: path.resolve(__dirname, 'assets/cms'),
    emptyOutDir: false,
    lib: {
      entry: path.resolve(__dirname, ENTRIES[name]),
      formats: ['es'],
      fileName: () => `${name}.js`,
    },
    rollupOptions: { output: { codeSplitting: false, minify: true } },
  }
}

function buildOtherPlugins(): Plugin {
  return {
    name: 'build-other-cms-tl-plugins',
    apply: 'build',
    async closeBundle() {
      for (const name of others) {
        await build({ configFile: false, root: __dirname, publicDir: false, logLevel: 'warn', build: pluginBuild(name) })
        console.log(`built assets/cms/${name}.js`)
      }
    },
  }
}

export default defineConfig(({ command }) => ({
  root: command === 'serve' ? path.resolve(__dirname, 'web/cms-tl-plugins/dev') : __dirname,
  publicDir: false,
  plugins: [buildOtherPlugins()],
  build: pluginBuild(first),
}))
