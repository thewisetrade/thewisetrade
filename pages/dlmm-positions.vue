<template>
  <div class="liquidity-table-container">
    <AppHeader
      link="https://geeklad.github.io/meteora-profit-analysis/"
      author=""
      title="DLMM Positions"
    />

    <div class="flex flex-row gap-2 items-center">
      <WalletSelector v-model="selectedWallet" with-all-wallets />
      <div class="flex-1"></div>
      <div class="italic text-sm text-gray-500 mr-2" v-if="lastUpdateTime">
        Last updated: {{ lastUpdateTime.toFormat('HH:mm:ss') }}
      </div>
      <RefreshButton @refresh="refreshData" />
    </div>

    <div class="table-wrapper">
      <div class="table-header">
        <div class="header-cell token-pair-header sortable" @click="sort('pair')">
          <span>Position</span>
          <div class="sort-icon" :class="getSortClass('pair')"></div>
        </div>
        <div class="header-cell value-cell-header sortable" @click="sort('value')">
          <span>Value</span>
          <div class="sort-icon" :class="getSortClass('value')"></div>
        </div>
        <div class="header-cell fee-cell-header sortable" @click="sort('uncolFee')">
          <span>Uncol. Fee</span>
          <div class="sort-icon" :class="getSortClass('uncolFee')"></div>
        </div>
        <div class="header-cell fee-cell-header sortable" @click="sort('collectedFee')">
          <span>Collected Fee</span>
          <div class="sort-icon" :class="getSortClass('collectedFee')"></div>
        </div>
        <!--div class="header-cell sortable" @click="sort('age')">
          <span>Age</span>
          <div class="sort-icon" :class="getSortClass('age')"></div>
        </div-->
        <!--div class="header-cell sortable" @click="sort('upnl')">
          <span>uPnL</span>
          <div class="sort-icon" :class="getSortClass('upnl')"></div>
        </div-->
        <div
          class="header-cell range-cell-header sortable flex items-center"
          @click="sort('range')"
        >
          <span>Bins</span>
          <div class="sort-icon" :class="getSortClass('range')"></div>
          <div class="flex-1"></div>
        </div>
      </div>

      <div class="table-content">
        <div v-if="loading" class="loading-state">
          <div class="flex flex-column items-center gap-2">
            <Loader class="loading" />
            <span>{{ loadingLabel }}</span>
          </div>
        </div>

        <div v-else-if="error" class="error-state">
          <span>Error loading positions: {{ error }}</span>
          <button @click="loadData" class="retry-button">Retry</button>
        </div>

        <div v-else-if="sortedPositions.length === 0" class="empty-state">
          <span>No positions found</span>
        </div>

        <div v-else class="table-rows">
          <template
            v-for="position in sortedPositions"
            :key="position.id"
          >
            <div class="wallet-name" v-if="walletAddress === 'All wallets'">
              {{ position.walletName }}
            </div>
            <div
              class="table-row"
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
                    <span
                      class="pair-name"
                      :class="{
                        'out-of-range-lower': position.isOutOfRange === 'lower',
                        'out-of-range-upper': position.isOutOfRange === 'upper',
                      }"
                      >{{ position.token1.symbol }} /
                      {{ position.token2.symbol }}</span
                    >
                  </div>
                </a>
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


              <!--div class="cell age-cell">
                {{ position.age }}
              </div-->
              <!--div class="cell upnl-cell">
                <div class="fee-amount" :class="position.upnl.color">{{ position.upnl.amount }}</div>
                <div class="fee-percentage" :class="position.upnl.color">{{ position.upnl.percentage }}</div>
              </div-->

              <div class="cell range-cell">
                <BinRepresentation
                  :binData="position.binData"
                  :positionKey="position.positionKey"
                  :positionToken1="position.token1"
                  :positionToken2="position.token2"
                />
              </div>
            </div>
          </template>
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
const loadingLabel = ref('Loading positions...')
const tokenPrices = ref(new Map())

const lastUpdateTime = ref(null)
let refreshInterval = null

