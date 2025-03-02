<template>
  <div class="text-center">
    <img
      class="m-auto max-w-sm"
      src="~/assets/images/illustrations/dlmms-tools.png"
    />
  </div>

  <h1>Meteora DLMMs guide Part 2 - Community Tools</h1>

  <p>
    In this article, we will see how to use the tools provided by the Meteora community to get the most out of DLMMs.
    We will start with the <a href="https://metlex.io">Metlex.io</a> website to find the best pools and tokens to use.
    Then, we will see how to use the <a href="https://hawksight.co">Hawksight</a> application to put your positions on autopilot.
    We will give a look at <a href="https://lp4fun.vercel.app/">lp4fun</a> to see how to get the sol value of your positions.
    Finally, we will look at the <a href="https://geeklad.github.io/meteora-profit-analysis/">Geeklad Profit Analyzer</a>
    to analyze the profitability of our positions.
  </p>

  <p>
    NB: We assume you already read the first part of this guide and understand the basics of DLMMs and impermanent loss.
  </p>

  <h2>Table of Contents</h2>
  <ul>
    <li><a href="#metlex">Metlex.io</a> - <a href="https://x.com/AlekssRG">X account</a></li>
    <li><a href="#hawksight">Hawksight.co</a> - <a href="https://x.com/HawkFi_">X account</a></li>
    <li><a href="#lp4fun">lp4fun</a> - <a href="https://x.com/madxbug">X account</a></li>
    <li><a href="#geeklad">Geeklad Profit Analyzer</a> - <a href="https://x.com/geeklad">X account</a></li>
    <li><a href="#wrapping-up">Wrapping up</a></li>
  </ul>

  <h2 id="metlex">
    <a href="https://metlex.io">Metlex.io</a>
  </h2>

  <h3>Intro</h3>
  <p>
    Metlex.io is a webapp that allows you to search and compare the different pools available on Meteora.
    It's the goto tool to find the best pools and tokens to use.
    It will give you all the data required to make the right decision about which pool to use.
    It has different way to show information and each of them is accessible through a different tab.
    So let's go through each of them.
  </p>

  <h3>Pools finder (pools degen)</h3>

  <p>
    The "Pools finder" tab will allow you to find the best pools to use for your positions.
    You will be able to filter pools by name. See it as a quickfinder. Once you type a token name
    the results are displayed and ordered by TVL.
  </p>

  <p class="has-text-centered">
    <img class="illustration" src="~/assets/images/articles/dlmms/metlex-pools.png" />
  </p>

  <p>
    Each result comes with a link to the pool and handy links like Birdeye, Desxscreener and rugcheck addresses for the token.
    From there, you will be able to go to the desired Meteora pool and set your position.
  </p>

  <p class="has-text-centered">
    <img class="illustration small" src="~/assets/images/articles/dlmms/metlex-pools-2.png" />
  </p>

  <h3>Active DLMMs (dlmm 100)</h3>
  <p>
    The "Active DLMMs" tab will show you the different DLMMs that have high TVL and volume on Meteora. You can set filters
    and change the sorting based on criteria like: volume (24h/12h/1h/5m), TVL, 24h fees or marketcap. It's a primary tool
    to look at the state of the market and find the most interesting pools.
  </p>

  <p class="has-text-centered">
    <img class="illustration" src="~/assets/images/articles/dlmms/metlex-active-dlmm.png" />
  </p>

  <p>
    For each result you will get pool info, TVL, the volume in USD, and the number of buying and
    selling transactions for the last 1/6/12/24 hours.
  </p>

  <p class="has-text-centered">
    <img class="illustration small" src="~/assets/images/articles/dlmms/metlex-active-dlmm-2.png" />
  </p>

  <h3>Pools info (dex legend)</h3>

  <p>
    This tab will show you all the pools available for a given token on every platform: Meteora, Raydium, and Orca.
    For each of them you will have the TVL, volume, APR and other metrics. It allows you to compare the different
    pools among all DEXes and find the one that best fits your strategy whether you want to use Meteora or another platform.
  </p>

  <p class="has-text-centered">
    <img class="illustration" src="~/assets/images/articles/dlmms/metlex-token-infos.png" />
  </p>

  <p>
    For each result you will get the pool name, TVL, and the number of buying and
    selling transactions for the last 1/6/12/24 hours.
  </p>

  <p class="has-text-centered">
    <img class="illustration  small" src="~/assets/images/articles/dlmms/metlex-token-infos-2.png" />
  </p>

  <h3>Transaction PNL (pnl top)</h3>

  <p>
    The "Transaction PNL" tab will allow you to see the Profit and Loss of a past position.
    For that, you have to give the transaction hash of the position. To get a transaction hash, you can use the
    <a href="https://solscan.io">Solscan</a> website and look at your wallet.
    Search for your wallet then go into the Defi section, search for your transaction and copy the transaction hash in Metlex.
    See below an example of the transaction hash for a MOODENG/SOL position:
  </p>

  <p class="has-text-centered">
    <img class="illustration" src="~/assets/images/articles/dlmms/metlex-transaction-hash.png" />
  </p>

  <p>
    Metlex will display the initial price of the position, the last price and all the transactions that happened during the position.
    It will allow you to have a breakdown of your position and see how it evolved.
    Bonus, it comes with a practical social feature allowing you to share your position with the community via a picture or a link.
  </p>

  <p>
  All dollar values displayed are based on the token value when the action
  occured. The base token is displayed on the left and the quote token is
  displayed on the right.
  </p>

  <p class="has-text-centered">
    <img class="illustration small" src="~/assets/images/articles/dlmms/metlex-pnl.png" />
  </p>

  <p>
    The generated picture will look like this:
  </p>

  <p class="has-text-centered">
    <img class="illustration" src="~/assets/images/articles/dlmms/metlex-share.png" />
  </p>


  <h3>Fees count</h3>

  <p>
    The "Fees count" tab will show you the fees earned for every pool you put liquidity into. It allows you to know all
    the fees you collected and see which positions were the most profitable. It's also great to know
    the amount of points you accumulated for the Meteora airdrop.
  </p>

  <p class="has-text-centered">
    <img class="illustration small" src="~/assets/images/articles/dlmms/metlex-fees.png" />
  </p>

  <h3>Conclusion</h3>

  <p>
    Metlex.io is a the best tool to find the pools and tokens to use on Meteora. It allows you to compare the different
    DLMMs and find the one that best fits your strategy.
    It also allows you to know all the fees you collected and see which positions were the most profitable. But for
    that, I prefer to use the Geeklad's tool we will see later in this guide.
  </p>
  <p>
    Last but not least,
    it provides an handy helper to share your winning positions. The community loves to see them and it's a great way to
    show your success.
  </p>


  <h2 id="hawksight">
    <a href="https://hawksight.co">Hawksight.co</a>
  </h2>

  <h3>Intro</h3>

  Hawksight acts as a layer above Meteora. It adds features to automate your positions. With Hakwsight, you will
  be able to put your positions on autopilot (set and forget them).
  We will see how to use it in the following sections (note that it comes with a 8% fee on your fees).

  <h3>Create a new position</h3>

  <p>
    To create a new position, you need to select your pool of interest first. It will lead to
    a page describing the pool similar to the one we see on Meteora:
  </p>

  <p class="has-text-centered">
    <img class="illustration" src="~/assets/images/articles/dlmms/hawksight-new-position.png" />
  </p>

  <p>
    Then click on the "+ Create position" button at the bottom of the page. It will
    open a right tab allowing you to set your new position. The main options are the same as on
    Meteora:
  </p>


  <p class="has-text-centered">
    <img class="illustration small" src="~/assets/images/articles/dlmms/hawksight-new-position-2.png" />
  </p>

  <p>
    With additional information of the impact on your wallet of the creation of the position.
  </p>

  <p class="has-text-centered">
    <img class="illustration small" src="~/assets/images/articles/dlmms/hawksight-new-position-3.png" />
  </p>

  <p>
    Once you set the amount of tokens you want to deposit, you can click on the "Confirm create position" button.
    It will open a popup showing the progress of the transaction.
  </p>

  <p class="has-text-centered">
    <img class="illustration small" src="~/assets/images/articles/dlmms/hawksight-new-position-4.png" />
  </p>

  <p>
    Once the transaction is confirmed, it will show this popup:
  </p>

  <p class="has-text-centered">
    <img class="illustration small" src="~/assets/images/articles/dlmms/hawksight-new-position-5.png" />
  </p>


  <p>
    As you saw, if you don't want to benefit from the options,
    it works the same way as Meteora. Until there, nothing special.
  </p>

  <h3>Autocompounding</h3>

  <p>
    The first extra option available is called "Autocompounding".
    When it's activated, every time the DLMM grabs new tokens via fees, it will automatically
    reinvest them for you. It allows you to compound your profits and make your APR grow faster
    but your fees will be also subject to the impermanent loss.
  </p>


  <p class="has-text-centered">
    <img class="illustration small" src="~/assets/images/articles/dlmms/hawksight-autocompound.png" />
  </p>

  <p>
    See there the result of this activity:
  </p>

  <p class="has-text-centered">
    <img class="illustration small" src="~/assets/images/articles/dlmms/hawksight-position-activity.png" />
  </p>

  <h3>Take profit / Stop loss</h3>

  <p>
    The second one is called "Take profit". When activated, if the price of the token reaches a certain level,
    the position will be sold automatically. It will allow you to sell your position at a certain price and lock in your profits.
    Here I used it on a token selling bid/ask position.
  </p>

  <p class="has-text-centered">
    <img class="illustration small" src="~/assets/images/articles/dlmms/hawksight-take-profit.png" />
  </p>

  <p class="has-text-centered">
    <img class="illustration small" src="~/assets/images/articles/dlmms/hawksight-take-profit-2.png" />
  </p>

  <p>
    The third one is called "Stop loss". When activated, if the price of the token reaches a certain level,
    the position will be sold automatically. It will allow you to limit your impermanent loss and avoid
    big losses in case the token crashes. So you make sure you sell at a reasonable price and get fees prior
    to selling.
  </p>

  <p class="has-text-centered">
    <img class="illustration small" src="~/assets/images/articles/dlmms/hawksight-stop-loss.png" />
  </p>

  <p>
    Take profits and stop loss are both pretty useful because it means you can set a position and leave you
    computer without having to worry about big price changes, every outcomes will be handled by Hawksight.
  </p>


  <h3>Rebalance</h3>

  <p>
    The last option is called "Rebalance". When activated, Hawksight will automatically rebalance your position
    on a schedule you set like every hour, 6 hours, 12 hours or every day.
    It will sell a part of your position to buy more tokens to keep a balanced composition.
    Soon they will also allow you to set a range to rebalance. For example, if you set a position with a 10% range,
    Hawksight will automatically rebalance your position when the price goes out of the 10% range
  </p>

  <p>
    It allows you to keep your position always in range. It can lead to some loss but the fact it keeps it in range will lead
    to more fees collected and may compensate the loss. And of course, if the token price goes up you will be always in profit.
  </p>

  <p class="has-text-centered">
    <img class="illustration small" src="~/assets/images/articles/dlmms/hawksight-autorebalance.png" />
  </p>

  <h3>Conclusion</h3>

  <p>
    From what we see, Hawksight allows you to autocompound your fees, set take profit and stop loss on your positions,
    and rebalance them on a schedule. It's a pretty powerful tool to take the most out of your positions without
    staying in front of your screen. These automations can save you a lot of time for a small fee. I encourage you to
    give it a try and see if it can help you to set your strategy.
  </p>


