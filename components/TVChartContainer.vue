<template>
  <div class="chart-wrapper" :style="{ height: `${height}px` }">
    <!-- Loading State -->
    <div v-if="isLoading" class="loading-overlay">
      <div class="spinner"></div>
      <span>Loading chart...</span>
    </div>

    <!-- Error State -->
    <div v-if="error" class="error-overlay">
      <div class="error-content">
        <span>❌ {{ error }}</span>
        <button @click="retry" class="retry-btn">Retry</button>
      </div>
    </div>

    <!-- Chart Container -->
    <div :id="containerId" class="chart-container" ref="chartElement" v-show="!isLoading && !error"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'

const props = defineProps({
  symbol: {
    type: String,
    default: 'BINANCE:BTCUSDT'
  },
  interval: {
    type: String,
    default: '15'
  },
  height: {
    type: Number,
    default: 400
  },
  width: {
    type: [String, Number],
    default: '100%'
  },
  theme: {
    type: String,
    default: 'dark',
    validator: (value) => ['light', 'dark'].includes(value)
  },
  autosize: {
    type: Boolean,
    default: true
  },
  hideTopToolbar: {
    type: Boolean,
    default: false
  },
  hideLegend: {
    type: Boolean,
    default: false
  },
  saveImage: {
    type: Boolean,
    default: false
  },
  studies: {
    type: Array,
    default: () => ['Volume@tv-basicstudies']
  },
})

const emit = defineEmits(['ready', 'error'])

// Reactive state
const isLoading = ref(true)
const error = ref(null)
const chartElement = ref(null)

// Generate unique container ID
const containerId = `tradingview_${Math.random().toString(36).substr(2, 9)}`

let widget = null
let retryCount = 0
const maxRetries = 3

// Method 1: TradingView Widget (Most Reliable)
const createWidget = async () => {
  try {
    isLoading.value = true
    error.value = null

    await nextTick()

    const container = document.getElementById(containerId)
    if (!container) {
      throw new Error('Chart container not found')
    }

    // Clear existing content
    container.innerHTML = ''

    // Create widget configuration
    const config = {
      autosize: props.autosize,
      symbol: props.symbol,
      interval: props.interval,
      timezone: "Etc/UTC",
      theme: props.theme,
      style: "1",
      locale: "en",
      toolbar_bg: props.theme === 'dark' ? "#131722" : "#f1f3f6",
      enable_publishing: false,
      allow_symbol_change: true,
      details: false,
      hotlist: false,
      calendar: false,
      studies: props.studies,
      hide_top_toolbar: props.hideTopToolbar,
      hide_legend: props.hideLegend,
      hide_side_toolbar: false, // This is the correct property name
      save_image: props.saveImage,
      container_id: containerId,
      // Enable essential features for side toolbar
      enabled_features: [
        "left_toolbar",
        "side_toolbar_in_fullscreen_mode",
        "header_symbol_search",
        "symbol_search_hot_key",
        "drawing_templates",
        "study_templates",
        "border_around_the_chart",
        "header_chart_type",
        "header_compare",
        "compare_symbol",
        "header_screenshot",
        "header_undo_redo",
        "header_fullscreen_button",
        "use_localstorage_for_settings"
      ],
      // Ensure side toolbar features are not disabled
      disabled_features: [
        // Remove any features that might hide the toolbar
        // "left_toolbar" // Make sure this is NOT in disabled_features
      ],
      // Custom overrides for better styling
      overrides: {
        "paneProperties.background": props.theme === 'dark' ? "#131722" : "#ffffff",
        "paneProperties.vertGridProperties.color": props.theme === 'dark' ? "#363c4e" : "#e1e3e8",
        "paneProperties.horzGridProperties.color": props.theme === 'dark' ? "#363c4e" : "#e1e3e8",
        "symbolWatermarkProperties.transparency": 90,
        "scalesProperties.textColor": props.theme === 'dark' ? "#d1d4dc" : "#131722",
        "mainSeriesProperties.candleStyle.upColor": "#26a69a",
        "mainSeriesProperties.candleStyle.downColor": "#ef5350",
        "mainSeriesProperties.candleStyle.borderUpColor": "#26a69a",
        "mainSeriesProperties.candleStyle.borderDownColor": "#ef5350",
        "mainSeriesProperties.candleStyle.wickUpColor": "#26a69a",
        "mainSeriesProperties.candleStyle.wickDownColor": "#ef5350"
      }
    }

    // Create widget HTML structure
    const widgetContainer = document.createElement('div')
    widgetContainer.className = 'tradingview-widget-container'
    widgetContainer.style.height = '100%'
    widgetContainer.style.width = '100%'

    const widgetInner = document.createElement('div')
    widgetInner.className = 'tradingview-widget-container__widget'
    widgetInner.style.height = '100%'
    widgetInner.style.width = '100%'

    const configScript = document.createElement('script')
    configScript.type = 'text/javascript'
    configScript.async = true
    configScript.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js'
    configScript.innerHTML = JSON.stringify(config)

    widgetContainer.appendChild(widgetInner)
    widgetContainer.appendChild(configScript)
    container.appendChild(widgetContainer)

    // Wait for widget to load
    setTimeout(() => {
      isLoading.value = false
      emit('ready')
    }, 2000)

  } catch (err) {
    handleError(err.message)
  }
}

