<template>
  <div class="chart-toolbar">
    <div class="toolbar-group" v-if="progressContext">
      <button
        class="mode"
        :class="{ active: chartType === 'profit' }"
        @click="chartType = 'profit'"
      >
        P&L
      </button>
      <button
        class="mode"
        :class="{ active: chartType === 'progress' }"
        @click="chartType = 'progress'"
      >
        Progress
      </button>
    </div>
    <div class="flex-1"></div>
    <div class="toolbar-group" v-if="props.sortBy === 'date'">
      <button
        class="mode"
        :class="{ active: groupBy === 'day' }"
        @click="groupBy = 'day'"
      >
        Day
      </button>
      <button
        class="mode"
        :class="{ active: groupBy === 'week' }"
        @click="groupBy = 'week'"
      >
        Week
      </button>
      <button
        class="mode"
        :class="{ active: groupBy === 'month' }"
        @click="groupBy = 'month'"
      >
        Month
      </button>
      <button
        class="mode"
        :class="{ active: groupBy === 'quarter' }"
        @click="groupBy = 'quarter'"
      >
        Quarter
      </button>
    </div>
  </div>
  <div class="chart-canvas">
    <Line
      ref="chartProgressRef"
      id="performance-progress-chart"
      :options="chartOptions"
      :data="chartData"
      v-if="chartType === 'progress' && progressContext"
    />
    <Bar
      ref="chartRef"
      id="performance-chart"
      :options="chartOptions"
      :data="chartData"
      v-else
    />
  </div>
</template>

<script setup>
import { Bar, Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
} from 'chart.js'
import { DateTime } from 'luxon'

ChartJS.register(
  BarElement,
  CategoryScale,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
)

const props = defineProps({
  positions: {
    type: Array,
    required: true,
  },
  sortBy: {
    type: String,
    required: true,
  },
  timePeriod: {
    type: Object,
    required: true,
  },
  quoteSymbol: {
    type: String,
    required: true,
  },
  sortOrder: {
    type: String,
    required: true,
  },
})

const chartType = ref('profit')
const groupBy = ref('day')

const CHART_POSITIVE = '#3DDC84'
const CHART_POSITIVE_HOVER = '#6BF0A8'
const CHART_POSITIVE_BORDER = '#22C55E'
const CHART_NEGATIVE = '#FF4757'
const CHART_NEGATIVE_HOVER = '#FF6B7A'
const CHART_PROGRESS_INNER = '#1B4D32'
const CHART_PROGRESS_OUTER = '#0D1110'

const getDateKey = (date) => {
  if (groupBy.value === 'week') {
    return date.toFormat("yyyy-'W'WW")
  }
  if (groupBy.value === 'month') {
    return date.toFormat('MMM yyyy')
  }
  if (groupBy.value === 'quarter') {
    return `Q${date.quarter} ${date.year}`
  }
  return date.toFormat('yyyy-MM-dd')
}

const advanceGroupedDate = (date) => {
  if (groupBy.value === 'week') {
    return date.plus({ weeks: 1 })
  }
  if (groupBy.value === 'month') {
    return date.plus({ months: 1 })
  }
  if (groupBy.value === 'quarter') {
    return date.startOf('quarter').plus({ months: 3 })
  }
  return date.plus({ days: 1 })
}

const getDateRange = () => {
  const firstBlockTime = Math.min(
    ...props.positions.map((position) => position.block_time),
  )
  let currentDate = DateTime.fromMillis(firstBlockTime * 1000)
  let endDate = props.timePeriod.end
  if (endDate > DateTime.now()) {
    endDate = DateTime.now().plus({ days: 1 })
  }
  return { currentDate, endDate }
}

const getProfitLabels = (positions) => {
  return positions.map((position) => position.base_symbol)
}

const getDateLabels = (props) => {
  let dateLabels = []
  let { currentDate, endDate } = getDateRange()

  let lastDate = null
  while (currentDate <= endDate) {
    const dateKey = getDateKey(currentDate)
    const lastDateKey = lastDate ? getDateKey(lastDate) : null
    if (dateKey !== lastDateKey) {
      dateLabels.push(dateKey)
    }
    lastDate = currentDate
    currentDate = currentDate.plus({ days: 1 })
  }

  if (props.sortOrder === 'desc' && chartType.value !== 'progress') {
    return dateLabels.reverse()
  }
  return dateLabels
}

