<template>
  <div class="liquidity-table-container">
    <div class="table-wrapper">
      <!-- Header -->
      <div class="table-header">
        <div class="header-cell sortable" @click="sort('pair')">
          <span>Position/Pool</span>
          <div class="sort-icon" :class="getSortClass('pair')"></div>
        </div>
        <div class="header-cell sortable" @click="sort('age')">
          <span>Age</span>
          <div class="sort-icon" :class="getSortClass('age')"></div>
        </div>
        <div class="header-cell sortable" @click="sort('value')">
          <span>Value</span>
          <div class="sort-icon" :class="getSortClass('value')"></div>
        </div>
        <div class="header-cell sortable" @click="sort('collectedFee')">
          <span>Collected Fee</span>
          <div class="sort-icon" :class="getSortClass('collectedFee')"></div>
        </div>
        <div class="header-cell sortable" @click="sort('uncolFee')">
          <span>Uncol. Fee</span>
          <div class="sort-icon" :class="getSortClass('uncolFee')"></div>
        </div>
        <div class="header-cell sortable" @click="sort('upnl')">
          <span>uPnL</span>
          <div class="sort-icon" :class="getSortClass('upnl')"></div>
        </div>
        <div class="header-cell sortable" @click="sort('range')">
          <span>Range</span>
          <div class="sort-icon" :class="getSortClass('range')"></div>
        </div>
      </div>

      <!-- Content Area -->
      <div class="table-content">
        <!-- Loading State -->
        <div v-if="loading" class="loading-state">
          <Loader class="loading" />
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="error-state">
          <span>Error loading positions: {{ error }}</span>
          <button @click="loadData" class="retry-button">Retry</button>
        </div>

        <!-- Empty State -->
        <div v-else-if="sortedPositions.length === 0" class="empty-state">
          <span>No positions found</span>
        </div>

        <!-- Data Rows -->
        <div v-else class="table-rows">
          <div class="table-row" v-for="position in sortedPositions" :key="position.id">
            <div class="cell position-cell">
              <div class="token-pair">
                <div class="token-icons">
                  <img :src="position.token1.icon" :alt="position.token1.symbol" class="token-icon">
                  <img :src="position.token2.icon" :alt="position.token2.symbol" class="token-icon token-icon-overlap">
                </div>
                <span class="pair-name">{{ position.token1.symbol }} / {{ position.token2.symbol }}</span>
              </div>
            </div>

            <div class="cell age-cell">
              {{ position.age }}
            </div>

            <div class="cell value-cell">
              <span class="value-amount">{{ position.value }}</span>
              <img :src="position.token2.icon" :alt="position.token2.symbol" class="value-icon">
            </div>

            <div class="cell fee-cell">
              <div class="fee-amount">{{ position.collectedFee.amount }}</div>
              <div class="fee-percentage">{{ position.collectedFee.percentage }}</div>
            </div>

            <div class="cell fee-cell">
              <div class="fee-amount" :class="position.uncolFee.color">{{ position.uncolFee.amount }}</div>
              <div class="fee-percentage" :class="position.uncolFee.color">{{ position.uncolFee.percentage }}</div>
            </div>

            <div class="cell upnl-cell">
              <div class="fee-amount" :class="position.upnl.color">{{ position.upnl.amount }}</div>
              <div class="fee-percentage" :class="position.upnl.color">{{ position.upnl.percentage }}</div>
            </div>

            <div class="cell range-cell">
              <div class="range-bar">
                <div class="range-track">
                  <div class="range-fill" :style="{
                    left: position.range.startPercent + '%',
                    width: (position.range.endPercent - position.range.startPercent) + '%'
                  }"></div>
                  <div class="range-indicators">
                    <div class="range-indicator range-start" :style="{ left: position.range.startPercent + '%' }"></div>
                    <div class="range-indicator range-current" :style="{ left: position.range.currentPercent + '%' }">
                    </div>
                    <div class="range-indicator range-end" :style="{ left: position.range.endPercent + '%' }"></div>
                  </div>
                </div>
                <div class="range-labels">
                  <span class="range-min">${{ position.range.min }}</span>
                  <span class="range-max">${{ position.range.max }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
class TokenService {
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
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iMTIiIGZpbGw9IiM2NjY2NjYiLz4KPHR0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0iY2VudHJhbCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0id2hpdGUiIGZvbnQtc2l6ZT0iMTAiPj88L3RleHQ+Cjwvc3ZnPg==';
  }

  clearCache() {
    this.cache.clear();
  }
}
export default {
  name: 'LiquidityPoolTable',
  props: {
    dataFunction: {
      type: Function,
      default: null
    },
    getTokenInfo: {
      type: Function,
      default: null
    }
  },
  data() {
    return {
      sortField: null,
      sortDirection: 'asc',
      positionsData: [],
      tempPositionsData: [],
      loading: false,
      isInitialLoad: true,
      error: null,
      refreshInterval: null,
      tokenService: null,
      tokenCache: {}
    }
  },
  computed: {
    formattedPositions() {
      const dataToUse = this.tempPositionsData.length > 0 ? this.tempPositionsData : this.positionsData;

      return dataToUse.map((position, index) => {

        console.log("icon for token1::::", position.token1.icon);
        console.log("icon for token2::::", position.token2.icon);

        // Calculate fees first
        const collectedFeeAmount = position.collectedFeesValue || 0;
        const uncolFeeAmount = position.unCollectedFeesValue || 0;
        const positionValue = position.value || 0;

        // Calculate total fees for uPnL
        const totalFees = collectedFeeAmount + uncolFeeAmount;
        const upnlPercentage = positionValue > 0 ? (totalFees / positionValue) * 100 : 0;
        const url = `https://`
        return {
          id: `position-${index}`,
          token1: position.token1,
          token2: position.token2,
          age: this.formatAge(position.age),
          ageValue: this.getAgeInHours(position.age),
          value: positionValue.toFixed(2),
          valueNum: positionValue,
          collectedFee: {
            amount: this.formatFeeAmount(collectedFeeAmount),
            percentage: this.formatPercentage(collectedFeeAmount, positionValue),
            sortValue: collectedFeeAmount
          },
          uncolFee: {
            amount: this.formatFeeAmount(uncolFeeAmount),
            percentage: this.formatPercentage(uncolFeeAmount, positionValue),
            color: uncolFeeAmount > 0 ? 'positive' : 'neutral',
            sortValue: uncolFeeAmount
          },
          upnl: {
            amount: this.formatFeeAmount(totalFees),
            percentage: this.formatUpnlPercentage(upnlPercentage),
            color: this.getUpnlColor(upnlPercentage),
            sortValue: upnlPercentage
          },
          range: {
            min: position.priceRange?.minPrice?.toFixed(6) || '0.000000',
            max: position.priceRange?.maxPrice?.toFixed(6) || '0.000000',
            ...this.calculateRangePositions(position.priceRange, position.isInRange),
            sortValue: position.priceRange?.minPrice || 0,
            currentPrice: position.priceRange?.currentPrice
          }
        };
      });
    },
    sortedPositions() {
      if (!this.sortField) {
        return this.formattedPositions;
      }

      return [...this.formattedPositions].sort((a, b) => {
        let aValue, bValue;

        switch (this.sortField) {
          case 'pair':
            aValue = `${a.token1.symbol}/${a.token2.symbol}`;
            bValue = `${b.token1.symbol}/${b.token2.symbol}`;
            break;
          case 'age':
            aValue = a.ageValue;
            bValue = b.ageValue;
            break;
          case 'value':
            aValue = a.valueNum;
            bValue = b.valueNum;
            break;
          case 'collectedFee':
            aValue = a.collectedFee.sortValue;
            bValue = b.collectedFee.sortValue;
            break;
          case 'uncolFee':
            aValue = a.uncolFee.sortValue;
            bValue = b.uncolFee.sortValue;
            break;
          case 'upnl':
            aValue = a.upnl.sortValue;
            bValue = b.upnl.sortValue;
            break;
          case 'range':
            aValue = a.range.sortValue;
            bValue = b.range.sortValue;
            break;
          default:
            return 0;
        }

        if (typeof aValue === 'string') {
          const comparison = aValue.localeCompare(bValue);
          return this.sortDirection === 'asc' ? comparison : -comparison;
        } else {
          const comparison = aValue - bValue;
          return this.sortDirection === 'asc' ? comparison : -comparison;
        }
      });
    }
  },
  async mounted() {
    await this.loadData();
    console.log("just using refresh")
    setTimeout(() => {
      console.log("reload data after 10min")
      this.startAutoRefresh();

    }, 60000);
  },
  beforeUnmount() {
    this.stopAutoRefresh();
  },
  async created() {
    this.tokenService = getTokenService();
    await this.tokenService.init();
  },
  methods: {
    async loadData() {
      try {
        if (this.isInitialLoad) {
          this.loading = true;
        }
        this.error = null;

        let data;
        if (this.dataFunction) {
          data = await this.dataFunction();
        } else {
          data = await this.fetchPositionsData();
        }

        this.positionsData = data;
        this.tempPositionsData = [...data];
        const updatedPositions = await Promise.all(
          this.tempPositionsData.map(async (position) => {
            const token1 = await this.getTokenInfoInternal(position.tokenX.toString());
            const token2 = await this.getTokenInfoInternal(position.tokenY.toString());

            return {
              ...position,
              token1,
              token2
            };
          })
        );

        this.tempPositionsData = updatedPositions;
        console.log("🚀 ~ loadData ~ this.tempPositionsData:", this.tempPositionsData)

        if (this.isInitialLoad) {
          this.isInitialLoad = false;
        }

      } catch (error) {
        console.error('Error loading positions:', error);
        this.error = error.message || 'Failed to load positions';
      } finally {
        this.loading = false;
      }
    },
    async preloadTokenInfo(positions) {
      // Collect all unique token addresses
      const tokenAddresses = new Set();

      positions.forEach(position => {
        const tokenX = position.tokenX;
        const tokenY = position.tokenY;

        if (tokenX) tokenAddresses.add(tokenX);
        if (tokenY) tokenAddresses.add(tokenY);
      });

      console.log(`Pre-loading info for ${tokenAddresses.size} unique tokens...`);

      // Fetch all token info in batch
      const addresses = Array.from(tokenAddresses);
      const tokenInfos = await this.tokenService.getMultipleTokens(addresses);

      // Cache the results
      this.tokenCache = { ...this.tokenCache, ...tokenInfos };

      console.log('Token info pre-loading completed');
    },
    async fetchPositionsData() {
      const { main } = await import('~/utils/src/index.js');
      const data = await main();
      console.log("data------>", data);
      return data.positions || [];
    },

    async getTokenInfoInternal(tokenAddress) {
      console.log(tokenAddress);
      let icon;
      if (tokenAddress === "So11111111111111111111111111111111111111112") { icon = 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png' }
      icon = `https://dd.dexscreener.com/ds-data/tokens/solana/${tokenAddress}.png`;
      try {
        // ✅ Actually fetch the data from the API
        const response = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${tokenAddress}`);

        // Check if the request was successful
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Parse the JSON response
        const data = await response.json();

        // console.log('API Response:', data);
        // console.log('Pairs:', data.pairs);

        // Check if pairs exist
        if (!data.pairs || data.pairs.length === 0) {
          console.log('No pairs found for this token');
          return null;
        }

        const pair = data.pairs[0];

        let symbol;
        let name;

        // ✅ Use strict equality and toLowerCase for better comparison
        if (pair.baseToken.address.toLowerCase() === tokenAddress.toLowerCase()) {
          symbol = pair.baseToken.symbol;
          name = pair.baseToken.name;
        } else {
          symbol = pair.quoteToken.symbol;
          name = pair.quoteToken.name;
        }
        if (tokenAddress == "So11111111111111111111111111111111111111112") { icon = 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png' }
        return {
          symbol,
          name,
          icon,
          address: tokenAddress,
        };

      } catch (error) {
        console.error('Error fetching token info:', error);
        return null;
      }
    },

    getDefaultTokenInfo(tokenAddress) {
      return {
        symbol: tokenAddress ? tokenAddress.slice(0, 6) + '...' : 'UNKNOWN',
        name: 'Unknown Token',
        icon: this.getDefaultIcon(),
        decimals: 9,
        verified: false
      };
    },

    getDefaultIcon() {
      return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iMTIiIGZpbGw9IiM2NjY2NjYiLz4KPHR0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0iY2VudHJhbCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0id2hpdGUiIGZvbnQtc2l6ZT0iMTAiPj88L3RleHQ+Cjwvc3ZnPg==';
    },

    handleImageError(event) {
      event.target.src = this.getDefaultIcon();
    },
    formatAge(age) {
      if (!age) return '0m';

      if (age.days > 0) {
        return `${age.days}d ${age.hours}h`;
      } else if (age.hours > 0) {
        return `${age.hours}h ${age.minutes}m`;
      } else {
        return `${age.minutes}m`;
      }
    },

    getAgeInHours(age) {
      if (!age) return 0;
      return age.days * 24 + age.hours + age.minutes / 60;
    },

    formatFeeAmount(amount) {
      if (!amount || amount === 0) return '0 SOL';
      if (amount < 0.01) return '< 0.01 SOL';
      return `${amount.toFixed(4)} SOL`;
    },

    formatPercentage(fee, total) {
      if (!fee || !total || total === 0) return '0%';
      const percentage = (fee / total) * 100;
      if (percentage < 0.01) return '< 0.01%';
      return `${percentage.toFixed(2)}%`;
    },

    formatUpnlPercentage(percentage) {
      if (!percentage || percentage === 0) return '0%';
      if (Math.abs(percentage) < 0.01) {
        return percentage > 0 ? '< 0.01%' : '< -0.01%';
      }
      return `${percentage.toFixed(2)}%`;
    },

    getUpnlColor(percentage) {
      if (!percentage || percentage === 0) return 'neutral';
      return percentage > 0 ? 'positive' : 'negative';
    },

    calculateRangePositions(priceRange, isInRange) {
      if (!priceRange) {
        return {
          startPercent: 0,
          currentPercent: 50,
          endPercent: 100
        };
      }

      const { minPrice, maxPrice, currentPrice } = priceRange;
      const range = maxPrice - minPrice;

      let currentPercent = 50;
      if (range > 0) {
        currentPercent = ((currentPrice - minPrice) / range) * 100;
        currentPercent = Math.max(0, Math.min(100, currentPercent));
      }

      let startPercent = 20;
      let endPercent = 80;

      if (isInRange === 'low') {
        currentPercent = Math.min(currentPercent, 15);
      } else if (isInRange === 'high') {
        currentPercent = Math.max(currentPercent, 85);
      }

      return {
        startPercent,
        currentPercent,
        endPercent
      };
    },

    sort(field) {
      if (this.sortField === field) {
        this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
      } else {
        this.sortField = field;
        this.sortDirection = 'asc';
      }
    },

    getSortClass(field) {
      if (this.sortField !== field) {
        return 'sort-inactive';
      }
      return this.sortDirection === 'asc' ? 'sort-asc' : 'sort-desc';
    },

    async refreshData() {
      await this.loadData();
    },

    startAutoRefresh() {
      console.log("now start reload data per 10 min")
      this.refreshInterval = setInterval(async () => {
        await this.refreshData();
      }, 60000);
    },

    stopAutoRefresh() {
      if (this.refreshInterval) {
        clearInterval(this.refreshInterval);
        this.refreshInterval = null;
      }
    }
  }
}
</script>

<style scoped>
.liquidity-table-container {
  display: flex;
  flex-direction: column;
  padding-top: 0;
  min-width: 820px;
  height: 78vh;
}

.table-wrapper {
  min-width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.table-header {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1.2fr 1.2fr 1.2fr 2fr;
  gap: 1rem;
  padding: 1rem 1.5rem;
  background: #242424;
  border-bottom: 1px solid #333;
  font-size: 0.875rem;
  font-weight: 500;
  color: #999;
  flex-shrink: 0;
}

.table-content {
  flex: 1;
  overflow-y: auto;
  min-height: 200px;
}

.loading-state,
.error-state,
.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  min-height: 200px;
}

.error-state {
  gap: 1rem;
  color: #ef4444;
  flex-direction: column;
}

.empty-state {
  color: #999;
}

.retry-button {
  background: #60a5fa;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.2s ease;
}

.retry-button:hover {
  background: #3b82f6;
}

.table-rows {
  display: flex;
  flex-direction: column;
}

.table-row {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1.2fr 1.2fr 1.2fr 2fr;
  gap: 1rem;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #2a2a2a;
  align-items: center;
  transition: background-color 0.2s ease;
}

.table-row:hover {
  background: #252525;
}

.table-row:last-child {
  border-bottom: none;
}

.cell {
  display: flex;
  align-items: center;
  font-size: 0.875rem;
}

.position-cell {
  flex-direction: row;
}

.token-pair {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.token-icons {
  position: relative;
  display: flex;
  align-items: center;
}

.token-icon {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 2px solid #1a1a1a;
}

.token-icon-overlap {
  margin-left: -8px;
}

.pair-name {
  color: #ffffff;
  font-weight: 500;
}

.age-cell {
  color: #ccc;
}

.value-cell {
  gap: 0.5rem;
  font-weight: 500;
}

.value-icon {
  width: 16px;
  height: 16px;
  border-radius: 50%;
}

.fee-cell,
.upnl-cell {
  flex-direction: column;
  align-items: flex-start;
  gap: 0.25rem;
}

.fee-amount {
  font-weight: 500;
  color: #ccc;
}

.fee-percentage {
  font-size: 0.75rem;
  color: #888;
}

.positive {
  color: #10b981 !important;
}

.negative {
  color: #ef4444 !important;
}

.neutral {
  color: #ccc !important;
}

.range-cell {
  flex-direction: column;
  gap: 0.5rem;
  width: 100%;
}

.range-bar {
  width: 100%;
}

.range-track {
  position: relative;
  height: 6px;
  background: #333;
  border-radius: 3px;
  overflow: hidden;
}

.range-fill {
  position: absolute;
  top: 0;
  height: 100%;
  background: linear-gradient(90deg, #3b82f6, #60a5fa);
  border-radius: 3px;
}

.range-indicators {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.range-indicator {
  position: absolute;
  top: 50%;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  transform: translateY(-50%) translateX(-50%);
  border: 2px solid #1a1a1a;
}

.range-start {
  background: #3b82f6;
}

.range-current {
  background: #fbbf24;
  border: 2px solid #1a1a1a;
  box-shadow: 0 0 8px rgba(251, 191, 36, 0.6);
}

.range-end {
  background: #ef4444;
}

.range-labels {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 0.5rem;
  font-size: 0.75rem;
  color: #888;
  position: relative;
  padding: 0 0.25rem;
}

.range-min {
  text-align: left;
  flex: 0 0 auto;
}

.range-max {
  text-align: right;
  flex: 0 0 auto;
}

/* Header styling */
.header-cell {
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  transition: color 0.2s ease;
}

.header-cell:hover {
  color: #ffffff;
}

.sortable {
  user-select: none;
}

.sort-icon {
  display: flex;
  align-items: center;
  margin-left: 0.5rem;
  opacity: 0.5;
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.sort-inactive {
  opacity: 0.3;
}

.sort-asc {
  opacity: 1;
  transform: rotate(0deg);
}

.sort-desc {
  opacity: 1;
  transform: rotate(180deg);
}

@media (max-width: 768px) {

  .table-header,
  .table-row {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }

  .header-cell,
  .cell {
    padding: 0.5rem 0;
    border-bottom: 1px solid #333;
  }

  .header-cell:last-child,
  .cell:last-child {
    border-bottom: none;
  }
}
</style>