<template>
  <div class="flex flex-col h-screen main">
    <Navigation />
    <div class="content" ref="contentDiv">
      <div class="container max-w-screen-md mx-auto p-8 bg-paper shadow-md rounded-lg mt-8">
        <Header />
        <slot />
      </div>
    </div>
  </div>
</template>

<script setup>
</script>

<style scoped>
.main {
  overflow-y: hidden;
}

.container {
  min-width: 1050px;
}

.content {
  overflow-y: auto;
}
</style>