const tokenService = getTokenService()
const tokenCache = {}

const walletAddress = ref(null)
const selectedWallet = ref(null)
const loadingWalletTransactions = ref(false)

const router = useRouter()

onMounted(async () => {
  await tokenService.init()
  await setSavedWalletAddress()

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
    const multiplier = position.token2?.symbol === 'USDC' ? 1000 : 1
    const collectedFeeAmount = (position.collectedFeesValue || 0) * multiplier
    const uncolFeeAmount = (position.unCollectedFeesValue || 0) * multiplier
    const positionValue = (position.value || 0) * multiplier

    const totalFees = collectedFeeAmount + uncolFeeAmount
    const upnlPercentage =
      positionValue > 0 ? (totalFees / positionValue) * 100 : 0
    const binData = position.position.positionData.positionBinData
    let positionKey = position.position.pair.publicKey.toBase58()


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
        sortValue: position.priceRange?.minPrice || 0,
        currentPrice: position.priceRange?.currentPrice,
      },
      isOutOfRange: getOutOfRangeStatus(position.priceRange),
      binData,
      positionKey,
      walletName: position.walletName,
    }
  }).filter(position => position.value > 0 || position.uncolFee.amount > 0 || position.collectedFee.amount > 0)
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


const loadData = async (withLoading = true) => {
  if (loading.value) return

  if (withLoading) {
    loading.value = true
  }
  try {
    if (isInitialLoad.value) {
      loading.value = true
    }
    error.value = null

    const startTime = performance.now()
    lastUpdateTime.value = DateTime.now()
    let positionList = await fetchPositionsData()

    if (!positionList) positionList = []
    positionsData.value = positionList
    fullPositionsData.value = positionList
    fullPositionsData.value = await Promise.all(
      positionList.map(async (position) => {
        const token1 = await getTokenInfoInternal(position.tokenX.toString())
        const token2 = await getTokenInfoInternal(position.tokenY.toString())

        // If position is out of range, fetch DexScreener price for tokenX (the base token)
        const isOutOfRange = getOutOfRangeStatus(position.priceRange)
        if (isOutOfRange && position.tokenX && position.tokenY) {
          const tokenXMint = position.tokenX.toString()
          const tokenYMint = position.tokenY.toString()

          // Check if tokenY is a stablecoin (USDC, USDT) - if so, use DexScreener price directly
          // DexScreener returns price in USD, which is approximately equal to USDC/USDT price
          const isStablecoin = tokenYMint === 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v' || // USDC
                               tokenYMint === 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB'   // USDT

          let newPrice = null

          if (isStablecoin) {
            // For stablecoin pairs, DexScreener price (in USD) is approximately the price in stablecoins
            const tokenPrice = await fetchTokenPrice(tokenXMint)
            if (tokenPrice && position.priceRange) {
              position.priceRange.currentPrice = tokenPrice
              newPrice = tokenPrice
            }
          } else {
            // For non-stablecoin pairs, fetch both prices and calculate ratio
            const [priceX, priceY] = await Promise.all([
              fetchTokenPrice(tokenXMint),
              fetchTokenPrice(tokenYMint)
            ])

            if (priceX && priceY && priceY > 0 && position.priceRange) {
              const calculatedPrice = priceX / priceY
              position.priceRange.currentPrice = calculatedPrice
              newPrice = calculatedPrice
            }
          }

          if (isOutOfRange === 'lower' && newPrice && position.currentValue) {
            const tokenXAmount = position.currentValue.tokenX?.toNumber() || 0
            const tokenYAmount = position.currentValue.tokenY?.toNumber() || 0
            const newValue = (tokenXAmount * newPrice + tokenYAmount) / 10 ** 9
            if (newValue > 0) {
              position.value = newValue
            }
          }
        }

        return {
          ...position,
          token1,
          token2,
        }
      })
    )
    const timeTaken = performance.now() - startTime
    console.log(`✅ Positions loaded in ${timeTaken.toFixed(2)}ms`)

    if (isInitialLoad.value) {
      isInitialLoad.value = false
    }
  } catch (err) {
    console.error('Error loading positions:', err)
    error.value = err.message || 'Failed to load positions'
  } finally {
    if (withLoading) {
      loading.value = false
    }
  }
}

