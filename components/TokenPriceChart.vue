<template>
  <div
    ref="rootEl"
    class="price-chart"
    :style="{ minWidth: `${width}px`, height: `${height}px` }"
  >
    <div v-if="loading" class="loading">...</div>
    <div v-else-if="error" class="error">-</div>
    <canvas
      ref="chartCanvas"
      :width="width"
      :height="height"
      v-show="!loading && !error"
    ></canvas>
  </div>
</template>

<script setup>
import { getGeckoOhlcvPrices } from '@/utils/geckoterminal'

const props = defineProps({
  tokenAddress: {
    type: String,
    required: true,
  },
  pairAddress: {
    type: String,
    default: '',
  },
  width: {
    type: Number,
    default: 120,
  },
  height: {
    type: Number,
    default: 40,
  },
  showMinus50Line: {
    type: Boolean,
    default: false,
  },
})

const rootEl = ref(null)
const chartCanvas = ref(null)
const loading = ref(true)
const error = ref(false)
const priceData = ref([])
const hasFetched = ref(false)
let observer = null

const showPrices = async (prices) => {
  if (!prices?.length) return false
  priceData.value = prices
  loading.value = false
  error.value = false
  await nextTick()
  drawChart()
  return true
}

const fetchPriceData = async () => {
  if (!props.pairAddress) {
    error.value = true
    loading.value = false
    return
  }

  try {
    loading.value = true
    error.value = false
    hasFetched.value = true

    // Real 72h OHLCV only — no Tokleo / DexScreener synthetic curves
    const prices = await getGeckoOhlcvPrices(props.pairAddress)
    if (await showPrices(prices)) return

    throw new Error('No OHLCV data')
  } catch (err) {
    console.error('Error fetching price data:', err)
    error.value = true
  } finally {
    loading.value = false
  }
}

const drawChart = () => {
  if (!chartCanvas.value || priceData.value.length === 0) return

  const canvas = chartCanvas.value
  const ctx = canvas.getContext('2d')
  const width = canvas.width
  const height = canvas.height

  ctx.clearRect(0, 0, width, height)

  const prices = priceData.value
  const currentPrice = prices[prices.length - 1]
  const rawMin = Math.min(...prices)
  const rawMax = Math.max(...prices)
  const minPrice = props.showMinus50Line ? 0 : rawMin * 0.98
  const maxPrice = props.showMinus50Line ? rawMax : rawMax * 1.02
  const priceRange = maxPrice - minPrice || 1

  const priceChange = prices[prices.length - 1] - prices[0]
  const isPositive = priceChange >= 0
  const color = isPositive ? '#3DDC84' : '#FF4757'

  ctx.strokeStyle = color
  ctx.lineWidth = 2
  ctx.beginPath()

  prices.forEach((price, index) => {
    const x = (index / (prices.length - 1)) * width
    const y = height - ((price - minPrice) / priceRange) * height

    if (index === 0) {
      ctx.moveTo(x, y)
    } else {
      ctx.lineTo(x, y)
    }
  })

  ctx.stroke()

  ctx.lineTo(width, height)
  ctx.lineTo(0, height)
  ctx.closePath()
  ctx.fillStyle = isPositive
    ? 'rgba(61, 220, 132, 0.22)'
    : 'rgba(255, 71, 87, 0.22)'
  ctx.fill()

  if (props.showMinus50Line && currentPrice > 0) {
    const percentages = [0.5, 0.25]
    const labels = ['-50%', '-75%']

    percentages.forEach((percentage, index) => {
      const linePrice = currentPrice * percentage
      const lineY = height - ((linePrice - minPrice) / priceRange) * height

      if (lineY >= 0 && lineY <= height) {
        ctx.strokeStyle = '#888'
        ctx.lineWidth = 1
        ctx.setLineDash([4, 4])
        ctx.beginPath()
        ctx.moveTo(0, lineY)
        ctx.lineTo(width, lineY)
        ctx.stroke()
        ctx.setLineDash([])

        ctx.fillStyle = '#888'
        ctx.font = '10px sans-serif'
        ctx.textAlign = 'left'
        ctx.fillText(labels[index], 4, lineY - 4)
      }
    })
  }
}

const observeVisibility = () => {
  if (!rootEl.value || typeof IntersectionObserver === 'undefined') {
    fetchPriceData()
    return
  }

  observer = new IntersectionObserver(
    (entries) => {
      const visible = entries.some((entry) => entry.isIntersecting)
      if (!visible || hasFetched.value) return
      fetchPriceData()
      if (observer) {
        observer.disconnect()
        observer = null
      }
    },
    {
      // Only queue charts actually on screen — reduces Gecko bursts
      rootMargin: '0px',
      threshold: 0.15,
    },
  )

  observer.observe(rootEl.value)
}

onMounted(() => {
  observeVisibility()
})

onUnmounted(() => {
  if (observer) {
    observer.disconnect()
    observer = null
  }
})

watch(
  () => [props.tokenAddress, props.pairAddress, props.showMinus50Line],
  () => {
    hasFetched.value = false
    priceData.value = []
    loading.value = true
    error.value = false
    if (observer) {
      observer.disconnect()
      observer = null
    }
    observeVisibility()
  },
)

watch(
  () => [props.width, props.height],
  () => {
    if (priceData.value.length > 0) {
      drawChart()
    }
  },
)
</script>

<style scoped>
.price-chart {
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading,
.error {
  color: #888;
  font-size: 0.9em;
}

canvas {
  display: block;
}
</style>
