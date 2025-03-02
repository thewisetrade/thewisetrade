<template>
<div class="flex-column justify-center mb-6">
  <span class="option-name uppercase tracking-[.3em] justify-center flex mb-1
  font-bold">
    {{ label }}
  </span>
  <div class="flex flex-row justify-center">
    <ToggleButton
      :text="val.text"
      :active="val.value === model"
      @click="update(val.value)"
      v-for="val in props.values"
    />
  </div>
</div>
</template>

<script setup>
const props = defineProps(['label', 'values'])
const model = defineModel()

const update = (value) => {
  model.value = value
}
</script>

<style>
.option-name {
  font-size: 0.9em;
}
</style>
