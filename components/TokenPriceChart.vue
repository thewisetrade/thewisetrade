<template>
  <div class="price-chart">
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
const props = defineProps({
  tokenAddress: {
    type: String,
    required: true,
  },
  width: {
    type: Number,
    default: 120,
  },
  height: {
    type: Number,
    default: 40,
  },
})

const chartCanvas = ref(null)
const loading = ref(true)
const error = ref(false)
const priceData = ref([])

const fetchPriceData = async () => {
  try {
    loading.value = true
    error.value = false

    const response = await fetch(
      `https://api.dexscreener.com/latest/dex/tokens/${props.tokenAddress}`,
    )

    if (!response.ok) {
      throw new Error('Failed to fetch price data')
    }

    const data = await response.json()

    if (!data.pairs || data.pairs.length === 0) {
      throw new Error('No pairs found')
    }

    console.log('token chart data', data)
    // Find the pair with highest liquidity for most accurate data
    const pair = data.pairs.reduce((best, current) => {
      const currentLiq = current.liquidity?.usd || 0
      const bestLiq = best.liquidity?.usd || 0
      return currentLiq > bestLiq ? current : best
    })

    const pairAddress = pair.pairAddress

    try {
      const geckoResponse = await fetch(
        `https://api.geckoterminal.com/api/v2/networks/solana/pools/${pairAddress}/ohlcv/hour?aggregate=4&limit=24`,
      )

      if (geckoResponse.ok) {
        const geckoData = await geckoResponse.json()

        if (
          geckoData.data?.attributes?.ohlcv_list &&
          geckoData.data.attributes.ohlcv_list.length > 0
        ) {
          // GeckoTerminal returns [timestamp, open, high, low, close, volume]
          const prices = geckoData.data.attributes.ohlcv_list.map(
            (candle) => candle[4],
          )
          if (prices.length > 0 && prices.every((p) => p > 0)) {
            priceData.value = prices.reverse()
            drawChart()
            return
          }
        }
      }
    } catch (err) {
      console.log('GeckoTerminal API failed')
    }

    // Create a fake chart based on the price and price change
    if (pair.priceUsd && pair.priceChange) {
      const currentPrice = parseFloat(pair.priceUsd)
      const change24h = pair.priceChange.h24 || 0

      const points = 24
      const prices = []

      for (let i = 0; i < points; i++) {
        const progress = i / (points - 1)
        const changeMultiplier = 1 - change24h / 100
        const historicalPrice =
          currentPrice * (changeMultiplier + progress * (1 - changeMultiplier))
        prices.push(historicalPrice)
      }

      priceData.value = prices

      console.log('prices', prices)
      drawChart()
    } else {
      throw new Error('No price data available')
    }
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
  const minPrice = 0
  const maxPrice = Math.max(...prices)
  const priceRange = maxPrice - minPrice || 1

  const priceChange = prices[prices.length - 1] - prices[0]
  const isPositive = priceChange >= 0
  const color = isPositive ? '#99FF99' : '#FF9999'

  ctx.strokeStyle = color
  ctx.lineWidth = 1.5
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
    ? 'rgba(153, 255, 153, 0.1)'
    : 'rgba(255, 153, 153, 0.1)'
  ctx.fill()
}

onMounted(() => {
  fetchPriceData()
})
</script>

<style scoped>
.price-chart {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 120px;
  height: 40px;
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
