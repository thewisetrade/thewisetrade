// TokenService.js - Separate file for token info management

export class TokenService {
  constructor() {
    this.cache = new Map();
    this.jupiterTokens = null;
    this.isLoading = false;
  }

  async init() {
    if (this.jupiterTokens || this.isLoading) return;
    
    this.isLoading = true;
    try {
      console.log('Loading Jupiter token list...');
      const response = await fetch('https://token.jup.ag/all');
      const tokens = await response.json();
      
      this.jupiterTokens = new Map();
      tokens.forEach(token => {
        this.jupiterTokens.set(token.address, {
          symbol: token.symbol,
          name: token.name,
          icon: token.logoURI,
          decimals: token.decimals,
          verified: token.verified || false
        });
      });
      
      console.log(`Loaded ${this.jupiterTokens.size} tokens from Jupiter`);
    } catch (error) {
      console.error('Failed to load Jupiter tokens:', error);
      this.jupiterTokens = new Map();
    } finally {
      this.isLoading = false;
    }
  }

  async getTokenInfo(address) {
    if (!address) return this.getDefaultToken();

    // Check cache first
    if (this.cache.has(address)) {
      return this.cache.get(address);
    }

    // Ensure Jupiter tokens are loaded
    await this.init();

    // Check Jupiter cache
    if (this.jupiterTokens.has(address)) {
      const token = this.jupiterTokens.get(address);
      this.cache.set(address, token);
      return token;
    }

    // Try individual API call
    const token = await this.fetchFromAPI(address);
    if (token) {
      this.cache.set(address, token);
      return token;
    }

    // Return default
    const defaultToken = this.getDefaultToken(address);
    this.cache.set(address, defaultToken);
    return defaultToken;
  }

  async fetchFromAPI(address) {
    // Try Jupiter individual API
    try {
      const response = await fetch(`https://token.jup.ag/token/${address}`);
      if (response.ok) {
        const data = await response.json();
        return {
          symbol: data.symbol,
          name: data.name,
          icon: data.logoURI,
          decimals: data.decimals,
          verified: data.verified || false
        };
      }
    } catch (error) {
      console.warn('Jupiter individual API failed:', error);
    }

    // Try Solscan as backup
    try {
      const response = await fetch(`https://api.solscan.io/token/meta?token=${address}`);
      if (response.ok) {
        const data = await response.json();
        return {
          symbol: data.symbol,
          name: data.name,
          icon: data.icon,
          decimals: data.decimals,
          verified: false
        };
      }
    } catch (error) {
      console.warn('Solscan API failed:', error);
    }

    return null;
  }

  async getMultipleTokens(addresses) {
    await this.init();
    
    const results = {};
    const promises = addresses.map(async address => {
      const token = await this.getTokenInfo(address);
      results[address] = token;
    });
    
    await Promise.all(promises);
    return results;
  }

  getDefaultToken(address = null) {
    return {
      symbol: address ? address.slice(0, 6) + '...' : 'UNKNOWN',
      name: 'Unknown Token',
      icon: this.getDefaultIcon(),
      decimals: 9,
      verified: false
    };
  }

  getDefaultIcon() {
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iMTIiIGZpbGw9IiM2NjY2NjYiLz4KPHR0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0iY2VudHJhbCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZFlheD0id2hpdGUiIGZvbnQtc2l6ZT0iMTAiPj88L3RleHQ+Cjwvc3ZnPg==';
  }

  clearCache() {
    this.cache.clear();
  }

  getCacheStats() {
    return {
      cacheSize: this.cache.size,
      jupiterTokensLoaded: this.jupiterTokens ? this.jupiterTokens.size : 0
    };
  }
}

// Create singleton instance
let tokenServiceInstance = null;

export function getTokenService() {
  if (!tokenServiceInstance) {
    tokenServiceInstance = new TokenService();
  }
  return tokenServiceInstance;
}

// Vue composable for easier use
export function useTokenService() {
  const tokenService = getTokenService();
  
  return {
    getTokenInfo: (address) => tokenService.getTokenInfo(address),
    getMultipleTokens: (addresses) => tokenService.getMultipleTokens(addresses),
    clearCache: () => tokenService.clearCache(),
    init: () => tokenService.init(),
    getCacheStats: () => tokenService.getCacheStats()
  };
}