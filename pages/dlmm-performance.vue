<template>
  <div id="portfolio-performance" class="container">
    <AppHeader
      link="https://dlmm.datapi.meteora.ag"
      author="Meteora Data API"
      title="DLMM Performance"
    />

    <div class="flex flex-row gap-2">
      <WalletSelector v-model="selectedWallet" with-all-wallets />
      <div class="flex-1"></div>
    </div>

    <div
      class="flex flex-row gap-2 text-lg mt-6 mb-4 justify-center"
      v-if="isWalletAddressValid"
    >
      <ToggleButtons
        class="mr-5 filter"
        label="Quote token"
        :values="[
          { text: 'SOL', value: 'SOL' },
          { text: 'USDC', value: 'USDC' },
          { text: 'EURC', value: 'EURC' },
        ]"
        v-model="quoteToken"
      />
      <ToggleButtons
        class="mr-5 filter"
        label="Sort by"
        :values="[
          { text: 'Profit', value: 'profit' },
          { text: 'Date', value: 'date' },
        ]"
        v-model="sortBy"
      />
      <ToggleButtons
        class="mr-5 filter"
        label="Sort order"
        :values="[
          { text: 'Asc.', value: 'asc' },
          { text: 'Desc.', value: 'desc' },
        ]"
        v-model="sortOrder"
      />
      <ToggleButtons
        class="mr-5 filter"
        label="Group by"
        :values="[
          { text: 'Position', value: 'position' },
          { text: 'Pair', value: 'pair' },
        ]"
        v-model="groupBy"
      />
      <Dropdown
        class="filter"
        label="Time range"
        :values="timePeriodOptions"
        v-model="timePeriod"
      />
    </div>

    <div v-if="!isWalletAddressValid" class="empty-hint">
      <p>Please select a wallet to view its performance</p>
    </div>

    <div
      class="chart-panel"
      v-if="isDataVisible"
    >
      <div class="chart-header">
        <div class="chart-period">{{ dateRange }}</div>
        <div class="chart-stats">
          <div class="stat-card">
            <span class="stat-label">Win rate</span>
            <span
              class="stat-value"
              :style="winRateStyle"
            >
              {{ (winRate * 100).toFixed(2) }}%
            </span>
          </div>
          <div class="stat-card">
            <span class="stat-label">P&L</span>
            <span
              class="stat-value"
              :class="totalProfit >= 0 ? 'positive' : 'negative'"
            >
              {{ formatAmount(totalProfit) }} {{ quoteToken }}
            </span>
          </div>
          <div class="stat-card">
            <span class="stat-label">Fees</span>
            <span class="stat-value fees-value">
              {{ formatAmount(totalFees) }} {{ quoteToken }}
            </span>
          </div>
        </div>
      </div>

      <PerformanceChart
        :positions="positions"
        :sort-by="sortBy"
        :time-period="timePeriod"
        :sort-order="sortOrder"
        :quote-symbol="quoteToken"
      />
      <p v-if="isDataVisible" class="api-limit-note">
        Portfolio history loads page by page from Meteora
        (<template v-if="portfolioTotalCount">
          {{ apiPoolCount }} / {{ portfolioTotalCount }} pools
        </template>
        <template v-else>{{ apiPoolCount }} pools</template>,
        last 365 days<template v-if="portfolioTotalPositions">
          · {{ portfolioTotalPositions }} closed positions
        </template>).
        <template v-if="localPoolCount > apiPoolCount">
          {{ localPoolCount }} pools in local cache, including older history.
        </template>
        <template v-else-if="historySyncIncomplete">
          Sync stopped before the last page — refresh to load more.
        </template>
      </p>
      <p v-if="loadError" class="api-limit-note">{{ loadError }}</p>
    </div>

    <div class="position-list-panel mt-8" v-if="isWalletAddressValid">
      <div class="list-header">
        <span class="list-header-cell pair-col">Pair</span>
        <span class="list-header-cell profit-col">P&L</span>
        <span class="list-header-cell fees-col">Fees</span>
      </div>

      <div class="list-body">
        <div
          v-if="loadingWalletTransactions && !positions.length"
          class="list-loading"
        >
          <Loader />
          <span class="loading-message">{{
            loadingProgress || 'Loading portfolio...'
          }}</span>
        </div>

        <div
          v-else-if="!positions.length && !loadingWalletTransactions"
          class="list-empty"
        >
          <p v-if="loadError">{{ loadError }}</p>
          <template v-else>
            <p>No data found for {{ quoteToken }}</p>
            <p v-if="debugStats" class="debug-stats">{{ debugStats }}</p>
            <p class="debug-stats">Try another quote token (SOL, USDC, EURC)</p>
          </template>
        </div>

        <div v-else class="transaction-list">
          <div
            class="position-item"
            :key="positionKey(position)"
            v-for="position in positions"
          >
            <div
              class="position-row"
              :class="{ expanded: collapsedPositions[positionKey(position)] }"
              @click="togglePosition(position)"
            >
              <div
                class="cell pair-col"
                :class="{ 'with-wallet': walletAddress === 'All wallets' && position.wallet_name }"
              >
                <ChevronRightIcon
                  v-if="!collapsedPositions[positionKey(position)]"
                  class="chevron"
                />
                <ChevronDownIcon v-else class="chevron" />
                <span class="pair-label">
                  {{ position.base_symbol }} / {{ position.quote_symbol }}
                </span>
                <span
                  v-if="walletAddress === 'All wallets' && position.wallet_name"
                  class="wallet-name"
                  :title="position.wallet_name"
                >
                  {{ position.wallet_name }}
                </span>
              </div>
              <div class="cell profit-col">
                <ChevronDoubleUpIcon
                  class="profit-icon positive"
                  v-if="position.profit > 0"
                />
                <ChevronDoubleDownIcon
                  class="profit-icon negative"
                  v-else-if="position.profit < 0"
                />
                <span
                  class="stat-value"
                  :class="position.profit > 0 ? 'positive' : 'negative'"
                >
                  {{ formatAmount(position.profit) }} {{ quoteToken }}
                </span>
              </div>
              <div class="cell fees-col">
                <CurrencyDollarIcon class="fee-icon" />
                <span class="stat-value fees-value">
                  {{ formatAmount(position.fee_amount) }} {{ quoteToken }}
                </span>
              </div>
              <div class="cell link-col" @click.stop>
                <a
                  v-if="position.pool_address"
                  class="pool-link"
                  :href="`https://edge.meteora.ag/dlmm/${position.pool_address}`"
                  title="Meteora pool"
                  target="_blank"
                >
                  <ArrowTopRightOnSquareIcon class="w-4 h-4" />
                </a>
              </div>
            </div>
            <div
              class="position-transactions"
              v-show="collapsedPositions[positionKey(position)]"
            >
              <div
                v-if="loadingDetails[positionKey(position)]"
                class="details-loading"
              >
                <Loader />
                <span>Loading transactions...</span>
              </div>
              <table v-else class="transactions-table">
                <thead>
                  <tr>
                    <th scope="col" class="date">Date</th>
                    <th scope="col" class="deposit">Deposit</th>
                    <th scope="col" class="withdrawal">Withdrawal</th>
                    <th scope="col" class="fee">Fee</th>
                    <th scope="col"></th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="transaction in displayTransactions(position)"
                    :key="transaction.signature + '-' + transaction.block_time"
                  >
                    <td class="date">
                      {{ getDateFromBlockTime(transaction.block_time) }}
                    </td>
                    <td class="deposit">
                      <template v-if="transaction.deposit > 0">
                        <div class="tx-amount">
                          <ArrowTurnRightDownIcon class="w-4 h-4" />
                          {{ transaction.deposit.toFixed(2) }}
                        </div>
                      </template>
                    </td>
                    <td class="withdrawal">
                      <template v-if="transaction.withdrawal > 0">
                        <div class="tx-amount">
                          <ArrowTurnLeftUpIcon class="w-4 h-4" />
                          {{ transaction.withdrawal.toFixed(2) }}
                        </div>
                      </template>
                    </td>
                    <td class="fee">
                      <template v-if="transaction.fee_amount > 0">
                        <div class="tx-amount">
                          <CurrencyDollarIcon class="w-4 h-4" />
                          {{ formatAmount(transaction.fee_amount) }}
                        </div>
                      </template>
                    </td>
                    <td>
                      <a
                        v-if="transaction.signature && !position.is_pool_group"
                        class="pool-link"
                        :href="`https://solscan.io/tx/${transaction.signature}`"
                        target="_blank"
                        title="Solscan"
                      >
                        <ArrowTopRightOnSquareIcon class="w-4 h-4" />
                      </a>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div
          v-if="isSyncing && positions.length"
          class="list-sync-footer"
        >
          <Loader />
          <span class="loading-message">{{
            loadingProgress || 'Syncing portfolio...'
          }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { DateTime } from 'luxon'
import {
  loadCachedClosedPortfolio,
  loadPortfolioAsPairs,
  loadPortfolioAsPositions,
  loadPositionEvents,
  fetchAllPoolPositions,
  mapPnlPosition,
  applySortBy,
  applySortOrder,
  applyTimePeriod,
  getDateFromBlockTime,
} from '@/utils/meteora-api'
import { getAllAddresses } from '@/utils/wallets'
import {
  getPositionDetails,
  setPositionDetails,
} from '@/utils/portfolio-history-db'

import {
  ArrowTurnRightDownIcon,
  ArrowTurnLeftUpIcon,
  ArrowTopRightOnSquareIcon,
  ChevronDoubleUpIcon,
  ChevronDoubleDownIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  CurrencyDollarIcon,
} from '@heroicons/vue/24/outline'

const route = useRoute()
const router = useRouter()

const ALL_WALLETS = 'All wallets'

definePageMeta({
  layout: 'app',
})

const walletAddress = ref(null)
const selectedWallet = ref(null)
const loadingWalletTransactions = ref(false)
const loadingProgress = ref('')
const loadingDetails = ref({})

const quoteToken = ref('SOL')
const sortBy = ref('profit')
const sortOrder = ref('asc')
const groupBy = ref('pair')

const rawPositions = shallowRef([])
const positions = shallowRef([])
const collapsedPositions = ref({})

const winRate = ref(0)
const totalProfit = ref(0)
const totalFees = ref(0)
const historySyncIncomplete = ref(false)
const portfolioTotalCount = ref(0)
const portfolioTotalPositions = ref(0)
const apiPoolCount = ref(0)
const localPoolCount = ref(0)
const loadError = ref('')
const debugStats = ref('')
const syncingPortfolio = ref(false)

let loadRequestId = 0
let filterReloadTimer = null

const allTimePeriod = {
  name: 'All',
  start: DateTime.now().minus({ days: 365 }).startOf('day'),
  end: DateTime.now().endOf('day'),
}
const timePeriod = ref(allTimePeriod)

const buildQuarterPeriod = (year, quarter) => {
  const startMonth = (quarter - 1) * 3 + 1
  const start = DateTime.fromObject({ year, month: startMonth, day: 1 }).startOf(
    'day',
  )
  const quarterEnd = start.plus({ months: 3 }).minus({ days: 1 }).endOf('day')
  const end = DateTime.min(quarterEnd, DateTime.now().endOf('day'))
  return {
    name: `Q${quarter} ${year}`,
    start,
    end,
  }
}

const lastQuarterOptions = () => {
  const now = DateTime.now()
  let year = now.year
  let quarter = Math.ceil(now.month / 3)
  const options = []

  for (let i = 0; i < 4; i++) {
    const period = buildQuarterPeriod(year, quarter)
    options.push({
      text: period.name,
      value: period,
    })
    quarter -= 1
    if (quarter < 1) {
      quarter = 4
      year -= 1
    }
  }

  return options
}

const timePeriodOptions = computed(() => {
  return [
    {
      text: 'All (365d)',
      value: allTimePeriod,
    },
    {
      text: 'Last 24h',
      value: {
        name: '1d',
        start: DateTime.now().minus({ day: 1 }),
        end: DateTime.now(),
      },
    },
    {
      text: 'Last 7 days',
      value: {
        name: '7d',
        start: DateTime.now().minus({ week: 1 }),
        end: DateTime.now(),
      },
    },
    {
      text: 'Last 30 days',
      value: {
        name: '30d',
        start: DateTime.now().minus({ month: 1 }),
        end: DateTime.now(),
      },
    },
    {
      text: 'YTD',
      value: {
        name: '1y',
        start: DateTime.max(
          DateTime.now().startOf('year'),
          DateTime.now().minus({ days: 365 }),
        ),
        end: DateTime.now(),
      },
    },
    ...lastQuarterOptions(),
    {
      text: 'Week ' + DateTime.now().localWeekNumber,
      value: {
        name: 'week ' + DateTime.now().localWeekNumber,
        start: DateTime.now().startOf('week'),
        end: DateTime.now().endOf('week'),
      },
    },
    {
      text: 'Week ' + DateTime.now().minus({ week: 1 }).localWeekNumber,
      value: {
        name: 'week ' + DateTime.now().minus({ week: 1 }).localWeekNumber,
        start: DateTime.now().minus({ week: 1 }).startOf('week'),
        end: DateTime.now().minus({ week: 1 }).endOf('week'),
      },
    },
    {
      text: DateTime.now().toFormat('MMMM yyyy'),
      value: {
        name: DateTime.now().toFormat('MMMM'),
        start: DateTime.now().startOf('month'),
        end: DateTime.now().endOf('month'),
      },
    },
    {
      text: DateTime.now().minus({ month: 1 }).toFormat('MMMM yyyy'),
      value: {
        name: DateTime.now().minus({ month: 1 }).toFormat('MMMM'),
        start: DateTime.now().minus({ month: 1 }).startOf('month'),
        end: DateTime.now().minus({ month: 1 }).endOf('month'),
      },
    },
    {
      text: DateTime.now().minus({ month: 2 }).toFormat('MMMM yyyy'),
      value: {
        name: DateTime.now().minus({ month: 2 }).toFormat('MMMM'),
        start: DateTime.now().minus({ month: 2 }).startOf('month'),
        end: DateTime.now().minus({ month: 2 }).endOf('month'),
      },
    },
    {
      text: DateTime.now().minus({ month: 3 }).toFormat('MMMM yyyy'),
      value: {
        name: DateTime.now().minus({ month: 3 }).toFormat('MMMM'),
        start: DateTime.now().minus({ month: 3 }).startOf('month'),
        end: DateTime.now().minus({ month: 3 }).endOf('month'),
      },
    },
    {
      text: DateTime.now().toFormat('yyyy'),
      value: {
        name: DateTime.now().toFormat('yyyy'),
        start: DateTime.max(
          DateTime.now().startOf('year'),
          DateTime.now().minus({ days: 365 }),
        ),
        end: DateTime.now().endOf('year'),
      },
    },
  ]
})

const isDataVisible = computed(() => {
  return walletAddress.value && positions.value.length > 0
})

const isSyncing = computed(() => {
  return loadingWalletTransactions.value || syncingPortfolio.value
})

const formatAmount = (value) => {
  if (quoteToken.value === 'USDC' || quoteToken.value === 'EURC') {
    return Math.round(value).toLocaleString('fr-FR')
  }
  return value.toLocaleString('fr-FR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

const winRateStyle = computed(() => {
  const percent = Math.max(0, Math.min(100, winRate.value * 100))
  const hue = (percent / 100) * 120
  return { color: `hsl(${hue}, 62%, 52%)` }
})

const isWalletAddressValid = computed(() => {
  return (
    walletAddress.value &&
    walletAddress.value !== null &&
    walletAddress.value !== 'undefined'
  )
})

const startDate = computed(() => {
  if (!rawPositions.value.length) return timePeriod.value.start
  const minBlock = Math.min(...rawPositions.value.map((p) => p.block_time || 0))
  const fromData = DateTime.fromMillis(minBlock * 1000)
  if (fromData > timePeriod.value.start && fromData < timePeriod.value.end) {
    return fromData
  }
  return timePeriod.value.start
})

const endDate = computed(() => {
  if (!rawPositions.value.length) return timePeriod.value.end
  const maxBlock = Math.max(...rawPositions.value.map((p) => p.block_time || 0))
  const fromData = DateTime.fromMillis(maxBlock * 1000)
  if (fromData > timePeriod.value.start && fromData < timePeriod.value.end) {
    return fromData
  }
  return timePeriod.value.end
})

const dateRange = computed(() => {
  return (
    startDate.value.toFormat('dd/MM/yy') +
    ' - ' +
    endDate.value.toFormat('dd/MM/yy')
  )
})

onMounted(() => {
  setSavedWalletAddress()
})

const setSavedWalletAddress = () => {
  let localWalletAddress = route.query.address
  if (!localWalletAddress) {
    localWalletAddress = localStorage.getItem('walletAddress')
  }
  if (localWalletAddress) {
    selectedWallet.value = localWalletAddress
  }
}

const updateWalletAddress = async (address) => {
  if (!address) {
    walletAddress.value = ''
    saveWalletAddress()
    rawPositions.value = []
    positions.value = []
    debugStats.value = ''
    return
  }

  if (address === walletAddress.value && loadingWalletTransactions.value) {
    return
  }

  walletAddress.value = address
  saveWalletAddress()
  await useWallet()
}

const saveWalletAddress = () => {
  const address = walletAddress.value
  if (address && route.query.address !== address) {
    router.replace({ query: { address } })
  }
  localStorage.setItem('walletAddress', walletAddress.value || '')
}

const applyCachedPortfolio = async (requestId) => {
  const publishCached = (cachedPositions, cachedPoolCount) => {
    if (requestId !== loadRequestId || !cachedPositions.length) return false
    rawPositions.value = cachedPositions
    localPoolCount.value = cachedPoolCount
    resetPositions()
    loadingWalletTransactions.value = false
    syncingPortfolio.value = true
    return true
  }

  if (walletAddress.value === ALL_WALLETS) {
    const wallets = await getAllAddresses()
    let cachedPositions = []
    let cachedPoolCount = 0
    let anyShown = false

    for (const wallet of wallets) {
      const cached = await loadCachedClosedPortfolio(
        wallet.address,
        quoteToken.value,
        timePeriod.value,
        groupBy.value,
      )
      if (!cached.positions?.length) continue

      cachedPoolCount += cached.poolCount || 0
      const label = wallet.name || wallet.domain || wallet.address
      cachedPositions.push(
        ...(cached.positions || []).map((position) => ({
          ...position,
          wallet_address: wallet.address,
          wallet_name: label,
          wallet_addresses: [wallet.address],
        })),
      )

      const display =
        groupBy.value === 'pair'
          ? mergePairPositions(cachedPositions)
          : cachedPositions

      if (publishCached(display, cachedPoolCount)) {
        anyShown = true
      }
    }

    return anyShown
  }

  const cached = await loadCachedClosedPortfolio(
    walletAddress.value,
    quoteToken.value,
    timePeriod.value,
    groupBy.value,
  )
  const cachedPositions = (cached.positions || []).map((position) => ({
    ...position,
    wallet_address: walletAddress.value,
    wallet_addresses: [walletAddress.value],
  }))

  return publishCached(cachedPositions, cached.poolCount || 0)
}

const publishPortfolio = (loaded, meta, requestId) => {
  if (requestId !== loadRequestId) return

  historySyncIncomplete.value = !!meta?.syncIncomplete
  portfolioTotalCount.value = meta?.totalCount || 0
  portfolioTotalPositions.value = meta?.totalPositions || 0
  apiPoolCount.value = meta?.apiPoolCount || 0
  localPoolCount.value = meta?.localPoolCount || 0
  rawPositions.value = loaded
  resetPositions()
  loadingWalletTransactions.value = false
  syncingPortfolio.value = true
}

const useWallet = async () => {
  if (!walletAddress.value) return

  const requestId = ++loadRequestId
  syncingPortfolio.value = false
  loadError.value = ''
  debugStats.value = ''
  collapsedPositions.value = {}
  loadingDetails.value = {}
  loadingProgress.value = 'Loading portfolio...'

  const hadCache = await applyCachedPortfolio(requestId)
  if (!hadCache) {
    loadingWalletTransactions.value = true
  } else {
    syncingPortfolio.value = true
  }

  try {
    const loader =
      groupBy.value === 'pair' ? loadPortfolioAsPairs : loadPortfolioAsPositions

    let loaded = []
    let meta = {
      syncIncomplete: false,
      totalCount: 0,
      totalPositions: 0,
      apiPoolCount: 0,
      localPoolCount: 0,
    }

    if (walletAddress.value === ALL_WALLETS) {
      const wallets = await getAllAddresses()
      if (!wallets.length) {
        throw new Error('No wallets found. Add wallets first.')
      }

      const perWalletFlat = []
      for (let i = 0; i < wallets.length; i++) {
        if (requestId !== loadRequestId) return
        const wallet = wallets[i]
        const label = wallet.name || wallet.domain || wallet.address
        loadingProgress.value = `Loading wallet ${i + 1}/${wallets.length}: ${label}`

        const onProgress = (progress) => {
          if (requestId !== loadRequestId) return
          const prefix = `[${i + 1}/${wallets.length}] ${label}`
          if (progress.stage === 'positions') {
            loadingProgress.value = `${prefix} — pools ${progress.loaded}/${progress.totalCount} · ${progress.positionsLoaded || 0} positions${progress.cacheHits ? ` · ${progress.cacheHits} cached pools` : ''}`
          } else if (progress.stage === 'history') {
            loadingProgress.value = `${prefix} — history ${progress.loaded}/${progress.totalCount}`
          } else {
            loadingProgress.value = `${prefix} — pools ${progress.loaded}/${progress.totalCount || '?'}`
          }
        }

        const result = await loader(
          wallet.address,
          quoteToken.value,
          timePeriod.value,
          onProgress,
        )
        const positionsForWallet = (result?.positions || []).map((position) => ({
          ...position,
          wallet_address: wallet.address,
          wallet_name: label,
          wallet_addresses: [wallet.address],
        }))
        perWalletFlat.push(...positionsForWallet)
        meta.syncIncomplete = meta.syncIncomplete || !!result?.syncIncomplete
        meta.totalCount += result?.totalCount || 0
        meta.totalPositions += result?.totalPositions || 0
        meta.apiPoolCount += result?.apiPoolCount || 0
        meta.localPoolCount += result?.localPoolCount || 0

        loaded =
          groupBy.value === 'pair'
            ? mergePairPositions(perWalletFlat)
            : perWalletFlat
        publishPortfolio(loaded, meta, requestId)
      }
    } else {
      const onProgress = (progress) => {
        if (requestId !== loadRequestId) return
        if (progress.stage === 'positions') {
          loadingProgress.value = `Loading closed positions — pools ${progress.loaded}/${progress.totalCount} · ${progress.positionsLoaded || 0} positions${progress.cacheHits ? ` · ${progress.cacheHits} cached pools` : ''}`
        } else if (progress.stage === 'history') {
          loadingProgress.value = `Refreshing local history ${progress.loaded}/${progress.totalCount}`
        } else {
          loadingProgress.value = `Loading portfolio pools ${progress.loaded}/${progress.totalCount || '?'}`
        }
      }

      const result = await loader(
        walletAddress.value,
        quoteToken.value,
        timePeriod.value,
        onProgress,
      )
      loaded = (result?.positions || []).map((position) => ({
        ...position,
        wallet_address: walletAddress.value,
        wallet_addresses: [walletAddress.value],
      }))
      meta = result || meta
      publishPortfolio(loaded, meta, requestId)
    }

    if (requestId !== loadRequestId) return

    if (!positions.value.length) {
      debugStats.value = `API pools: ${apiPoolCount.value}, local: ${localPoolCount.value}, matched ${quoteToken.value}: ${loaded.length}, after filters: ${positions.value.length}`
    }
  } catch (error) {
    console.error('Error loading Meteora portfolio:', error)
    if (requestId === loadRequestId) {
      loadError.value = error?.message || 'Failed to load portfolio'
      rawPositions.value = []
      positions.value = []
      winRate.value = 0
      totalProfit.value = 0
      totalFees.value = 0
      historySyncIncomplete.value = false
      portfolioTotalCount.value = 0
      portfolioTotalPositions.value = 0
      apiPoolCount.value = 0
      localPoolCount.value = 0
    }
  } finally {
    if (requestId === loadRequestId) {
      loadingWalletTransactions.value = false
      loadingProgress.value = ''
      syncingPortfolio.value = false
    }
  }
}

const mergePairPositions = (items) => {
  const byPool = new Map()
  items.forEach((position) => {
    const key = position.pool_address
    const existing = byPool.get(key)
    if (!existing) {
      byPool.set(key, {
        ...position,
        wallet_addresses: [...(position.wallet_addresses || [])],
        wallet_name:
          position.wallet_addresses?.length > 1
            ? `${position.wallet_addresses.length} wallets`
            : position.wallet_name,
        events_loaded: false,
        transactions: [],
      })
      return
    }
    existing.deposit += position.deposit || 0
    existing.withdrawal += position.withdrawal || 0
    existing.fee_amount += position.fee_amount || 0
    existing.profit += position.profit || 0
    existing.block_time = Math.max(
      existing.block_time || 0,
      position.block_time || 0,
    )
    const wallets = new Set([
      ...(existing.wallet_addresses || []),
      ...(position.wallet_addresses || []),
    ])
    existing.wallet_addresses = [...wallets]
    existing.wallet_name =
      existing.wallet_addresses.length > 1
        ? `${existing.wallet_addresses.length} wallets`
        : position.wallet_name || existing.wallet_name
    existing.events_loaded = false
    existing.transactions = []
  })
  return [...byPool.values()]
}

const positionKey = (position) =>
  `${position.position_address}:${position.wallet_address || 'all'}`

const scheduleFilterReload = () => {
  if (!walletAddress.value) return
  if (filterReloadTimer) clearTimeout(filterReloadTimer)
  filterReloadTimer = setTimeout(() => {
    useWallet()
  }, 50)
}

const resetPositions = () => {
  const source = Array.isArray(rawPositions.value) ? rawPositions.value : []
  let filtered = source.filter((position) => {
    const profit = Number(position.profit)
    if (!Number.isFinite(profit)) return false
    return profit > 0.005 || profit < -0.005
  })
  try {
    filtered = applyTimePeriod(timePeriod.value, filtered)
  } catch (error) {
    console.warn('Time period filter failed:', error)
  }
  filtered = applySortBy(sortBy.value, filtered)
  filtered = applySortOrder(sortOrder.value, filtered)
  positions.value = filtered
  computeStats()
}

const computeStats = () => {
  winRate.value =
    positions.value.length > 0
      ? positions.value.filter((position) => position.profit > 0).length /
        positions.value.length
      : 0

  totalProfit.value = positions.value.reduce(
    (acc, position) => acc + position.profit,
    0,
  )
  totalFees.value = positions.value.reduce(
    (acc, position) => acc + position.fee_amount,
    0,
  )
}

const displayTransactions = (position) => {
  const txs = position.transactions || []
  return [...txs].reverse()
}

const ensurePositionDetails = async (position) => {
  if (position.events_loaded) return
  const key = positionKey(position)
  loadingDetails.value = {
    ...loadingDetails.value,
    [key]: true,
  }

  try {
    const cacheWallet = (
      position.wallet_addresses?.length
        ? [...position.wallet_addresses].sort().join(',')
        : position.wallet_address ||
          (walletAddress.value !== ALL_WALLETS ? walletAddress.value : '')
    ) || null
    const kind = position.is_pool_group ? 'pool' : 'position'
    const address = position.is_pool_group
      ? position.pool_address
      : position.position_address

    if (cacheWallet) {
      try {
        const cached = await getPositionDetails(
          cacheWallet,
          kind,
          address,
          quoteToken.value,
        )
        if (Array.isArray(cached)) {
          position.transactions = cached
          position.events_loaded = true
          return
        }
      } catch (error) {
        console.warn('Local position details unavailable:', error)
      }
    }

    if (position.is_pool_group) {
      const users = (
        position.wallet_addresses?.length
          ? position.wallet_addresses
          : [position.wallet_address || walletAddress.value]
      ).filter((user) => user && user !== ALL_WALLETS)

      const rows = []
      for (const user of users) {
        const { positions: poolPositions } = await fetchAllPoolPositions(
          position.pool_address,
          user,
          { status: 'closed' },
        )
        poolPositions.forEach((item) => {
          const mapped = mapPnlPosition(
            item,
            {
              poolAddress: position.pool_address,
              tokenX: position.base_symbol,
              tokenY: position.quote_symbol,
              tokenXMint: position.token_x_mint,
              tokenYMint: position.token_y_mint,
            },
            quoteToken.value,
          )
          rows.push({
            signature: mapped.position_address,
            block_time: mapped.block_time,
            deposit: mapped.deposit,
            withdrawal: mapped.withdrawal,
            fee_amount: mapped.fee_amount,
          })
        })
      }
      position.transactions = rows.sort(
        (a, b) => (a.block_time || 0) - (b.block_time || 0),
      )
    } else {
      position.transactions = await loadPositionEvents(
        position.position_address,
        quoteToken.value,
      )
    }

    if (cacheWallet) {
      try {
        await setPositionDetails(
          cacheWallet,
          kind,
          address,
          quoteToken.value,
          position.transactions,
        )
      } catch (error) {
        console.warn('Failed to cache position details:', error)
      }
    }

    position.events_loaded = true
  } catch (error) {
    console.error('Error loading position details:', error)
    position.transactions = []
    position.events_loaded = true
  } finally {
    loadingDetails.value = {
      ...loadingDetails.value,
      [key]: false,
    }
  }
}

const togglePosition = async (position) => {
  const key = positionKey(position)
  const opening = !collapsedPositions.value[key]
  collapsedPositions.value = {
    ...collapsedPositions.value,
    [key]: opening,
  }
  if (opening) {
    await ensurePositionDetails(position)
  }
}

watch(quoteToken, scheduleFilterReload)
watch(timePeriod, scheduleFilterReload)
watch(groupBy, scheduleFilterReload)
watch(sortBy, resetPositions)
watch(sortOrder, resetPositions)
watch(selectedWallet, (address) => {
  updateWalletAddress(address || '')
})

const description = 'Meteora DLMM - Performance History'
const title = 'DLMM Portfolio Performance'

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
    { name: 'twitter:url', content: 'https://thewise.trade/dlmm-performance' },
    { name: 'twitter:card', content: 'summary_large_image' },
  ],
})
</script>

