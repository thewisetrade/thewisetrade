<template>
  <div class="text-center">
    <img
      class="m-auto max-w-sm"
      src="~/assets/images/illustrations/amm-trading-guide.png"
    />
  </div>
  <h1>The AMM Trading Guide</h1>
  <p>
    AMM stands for Automated Market Maker. AMMs are widely used in crypto by
    decentralized exchanges to allow token swapping. The concept was adopted
    by NFT marketplaces and apps too. They allow a similar scheme for NFTs
    where you can go in and out easily.
  </p>
  <p>
    The main issue of NFT collections is that they lack liquidity, they are
    seen as illiquid assets because they are hard to sell. By providing sols and
    a bunch of NFTs for each collection, AMMs allow anyone to get in and out of a
    collection without waiting for a seller.
  </p>
  <p>
    To accumulate the necessary funds and NFTs, AMM apps require external
    contributions. To encourage people to contribute, AMMs reward anyone
    providing liquidities or NFTs.
  </p>
  <p>
    But how does it work? How can you take advantage of your contribution?
    This is what we are going to explain in this guide. The first part will take you
    into the mechanics of the AMM and will help you to understand how it works.
    The second part will show you how to set up automated investment
    strategies with AMMs.
  </p>
  <p>
    <em
      >NB: Another cool thing offered by AMMs is that it allows any marketplace
      users to swap common NFTs for something they like better.</em
    >
  </p>
  <h2 id="amm-platforms">AMM Platforms</h2>
  <p>
    The most used AMMs platforms are:
    <a href="https://tensor.trade/">Tensor</a>, <a
      href="https://app.elixirnft.io/"
      >Elixir</a
    >, and <a href="https://beta.hadeswap.com/">Hadeswap</a>. They all provide
    extensive guides and documentation, so I won’t cover how to use them. I
    will describe only the theory behind it.
  </p>
  <p>
    I tend to prefer Tensor because it is linked to my favorite marketplace. The
    Elixir UI is great too, and makes item swap easier. Hadeswap is of course a
    nice alternative.
  </p>
  <h2 id="amm-mechanism">AMM Mechanism</h2>
  <p>
    Before AMMs, it wasn't straightforward if you wanted to get or sell an NFT quickly. Selling required to find a vendor, and buying at floor price
    offered very few options. With AMMs, you can instantly sell your NFT and
    always have a good bunch of choices when entering a collection. In this section, we will see how it allows instant selling and simplified
    buying.
  </p>
  <p><strong>Collection-wide bids</strong></p>
  <p>
    The collection-wide bidding system is the first function that allows NFT holders to instant sell. It allows people to provision a bid that
    will act as some sort of limit-buy for a collection. The fact that one can
    put sols and set a buying price allows anyone else to accept the already
    set bids instantly. Most of the time, the propositions are slightly below the
    floor, but they are still interesting for a quick sell.
  </p>
  <p>
    Bidding can be set for multiple NFTs. For this, some parameters can be set
    , like bid caps, to limit the number of buys in case of floor dumps. Another
    very interesting parameter is the progressive rate. You can decide to buy 10
    items while reducing your bid after each buy. The bid modification can be
    done linearly by giving an amount of $SOL to remove each time or by
    percentage by giving a proportion of the price reduction.
  </p>
  <p>
    <em>Example</em>: Let’s say you put a bid to buy 3 LilyNFT at 11 and asking
    for a 1$SOL modification. It will lead you to buy an item at 11, the second
    at 10, and the third at 9.
  </p>
  <p><strong>Progressive Listing</strong></p>
  <p>
    Listing is available on any platform, but some marketplaces propose is to
    sell at a progressive rate. For instance you can list 5 NFTs and sell them
    with an increased price each time an NFT is sold.
  </p>
  <p>
    <em>Example</em>: Let’s say you sell 3 LilyNFT at 13 and ask for a 1$SOL
    modification, it we’ll lead you to sell an item at 13, the second at 14, and
    the third at 15.
  </p>
  <p><strong>Two-sided orders: Market Makers</strong></p>
  <p>
    Basically, a Market Maker for a collection is the combination of the two
    previous mechanisms. They propose you set a pool with, on one side an
    amount of $SOL and, on the other side, a bunch of common NFTs for this
    collection. This pool is coupled with a progressive bid for buying NFTs to
    handle the case where the floor goes down and a progressive sell
    NFTs when the floor goes up.
  </p>
  <p>
    The MM comes with an additional parameter named “delta”. It makes the buy
    bid tied to the selling price. It applies a change when your buying bid
    decreases, your selling price decreases too, and vice-versa if your selling
    price increase. That way you keep following floor variation to ensure
    that you still provide liquidity to it (until you do not have enough sols for
    that). And each time, you collect the difference between your buying and
    your selling.
  </p>
  <p>
    <em>Exemple</em>: Let’s say you create a pool with 36 $SOL and 3 LilyNFT.
    With a buying bid at 12 and a selling bid at 14 and a delta at 2 and a
    progression of 1 after a transaction. When you sell an NFT, the bid increases
    to 13, and your next selling price is 15. Let’s say someone sells you a NFT
    at 13, the bid decreases to 12, and your next selling price is 14. Now let’s
    say someone sells you two NFTs, your bid decreases to 10, and your selling
    price decreases to 12.
  </p>
  <p>
    See the
    <a
      href="https://docs.tensor.trade/provide-liquidity/how-to-provide-liquidity"
      >Tensor documentation</a
    >,
    <a href="https://docs.tensor.trade/provide-liquidity/market-making-example"
      >2</a
    >
    for more examples
  </p>
  <p><strong>AMM</strong></p>
  <p>
    The AMM is the protocol that all market makers use. It’s the thing
    that allows to set orders and pools.
  </p>
  <p><strong>Difference between linear and percentage progressions</strong></p>
  <p><em>Linear</em></p>
  <p>The linear progression is pretty straightforward to understand</p>
  <p>
    <img
      src="~/assets/images/screenshots/amm-example-1.png"
      alt="Linear progression pictured"
    />
  </p>
  <p><em>Percentage</em></p>
  <p>
    The percentage one is very tied at the beginning but will make your selling
    harder and harder (note that it is exponential). Depending on your
    parameters, your last NFT may never sell. This means that it limits risks and stops buying or selling if things move too fast.
  </p>
  <p>
    <img
      src="~/assets/images/screenshots/amm-example-2.png"
      alt="Percentage progression pictured"
    />
  </p>
  <h2 id="how-to-take-advantage-of-it">How to take advantage of AMMs</h2>
  <p><strong>Put a decent amount of liquidity</strong></p>
  <p>
    First and foremost, to use AMMs, you need a good amount of sols compared to
    the collection floor price. You will provide liquidity and need flexible in and out prices to make it efficient. The more liquidity you put in
    the pool, the wider swings you can follow.
  </p>
  <p>
    The best option is to put at least 10 NFTs. It works with less but you will
    be limited. A number between 10 an 100 is better in terms of flexibility
  </p>
  <p><strong>Decide about your spread (named fees on some platforms)</strong></p>
  <p>
    The more spread you ask, the harder it will be to get your bids and sells
    accepted but the more rewarding it will be. It will require higher
    volatility of the collection to see your orders activated. It’s up to you
    to find the right balance.
  </p>
  <p><strong>Chose a collection you believe in</strong></p>
  <p>
    The thing to get is that the more the floor price goes down, the more NFTs
    you get into the pool. It’s like buying regularly into the collection.
    Oppositely, the more the floor price goes up, the more you sell NFTs. You
    gradually sell your holdings. But in both situation, the pool stay active,
    so things can go back to normal.
  </p>
  <p>
    The only way to not feel bad in case the floor going down is to set it on a
    collection you like. The worst-case scenario will be to have accumulated NFTs
    from this collection.
  </p>
  <p><strong>Set your strategy</strong></p>
  <p><em>Bet on spread fees</em></p>
  <p>
    The logic of AMMs is that you create your pool for the long term. So, the
    most common strategy is to add a large pool that will cover a wide range of
    floor variations. That way, you will be able to collect fees on a regular
    basis. You will see your sols increasing and decreasing significantly. It’s
    up to you to decide when you want to stop. What is beautiful is that if it
    works well, it generates revenue on a regular basis and constitutes a passive
    income.
  </p>
  <p>
    Of course, for this strategy to be efficient, you will have to bet on
    collections with a high volume.
  </p>
  <p><em>Swing trading</em></p>
  <p>
    If the collection evolves by doing up and down in the same range,
    with a high delta parameter, you can choose to automate your swing trading.
    You sell when the floor is high, and you buy when it’s low. The risk there is
    that the floor escapes your swing range. In that case, you will end with lot
    of NFTs of the collections or only sols. You must be ready to both
    situations.
  </p>
  <p><em>DCA into a collection while getting fees</em></p>
  <p>
    If you like a collection and see that it is dumped for wrong reasons, you
    may want to get into it progressively. For that you can set a pool, get
    some m
  </p>
  <p><em>Gradually sell a collection while getting fees</em></p>
  <p>
    If you think that a collection is in phase of accumulation before pumping,
    you can accumulate spread flips during the accumulation phase, and while
    automatically gradual selling.
  </p>
  <p><strong>Chose your parameters</strong></p>
  <p>
    Depending on your strategy and your level of risk, you will choose different
    parameters:
  </p>
  <ul>
    <li>Percentage or linear. Curves are more protective and linear more efficient)</li>
    <li>Spread. A higher spread is more rewarding but will lead to fewer trades</li>
    <li>Delta. A higher delta will be more protective but will lead to fewer trades.</li>
  </ul>
  <p>
    I encourage you to read this
    <a
      href="https://docs.tensor.trade/provide-liquidity/setting-up-your-market-making-order#3-simple-config-templates"
      >page from the Tensor documentation</a
    >. It will give you detailed information about the impact of parameters on
    your strategy.
  </p>
  <p><strong>Collect fees and/or close the pool</strong></p>
  <p>
    Once you are satisfied with your setup, collect the spread fees regularly.  Then close the pool when you’re happy with your current
    state ($SOLs or NFTs collected).
  </p>
  <p>
    If you figure out that you messed up with the parameters or things turned
    wrong (like collection rugging), accept you lost some part of your
    investment and close the pool.
  </p>
  <h2 id="conclusion">Conclusion</h2>
  <p>
    AMMs are powerful to automate your trading. Better, they allow you to
    contribute to the NFT ecosystem by making transactions easier to perform.
    However, they require attention and must be verified regularly to be
    fully efficient.
  </p>
  <p>
    It comes with a new opportunity to collect spread fees on swaps you
    facilitated, adding new possible strategies for your portfolio.
  </p>
  <p>
    By working for you, they are great to scale your trading strategy, but
    still, they require more thinking and preparation before being used. I
    encourage you to experiment with them first before getting too heavy on it
    (you can diversify your pools too, like in any investment).
  </p>
  <p>
    And of course, as usual, invest only money you can afford to lose, they
    don’t guarantee anything against collection falldown.
  </p>
  <p>
    We’re done with this guide! I hope it will help you to set up your AMM
    strategy and build a strong revenue stream. If you enjoy it, please check my
    other guides below and follow me on
    <a href="https://twitter.com/defilogist">Twitter</a>. I share news and tips
    on a regular basis!
  </p>
</template>

<script setup>
const description = 'Explaination about what are AMMs and how to take advantage of them'
const title = 'The Wise Trade | The AMM Trading Guide'
useHead({
  title,
  meta: [
    { name: 'description', content: description },
    { name: 'og:title', content: title },
    { name: 'og:description', content: description },
    { name: 'og:image', content: 'https://thewise.trade/illustrations/amm-trading-guide.png' },
    { name: 'og:type', content: 'website' },
  ]
})
</script>
