<template>
  <button
    type="button"
    class="refresh-button"
    aria-label="Refresh"
    @click="emit('refresh')"
  >
    <ArrowPathIcon class="refresh-icon" />
  </button>
</template>

<script setup>
import { ArrowPathIcon } from '@heroicons/vue/24/solid'
const emit = defineEmits(['refresh'])
</script>

<style scoped>
.refresh-button {
  appearance: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.15em;
  height: 2.15em;
  padding: 0;
  border-radius: 10px;
  border: 1px solid rgba(96, 124, 246, 0.28);
  background: rgba(255, 255, 255, 0.04);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.03);
  color: #9aa0b8;
  cursor: pointer;
  transition:
    background-color 0.15s ease,
    color 0.15s ease,
    border-color 0.15s ease,
    box-shadow 0.15s ease;
}

.refresh-icon {
  width: 1em;
  height: 1em;
}

.refresh-button:hover {
  color: #e6e8f2;
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(96, 124, 246, 0.45);
}

.refresh-button:focus-visible {
  outline: 2px solid rgba(96, 124, 246, 0.7);
  outline-offset: 1px;
}

.refresh-button:active {
  background: linear-gradient(180deg, #4d68e8 0%, #405cd6 100%);
  border-color: transparent;
  color: #fff;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.35);
}
</style>
