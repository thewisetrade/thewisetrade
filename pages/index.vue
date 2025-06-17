<template>
  <div class="mx-auto p-0">

    <div class="flex align-center items-center header">

      <div class="flex flex-col title-wrapper flex-1">
        <h2 class="mt-0 mb-0 power-up">
          Power-Up
        </h2>
        <h2 class="mt-0 mb-0 text-lg tagline-follow flex">
          Your Solana Portfolio
        </h2>

        <hr class="tagline-divider mt-2" />
        <h4 class="mt-6 text-2xl mb-10 subtagline">
          Guides and Resources for<br /> Liquidity Providing
        </h4>
        <div class="flex flex-row">
          <router-link :to="'/dlmm-guide'" class="px-4 py-2 cta-button">
            Read our first guide →
          </router-link>
        </div>
      </div>
      <div class="">
        <img class="illustration" src="~/assets/images/wise-power-up.png" />
      </div>
    </div>

    <div class="links p-8 flex flex-col">
      <h1 class="font-bold mt-12 m-auto">Meteora DLMM Guides</h1>
      <div class="sections grid lg:grid-cols-4 md:grid-cols-4 gap-4 m-auto">
        <NuxtLink class="guide-link" to="dlmm-guide">
        <img
          class="mb-2"
          src="~/assets/images/illustrations/dlmms-guide.png"
        />
        <h3>Getting Started</h3>
      </NuxtLink>
      <NuxtLink class="guide-link" to="dlmm-guide-2">
        <img
          class="mb-2"
          src="~/assets/images/illustrations/dlmms-tools.svg"
        />
        <h3>DLMM Apps</h3>
      </NuxtLink>
      <NuxtLink class="guide-link" to="dlmm-guide-multidays">
        <img
          class="mb-2"
          src="~/assets/images/illustrations/dlmms-multiday-positions.svg"
        />
        <h3>Multiday Positions</h3>
      </NuxtLink>
      <NuxtLink class="guide-link" to="dlmm-guide-risk-management">
        <img
          class="mb-2"
          src="~/assets/images/illustrations/dlmms-risk-management.svg"
        />
        <h3>Risk Management</h3>
      </NuxtLink>
   </div>

    <h1 class="font-bold mt-12 m-auto">Meteora DLMM Helpers</h1>
    <div class="flex">
      <div class="sections grid lg:grid-cols-3 md:grid-cols-2 gap-4 m-auto">
        <NuxtLink class="guide-link" to="dlmm-pool-finder">
          <img
            class="mb-2"
            src="~/assets/images/illustrations/dlmms-pool-finder.svg"
          />
          <h3>Pool Finder</h3>
        </NuxtLink>
        <NuxtLink class="guide-link" to="dlmm-performance">
          <img
            class="mb-2"
            src="~/assets/images/illustrations/dlmms-performance.svg"
          />
          <h3>Pool Performance</h3>
        </NuxtLink>
        <NuxtLink class="guide-link" to="dlmm-positions">
          <img
            class="mb-2"
            src="~/assets/images/illustrations/dlmms-performance.svg"
          />
          <h3>Opened Positions</h3>
        </NuxtLink>
      </div>
    </div>

    <h1 class="font-bold mt-12 m-auto">Sanctum SOL Staking</h1>
    <div class="sections grid lg:grid-cols-2 md:grid-cols-2 gap-4 m-auto">
      <NuxtLink class="guide-link" to="sanctum">
        <img
          class="mb-2"
          src="~/assets/images/illustrations/sanctum-guide.png"
        />
        <h3>Guide</h3>
      </NuxtLink>
      <NuxtLink class="guide-link" to="lsts">
        <img
          src="~/assets/images/illustrations/sanctum-lsts.png"
          class="mb-2"
        />
        <h3>Interest rates</h3>
      </NuxtLink>
      </div>
    </div>

  </div>
</template>

<script setup>
definePageMeta({
  layout: 'full'
})
const description = 'Power-up your Solana Portfolio with liquidity providing'
useHead({
  title: 'The Wise Trade | Power-up your Solana Portfolio',
  meta: [
    { name: 'description', content: description },
    { name: 'og:description', content: description },
    { name: 'og:image', content: 'https://thewise.trade/solana-logo.png' },
    { name: 'og:type', content: 'website' },
  ]
})
</script>

<style lang="scss" scoped>
.title-wrapper {
  padding-left: 10px;
  max-width: 600px;
  width: 600px;

  h2 {
    margin-top: 0;
  }

  .power-up {
    font-size: 4.8em;
    margin-bottom: 0em;
  }

  .tagline-follow {
    font-size: 2.55em;
    margin-top: 0em;
    background: linear-gradient(90deg, #9945FF 0%, #14F195 100%);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
    font-weight: bold;
  }

  .tagline-divider {
    margin-right: 150px;
    color: #666;
  }

  .cta-button {
    border: 2px solid #999;
    border-radius: 20px;
  }

  .subtagline {
    color: #EEE;
  }
}

.illustration {
  max-width: 500px;
}

h1 {
  margin-top: 6em;
  font-size: 1.3em;
  text-align: left;
  text-transform: uppercase;
}


@media screen and (max-width: 1100px) {
  .title-wrapper {
    .power-up {
      font-size: 4.4em;
    }
  }

  .illustration {
    max-width: 400px;
  }
}

.sections {
  border: 1px solid #6666EEAA;
  padding: 1em;
  border-radius: 20px;
}


@media screen and (max-width: 900px) {
  .container {
    margin: 0;
  }

  .header {
    flex-direction: column;
    text-align: center;
  }

  .title-wrapper {

    h2.tagline-follow {
      margin: auto;
    }

    .tagline-divider {
      margin-right: 0px;
      color: #000;
    }

    .cta-button {
      margin: auto;
      margin-bottom: 2em;
    }
  }

  @media screen and (max-width: 600px) {
    .title-wrapper {
      .power-up {
        font-size: 3.8em;
      }

      .tagline-follow {
        font-size: 2em;
      }
    }
  }
}
</style>
