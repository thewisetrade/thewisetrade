<template>
  <div id="portfolio-performance" class="container">
    <div class="flex flex-row items-center mb-8">
      <h1 class="app-title flex-1">DLMM Portfolio Performance</h1>
      <div class="flex-1"></div>
      <a
        class="credit"
        href="https://geeklad.github.io/meteora-profit-analysis/"
        target="_blank"
      >
        Powered by Geeklad DB
      </a>
    </div>

    <Loader class="" v-if="loadingWalletAddress" />
    <div
      class="flex flex-row gap-2"
      v-else-if="currentWalletAddress"
    >
      <div
        class="text-center wallet-address-container"
      >
        <div class="current-wallet-address mb-8">
          <div class="text-3xl mt-4">{{ domainName ? domainName : currentWalletAddress }}</div>
          <span class="text-sm close-button" @click="resetWalletAddress">
            <XMarkIcon class="w-4 h-4" />
          </span>

        <div>
        <div class="date-range " v-if="!loadingWalletTransactions">
          {{ dateRange }}
        </div>
        <Loader v-if="loadingWalletTransactions" />
        <div
          class="gobal-data flex flex-row gap-2 items-center justify-center mt-4"
          v-else-if="currentWalletAddress && !loadingWalletTransactions"
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
      </div>
        </div>
      </div>
    </div>

    <div
      class="flex wallet-address-container gap-2 mb-8"
      v-show="!currentWalletAddress && !loadingWalletAddress"
    >
      <div class="text-center">
        Enter your wallet address to see your performance history
      </div>
      <div class="flex flex-row gap-2">
        <input
          ref="walletAddressInput"
          class="input w-full max-w-md border-2 border-gray-300 rounded-md p-2 m-auto"
          type="text"
          @keyup.enter="loadWalletTransactions"
          v-model="walletAddress"
        />
      </div>
      <div
        class="error-message text-red-500 text-center"
        v-if="errors.invalidAddress"
      >
        Invalid wallet address
      </div>
      <div
        class="error-message text-red-500 text-center"
        v-if="errors.invalidDomain"
      >
        Invalid domain name
      </div>
      <div class="domain-name text-green-500 text-center" v-if="domainName">
        {{ domainName }}
      </div>
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
        class="filter"
        label="Group by"
        :values="[
          { text: 'Position', value: 'position' },
          { text: 'Pair', value: 'pair' },
        ]"
        v-model="groupBy"
      />
    </div>

    <div
      class="flex flex-row text-lg mb-8 justify-center"
      v-if="isDataVisible"
    >
      <ToggleButtons
        class="filter"
        label="Time period"
        :values="timePeriodOptions"
        v-model="timePeriod"
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
                  v-for="transaction in position.transactions"
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
import { useTemplateRef, nextTick } from 'vue'

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

import { validateWalletAddress } from '@/utils/solana'

import {
  getDbPositions,
  applyQuoteToken,
  applyTimePeriod,
  applySortBy,
  applySortOrder,
  getDateFromBlockTime,
  loadWalletTransactions,
  resetDb,
} from '@/utils/dlmm'

definePageMeta({
  layout: 'app',
})

const RPC_ENDPOINT_URL =
  'https://hardworking-palpable-arrow.solana-mainnet.quiknode.pro/0213d582329af74486932e0ed98015d3e4f7ac52/'

