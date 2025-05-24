import { Buffer } from 'buffer'

globalThis.Buffer = Buffer
// globalThis.process = process

export default defineNuxtPlugin(() => {
  window.Buffer = Buffer
  if (typeof window.global === 'undefined') {
    window.global = window
  }
})
