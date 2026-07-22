<template>
  <div class="liquidity-table-container">
    <AppHeader
      link="https://dlmm.datapi.meteora.ag"
      author="Meteora Data API"
      title="DLMM Positions"
    />

    <div class="flex flex-row gap-2 items-center">
      <WalletSelector v-model="selectedWallet" with-all-wallets />
      <div class="flex-1"></div>
      <div class="italic text-sm text-gray-500 mr-2" v-if="lastUpdateTime">
        Last updated: {{ lastUpdateTime.toFormat('HH:mm:ss') }}
        <span v-if="loadingMore"> · {{ loadingLabel }}</span>
        <span v-if="enriching"> · enriching bins…</span>
      </div>
      <RefreshButton @refresh="refreshData" />
    </div>

    <div class="table-wrapper">
      <div class="table-header">
        <div
          class="header-cell token-pair-header sortable"
          @click="sort('pair')"
        >
          <span>Position</span>
          <div class="sort-icon" :class="getSortClass('pair')"></div>
        </div>
        <div
          class="header-cell value-cell-header sortable"
          @click="sort('value')"
        >
          <span>Value</span>
          <div class="sort-icon" :class="getSortClass('value')"></div>
        </div>
        <div
          class="header-cell fee-cell-header sortable"
          @click="sort('uncolFee')"
        >
          <span>Uncol. Fee</span>
          <div class="sort-icon" :class="getSortClass('uncolFee')"></div>
        </div>
        <!--div
          class="header-cell fee-cell-header sortable"
          @click="sort('collectedFee')"
        >
          <span>Collected Fee</span>
          <div class="sort-icon" :class="getSortClass('collectedFee')"></div>
        </div-->
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
        <div v-if="loading && sortedPositions.length === 0" class="loading-state">
          <div class="flex flex-column items-center gap-2">
            <Loader class="loading" />
            <span>{{ loadingLabel }}</span>
          </div>
        </div>

        <div v-else-if="error" class="error-state">
          <span>Error loading positions: {{ error }}</span>
          <button @click="loadData" class="retry-button">Retry</button>
        </div>

        <div
          v-else-if="sortedPositions.length === 0 && !loadingMore"
          class="empty-state"
        >
          <span>No positions found</span>
        </div>

        <div v-else class="table-rows">
          <template
            v-for="group in groupedPositionSections"
            :key="group.id"
          >
            <div class="quote-group-header">
              <img
                v-if="group.icon"
                :src="group.icon"
                :alt="group.label"
                class="quote-group-icon"
              />
              <span>{{ group.label }}</span>
              <span class="quote-group-count">{{ group.positions.length }}</span>
            </div>
            <template v-for="position in group.positions" :key="position.id">
              <div class="wallet-name" v-if="walletAddress === 'All wallets'">
                {{ position.walletName }}
              </div>
              <div class="table-row">
              <div class="cell position-cell">
                <a
                  class="flex flex-row bin-container"
                  :href="`https://edge.meteora.ag/dlmm/${position.positionKey}`"
                  target="_blank"
                >
                  <div class="token-pair">
                    <div class="token-icons">
                      <img
                        :src="position.token1?.icon"
                        :alt="position.token1?.symbol"
                        class="token-icon"
                      />
                      <img
                        :src="position.token2?.icon"
                        :alt="position.token2?.symbol"
                        class="token-icon token-icon-overlap"
                      />
                    </div>
                    <span
                      class="pair-name"
                      :class="{
                        'out-of-range-lower': position.isOutOfRange === 'lower',
                        'out-of-range-upper': position.isOutOfRange === 'upper',
                      }"
                      >{{ position.token1?.symbol }} /
                      {{ position.token2?.symbol }}</span
                    >
                  </div>
                </a>
              </div>

              <div class="cell value-cell">
                <img
                  :src="position.token2?.icon"
                  :alt="position.token2?.symbol"
                  class="value-icon mr-2"
                />
                <span class="value-amount">{{ position.value }}</span>
              </div>

              <div class="cell fee-cell">
                <div class="fee-amount flex items-center">
                  <img
                    :src="position.token2?.icon"
                    :alt="position.token2?.symbol"
                    class="value-icon mr-2"
                  />
                  {{ position.uncolFee.amount }}
                </div>
              </div>

              <!--div class="cell fee-cell">
                <div class="fee-amount flex items-center">
                  <img
                    :src="position.token2?.icon"
                    :alt="position.token2?.symbol"
                    class="value-icon mr-2"
                  />
                  {{ position.collectedFee.amount }}
                </div>
              </div-->

              <!--div class="cell age-cell">
                {{ position.age }}
              </div-->
              <!--div class="cell upnl-cell">
                <div class="fee-amount" :class="position.upnl.color">{{ position.upnl.amount }}</div>
                <div class="fee-percentage" :class="position.upnl.color">{{ position.upnl.percentage }}</div>
              </div-->

              <div class="cell range-cell">
                <BinRepresentation
                  v-if="position.binData?.length"
                  :binData="position.binData"
                  :positionKey="position.positionKey"
                  :positionToken1="position.token1"
                  :positionToken2="position.token2"
                  :activePrice="position.poolActivePrice"
                />
                <PositionRangeBar
                  v-else
                  :positionKey="position.positionKey"
                  :minPrice="position.minPrice"
                  :maxPrice="position.maxPrice"
                  :activePrice="position.poolActivePrice"
                  :isOutOfRange="!!position.isOutOfRange"
                />
              </div>
            </div>
            </template>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import BinRepresentation from '@/components/positions/BinRepresentation.vue'
