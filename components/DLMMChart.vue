<template>
  <div class="dlmm-chart-wrapper" :style="{ height: `${height}px` }">
    <!-- Loading State -->
    <div v-if="isLoading" class="loading-overlay">
      <div class="spinner"></div>
      <span>Loading DLMM data...</span>
    </div>

    <!-- Error State -->
    <div v-if="error" class="error-overlay">
      <div class="error-content">
        <span>❌ {{ error }}</span>
        <button @click="retry" class="retry-btn">Retry</button>
      </div>
    </div>

    <!-- Pair Info Display -->
    <div v-if="pairInfo && !isLoading && !error" class="pair-info">
      <span class="pair-name">{{ pairInfo.baseToken?.symbol }}/{{ pairInfo.quoteToken?.symbol }}</span>
      <span class="pair-price">${{ formatPrice(currentPrice || pairInfo.priceUsd) }}</span>
      <span class="pair-change" :class="getPriceChangeClass(pairInfo.priceChange?.h24)">
        {{ pairInfo.priceChange?.h24 > 0 ? '+' : '' }}{{ (pairInfo.priceChange?.h24 || 0).toFixed(2) }}%
      </span>
    </div>

    <!-- Chart Container -->
    <div 
      ref="chartContainer" 
      class="chart-container" 
      v-show="!isLoading && !error"
    ></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { createChart,CandlestickSeries, HistogramSeries,ColorType } from 'lightweight-charts'

