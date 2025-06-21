<template>
  <div class="liquidity-table-container">
    <AppHeader
      link="https://geeklad.github.io/meteora-profit-analysis/"
      author="Geeklad Analyzer"
      title="DLMM Positions"
    />

    <div class="flex flex-row gap-2 items-center">
      <WalletSelector v-model="selectedWallet" />
      <div class="flex-1"></div>
      <div class="italic text-sm text-gray-500 mr-2" v-if="lastUpdateTime">
        Last updated: {{ lastUpdateTime.toFormat('HH:mm:ss') }}
      </div>
      <RefreshButton @refresh="refreshData" />
    </div>

    <div class="table-wrapper">
      <div class="table-header">
        <div class="header-cell sortable" @click="sort('pair')">
          <span>Position</span>
          <div class="sort-icon" :class="getSortClass('pair')"></div>
        </div>
        <div class="header-cell sortable" @click="sort('age')">
          <span>Age</span>
          <div class="sort-icon" :class="getSortClass('age')"></div>
        </div>
        <div class="header-cell sortable" @click="sort('value')">
          <span>Value</span>
          <div class="sort-icon" :class="getSortClass('value')"></div>
        </div>
        <div class="header-cell sortable" @click="sort('collectedFee')">
          <span>Collected Fee</span>
          <div class="sort-icon" :class="getSortClass('collectedFee')"></div>
        </div>
        <div class="header-cell sortable" @click="sort('uncolFee')">
          <span>Uncol. Fee</span>
          <div class="sort-icon" :class="getSortClass('uncolFee')"></div>
        </div>
        <!--div class="header-cell sortable" @click="sort('upnl')">
          <span>uPnL</span>
          <div class="sort-icon" :class="getSortClass('upnl')"></div>
        </div-->
        <div
          class="header-cell sortable flex items-center"
          @click="sort('range')"
        >
          <span>Bins</span>
          <div class="sort-icon" :class="getSortClass('range')"></div>
          <div class="flex-1"></div>
        </div>
      </div>

      <div class="table-content">
        <div v-if="loading" class="loading-state">
          <Loader class="loading" />
        </div>

        <div v-else-if="error" class="error-state">
          <span>Error loading positions: {{ error }}</span>
          <button @click="loadData" class="retry-button">Retry</button>
        </div>

        <div v-else-if="sortedPositions.length === 0" class="empty-state">
          <span>No positions found</span>
        </div>

        <div v-else class="table-rows">
          <div
            class="table-row"
            v-for="position in sortedPositions"
            :key="position.id"
          >
            <div class="cell position-cell">
              <a
                class="flex flex-row bin-container"
                :href="`https://app.meteora.ag/dlmm/${position.positionKey}`"
                target="_blank"
              >
                <div class="token-pair">
                  <div class="token-icons">
                    <img
                      :src="position.token1.icon"
                      :alt="position.token1.symbol"
                      class="token-icon"
                    />
                    <img
                      :src="position.token2.icon"
                      :alt="position.token2.symbol"
                      class="token-icon token-icon-overlap"
                    />
                  </div>
                  <span class="pair-name"
                    >{{ position.token1.symbol }} /
                    {{ position.token2.symbol }}</span
                  >
                </div>
              </a>
            </div>

            <div class="cell age-cell">
              {{ position.age }}
            </div>

            <div class="cell value-cell">
              <img
                :src="position.token2.icon"
                :alt="position.token2.symbol"
                class="value-icon mr-2"
              />
              <span class="value-amount">{{ position.value }}</span>
            </div>

            <div class="cell fee-cell">
              <div class="fee-amount flex items-center">
                <img
                  :src="position.token2.icon"
                  :alt="position.token2.symbol"
                  class="value-icon mr-2"
                />
                {{ position.collectedFee.amount }}
              </div>
            </div>

            <div class="cell fee-cell">
              <div
                class="fee-amount flex items-center"
              >
                <img
                  :src="position.token2.icon"
                  :alt="position.token2.symbol"
                  class="value-icon mr-2"
                />
                {{ position.uncolFee.amount }}
              </div>
            </div>

            <!--div class="cell upnl-cell">
              <div class="fee-amount" :class="position.upnl.color">{{ position.upnl.amount }}</div>
              <div class="fee-percentage" :class="position.upnl.color">{{ position.upnl.percentage }}</div>
            </div-->

            <div class="cell range-cell">
              <BinRepresentation
                :binData="position.binData"
                :positionKey="position.positionKey"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import BinRepresentation from '@/components/positions/BinRepresentation.vue'

