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
import Datafeed from '@/utils/ohlc/datafeed.js';
import datafeed from '@/utils/ohlc/datafeed.js';

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

// Check if TradingView is loaded
const checkTradingViewLoaded = () => {
  return new Promise((resolve) => {
    if (window.TradingView) {
      resolve(true)
      return
    }

    const checkInterval = setInterval(() => {
      if (window.TradingView) {
        clearInterval(checkInterval)
        resolve(true)
      }
    }, 100)

    // Timeout after 10 seconds
    setTimeout(() => {
      clearInterval(checkInterval)
      resolve(false)
    }, 10000)
  })
}

// Load TradingView script if not already loaded
const loadTradingViewScript = () => {
  return new Promise((resolve, reject) => {
    if (window.TradingView) {
      resolve()
      return
    }

    const script = document.createElement('script')
    script.type = 'text/javascript'
    script.src = 'https://s3.tradingview.com/charting_library/charting_library.min.js'
    script.async = true
    
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Failed to load TradingView script'))
    
    document.head.appendChild(script)
  })
}

// Alternative: Use TradingView Widget (Embedded)
const createEmbeddedWidget = async () => {
  try {
    console.log("creating tv")
    isLoading.value = true
    error.value = null

    await nextTick()

    const container = document.getElementById(containerId)
    if (!container) {
      throw new Error('Chart container not found')
    }

    // Clear existing content
    container.innerHTML = ''
    console.log(Datafeed);
    // Create the widget configuration
    const widgetConfig = {
      datafeed: Datafeed,
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
      hide_side_toolbar: false,
      save_image: props.saveImage,
      container_id: containerId,
      width: "100%",
      height: props.height,
      enabled_features: [
        "left_toolbar",
        "side_toolbar_in_fullscreen_mode",
        "header_symbol_search",
        "symbol_search_hot_key"
      ],
      overrides: {
        "paneProperties.background": props.theme === 'dark' ? "#131722" : "#ffffff",
        "paneProperties.vertGridProperties.color": props.theme === 'dark' ? "#363c4e" : "#e1e3e8",
        "paneProperties.horzGridProperties.color": props.theme === 'dark' ? "#363c4e" : "#e1e3e8",
        "symbolWatermarkProperties.transparency": 90,
        "scalesProperties.textColor": props.theme === 'dark' ? "#d1d4dc" : "#131722"
      }
    }

    // Method 1: Try Advanced Chart Widget
    if (window.TradingView && window.TradingView.widget) {
      widget = new window.TradingView.widget(widgetConfig)
      
      widget.onChartReady(() => {
        isLoading.value = false
        emit('ready')
      })
    } else {
      // Method 2: Use embedded iframe approach
      createIframe()
    }

  } catch (err) {
    console.error('Widget creation error:', err)
    createIframe() // Fallback to iframe
  }
}

// Iframe fallback method
const createIframe = () => {
  try {
    const container = document.getElementById(containerId)
    if (!container) {
      throw new Error('Chart container not found')
    }

    container.innerHTML = ''

    // Build iframe URL
    const params = new URLSearchParams({
      datafeed: Datafeed,
      frameElementId: containerId,
      //symbol: props.symbol,
      interval: props.interval,
      hide_side_toolbar: '0',
      hidetoptoolbar: props.hideTopToolbar ? '1' : '0',
      symboledit: '1',
      saveimage: props.saveImage ? '1' : '0',
      toolbarbg: props.theme === 'dark' ? '131722' : 'f1f3f6',
      studies: 'Volume@tv-basicstudies',
      theme: props.theme,
      style: '1',
      timezone: 'Etc/UTC',
      autosize: '1'
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

    let loadTimeout = setTimeout(() => {
      if (isLoading.value) {
        handleError('Chart loading timeout')
      }
    }, 15000)

    iframe.onload = () => {
      clearTimeout(loadTimeout)
      setTimeout(() => {
        isLoading.value = false
        emit('ready')
      }, 1000) // Give iframe content time to render
    }

    iframe.onerror = () => {
      clearTimeout(loadTimeout)
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
    cleanup()
    initChart()
  } else {
    handleError('Max retries reached. Please refresh the page.')
  }
}

// Initialize chart
const initChart = async () => {
  try {
    // Skip if we're in SSR environment
    if (typeof window === 'undefined') return

    retryCount = 0
    
    // Always start with iframe method for reliability
    createIframe()
    
  } catch (err) {
    handleError(err.message)
  }
}

// Cleanup
const cleanup = () => {
  if (widget && typeof widget.remove === 'function') {
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

// Lifecycle
onMounted(() => {
  // Add delay to ensure DOM is fully ready
  setTimeout(() => {
    initChart()
  }, 100)
})

onUnmounted(() => {
  cleanup()
})

// Watch for symbol changes
watch(() => props.symbol, (newSymbol) => {
  if (newSymbol && !isLoading.value) {
    cleanup()
    initChart()
  }
})

// Watch for theme changes
watch(() => props.theme, () => {
  if (!isLoading.value) {
    cleanup()
    initChart()
  }
})

// Expose methods
defineExpose({
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
  min-height: 400px;
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
  transform: translateY(-1px);
}

/* Ensure iframe fills container properly */
:deep(iframe) {
  border-radius: 0 !important;
  display: block !important;
}

:deep(.tradingview-widget-container) {
  height: 100% !important;
  width: 100% !important;
}
</style>