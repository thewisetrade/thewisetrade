import path from 'path'
import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  target: 'static',
  ssr: true,

  devServer: {
    port: 3010
  },

  app: {
    head: {
      meta: [
          { charset: 'utf-8' },
          { name: 'viewport', content: 'width=device-width, initial-scale=1' },
          { name: 'keywords', content:'liquidity providing solana trading' },
          { name:'og:title', content: 'The Wise Trade - Empower Your Cryptos With Liquidity Providing' },
          { name:'og:locale', content: 'en_US' },
          { name:'twitter:card', content: 'summary' },
          { name:'twitter:url', content: 'http://twitter.com/defilogist' },
          { name:'twitter:title', content: 'The Wise Trade - Empower Your Cryptos With Liquidity Providing' }
      ],
      script: [
      ],
      link: [
        { rel: 'icon', href: '/favicon.ico' }
      ],
      style: [
      ],
      noscript: [
        { children: 'Javascript is required' }
      ]
    }
  },

  css: ['~/assets/css/main.css'],

  postcss: {
    plugins: {
      autoprefixer: {},
    },
  },

  vite: {
    esbuild: {
      target: "esnext",
    },
    build: {
      target: "esnext",
    },
    optimizeDeps: {
      esbuildOptions: {
        target: "esnext",
      },
    },
    define: {
      "process.env.BROWSER": true,
    },
    plugins: [
      tailwindcss(),
    ],
    server: {
      fs: {
        allow: [
          // Allow serving files from one level up to the project root
          path.resolve(__dirname, '..'),
        ],
      },
    },
  },

  compatibilityDate: '2025-01-11',
  modules: ['@nuxtjs/seo'],

  site: {
    url: 'https://thewise.trade',
    name: 'The Wise Trade',
    description: 'Empower Your Cryptos With Liquidity Providing',
    defaultLocale: 'en',
  },
  robots: {
    UserAgent: '*',
    Allow: '/',
    Sitemap: 'https://thewise.trade/sitemap.xml',
    Disallow: '/portfolio'
  },
  routeRules: {
    '/portfolio': { robots: false },
  }
})
