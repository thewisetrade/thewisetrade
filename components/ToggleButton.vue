<template>
<div
  class="rounded-md cursor-pointer"
  :class="{
    'local-button': true,
    active: props.active
  }"
>
  {{ props.text }}
</div>
</template>

<script setup>
const props = defineProps(['active', 'text'])
</script>

<style scoped>
.local-button {
  border: 1px solid #607CF6;
  font-weight: normal;
  font-size: 16px;
  padding: 5px 8px;
  margin-right: 10px;
}

.active {
  background: #405CD6;
}
</style>