const getPositionValues = () => {
  return props.positions.map((position) => {
    return {
      y: Math.round(position.profit * 100) / 100,
      fees: position.fee_amount,
    }
  })
}

const getDateValues = () => {
  const dateData = props.positions.reduce((acc, position) => {
    const date = DateTime.fromMillis(position.block_time * 1000)
    const label = getDateKey(date)
    acc[label] = {
      profit: (acc[label]?.profit || 0) + position.profit,
      fees: (acc[label]?.fees || 0) + position.fee_amount,
      tokens: [...(acc[label]?.tokens || []), position.base_symbol],
    }
    return acc
  }, {})

  let { currentDate, endDate } = getDateRange()
  let dateValues = []

  if (chartType.value === 'progress') {
    let previousProfit = 0
    while (currentDate <= endDate) {
      const dateKey = getDateKey(currentDate)
      const currentProfit = dateData[dateKey]?.profit || 0
      const newProfit = previousProfit + currentProfit
      const isNewEntryRequired =
        dateValues.length === 0 ||
        dateValues[dateValues.length - 1]?.key !== dateKey
      if (isNewEntryRequired) {
        dateValues.push({
          y: newProfit,
          fees: dateData[dateKey]?.fees || 0,
          tokens: dateData[dateKey]?.tokens || [],
          key: dateKey,
        })
      }
      previousProfit = newProfit
      currentDate = advanceGroupedDate(currentDate)
    }
  } else {
    while (currentDate <= endDate) {
      const dateKey = getDateKey(currentDate)
      const isNewEntryRequired =
        dateValues.length === 0 ||
        dateValues[dateValues.length - 1]?.key !== dateKey
      if (isNewEntryRequired) {
        dateValues.push({
          y: dateData[dateKey]?.profit || 0,
          fees: dateData[dateKey]?.fees || 0,
          tokens: dateData[dateKey]?.tokens || [],
          key: dateKey,
        })
      }
      currentDate = currentDate.plus({ days: 1 })
    }
  }

  if (props.sortOrder === 'desc' && chartType.value !== 'progress') {
    return dateValues.reverse()
  }
  return dateValues
}

const createGradient = (ctx, color, invert = false) => {
  let gradient = ctx.createLinearGradient(0, 0, 0, 600)
  if (chartType.value === 'progress') {
    gradient = ctx.createRadialGradient(600, 600, 0, 600, 600, 800)
    gradient.addColorStop(0, CHART_PROGRESS_INNER)
    gradient.addColorStop(1, CHART_PROGRESS_OUTER)
  } else if (invert) {
    gradient.addColorStop(0, `${color}55`)
    gradient.addColorStop(1, `${color}FF`)
  } else {
    gradient.addColorStop(0, `${color}FF`)
    gradient.addColorStop(1, `${color}55`)
  }
  return gradient
}

const formatTokensList = (tokens) => {
  return [...new Set(tokens)]
    .sort((a, b) => a.localeCompare(b))
    .reduce((acc, token, index) => {
      if (index > 0 && index % 4 === 0) {
        return acc + '\n' + token
      }
      return acc + (index === 0 ? '' : ', ') + token
    }, '')
}

const progressContext = computed(() => {
  return props.sortBy === 'date'
})

const labels = computed(() => {
  if (props.sortBy === 'profit') {
    return getProfitLabels(props.positions)
  } else if (props.sortBy === 'date') {
    return getDateLabels(props)
  }
})

const data = computed(() => {
  if (props.sortBy === 'profit') {
    return getPositionValues()
  } else if (props.sortBy === 'date') {
    return getDateValues()
  }
})

