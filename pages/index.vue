<template>
  <div class="container max-w-screen-md mx-auto">

    <div class="flex flex-column align-center logo-wrapper">
        <img class="p-2 logo" src="~/assets/images/logo.png" />
        <img class="p-2 title" src="~/assets/images/title.png" />
    </div>
    <h2 class="mt-18 text-lg text-center mb-18 tagline">
       Power-up Your Solana Portfolio
    </h2>
    <h4 class="mt-0 text-lg text-center mb-18 tagline italic">
      Guides and Resources for Liquidity Providing
    </h4>

    <h1 class="font-bold mt-12">Meteora Liquidity Providing</h1>
    <div class="grid md:grid-cols-4 gap-4">
      <NuxtLink class="guide-link" to="dlmm-guide">
        <img
          class="mb-2"
          src="~/assets/images/illustrations/dlmms-guide.png"
        />
        <h3>Guide</h3>
      </NuxtLink>
      <NuxtLink class="guide-link" to="dlmm-guide-2">
        <img
          class="mb-2"
          src="~/assets/images/illustrations/dlmms-tools.png"
        />
        <h3>Tools</h3>
      </NuxtLink>
      <NuxtLink class="guide-link" to="dlmm-guide-multidays">
        <img
          class="mb-2"
          src="~/assets/images/illustrations/dlmms-guide.png"
        />
        <h3>Multiday Positions</h3>
      </NuxtLink>
      <NuxtLink class="guide-link" to="dlmm-pool-finder">
        <img
          class="mb-2"
          src="~/assets/images/illustrations/dlmms-guide.png"
        />
        <h3>Pool Finder</h3>
      </NuxtLink>
    </div>

    <h1 class="font-bold mt-12">Sanctum SOL Staking</h1>
    <div class="grid md:grid-cols-4 gap-4">
      <NuxtLink class="guide-link" to="sanctum">
        <img
          class="mb-2"
          src="~/assets/images/illustrations/sanctum-guide.png"
        />
        <h3>Guide</h3>
      </NuxtLink>
      <NuxtLink class="guide-link" to="lsts">
        <img
          class="mb-2"
          src="~/assets/images/illustrations/sanctum-lsts.png"
        />
        <h3>Interest rates</h3>
      </NuxtLink>
    </div>

  </div>
</template>

<script setup>
const description = 'Power-up your Solana Portfolio'
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
.header {
  max-width: 600px;
  margin-top: 0;
  margin-bottom: 2em;
  align-items: center;

  h1 {
    text-align: left;
  }

  img {
    border-radius: 10px;
    margin-top: 2em;

    &.logo {
      max-width: 180px;
    }
    &.title {
      max-width: 300px;
    }
  }
}

.logo-wrapper {
  align-items: center;
  margin: auto;
  max-width: 500px;
  margin-bottom: 0.5em;

  .logo {
    max-width: 200px;
  }

  .title {
    width: 300px;
    height: auto;
  }
}

h1 {
  margin-top: 6em;
  font-size: 1.3em;
  text-align: left;
  text-transform: uppercase;
}

h2.tagline {
  font-size: 2.1em;
  line-height: 1.3em;
  text-transform: capitalize;
}

@media screen and (max-width: 800px) {
  .logo-wrapper {
    flex-direction: column;
    margin-bottom: 1em;
  }

  h2.tagline {
    font-size: 1.5em;
    margin-top: 1em;
  }
}
</style>