import { DateTime } from 'luxon'
import { getTokenService } from '@/utils/tokens'

definePageMeta({
  layout: 'app',
})

const sortField = ref('uncolFee')
const sortDirection = ref('desc')

const loading = ref(false)
const isInitialLoad = ref(true)

const error = ref(null)
const positionsData = ref([])
const fullPositionsData = ref([])

const lastUpdateTime = ref(null)
const refreshInterval = ref(null)

const tokenService = getTokenService()
const tokenCache = {}

const walletAddress = ref(null)
const selectedWallet = ref(null)
const loadingWalletTransactions = ref(false)

const router = useRouter()

onMounted(async () => {
  await tokenService.init()
  await setSavedWalletAddress()

  if (walletAddress.value) {
    await loadData()
  }

  setTimeout(() => {
    startAutoRefresh()
  }, 600000)
})

onBeforeUnmount(() => {
  stopAutoRefresh()
})

// Wallet management functions

const updateWalletAddress = async (address) => {
  walletAddress.value = address
  saveWalletAddress()
  loadingWalletTransactions.value = true
  await loadData()
  loadingWalletTransactions.value = false
}

const saveWalletAddress = () => {
  const address = walletAddress.value
  router.push({ query: { address } })
  localStorage.setItem('positions:walletAddress', address)
}

const setSavedWalletAddress = async () => {
  let localWalletAddress = useRoute().query.address
  if (!localWalletAddress) {
    localWalletAddress = localStorage.getItem('positions:walletAddress')
  }
  if (localWalletAddress) {
    if (isSolanaDomain(localWalletAddress)) {
      localWalletAddress = await resolveDomainToAddress(localWalletAddress)
    }
    selectedWallet.value = localWalletAddress
  }
}

// Data loading functions

const formattedPositions = computed(() => {
  const dataToUse =
    fullPositionsData.value.length > 0
      ? fullPositionsData.value
      : positionsData.value

  return dataToUse.map((position, index) => {
    const multiplier = position.token2.symbol === 'USDC' ? 1000 : 1
    const collectedFeeAmount = (position.collectedFeesValue || 0) * multiplier
    const uncolFeeAmount = (position.unCollectedFeesValue || 0) * multiplier
    const positionValue = (position.value || 0) * multiplier

    const totalFees = collectedFeeAmount + uncolFeeAmount
    const upnlPercentage =
      positionValue > 0 ? (totalFees / positionValue) * 100 : 0
    const binData = position.position.positionData.positionBinData
    let positionKey = position.position.lbPair.toBase58()


    return {
      id: `position-${index}`,
      token1: position.token1,
      token2: position.token2,
      age: formatAge(position.age),
      ageValue: getAgeInHours(position.age),
      value: positionValue.toFixed(2),
      valueNum: positionValue,
      collectedFee: {
        amount: formatFeeAmount(collectedFeeAmount),
        percentage: formatPercentage(collectedFeeAmount, positionValue),
        sortValue: collectedFeeAmount,
      },
      uncolFee: {
        amount: formatFeeAmount(uncolFeeAmount),
        percentage: formatPercentage(uncolFeeAmount, positionValue),
        color: uncolFeeAmount > 0 ? 'positive' : 'neutral',
        sortValue: uncolFeeAmount,
      },
      upnl: {
        amount: formatFeeAmount(totalFees),
        percentage: formatUpnlPercentage(upnlPercentage),
        color: getUpnlColor(upnlPercentage),
        sortValue: upnlPercentage,
      },
      range: {
        min: position.priceRange?.minPrice?.toFixed(6) || '0.000000',
        max: position.priceRange?.maxPrice?.toFixed(6) || '0.000000',
        ...calculateRangePositions(position.priceRange, position.isInRange),
        sortValue: position.priceRange?.minPrice || 0,
        currentPrice: position.priceRange?.currentPrice,
      },
      binData,
      positionKey,
    }
  })
})