<h2 id="lp4fun">
  <a href="https://lp4fun.vercel.app/">lp4fun</a>
</h2>

<h3>Intro</h3>

<p>
  lp4fun is a tool that allows you to see the state of your current positions. It's a very handy tool to know how much
  SOL or USDC value you have in your open positions. It will help you to evaluate when to cash out your positions.
</p>

<h3>Charts</h3>

<p>
First connect to the website and set your wallet address. It will load your live positions.
It will show a chart giving you the state of the pool you use and the positions you have in it.
</p>

<p class="has-text-centered">
  <img class="illustration" src="~/assets/images/articles/dlmms/lp4fun-positions.png" />
</p>

<h3>Estimated value</h3>

<p>
From there you can select positions and click on the view analytics button.
You will see the estimated value of your positions in SOL and fees collected. It
will also show the
aggregated value of for the pool if you have multiple positions. You can select
  a single one also.
</p>

<p>
  The value is displayed for the moment where you set the position and for the current moment.
  It allows to calculate the impact of the impermanent loss on your position and
  the profit you would made if you closed the position at the current moment.
  On the top right you have an option to see this value in USD or SOL.
</p>


<p class="has-text-centered">
  <img class="illustration" src="~/assets/images/articles/dlmms/lp4fun-estimated-value.png" />
