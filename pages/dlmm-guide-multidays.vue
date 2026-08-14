<template>
  <div class="text-center">
    <img
      class="m-auto max-w-sm"
      src="~/assets/images/illustrations/dlmms-multiday-positions.svg"
    />
  </div>

  <div class="content-container">
    <h1>DLMMs - Multiday Positions</h1>

    <div class="note">
      <h3>Disclaimer</h3>

      <p>
        This guide was written by linclonlogging, an active DLMMer on Meteora.
        He has a unique approach to DLMMing that demonstrated strong returns.
        That's why I think it's worth sharing. He gently allowed me to publish
        his guide on The Wise Trade. But you have to keep in mind that it comes
        from his own experiments and discussions. There is no guarantee that it
        will work for you and he is not responsible for your losses.
      </p>
    </div>

    <h1>DLMM and Chill: A guide to low stress, profitable LPing</h1>

    <p>
      Everyone hates losing money. Memecoins can be some of the most volatile
      assets in the world, so market making them is a constant game of balance
      between greed and fear. I hated watching shitcoins drop 30% in a minute
      and watching my position tank in value. I waited for the bounce… another
      20% down.
    </p>

    <p>
      Wanting to escape the acute stress, I tried opening my positions wider,
      giving the token more room to fall before I start to worry. This method
      lets you leave the position open for longer, lets you step away from the
      computer. You start to leave it on while you sleep. You start to leave it
      on for days.
    </p>

    <p>
      I have made considerably more money running a conservative strategy than I
      did chasing tight ranges and fresh shitcoins 30 minutes out of migration.
      I'd like to help you do the same.
    </p>

    <h3>The "Bread 'n Butter"</h3>

    <p>
      One strategy is the -74% down single sided sol spot position. This is an
      example of what the position looks like when adding liquidity. There are a
      few reasons I believe this works so well.
    </p>

    <p class="has-text-centered">
      <img
        class="illustration small"
        src="~/assets/images/articles/dlmms/multiday-1.png"
      />
    </p>

    <p>
      First, the wide range. Creating a wide range serves two purposes: to
      reduce loss and to allow continuous fee earning. You can set this range
      and step away for several hours without worrying about the token falling
      and pushing you out of range.
    </p>

    <p>
      This range also reduces your losses from the token falling because you
      acquire more tokens at lower prices. I don't like saying impermanent loss,
      I think it downplays the severity of this affliction. You accumulate
      capital losses when the token falls and you aren't hedging that risk away
      with a short position.
    </p>

    <p>
      Ranges that are -30% or -40% down will cause you to acquire your tokens at
      higher prices because you have more sol in those higher bins, assuming you
      are depositing the same in either case. This higher cost basis means you
      accumulate more loss as it trends down.
    </p>

    <h4>Considerations:</h4>
    <ul>
      <li>
        You can easily make small adjustments here. I personally will throw the
        range down a bit more if I am nervous, into the 76-80% area.
      </li>
      <li>
        I also may bring it in a bit, towards 65-70% if I am confident or want
        to avoid a bin array fee.
      </li>
      <li>
        The picture above involves a 100 binstep pool. I prefer to use 80, 100,
        and 125 binsteps over any other.
      </li>
      <li>
        In my experience the lower binstep allows more precise tracking of the
        market price for the token, allowing you to gather a bit more in fees
        compared to a larger bin step.
      </li>
    </ul>

    <p>This makes two positions, which will give you two rent fees:</p>

    <img
      class="illustration"
      src="~/assets/images/articles/dlmms/multiday-1b.png"
    />

    <p>
      I primarily target 2% and 5% pools, occasionally 1% pools. I've found
      smaller fees force you to concentrate to make any money, which I have not
      experimented with. If you do this let us know how it goes!
    </p>

    <h3>Single Sided Positions</h3>

    <p>
      Single sided is key. When creating two sided positions you immediately
      turn half (or less/more) of your liquidity into the token. This gives you
      a hefty price exposure to the memecoin. If the token falls 50%, you
      already are experiencing a 25% loss on the tokens before accounting for
      the position's IL. My portfolio was sideways for a month as I tried to run
      50/50 positions, however when I turned to single sided it started for the
      upside.
    </p>

    <p>
      By going single sided, you completely eliminate that upfront risk,
      allowing you to isolate your exposure more to the LP rather than
      speculation. Many, many LPers recommend single sided positions, and I do
      too. The downside here is that you take away some of the upside potential.
      It's critical that I said some, as you still can make money on a moon.
    </p>

    <p>
      If the token dips into your position for a few hours, you accumulate fees
      in the token and sol. If it then pumps 400%, your fees have now
      appreciated greatly, and your IL disappears. I have had positions where
      the token dropped 60%, I made a shit ton of token fees, then it rallies up
      to double where my position's top range was, bagging me a 100% return in a
      day. This is paltry compared to what some other LPers can get, but its
      significant when you consider that this strategy will massively reduce
      your losses on most tokens you LP. You will likely make money on most of
      the tokens you LP with the Bread'n Butter. How do I know?
    </p>

    <img
      class="illustration"
      src="~/assets/images/articles/dlmms/multiday-2.png"
    />

    <p>
      This is out of over 1,000 positions, and hundreds of individual tokens.
    </p>

    <div class="note">
      <h3>EDIT</h3>
      <p>
        The market has deteriorated since I wrote this section. I recommend
        trying the sawtooth bid ask and the regular bid ask below before
        employing this spot strategy. If the market is good and coins are
        generally staying flat or going up, this will make you more fees. On the
        other hand, it will hurt more if coins are going down.
      </p>
    </div>

    <h3>The Bid Ask (200-400 binstep)</h3>

    <p>
      Bid ask positions are more complicated than the spot positions. They
      entail concentrating your liquidity at the bottom of the range, allowing
      you to pick up more fees and tokens at a lower price. This pretty
      drastically reduces IL, as your exposure for the first half of the
      position is relatively small.
    </p>

    <p>
      I use bid asks when I don't trust the token enough to acquire it at higher
      prices, when I am nervous about it. You start by adding most of your
      liquidity as a bid ask 80% down, 69 bins (250 binstep).
    </p>

    <img
      class="illustration"
      src="~/assets/images/articles/dlmms/multiday-3.png"
    />

    <p>
      Then, I like to add a bit of extra liquidity into those first few bins, so
      I make some fees if the token dips a little and pumps out, or doesn't fall
      very far over the next few hours.
    </p>

    <img
      class="illustration"
      src="~/assets/images/articles/dlmms/multiday-4.png"
    />

    <p>
      I currently do 87.5% of the position as a bid ask, then the remaining
      12.5% as a curve. You can do this by opening up the position you just made
      and adding some more as a curve on top of the bid ask.
    </p>

    <img
      class="illustration"
      src="~/assets/images/articles/dlmms/multiday-5.png"
    />

    <h4>Considerations:</h4>
    <ul>
      <li>
        As before, adjustments are encouraged. Tinker with the range and curve
        ratio to find what you like the most.
      </li>
      <li>
        Be careful opening bid asks over 2 positions. There is currently a bug
        in meteora that will show you a smooth curve over the 2 or more
        positions, but when it creates the positions it ends up as a sawtooth
        pattern.
      </li>
      <li>
        This is because the second position is created starting from 0, not from
        the last bin of your first position. You won't have a smooth curve, but
        that's not really a bad thing.
      </li>
      <li>You can use this to create a sawtooth bid ask.</li>
    </ul>

    <h3>The Sawtooth Bid Ask (80-125 binstep pools)</h3>

    <p>
      This has been my new main strategy for the last few weeks. It's simple to
      set up, just add bid ask liquidity over 2 positions (138 bins), with the
      bottom range at -74% (for a 100 binstep pool).
    </p>

    <p class="has-text-centered">
      <img
        class="illustration small"
        src="~/assets/images/articles/dlmms/multiday-sawtooth.png"
      />
    </p>

    <p>
      This will create a sawtooth bid ask, as the second 69 bins will start from
      0 rather than where the last bin of the first 69 bins left off. This is
      useful for reducing risk, as with a bid ask you already buy most tokens at
      a lower price, but with the sawtooth you are buying even more of your
      tokens at a lower price.
    </p>

    <h4>There are three main ways this may go:</h4>
    <ul>
      <li>
        The token falls a little, maybe all the way through the first position.
        You make fees on the first part of your liquidity, but most is
        untouched. This will make a small amount of fees with very little IL.
      </li>
      <li>
        The token falls a lot, maybe near the end of the second position. You
        pull in a large amount of fees and accumulate cheap tokens. If you are
        confident for a rebound, consider flipping the bid ask and selling the
        tokens you have accumulated at a higher price. This would lock in
        capital gains and let your fees appreciate too.
      </li>
      <li>
        The token moves up. You may get a little in fees if it dipped into your
        range, or you may make nothing. The key here is that you didn't lose
        anything. Tight two sided positions will benefit greatly from a price
        increase, but they will eat shit and die from a price dump. If the price
        dumps, which it usually does, you will be far better off employing this
        strategy.
      </li>
    </ul>

    <h3>The 20/.2 "ewan" strategy</h3>

    <p>
      Popularized by itsewan in the goosedao, this strategy focuses on LPing
      medium to large cap tokens with low fee pools. The alpha here is that
      raydium charges 0.25% on each swap, while this pool would only charge
      0.2%.
    </p>

    <p>
      This means that the meteora pool will be preferred against the raydium
      pool, stealing its organic swaps when there is sufficient tvl. This,
      combined with arb trades and sandwich bots, produces a great amount of
      volume, for which you take 0.2% of each swap.
    </p>

    <p>
      In order for these pools to print they need consistent volume, with no
      more than 1 empty candle at a time. You ideally want multiple swaps every
      minute, with those having good size. Recently UFD has been the holy grail
      of this strategy: ranging from 60-200M MC the volatility is there, and the
      swaps are too.
    </p>

    <p>
      The main way we employ this in the goosedao is with spot liquidity spread
      over 1-4 positions. You can concentrate more if you believe the token may
      stay within a price range for some time, or you may spread it out to
      reduce risk and keep the position on longer without maintenance.
    </p>

    <p>I prefer 3-4 positions, which makes the bottom either -33% or -42%.</p>

    <p>
      Some gooses like to start with 1 or 2 positions, and add more as the price
      drops. This allows them to be more dynamic and concentrated, as they can
      change their liquidity distribution on the fly and help maximize fees by
      keeping most liquidity around the price, with lesser amounts on each side
      to catch outlier moves.
    </p>

    <img
      class="illustration"
      src="~/assets/images/articles/dlmms/multiday-7.png"
    />

    <p>
      Creating a 20/.2 position may look like this (20 binstep pool, 0.2% fee).
    </p>

    <p>
      I personally use more size in these compared to my positions on degen
      shitters, about 3-4x as much. These tend to stay within range due to the
      tokens being a higher MC, and will print tons of fees.
    </p>

    <p>
      The market cap we have been using has included as low as 30M and as high
      as 1.2B. It really just depends on the volatility of the token and how
      much we trust it. PNET was a rug that many gooses lost money on, while UFD
      and Griffain have printed so much alone that any loss in PNET could be
      recovered. Try pooling multiple tokens with 20/.2s to reduce the risk of
      any single position rugging. These also tend to do well with sol
      volatility, such as a price dump. Be prepared though, volume will increase
      but you will often see these tokens go down with sol. I recommend having a
      solana short to hedge off some of this risk, something I do myself.
    </p>

    <p>
      You need to chill to run this strat. If you constantly try to manage you
      will probably end up realizing a lot of IL unnecessarily. I have found the
      best way to run this is to let it make fees and add liquidity if it moves
      out of the bottom. However, you have to know when to cut the loss. This
      will not always work, please don't ride a token to zero.
    </p>

    <h3>Managing Positions</h3>

    <p>
      My management style is very simple. I claim my fees regularly 3 times per
      day: When I wake up, at a halfway point (4PM my time), and when I go to
      sleep. I also claim them whenever a significant amount piles up, such as
      if I get 5% of my TVL in fees in a short amount of time.
    </p>

    <p>
      I sell my token fees straight to sol. I do not compound. I enjoy bagging
      the fees to cover if the token rugs, rather than chasing more income. I
      encourage you to try compounding if you are willing to chase the higher
      profit potential.
    </p>

    <h4>Advanced Management:</h4>
    <ul>
      <li>
        I sometimes "roll positions". If I have 2 positions open, such as the
        bread 'n butter, and the token moves out of both, I will withdraw and
        close the top/first position and sell to sol.
      </li>
      <li>
        Then, add a new position below the position still open for another 69
        bins. I add half of my starting liquidity to this new position.
      </li>
      <li>
        Keep the sol you got from the tokens you withdrew for other positions.
        This has given you another 69 bins of liquidity in case the token
        continues to fall, but still maintains some of your exposure to the
        token.
      </li>
      <li>
        You can remove liquidity from the top bins of positions and sell if you
        want to reallocate that capital or reduce risk. With the new update,
        that is easy to do: Click show bins in the withdraw screen and select
        some bins to take out.
      </li>

      <img
        class="illustration"
        src="~/assets/images/articles/dlmms/multiday-8.png"
      />

      <li>
        Also consider doing the toothpaste strategy. At around the halfway point
        in your bid ask position, withdraw the tokens only. Then, add them back
        as a spot position. This allows you to sell the tokens you bought for
        generally lower prices for higher prices, giving you a capital gain on
        the curve itself.
      </li>

      <li>
        You can also withdraw only some of the tokens from those bins using the
        % buttons or by typing a %.
      </li>
    </ul>

    <img
      class="illustration"
      src="~/assets/images/articles/dlmms/multiday-9.png"
    />

    <h2>How to not get rekt: Token Selection</h2>

    <p>
      Choosing which coins to DLMM is arguably more important than the strategy
      you use within the pool. I have a set of criteria I use to determine what
      to LP:
    </p>

    <ul>
      <li>At least $2M MC</li>
      <li>Migration at least 6 hours ago - prefer 8 or more</li>
      <li>Regular swaps in the pool: no more than ~20 minutes between</li>
      <li>
        At least $2k volume moving average on 1 minute candles - prefer $4k
      </li>
    </ul>

    <p>
      The market cap is very important. Shitter tokens in the hundred thousands
      tend to be more unpredictable and have less traders on them. Big holders
      may feel momentum has stalled and jeet, leaving you burned. I open no less
      than $2M tokens, I prefer around $8M.
    </p>

    <p>
      Migration time may be my most important consideration. I avoid anything
      under 6 hours. Migration is when tokens move from Moonshot or Pumpfun into
      Meteora or Raydium, respectively. I screen this using dextools (you can
      find this linked on any met pool on the left sidebar) In this instance,
      the migration pool is that top one, with the most liquidity and the oldest
      age. By avoiding early tokens you filter out the garbage that rugs within
      the first few hours, giving you tokens that have at least urvived the
      scrutiny of the initial traders and that don't have completely paperhanded
      top holders.
    </p>

    <img
      class="illustration"
      src="~/assets/images/articles/dlmms/multiday-10.png"
    />

    <p>
      Regular swaps are important, as they directly make you money. Pools that
      only swap once or twice an hour will make very little compared to pools
      that swap every 2 or 3 minutes. In general, the higher the fee the lower
      the swap frequency.
    </p>

    <p>
      I've found that for 2% pools I like to see swaps at least every 10
      minutes, and for 5% at least every 20 minutes. Look at this in the met
      pool chart. This token has pretty regular activity:
    </p>

    <div class="chart-example">
      <img
        class="illustration"
        src="~/assets/images/articles/dlmms/multiday-11.png"
      />

      <p>
        Swaps are very common, with flat candles not being over represented.
        This comes from a 5% pool, which is actually pretty good for the fee
        rate. This is the same token on the 2% pool:
      </p>
    </div>

    <div class="chart-example">
      <img
        class="illustration"
        src="~/assets/images/articles/dlmms/multiday-12.png"
      />

      <p>
        Almost no flat candles, very very active. This will print you amazing
        fees. Compare that to this:
      </p>
    </div>

    <div class="chart-example">
      <img
        class="illustration"
        src="~/assets/images/articles/dlmms/multiday-13.png"
      />
      <p>
        This is another 2% pool on a much more inactive token. This will make
        you very little.
      </p>
    </div>

    <p>
      You should focus on finding pools that print consistently like the first
      two pictures above, and when they slow down like the third, consider
      dropping them.
    </p>

    <h3>Pool Screening Tools</h3>

    <p>
      I Use DLMM Min Fees Opportunities and DLMM Multiday Opportunities to
      screen pools. The main metric I use is the newly added Lincoln score by
      Foxtrot. This averages the swaps/min over 1 hour, 6 hours, and 24 hours,
      then multiplies by the fee rate. This should show you the pools that are
      the most active, like the first two images above, while accounting for the
      fee rate. If you LP the pools with the highest score here you should be
      getting a solid amount of fees.
    </p>

    <h4>Lincoln Score Guidelines</h4>
    <p>
      You should tailor what lincoln score you expect based on the market
      environment:
    </p>
    <ul>
      <li>
        Sometimes you will get 10 pools with solid scores in the 4-10% range
      </li>
      <li>Other times you will get 5 pools in the 1-3% range</li>
      <li>Minimum recommended score: 1.5% to open a pool</li>
      <li>Aim for: 3% or more</li>
      <li>Close pools if they drop below 1% (no question)</li>
      <li>Consider closing positions in the 1.5% range</li>
    </ul>

    <p>
      This metric accounts for the fee rate in the calculation, so lower fee
      pools that are rated highly will have lots of swaps which makes up for the
      lower fee. If you get two pools with similar ratings at different fees,
      you should decide if you want potentially more precise tracking and
      activity, or more downside protection. A 1% pool may better track the
      price and give you more swaps from tight volatility, while a 5% pool will
      be much more favorable if the token dumps quickly.
    </p>

    <h3>Volume Analysis</h3>

    <p>
      I also look at the raw volume, where I use a moving average on 1 minute
      candles. On tradingview plugins, such as in dextools, you can enable it by
      clicking on the dots next to the volume, settings, and clicking on the
      moving average.
    </p>

    <h4>Moving Average Settings</h4>
    <ul>
      <li>MA length: 20</li>
      <li>Smoothing Line: "SMA"</li>
      <li>Smoothing Length: 9</li>
    </ul>

    <p>
      Check the volume on the biggest pool, usually the raydium migration pool.
      You can also do a sum of pools like offered by birdeye.
    </p>

    <div class="chart-example">
      <img
        class="illustration"
        src="~/assets/images/articles/dlmms/multiday-14.png"
      />
      <p>
        This token here has strong volume, with the moving average at the
        mountain at the end being $60K.
      </p>
    </div>

    <div class="chart-example">
      <img
        class="illustration"
        src="~/assets/images/articles/dlmms/multiday-15.png"
      />
      <p>
        This token doesn't, the moving average is around $2k at max, the average
        being around 500.
      </p>

      <img
        class="illustration"
        src="~/assets/images/articles/dlmms/multiday-16.png"
      />
    </div>

    <p>
      Aim for that first token, you will see more price movement and volatility,
      so more swaps in your pool and more fees.
    </p>

    <h3>Other Considerations</h3>
    <ul>
      <li>
        <strong>Market Awareness:</strong> Sometimes there will be 6-12 good
        tokens to make positions for, other times there may be only 1 or 2.
        Adjust your expectations to this market. If the market is good, raise
        your requirements and rake in the profits.
      </li>
      <li>
        <strong>Avoid Tops:</strong> I try to not LP tokens if they run up
        exponentially without any sign of stopping. I've found the risk of a
        sudden and violent dump to be too much for me. By all means, enter these
        and pull in the fees if you can stomach that risk.
      </li>
      <li>
        <strong>Avoid Botted Pools:</strong> I tend to stay away from tokens
        with volume bots, which can be easily seen where the volume will be very
        rectangular, with basically a floor that is never passed. I find these
        tokens may dump violently when the devs turn off the bot and sell their
        bags.
      </li>
    </ul>

    <div class="chart-example">
      <img
        class="illustration"
        src="~/assets/images/articles/dlmms/multiday-17.png"
      />
      <p>This is a botted pool's volume.</p>
    </div>

    <div class="chart-example">
      <img
        class="illustration"
        src="~/assets/images/articles/dlmms/multiday-18.png"
      />
      <p>
        Notice how the price here dumped quickly once the bot was turned off.
      </p>
    </div>

    <p>
      Also consider Metlex's dlmm100 and magical tools for pool screening.
      Foxtrot has other sheets for pools you can find here
      <a href="https://linktr.ee/dlmmbyfoxy" target="_blank"
        >DLMM Opportunities | Linktree</a
      >
    </p>

    <h2>How to not get rekt: Portfolio Management</h2>

    <p>
      It is critical to reduce the volatility of your portfolio as a whole to
      avoid being completely burned. I currently allocate around 2% of my wallet
      to each position. If you want to be more aggressive, aim for 3%-8%. More
      conservative could be 0.25%-2%.
    </p>

    <p>
      I prefer to run many positions at once. In the range of 10-40. This
      reduces my risk massively, as any loss can be absorbed by the other
      positions printing. This allows me to come out with a profit on the day
      something like 90% of the time. You shouldn't feel stressed or worried
      about your overall performance.
    </p>

    <p>
      I like to keep my positions each open in a tab on my computer, grouped by
      their status.
    </p>

    <img
      class="illustration"
      src="~/assets/images/articles/dlmms/multiday-19.png"
    />
    <p>
      I put safe positions that are less volatile in Chill, I often have had
      these open for a day or two.
    </p>

    <h3>Position Grouping</h3>
    <ul>
      <li>
        <strong>Chill:</strong> Safe positions that are less volatile, often
        open for a day or two.
      </li>
      <li>
        <strong>Danger:</strong> Positions at risk of going out of range (to the
        bottom) or other volatile positions.
      </li>
      <li>
        <strong>Fresh:</strong> Positions opened that day or extremely dangerous
        positions, monitored the most.
      </li>
    </ul>

    <h3>Tracking Performance</h3>

    <p>
      To keep track of your wallet’s performance use
      <a
        href="https://geeklad.github.io/meteora-profit-analysis/"
        target="_blank"
        >Meteora DLMM Profit Analysis v3.0</a
      >.
    </p>

    <p>
      To see your open positions’ precise performance use
      <a href="https://lp4fun.vercel.app/" target="_blank">DLMM live data</a>
    </p>

    <p>
      I use Asset Dash to track my overall wallet on web and on my phone:
      <a
        href="https://apps.apple.com/us/app/assetdash-portfolio-tracker/id1541886930?mt=8"
        target="_blank"
        >Referral Link</a
      >
    </p>

    <p>Also use my code: HNWA-HOGX for some bonuses for me and yourself.</p>

    <h2>Closing</h2>

    <p>
      That's just about everything I can think of to include here. My hope is
      that you can all learn something from what I have developed over the last
      3 months of DLMMing. If you start to turn a profit using these tips, let
      us know in the Meteora discord! I would love to see real results from
      other people employing my low stress method. Good Luck!
    </p>

    <hr class="mt-8" />

    <div class="author-info mt-4">
      <p>Written by linclonlogging - DLMMer and Goose Dao member</p>
      <p>Not affiliated with Meteora Team</p>
      <p>Discord: linclonlogging</p>
      <p>
        X:
        <a href="https://x.com/linclonlogging" target="_blank"
          >@linclonlogging</a
        >
      </p>
    </div>

    <div class="note">
      <p>
        Disclaimer: I am not responsible if you lose money. I am trying to help
        you become profitable, and am not in any way telling or encouraging you
        to take financial risk. You alone are responsible for your actions.
      </p>
    </div>
  </div>
