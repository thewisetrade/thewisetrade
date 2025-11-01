<template>
  <div id="pool-finder" class="container">
    <AppHeader
      title="DLMM Pool Finder"
      link="https://tokleo.com/"
      author="Tokleo API"
    />

    <div class="filters">
      <div class="toggle flex flex-row">
        <ToggleButtons
          class="mr-5 filter"
          label="Bin Step"
          :values="[
            { text: '250', value: 250 },
            { text: '200', value: 200 },
            { text: '100', value: 100 },
            { text: '80', value: 80 },
            { text: '20', value: 20 },
          ]"
          v-model="binStep"
        />
        <ToggleButtons
          class="mr-5 filter"
          label="Market Cap"
          :values="[
            { text: '> 1M', value: 1 },
            { text: '> 10M', value: 10 },
            { text: '> 100M', value: 100 },
          ]"
          v-model="marketCap"
        />
        <ToggleButtons
          class="mr-5 filter"
          label="Liquidity"
          :values="[
            { text: '> 10k', value: 10 },
            { text: '> 100k', value: 100 },
            { text: '> 500k', value: 500 },
          ]"
          v-model="liquidity"
        />
        <ToggleButtons
          class="filter"
          label="Age"
          :values="[
            { text: '>1d', value: 1 },
            { text: '>3d', value: 3 },
            { text: '>7d', value: 7 },
          ]"
          v-model="age"
        />
        <RefreshButton class="mt-6" @refresh="loadPoolsData" />
      </div>
    </div>

    <div class="filter-headers flex flex-row">
      <span class="fees">Fees</span>
      <span class="name">Name</span>
      <span class="gen-fees">24h fees</span>
      <span class="two-fees">2h fees</span>
      <span class="chart-col">72h Chart</span>
      <span class="flex-1"></span>
      <span class="liq">Liquidity</span>
      <span class="mc">MC</span>
    </div>

    <div class="pools" ref="poolsContainerRef">
      <Loader v-if="isLoading" />
      <template v-else>
        <div
          :key="pool.id"
          class="pool-container"
          v-for="pool in displayedPools"
        >
          <a
            target="_blank"
            :href="`https://app.meteora.ag/dlmm/${pool.meteora_address}`"
          >
            <div
              class="pool flex flex-row gap-4 items-center rounded-xl border-2"
            >
              <span class="data pool-parameters"
                >{{ pool.meteora_baseFeePercentage }}%</span
              >
              <h2>{{ pool.meteora_name }}</h2>
              <span class="fee-ratio font-bold"
                >{{ pool.meteora_feeTvlRatio.h24.toFixed(2) }}%</span
              >
              <span class="fee-ratio font-bold"
                >{{ pool.meteora_feeTvlRatio.h2.toFixed(2) }}%</span
              >
              <a
                target="_blank"
                :href="`https://www.birdeye.so/token/${pool.meteora_degenTokenAddress}?chain=solana`"
                class="birdeye-link"
                @click.stop
              >
                <TokenPriceChart
                  :tokenAddress="pool.meteora_degenTokenAddress"
                  :width="120"
                  :height="40"
                />
              </a>
              <button
                class="chart-toggle-button"
                @click.stop="$event => toggleChart(pool.meteora_address, $event)"
                :class="{ active: expandedCharts[pool.meteora_address] }"
              >
                {{ expandedCharts[pool.meteora_address] ? '−' : '+' }}
              </button>
              <span class="flex-1"></span>
              <span class="data"
                >{{ Math.round(pool.meteora_liquidity / 1000) }}K</span
              >
              <span class="data mc"
                >{{ Math.round(pool.top_pair_mcap / 1_000_000) }}M</span
              >
            </div>
          </a>
          <div
            v-if="expandedCharts[pool.meteora_address]"
            class="expanded-chart-container"
          >
            <TokenPriceChart
              :tokenAddress="pool.meteora_degenTokenAddress"
              :width="chartWidth"
              :height="200"
              :showMinus50Line="true"
            />
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { fetchPoolsData } from '@/utils/dlmm'

definePageMeta({
  layout: 'app',
})

const isLoading = ref(true)
const displayedPools = ref([])
let pools = []

const marketCap = ref(10)
const binStep = ref(100)
const liquidity = ref(10)
const age = ref(1)
const expandedCharts = ref({})
const poolsContainerRef = ref(null)
const chartWidth = ref(800)

const toggleChart = (poolId, event) => {
  event.stopPropagation()
  event.preventDefault()
  expandedCharts.value[poolId] = !expandedCharts.value[poolId]
  if (expandedCharts.value[poolId]) {
    updateChartWidth()
  }
}

