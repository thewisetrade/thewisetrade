const positionAnalyzisCaches = {}

function loadPositionAnalyzisCache(walletAddress) {
  const data = localStorage.getItem(`meteora-position-analyzis-${walletAddress}`)
  positionAnalyzisCaches[walletAddress] = {}
  try {
    const parsedData = JSON.parse(data) || {}
    positionAnalyzisCaches[walletAddress] = parsedData
  } catch (error) {
    console.error('Error parsing position analyzis cache', error)
    positionAnalyzisCaches[walletAddress] = {}
    savePositionAnalyzisCache(walletAddress)
  }
  return positionAnalyzisCaches[walletAddress]
}

function savePositionAnalyzisCache(walletAddress) {
  const cache = positionAnalyzisCaches[walletAddress]
  localStorage.setItem(`meteora-position-analyzis-${walletAddress}`, JSON.stringify(cache))
}

function isPositionAnalyzisCached(walletAddress, position) {
  const key = `${position.signature}-${position.lbPair}`
  return positionAnalyzisCaches[walletAddress][key]
}

function setPositionAnalyzisCached(walletAddress, position) {
  const key = `${position.signature}-${position.lbPair}`
  positionAnalyzisCaches[walletAddress][key] = true
}

function getPositionAnalyzisCached(walletAddress, position) {
  const key = `${position.signature}-${position.lbPair}`
  return positionAnalyzisCaches[walletAddress][key]
}

export {
  loadPositionAnalyzisCache,
  savePositionAnalyzisCache,
  isPositionAnalyzisCached,
  setPositionAnalyzisCached,
  getPositionAnalyzisCached,
}