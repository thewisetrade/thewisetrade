<template>
  <div class="flex flex-col h-screen main">
    <Navigation />
    <div class="content" ref="contentDiv">
      <div class="container max-w-screen-md mx-auto p-8 bg-paper shadow-md rounded-lg mt-8">
        <Header />
        <slot />
        <Footer />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue'
import { useRoute, useRouter } from '#app'

const contentDiv = ref(null)
const route = useRoute()

const saveScrollPosition = (path) => {
  if (contentDiv.value) {
    console.log('saveScrollPosition', path, contentDiv.value.scrollTop + '')
    sessionStorage.setItem(`scroll_${path}`, contentDiv.value.scrollTop + '')
  }
}

const restoreScrollPosition = (path) => {
  if (contentDiv.value) {
    const savedPosition = sessionStorage.getItem(`scroll_${path}`)
    console.log('restoreScrollPosition', path, savedPosition)
    contentDiv.value.scrollTop = savedPosition ? parseInt(savedPosition) : 0
  }
}

watch(() => route.fullPath, async (newPath, oldPath) => {
}, { immediate: true })

const router = useRouter()

// Save position before route changes
router.beforeEach((to, from) => {
  saveScrollPosition(from.fullPath)
})

// Restore position after route changes
watch(() => route.fullPath, async (newPath) => {
  await nextTick()
  restoreScrollPosition(newPath)
}, { immediate: true })
</script>

<style scoped>
.main {
  overflow-y: hidden;
}

.content {
  overflow-y: auto;
  padding-bottom: 2em;
}
</style>