</p>

<h3>History breakdown</h3>

<p>
You can also see the history of your positions with the breakdown of the
fees collected and the deposits with their value at the moment of the action.
</p>

<p class="has-text-centered">
  <img class="illustration" src="~/assets/images/articles/dlmms/lp4fun-history.png" />
</p>

<h3>Conclusion</h3>

<p>
lp4fun is a great tool to know the state of your positions and the value of your wallet.
From its data, you will know if it's worth to cash out some profits or if you should wait for better prices.
</p>


<h2 id="geeklad">
  <a href="https://geeklad.github.io/meteora-profit-analysis/">Geeklad Profit Analyzer</a>
</h2>


  <h3>Intro</h3>

  <p>
    Geeklad is a tool that allows you to see your DLMM performances and analyzes the profitability of your open and closedpositions.
    It will show you charts showing your progress over time and a breakdown of the profits and losses for each of them:
    fees earned, price changes and differentials.
  </p>

  <h3>All time performance</h3>

<p>
  On the top left of the page you can see the main metrics of your wallet positions:
</p>

<ul>

  <li>
    <b>Number of position transactions</b>: the number of transactions required to set your positions in all pools.
  </li>
  <li>
    <b>Number of positions</b>: the number of pools you set a position on.
  </li>
  <li>
    <b>First transaction date</b>: the start date of the analysis.
  </li>
  <li>
    <b>Most recent transaction date</b>: the end date of the analysis.
  </li>
