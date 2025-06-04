<template>
  <button
    class="button"
    @click="emit('refresh')"
  >
    <ArrowPathIcon class="w-4 h-4" />
  </button>
</template>

<script setup>
import { ArrowPathIcon } from '@heroicons/vue/24/solid'
const emit = defineEmits(['refresh'])
</script>

<style scoped>
.button {
  border: 1px solid #607CF6;
  border-radius: 5px;
  height: 36px;
  padding: 10px;
  cursor: pointer;
}
</style>