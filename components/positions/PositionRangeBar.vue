<template>
  <a
    class="range-bar"
    :href="`https://edge.meteora.ag/dlmm/${positionKey}`"
    target="_blank"
    :title="title"
  >
    <div class="track">
      <div class="track-fill" :style="trackStyle"></div>
      <div
        class="active-marker"
        :class="{ 'out-of-range': isOutOfRange }"
        :style="{ left: markerPercent + '%' }"
      ></div>
    </div>
    <div class="labels">
      <span>{{ formatPrice(minPrice) }}</span>
      <span>{{ formatPrice(maxPrice) }}</span>
    </div>
  </a>
</template>

<script setup>
const props = defineProps({
  positionKey: {
    type: String,
    required: true,
  },
  minPrice: {
    type: Number,
    default: 0,
  },
  maxPrice: {
    type: Number,
    default: 0,
  },
  activePrice: {
    type: Number,
    default: 0,
  },
  isOutOfRange: {
    type: Boolean,
    default: false,
  },
})

const formatPrice = (value) => {
  const n = Number(value)
  if (!Number.isFinite(n) || n <= 0) return '—'
  if (n >= 1) return n.toFixed(4)
  if (n >= 0.0001) return n.toFixed(6)
  return n.toExponential(2)
}

const markerPercent = computed(() => {
  const min = Number(props.minPrice)
  const max = Number(props.maxPrice)
  const active = Number(props.activePrice)
  if (!Number.isFinite(min) || !Number.isFinite(max) || max <= min) return 50
  if (!Number.isFinite(active)) return 50
  const ratio = (active - min) / (max - min)
  return Math.max(0, Math.min(100, ratio * 100))
})

const trackStyle = computed(() => {
  const split = markerPercent.value
  return {
    background: `linear-gradient(90deg, #06aed4 0%, #06aed4 ${split}%, #6f61c0 ${split}%, #6f61c0 100%)`,
  }
})

const title = computed(() => {
  const status = props.isOutOfRange ? 'Out of range' : 'In range'
  return `${status} · active ${formatPrice(props.activePrice)}`
})
</script>

<style scoped>
.range-bar {
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: 100%;
  min-width: 140px;
  text-decoration: none;
  color: inherit;
}

.track {
  position: relative;
  height: 8px;
  border-radius: 999px;
  background: #333;
  overflow: hidden;
}

.track-fill {
  position: absolute;
  inset: 0;
  border-radius: inherit;
}

.active-marker {
  position: absolute;
  top: -3px;
  width: 3px;
  height: 14px;
  margin-left: -1.5px;
  background: #efe;
  border-radius: 2px;
  box-shadow: 0 0 0 1px #223;
}

.active-marker.out-of-range {
  background: #f99;
}

.labels {
  display: flex;
  justify-content: space-between;
  font-size: 0.7em;
  color: #888;
}
</style>