<style scoped>
.empty-hint {
  text-align: center;
  color: #999;
  margin: 2rem 0;
}

.chart-panel {
  border: 1px solid #2e2e2e;
  border-radius: 12px;
  overflow: hidden;
  padding: 0 0 1rem;
  background: #0a0a0a;
}

.chart-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem 1.5rem 1rem;
  background: #121218;
  border-bottom: 1px solid #252525;
}

.chart-period {
  font-size: 0.8125rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #888;
}

.chart-stats {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.75rem;
  width: 100%;
}

.stat-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  min-width: 140px;
  padding: 0.75rem 1.25rem;
  border: 1px solid #2a2a2a;
  border-radius: 8px;
  background: #0f0f12;
}

.stat-card .stat-label {
  font-size: 0.6875rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #777;
}

.stat-card .stat-value {
  font-size: 1.125rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}

.stat-card .stat-value.fees-value {
  color: #ccc;
}

.stat-card .stat-value.positive {
  color: #3DDC84;
}

.stat-card .stat-value.negative {
  color: #FF4757;
}

.api-limit-note {
  text-align: center;
  color: #c9a227;
  font-size: 0.85em;
  margin: 0.75rem auto 0;
  max-width: 40rem;
  width: 100%;
  padding: 0 1rem;
  box-sizing: border-box;
}