</template>

<script setup>
const description = 'Multiday positions guide for Meteora - DLMM and chill'
const title = 'The Wise Trade | DLMM Guide - Multiday Positions'
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
    {
      name: 'twitter:url',
      content: 'https://thewise.trade/dlmm-guide-multidays',
    },
    { name: 'twitter:card', content: 'summary_large_image' },
  ],
})
</script>

<style scoped>
.content-container {
  max-width: 80ch;
  margin: 0 auto;
  padding: 0 1rem;
}

h1 {
  font-size: 2.5rem;
  margin-bottom: 2rem;
  font-weight: bold;
  line-height: 3.5rem;
}

h2 {
  font-size: 2rem;
  margin-top: 3rem;
  margin-bottom: 1.5rem;
  font-weight: bold;
}

h3 {
  font-size: 1.75rem;
  margin-top: 2.5rem;
  margin-bottom: 1rem;
  font-weight: bold;
}

h4 {
  font-size: 1.5rem;
  margin-top: 2rem;
  margin-bottom: 1rem;
}

img.illustration {
  border-radius: 0.5em;
  border: 1px solid #ccbbbb;
  box-shadow: 0px 2px 6px rgba(20, 0, 0, 0.2);
  margin: auto;
  margin-bottom: 1em;
}

a {
  text-decoration: underline;
}

.small {
  max-width: 500px;
}

.italic {
  font-style: italic;
}

.note {
  background-color: rgb(30 20 40);
  border: 1px solid #ccbbcc;
  padding: 1rem;
  border-radius: 0.5rem;

  h3 {
    margin-top: 0;
  }
}
</style>
