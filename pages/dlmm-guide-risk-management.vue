<template>
  <div class="text-center">
    <img
      class="m-auto max-w-sm"
      src="~/assets/images/illustrations/dlmms-risk-management.png"
    />
  </div>

  <div class="content-container">
    <h1>DLMMs - Risk Management</h1>

    <div class="note mb-12">
      <h3>Disclaimer</h3>

      <p>
        This guide was written by Chives, an
        active DLMMer on Meteora.
        He has an approach to avoid most of the risks encountered in DLMMing.
        He gently allowed me to publish his guide on The Wise Trade.
      </p>
      <p>
        But
        you have to keep in mind that it comes from his own experiments and discussions.
        There is no guarantee that it will work for you and he is not responsible for your
        losses. Providing liquidity is a risky activity that can lead to the loss of
        your initial investment. Be careful and do your own research.
      </p>
    </div>

    <p>
    Managing risk is the single most important step to growing an account. And I feel that I rarely see it talked about among LPers.
    </p>

    <p>
    If you are trying to actively grow a Meteora account, the most important thing is limiting risk.
    Today we will cover 4 elements of risk that all play a necessary conscious risk when opening a position.
    </p>

    <p>
    Before getting started, I would like to state that I approach lping on Meteora from an approach as a trader,
    and usually treat each single position I open like a trade. I think of how much I am willing to risk,
    and how much I expect to make each time. I will be referring to each pool opened as a trade.
    </p>

    <p>
    This means I always have a predefined risk level, and always try to give myself cushion on the downside since theses things can rug fast.
    </p>

    <p class="italic">
    This whole article will pertain to a one-sided sol strategy. I usually go full 69 bin. This article ALSO pertains to mostly short term, momentum trades. 100 bin step on larger coins is not as sketchy as most of coins usually traded.
    </p>


    <h3>4 Elements</h3>


    <p>
    I will be going over the following elements of risk management:
    </p>

    <ul>
      <li>Mental Stops/Discipline</li>
      <li>Position Sizing</li>
      <li>Coin Selection</li>
      <li>Fee Generation</li>
    </ul>

    <h3>1. Mental Stops/Discipline</h3>

    <p>
    If you don't read the rest of this article, this is the one statement that you should take with you. Cut your loss before it gets ugly. I try to stick to withdrawing my position and selling it on jup as soon as it falls below the bottom of my range. Sometimes you can hold off on selling when it gets out of range, but we all know it is a terrible feeling to have. And your $500 initial position will be about $380-$400 at the very bottom of your range. After that, it can go to $200 in the blink of an eye. After that, $150. before you can even sell. This is how you take outsized losses, the ones you NEED to avoid to grow your account.
    </p>

    <p>
    It is sometimes very difficult to get out of positions, I have been there countless times and have taken quite a few outsized losses. But you want to prioritize making it a potential trigger to pull when it is near the bottom. You don't want it dumping straight through becoming exponentially worthless by the second, while you are sitting there frozen watching your money evaporate.
    </p>

    <p>
    You HAVE to be in a mindset where you are ready to withdraw and sell no matter what. Make no mistake, this is the number one most important rule to follow. Cut losses quickly. Plot out the bottom of your range on your chart so you know how close you are to having to hit the eject button.
    </p>

    <p>
    Your goal is survival, to be able to keep playing.
    With that core rule in place, lets move on!
    </p>

    <h3>2. Position Sizing</h3>

    <p>
    This is obviously what you have to start with when entering a trade.
    You need to open positions in accordance to the range/bin step you are choosing to enter. Remember the following range of each bin step:
    </p>

    <table class="w-full my-4">
      <thead>
        <tr>
          <th class="text-left">Bin Step</th>
          <th class="text-left">Maximum Loss</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>80</td>
          <td>-40%</td>
        </tr>
        <tr>
          <td>100</td>
          <td>-50%</td>
        </tr>
        <tr>
          <td>125</td>
          <td>-57%</td>
        </tr>
        <tr>
          <td>200</td>
          <td>-74%</td>
        </tr>
        <tr>
          <td>250</td>
          <td>-81%</td>
        </tr>
        <tr>
          <td>400</td>
          <td>-93%</td>
        </tr>
      </tbody>
    </table>

    <p>
    Also remember that -50% isn't that far away. After it goes -50%, I consider it hell mode and the percentage drops can start getting brutal FAST.
    </p>

    <p>
    You need to also have experience in this game to know what could easily drop 50% and what will likely find support/bids before it gets to -50%
    </p>

    <p>
    If you are starting with 1-2 sol total account value, I do not recommend going more than 70% into one position at a time. You can be fully allocated, but avoid putting it all into one pool. Unless it is an A+ opportunity. We will talk about A+ opportunities in the 4. Fee Generations section.
    </p>

    <p>
    At my point in this DLMM wallet, I usually break up my sizing based on these parameters.
    </p>

    <table class="w-full my-4">
      <thead>
        <tr>
          <th class="text-left">Bin Step</th>
          <th class="text-left">Position Size</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>80</td>
          <td>1 SOL</td>
        </tr>
        <tr>
          <td>100</td>
          <td>1-2 SOL</td>
        </tr>
        <tr>
          <td>125</td>
          <td>1-3 SOL</td>
        </tr>
        <tr>
          <td>200</td>
          <td>3-5 SOL</td>
        </tr>
        <tr>
          <td>250</td>
          <td>4-12 SOL</td>
        </tr>
        <tr>
          <td>400</td>
          <td>6-12 SOL</td>
        </tr>
      </tbody>
    </table>

    <p>
    If you are not comfortable at all with sizing, start small to test pools out. Deposit more if you feel comfortable.
    </p>

    <p>
    Having these even positions sizing allows me to track my PNL very well. I am always able to calculate what my starting value was. I can always calculate the value of 2 sol and subtract it from the value of current price of pool + fees currently unclaimed.
    </p>

    <p>
    There are also some amazing tools out there that allow you to track your PNL with ease <a href="https://x.com/FlowmaticXYZ" target="_blank">@FlowmaticXYZ</a>'s DLMM terminal and <a href="https://x.com/UseUltraLP" target="_blank">@UseUltraLP</a>'s pnl tracker.
    </p>

    <p>
    Having consistent position sizing will allow you to grow your account steadily, give you a super sense of comfort, and will also make sure that your risk is not outsized on any particular positions.
    </p>

    <p>
    I have obviously increased my position sizing over time, but it should feel very natural. I have also scaled back my positions sizing significantly at points. Usually after larger than preferred losses.
    </p>

    <h3>3. Coin Selection</h3>

    <p>
    Unfortunately I don't want to touch on this much today, as it is a subject for a much longer article and mostly comes with screen time looking at charts and coins. I generally find coins with healthy charts and heavy volume that looks somewhat organic.
    </p>

    <p>
    I will definitely upload a guide on coin selection if readers are interested, just let me know. I would like to provide a lot of screenshots and examples in that case.
    </p>

    <p>
    But yes, coin selection matters and you should not be throwing your usual size on a brand new shitter.
    </p>

    <p>
    WITH that being said, I see a lot of new dlmmers scared to try out newer coins. A lot of edge I have found is being in coins that many don't know about. Dominating the TVL and printing. So-- don't be scared to try out newer or sketchier pools with a fraction of your size. Go very small and then take your good percentages if it doesn't rug.
    </p>

    <p>
    It will give you a lot of good xp to try out new coins with small size. And it's fun. Just don't choose a farm that is going to rug.
    </p>

    <p>
    I don't want to be contradictory, but there is also no need to be scouring the trenches looking for dlmm plays to enter every second of the day. There are days, even periods of days where I don't enter any new pools because there is nothing worth it. Sure you should always be aware of new coins as much as you can, but don't feel like you need to be in a position at all times.
    </p>

    <p>
    Patience is a good virtue along with experimentation
    </p>

    <h3>4. Fee Generation</h3>

    <p>
    A+ opportunities really do exist. Probably the coolest thing ever is the variance in fee generation on @MeteoraAG
    .
    </p>

    <p>
    This adds a whole new level of being able to manage risk that is not present in any other market or platform.
    </p>

    <p>
    Some pools you will enter and find you have struck a gold mine. Price moves and you have collected nearly 50% of the swap value in 5 minutes. You are literally printing money at an unbelievable rate. Because you are making money so fast, you are able to put in larger size because the opportunity is too good to pass up not being severely sized in. This is a rare case, but I wanted to preface this section by giving the extreme case scenario where you can seriously scale up.
    </p>

    <p>
    Inverse of shitty pools. If it is slow and going into your range and you're getting 50 cents while you are $40 into the pool, probably time to find another one or seriously limit how much you put into that one.
    </p>

    <p>
    You need to become good at finding out whether your pool is receiving good fees. You can look at the 24/hr fee for your pool obviously, but eventually you will become proficient in looking at the fees off the first dip into your pool and be able to tell how worth it it will be to stay in the pool.
    </p>

    <p>
    I can't give exact guidelines, but I generally look for 300%-999% fees in 100 bins and maybe 50%-300% in like 250 bins. It is kind of hard to say, but you want to see decent bin movement and decent fees to begin with. I always say that $10 and $1 in fees is a very good start. Just ball parking it.
    </p>

    <p>
    Discerning fee generation allows you to size up when needed and also limit size, withdraw liquidity, or completely withdraw position when the fees make the risk to reward not worth it.
    </p>

    <p>
    Examples of A+ opportunities in the past where you should have increased size significantly:
    </p>

    <p>
    Trump, ME, Pengu, etc.
    </p>

    <p>
    These are all of the obvious ones, but many of my best fee generation pools have been tiny unknown shitters that have low tvl and massive volume. That's why I emphasize experimenting with sketchier pools.
    </p>

    <p>
    I will finish this section by stating that ON A+ opportunities, you should recognize quickly that it is a real printer, and size up early. AS time goes on, the optimal fee generation will usually fade and you want to start scaling down. I personally make the mistake quite often of increasing size as I am in the pool, and as the conditions get less favorable. I have gotten hurt quite a few times from not decreasing size as time goes on.
    </p>

    <h3>Final Thoughts</h3>

    <p>
      Losses will inevitably happen. They are unavoidable. Managing them will allow you to keep your confidence, and have the capital and vision to keep chipping away at growth each day.
    </p>

    <p>
    That is the end of the list of elements my trading style follows. Feel free to ask any questions, want to learn more about my coin/pool selection. Risk is the number one most important factor of being profitable. You can create your own system of risk, but make sure it is in place. Cheers!
    </p>


    <div class="author-info mt-4">
      <p>
        Written by Chives <br />
        <em>(Not affiliated with Meteora Team)</em>
      </p>
      <p>X: <a href="https://x.com/ChivesWork" target="_blank">@ChivesWork</a></p>
    </div>

    <div class="note">
      <p>
        Disclaimer: I am not responsible if you lose money. I am trying to help you
        become profitable, and am not in any way telling or encouraging you to take
        financial risk. You alone are responsible for your actions.
      </p>
    </div>
  </div>
