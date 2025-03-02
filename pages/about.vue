<template>
  <div class="container max-w-screen-md mx-auto">
    <p class="flex justify-center mt-16 flex-wrap">
      <img class="rounded-lg shadow mr-5 mb-5" src="~/assets/images/defilogist.png" />
    </p>

    <h1>About me</h1>

    <p>
      I'm DeFilogist, a deFi and NFT
      enthusiast who made significant gains with
      cryptos via providing liquidity with Pancakeswap.
      I grew my portfolio from $4k to $50k,  then I cashed out half of it and
      invested the rest in NFTs and small caps cryptos.
    </p>

    <p>
      From there, I made all the mistakes possible by trading shitcoins and
      NFTs. I lost more than half of my remaining portfolio.
      After these hard-earned lessons, I decided to look for options with a
      better risk/reward ratio and to share what I found on this website.
    </p>

    <p>
      From the end of 2023 to 2024, a new bull-run started. The NFT
      market took a serious hit but a new meta began with airdrop farming. My
      priorities shifted to smart liquidity providing and airdrop chasing.
      This strategy has been rewarding so far. I started with around $10k and
      my portfolio value is now close to $130k.
    </p>

    <p>
      The airdrop season is ended and now the market is slower, but liquidity
      providing can still be rewarding. That's why in this website, I share
      with you guides and tools to take the most out of it. We focus on two
      aspects: token pools liquidity providing via Meteora DLMMs and SOL
      staking via LSTs.
    </p>

    <h1 class="mt-12">Strategy for 2025</h1>

    <h1 class="mt-12">Main strategy for Q1-Q2 2025</h1>

    <p>
      The crypto market is in pretty bad shape and geopolics are uncertain. So,
      I decided to hold and stake my favorites tokens JUP and CLOUD.
      Most of my portfolio was turned to USDC that I will try to grow through
      liquidity providing for strong tokens. I also cashed out a siginificant
      part to support personal needs.
    </p>

    <h1 class="mt-12">Portfolio</h1>

    <p>
      I decided to be transparent. That's why, I am sharing with you my
      portfolio. You can see how things evolve for me and know more about my
      trades. A sum up of my holdings can be found on my
      <NuxtLink to="/portfolio">portfolio</NuxtLink> page.
    </p>

    <h2>Tokens</h2>

    <a
      class="linkblock"
      href="https://portfolio.jup.ag/portfolio/wiseCUogbp8QkzrNF6ku8cfZrWkRtbTinYso1KQRH7i_CPYDZMorfh3q6rd8L67VvaF4x5gnD9e66HiZHvK7CyFV/-R9bWPhZHElT2Qi6c5HDj"
    >
      My Token list
    </a>


    <h2>Meteora activity</h2>

    <a
      class="linkblock"
      href="https://geeklad.github.io/meteora-profit-analysis/wallet/CPYDZMorfh3q6rd8L67VvaF4x5gnD9e66HiZHvK7CyFV"
    >
      My Meteora P&L
    </a>

  </div>
</template>

<script setup>
const description = 'Tips for Solana NFT trading, avoid mistakes and increase your chances of success'
useHead({
  title: 'The Wise Trade | About',
  meta: [
    { name: 'description', content: description },
    { name: 'og:description', content: description },
    { name: 'og:image', content: 'https://thewise.trade/defilogist.png' },
    { name: 'og:type', content: 'website' },
  ]
})
</script>

<style scoped>
img {
  border-radius: 50%;
  max-width: 300px;
  margin-right: 10px;
}
</style>