const sortedPositions = computed(() => {
  if (!sortField.value) {
    return formattedPositions.value
  }

  return [...formattedPositions.value].sort((a, b) => {
    let aValue, bValue

    switch (sortField.value) {
      case 'pair':
        aValue = `${a.token1.symbol}/${a.token2.symbol}`
        bValue = `${b.token1.symbol}/${b.token2.symbol}`
        break
      case 'age':
        aValue = a.ageValue
        bValue = b.ageValue
        break
      case 'value':
        aValue = a.valueNum
        bValue = b.valueNum
        break
      case 'collectedFee':
        aValue = a.collectedFee.sortValue
        bValue = b.collectedFee.sortValue
        break
      case 'uncolFee':
        aValue = a.uncolFee.sortValue
        bValue = b.uncolFee.sortValue
        break
      case 'upnl':
        aValue = a.upnl.sortValue
        bValue = b.upnl.sortValue
        break
      case 'range':
        aValue = a.range.sortValue
        bValue = b.range.sortValue
        break
      default:
        return 0
    }

    if (typeof aValue === 'string') {
      const comparison = aValue.localeCompare(bValue)
      return sortDirection.value === 'asc' ? comparison : -comparison
    } else {
      const comparison = aValue - bValue
      return sortDirection.value === 'asc' ? comparison : -comparison
    }
  })
})

const loadData = async () => {
  try {
    if (isInitialLoad.value) {
      loading.value = true
    }
    error.value = null

    const startTime = performance.now()
    lastUpdateTime.value = DateTime.now()
    let data = await fetchPositionsData()
    console.log('🚀 ~ loadedData ~ data:', data)
    console.log('🚀 ~ loadedData ~ data:', performance.now() - startTime)

    if (!data) data = []
    positionsData.value = data
    fullPositionsData.value = []
    fullPositionsData.value = await Promise.all(
      positionsData.value.map(async (position) => {
        const token1 = await getTokenInfoInternal(position.tokenX.toString())
        const token2 = await getTokenInfoInternal(position.tokenY.toString())
        return {
          ...position,
          token1,
          token2,
        }
      }),
    )

    console.log(
      '🚀 ~ loadedData ~ fullPositionsData:',
      performance.now() - startTime,
    )
    console.log('🚀 ~ fullPositionsData:', fullPositionsData.value)

    if (isInitialLoad.value) {
      isInitialLoad.value = false
    }
  } catch (err) {
    console.error('Error loading positions:', err)
    error.value = err.message || 'Failed to load positions'
  } finally {
    loading.value = false
  }
}

const fetchPositionsData = async () => {
  const { main } = await import('~/utils/dlmm-analyzer/index.ts')
  const data = await main(walletAddress.value)
  return data.positions || []
}

const preloadTokenInfo = async (positions) => {
  const tokenAddresses = new Set()

  positions.forEach((position) => {
    const tokenX = position.tokenX
    const tokenY = position.tokenY

    if (tokenX) tokenAddresses.add(tokenX)
    if (tokenY) tokenAddresses.add(tokenY)
  })

  console.log(`Pre-loading info for ${tokenAddresses.size} unique tokens...`)
  const addresses = Array.from(tokenAddresses)
  const tokenInfos = await tokenService.getMultipleTokens(addresses)

  tokenCache = { ...tokenCache, ...tokenInfos }

  console.log('Token info pre-loading completed')
}