const walletAddress = ref('')
const currentWalletAddress = ref('')
const domainName = ref('')
const errors = ref({
  invalidAddress: false,
  invalidDomain: false,
})
const walletAddressInput = useTemplateRef('walletAddressInput')
const loadingWalletAddress = ref(true)
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
  end: DateTime.now(),
}
const timePeriod = ref(allTimePeriod)
const timePeriodOptions = computed(() => {
  return [
    {
      text: 'All',
      value: allTimePeriod
    },
    {
      text: '1d',
      value: {
        name: '1d',
        start: DateTime.now().minus({ day: 1 }),
        end: DateTime.now(),
      }
    },
    {
      text: '7d',
      value: {
        name: '7d',
        start: DateTime.now().minus({ week: 1 }),
        end: DateTime.now(),
      }
    },
    {
      text: '30d',
      value: {
        name: '30d',
        start: DateTime.now().minus({ month: 1 }),
        end: DateTime.now(),
      }
    },
    {
      text: '1y',
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
      text: DateTime.now().toFormat('MMMM'),
      value: {
        name: DateTime.now().toFormat('MMMM'),
        start: DateTime.now().startOf('month'),
        end: DateTime.now().endOf('month'),
      }
    },
    {
      text: DateTime.now().minus({ month: 1 }).toFormat('MMMM'),
      value: {
        name: DateTime.now().minus({ month: 1 }).toFormat('MMMM'),
        start: DateTime.now().minus({ month: 1 }).startOf('month'),
        end: DateTime.now().minus({ month: 1 }).endOf('month'),
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

onMounted(async () => {
  const localWalletAddress = localStorage.getItem('walletAddress')
  if (localWalletAddress) {
    walletAddress.value = localWalletAddress
  }
  walletAddressInput.value.focus()
  await updateWalletAddress()
  loadingWalletAddress.value = false
})

const isDataVisible = computed(() => {
  console.log('isDataVisible', currentWalletAddress.value, loadingWalletTransactions.value)
  return (
    currentWalletAddress.value &&
    !loadingWalletTransactions.value
  )
})

const dateRange = computed(() => {
  return timePeriod.value.start.toFormat('dd/MM/yy') + ' - ' + timePeriod.value.end.toFormat('dd/MM/yy')
})

const updateWalletAddress = async () => {
  if (walletAddress.value === '') return
  errors.value.invalidAddress = false
  errors.value.invalidDomain = false
  const { solanaDomain, solanaAddress, wrongAddress, wrongDomain } =
    await validateWalletAddress(walletAddress.value)
  domainName.value = solanaDomain
  currentWalletAddress.value = solanaAddress
  errors.value.invalidAddress = wrongAddress
  errors.value.invalidDomain = wrongDomain

  if (!errors.value.invalidAddress && !errors.value.invalidDomain) {
    useWallet()
  } else {
    loadingWalletAddress.value = false
    loadingWalletTransactions.value = false
    currentWalletAddress.value = ''
    domainName.value = ''
  }
}

const resetWalletAddress = () => {
  walletAddress.value = ''
  currentWalletAddress.value = ''
  domainName.value = ''
  errors.value.invalidAddress = false
  errors.value.invalidDomain = false
  nextTick(() => {
    walletAddressInput.value.focus()
  })
}

const useWallet = async () => {
  loadingWalletAddress.value = false
  localStorage.setItem(
    'walletAddress',
    domainName.value || currentWalletAddress.value,
  )
  console.log('useWallet', currentWalletAddress.value, domainName.value)
  loadingWalletTransactions.value = true
  const { db, downloader } = await loadWalletTransactions(
    RPC_ENDPOINT_URL,
    currentWalletAddress.value
  )

  console.log(downloader)
  db.getOwnerTransactions(currentWalletAddress.value)
    .then((metTransactions) => {
      console.log('transactions done', metTransactions)
      transactions = metTransactions
      resetPositions()
      loadingWalletTransactions.value = false
    })


  let previousTransactionsLength = 0
  const statsInterval = setInterval(async () => {
    const downloadedTransactions = await db.getOwnerTransactions(currentWalletAddress.value)
    if (downloadedTransactions.length !== previousTransactionsLength) {
      previousTransactionsLength = downloadedTransactions.length
      const stats = await downloader.stats()
      console.log('stats', stats, stats.downloadingComplete, downloadedTransactions.length)
    } else {
      clearInterval(statsInterval)
      transactions = downloadedTransactions
      resetPositions()
      loadingWalletTransactions.value = false
    }
  }, 1000 * 5)
}

const resetPositions = () => {
  console.log('resetPositions', transactions)
  const dbPositions = getDbPositions(groupBy.value, transactions)
  positions.value = applyFilters(dbPositions)
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
  let filteredPositions = applyQuoteToken(quoteToken.value, positions)
  filteredPositions = applyTimePeriod(timePeriod.value, filteredPositions)
  filteredPositions = applySortBy(sortBy.value, filteredPositions)
  filteredPositions = applySortOrder(sortOrder.value, filteredPositions)
  return filteredPositions
}

const togglePosition = (signature) => {
  collapsedPositions.value[signature] = !collapsedPositions.value[signature]
}

watch(quoteToken, resetPositions)
watch(timePeriod, resetPositions)
watch(sortBy, resetPositions)
watch(sortOrder, resetPositions)
watch(groupBy, resetPositions)
watch(walletAddress, updateWalletAddress)

const description = 'Meteora DLMM - Performance History'
const title = 'The Wise Trade | Meteora DLMM - Performance History'

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
.app-title {
  margin: 0;
  text-align: left;
  text-transform: uppercase;
  font-size: 1.4em;
}

.date-range {
  font-size: 0.8em;
  font-weight: normal;
  margin-bottom: 0em;
  margin-top: 1.5em;
  width: 100%;
}

.current-wallet-address {
  min-width: 250px;
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
  color: #00ff00;
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
  color: #00ff00;
}

.negative {
  color: #ff0000;
}

.credit {
  color: #cce;
  font-size: 0.8em;
}

.current-wallet-address {
  display: inline-block;
  font-size: 1.4em;
  font-weight: bold;
  background: #00000a;
  border: 3px solid #445;
  border-radius: 10px;
  margin: 0 auto 2em auto;
  padding: 0.5em 1em;
  position: relative;

  .explainer {
    font-size: 0.7em;
    font-weight: normal;
    font-style: italic;
  }
}

.close-button {
  float: right;
  cursor: pointer;
  position: absolute;
  right: 10px;
  top: 6px;
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
