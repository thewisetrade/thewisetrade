import { MeteoraDlmmDb } from 'meteora-dlmm-db'

const loadDlmmDb = async () => {
  db = await MeteoraDlmmDb.load()
  const downloader = db.download({
    rpc: "https://api.mainnet-beta.solana.com",
    account: "CPYDZMorfh3q6rd8L67VvaF4x5gnD9e66HiZHvK7CyFV",
  })
  return { downloader, db }
}

export { loadDlmmDb }