</template>

<script setup>
const description =
  "DLMM Risk Management guide";
const title = "The Wise Trade | DLMM Guide - Risk Management"
useHead({
  title,
  meta: [
    { name: "title", content: title },
    { name: "description", content: description },
    { name: "og:title", content: title },
    { name: "og:description", content: description },
    { name: "og:image", content: "https://thewise.trade/illustrations/dlmms-guide.png" },
    { name: "og:type", content: "Website" },
    { name: "twitter:site", content: "@defilogist" },
    { name: "twitter:creator", content: "@defilogist" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: "https://thewise.trade/illustrations/dlmms-guide.png" },
    { name: "twitter:url", content: "https://thewise.trade/dlmm-guide-risk-management" },
    { name: 'twitter:card', content: 'summary_large_image' }
  ],
});
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
  border-radius: .5em;
  border: 1px solid #CCBBBB;
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
  border: 1px solid #CCBBCC;
  padding: 1rem;
  border-radius: 0.5rem;

  h3 {
    margin-top: 0;
  }
}

.author-info {
  border: 1px solid #CCCCCC;
  padding: 1rem;
  border-radius: 0.5rem;
  margin-bottom: 1rem;
  p {
    margin-top: 0;
  }
}

table {
  border-collapse: collapse;
  width: auto;
  margin: 2em auto 2em auto;
}

th, td {
  padding: 0.5rem;
  border: 1px solid #CCBBCC;
  text-align: right;
}

th {
  background-color: rgb(30 20 40)
}
</style>