.position-list-panel {
  border: 1px solid #2e2e2e;
  border-radius: 12px;
  overflow: hidden;
  background: #0a0a0a;
  margin-bottom: 2rem;
}

.list-header {
  display: grid;
  grid-template-columns: 1fr 180px 180px 36px;
  gap: 1rem;
  padding: 1rem 1.5rem;
  background: #121218;
  border-bottom: 1px solid #252525;
  font-size: 0.875rem;
  font-weight: 600;
  color: #aaa;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.list-header.with-wallet {
  grid-template-columns: 1.4fr 180px 180px 36px;
}

.list-header-cell.profit-col,
.list-header-cell.fees-col {
  text-align: right;
}

.list-body {
  min-height: 120px;
  padding: 0.625rem;
}

.list-loading,
.list-empty,
.details-loading,
.list-sync-footer {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 2.5rem 1.5rem;
  color: #aaa;
  font-size: 0.9rem;
}

.list-sync-footer {
  flex-direction: row;
  margin: 0 -0.625rem -0.625rem;
  padding: 1rem 1.5rem;
  border-top: 1px solid #252525;
  background: #0e0e0e;
}

.loading-message {
  text-align: center;
  line-height: 1.4;
  max-width: 36rem;
}

.debug-stats {
  color: #777;
  font-size: 0.85em;
  margin-top: 0.35rem;
}