// Display functions

const formatAge = (age) => {
  if (!age) return '0m'

  if (age.days > 0) {
    return `${age.days}d ${age.hours}h`
  } else if (age.hours > 0) {
    return `${age.hours}h ${age.minutes}m`
  } else {
    return `${age.minutes}m`
  }
}

const getAgeInHours = (age) => {
  if (!age) return 0
  return age.days * 24 + age.hours + age.minutes / 60
}

const formatFeeAmount = (amount) => {
  if (!amount || amount === 0) return '0'
  if (amount < 0.01) return '0'
  return `${amount.toFixed(3)}`
}

const formatPercentage = (fee, total) => {
  if (!fee || !total || total === 0) return '0%'
  const percentage = (fee / total) * 100
  if (percentage < 0.01) return '< 0.01%'
  return `${percentage.toFixed(2)}%`
}

const formatUpnlPercentage = (percentage) => {
  if (!percentage || percentage === 0) return '0%'
  if (Math.abs(percentage) < 0.01) {
    return percentage > 0 ? '< 0.01%' : '< -0.01%'
  }
  return `${percentage.toFixed(2)}%`
}

const getUpnlColor = (percentage) => {
  if (!percentage || percentage === 0) return 'neutral'
  return percentage > 0 ? 'positive' : 'negative'
}

const calculateRangePositions = (priceRange, isInRange) => {
  if (!priceRange) {
    return {
      startPercent: 0,
      currentPercent: 50,
      endPercent: 100,
    }
  }

  const { minPrice, maxPrice, currentPrice } = priceRange
  const range = maxPrice - minPrice

  let currentPercent = 50
  if (range > 0) {
    currentPercent = ((currentPrice - minPrice) / range) * 100
    currentPercent = Math.max(0, Math.min(100, currentPercent))
  }

  let startPercent = 20
  let endPercent = 80

  if (isInRange === 'low') {
    currentPercent = Math.min(currentPercent, 15)
  } else if (isInRange === 'high') {
    currentPercent = Math.max(currentPercent, 85)
  }

  return {
    startPercent,
    currentPercent,
    endPercent,
  }
}

// Sorting functions

const sort = (field) => {
  if (sortField.value === field) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortField.value = field
    sortDirection.value = 'asc'
  }
}

const getSortClass = (field) => {
  if (sortField.value !== field) {
    return 'sort-inactive'
  }
  return sortDirection.value === 'asc' ? 'sort-asc' : 'sort-desc'
}

// Refresh functions

const refreshData = async () => {
  loading.value = true
  await loadData()
  loading.value = false
}

const startAutoRefresh = () => {
  console.log('now start reload data per 10 min')
  /*refreshInterval.value = setInterval(async () => {
    await refreshData()
  }, 60000)*/
}

const stopAutoRefresh = () => {
  if (refreshInterval.value) {
    clearInterval(refreshInterval.value)
    refreshInterval.value = null
  }
}

// Watch functions

watch(selectedWallet, (address) => {
  updateWalletAddress(address)
})
</script>

<style scoped>
.liquidity-table-container {
  display: flex;
  flex-direction: column;
  padding-top: 0;
  min-width: 820px;
  height: 78vh;
}

.table-wrapper {
  min-width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  margin-top: 1em;
  overflow: auto;
}

.table-header {
  display: grid;
  grid-template-columns: 1.5fr 1fr 1fr 1fr 1fr 2fr;
  gap: 1rem;
  padding: 1rem 1.5rem;
  background: #1a1a20;
  border-top-left-radius: 10px;
  border-top-right-radius: 10px;
  border: 1px solid #333;
  font-size: 0.875rem;
  font-weight: 500;
  color: #ccc;
  flex-shrink: 0;
}

.table-content {
  flex: 1;
  overflow-y: auto;
  min-height: 200px;
  background: #080808;
  border-bottom-left-radius: 10px;
  border-bottom-right-radius: 10px;
  border: 1px solid #333;
}

