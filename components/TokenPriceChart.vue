<template>
  <div
    ref="rootEl"
    class="price-chart"
    :style="{ minWidth: `${width}px`, height: `${height}px` }"
  >
    <div v-if="loading" class="loading">...</div>
    <div v-else-if="error" class="error">-</div>
    <canvas
      v-show="!loading && !error"
      ref="chartCanvas"
      :width="width"
      :height="height"
    />
  </div>
</template>

<script setup>
import { getDexScreenerPairByAddress } from '@/utils/dexscreener'
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

const priceFromChange = (currentPrice, changePct) => {
  if (!Number.isFinite(changePct)) return null
  const denominator = 1 + changePct / 100
  if (!Number.isFinite(denominator) || Math.abs(denominator) < 1e-9) return null
  const price = currentPrice / denominator
  return price > 0 ? price : null
}

// DexScreener m5/h1/h6/h24 fallback when Gecko is rate-limited
const buildSyntheticPrices = (pair) => {
  const currentPrice = parseFloat(pair?.priceUsd)
  if (!Number.isFinite(currentPrice) || currentPrice <= 0) return null

  const pc = pair?.priceChange || {}
  const anchors = [{ hour: 0, price: currentPrice }]
  const windows = [
    { hour: 5 / 60, change: pc.m5 },
    { hour: 1, change: pc.h1 },
    { hour: 6, change: pc.h6 },
    { hour: 24, change: pc.h24 },
  ]

  for (const window of windows) {
    const price = priceFromChange(currentPrice, window.change)
    if (price) anchors.push({ hour: window.hour, price })
  }

  if (anchors.length < 2) return null

  const oldest = anchors[anchors.length - 1]
  if (oldest.hour < 72) {
    anchors.push({ hour: 72, price: oldest.price })
  }

  anchors.sort((a, b) => b.hour - a.hour)

  const points = 72
  const prices = []

  for (let i = 0; i < points; i++) {
    const hourAgo = 72 - (i / (points - 1)) * 72

    let left = anchors[0]
    let right = anchors[anchors.length - 1]
    for (let j = 0; j < anchors.length - 1; j++) {
      if (hourAgo <= anchors[j].hour && hourAgo >= anchors[j + 1].hour) {
        left = anchors[j]
        right = anchors[j + 1]
        break
      }
    }

    const span = left.hour - right.hour || 1
    const t = Math.min(1, Math.max(0, (left.hour - hourAgo) / span))
    const logPrice =
      Math.log(left.price) * (1 - t) + Math.log(right.price) * t
    prices.push(Math.exp(logPrice))
  }

  return prices
}

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

    // 1) Dex fallback first — always something on screen even if Gecko is blocked
    let synthetic = null
    try {
      const pair = await getDexScreenerPairByAddress(props.pairAddress)
      synthetic = buildSyntheticPrices(pair)
      if (synthetic) {
        await showPrices(synthetic)
      }
    } catch (err) {
      console.warn('DexScreener fallback failed:', err)
    }

    // 2) Upgrade to real 72h OHLCV when Gecko allows it
    const prices = await getGeckoOhlcvPrices(props.pairAddress)
    if (await showPrices(prices)) return

    if (!synthetic) {
      throw new Error('No price data available')
    }
  } catch (err) {
    console.error('Error fetching price data:', err)
    if (priceData.value.length === 0) {
      error.value = true
    }
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