const fetchPositionsData = async () => {
  const { loadPositionsData } = await import('~/utils/dlmm-analyzer/index.ts')
  loadingLabel.value = 'Loading positions...'
  const positions = []
  if (walletAddress.value === 'All wallets') {
    const wallets = await getAllAddresses()
    for (const wallet of wallets) {
      loadingLabel.value = `Loading positions for ${wallet.name}...`
      const data = await loadPositionsData(wallet.address)
      data.positions.forEach(position => {
        position.walletName = wallet.name
        positions.push(position)
      })
    }
  } else {
    loadingLabel.value = `Loading positions for ${walletAddress.value}...`
    const data = await loadPositionsData(walletAddress.value)
    data.positions.forEach(position => {
      position.wallet = walletAddress.value.name
      positions.push(position)
    })
  }
  loadingLabel.value = 'Loading token info...'
  return positions
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


const fetchTokenPrice = async (tokenMint) => {
  if (!tokenMint) return null

  // Check cache first
  if (tokenPrices.value.has(tokenMint)) {
    return tokenPrices.value.get(tokenMint)
  }

  try {
    const response = await fetch(
      `https://api.dexscreener.com/latest/dex/tokens/${tokenMint}`
    )

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()

    if (!data.pairs || data.pairs.length === 0) {
      return null
    }

    // Find the pair with highest volume for most accurate price
    const pair = data.pairs.reduce((best, current) => {
      const currentVolume = current.volume?.h24 || 0
      const bestVolume = best.volume?.h24 || 0
      return currentVolume > bestVolume ? current : best
    })

    const price = parseFloat(pair.priceUsd)

    if (price && !isNaN(price)) {
      tokenPrices.value.set(tokenMint, price)
      return price
    }
  } catch (error) {
    console.error(`Error fetching DexScreener price for ${tokenMint}:`, error)
  }

  return null
}

const getOutOfRangeStatus = (priceRange) => {
  if (!priceRange || !priceRange.currentPrice || !priceRange.minPrice || !priceRange.maxPrice) {
    return null
  }

  const { minPrice, maxPrice, currentPrice } = priceRange

  // Check if current price is below minimum (out of range on lower side)
  if (currentPrice < minPrice) {
    return 'lower'
  }

  // Check if current price is above maximum (out of range on upper side)
  if (currentPrice > maxPrice) {
    return 'upper'
  }

  return null
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

const refreshData = async (withLoading = true) => {
  await loadData(withLoading)
}

const startAutoRefresh = () => {
  refreshInterval = setInterval(async () => {
    await refreshData(false)
  }, 60000)
}

const stopAutoRefresh = () => {
  if (refreshInterval) {
    clearInterval(refreshInterval)
    refreshInterval = null
  }
}

// Watch functions

watch(selectedWallet, (address) => {
  updateWalletAddress(address)
})
</script>

<style scoped>
.wallet-name {
  font-size: 0.75rem;
  color: #666;
  font-weight: 400;
  padding: 0.2em 0.5em;
  text-transform: uppercase;
}

.liquidity-table-container {
  display: flex;
  flex-direction: column;
  padding-top: 0;
  min-width: 960px;
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
  display: flex;
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

.header-cell {
  text-align: center;
}

.position-cell {
  flex-direction: row;
}

.token-pair {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-width: 160px;
}

.token-pair-header {
  min-width: 160px;
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

.pair-name.out-of-range-lower {
  color: #ef4444;
}

.pair-name.out-of-range-upper {
  color: #eab308;
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

.value-cell {
  min-width: 100px;
  max-width: 100px;
}

.value-cell-header {
  min-width: 100px;
  max-width: 100px;
}

.fee-cell {
  min-width: 100px;
  max-width: 100px;
}

.fee-cell-header {
  min-width: 100px;
  max-width: 100px;
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
  flex: 1;
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
