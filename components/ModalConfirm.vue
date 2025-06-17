<template>
  <VueFinalModal
    class="flex justify-center items-center"
    content-class="flex flex-col max-w-xl mx-4 p-4 rounded-lg space-y-2 modal-content"
  >
    <h1 class="text-xl">
      {{ title }}
    </h1>
    <slot />
    <button class="mt-1 ml-auto p-2 border cursor-pointer rounded-lg" @click="emit('confirm')">
      Confirm
    </button>
  </VueFinalModal>
</template>

<script setup>
import { VueFinalModal } from 'vue-final-modal'

defineProps({
  title: {
    type: String,
    required: true
  }
})

const emit = defineEmits({
  confirm: () => true
})
</script>

<style>
.modal-content {
  background-color: #121212;
  border: 2px solid #223;
}
</style>
