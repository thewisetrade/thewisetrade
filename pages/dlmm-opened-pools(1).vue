<template>
    <div id="opened-position" class="container">
        <div class="flex flex-row items-center mb-10">
            <h1 class="app-title flex-1">DLMM Active Pool Finder</h1>
            <a class="credit" href="https://tokleo.com/" target="_blank">
                Powered by Tokleo API
            </a>
        </div>

        <!-- <div class="filters">
            <div class="toggle flex flex-row">
                <ToggleButtons class="mr-5 filter" label="Bin Step" :values="[
                    { text: '250', value: 250 },
                    { text: '200', value: 200 },
                    { text: '100', value: 100 },
                    { text: '80', value: 80 },
                    { text: '20', value: 20 },
                ]" v-model="binStep" />
                <ToggleButtons class="mr-5 filter" label="Market Cap" :values="[
                    { text: '> 1M', value: 1 },
                    { text: '> 10M', value: 10 },
                    { text: '> 100M', value: 100 },
                ]" v-model="marketCap" />
                <ToggleButtons class="mr-5 filter" label="Liquidity" :values="[
                    { text: '> 10k', value: 10 },
                    { text: '> 100k', value: 100 },
                    { text: '> 500k', value: 500 },
                ]" v-model="liquidity" />
                <ToggleButtons class="filter" label="Age" :values="[
                    { text: '>1d', value: 1 },
                    { text: '>3d', value: 3 },
                    { text: '>7d', value: 7 },
                ]" v-model="age" />
                <button class="button" @click="loadPoolsData">
                    <ArrowPathIcon class="w-4 h-4" />
                </button>
            </div>
        </div> -->

        <div class="filter-headers">
            <span class="name">Positions/Pool</span>
            <span class="name">Age</span>
            <span class="fees">Value</span>
            <span class="fees">Collected Fee</span>
            <span class="fees">Uncol. Fee</span>
            <span class="fees">uPnL</span>
            <span class="fees">Range</span>
        </div>

        <div class="pools">
            <Loader v-if="isLoading" />
            <template v-else>
                <a :key="pool.id" target="_blank" :href="`https://v2.meteora.ag/dlmm/${pool.meteora_address}`"
                    v-for="pool in displayedPools">
                    <div class="pool flex flex-row gap-4 items-center rounded-xl border-2">
                        <span class="data pool-parameters">{{ pool.meteora_baseFeePercentage }}%</span>
                        <h2>{{ pool.meteora_name }}</h2>
                        <span class="fee-ratio font-bold">{{
                            pool.meteora_feeTvlRatio.h24.toFixed(2) }}%</span>
                        <span class="fee-ratio font-bold">{{
                            pool.meteora_feeTvlRatio.h2.toFixed(2) }}%</span>
                        <a target="_blank"
                            :href="`https://www.birdeye.so/token/${pool.meteora_degenTokenAddress}?chain=solana`">
                            chart
                        </a>
                        <span class="flex-1"></span>
                        <span class="data">{{ Math.round(pool.meteora_liquidity / 1000) }}K</span>
                        <span class="data mc">{{ Math.round(pool.top_pair_mcap / 1_000_000) }}M</span>
                    </div>
                </a>
            </template>
        </div>
    </div>

</template>

<script setup>
import {
    ArrowPathIcon,
} from '@heroicons/vue/24/outline'

import { Connection, PublicKey } from "@solana/web3.js"

import DLMM from '@meteora-ag/dlmm';
import {basicExample} from "~/utils/example/basic-usage.js"

definePageMeta({
    layout: 'app'
})
const RPC_ENDPOINT_URL = import.meta.env.VITE_RPC_ENDPOINT_URL

const isLoading = ref(false)

const pools = []
const displayedPools = ref([])

const marketCap = ref(10)
const binStep = ref(100)
const liquidity = ref(10)
const age = ref(1)

const positionData = basicExample();
console.log("🚀 ~ positionData:", positionData)