.transaction-list {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.position-item {
  border: 1px solid #2a2a2a;
  border-radius: 8px;
  overflow: hidden;
  background: #101010;
}

.position-item:last-child .position-transactions {
  padding-bottom: 1.25rem;
}

.position-row {
  display: grid;
  grid-template-columns: 1fr 180px 180px 36px;
  gap: 1rem;
  padding: 1rem 1.25rem;
  align-items: center;
  cursor: pointer;
  transition: background-color 0.15s ease;
}

.position-row:hover {
  background: #141414;
}

.position-row.expanded {
  background: #121212;
  border-bottom: 1px solid #252525;
}

.cell {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1rem;
  min-width: 0;
}

.pair-col.with-wallet {
  flex-wrap: wrap;
}

.chevron {
  width: 1.1rem;
  height: 1.1rem;
  flex-shrink: 0;
  color: #666;
}

.pair-label {
  color: #fff;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.wallet-name {
  font-size: 0.72rem;
  color: #777;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 140px;
}

.profit-col,
.fees-col {
  justify-content: flex-end;
}

.profit-icon {
  width: 1.1rem;
  height: 1.1rem;
  flex-shrink: 0;
}

.fee-icon {
  width: 0.9rem;
  height: 0.9rem;
  color: #888;
  flex-shrink: 0;
}

.stat-value {
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

.fees-value {
  color: #ccc;
}

.link-col {
  justify-content: center;
}

.pool-link {
  display: inline-flex;
  align-items: center;
  color: #888;
  transition: color 0.15s ease;
}

.pool-link:hover {
  color: #ccc;
}

.positive {
  color: #3DDC84;
}

.negative {
  color: #FF4757;
}

.position-transactions {
  padding: 0.25rem 1rem 0.75rem 2.25rem;
  background: #0c0c0c;
  overflow-x: auto;
}

.transactions-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9375rem;
}

.transactions-table :is(th, td) {
  border: none;
  padding: 0.6rem 0.85rem;
  font-size: inherit;
}

.transactions-table thead {
  color: #888;
  text-transform: uppercase;
  font-size: 0.8125rem;
  letter-spacing: 0.04em;
}

.transactions-table th {
  text-align: left;
  padding-top: 0.65rem;
  padding-bottom: 0.55rem;
  font-weight: 600;
  border-bottom: 1px solid #252525;
}

.transactions-table th.date {
  min-width: 150px;
}

.transactions-table th.deposit,
.transactions-table th.withdrawal,
.transactions-table th.fee {
  text-align: right;
}

.transactions-table td {
  color: #ccc;
  border-bottom: 1px solid #1e1e1e;
}

.transactions-table tbody tr:last-child td {
  border-bottom: none;
}

.transactions-table tbody tr:hover td {
  background: #111;
}

.transactions-table .deposit,
.transactions-table .withdrawal,
.transactions-table .fee {
  text-align: right;
}

.tx-amount {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  justify-content: flex-end;
  width: 100%;
  font-variant-numeric: tabular-nums;
}

@media (max-width: 768px) {
  .list-header,
  .position-row {
    grid-template-columns: 1fr 120px 100px 32px;
    gap: 0.5rem;
    padding-left: 1rem;
    padding-right: 1rem;
  }

  .position-transactions {
    padding-left: 1rem;
    overflow-x: auto;
  }
}
</style>
