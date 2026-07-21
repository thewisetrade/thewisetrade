import path from 'path'
import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  // Keep Nuxt 3-style root directories (pages/, components/, …)
  // because this repo already has a small app/ folder for router options.
  srcDir: '.',
  dir: {
    app: 'app',
  },

  ssr: false,

  future: {
    compatibilityVersion: 4,
  },

  compatibilityDate: '2026-07-21',

  devServer: {
    port: 3010,
  },

  app: {
    head: {
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'keywords', content: 'liquidity providing solana trading' },
        {
          name: 'og:title',
          content:
            'The Wise Trade - Empower Your Cryptos With Liquidity Providing',
        },
        { name: 'og:locale', content: 'en_US' },
        { name: 'twitter:card', content: 'summary' },
        { name: 'twitter:url', content: 'http://twitter.com/defilogist' },
        {
          name: 'twitter:title',
          content:
            'The Wise Trade - Empower Your Cryptos With Liquidity Providing',
        },
      ],
      link: [{ rel: 'icon', href: '/favicon.ico' }],
      noscript: [{ children: 'Javascript is required' }],
    },
  },

  css: ['~/assets/css/main.css', 'vue-final-modal/style.css'],

  vite: {
    resolve: {
      extensions: ['.js', '.json', '.jsx', '.mjs', '.ts', '.tsx', '.vue'],
    },
    build: {
      target: 'esnext',
      commonjsOptions: {
        transformMixedEsModules: true,
      },
    },
    define: {
      'process.env.BROWSER': true,
      global: {},
    },
    plugins: [tailwindcss()],
    server: {
      fs: {
        allow: [path.resolve(__dirname, '..')],
      },
    },
  },

  plugins: [{ src: '~/plugins/buffer', mode: 'client' }],

  modules: ['@nuxtjs/seo'],

  site: {
    url: 'https://thewise.trade',
    name: 'The Wise Trade',
    description: 'Empower Your Cryptos With Liquidity Providing',
    defaultLocale: 'en',
  },

  // SPA site: these modules need SSR
  ogImage: {
    enabled: false,
  },
  schemaOrg: {
    enabled: false,
  },

  robots: {
    allow: '/',
    sitemap: 'https://thewise.trade/sitemap.xml',
  },
})
