import { Buffer } from 'buffer'

export default defineNuxtPlugin({
  name: 'buffer',
  setup() {
    globalThis.Buffer = Buffer
    if (typeof window !== 'undefined') {
      window.Buffer = Buffer
      if (typeof window.global === 'undefined') {
        window.global = window
      }
    }
  },
})
