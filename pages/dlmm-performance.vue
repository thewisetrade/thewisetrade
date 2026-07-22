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

    <div
      v-if="loadingWalletTransactions && !positions.length"
      class="loading-state"
    >
      <Loader class="loading" />
      <p v-if="loadingProgress" class="loading-progress">
        {{ loadingProgress }}
      </p>
    </div>

    <div v-if="!isDataVisible">
      <div class="text-center">
        <template v-if="!isWalletAddressValid">
          <div>
            <p>Please select a wallet to view its performance</p>
          </div>
        </template>
        <template v-else-if="!loadingWalletTransactions">
          <div>
            <p v-if="loadError">{{ loadError }}</p>
            <template v-else>
              <p>No data found for {{ quoteToken }}</p>
              <p v-if="debugStats" class="loading-progress mt-2">
                {{ debugStats }}
              </p>
              <p class="loading-progress mt-2">
                Try another quote token (SOL, USDC, EURC)
              </p>
            </template>
          </div>
        </template>
      </div>
    </div>

    <div
      class="border-gray-600 rounded-md p-2 pt-2"
      v-if="!loadingWalletTransactions"
    >
      <div class="date-range m-auto text-center" v-if="isDataVisible">
        {{ dateRange }}
        <span v-if="syncingPortfolio" class="sync-note"> · {{ loadingProgress || 'syncing…' }}</span>
      </div>
      <p v-if="isDataVisible && (portfolioCapped || localPoolCount > apiPoolCount)" class="api-limit-note">
        Meteora API returns at most ~{{ portfolioPoolCap }} recent pools
        ({{ apiPoolCount || portfolioTotalCount }} from API
        <template v-if="localPoolCount">
          , {{ localPoolCount }} in local history
        </template>
        <template v-if="portfolioTotalPositions">
          , {{ portfolioTotalPositions }} closed positions all-time
        </template>
        ). Older pools are kept in your browser and filled in over time.
      </p>
      <p v-if="loadError" class="api-limit-note">{{ loadError }}</p>
      <div
        class="gobal-data flex flex-row gap-2 items-center justify-center mt-4 mb-8"
        v-if="isDataVisible"
      >
        <div class="flex flex-row gap-2">WR:</div>
        <div
          :class="
            winRate * 100 >= 50 || winRate === 0
              ? 'win-rate'
              : 'win-rate negative'
          "
          class="win-rate mr-2 font-bold text-xl"
        >
          {{ (winRate * 100).toFixed(2) }}%
        </div>
        <div class="mr-2">
          <span class="mr-2">P&L:</span>
          <span
            class="value text-xl"
            :class="totalProfit >= 0 ? 'positive' : 'negative'"
            >{{ totalProfit.toFixed(2) }} {{ quoteToken }}</span
          >
        </div>
        <div class="mr-2">
          <span class="mr-2">Fees:</span>
          <span class="value text-xl"
            >{{ totalFees.toFixed(2) }} {{ quoteToken }}</span
          >
        </div>
      </div>

      <PerformanceChart
        :positions="positions"
        :sort-by="sortBy"
        :time-period="timePeriod"
        :sort-order="sortOrder"
        :quote-symbol="quoteToken"
        v-if="isDataVisible"
      />
    </div>

    <div class="transaction-list mt-8" v-if="isDataVisible">
      <div
        class="position-item flex flex-col"
        :key="positionKey(position)"
        v-for="position in positions"
      >
        <div class="flex flex-col">
          <div
            class="flex flex-row gap-2 cursor-pointer items-center"
            @click="togglePosition(position)"
          >
            <div
              class="transaction-item-info pair-block flex flex-row gap-2 items-center"
              :class="{ 'with-wallet': walletAddress === 'All wallets' && position.wallet_name }"
              title="Pair"
            >
              <ChevronRightIcon
                v-if="!collapsedPositions[positionKey(position)]"
                class="w-6 h-6 shrink-0"
              />
              <ChevronDownIcon v-else class="w-6 h-6 shrink-0" />
              <span class="pair-label">
                {{ position.base_symbol }} - {{ position.quote_symbol }}
              </span>
              <span
                v-if="walletAddress === 'All wallets' && position.wallet_name"
                class="wallet-name"
                :title="position.wallet_name"
              >
                {{ position.wallet_name }}
              </span>
            </div>
            <div
              class="transaction-item-info profit flex flex-row gap-2 items-center"
              title="Profit"
            >
              <ChevronDoubleUpIcon class="w-6 h-6" v-if="position.profit > 0" />
              <ChevronDoubleDownIcon
                class="w-6 h-6"
                v-if="position.profit < 0"
              />
              <span
                class="value profit"
                :class="position.profit > 0 ? 'positive' : 'negative'"
                >{{ position.profit.toFixed(2) }} {{ quoteToken }}</span
              >
            </div>
            <div
              class="transaction-item-info fees flex flex-row gap-2 items-center"
              title="Fees"
            >
              <CurrencyDollarIcon class="w-4 h-4" />
              {{ position.fee_amount.toFixed(2) }} {{ quoteToken }}
            </div>
            <div class="flex-1"></div>
            <div class="filler"></div>
            <div class="mr-2" v-if="groupBy === 'position'">
              <a
                class="flex flex-row gap-2 items-center"
                :href="`https://edge.meteora.ag/dlmm/${position.pool_address}`"
                title="Meteora pool"
                target="_blank"
              >
                <ArrowTopRightOnSquareIcon class="w-4 h-4" />
              </a>
            </div>
          </div>
          <div
            class="position-transactions relative overflow-x-auto"
            v-show="collapsedPositions[positionKey(position)]"
          >
            <p v-if="loadingDetails[positionKey(position)]" class="p-3">
              Loading details...
            </p>
            <table
              v-else
              class="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400"
            >
              <thead
                class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400"
              >
                <tr>
                  <th scope="col" class="date">Date</th>
                  <th scope="col">Deposit</th>
                  <th scope="col">Withdrawal</th>
                  <th scope="col">Fee</th>
                  <th scope="col"></th>
                </tr>
              </thead>
              <tbody>
                <tr
                  class="bg-white border-b dark:bg-zinc-900 dark:border-gray-700 border-gray-200"
                  v-for="transaction in displayTransactions(position)"
                  :key="transaction.signature + '-' + transaction.block_time"
                >
                  <td class="date">
                    {{ getDateFromBlockTime(transaction.block_time) }}
                  </td>
                  <td class="text-right deposit">
                    <template v-if="transaction.deposit > 0">
                      <div class="flex items-center gap-2">
                        <ArrowTurnRightDownIcon class="w-4 h-4" />
                        {{ transaction.deposit.toFixed(2) }}
                      </div>
                    </template>
                  </td>
                  <td class="text-right withdrawal">
                    <template v-if="transaction.withdrawal > 0">
                      <div class="flex items-center gap-2">
                        <ArrowTurnLeftUpIcon class="w-4 h-4" />
                        {{ transaction.withdrawal.toFixed(2) }}
                      </div>
                    </template>
                  </td>
                  <td class="text-right fee">
                    <template v-if="transaction.fee_amount > 0">
                      <div class="flex items-center gap-2">
                        <CurrencyDollarIcon class="w-4 h-4" />
                        {{ transaction.fee_amount.toFixed(2) }}
                      </div>
                    </template>
                  </td>
                  <td>
                    <a
                      v-if="transaction.signature && !position.is_pool_group"
                      class="inline-flex"
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
  PORTFOLIO_POOL_CAP,
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
const portfolioCapped = ref(false)
const portfolioTotalCount = ref(0)
const portfolioTotalPositions = ref(0)
const apiPoolCount = ref(0)
const localPoolCount = ref(0)
const portfolioPoolCap = PORTFOLIO_POOL_CAP
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
  return (
    walletAddress.value &&
    !loadingWalletTransactions.value &&
    positions.value.length > 0
  )
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

  portfolioCapped.value = !!meta?.capped
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
      capped: false,
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
        meta.capped = meta.capped || !!result?.capped
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
      portfolioCapped.value = false
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
.date-range {
  font-size: 1em;
  font-weight: bold;
  margin-bottom: 0em;
  margin-top: 1.5em;
  width: 100%;
}

