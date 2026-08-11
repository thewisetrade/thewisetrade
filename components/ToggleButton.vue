<template>
  <button
    type="button"
    class="toggle-btn"
    :class="{ active: props.active }"
  >
    {{ props.text }}
  </button>
</template>

<script setup>
const props = defineProps(['active', 'text'])
</script>

<style scoped>
.toggle-btn {
  appearance: none;
  border: none;
  background: transparent;
  color: #9aa0b8;
  font: inherit;
  font-size: 0.85em;
  font-weight: 500;
  line-height: 1.2;
  padding: 0.4em 0.85em;
  border-radius: 7px;
  cursor: pointer;
  white-space: nowrap;
  transition:
    background-color 0.15s ease,
    color 0.15s ease,
    box-shadow 0.15s ease;
}

.toggle-btn:hover:not(.active) {
  color: #e6e8f2;
  background: rgba(255, 255, 255, 0.06);
}

.toggle-btn:focus-visible {
  outline: 2px solid rgba(96, 124, 246, 0.7);
  outline-offset: 1px;
}

.toggle-btn.active {
  background: linear-gradient(180deg, #4d68e8 0%, #405cd6 100%);
  color: #fff;
  font-weight: 600;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.35);
}
</style>
