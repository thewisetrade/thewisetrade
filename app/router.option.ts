import type { RouterConfig } from '@nuxt/schema'

export default {
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    }

    if (to.hash) {
      return {
        el: to.hash,
        behavior: 'smooth',
      }
    }

    console.log('scrollBehavior', to.fullPath)
    const savedScroll = sessionStorage.getItem(`scroll_${to.fullPath}`)
    if (savedScroll) {
      return { top: parseInt(savedScroll), behavior: 'auto' }
    }

    return { top: 0, behavior: 'smooth' }
  }
} satisfies RouterConfig