const chartData = computed(() => ({
  labels: labels.value,
  datasets: [
    {
      data: data.value.map((item, index) => ({
        y: item.y,
        x: index,
        fees: item.fees,
        tokens: item.tokens,
      })),
      borderColor: CHART_POSITIVE_BORDER,
      borderWidth: chartType.value === 'progress' && progressContext.value ? 1 : 0,
      fill: true,
      pointRadius: 0,
      hoverBackgroundColor: (context) => {
        const value = context.raw ? context.raw.y : 0
        return value >= 0 ? CHART_POSITIVE_HOVER : CHART_NEGATIVE_HOVER
      },
      backgroundColor: (context) => {
        const chart = context.chart
        const { ctx } = chart
        const value = context.raw ? context.raw.y : 0
        return value >= 0
          ? createGradient(ctx, CHART_POSITIVE)
          : createGradient(ctx, CHART_NEGATIVE, true)
      },
      tension: 0.3,
    },
  ],
}))

const yScaleBounds = computed(() => {
  const items = data.value || []
  if (!items.length) {
    return { min: -1, max: 1 }
  }

  const values = items.map((item) => item.y)
  const limit = Math.max(
    Math.abs(Math.max(...values)),
    Math.abs(Math.min(...values)),
    0.01,
  )
  const padded = limit * 1.08

  return { min: -padded, max: padded }
})

const chartOptions = computed(() => ({
  responsive: true,
  interaction: {
    mode: 'index',
    intersect: false,
  },
  hover: {
    mode: 'index',
    intersect: false,
  },
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      callbacks: {
        title: (tooltipItems) => {
          if (props.sortBy === 'date') {
            return `${tooltipItems[0].label.toUpperCase()}`
          } else {
            return `${tooltipItems[0].label.toUpperCase()} - ${props.quoteSymbol}`
          }
        },
        label: (context) => [],
        footer: (tooltipItems) => {
          let text =
            `P&L: ${tooltipItems[0].raw.y.toFixed(2)} ${props.quoteSymbol} \n` +
            `Fees:  ${tooltipItems[0].raw.fees.toFixed(2)} ${props.quoteSymbol}`
          if (props.sortBy === 'date') {
            text += `\nTokens: \n${formatTokensList(tooltipItems[0].raw.tokens)}`
          }
          return text
        },
      },
    },
  },
  scales: {
    x: {
      border: {
        display: true,
        color: '#333',
      },
      grid: {
        display: false,
      },
    },
    y: {
      min: yScaleBounds.value.min,
      max: yScaleBounds.value.max,
      border: {
        display: true,
        color: '#333',
      },
      grid: {
        display: chartType.value === 'profit',
        color: (context) => (context.tick.value === 0 ? '#555' : '#222'),
        lineWidth: (context) => (context.tick.value === 0 ? 1.5 : 1),
      },
      ticks: {
        callback: (value) => {
          const rounded = Math.round(value * 100) / 100
          return Number.isInteger(rounded) ? rounded : rounded.toFixed(2)
        },
      },
    },
  },
}))

watch(progressContext, () => {
  if (!progressContext.value) {
    chartType.value = 'profit'
  }
})

const chartRef = ref(null)
const chartProgressRef = ref(null)

const getActiveChart = () => {
  if (chartType.value === 'progress' && progressContext.value) {
    return chartProgressRef.value?.chart
  }
  return chartRef.value?.chart
}

const getChartImage = () => {
  const chart = getActiveChart()
  if (!chart) return null

  const previousPadding = chart.options.layout?.padding
  chart.options.layout = {
    ...chart.options.layout,
    padding: {
      top: 8,
      right: 24,
      bottom: 8,
      left: 8,
    },
  }
  chart.update('none')

  const image = chart.toBase64Image('image/png', 2)

  chart.options.layout = {
    ...chart.options.layout,
    padding: previousPadding ?? 0,
  }
  chart.update('none')

  return image
}

defineExpose({
  getChartImage,
})
</script>

<style scoped>
.chart-toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem 0.5rem;
}

.toolbar-group {
  display: inline-flex;
  padding: 3px;
  border: 1px solid #2a2a2a;
  border-radius: 8px;
  background: #0f0f12;
}

.mode {
  color: #888;
  cursor: pointer;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  padding: 0.4rem 0.75rem;
  border: none;
  border-radius: 6px;
  background: transparent;
  transition: color 0.15s ease, background 0.15s ease;
}

.mode:hover {
  color: #bbb;
}

.mode.active {
  color: #eee;
  background: #222;
}

.chart-canvas {
  padding: 0 0.5rem;
}
</style>
