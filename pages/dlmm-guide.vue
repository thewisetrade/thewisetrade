<template>
  <div class="text-center">
    <img
      class="m-auto max-w-sm"
      src="~/assets/images/illustrations/dlmms-guide.png"
    />
  </div>

  <h1>Meteora DLMMs guide</h1>

  <p>
    Liquidity is the blood of Decentralized Finance. dApp protocols are mostly
    based on contributions made by people lending their tokens. Because we put
    our digital assets at the disposal of dApps, they can propose financial
    features.
  </p>

  <p>
    Providing liquidity is often rewarded. This incentive allows providers to
    put their holdings to work while limiting risks. The act of providing
    liquidity is now widely spread and part of most portfolios. Especially with
    recent point reward systems that make incentives stronger.
  </p>

  <p>
    That's why it matters to understand the different protocols at disposal. As
    a wise trader, you have to be familiar with these concepts to be able to
    track and balance them well in your portfolio.
  </p>

  <p>
    Each protocol has a different way of managing the funds its community
    brings. In this guide, we will focus on liquidity used by decentralized
    exchanges. They are named liquidity pools. They require you to provide a
    pair of assets (say JUP and SOL). With them the exchange can provide swap
    features to their users. Providers are rewarded with the fees collected
    during the swapping to incentivize them to let their liquidity. This concept
    was originally created by Uniswap and is now the basis of any decentralized
    exchange.
  </p>

  <p>
    To maximize their effect, these pools were improved with the appearance of
    concentrated liquidity pools. This new kind of pools faced several
    limitations. To fix that problem, the Meteora team, who already provided
    pools for exchanges, developed a new kind of pool named Dynamic Liquid
    Market Makers. These pools are designed differently to be even more
    efficient and most of all more playful to deal with.
  </p>

  <p>
    This is the reason behind this guide. Because they are capital-efficient and
    playful, DLMMs can be a great tool to put your portfolio to work. So, I
    wanted to ensure that you know everything to manage them properly. In this
    guide we will first cover first the basics of DEX liquidity providing. Then,
    we will explain to you how DLMMs work and why they do better. Finally, we
    will explore strategies you can set up thanks to DLMMs while contributing to
    the ecosystem.
  </p>

  <h2>1. Trading Pair and Liquidity Pools (pools)</h2>

  <p>
    A liquidity pool is like two buckets where you put an equivalent amount of
    two tokens.
  </p>

  <p>
    Decentralized Exchanges (DEX) rely on these pools to allow you to swap your
    tokens at any time without any order book. They aggregate the liquidity of
    many liquidity providers to constitute huge pools that traders can use to
    swap their tokens. When someone does a trade, the DEX consults an oracle
    (like Pyth Network or Chainlink) to know the market value and then grab the
    amount of tokens required in both buckets.
  </p>

  <p>
    So, if you want to provide liquidity to a pool, let's say you want to set a
    SOL/USDC swapping pair pool, you can start with lending 1 SOL and 150 USDC
    to set it up. Once done, it allows people to swap these two tokens as long
    as they are enough of both in the pool. Your liquidity aggregates with the
    ones set by other, which allows DEXes to do bigger transactions.
  </p>

  <p class="has-text-centered">
    <img
      class="illustration"
      src="~/assets/images/articles/dlmms/liquidity-pool.png"
    />
  </p>

  <h2>2. Liquidity Pairs Farming (LPs)</h2>

  <p>
    When you fund an LP pool, you are rewarded with a percentage of each
    transaction occurring in the pool. What we name farming is the fact to
    collect these fees to augment your holdings.
  </p>

  <p>
    In some way, it allows you to get rewarded for providing your holdings, but
    it comes with the risk of impermanent loss, which may lead you to end with a
    single token from your pair (we'll cover it in detail later).
  </p>

  <p>
    So, if you believe in both tokens of the trading pair you fund, impermanent
    loss is not a problem. Providing liquidity pairs is a great way to grow your
    bag without worrying of market variations. By accumulating fees, you will
    earn a recurring yield on your positions without trading anything.
  </p>

  <h2>3. Impermanent Loss (IL)</h2>

  <p>
    The drawback of providing liquidity is that you will suffer from Impermanent
    loss. It means that when one token gets more value over the other, your pool
    will get rebalanced, and you will accumulate the token with the lowest
    value.
  </p>

  <p>
    If you look at our two buckets, you get that if swapping only operates on
    one side, at some point, one of them is emptied while the other is
    overfilled.
  </p>

  <p>
    If you are confident in both tokens or want to gradually sell your tokens
    with a USDC/something pair, for instance, you won't have to worry much about
    this aspect.
  </p>

  <p>
    Moreover, as long as you don't withdraw your funds, they will rebalance with
    the market. If your sol went down and accumulated many of them, they will be
    sold when the market is up and vice-versa. So, if tokens go both up but in a
    different time frame, you will keep the same proportion of tokens in the
    end. It's the best that can happen because you collected fees while keeping
    the same holdings.
  </p>

  <p>
    Because of Impermanent loss, selecting the right pair is key in LP farming.
    The risk management occurs around IL when farming. That's why you should
    always consider every scenario before setting a new pool.
  </p>

  <img
    class="illustration"
    src="~/assets/images/articles/dlmms/liquidity-pool-il.png"
  />

  <h2>4. Slippage</h2>

  <p>
    When a trading pair is very volatile, if you execute your order, the price
    may change between the time you initiated the trade and the time it is
    executed. That's why DEX propose you to limit it, to avoid bad surprises.
    However, slippage leads to rejected transactions if the limit you set is too
    short.
  </p>

  <p>
    As a user, you prefer to see your order executed instead of being rejected.
    So, DEX always looks to avoid this problem as much as possible. The fewer
    rejected transactions, the better the experience is.
  </p>

  <h2>
    5. LP Efficiency and Concentrated LPs, aka Concentrated Liquidity Market
    Makers (CLMMs)
  </h2>

  <p>
    Aside from ILs, an issue you face when providing LPs is that your capital is
    unused most of the time because it covers the full range of possible trading
    variations. It means that a significant part of what you provided generates
    nothing.
  </p>

  <img
    class="illustration"
    src="~/assets/images/articles/dlmms/dlmm-guide-01.png"
  />

  <p>
    To help with this problem, DEX proposed concentrated LPs, where the fees are
    collected on smaller ranges. It makes the capital more efficient but leads
    to stronger ILs. It requires much more attention and to reset your LPs on a
    regular basis. Initially, LPs covered the full range of trading. It was
    easier to manage, but in that case, a lot of your funding is sleeping, and
    the rewards are pretty low.
  </p>

  <p>
    To tackle this problem, CLMMs allow us to put more capital to work. However,
    it requires more active management. You often face the case where the pair
    price exceeds the range you set. In that case, you must withdraw your LP and
    consider your next pool setup.
  </p>

  <h2>6. Meteora Dynamic Liquidity Market Makers (DLMMs) and What's new</h2>

  <h3>A. less slippage, more fees</h3>

  <p>
    The DLMMs from Meteora arc CLMMs that split the whole pair in smaller bins
    instead of a single bucket where repartition is smooth. That way, you have a
    dedicated amount of capital for each pricing step.
  </p>

  <p>
    DEXes enjoy it because it allows them to make very efficient trading on
    small ranges of pricing and avoid many slippage use case.
  </p>

  <p>
    For traders, it will allow them to always use the right bin and limit
    rejections. The experience is better.
  </p>

  <p>
    For you as a liquidity provider, it means that your capital will grab more
    fees because more transactions will succeed.
  </p>

  <h3>B. Visual representation</h3>

  <p>
    The main benefit of bins is their visual representation. It's easier for you
    to figure out what is happening. The Meteora UI adapts your bin position in
    real-time, which makes things even clearer. It helps you understand what is
    happening and create different strategies.
  </p>

  <h3>C. New strategies</h3>

  <p>
    Thanks to the bins, you can choose where to collect more fees. Before DLMMs,
    you could only set your fee collecting on a specific range. But now you can
    decide the range and the balance of where you collect more fees. We will
    give you later examples of strategies you can set up.
  </p>

  <h2>7. How to deal with DLMMs?</h2>

  <p>
    There is no one way to start with LP farming and DLMMs. I propose there an
    approach to start with them but feel free to adapt it to your style.
  </p>
  <p>
    You can start your DLMM journey with stable pairs. It will be the safest
    pair to understand how DLMMs work. The Impermanent loss has no impact
    because both pairs have almost the same value. So you can make mistakes
    safely.
  </p>

  <p>
    To set your pool, the UI is pretty straightforward. You have to select the
    USDC/USDT pool from the list and create a position by putting an equivalent
    amount of USDC and USDT. Then, Meteora proposes three ways to balance your
    pools:
  </p>

  <ul>
    <li>Spot: every price range is filled with the same amount of tokens</li>
    <li>
      Curved: The price range in the middle is the most filled. You assume there
      that the price will evolve little and that most trades will be
      concentrated.
    </li>
    <li>
      Bid/Ask: you assume the price will go back and forth, and so you prefer to
      put more liquidity in the low and high part of your range.
    </li>
  </ul>

  <p class="text-center">
    <img
      class="illustration"
      src="~/assets/images/articles/dlmms/default-strategies.png"
    />
  </p>

  <p>
    Once you confirm, the pool is created. It takes a moment to process. Then
    the pool is set. From there, you can see in real-time how it evolves. Take
    the time to look at it to understand better how DLMMs work.
  </p>

  <p>
    Once you are comfortable with stable pairs, you can set pairs with the
    tokens you believe in, like SOL/JUP. Both should vary the same way. JUP is
    the main DEX of Solana, so SOL movements will significantly influence its
    variation. Plus, ending with only JUPs or only SOLs is ok. While it's not a
    stable pair, it's still a pretty safe pair.
  </p>

  <p>
    You can open several small positions for a few days with different ranges.
    You can Also, change its configuration over time depending on the market
    condition (it will require withdrawal and deposit again). You will better
    understand how fees are collected and how impermanent loss behaves. Once you
    are more comfortable, you can put in bigger amounts and enjoy your DLMM
    journey.
  </p>

  <img
    class="illustration"
    src="~/assets/images/articles/dlmms/pool-working.gif"
  />

  <h2>8. How to choose the right pool?</h2>

  <p>
    Aside from providing liquidity to the ecosystem, the goal of setting pools
    is to optimize the collection of fees.
  </p>

  <img
    class="illustration"
    src="~/assets/images/articles/dlmms/pool-settings.png"
  />

  <p>
    So, the first thing to check about a pool is the fees collected daily. Once
    you have this information, you can do some maths to get the % of the pool
    you will own after you add funds. Then, you can apply this % to the fees
    collected to know what you could expect.
  </p>
  <p>
    Let's illustrate this and say you add 1 SOL and 150UDSC to a pool containing
    10 SOLs and 1500USDC, it means that every day you will get 10% of all fees
    collected that day by the pool. With DLMMs, it's more subtle because your
    strategy will influence this number. But it will give you a rough idea of
    what to expect.
  </p>

  <p>
    The consequence is that to select a good pool, you should look for a good
    Total Value Locked (TVL) / volume ratio. If the volume is too low compared
    to the TVL, it will mean that this pool catches too few transactions and is
    not efficient. On the other hand, a pool with a low TVL that catches a lot
    of volume will be pretty efficient. But this pool usually operates on a low
    range and gets out of range quickly. There are always pros and cons in
    selecting pools.
  </p>

  <p>
    Meteora provides another indicator named 24-hour Fee/TVL. The higher it is,
    the better. But you do not have to be too greedy. Sometimes, a high 24-hour
    fee means a lot of volatility, and the probability that your pool gets out
    of range is high. A number between 0.4% and 1% is fine. If you are above 1%,
    you can consider that the risk of fast impermanent loss is high. So, you
    will be required to manage your position accordingly.
  </p>

  <p>
    The other indicator to take into account is the bin step. It shows how wide
    the pool bins are. The lower the number is, the more concentration there is.
    The pool with small bin steps will allow a few strategies and will get out
    of range faster. But, of course, they capture more transaction fees within
    their range.
  </p>

  <p>
    Once your pool is set, check regularly the 24-hour fee percentage your pool
    has. If it is too low compared to the pool average, consider changing your
    strategy.
  </p>

  <h3>Fees amount per bin</h3>

  <p>
    To select the fees amount per bin, you have to consider how wide will the
    movements be. The positions with a high percentage won't catch many
    transactions, but if the price movements are big they will be fully used and
    that way gives you a lot of fees and cover you impermanent loss faster.
    But if the range tends to move slowly, it's the opposite. With high fees,
  you will catch very few transactions and potentially miss many opportunities.
    In that case, bin with smaller fees will perform better.
  </p>

  <h3>Covered Range</h3>

  <p>
  All pools can cover any range involving at most 1400 bins. But sometimes,
  it's simpler to stick with the default range. The following table resume the
  range covered by default positions proposed by Meteora:
  </p>

  <table class="w-full my-4">
    <thead>
      <tr>
        <th class="text-left">Bin Step</th>
        <th class="text-left">Single sided lower range</th>
        <th class="text-left">Double sided range</th>
        <th class="text-left">Single sided upper range</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>10</td>
        <td>-6% - 0</td>
        <td>-3.44% - +3.35%</td>
        <td>0 - +7.14%</td>
      </tr>
      <tr>
        <td>20</td>
        <td>-12.88% - 0</td>
        <td>-6.57% - +7.03%</td>
        <td>0 - +14.78%</td>
      </tr>
      <tr>
        <td>50</td>
        <td>-29.12% - 0</td>
        <td>-15.60% - +18.48%</td>
        <td>0 - +41.08%</td>
      </tr>
      <tr>
        <td>80</td>
        <td>-42.29% - 0</td>
        <td>-23.73% - +31.12%</td>
        <td>0 - +72.29%</td>
      </tr>
      <tr>
        <td>100</td>
        <td>-49.67% - 0</td>
        <td>-28.70% - +40.26%</td>
        <td>0 - +98.69%</td>
      </tr>
      <tr>
        <td>125</td>
        <td>-57.56% - 0</td>
        <td>-34.45% - +52.56%</td>
        <td>0 - +135.64%</td>
      </tr>
      <tr>
        <td>200</td>
        <td>-74.50% - 0</td>
        <td>-49%  - +96.07%</td>
        <td>0 - +292.11%</td>
      </tr>
      <tr>
        <td>250</td>
        <td>-81.80% - 0</td>
        <td>-56.81% - +131.53%</td>
        <td>0 - +449.47%</td>
      </tr>
      <tr>
        <td>400</td>
        <td>-93.32% - 0</td>
        <td>-73.64% - +279.43%</td>
        <td>0 - +1397.27%</td>
      </tr>
    </tbody>
  </table>

  <h2>8. DLMMs strategies</h2>

  <h3>A. Very concentrated ranges: stables and pegged tokens</h3>

  <p>
    Pairs like USDC/USDT or Sol/bSOL always operate on the same range. These
    pairs are less rewarding, but there is no problem with IL because both
    tokens share a similar value. So, we can afford to set a very thin range to
    get a maximum of fees. If the price goes out of range, you can close the
    position, swap half of the balance, and open a new position with a new
    range.
  </p>

  <p>
    We'll work on the USDC/USDT pair to illustrate. If you look at the trading
    pair chart in a 3-month range, you will see that the price mostly evolves
    between 0.999 and 1.001. The bar on the left shows the volume that occurs
    for each pricing range.
  </p>

  <img
    class="illustration mb-5"
    src="~/assets/images/articles/dlmms/stable-volume.png"
  />

  <p>
    The goal here is to set the pair bins that the pool will use to swap tokens.
    Because you want your bins to be used fully, you will set bins only for a
    range that matches the price where the trading volume occurs.
  </p>

  <p>
    That way, your pool will almost always work at high capacity. If you are
    ready to reset your position frequently, you can focus even more by using
    only 2 to 4 bins. It will require more work on your side (once you get out
    of range, you must withdraw and swap half of your tokens to set a new pool
    again), but the fees are collected much faster in that case (I observed a 2x
    ratio between a 4 bin DLMM and 12 bins DLMM).
  </p>

  <p>
    Another option is to use more bins but fill them with the curve strategy
    proposed by Meteora.
  </p>

  <img
    class="illustration mb-5"
    src="~/assets/images/articles/dlmms/stable-bins.png"
  />

  <h3>B. Similar tokens</h3>

  <p>
    Most of the time, the best option is to set a pool of two tokens you're
    confident with, like tokens operating in the same area or tokens correlated
    to the SOL success. For instance, the JUP price is somehow linked to the
    evolution of SOL. If you believe in Solana and its ecosystem, ending with
    only SOLs or JUPs is fine. So, it's okay to set up a JUP/SOL pair.
  </p>

  <p>
    In that case, you are going to set a range that is wide enough to make you
    look at the LP only once a day. We'll use the spot strategy. The price can
    still be volatile and do some swinging. It's a bit hard to predict that's
    why we prefer the spot strategy. But if you feel like the pair has a
    tendency to be stable, use a curve strategy.
  </p>

  <img
    class="illustration mb-5"
    src="~/assets/images/articles/dlmms/similar-pair.png"
  />

  <img
    class="illustration mb-5"
    src="~/assets/images/articles/dlmms/similar-pair-curve.png"
  />

  <h3>C. Selling Limit</h3>

  <p>
    Here, we will deal with tokens that have much more volatility. We assume
    that a token A will see its price rising significantly compared to another
    token B. We want to sell it for double its current price. But we are ready
    to accumulate more if things go the opposite way.
  </p>

  <p>
    For that, we set up an ask/bid curve, and we extended the price range on the
    token A selling side and shortened it on the token A buying side (= token B
    selling side). Note that you can soften the process by using a spot
    strategy. That way, we obtain a curve that swaps heavily if we go on the
    unexpected side and that swaps a little in the opposite way until the token
    price reaches the expected limit, where we make things more intense.
  </p>

  <p>
    Let's see how it looks for JUP/Gecko pool, where we want to sell our Gecko
    at approximately x2. Here, we set an ask/bid strategy and expanded the left
    side of the pool while extending the right side:
  </p>

  <img
    class="illustration"
    src="~/assets/images/articles/dlmms/selling-limit.png"
  />

  <h3>D. Swinging pairs</h3>

  <p>
    It's common that for a few days, a token pair swings a lot. If you identify
    a pair swinging heavily in a given range, it's the opportunity to use the
    ask/bid strategy proposed by Meteora. See below a WEN/SOL pair swinging
    heavily.
  </p>

  <img
    class="illustration"
    src="~/assets/images/articles/dlmms/swinging-pair.png"
  />

  <p>
    To deal with it, you can simply use the ask/bid option proposed by Meteora.
    But if you feel like it's too light in the average range, you can combine a
    spot strategy with half of your tokens with an ask/bid strategy on top of
    it, with the rest of your tokens (you can add tokens on an existing position
    with a different strategy).
  </p>

  <img class="illustration" src="~/assets/images/articles/dlmms/ask-bid.png" />

  <h3>E. Acquiring a new token: one-sided pool</h3>

  <p>
    DLMMs offer you a new elegant way to acquire a token. You can set a
    one-sided pool, a pair filled with only one token. That way, you can set an
    entry price range where you can start to exchange your tokens for other
    tokens.
  </p>

  <p>
    Let's say you want to buy SOLs only when it reaches $140 and then gradually
    buy it until $130. You can set up a SOL/USDC pool that will fill bins with
    USDC only between $140 and $130. That way you will be able to gradually buy
    SOLs and capture fees at the same time.
  </p>

  <p>
    Let's take another example and have a look at buying some POPCATs with SOLs.
    Here we see that gradually enter the token via a simple bid-ask option by
    putting only SOLs into the pool:
  </p>

  <img
    class="illustration mb-5"
    src="~/assets/images/articles/dlmms/single-sided.png"
  />

  <h2>Conclusion</h2>

  <p>
    DLMMs is a new opportunity to put a portfolio at work while having fun. It
    requires to be active to be fully efficient. But, it can be pretty rewarding
    and it helps the ecosystem to thrive. If you set them well, you create a
    win-win situation for you, for the token project, and for Decentralized
    Exchanges. Therefore, I encourage you to dig into them and play with them.
  </p>

  <p>
    Last but not least, Meteora has a vibrant community of farmers. I recommend
    you join their Discord to have even more fun.
  </p>

  <p>
    Sidenote: If you want to avoid managing them, Kamino offers products that
    will do the work for you. On my side, I prefer dealing with them directly,
    but I understand if you want to set it and forget it.
  </p>

  <h2>Resources</h2>

  <h3>Tools</h3>

  <ul>
    <li>
      <a target="_blank" href="https://met-aleksrgs-projects.vercel.app/">
        DLMM utilities: fees count, transaction P&L, active pools, pool search
        (Metlex)
      </a>
    </li>
    <li>
      <a
        target="_blank"
        href="https://geeklad.github.io/meteora-profit-analysis/"
        >DLMM P&L analysis (Geeklad)</a
      >
    </li>
    <li>
      <a target="_blank" href="https://dashboard.isc.money/meteora_dlmm_ui"
        >DLMM P&L and fees listing (ISC)</a
      >
    </li>
    <li>
      <a target="_blank" href="https://lp4fun.vercel.app/">DLMM portfolio</a>
    </li>
    <li>
      <a
        target="_blank"
        href="https://docs.google.com/spreadsheets/d/1RIlAb-eilVWUVzruDUWR7Sidt8LI-GB1VIBhiKC_ccI/edit#gid=1434356868"
        >Impermanent Loss Calculator</a
      >
    </li>
    <li>
      <a
        target="_blank"
        href="https://docs.google.com/spreadsheets/d/1uMj43pCdVwhDKEswCTbe47LfbmI0CRlmFisDtWaFFyc/edit#gid=1950288549"
        >Highly active pairs from the last 24 hours (Spreadsheet)</a
      >
    </li>
  </ul>

  <h3>Resources</h3>

  <ul>
    <li>
      <a
        target="_blank"
        href="https://youtube.com/@meteora163?si=MP_dS0kinQosCehA"
        >Meteora Youtube Playlist: Bootcamps and JAM sessions</a
      >
    </li>
    <li>
      <a
        href="https://discord.com/channels/841152225564950528/854683268519559189/1234769289156890654"
      >
        Helpful Discord message
      </a>
    </li>
    <li>
      <a
        target="_blank"
        href="https://drive.google.com/file/d/1FrMuyN0ePTiwcC3G9RJVBgaT7e1EE_Yb/view?usp=sharing"
      >
        Meteora Bootcamp Slides (old version)
      </a>
    </li>
  </ul>
  <p>&nbsp;</p>

  <hr />

  <h1>Additional Tips</h1>

  <p>
    <em>
      This part goes beyond the general theory. I share what I do and what was
      profitable to me to help you with your DLMMs setup. There is no scientific
      approach behind this. It's a simple return on experience.
    </em>
  </p>

  <h2>Stable pairs</h2>

  <ul>
    <li>
      The key is to experiment with many combinations and find the one that fits
      with you.
    </li>
    <li>
      You have to look for concentrated positions. But the more concentrated,
      the more you need to rebalance.
    </li>
    <li>
      For USDC-USDT, my favorite position is to use 2 bins from 4 bin-step pool.
      No need to swap on Jupiter, Meteora will balance the pool for you.
    </li>
    <li>
      For Sol pairs, you can use a short range too. But, because of the nature
      of LST tokens, your pair will turn fully into Sols at some point. So, the
      shorter the range, the sooner you will have to rebalance.
    </li>
    <li>Because you use short range, the spot strategy is better.</li>
    <li>Duration: you can keep this setup forever.</li>
  </ul>

  <h2>Strong SOL Pairs</h2>

  <ul>
    <li>The goal is to keep the pool in range as much as possible.</li>
    <li>Use a wide range by using large bin-steps.</li>
    <li>
      The curve strategy works better because we can guess that the strong token
      of the Solana ecosystem (JUP, Jito, KMNO) will follow the SOL variations.
    </li>
    <li>
      When a pair has a lot of volume, you can open several concentrated
      positions that overlaps slightly each other.
    </li>
    <li>Duration: months (set goals based on fees, duration or token gains)</li>
    <li>
      It implies trading strategy, impermanent loss can lead to lose some funds.
    </li>
  </ul>

  <h2>Buying or selling a token</h2>

  <ul>
    <li>Sometimes it's simpler to buy a token via a DLMM pool.</li>
    <li>You avoid fees and slippage.</li>
    <li>You grab a few fees.</li>
    <li>When the chain is overloaded it tends to work better.</li>
    <li>
      The buying may fail due to the price never reaching the range you set.
    </li>
    <li>
      To achieve that you create a position with very few bins with a spot or
      bid ask strategy.
    </li>
    <li>It works in both ways: buying and selling.</li>
    <li>
      If you want to do a progressive DCA, you can use more bins or wider bins.
    </li>
  </ul>

  <h2>SOL - Meme pairs</h2>

  <ul>
    <li>
      These pairs are much more risky. Bet only with a small percentage of your
      portfolio.
    </li>
    <li>Identify strong meme coins with a good trading volumes.</li>
    <li>
      When the SOL market is in a good shape, open 3 or 4 double-sided
      positions. Some of them will go wrong, opening several positions at the
      same time will mitigate risks.
    </li>
    <li>To limit risks even more, you can open a single-sided pool.</li>
    <li>
      Let the position evolves, grab fees and sell them immediately against SOL
      or USDC.
    </li>
    <li>
      If the position gets significantly in the upper range, close it and sell
      the remaining meme tokens. You are already in profit, so take advantage of
      it.
    </li>
    <li>
      If the position gets outside of the lower range, it's wiser to sell
      everything to mitigate impermanent loss.
    </li>
    <li>Duration: 2 hours to a few days</li>
    <li>
      It implies high risk trading strategy, impermanent loss can lead to lose
      funds.
    </li>
  </ul>

  <h2>New Token pairs</h2>

  <ul>
    <li>
      These token pools are very risky and can lead to the loss of all your
      funds.
    </li>
    <li>Use only small capital amount.</li>
    <li>Stay in front of your computer during the process.</li>
    <li>
      Join a DLMM community like the LP Army and trade with them.
    </li>
    <li>
      These tokens can rug at any time, in that case, your funds are lost. This
      is why the risk is very high.
    </li>
    <li>Use only single-sided SOL pool</li>
    <li>Wide bins are fine (like 250 or 400).</li>
    <li>Use only pools with 2% or 5% fees.</li>
    <li>Only 1 or 2 tokens a day are worth LPing.</li>
    <li>
      After a significant pump in the price action, open your pool. Then wait
      for a dip and its recovering. Close the pool, sell the fees and wait for
      new tokens.
    </li>
    <li>If you decide to keep the pool open, sell fees regularly.</li>
    <li>
      If it dips outside of your range but you feel like it can recover, close
      the pool and open a new pool with a bid ask strategy to sell your tokens
      at decent price when it will recover.
    </li>
    <li>
      But most of the time if the pool goes outside your lower range, take your
      loss: close the pool and sell your tokens.
    </li>
    <li>
      If you get 20 to 30% of your investment, it's already a great session stop
      there.
    </li>
    <li>Duration: 10 minutes to a few hours.</li>
  </ul>

  <hr />

  <h2>Bonus chapter: Communities</h2>

  <p>
    Managing proper positions can be tedious. That's why I recommend you to join
    the following communities to get help and tips from other users:
  </p>

  <ul>
    <li>
      <a href="https://discord.com/invite/meteora">The Meteora Community</a>
    </li>
    <li>
      <a href="https://www.lparmy.com/">LP Army (Community for advanced users)</a>
    </li>
  </ul>
</template>

<script setup>
const description =
  'The ultimate guide to start with Meteora DLMMs, from theory to practice'
useHead({
  title: 'The Wise Trade | DLMM Guide',
  meta: [
    { name: 'title', content: 'The Wise Trade | DLMM Guide' },
    { name: 'description', content: description },
    { name: 'og:description', content: description },
    {
      name: 'og:image',
      content: 'https://thewise.trade/_nuxt/dlmms-guide.3dfb1c89.png',
    },
    { name: 'og:type', content: 'Website' },
  ],
})
</script>

<style scoped>
img.illustration {
  border-radius: 0.5em;
  border: 1px solid #ccbbbb;
  box-shadow: 0px 2px 6px rgba(20, 0, 0, 0.2);
  margin: auto;
  margin-bottom: 1em;
}

h3 {
  margin-top: 4em;
  text-decoration: underline;
}

a {
  text-decoration: underline;
}
</style>