</ul>

  <p class="has-text-centered">
    <img class="illustration small" src="~/assets/images/articles/dlmms/geeklad-all-time-performance.png" />
  </p>

  <p>
    On the top right of the page you can see all the fees you collected in USD, it will list:
  </p>
  <ul>
    <li>
      <b>Meteora Points</b>: all the points you generated for the Meteora airdrop.
    </li>
    <li>
      <b>Fees</b>: the fees you collected in USD.
    </li>
    <li>
      <b>Total Impermanent Loss</b>: the sum all of impact in USD from the price changes of the tokens in your positions.
    </li>
    <li>
      <b>Total USD Profit</b>: the fees added to the impermanent loss impact.
    </li>
  </ul>

  <p class="has-text-centered">
    <img class="illustration small" src="~/assets/images/articles/dlmms/geeklad-all-time-performance-2.png" />
  </p>

  <h3>SOL Profit</h3>

  <p>
    The SOL profit section is divided in 3 parts: numbers about your positions, profit and loss progress over time chart and
    a breakdown of the profits and losses for each position displayed as a chart.
  </p>

  <p>
    The indicators listed are:
    <ul>
      <li>
        <b>Total Deposit</b>: the sum of all the deposits you made in SOL.
      </li>
      <li>
        <b>Total Fees</b>: the sum of all the fees you collected in SOL.
      </li>
      <li>
        <b>Impermanent Loss</b>: the sum of all the impermanent loss you got in SOL.
        If this number is positive, it means you made profit.
      </li>
      <li>
        <b>Net Profit</b>: the sum of the fees and the impermanent loss.
      </li>
      <li>
        <b>Profit %</b>: the profit percentage you made from the deposits.
      </li>
      <li>
        <b># of positions</b>: the number of positions involved in the analysis.
      </li>
      <li>
        <b># of transactions</b>: the number of transactions involved in the analysis.
      </li>
    </ul>
  </p>

  <p class="has-text-centered">
    <img class="illustration" src="~/assets/images/articles/dlmms/geeklad-sol-profit.png" />
  </p>

  <p>
    Additionaly, you can see the breakdown of the profits and losses for each position displayed on the chart.
    You can hover each bar to see the details of the position.
  </p>

  <p class="has-text-centered">
    <img class="illustration small" src="~/assets/images/articles/dlmms/geeklad-position-zoom.png" />
  </p>

  <h3>USDC profit (and other tokens)</h3>

  <p>
    Following the SOL charts, you can see the USDC profit charts. It shows evolution of your USDC profit the same way as the SOL profit.
    A similar schema is applied for the other token pairs you had set in your positions.
  </p>

  <p class="has-text-centered">
    <img class="illustration" src="~/assets/images/articles/dlmms/geeklad-usdc-profit.png" />
  </p>

  <h3>Date filters</h3>

  <p>
    You can filter the data by date to see the evolution of your profits on a given period. It's great to
    see analyze your strategy on a given week or on a given month. The meta changes often
    and it's important to know the impact on your strategy.
  </p>

  <p class="has-text-centered">
    <img class="illustration" src="~/assets/images/articles/dlmms/geeklad-filters.png" />
  </p>

  <h3>Data export</h3>
  <p>
    All the transactions data can be exported to a CSV file or SQlite database (for developers).
    It's great to have a backup of your data and import it in other tools like Google Sheets.
  </p>

  <h3>Conclusion</h3>

  <p>
    Geeklad is the perfect tool to analyze your performance and refine your strategy.
    Everytime you decide to change your strategy,
    note the period you are analyzing and come back regularly on Geeklad to see if it's working.
    Having a clear view of your profits and losses is key to success in DeFi.
    Take your decisions based on real data not assumptions.
  </p>