import PositionRangeBar from '@/components/positions/PositionRangeBar.vue'
import { DateTime } from 'luxon'
import { loadOpenPositions } from '@/utils/meteora-api'
import { getAllAddresses } from '@/utils/wallets'

definePageMeta({
  layout: 'app',
})

const ALL_WALLETS = 'All wallets'
const SOL_MINT = 'So11111111111111111111111111111111111111112'
const USDC_MINT = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'
const EURC_MINT = 'HzwqbKZw8HxMN6bF2yFZNrht3c2iXXzpKcFu7uBEDKtr'
const SOL_ICON =
  'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png'
const USDC_ICON =
  'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png'

const route = useRoute()
const router = useRouter()

const sortField = ref('uncolFee')
const sortDirection = ref('desc')

const loading = ref(false)
const loadingMore = ref(false)
const enriching = ref(false)
const isInitialLoad = ref(true)

const error = ref(null)
const positionsData = ref([])
const loadingLabel = ref('Loading positions...')

const lastUpdateTime = ref(null)
let refreshInterval = null
let loadRequestId = 0
let enrichRequestId = 0

const walletAddress = ref(null)
const selectedWallet = ref(null)

onMounted(async () => {
  setSavedWalletAddress()
  setTimeout(() => {
    startAutoRefresh()
  }, 600000)
})

onBeforeUnmount(() => {
  stopAutoRefresh()
})

const updateWalletAddress = async (address) => {
  walletAddress.value = address || ''
  saveWalletAddress()
  await loadData()
}

const saveWalletAddress = () => {
  const address = walletAddress.value
  if (address && route.query.address !== address) {
    router.replace({ query: { address } })
  }
  localStorage.setItem('positions:walletAddress', address || '')
}

const setSavedWalletAddress = () => {
  let localWalletAddress = route.query.address
  if (!localWalletAddress) {
    localWalletAddress = localStorage.getItem('positions:walletAddress')
  }
  if (localWalletAddress) {
    selectedWallet.value = localWalletAddress
  }
}

const sortedPositions = computed(() => {
  if (!sortField.value) {
    return formattedPositions.value
  }

  return [...formattedPositions.value].sort((a, b) => {
    let aValue
    let bValue

    switch (sortField.value) {
      case 'pair':
        aValue = `${a.token1?.symbol}/${a.token2?.symbol}`
        bValue = `${b.token1?.symbol}/${b.token2?.symbol}`
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
      case 'range':
        aValue = a.isOutOfRange ? 1 : 0
        bValue = b.isOutOfRange ? 1 : 0
        break
      default:
        return 0
    }

    if (typeof aValue === 'string') {
      const comparison = aValue.localeCompare(bValue)
      return sortDirection.value === 'asc' ? comparison : -comparison
    }
    const comparison = aValue - bValue
    return sortDirection.value === 'asc' ? comparison : -comparison
  })
})

const normalizeSymbol = (symbol) => String(symbol || '').trim().toUpperCase()