const resetDisplayedPools = () => {
    displayedPools.value = pools
        .filter(p => p.meteora_quoteToken === 'SOL')
        .filter(p => p.meteora_binStep === binStep.value)
        .filter(p => p.top_pair_mcap >= marketCap.value * 1_000_000)
        .filter(p => p.meteora_liquidity >= liquidity.value * 1_000)
        .filter(p => p.oldest_pair_ageInHours >= age.value * 24)
        .sort((pa, pb) => pb.meteora_feeTvlRatio.h24 - pa.meteora_feeTvlRatio.h24)
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

loadPoolsData();

const getPoolPositionsViaSdk = async (poolAddress, knownWallets = []) => {
    try {
        const connection = new Connection(RPC_ENDPOINT_URL);
        console.log("🚀 ~ getPoolPositionsViaSdk ~ connection:", connection)
        
        const dlmmPool = await DLMM.create(connection, new PublicKey(poolAddress));
        console.log("🚀 ~ getPoolPositionsViaSdk ~ dlmmPool:", dlmmPool)

        const allPositions = [];

        // If you have a list of known wallets
        for (const wallet of knownWallets) {
            try {
                const { userPositions } = await dlmmPool.getPositionsByUserAndLbPair(
                    new PublicKey(wallet)
                );

                userPositions.forEach(position => {
                    allPositions.push({
                        owner: wallet,
                        positionAddress: position.publicKey.toString(),
                        positionData: position.positionData,
                        binData: position.positionData.positionBinData,
                        fees: {
                            tokenX: position.positionData.feeX.toString(),
                            tokenY: position.positionData.feeY.toString()
                        }
                    });
                });

            } catch (error) {
                console.log(`No positions found for wallet ${wallet}`);
            }
        }

        return allPositions;

    } catch (error) {
        console.error('Error with SDK method:', error);
        return [];
    }
}

// const getAllpool = async () => {
//     try {
//         console.log("start fetching datas")
//         const response = await fetch('https://dlmm-api.meteora.ag/pair/all');
//         const allPools = await response.json();

//         // Filter for opened/active pools
//         const activePools = allPools.filter(pool => {
//             return (
//                 // Has meaningful liquidity (not just dust)
//                 parseFloat(pool.liquidity) > 100 &&

//                 // Not blacklisted
//                 !pool.is_blacklisted &&

//                 // Not hidden
//                 !pool.hide &&

//                 // Has some trading volume or fees (shows activity)
//                 (pool.trade_volume_24h > 0 &&
//                     pool.fees_24h > 0 &&
//                     pool.cumulative_trade_volume > 0) &&

//                 // Has actual token reserves
//                 pool.reserve_x_amount > 0 &&
//                 pool.reserve_y_amount > 0 &&

//                 // Valid token mints (not null system program)
//                 pool.mint_x !== "11111111111111111111111111111111" &&
//                 pool.mint_y !== "11111111111111111111111111111111"
//             );
//         });

//         console.log(`Total pools: ${allPools.length}`);
//         console.log(`Active pools: ${activePools.length}`);
//         console.log("Active pools:", activePools);
//         for (let i = 0; i < 50; i++) {
//             const position = getAllPoolPositions(activePools[i].address);
//             console.log("🚀 ~ getAllpool ~ position:", position)

//         }
//         console.log("🚀 ~ getAllpool ~ positions:", positions)


//         return activePools;

//     } catch (error) {
//         console.error("Error fetching pools:", error);
//     }
// }
// getAllpool()

setInterval(loadPoolsData, 1000 * 60 * 5)

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
    padding: .5em 1em;
    border: 2px solid #334;
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

    .mc {}
}

.data.mc {
    min-width: 40px;
    text-align: right;
}

.button {
    border: 1px solid #607CF6;
    border-radius: 5px;
    height: 36px;
    margin-top: 23px;
    padding: 10px;
    cursor: pointer;
}
</style>