.loading-state,
.error-state,
.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  min-height: 200px;
}

.error-state {
  gap: 1rem;
  color: #ef4444;
  flex-direction: column;
}

.empty-state {
  color: #999;
}

.retry-button {
  background: #60a5fa;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.2s ease;
}

.retry-button:hover {
  background: #3b82f6;
}

.table-rows {
  display: flex;
  flex-direction: column;
}

.table-row {
  display: grid;
  grid-template-columns: 1.5fr 1fr 1fr 1fr 1fr 2fr;
  gap: 1rem;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #2a2a2a;
  align-items: center;
  transition: background-color 0.2s ease;
}

.table-row:hover {
  background: #252525;
}

.table-row:last-child {
  border-bottom: none;
}

.cell {
  display: flex;
  align-items: center;
  font-size: 0.875rem;
}

.position-cell {
  flex-direction: row;
}

.token-pair {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.token-icons {
  position: relative;
  display: flex;
  align-items: center;
}

.token-icon {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 2px solid #1a1a1a;
}

.token-icon-overlap {
  margin-left: -8px;
}

.pair-name {
  color: #ffffff;
  font-weight: 500;
}

.age-cell {
  color: #ccc;
}

.value-cell {
  gap: 0.5rem;
  font-weight: 500;
}

.value-icon {
  width: 16px;
  height: 16px;
  border-radius: 50%;
}

.fee-cell,
.upnl-cell {
  flex-direction: column;
  align-items: flex-start;
  gap: 0.25rem;
}

.fee-amount {
  font-weight: 500;
  color: #ccc;
}

.fee-percentage {
  font-size: 0.75rem;
  color: #888;
}

.positive {
  color: #10b981 !important;
}

.negative {
  color: #ef4444 !important;
}

.neutral {
  color: #ccc !important;
}

.range-cell {
  flex-direction: column;
  gap: 0.5rem;
  width: 100%;
}

.range-bar {
  width: 100%;
}

.range-track {
  position: relative;
  height: 16px;
  background: #333;
  border-radius: 3px;
  overflow: hidden;
}

.range-fill {
  position: absolute;
  top: 0;
  height: 100%;
  background: linear-gradient(90deg, #3b82f6, #60a5fa);
  border-radius: 3px;
}

.range-indicators {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.range-indicator {
  position: absolute;
  top: 50%;
  width: 6px;
  height: 30px;
  border-radius: 2px;
  transform: translateY(-50%) translateX(-50%);
  border: 2px solid #1a1a1a;
}

.range-start {
  background: #3b82f6;
}

.range-current {
  background: #fbbf24;
  border: 2px solid #1a1a1a;
  box-shadow: 0 0 2px rgba(251, 191, 36, 0.6);
}

.range-end {
  background: #ef4444;
}

.range-labels {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 0.5rem;
  font-size: 0.75rem;
  color: #888;
  position: relative;
  padding: 0 0.25rem;
}

.range-min {
  text-align: left;
  flex: 0 0 auto;
}

.range-max {
  text-align: right;
  flex: 0 0 auto;
}

/* Header styling */
.header-cell {
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  transition: color 0.2s ease;
}

.header-cell:hover {
  color: #ffffff;
}

.sortable {
  user-select: none;
}

.sort-icon {
  display: flex;
  align-items: center;
  margin-left: 0.5rem;
  opacity: 0.5;
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.sort-inactive {
  opacity: 0.3;
}

.sort-asc {
  opacity: 1;
  transform: rotate(0deg);
}

.sort-desc {
  opacity: 1;
  transform: rotate(180deg);
}

@media (max-width: 768px) {
  .table-header,
  .table-row {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }

  .header-cell,
  .cell {
    padding: 0.5rem 0;
    border-bottom: 1px solid #333;
  }

  .header-cell:last-child,
  .cell:last-child {
    border-bottom: none;
  }
}
</style>