// Method 2: Iframe fallback
const createIframe = () => {
  try {
    isLoading.value = true
    error.value = null

    const container = document.getElementById(containerId)
    if (!container) {
      throw new Error('Chart container not found')
    }

    container.innerHTML = ''

    // Build iframe URL with parameters
    const params = new URLSearchParams({
      frameElementId: containerId,
      symbol: props.symbol,
      interval: props.interval,
      hide_side_toolbar: '0', // Correct parameter name for iframe
      hidetoptoolbar: props.hideTopToolbar ? '1' : '0',
      symboledit: '1',
      saveimage: props.saveImage ? '1' : '0',
      toolbarbg: props.theme === 'dark' ? '131722' : 'f1f3f6',
      studies: '[]',
      theme: props.theme,
      style: '1',
      timezone: 'Etc/UTC'
    })

    const iframe = document.createElement('iframe')
    iframe.src = `https://s.tradingview.com/widgetembed/?${params.toString()}`
    iframe.style.width = '100%'
    iframe.style.height = '100%'
    iframe.style.border = 'none'
    iframe.frameBorder = '0'
    iframe.allowTransparency = 'true'
    iframe.scrolling = 'no'
    iframe.allowFullscreen = true

    iframe.onload = () => {
      isLoading.value = false
      emit('ready')
    }

    iframe.onerror = () => {
      handleError('Failed to load chart iframe')
    }

    container.appendChild(iframe)

  } catch (err) {
    handleError(err.message)
  }
}

// Error handling
const handleError = (message) => {
  error.value = message
  isLoading.value = false
  emit('error', message)
  console.error('TradingView Chart Error:', message)
}

// Retry mechanism
const retry = () => {
  if (retryCount < maxRetries) {
    retryCount++
    console.log(`Retrying chart creation (${retryCount}/${maxRetries})`)

    // Try iframe method on retry
    if (retryCount === 1) {
      createWidget()
    } else {
      createIframe()
    }
  } else {
    handleError('Max retries reached. Please refresh the page.')
  }
}

// Initialize chart
const initChart = () => {
  if (!process.client) return

  retryCount = 0
  createWidget()
}

// Cleanup
const cleanup = () => {
  if (widget && widget.remove) {
    try {
      widget.remove()
      widget = null
    } catch (err) {
      console.error('Error removing widget:', err)
    }
  }

  const container = document.getElementById(containerId)
  if (container) {
    container.innerHTML = ''
  }
}

// Update symbol
const updateSymbol = (newSymbol) => {
  if (widget && widget.setSymbol) {
    widget.setSymbol(newSymbol, props.interval)
  } else {
    // Recreate chart with new symbol
    cleanup()
    initChart()
  }
}

// Lifecycle
onMounted(() => {
  initChart()
})

onUnmounted(() => {
  cleanup()
})

// Watch for symbol changes
watch(() => props.symbol, (newSymbol) => {
  if (newSymbol) {
    updateSymbol(newSymbol)
  }
})

// Watch for theme changes
watch(() => props.theme, () => {
  cleanup()
  initChart()
})

// Expose methods for parent components
defineExpose({
  updateSymbol,
  retry,
  cleanup
})
</script>

<style scoped>
.chart-wrapper {
  position: relative;
  width: 100%;
  background: #131722;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #333;
}

.chart-container {
  width: 100%;
  height: 100%;
  background: #131722;
  min-height: 400px; /* Ensure minimum height for toolbar visibility */
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
}

.loading-overlay {
  gap: 12px;
}

.error-overlay {
  gap: 16px;
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
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
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
  transform: translateY(-1px);
}

/* Ensure TradingView widget fills container and toolbar is visible */
:deep(.tradingview-widget-container) {
  height: 100% !important;
  width: 100% !important;
}

:deep(.tradingview-widget-container__widget) {
  height: 100% !important;
  width: 100% !important;
}

:deep(iframe) {
  border-radius: 0 !important;
}

/* Ensure side toolbar is not hidden by CSS */
:deep(.chart-container *) {
  overflow: visible !important;
}
</style>