.sync-note {
  color: #888;
  font-size: 0.85em;
  font-weight: normal;
  font-style: italic;
}

.api-limit-note {
  text-align: center;
  color: #c9a227;
  font-size: 0.85em;
  margin: 0.75rem auto 0;
  max-width: 40rem;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  margin: 2rem 0;
}

.loading-progress {
  color: #aaa;
  font-size: 0.9em;
}

.transaction-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.position-item {
  border: 2px solid #334;
  border-radius: 10px;
  padding: 10px 10px 3px 10px;
  gap: 10px;
  display: flex;
  flex-direction: column;
}

.win-rate {
  color: #3DDC84;
}

.win-rate.negative {
  color: #FF4757;
}

.pair-block {
  font-size: 1.2em;
  font-weight: bold;
  width: 280px;
  min-width: 280px;
}

.pair-block.with-wallet {
  width: 480px;
  min-width: 480px;
}

.pair-label {
  display: inline-block;
  width: 200px;
  min-width: 200px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex-shrink: 0;
}

.pair-block.with-wallet .pair-label {
  width: 220px;
  min-width: 220px;
}

.wallet-name {
  display: inline-block;
  font-size: 0.85em;
  color: #aaa;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  width: 180px;
  min-width: 180px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex-shrink: 0;
}

.profit {
  width: 160px;
}

.positive {
  color: #3DDC84;
}

.negative {
  color: #FF4757;
}

.position-transactions {
  margin-top: 10px;
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 10px;
  border-radius: 10px;

  table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 1rem;

    th {
      text-align: left;
      padding: 0.75rem;
      font-weight: 600;
      border-width: 0;

      &.date {
        min-width: 160px;
        width: 160px;
      }
    }

    td {
      padding: 0.75rem;
      border-width: 0;

      &.date {
        width: 160px;
      }

      &.deposit,
      &.withdrawal,
      &.fee {
        width: 100px;
        text-align: right;
      }
    }
  }
}

.transaction-item-info {
  align-items: center;
  display: flex;
  flex-direction: row;
  gap: 4px;
}
</style>
