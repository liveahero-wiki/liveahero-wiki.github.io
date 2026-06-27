import { defineConfig } from 'vite'
import preact from '@preact/preset-vite'

// TanStack Table and Downshift target React, so alias react/react-dom to
// preact/compat (standard Preact interop). The preset already sets most of
// this up; the explicit aliases keep deep imports (react/jsx-runtime) working.
export default defineConfig({
  plugins: [preact()],
  resolve: {
    alias: {
      react: 'preact/compat',
      'react-dom': 'preact/compat',
      'react/jsx-runtime': 'preact/jsx-runtime',
    },
  },
})
