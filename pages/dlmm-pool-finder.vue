<template>
  <div id="pool-finder" class="container">
    <div class="flex flex-row items-center mb-10">
      <h1 class="app-title flex-1">DLMM Active Pool Finder</h1>
      <a
        class="credit"
        href="https://tokleo.com/"
        target="_blank"
      >
      Powered by Tokleo API
      </a>
    </div>

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
     </div>
    </div>

    <div class="filter-headers">
      <span class="fees">Fees</span>
      <span class="name">Name</span>
      <span class="gen-fees">24h fees</span>
      <span class="two-fees">2h fees</span>
      <span class="liq">Liquidity</span>
      <span class="mc">MC</span>
    </div>

    <div class="pools">
      <Loader v-if="isLoading" />
      <a
        :key="pool.id"
        target="_blank"
        :href="`https://app.meteora.ag/dlmm/${pool.meteora_address}`"
        v-for="pool in displayedPools"
      >
        <div
          class="pool flex flex-row gap-4 items-center rounded-xl"
        >
          <span class="data pool-parameters">{{ pool.meteora_baseFeePercentage }}%</span>
          <h2>{{ pool.meteora_name }}</h2>
          <span class="fee-ratio font-bold">{{
            pool.meteora_feeTvlRatio.h24.toFixed(2) }}%</span>
          <span class="fee-ratio font-bold">{{
            pool.meteora_feeTvlRatio.h2.toFixed(2) }}%</span>
          <a
            target="_blank"
            :href="`https://www.birdeye.so/token/${pool.meteora_degenTokenAddress}?chain=solana`">
            chart
          </a>
          <span class="flex-1"></span>
          <span class="data">{{ Math.round(pool.meteora_liquidity / 1000) }}K</span>
          <span class="data mc">{{ Math.round(pool.top_pair_mcap / 1_000_000) }}M</span>
        </div>
      </a>
    </div>
  </div>

</template>

<script setup>
definePageMeta({
  layout: 'app'
})

const isLoading = ref(false)

const pools = []
const displayedPools = ref([])

const marketCap = ref(10)
const binStep = ref(100)
const liquidity = ref(10)
const age = ref(1)


const resetDisplayedPools = () => {
  displayedPools.value = pools
    .filter(p => p.meteora_quoteToken === 'SOL')
    .filter(p => p.meteora_binStep === binStep.value)
    .filter(p => p.top_pair_mcap >= marketCap.value * 1_000_000)
    .filter(p => p.meteora_liquidity >= liquidity.value * 1_000)
    .filter(p => p.oldest_pair_ageInHours >= age.value * 24)
    .sort((pa, pb) => pb.meteora_feeTvlRatio.h24 - pa.meteora_feeTvlRatio.h24)
  console.log(displayedPools.value)
}

const loadPoolsData = () => {
  isLoading.value = true
  fetch("https://api.tokleo.com/api/public/pools", {
    headers: {
      'X-Public-Key': 'Daisy-Uncouth-Chrome-Demanding-Freight-Boxcar6'
    }
  })
    .then(res => res.json())
    .then(data => {
      data.pools.forEach(pool => {
        pools.push(pool)
      })
      resetDisplayedPools()
      isLoading.value = false
    })
}

loadPoolsData()

watch(binStep, resetDisplayedPools)
watch(marketCap, resetDisplayedPools)
watch(liquidity, resetDisplayedPools)
watch(age, resetDisplayedPools)

const description =
  "Meteora DLMM - Active Pool Finder";
const title = "The Wise Trade | Meteora DLMM - Active Pool Finder"
useHead({
  title,
  meta: [
    { name: "title", content: title },
    { name: "description", content: description },
    { name: "og:title", content: title },
    { name: "og:description", content: description },
    { name: "og:image", content: "https://thewise.trade/illustrations/dlmms-guide.png" },
    { name: "og:type", content: "Website" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: "https://thewise.trade/illustrations/dlmms-guide.png" },
    { name: "twitter:url", content: "https://thewise.trade/dlmm-pool-finder" },
    { name: 'twitter:card', content: 'summary_large_image' }
  ],
});
</script>

<style scoped>
.app-title {
  margin: 0;
  text-align: left;
  text-transform: uppercase;
  font-size: 1.4em;
}

#pool-finder.container {
  display: flex;
  flex-direction: column;
  padding-top: 0;
  min-width: 820px;
  height: 78vh;
}

.pool {
  border: 1px solid #2336A4;
  padding: .5em 1em;
}

.fee-ratio {
  color: #AEA;
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
  color: #CCE;
  font-size: 0.9em;
}

.credit {
  color: #CCE;
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
    color: #CCE;
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
    min-width: 478px;
  }

  .liq {
    min-width: 92px;
  }

  .mc {
  }
}

.data.mc {
  min-width: 40px;
  text-align: right;
}
</style>
