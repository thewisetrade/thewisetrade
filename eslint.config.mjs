import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt(
  {
    ignores: [
      '.nuxt',
      '.output',
      'dist',
      'node_modules',
      'public',
      'package-lock.json',
    ],
  },
  {
    rules: {
      // Single-word names (Footer, Loader, Navigation…) are unambiguous in an app
      // this size and already match how they are used in the templates.
      'vue/multi-word-component-names': 'off',

      // utils/ deliberately seeds `let x = <fallback>` before a try/catch that
      // reassigns on every path. The initialiser is dead but keeps the fallback
      // visible next to the declaration.
      'no-useless-assignment': 'off',

      // The DLMM analyzer maps loosely-typed on-chain payloads. Typing them
      // properly is worthwhile but is its own task, so surface without blocking.
      '@typescript-eslint/no-explicit-any': 'warn',

      // Vue 3 renders multiple root nodes as a fragment. The guide pages rely on
      // it, and the single-root requirement would only matter if page
      // transitions were enabled, which they are not.
      'vue/no-multiple-template-root': 'off',

      // Prettier owns how void elements are written and closes them as `<input />`,
      // which is exactly what this rule objects to. Leave it to Prettier.
      'vue/html-self-closing': 'off',
    },
  },
  {
    // Guide pages contain non-breaking spaces inside prose, which is legitimate
    // in HTML text. Keep the check on script blocks and template expressions.
    files: ['**/*.vue'],
    rules: {
      'no-irregular-whitespace': 'off',
      'vue/no-irregular-whitespace': ['error', { skipHTMLTextContents: true }],
    },
  },
)
