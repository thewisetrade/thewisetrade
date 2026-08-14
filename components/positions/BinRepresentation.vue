<template>
  <div class="bin-wrapper">
    <a
      class="flex flex-row bin-container"
      :href="`https://edge.meteora.ag/dlmm/${props.positionKey}`"
      target="_blank"
    >
      <canvas ref="canvas" class="bin-canvas"/>
    </a>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, watch } from 'vue'

const canvas = ref(null)

const props = defineProps({
  binData: {
    type: Array,
    required: true,
  },
  positionToken1: {
    type: Object,
    required: true,
  },
  positionToken2: {
    type: Object,
    required: true,
  },
  positionKey: {
    type: String,
    required: true,
  },
  activePrice: {
    type: Number,
    default: 0,
  },
})

const COLOR_QUOTE = '#06aed4'
const COLOR_BASE = '#6f61c0'

const sortedBins = computed(() =>
  [...(props.binData || [])].sort(
    (a, b) => Number(a.binId ?? 0) - Number(b.binId ?? 0),
  ),
)

const maxBinValue = computed(() =>
  Math.max(...sortedBins.value.map((bin) => bin.value || 0), 0),
)

const activeBinIndex = computed(() => {
  const bins = sortedBins.value
  if (!bins.length) return -1

  const bothIdx = bins.findIndex((bin) => {
    const x = Number(bin.positionXAmount) || 0
    const y = Number(bin.positionYAmount) || 0
    return x > 0 && y > 0
  })
  if (bothIdx >= 0) return bothIdx

  const active = Number(props.activePrice)
  if (!Number.isFinite(active) || active <= 0) return -1

  let closestIdx = 0
  let closestDiff = Infinity
  bins.forEach((bin, index) => {
    const price = Number(bin.price)
    if (!Number.isFinite(price)) return
    const diff = Math.abs(price - active)
    if (diff < closestDiff) {
      closestDiff = diff
      closestIdx = index
    }
  })
  return closestIdx
})

const binColor = (index) => {
  const activeIdx = activeBinIndex.value
  if (activeIdx < 0) {
    const bin = sortedBins.value[index]
    const x = Number(bin?.positionXAmount) || 0
    const y = Number(bin?.positionYAmount) || 0
    if (y > 0 && x <= 0) return COLOR_QUOTE
    if (x > 0 && y <= 0) return COLOR_BASE
    return y >= x ? COLOR_QUOTE : COLOR_BASE
  }
  return index <= activeIdx ? COLOR_QUOTE : COLOR_BASE
}

const drawBins = () => {
  if (!canvas.value) return

  const ctx = canvas.value.getContext('2d')
  const bins = sortedBins.value

  if (bins.length === 0) return

  const binWidth = 2
  const binMargin = 1
  const maxHeight = 30

  const canvasWidth = bins.length * (binWidth + binMargin)
  const canvasHeight = maxHeight

  canvas.value.width = canvasWidth
  canvas.value.height = canvasHeight

  ctx.clearRect(0, 0, canvasWidth, canvasHeight)
  const maxValue = maxBinValue.value

  bins.forEach((bin, index) => {
    const ratio = maxValue > 0 ? (bin.value || 0) / maxValue : 0
    const height = ratio * maxHeight
    const color = binColor(index)

    if (height <= 0) return

    const x = index * (binWidth + binMargin)
    const y = canvasHeight - height

    ctx.fillStyle = color
    ctx.fillRect(x, y, binWidth, height)
  })

  const activeIdx = activeBinIndex.value
  if (activeIdx >= 0) {
    const markerX = activeIdx * (binWidth + binMargin) + binWidth / 2
    ctx.fillStyle = '#efe'
    ctx.fillRect(markerX - 1, 0, 2, canvasHeight)
  }
}

onMounted(() => {
  drawBins()
})

watch(
  () => [props.binData, props.activePrice],
  () => {
    drawBins()
  },
  { deep: true },
)
</script>

<style scoped>
.bin-wrapper {
  width: 100%;
}
.bin-container {
  display: flex;
  flex-direction: row;
  align-items: end;
  justify-content: flex-start;
  width: 100%;
}
.bin-canvas {
  display: block;
}
</style>
