<template>
  <div class="toggle-buttons">
    <span v-if="label" class="option-name">{{ label }}</span>
    <div class="toggle-group" role="group" :aria-label="label || undefined">
      <ToggleButton
        v-for="val in props.values"
        :key="String(val.value?.name || val.value)"
        :text="val.text"
        :active="isActive(val.value)"
        @click="update(val.value)"
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

const isActive = (value) => {
  return (
    value === model.value ||
    (value?.name && value.name === model.value?.name)
  )
}
</script>

<style scoped>
.toggle-buttons {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.option-name {
  display: block;
  margin-bottom: 0.4em;
  font-size: 0.7em;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #8b8fa8;
  text-align: center;
}

.toggle-group {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  padding: 3px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(96, 124, 246, 0.28);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.03);
}
</style>
