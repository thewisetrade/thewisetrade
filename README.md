# The Wise Trade

We provide content and tools to help everyone in the ecosystem become better 
at managing his portolio through liquidity providing. We will help set up 
efficient investment strategies and avoid the most common mistakes. Of course, 
it will still be a risky investment but we will provide you with the best 
risk/rewards options.


# Contributing 

Any contribution is welcome. Open a PR directly on the repo to discuss and
integrate your changes.

To start coding on The Wise Trade you simply need a working Node.js
environment. 

To start modifying the website, use the following commands:

### Get sources

```
git clone git@github.com:thewisetrade/thewisetrade.git
```

### Get dependencies

```
npm i
```

### Preview the result

#### Set the environment

```
VITE_RPC_ENDPOINT_URL=https://myrpc
VITE_WALLET_ADDRESS=Hb7y...Ejm
VITE_METEORA_PROGRAM_ID=LBUZKhRxPF3XUpBCjp4YzTKgLccjZhTSDM9YuVaPwxo

# Optional
VITE_JUPITER_API_KEY=your-jupiter-api-key
VITE_COINGECKO_API_KEY=your-coingecko-api-key
VITE_MAX_TRANSACTIONS=1000
VITE_BATCH_SIZE=10
VITE_REQUEST_DELAY=1000
```

#### Run Nuxt

```
npm run dev
```

This website is based on Nuxt.js techonology. The server preview will be
accessible on `http://localhost:3010`.

