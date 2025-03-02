<template>
  <div class="text-center">
    <img
      class="m-auto max-w-sm"
      src="~/assets/images/illustrations/nft-tools-guide.png"
    />
  </div>

  <h1>Solana NFT Tools</h1>

  <p>
    The Solana eco-system provides many tools to help you trading your NFTs.
    It’s a bit hard to find your way into it. Fortunately, I curated for you the
    ones that are the most useful to me. It will give you a quick start for your
    journey in the Solana space.
  </p>
  <h2 id="trading">Trading</h2>
  <p>
    The best tool for NFT trading is by far
    <a href="http://Tensor.trade">Tensor.trade</a>. It’s a very fast app that
    provides you with many features to make proper deals:
  </p>
  <ul>
    <li>
      Fast browsing of daily top 24h volume collections via filters and clear
      listing.
    </li>
    <li>
      A system to explore collection listings and order books visually or via
      simple tables.
    </li>
    <li>Listing capabilities (instant-trade or like in any marketplaces)</li>
  </ul>
  <p>
    <img
      src="~/assets/images/screenshots/trading.png"
      alt="Tensor Trade screenshot"
    />
  </p>
  <p>
    <a href="https://magiceden.io/">Magiceden</a> is the alternative
    marketplace. It supports other chains (Ethereum, Ordinals, ...)
    but is less convenient to manage your listings.
  </p>
  <h2 id="swapping">Swapping</h2>
  <p>
    It’s common that you want to trade a NFT with someone you met on Discord.
    With a raw wallet there is no safe way to do this. But
    Foxy Swap
    (<a href="https://famousfoxes.com/foxyswap">famousfoxes.com/foxyswap</a>)
    can secure
    this for a few $FOXY by acting as a middleman. You just select the NFT you
    want to trade from a given wallet. Then you can propose your own NFT for
    trading. You will be sure that the trade will happen as you set it.
  </p>
  <p>
    <img
      src="~/assets/images/screenshots/swapping.png"
      alt="Foxy Swap screenshot"
    />
  </p>
  <h2 id="token-marketplace">Token marketplace</h2>
  <p>
    Many collections propose rewards as tokens. These tokens can have many
    different utilities and they are provided to collection holders through
    staking or events. But, an alternate way to get them is to trade them on the
    Famous foxes token market:
    <a href="https://famousfoxes.com/tokenmarket"
      >famousfoxes.com/tokenmarket</a>.
  </p>
  <p>
    It acts like any decentralize exchange, you can set orders or buy directly
    from listed orders.
  </p>
  <p>
    <img
      src="~/assets/images/screenshots/tokenmarket.png"
      alt="Tokenmarket screenshot"
    />
  </p>
  <h2 id="statistics">Statistics</h2>
  <p>
    To get an overview of the main statistics of a collections such a mint date,
    number of holders, Twitter followers, Discord members and volumes,
    <a href="https://moon.ly/">moon.ly</a> is the place for it. It’s easy to
    find the collection you are interested in and dashboards are pretty clear.
  </p>
  <p>
    <img
      src="~/assets/images/screenshots/statistics.png"
      alt="Statistics screenshot"
    />
  </p>
  <h2 id="lending"><strong>Lending</strong></h2>
  <p>
    You may need some sols for a spot opportunity but they are stuck in a NFT
    you want to hold. Some platforms allow you to some sols and put your NFT as
    collateral. It’s quite risky because the interest rate is high and a price
    drop of your NFT can make you lose it. Still, it can be handy from time to
    time. <a href="https://sharky.fi/">sharky.fi</a> is the most
    popular platform for lending or borrowing.
  </p>
  <p>
    There are alternative lending platform named Citrus (<a
      href="https://citrus.famousfoxes.com"
      >citrus.famousfoxes.com</a
    >). and Frakt (<a href="https://app.frakt.xyz/">app.frakt.xyz</a>)
  </p>
  <p>
    <img
      src="~/assets/images/screenshots/lending.png"
      alt="Lending screenshot"
    />
  </p>
  <p>
    That’s it, I hope you enjoyed and discovered new tools. Please let me know
    if you have any suggestions!
  </p>
</template>


<script setup>
const description =
  "Tips for Solana NFT trading, avoid mistakes and increase your chances of success";
useHead({
  title: "The Wise Trade | Solana NFT Tools",
  meta: [
    { name: "description", content: description },
    { name: "og:description", content: description },
    { name: "og:image", content: "https://thewise.trade/lion_logo.png" },
    { name: "og:type", content: "website" },
  ],
});
</script>
