import Datafeed from './datafeed.js';
import { formatPrice } from './helpers.js';

window.tvWidget = new TradingView.widget({
	symbol: 'So11111111111111111111111111111111111111112', // default symbol
	interval: '1', // default interval
	fullscreen: true, // displays the chart in the fullscreen mode
	container: 'tv_chart_container',
	datafeed: Datafeed,
	library_path: '../charting_library_cloned_data/charting_library/',
  disabled_features: [
    "popup_hints",
    "header_symbol_search",
    "symbol_search_hot_key",
    "header_compare",
  ],
  custom_formatters: {
    priceFormatterFactory: () => {
      
      return {
        format: (price) => {   
          // return the appropriate format
          return formatPrice(price);
        },
      };
    },
  },
});