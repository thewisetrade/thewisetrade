<template>
  <div
    ref="rootEl"
    class="dropdown-container relative"
    :class="{ compact: compact }"
  >
    <span
      v-if="label"
      class="option-name"
    >
      {{ label }}
    </span>
    <button
      type="button"
      class="dropdown-button flex items-center justify-between"
      @click="isOpen = !isOpen"
    >
      <span class="dropdown-label">{{ selectedText }}</span>
      <svg
        class="dropdown-chevron transition-transform"
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
      class="dropdown-menu absolute mt-1 shadow-lg z-10"
    >
      <button
        v-for="(val, index) in props.values"
        :key="val.text || index"
        type="button"
        class="option w-full text-left transition-colors"
        :class="{ 'active-option': isActive(val.value) }"
        @click="update(val.value)"
      >
        {{ val.text }}
      </button>
    </div>
  </div>
</template>

<script setup>
const model = defineModel()
const isOpen = ref(false)
const rootEl = ref(null)
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
  compact: {
    type: Boolean,
    default: false,
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
    value === model.value ||
    (value?.name && value.name === model.value?.name)
  )
}

const onPointerDownOutside = (event) => {
  if (!isOpen.value || !rootEl.value) return
  if (rootEl.value.contains(event.target)) return
  isOpen.value = false
}

const onKeyDown = (event) => {
  if (event.key === 'Escape' && isOpen.value) {
    isOpen.value = false
  }
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

onMounted(() => {
  document.addEventListener('pointerdown', onPointerDownOutside, true)
  document.addEventListener('keydown', onKeyDown)
})

onUnmounted(() => {
  document.removeEventListener('pointerdown', onPointerDownOutside, true)
  document.removeEventListener('keydown', onKeyDown)
})
</script>

<style scoped>
.dropdown-container {
  cursor: pointer;
  min-width: 200px;
}

.dropdown-container.compact {
  min-width: 160px;
  max-width: 220px;
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

.dropdown-button {
  width: 100%;
  appearance: none;
  border: 1px solid rgba(96, 124, 246, 0.28);
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.04);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.03);
  color: #e6e8f2;
  font: inherit;
  font-size: 0.85em;
  font-weight: 500;
  line-height: 1.2;
  padding: 0.45em 0.75em;
  cursor: pointer;
  gap: 0.5em;
  transition:
    background-color 0.15s ease,
    border-color 0.15s ease,
    color 0.15s ease;
}

/* Match ToggleButtons .toggle-group height: 3px + 3px + 0.8em + 1.2em at 0.85em font */
.compact .dropdown-button {
  box-sizing: border-box;
  height: calc(6px + 2em);
  padding: 0 0.75em;
  font-size: 0.85em;
}

.dropdown-button:hover {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(96, 124, 246, 0.45);
}

.dropdown-button:focus-visible {
  outline: 2px solid rgba(96, 124, 246, 0.7);
  outline-offset: 1px;
}

.dropdown-label {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-align: left;
  flex: 1;
  min-width: 0;
}

.dropdown-chevron {
  width: 1em;
  height: 1em;
  flex-shrink: 0;
  color: #9aa0b8;
}

.dropdown-menu {
  left: 0;
  right: 0;
  max-height: 250px;
  overflow-y: auto;
  background: #15151f;
  border: 1px solid rgba(96, 124, 246, 0.28);
  border-radius: 10px;
  padding: 3px;
  cursor: pointer;
}

.option {
  appearance: none;
  border: none;
  background: transparent;
  color: #c5c9da;
  font: inherit;
  font-size: 0.85em;
  padding: 0.45em 0.7em;
  border-radius: 7px;
  cursor: pointer;
}

.option:hover {
  background: rgba(80, 108, 182, 0.55);
  color: #fff;
}

.active-option {
  background: linear-gradient(180deg, #4d68e8 0%, #405cd6 100%);
  color: #fff;
  font-weight: 600;
}
</style>
