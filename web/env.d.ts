// CSS imports, resolved by Vite: `?inline` gives the stylesheet as a string (the self-contained assets/cms/ bundles inject
// it themselves); a bare import is extracted into a .css file (Skill Search).
declare module '*.css?inline' {
  const css: string
  export default css
}
declare module '*.css'
