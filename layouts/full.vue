<template>
  <div class="flex flex-col h-screen main">
    <Navigation />
    <div class="content" ref="contentDiv">
      <div class="mx-auto p-0 bg-black shadow-md rounded-lg mt-8">
        <slot />
      </div>
    </div>
  </div>
</template>

<script setup>
</script>

<style scoped>
.main {
  background-color: #000;
  overflow-y: hidden;
}

.bg-black {
  background-color: #000;
  margin-bottom: 5em;
  max-width: 1060px;
}

.content {
  overflow-y: auto;
}
</style>
