<template>
  <div class="dropdown-container relative">
    <span
      class="option-name uppercase tracking-[.1em] justify-center flex mb-1 font-bold"
    >
      {{ label }}
    </span>
    <button
      @click="isOpen = !isOpen"
      class="dropdown-button w-full p-2 flex items-center justify-between bg-gray-800 border-gray-700 border rounded-md text-gray-200"
    >
      <span>{{ selectedText }}</span>
      <svg
        class="w-4 h-4 transition-transform"
        :class="{ 'rotate-180': isOpen }"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
      >
        <path
          d="M6 9l6 6 6-6"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </button>

    <div
      v-if="isOpen"
      ref="dropdownMenu"
      class="dropdown-menu absolute w-full mt-1 bg-gray-800 border-gray-700 border rounded-md shadow-lg z-10"
    >
      <button
        v-for="val in props.values"
        :key="val.value"
        @click="update(val.value)"
        class="option w-full p-2 text-left transition-colors"
        :class="{ 'active-option': isActive(val.value) }"
      >
        {{ val.text }}
      </button>
    </div>
  </div>
</template>

<script setup>
const model = defineModel()
const isOpen = ref(false)
const dropdownMenu = ref(null)

const props = defineProps({
  label: {
    type: String,
    default: '',
  },
  values: {
    type: Array,
    default: () => [],
  },
  placeholder: {
    type: String,
    default: 'Select an option',
  },
})

const selectedText = computed(() => {
  const selected = props.values.find((val) => isActive(val.value))
  return selected ? selected.text : props.placeholder
})

const update = (value) => {
  model.value = value
  isOpen.value = false
}

const isActive = (value) => {
  return (
    value === model.value || (value.name && value.name === model.value.name)
  )
}

watch(isOpen, (newValue) => {
  if (newValue) {
    nextTick(() => {
      const activeElement = dropdownMenu.value?.querySelector('.active-option')
      if (activeElement) {
        activeElement.scrollIntoView({ block: 'center', behavior: 'smooth' })
      }
    })
  }
})
</script>

<style>
.option-name {
  font-size: 0.8em;
}

.dropdown-container {
  cursor: pointer;
  min-width: 200px;
}

.dropdown-button {
  border: 1px solid #607cf6;
  cursor: pointer;
  background-color: #111;
  font-weight: normal;
  font-size: 16px;
  padding: 5px 8px;
}

.dropdown-menu {
  max-height: 250px;
  overflow-y: auto;
  background-color: #111;
  border: 1px solid #223;
  cursor: pointer;
}

.option:hover {
  background-color: #506cb6;
  cursor: pointer;
}

.active-option {
  background-color: #405cd6;
}
</style>
