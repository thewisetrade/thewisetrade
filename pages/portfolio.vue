r<template>
<div class="portfolio">
  <div class="flex flex-row gap-4">
    <div class="column">
      <h2 class="portfolio-size">Portfolio Size: ${{ total.toFixed(0) }}</h2>
      <h4 class="cashed-out">Stables: ${{ stableTotal }}</h4>
      <h4 class="cashed-out">Cashed out: ${{ tokens.cashOut }}</h4>
      <h4 class="invested">Invested: ${{ tokens.invested }}</h4>

      <div class="tokens" v-for="tokenType in ['liquid', 'nft', 'locked']">
        <h2>{{ tokenType }}: ${{ sums[tokenType].toFixed(0) }}</h2>

        <table>
          <thead>
            <tr>
              <th>Category</th>
              <th>Token</th>
              <th>Amount hold</th>
              <th>Token price</th>
              <th>Dollar value</th>
              <th>Percentage</th>
            </tr>
          </thead>
          <tbody>
            <tr
              :key="token.name"
              v-for="token in tokens[tokenType]"
            >
              <td class="name">{{ token.category }}</td>
              <td class="name">{{ token.name }}</td>
              <td>{{ token.amount }}</td>
              <td v-if="token.type === 'meme'">
                {{ (token.price * 1_000_000).toFixed(3) }}
              </td>
              <td v-else>{{ token.price.toFixed(3) }}</td>
              <td v-if="token.type === 'meme'">
                {{ (token.price * 1_000_000 * token.amount).toFixed(3) }}
              </td>
              <td v-else>
                {{ (token.price * token.amount).toFixed(3) }}
              </td>
              <td>{{ (100 * token.price * token.amount / total).toFixed(2) }}%</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <div class="column prices">
      <h3>
        BTC: ${{ btcPrice }}  <br/>
        ETH: ${{ ethPrice }}  <br/>
        SOL: ${{ solPrice }}  <br/>
        SUI: ${{ suiPrice }}  <br/>
        HYPE: ${{ hypePrice }}  <br/>
      </h3>
    </div>
  </div>
</div>
</template>

<script setup>
const tokens = reactive({
  stables: [
    { category: 'Stables', name: 'USDC', amount: 0 },
  ],
  liquid: [
    { category: 'Solana', name: 'SOL', amount: 85},
    { category: 'Hyperliquid', name: 'HYPE', amount: 45 },
    { category: 'SUI', name: 'SUI', amount: 320 },
    { category: 'Stables', name: 'USDC', amount: 0 }
  ],
  nft: [
    { category: 'Solana', name: 'SOL', amount: 20 },
  ],
  locked: [
    { category: 'Solana', name: 'JUP', amount: 30500 },
    { category: 'Solana', name: 'CLOUD', amount: 376000 },
    { category: 'Cosmos', name: 'ATOM', amount: 200 },
    { category: 'Cosmos', name: 'TIA', amount: 50 },
  ],
  stableRep: [
    { protocol: 'hyperliquid', amount: 6000 },
    { protocol: 'Kamino/Marginfi', amount: 6600 },
    { protocol: 'Abstract', amount: 1000 },
    { protocol: 'Navi/Bluefin', amount: 9700 },
    { protocol: 'osmosis', amount: 200 },
    { protocol: 'Drift', amount: 0 },
    { protocol: 'loopscale', amount: 0 },
    { protocol: 'Meteora', amount: 8800 },
    { protocol: 'Humana', amount: 1000 },
  ],
  cashOut: 40000,
  invested: 1700,
})


const stableTotal = tokens.stableRep.reduce(
  (acc, token) => acc + token.amount, 0
)
tokens.liquid[3].amount = stableTotal

// Points

const platforms = reactive([])


// Token price

import { Connection, PublicKey } from '@solana/web3.js'
import { PythConnection, PriceStatus, PythHttpClient, getPythClusterApiUrl,
  getPythProgramKeyForCluster, PythCluster } from '@pythnetwork/client'

const pythClusterName = 'pythnet'
const connection = new Connection(getPythClusterApiUrl(pythClusterName))
const connection2 = new Connection(getPythClusterApiUrl(pythClusterName))
const pythPublicKey = getPythProgramKeyForCluster(pythClusterName)
const feeds = [new PublicKey('H6ARHf6YXhGYeQfUzQNGk6rDNnLBQKrenN712K4AQJEG')]

const pythClient = new PythHttpClient(connection, pythPublicKey)
const data = await pythClient.getData()

let total = 0
let totalWithoutCloud = 0
const tokenFlat = tokens.liquid
  .concat(tokens.locked).concat(tokens.stables).concat(tokens.nft)
const tokenMap = {}
tokenFlat.forEach(async token => {
  if (token.type !== 'absent') {
    const symbol = 'Crypto.' + token.name + '/USD'
    const price = await data.productPrice.get(symbol)
    token.price = price.price
  }
  total += token.amount * token.price
  tokenMap[symbol] = token
})
const btcPrice = await data.productPrice.get('Crypto.BTC/USD').price.toFixed(0)
const ethPrice = await data.productPrice.get('Crypto.ETH/USD').price.toFixed(2)
const solPrice = await data.productPrice.get('Crypto.SOL/USD').price.toFixed(2)
const suiPrice = await data.productPrice.get('Crypto.SUI/USD').price.toFixed(2)
const hypePrice = await data.productPrice.get('Crypto.HYPE/USD').price.toFixed(2)


// Real time

let stableAmount = tokens.stables[0].amount
stableAmount = 0
tokens.stableRep.forEach(stable => {
  stableAmount += stable.amount
})

const stablePercent = computed(() => ((stableAmount / total) * 100).toFixed(0))
const sums = computed(() => {
  let sumLiquid = 0
  tokens.liquid.forEach(token => {
    sumLiquid += token.price * token.amount
  })
  let sumNft = 0
  tokens.nft.forEach(token => {
    sumNft += token.price * token.amount
  })
  let sumLocked = 0
  tokens.locked.forEach(token => {
    sumLocked += token.price * token.amount
  })
  let sumStables = 0
  tokens.stables.forEach(token => {
    sumStables += token.price * token.amount
  })
  return {
    liquid: sumLiquid,
    locked: sumLocked,
    monitoring: 0,
    nft: sumNft,
    stables: sumStables
  }
})

const description =
"My portfolio";
useHead({
title: "The Wise Trade | Portfolio",
  meta: [
    { name: "description", content: description },
    { name: "og:description", content: description },
    { name: "og:image", content: "https://thewise.trade/defilogist.png" },
    { name: "og:type", content: "website" },
  ],
});
</script>
<style scoped>
body {
  background: black;
}

.container {
  background: grey;
  color: #EEE;
}

td {
  text-align: right;
}

td.name {
  text-align: left;
}

.portfolio-size {
  margin-top: 0em;
  margin-bottom: 0em;
}

.invested,
.cashed-out {
  font-size: 0.8em;
}

.prices {
  border-left: 1px solid #999;
  padding-left: 1em;
  margin-top: 0em;
  margin-bottom: 0em;
}
</style>
