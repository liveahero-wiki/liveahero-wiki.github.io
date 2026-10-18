// Dev harness only: compiles assets/main.scss (front matter stripped) into web/editor/dev/main.css so fixture.html looks like the site.
// Run: node web/editor/dev/build-css.mjs
import fs from 'node:fs'
import path from 'node:path'
import * as sass from 'sass'

const root = path.resolve(import.meta.dirname, '../../..')
const src = fs.readFileSync(path.join(root, 'assets/main.scss'), 'utf8').replace(/^---[\s\S]*?\n---\r?\n/, '')
const out = sass.compileString(src, { loadPaths: [path.join(root, '_sass')], silenceDeprecations: ['import', 'global-builtin', 'color-functions', 'mixed-decls'] })
fs.writeFileSync(path.join(import.meta.dirname, 'main.css'), out.css)
console.log('main.css', out.css.length, 'bytes')