<h2 id="wrapping-up">
Wrapping up
</h2>

<p>
  We have seen the tools you can use to get the most out of DLMMs. We have looked at Metlex.io to find the best pools and tokens,
  lp4fun to see the state of your positions, Geeklad to analyze your performances and Hawksight to automate your positions.
  I highly recommend you to use all of them.
  They will help you to improve your strategies and put the probabilities on your side. There is a lot of uncertainty in DeFi,
  that's why you need the most up to date information and automation to be successful.
</p>
<p class="font-italic">
  <em>
    Note: Tooling is great but peers are also important. So, join a community of traders to share your strategies,
    learn from others and get feedback on your positions. The Meteora Discord is a great place for that but
    others Discord like GooseDAO or TheWhales can be benefetial too.
  </em>
</p>
</template>

<script setup>
const description =
  "Guides and strategies to take the most out of Meteora DLMM community tools";
const title = "The Wise Trade | DLMM Guide Part 2 - Community Tools"
useHead({
  title,
  meta: [
    { name: "title", content: title },
    { name: "description", content: description },
    { name: "og:description", content: description },
    { name: "og:image", content: "https://thewise.trade/illustrations/dlmms-tools.png" },
    { name: "og:type", content: "Website" },
  ],
});
</script>

<style scoped>
img.illustration {
  border-radius: .5em;
  border: 1px solid #CCBBBB;
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

.small {
  max-width: 500px;
}

.italic {
  font-style: italic;
}
</style>