const props = defineProps({
  pairAddress: {
    type: String,
    required: true
  },
  interval: {
    type: String,
    default: '15'
  },
  height: {
    type: Number,
    default: 500
  },
  theme: {
    type: String,
    default: 'dark'
  },
  showVolume: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['ready', 'error', 'priceUpdate', 'pairLoaded'])

// State
const isLoading = ref(true)
const error = ref(null)
const pairInfo = ref(null)
const currentPrice = ref(null)
const chartContainer = ref(null)

let chart = null
let candlestickSeries = null
let volumeSeries = null

// Initialize chart
const initChart = async () => {
  try {
    isLoading.value = true
    error.value = null

    await nextTick()

    if (!chartContainer.value) {
      throw new Error('Chart container not found')
    }

    // Create chart
    chart = createChart(chartContainer.value, {
      layout: {
        background: { 
          type: ColorType.Solid, 
          color: props.theme === 'dark' ? '#131722' : '#ffffff' 
        },
        textColor: props.theme === 'dark' ? '#d1d4dc' : '#191919',
      },
      width: chartContainer.value.clientWidth,
      height: props.height - 40,
      grid: {
        vertLines: { color: props.theme === 'dark' ? '#363c4e' : '#e1e3e8' },
        horzLines: { color: props.theme === 'dark' ? '#363c4e' : '#e1e3e8' },
      },
      crosshair: { mode: 1 },
      rightPriceScale: {
        borderColor: props.theme === 'dark' ? '#485c7b' : '#cccccc',
        scaleMargins: { top: 0.1, bottom: props.showVolume ? 0.3 : 0.1 },
      },
      timeScale: {
        borderColor: props.theme === 'dark' ? '#485c7b' : '#cccccc',
        timeVisible: true,
        secondsVisible: false,
      },
    })

    // Add candlestick series
    candlestickSeries = chart.addSeries(CandlestickSeries,{
      upColor: '#26a69a',
      downColor: '#ef5350',
      borderVisible: false,
      wickUpColor: '#26a69a',
      wickDownColor: '#ef5350',
    })

    // Add volume series
    if (props.showVolume) {
      volumeSeries = chart.addSeries(HistogramSeries,{
        color: '#26a69a80',
        priceFormat: { type: 'volume' },
        priceScaleId: 'volume',
        scaleMargins: { top: 0.7, bottom: 0 },
      })
    }

    // Load data
    await loadData()

    console.log('✅ DLMM Chart ready')
    emit('ready')

  } catch (err) {
    console.error('❌ Chart error:', err)
    error.value = err.message
    emit('error', err.message)
  } finally {
    isLoading.value = false
  }
}

// Load DLMM data
const loadData = async () => {
  try {
    // 1. Load pair info
    console.log(`🔄 Loading pair: ${props.pairAddress}`)
    
    const pairResponse = await fetch(
      `https://api.dexscreener.com/latest/dex/pairs/solana/${props.pairAddress}`
    )
    
    if (!pairResponse.ok) {
      throw new Error(`API error: ${pairResponse.status}`)
    }
    
    const pairData = await pairResponse.json()
    
    if (!pairData.pair) {
      throw new Error('Pair not found')
    }
    
    pairInfo.value = pairData.pair
    emit('pairLoaded', pairData.pair)
    
    // 2. Load OHLC data
    const timeframeMap = {
      '1': '1m', '5': '5m', '15': '15m', '30': '30m',
      '60': '1h', '240': '4h', '1D': '1d'
    }
    
    const timeframe = timeframeMap[props.interval] || '15m'
    
    console.log(`📊 Loading OHLC: ${timeframe}`)
    const url = 'https://api.coingecko.com/api/v3/onchain/networks/network/pools/pool_address/ohlcv/day?include_empty_intervals=false';

    const options = {
      method: 'GET',
      headers: {accept: 'application/json', 'x-cg-demo-api-key': 'CG-YJXT8e25gXJhnagQBHJBZHMs'}
    };
    const ohlcResponse = await fetch(url,  options  )
    console.log("🚀 ~ loadData ~ ohlcResponse:", ohlcResponsebody)
    
    if (!ohlcResponse.ok) {
      throw new Error(`OHLC API error: ${ohlcResponse.status}`)
    }
    
    const ohlcData = await ohlcResponse.json()
    
    if (!ohlcData.ohlcv || ohlcData.ohlcv.length === 0) {
      throw new Error('No chart data available')
    }
    
    // 3. Transform and set data
    const candleData = ohlcData.ohlcv.map(candle => ({
      time: candle.t,
      open: parseFloat(candle.o),
      high: parseFloat(candle.h),
      low: parseFloat(candle.l),
      close: parseFloat(candle.c)
    })).sort((a, b) => a.time - b.time)
    
    candlestickSeries.setData(candleData)
    
    // Volume data
    if (volumeSeries && props.showVolume) {
      const volumeData = ohlcData.ohlcv.map(candle => ({
        time: candle.t,
        value: parseFloat(candle.v || 0),
        color: parseFloat(candle.c) >= parseFloat(candle.o) ? '#26a69a40' : '#ef535040'
      })).sort((a, b) => a.time - b.time)
      
      volumeSeries.setData(volumeData)
    }
    
    // Fit content
    chart.timeScale().fitContent()
    
    // Update current price
    if (candleData.length > 0) {
      const latest = candleData[candleData.length - 1]
      currentPrice.value = latest.close
      emit('priceUpdate', { price: latest.close, time: latest.time })
    }
    
    console.log(`✅ Loaded ${candleData.length} candles`)
    
  } catch (err) {
    console.error('❌ Data loading error:', err)
    throw err
  }
}

// Helper functions
const formatPrice = (price) => {
  if (!price) return '0.00'
  const num = parseFloat(price)
  if (num < 0.01) return num.toFixed(6)
  if (num < 1) return num.toFixed(4)
  if (num < 10) return num.toFixed(3)
  return num.toFixed(2)
}

const getPriceChangeClass = (change) => {
  if (change > 0) return 'positive'
  if (change < 0) return 'negative'
  return ''
}

const retry = () => {
  cleanup()
  setTimeout(initChart, 1000)
}

const cleanup = () => {
  if (chart) {
    chart.remove()
    chart = null
    candlestickSeries = null
    volumeSeries = null
  }
}

// Lifecycle
onMounted(() => {
  if (props.pairAddress) {
    initChart()
  }
})

onUnmounted(cleanup)

// Watch for changes
watch(() => props.pairAddress, (newAddress) => {
  if (newAddress) {
    cleanup()
    setTimeout(initChart, 500)
  }
})

watch(() => props.interval, () => {
  if (chart) {
    loadData()
  }
})

// Expose methods
defineExpose({ retry, cleanup })
</script>

<style scoped>
.dlmm-chart-wrapper {
  position: relative;
  width: 100%;
  background: #131722;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #333;
}

.pair-info {
  position: absolute;
  top: 8px;
  left: 8px;
  z-index: 100;
  display: flex;
  align-items: center;
  gap: 12px;
  background: rgba(19, 23, 34, 0.95);
  padding: 8px 12px;
  border-radius: 6px;
  backdrop-filter: blur(8px);
  border: 1px solid #333;
  font-size: 13px;
}

.pair-name {
  color: #d1d4dc;
  font-weight: 600;
}

.pair-price {
  color: #d1d4dc;
  font-weight: 500;
}

.pair-change {
  font-weight: 500;
}

.pair-change.positive {
  color: #26a69a;
}

.pair-change.negative {
  color: #ef5350;
}

.chart-container {
  width: 100%;
  height: 100%;
}

.loading-overlay,
.error-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #131722;
  color: #d1d4dc;
  z-index: 10;
  gap: 12px;
}

.error-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  text-align: center;
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #333;
  border-top: 3px solid #26a69a;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.retry-btn {
  background: #26a69a;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
}

.retry-btn:hover {
  background: #20948a;
}
</style>