const getQuoteGroupId = (position) => {
  const candidates = [
    {
      mint: position.token2?.mint,
      symbol: normalizeSymbol(position.token2?.symbol),
    },
    {
      mint: position.token1?.mint,
      symbol: normalizeSymbol(position.token1?.symbol),
    },
  ]

  for (const { mint, symbol } of candidates) {
    if (mint === USDC_MINT || symbol === 'USDC') return 'USDC'
    if (mint === EURC_MINT || symbol === 'EURC') return 'EURC'
    if (mint === SOL_MINT || symbol === 'SOL' || symbol === 'WSOL') return 'SOL'
  }
  return 'OTHER'
}

const groupedPositionSections = computed(() => {
  const sections = [
    { id: 'SOL', label: 'SOL pairs', icon: SOL_ICON, positions: [] },
    { id: 'USDC', label: 'USDC pairs', icon: USDC_ICON, positions: [] },
    { id: 'EURC', label: 'EURC pairs', icon: null, positions: [] },
    { id: 'OTHER', label: 'Other pairs', icon: null, positions: [] },
  ]
  const byId = Object.fromEntries(sections.map((section) => [section.id, section]))

  sortedPositions.value.forEach((position) => {
    const groupId = getQuoteGroupId(position)
    byId[groupId].positions.push(position)
  })

  return sections
    .filter((section) => section.positions.length > 0)
    .map((section) => ({
      ...section,
      icon: section.icon || section.positions[0]?.token2?.icon || null,
    }))
})

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

const isSolQuotePosition = (position) =>
  position.tokenYMint === SOL_MINT ||
  String(position.tokenY || '').trim().toUpperCase() === 'SOL'

const getQuoteDisplayAmounts = (position) => {
  if (isSolQuotePosition(position)) {
    return {
      value: Number(position.valueSol) || 0,
      fee: Number(position.unclaimedFeeSol) || 0,
    }
  }
  return {
    value: Number(position.valueUsd) || 0,
    fee: Number(position.unclaimedFeeUsd) || 0,
  }
}

const formattedPositions = computed(() => {
  return positionsData.value
    .map((position) => {
      const { value: valueNum, fee: uncolFeeAmount } =
        getQuoteDisplayAmounts(position)

      return {
        id: position.id || position.positionAddress,
        token1: {
          symbol: position.tokenX,
          icon: position.tokenXIcon,
          mint: position.tokenXMint,
        },
        token2: {
          symbol: position.tokenY,
          icon: position.tokenYIcon,
          mint: position.tokenYMint,
        },
        value: valueNum.toFixed(2),
        valueNum,
        collectedFee: {
          amount: '0',
          percentage: '0%',
          sortValue: 0,
        },
        uncolFee: {
          amount: formatFeeAmount(uncolFeeAmount),
          percentage: formatPercentage(uncolFeeAmount, valueNum),
          color: uncolFeeAmount > 0 ? 'positive' : 'neutral',
          sortValue: uncolFeeAmount,
        },
        isOutOfRange: position.outOfRangeSide || (position.isOutOfRange ? 'upper' : null),
        binData: position.binData || null,
        minPrice: position.minPrice,
        maxPrice: position.maxPrice,
        poolActivePrice: position.poolActivePrice,
        positionKey: position.poolAddress,
        walletName: position.walletName,
        enriched: !!position.enriched,
      }
    })
    .filter(
      (position) =>
        position.valueNum > 0 ||
        Number(position.uncolFee.sortValue) > 0,
    )
})

const loadData = async (withLoading = true) => {
  if (!walletAddress.value) return

  const requestId = ++loadRequestId
  enrichRequestId += 1
  const enrichId = enrichRequestId
  const isAllWallets = walletAddress.value === ALL_WALLETS

  if (withLoading) {
    loading.value = true
    loadingMore.value = isAllWallets
    if (isAllWallets) {
      positionsData.value = []
    }
  }
  try {
    error.value = null
    lastUpdateTime.value = DateTime.now()
    loadingLabel.value = 'Loading positions...'

    const positions = await fetchPositionsFromApi(
      (label) => {
        if (requestId === loadRequestId) loadingLabel.value = label
      },
      (partial) => {
        if (requestId !== loadRequestId) return
        positionsData.value = partial
        loading.value = false
        loadingMore.value = isAllWallets
      },
    )

    if (requestId !== loadRequestId) return

    positionsData.value = positions
    if (isInitialLoad.value) {
      isInitialLoad.value = false
    }

    void enrichPositionsFromSdk(positions, enrichId).catch(() => {})
  } catch (err) {
    console.error('Error loading positions:', err)
    if (requestId === loadRequestId) {
      const message = err?.message || String(err)
      error.value = /NetworkError|Failed to fetch|Load failed/i.test(message)
        ? 'Network error talking to Meteora API. Retry, or check adblock / offline mode.'
        : message || 'Failed to load positions'
      if (!positionsData.value.length) {
        positionsData.value = []
      }
    }
  } finally {
    if (requestId === loadRequestId) {
      loading.value = false
      loadingMore.value = false
    }
  }
}

