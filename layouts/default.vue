<template>
  <div class="flex flex-col h-screen main">
    <Navigation />
    <div ref="contentDiv" class="content">
      <div
        class="container max-w-screen-md mx-auto p-8 bg-paper shadow-md rounded-lg mt-8"
      >
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
const router = useRouter()

const saveScrollPosition = (path) => {
  if (contentDiv.value) {
    sessionStorage.setItem(`scroll_${path}`, contentDiv.value.scrollTop + '')
  }
}

const restoreScrollPosition = (path) => {
  if (contentDiv.value) {
    const savedPosition = sessionStorage.getItem(`scroll_${path}`)
    contentDiv.value.scrollTop = savedPosition ? parseInt(savedPosition) : 0
  }
}

router.beforeEach((to, from) => {
  saveScrollPosition(from.fullPath)
})

watch(
  () => route.fullPath,
  async (newPath) => {
    await nextTick()
    restoreScrollPosition(newPath)
  },
  { immediate: true },
)
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
