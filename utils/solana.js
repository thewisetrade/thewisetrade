import { Connection, PublicKey } from '@solana/web3.js'
import {
  getDomainKey,
  getFavoriteDomain,
  NameRegistryState,
  getAllDomains,
  reverseLookup,
} from '@bonfida/spl-name-service'

const connection = new Connection(
  import.meta.env.VITE_RPC_ENDPOINT_URL,
)

export const isValidSolanaAddress = (address) => {
  try {
    if (!address) return false
    const publicKey = new PublicKey(address)
    return PublicKey.isOnCurve(publicKey.toBytes())
  } catch (error) {
    return false
  }
}

export const isSolanaDomain = (domain) => {
  return domain.toLowerCase().endsWith('.sol')
}

export const resolveDomainToAddress = async (domain) => {
  try {
    const cleanDomain = domain.toLowerCase().replace('.sol', '')
    const { pubkey } = await getDomainKey(cleanDomain)
    const { registry } = await NameRegistryState.retrieve(connection, pubkey)
    return registry.owner.toBase58()
  } catch (error) {
    console.error('Error resolving .sol domain:', error)
    return null
  }
}

export const getPrimaryDomain = async (walletAddress) => {
  try {
    const pubkey = new PublicKey(walletAddress)
    const favoriteDomain = await getFavoriteDomain(connection, pubkey)
    let favoriteDomainName = null
    if (favoriteDomain) {
      favoriteDomainName = `${favoriteDomain.reverse}.sol`
    }
    return favoriteDomainName
  } catch (error) {
    console.error('Error getting primary domain:', error)
    return ''
  }
}

export const getFirstDomain = async (walletAddress) => {
  try {
    const pubkey = new PublicKey(walletAddress)
    const domains = await getAllDomains(connection, pubkey)
    let domainName = null
    if (domains && domains.length > 0) {
      const domainKey = domains[0]
      const domain = await reverseLookup(connection, domainKey)
      domainName = `${domain}.sol`
    }
    return domainName
  } catch (error) {
    console.error('Error resolving address to domain:', error)
    return ''
  }
}

export const validateWalletAddress = async (walletAddress) => {
  let solanaDomain = ''
  let solanaAddress = ''
  let wrongAddress = false
  let wrongDomain = false
  if (walletAddress && walletAddress.length > 0) {
    if (isValidSolanaAddress(walletAddress)) {
      try {
        solanaDomain = await getPrimaryDomain(walletAddress)
        solanaAddress = walletAddress
      } catch (error) {
        console.error('Error getting primary domain:', error)
        solanaDomain = ''
        solanaAddress = walletAddress
      }
    } else if (isSolanaDomain(walletAddress)) {
      const resolvedAddress = await resolveDomainToAddress(walletAddress)
      if (resolvedAddress) {
        solanaDomain = walletAddress
        solanaAddress = resolvedAddress
      } else {
        wrongDomain = true
      }
    } else {
      wrongAddress = true
    }
  }
  return {
    solanaDomain,
    solanaAddress,
    wrongAddress,
    wrongDomain,
  }
}