const updateChartWidth = () => {
  nextTick(() => {
    if (poolsContainerRef.value) {
      // Chart should match pool row content width
      // Pool row has 1em left/right padding (16px each = 32px total)
      // Expanded chart container has 1em left/right padding (16px each = 32px total)
      // So chart canvas width = container width - chart container left/right padding
      chartWidth.value = poolsContainerRef.value.clientWidth - 32
    }
  })
}

onMounted(() => {
  loadPoolsData()
  setInterval(loadPoolsData, 1000 * 60 * 5)
  updateChartWidth()
  window.addEventListener('resize', updateChartWidth)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateChartWidth)
})

const loadPoolsData = async () => {
  isLoading.value = true
  pools = await fetchPoolsData()
  resetDisplayedPools()
  isLoading.value = false
}

const resetDisplayedPools = () => {
  displayedPools.value = pools
    .filter((p) => p.meteora_quoteToken === 'SOL')
    .filter((p) => p.meteora_binStep === binStep.value)
    .filter((p) => p.top_pair_mcap >= marketCap.value * 1_000_000)
    .filter((p) => p.meteora_liquidity >= liquidity.value * 1_000)
    .filter((p) => p.oldest_pair_ageInHours >= age.value * 24)
    .sort((pa, pb) => pb.meteora_feeTvlRatio.h24 - pa.meteora_feeTvlRatio.h24)
}

watch(binStep, resetDisplayedPools)
watch(marketCap, resetDisplayedPools)
watch(liquidity, resetDisplayedPools)
watch(age, resetDisplayedPools)

const description = 'Meteora DLMM - Active Pool Finder'
const title = 'The Wise Trade | Meteora DLMM - Active Pool Finder'
useHead({
  title,
  meta: [
    { name: 'title', content: title },
    { name: 'description', content: description },
    { name: 'og:title', content: title },
    { name: 'og:description', content: description },
    {
      name: 'og:image',
      content: 'https://thewise.trade/illustrations/dlmms-guide.png',
    },
    { name: 'og:type', content: 'Website' },
    { name: 'twitter:title', content: title },
    { name: 'twitter:description', content: description },
    {
      name: 'twitter:image',
      content: 'https://thewise.trade/illustrations/dlmms-guide.png',
    },
    { name: 'twitter:url', content: 'https://thewise.trade/dlmm-pool-finder' },
    { name: 'twitter:card', content: 'summary_large_image' },
  ],
})
</script>

<style scoped>
#pool-finder.container {
  display: flex;
  flex-direction: column;
  padding-top: 0;
  min-width: 820px;
  height: 78vh;
}

.pool {
  padding: 0.5em 1em;
  border: 2px solid #334;
}

.fee-ratio {
  color: #aea;
  width: 60px;
  text-align: right;
}

.pool-parameters {
  width: 40px;
  text-align: right;
}

.pool h2 {
  width: 200px;
  margin: 0;
}

.pools {
  display: flex;
  position: relative;
  flex-direction: column;
  flex: 1;
  gap: 1em;
  overflow-y: scroll;
  max-width: 100%;
}

.data {
  color: #cce;
  font-size: 0.9em;
}

.credit {
  color: #cce;
  font-size: 0.8em;
}

.filter {
  flex: 1;
}

.filter-headers {
  margin-bottom: 0.5em;
  margin-top: 1em;

  span {
    display: inline-block;
    font-size: 0.9em;
    color: #cce;
  }

  .fees {
    min-width: 73px;
    text-align: right;
    padding-right: 14px;
  }

  .name {
    min-width: 222px;
  }

  .gen-fees {
    min-width: 83px;
  }

  .two-fees {
    min-width: 83px;
  }

  .chart-col {
    min-width: 134px;
    text-align: left;
  }

  .liq {
    min-width: 92px;
  }
}

.data.mc {
  min-width: 40px;
  text-align: right;
}

.pool-container {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.chart-toggle-button {
  background: #334;
  color: #cce;
  border: 1px solid #556;
  border-radius: 4px;
  width: 30px;
  height: 30px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: bold;
  transition: all 0.2s ease;
  padding: 0;
  flex-shrink: 0;
}

.chart-toggle-button:hover {
  background: #445;
  border-color: #667;
}

.chart-toggle-button.active {
  background: #556;
  border-color: #778;
}

.expanded-chart-container {
  display: block;
  width: 100%;
  padding: 1em;
  margin-top: 0.5em;
  background: #1a1a20;
  border: 2px solid #334;
  border-radius: 8px;
  height: 240px;
}

.expanded-chart-container .price-chart {
  display: block;
  width: 100%;
  margin: 0;
}
</style>
