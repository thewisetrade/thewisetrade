<template>
  <div class="flex flex-row">
    <button
      class="mode"
      :class="{ active: chartType === 'profit' }"
      @click="chartType = 'profit'"
      v-if="progressContext"
    >
      P&L
    </button>
    <button
      class="mode"
      :class="{ active: chartType === 'progress' }"
      @click="chartType = 'progress'"
      v-if="progressContext"
    >
      Progress
    </button>
    <div class="flex-1"></div>
    <button
      class="mode"
      :class="{ active: groupBy === 'day' }"
      @click="groupBy = 'day'"
      v-if="props.sortBy === 'date'"
    >
      Day
    </button>
    <button
      class="mode"
      :class="{ active: groupBy === 'week' }"
      @click="groupBy = 'week'"
      v-if="props.sortBy === 'date'"
    >
      Week
    </button>
    <button
      class="mode"
      :class="{ active: groupBy === 'month' }"
      @click="groupBy = 'month'"
      v-if="props.sortBy === 'date'"
    >
      Month
    </button>
  </div>
  <div>
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

const getDateKey = (date) => {
  let key = ''
  if (groupBy.value === 'week') {
    key = date.toFormat("yyyy-'W'WW")
  } else if (groupBy.value === 'month') {
    key = date.toFormat('MMM yyyy')
  } else {
    key = date.toFormat('yyyy-MM-dd')
  }
  return key
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

  if (props.sortOrder === 'desc') {
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
      if (groupBy.value === 'day') {
        currentDate = currentDate.plus({ days: 1 })
      } else if (groupBy.value === 'week') {
        currentDate = currentDate.plus({ weeks: 1 })
      } else if (groupBy.value === 'month') {
        currentDate = currentDate.plus({ months: 1 })
      }
    }
  } else {
    while (currentDate <= endDate) {
      const dateKey = getDateKey(currentDate)
      const isNewEntryRequired =
        dateValues.length === 0 ||
        dateValues[dateValues.length - 1]?.key !== dateKey
      if (isNewEntryRequired) {
        console.log(dateData[dateKey]?.tokens, 'tokens')
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

  if (props.sortOrder === 'desc') {
    return dateValues.reverse()
  }
  return dateValues
}

const createGradient = (ctx, color, invert = false) => {
  let gradient = ctx.createLinearGradient(0, 0, 0, 600)
  if (chartType.value === 'progress') {
    gradient = ctx.createRadialGradient(600, 600, 0, 600, 600, 800)
    gradient.addColorStop(0, `#224422`)
    gradient.addColorStop(1, `#111111`)
  } else if (invert) {
    gradient.addColorStop(0, `${color}00`)
    gradient.addColorStop(1, `${color}FF`)
  } else {
    gradient.addColorStop(0, `${color}FF`)
    gradient.addColorStop(1, `${color}00`)
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
  return props.sortBy === 'date' && props.sortOrder === 'asc'
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
      borderColor: '#99FF99',
      borderWidth: chartType.value === 'progress' && progressContext.value ? 1 : 0,
      fill: true,
      pointRadius: 0,
      hoverBackgroundColor: (context) => {
        const chart = context.chart
        const { ctx } = chart
        const value = context.raw ? context.raw.y : 0
        return value >= 0 ? '#BBFFBB' : '#FFBBBB'
      },
      backgroundColor: (context) => {
        const chart = context.chart
        const { ctx } = chart
        const value = context.raw ? context.raw.y : 0
        return value >= 0
          ? createGradient(ctx, '#99FF99')
          : createGradient(ctx, '#FF9999', true)
      },
      tension: 0.3,
    },
  ],
}))

const chartOptions = {
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
      border: {
        display: true,
        color: '#333',
      },
      grid: {
        display: chartType.value === 'profit',
        color: '#222',
      },
    },
  },
}

watch(progressContext, () => {
  if (!progressContext.value) {
    chartType.value = 'profit'
  }
})
</script>

<style scoped>
.mode {
  color: #aaa;
  cursor: pointer;
  font-size: 0.9em;
  margin-right: 10px;
  margin-bottom: 0.5em;

  &.active {
    color: #eee;
  }
}
</style>
