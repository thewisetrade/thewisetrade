<template>
  <div class="bin-wrapper">
    <a
      class="flex flex-row bin-container"
      :href="`https://app.meteora.ag/dlmm/${props.positionKey}`"
      target="_blank"
    >
      <canvas ref="canvas" class="bin-canvas"></canvas>
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
})


const maxBinXAmount = computed(() => {
  const bins = props.binData || []
  return bins.reduce((max, bin) => {
    return Math.max(max, bin.positionXAmount)
  }, 0)
})

const maxBinYAmount = computed(() => {
  const bins = props.binData || []
  return bins.reduce((max, bin) => {
    return Math.max(max, bin.positionYAmount)
  }, 0)
})

const maxBinPrice = computed(() => {
  return Math.max(...props.binData.map(bin => bin.price))
})

const drawBins = () => {
  if (!canvas.value) return

  const ctx = canvas.value.getContext('2d')
  const bins = props.binData || []

  if (bins.length === 0) return

  const binWidth = 2
  const binMargin = 1
  const maxHeight = 30

  const canvasWidth = bins.length * (binWidth + binMargin)
  const canvasHeight = maxHeight

  canvas.value.width = canvasWidth
  canvas.value.height = canvasHeight

  ctx.clearRect(0, 0, canvasWidth, canvasHeight)

  bins.forEach((bin, index) => {
    console.log(bin.price, bin.positionXAmount, bin.positionYAmount, maxBinPrice.value)

    const ratio = ((maxBinPrice.value - bin.price) / maxBinPrice.value) * 1.2
    let height = ratio * maxHeight
    let color = null

    if (bin.positionXAmount > 0) {
      color = '#6f61c0'
    }
    if (bin.positionYAmount > 0) {
      color = '#06aed4'
    }

    if (color) {
      const x = index * (binWidth + binMargin)
      const y = canvasHeight - height

      ctx.fillStyle = color
      ctx.fillRect(x, y, binWidth, height)
    }
  })
}

onMounted(() => {
  drawBins()
})

watch(() => props.binData, () => {
  drawBins()
}, { deep: true })
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
