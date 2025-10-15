<template>
  <div id="portfolio-performance" class="container">

    <AppHeader
      link="https://geeklad.github.io/meteora-profit-analysis/"
      author="Geeklad DB"
      title="DLMM Performance"
    />

    <div class="flex flex-row gap-2">
      <WalletSelector
        v-model="selectedWallet"
      />
      <div class="flex-1"></div>
    </div>

    <div class="flex flex-row gap-2">
      <button class="reset-database pl-2" @click="open()">
        reset database
      </button>
    </div>

    <div
      class="flex flex-row gap-2 text-lg mb-4 justify-center"
      v-if="isDataVisible"
    >
      <ToggleButtons
        class="mr-5 filter"
        label="Quote token"
        :values="[
          { text: 'SOL', value: 'SOL' },
          { text: 'USDC', value: 'USDC' },
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

    <div v-if="loadingWalletTransactions" class="loading-state">
      <Loader class="loading" />
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
            <p>No data found</p>
          </div>
        </template>
      </div>
    </div>

    <div class="border-gray-600 rounded-md p-2 pt-2" v-if="!loadingWalletTransactions">
      <div class="date-range m-auto text-center" v-if="isDataVisible">
        {{ dateRange }}
      </div>
    <div
      class="gobal-data flex flex-row gap-2 items-center justify-center mt-4 mb-8"
      v-if="isDataVisible"
    >
      <div class="flex flex-row gap-2">WR:</div>
      <div
        :class="winRate * 100 >= 50 || winRate === 0  ? 'win-rate' : 'win-rate negative'"
        class="win-rate mr-2 font-bold text-xl"
      >
        {{ (winRate * 100).toFixed(2) }}%
      </div>
      <div class="mr-2">
        <span class="mr-2">P&L:</span>
        <span
          class="value text-xl"
          :class="totalProfit >= 0 ? 'positive' : 'negative'"
          >{{ totalProfit.toFixed(2) }} ${{ quoteToken }}</span
        >
      </div>
      <div class="mr-2">
        <span class="mr-2">Fees:</span>
        <span class="value text-xl"
          >{{ totalFees.toFixed(2) }} ${{ quoteToken }}</span
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
        :key="position.position_address"
        v-for="position in positions"
      >
        <div class="flex flex-col">
          <div
            class="flex flex-row gap-2 cursor-pointer items-center"
            @click="togglePosition(position.position_address)"
          >
            <div
              class="transaction-item-info pair flex flex-row gap-2 items-center"
              title="Pair"
            >
              <ChevronRightIcon
                v-if="!collapsedPositions[position.position_address]"
                class="w-6 h-6"
              />
              <ChevronDownIcon v-else class="w-6 h-6" />
              {{ position.base_symbol }} - {{ position.quote_symbol }}
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
                >{{ position.profit.toFixed(2) }} ${{ quoteToken }}</span
              >
            </div>
            <div
              class="transaction-item-info fees flex flex-row gap-2 items-center"
              title="Fees"
            >
              <CurrencyDollarIcon class="w-4 h-4" />
              {{ position.fee_amount.toFixed(2) }} ${{ quoteToken }}
            </div>
            <div class="flex-1"></div>
            <div class="filler"></div>
            <div class="mr-2" v-if="groupBy === 'position'">
              <a
                class="flex flex-row gap-2 items-center"
                :href="`https://solscan.io/tx/${position.signature}`"
                title="Solscan view"
                target="_blank"
              >
                <ArrowTopRightOnSquareIcon class="w-4 h-4" />
              </a>
            </div>
          </div>
          <div
            class="position-transactions relative overflow-x-auto"
            v-show="collapsedPositions[position.position_address]"
          >
            <table
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
                  v-for="transaction in position.transactions.reverse()"
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
                  <td></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div class="flex flex-row">
          {{ position.position_is_open ? 'Active' : '' }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { DateTime } from 'luxon'
import { useModal } from 'vue-final-modal'
import { useRoute } from 'vue-router'
import {
  loadDlmmDb,
  getDbPositions,
  applyQuoteToken,
  applyTimePeriod,
  applySortBy,
  applySortOrder,
  getDateFromBlockTime,
  loadWalletTransactions,
  resetDb,
} from '@/utils/dlmm'

import {
  ArrowTurnRightDownIcon,
  ArrowTurnLeftUpIcon,
  ArrowTopRightOnSquareIcon,
  ChevronDoubleUpIcon,
  ChevronDoubleDownIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  CurrencyDollarIcon,
  XMarkIcon,
} from '@heroicons/vue/24/outline'

import ModalConfirm from '@/components/ModalConfirm.vue'

const router = useRouter()

definePageMeta({
  layout: 'app',
})

const RPC_ENDPOINT_URL = import.meta.env.VITE_RPC_ENDPOINT_URL

const walletAddress = ref(null)
const selectedWallet = ref(null)
const loadingWalletTransactions = ref(false)

const quoteToken = ref('SOL')
const sortBy = ref('profit')
const sortOrder = ref('asc')
const groupBy = ref('position')

let transactions = []
const positions = shallowRef([])
const collapsedPositions = ref({})

const winRate = ref(0)
const totalProfit = ref(0)
const totalFees = ref(0)

const allTimePeriod = {
  name: 'All',
  start: DateTime.fromISO('2023-01-01'),
  end: DateTime.now().endOf('day')
}
const timePeriod = ref(allTimePeriod)
const timePeriodOptions = computed(() => {
  return [
    {
      text: 'All',
      value: allTimePeriod
    },
    {
      text: 'Last 24h',
      value: {
        name: '1d',
        start: DateTime.now().minus({ day: 1 }),
        end: DateTime.now(),
      }
    },
    {
      text: 'Last 7 days',
      value: {
        name: '7d',
        start: DateTime.now().minus({ week: 1 }),
        end: DateTime.now(),
      }
    },
    {
      text: 'Last 30 days',
      value: {
        name: '30d',
        start: DateTime.now().minus({ month: 1 }),
        end: DateTime.now(),
      }
    },
    {
      text: 'YTD',
      value: {
        name: '1y',
        start: DateTime.now().minus({ year: 1 }),
        end: DateTime.now(),
      }
    },
    {
      text: 'Week ' + DateTime.now().localWeekNumber,
      value: {
        name: 'week ' + DateTime.now().localWeekNumber,
        start: DateTime.now().startOf('week'),
        end: DateTime.now().endOf('week'),
      }
    },
    {
      text: 'Week ' + DateTime.now().minus({ week: 1 }).localWeekNumber,
      value: {
        name: 'week ' + DateTime.now().minus({ week: 1 }).localWeekNumber,
        start: DateTime.now().minus({ week: 1 }).startOf('week'),
        end: DateTime.now().minus({ week: 1 }).endOf('week'),
      }
    },
    {
      text: DateTime.now().toFormat('MMMM yyyy'),
      value: {
        name: DateTime.now().toFormat('MMMM'),
        start: DateTime.now().startOf('month'),
        end: DateTime.now().endOf('month'),
      }
    },
    {
      text: DateTime.now().minus({ month: 1 }).toFormat('MMMM yyyy'),
      value: {
        name: DateTime.now().minus({ month: 1 }).toFormat('MMMM'),
        start: DateTime.now().minus({ month: 1 }).startOf('month'),
        end: DateTime.now().minus({ month: 1 }).endOf('month'),
      }
    },
    {
      text: DateTime.now().minus({ month: 2 }).toFormat('MMMM yyyy'),
      value: {
        name: DateTime.now().minus({ month: 2 }).toFormat('MMMM'),
        start: DateTime.now().minus({ month: 2 }).startOf('month'),
        end: DateTime.now().minus({ month: 2 }).endOf('month'),
      }
    },
    {
      text: DateTime.now().minus({ month: 3 }).toFormat('MMMM yyyy'),
      value: {
        name: DateTime.now().minus({ month: 3 }).toFormat('MMMM'),
        start: DateTime.now().minus({ month: 3 }).startOf('month'),
        end: DateTime.now().minus({ month: 3 }).endOf('month'),
      }
    },
    {
      text: DateTime.now().minus({ month: 4 }).toFormat('MMMM yyyy'),
      value: {
        name: DateTime.now().minus({ month: 4 }).toFormat('MMMM'),
        start: DateTime.now().minus({ month: 4 }).startOf('month'),
        end: DateTime.now().minus({ month: 4 }).endOf('month'),
      }
    },
    {
      text: DateTime.now().minus({ month: 5 }).toFormat('MMMM yyyy'),
      value: {
        name: DateTime.now().minus({ month: 5 }).toFormat('MMMM'),
        start: DateTime.now().minus({ month: 5 }).startOf('month'),
        end: DateTime.now().minus({ month: 5 }).endOf('month'),
      }
    },
    {
      text: DateTime.now().minus({ month: 6 }).toFormat('MMMM yyyy'),
      value: {
        name: DateTime.now().minus({ month: 6 }).toFormat('MMMM'),
        start: DateTime.now().minus({ month: 6 }).startOf('month'),
        end: DateTime.now().minus({ month: 6 }).endOf('month'),
      }
    },
    {
      text: DateTime.now().minus({ month: 7 }).toFormat('MMMM yyyy'),
      value: {
        name: DateTime.now().minus({ month: 7 }).toFormat('MMMM'),
        start: DateTime.now().minus({ month: 7 }).startOf('month'),
        end: DateTime.now().minus({ month: 7 }).endOf('month'),
      }
    },
    {
      text: DateTime.now().toFormat('yyyy'),
      value: {
        name: DateTime.now().toFormat('yyyy'),
        start: DateTime.now().startOf('year'),
        end: DateTime.now().endOf('year'),
      }
    },
    {
      text: DateTime.now().minus({ year: 1 }).toFormat('yyyy'),
      value: {
        name: DateTime.now().minus({ year: 1 }).toFormat('yyyy'),
        start: DateTime.now().minus({ year: 1 }).startOf('year'),
        end: DateTime.now().minus({ year: 1 }).endOf('year'),
      }
    }
  ]
})

const isDataVisible = computed(() => {
  return (
    walletAddress.value &&
    !loadingWalletTransactions.value
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
  const minTransactionDate = transactions.reduce((min, transaction) => {
    return Math.min(min, transaction.block_time)
  }, transactions[0] ? transactions[0].block_time : 0)
  const startDate = DateTime.fromMillis(minTransactionDate * 1000)
  if (startDate > timePeriod.value.start && startDate < timePeriod.value.end) {
    return startDate
  }
  return timePeriod.value.start
})

const endDate = computed(() => {
  const maxTransactionDate = transactions.reduce((max, transaction) => {
    return Math.max(max, transaction.block_time)
  }, transactions[0] ? transactions[0].block_time : 0)
  const endDate = DateTime.fromMillis(maxTransactionDate * 1000)
  if (endDate > timePeriod.value.start && endDate < timePeriod.value.end) {
    return endDate
  }
  return timePeriod.value.end
})

const dateRange = computed(() => {
  return startDate.value.toFormat('dd/MM/yy') + ' - ' + endDate.value.toFormat('dd/MM/yy')
})

onMounted(async () => {
  setSavedWalletAddress()
  await useWallet()
})

const setSavedWalletAddress = () => {
  let localWalletAddress = useRoute().query.address
  if (!localWalletAddress) {
    localWalletAddress = localStorage.getItem('walletAddress')
  }
  if (localWalletAddress) {
    selectedWallet.value = localWalletAddress
  }
}

const updateWalletAddress = async (address) => {
  walletAddress.value = address
  if (isWalletAddressValid.value) {
    saveWalletAddress()
    await useWallet()
  } else {
    walletAddress.value = ''
    domainName.value = ''
    saveWalletAddress()
  }
}

const saveWalletAddress = () => {
  const address = walletAddress.value
  router.push({ query: { address } })
  localStorage.setItem('walletAddress', walletAddress.value)
}

const useWallet = async () => {
  if (walletAddress.value === '') return
  loadingWalletTransactions.value = true
  let db = await loadDlmmDb()
  const downloader = await loadWalletTransactions(
    db,
    RPC_ENDPOINT_URL,
    walletAddress.value
  )
  db.getOwnerTransactions(walletAddress.value)
    .then(metTransactions => {
      transactions = metTransactions
      resetPositions()
      loadingWalletTransactions.value = false
    })

  // Manage loading state
  let previousTransactionsLength = 0
  const statsInterval = setInterval(async () => {
    const downloadedTransactions = await db.getOwnerTransactions(walletAddress.value)
    if (downloadedTransactions.length !== previousTransactionsLength) {
      previousTransactionsLength = downloadedTransactions.length
      await downloader.stats()
    } else {
      clearInterval(statsInterval)
      transactions = downloadedTransactions
      resetPositions()
      loadingWalletTransactions.value = false
      Promise.resolve()
    }
  }, 1000 * 5)
}

const resetPositions = () => {
  const dbPositions = getDbPositions(groupBy.value, transactions)
  positions.value = applyFilters(dbPositions)
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

const applyFilters = (positions) => {
  let filteredPositions = positions.filter(position => {
    return position.profit > 0.005 || position.profit < -0.005
  })
  filteredPositions = applyQuoteToken(quoteToken.value, filteredPositions)
  filteredPositions = applyTimePeriod(timePeriod.value, filteredPositions)
  filteredPositions = applySortBy(sortBy.value, filteredPositions)
  filteredPositions = applySortOrder(sortOrder.value, filteredPositions)
  return filteredPositions
}

const togglePosition = (signature) => {
  collapsedPositions.value[signature] = !collapsedPositions.value[signature]
}

const clearAll = async () => {
  selectedWallet.value = ''
  domainName.value = ''
  transactions = []
  positions.value = []
  collapsedPositions.value = {}
  winRate.value = 0
  totalProfit.value = 0
  totalFees.value = 0
  await resetDb()
  close()
}

const { open, close } = useModal({
  component: ModalConfirm,
  attrs: {
    title: 'Reset database',
    onConfirm: clearAll,
  },
  slots: {
    default: '<p>You are going to delete all your data. Are you sure do you want to continue?</p>',
  },
})

watch(quoteToken, resetPositions)
watch(timePeriod, resetPositions)
watch(sortBy, resetPositions)
watch(sortOrder, resetPositions)
watch(groupBy, resetPositions)
watch(selectedWallet, (address) => {
  console.log('selectedWallet', address)
  if (address) {
    updateWalletAddress(address)
  } else {
    walletAddress.value = ''
    saveWalletAddress()
  }
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
    { name: 'twitter:url', content: 'https://thewise.trade/dlmm-pool-finder' },
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
  color: #AEA;
}

.win-rate.negative {
  color: #ff0000;
}

.pair {
  font-size: 1.2em;
  font-weight: bold;
  width: 200px;
}

.profit {
  width: 160px;
}

.positive {
  color: #AFA;
}

.negative {
  color: #F99;
}

.current-wallet-address {
  display: inline-block;
  font-size: 1.8em;
  font-weight: bold;
  background: #00000a;
  border: 3px solid #445;
  border-radius: 10px;
  margin: 0 auto 0em auto;
  padding: 0.5em 1em 1.2em 1em;
  position: relative;

  .explainer {
    font-size: 0.7em;
    font-weight: normal;
    font-style: italic;
  }
}

.wallet-address-container {
  flex-direction: column;
  font-size: 0.8em;
  font-weight: bold;
  width: 100%;

  input {
    font-size: 1.2em;
    border-radius: 10px;
    border: 3px solid #445;
    padding: 1em;
    text-align: center;

    &:focus {
      border: 3px solid #686;
      outline: none;
      transition: all 0.5s ease;
    }
  }
}

.position-transactions {
  margin-top: 10px;
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 10px;
}

.transaction-item {
  display: flex;
  flex-direction: row;
  gap: 10px;
  flex: 1;

  .date {
    font-size: 0.8em;
  }

  .transaction-item-info {
    align-items: center;
    display: flex;
    flex-direction: row;
    gap: 4px;
    width: 100px;

    &.date {
      width: 160px;
    }
  }
}

.reset-database {
  color: #999;
  cursor: pointer;
  font-size: 0.8em;
  margin-bottom: 4em;

  &:hover {
    color: white;
  }
}

.position-transactions {
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

      &.deposit {
        width: 100px;
      }

      &.withdrawal {
        width: 100px;
      }

      &.fee {
        width: 100px;
      }
    }

    td {
      padding: 0.75rem;
      border-width: 0;

      &.date {
        width: 160px;
      }

      &.deposit {
        width: 100px;
        text-align: right;
      }

      &.withdrawal {
        width: 100px;
        text-align: right;
      }

      &.fee {
        width: 100px;
        text-align: right;
      }
    }

    thead {
      tr {
        border-top-left-radius: 10px;
        border-top-right-radius: 10px;
      }
    }
  }
}
</style>