const fetchPositionsFromApi = async (onLabel, onPartial) => {
  const positions = []

  if (walletAddress.value === ALL_WALLETS) {
    const wallets = await getAllAddresses()
    if (!wallets.length) {
      throw new Error('No wallets found. Add wallets first.')
    }
    for (let i = 0; i < wallets.length; i++) {
      const wallet = wallets[i]
      const label = wallet.name || wallet.domain || wallet.address
      onLabel(`Loading ${label} (${i + 1}/${wallets.length})...`)
      const result = await loadOpenPositions(wallet.address, (progress) => {
        if (progress.stage === 'positions') {
          onLabel(
            `${label}: positions ${progress.loaded}/${progress.totalCount}`,
          )
        } else {
          onLabel(`${label}: pools ${progress.loaded}/${progress.totalCount || '?'}`)
        }
      })
      result.positions.forEach((position) => {
        positions.push({
          ...position,
          walletName: label,
          walletAddress: wallet.address,
        })
      })
      if (onPartial) {
        onPartial([...positions])
      }
    }
  } else {
    onLabel(`Loading positions for ${walletAddress.value}...`)
    const result = await loadOpenPositions(walletAddress.value, (progress) => {
      if (progress.stage === 'positions') {
        onLabel(`Loading positions ${progress.loaded}/${progress.totalCount}`)
      } else {
        onLabel(`Loading pools ${progress.loaded}/${progress.totalCount || '?'}`)
      }
    })
    result.positions.forEach((position) => {
      positions.push({
        ...position,
        walletAddress: walletAddress.value,
      })
    })
  }

  return positions
}

const enrichPositionsFromSdk = async (apiPositions, enrichId) => {
  if (!apiPositions?.length) return

  const walletsToEnrich =
    walletAddress.value === ALL_WALLETS
      ? [
          ...new Map(
            apiPositions
              .filter((p) => p.walletAddress)
              .map((p) => [p.walletAddress, p.walletName]),
          ).entries(),
        ].map(([address, name]) => ({ address, name }))
      : [{ address: walletAddress.value, name: null }]

  enriching.value = true
  try {
    let loadPositionsData
    try {
      const mod = await import('~/utils/dlmm-analyzer/index.ts')
      loadPositionsData = mod.loadPositionsData
    } catch {
      console.log('SDK bins skipped: analyzer unavailable')
      return
    }

    const binByPosition = new Map()

    for (const wallet of walletsToEnrich) {
      if (enrichId !== enrichRequestId) return
      const data = await loadPositionsData(wallet.address)
      ;(data?.positions || []).forEach((item) => {
        try {
          const positionPk =
            item.position?.publicKey?.toBase58?.() ||
            item.position?.publicKey?.toString?.()
          const bins = item.position?.positionData?.positionBinData
          if (positionPk && bins?.length) {
            binByPosition.set(positionPk, bins)
          }
        } catch {
          // ignore malformed SDK position
        }
      })
    }

    if (enrichId !== enrichRequestId) return
    if (!binByPosition.size) return

    positionsData.value = positionsData.value.map((position) => {
      const bins = binByPosition.get(position.positionAddress)
      if (!bins) return position
      return {
        ...position,
        binData: bins,
        enriched: true,
      }
    })
  } catch {
    console.log('SDK bins skipped: enrichment failed')
  } finally {
    if (enrichId === enrichRequestId) {
      enriching.value = false
    }
  }
}

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

watch(selectedWallet, (address) => {
  updateWalletAddress(address || '')
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

.quote-group-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: #1f1f1f;
  border-bottom: 1px solid #2a2a2a;
  color: #ddd;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.quote-group-icon {
  width: 18px;
  height: 18px;
  border-radius: 50%;
}

.quote-group-count {
  margin-left: auto;
  color: #888;
  font-weight: 500;
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
  color: #3DDC84 !important;
}

.negative {
  color: #FF4757 !important;
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
