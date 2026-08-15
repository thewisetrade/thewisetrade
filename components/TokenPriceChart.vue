<template>
  <div
    ref="rootEl"
    class="price-chart"
    :style="{ minWidth: `${width}px`, height: `${height}px` }"
  >
    <div v-if="loading" class="loading">...</div>
    <div v-else-if="error" class="error">-</div>
    <canvas
      v-show="!loading && !error"
      ref="chartCanvas"
      :width="width"
      :height="height"
    />
  </div>
</template>

<script setup>
import { getDexScreenerPairByAddress } from '@/utils/dexscreener'
import { getGeckoOhlcvPrices } from '@/utils/geckoterminal'

const props = defineProps({
  tokenAddress: {
    type: String,
    required: true,
  },
  pairAddress: {
    type: String,
    default: '',
  },
  width: {
    type: Number,
    default: 120,
  },
  height: {
    type: Number,
    default: 40,
  },
  showMinus50Line: {
    type: Boolean,
    default: false,
  },
})

const rootEl = ref(null)
const chartCanvas = ref(null)
const loading = ref(true)
const error = ref(false)
const priceData = ref([])
// Index à partir duquel les points proviennent de vraies données. Tout ce qui
// précède est extrapolé et sera tracé en pointillés gris. 0 = courbe entièrement
// réelle, ce qui est le cas de l'OHLCV GeckoTerminal.
const extrapolatedUntil = ref(0)
const hasFetched = ref(false)
let observer = null

// DexScreener renvoie des pourcentages aberrants sur les pools récents ou peu
// profonds (relevé en production : h1 = 258302). Une seule ancre absurde suffit
// à écraser l'échelle du graphe, puisque drawChart cale son min/max sur les
// valeurs extrêmes — on borne donc l'écart au prix courant.
const MAX_ANCHOR_RATIO = 20

const priceFromChange = (currentPrice, changePct) => {
  if (!Number.isFinite(changePct)) return null
  const denominator = 1 + changePct / 100
  if (!Number.isFinite(denominator) || Math.abs(denominator) < 1e-9) return null
  const price = currentPrice / denominator
  if (!(price > 0)) return null

  const ratio = price / currentPrice
  if (ratio > MAX_ANCHOR_RATIO || ratio < 1 / MAX_ANCHOR_RATIO) return null

  return price
}

// DexScreener m5/h1/h6/h24 fallback when Gecko is rate-limited
const buildSyntheticPrices = (pair) => {
  const currentPrice = parseFloat(pair?.priceUsd)
  if (!Number.isFinite(currentPrice) || currentPrice <= 0) return null

  const pc = pair?.priceChange || {}
  const anchors = [{ hour: 0, price: currentPrice }]
  // Trié par `hour` croissant, et il doit le rester : `oldest` plus bas lit la
  // dernière ancre poussée en supposant que c'est la plus ancienne. Les fenêtres
  // absentes ou aberrantes sont écartées par priceFromChange sans casser l'ordre.
  const windows = [
    { hour: 5 / 60, change: pc.m5 },
    { hour: 1, change: pc.h1 },
    { hour: 6, change: pc.h6 },
    { hour: 24, change: pc.h24 },
  ]

  for (const window of windows) {
    const price = priceFromChange(currentPrice, window.change)
    if (price) anchors.push({ hour: window.hour, price })
  }

  if (anchors.length < 2) return null

  const oldest = anchors[anchors.length - 1]
  const points = 72

  // DexScreener ne remonte pas au-delà de h-24. Le graphe couvre 72 h, donc le
  // segment plus ancien est comblé en répétant le prix de l'ancre la plus vieille
  // — soit une droite parfaitement plate sur les deux tiers gauches. On mémorise
  // l'index où commencent les données réellement connues pour que drawChart
  // distingue les deux parties au lieu de les présenter comme une seule courbe.
  const knownFromIndex =
    oldest.hour < 72 ? Math.ceil(((72 - oldest.hour) / 72) * (points - 1)) : 0

  if (oldest.hour < 72) {
    anchors.push({ hour: 72, price: oldest.price })
  }

  anchors.sort((a, b) => b.hour - a.hour)

  const prices = []

  for (let i = 0; i < points; i++) {
    const hourAgo = 72 - (i / (points - 1)) * 72

    let left = anchors[0]
    let right = anchors[anchors.length - 1]
    for (let j = 0; j < anchors.length - 1; j++) {
      if (hourAgo <= anchors[j].hour && hourAgo >= anchors[j + 1].hour) {
        left = anchors[j]
        right = anchors[j + 1]
        break
      }
    }

    const span = left.hour - right.hour || 1
    const t = Math.min(1, Math.max(0, (left.hour - hourAgo) / span))
    const logPrice = Math.log(left.price) * (1 - t) + Math.log(right.price) * t
    prices.push(Math.exp(logPrice))
  }

  return { prices, knownFromIndex }
}

const showPrices = async (prices, knownFromIndex = 0) => {
  if (!prices?.length) return false
  priceData.value = prices
  extrapolatedUntil.value = knownFromIndex
  loading.value = false
  error.value = false
  await nextTick()
  drawChart()
  return true
}

const fetchPriceData = async () => {
  if (!props.pairAddress) {
    error.value = true
    loading.value = false
    return
  }

  try {
    loading.value = true
    error.value = false
    hasFetched.value = true

    // 1) Dex fallback first — always something on screen even if Gecko is blocked
    let synthetic = null
    try {
      const pair = await getDexScreenerPairByAddress(props.pairAddress)
      synthetic = buildSyntheticPrices(pair)
      if (synthetic) {
        await showPrices(synthetic.prices, synthetic.knownFromIndex)
      }
    } catch (err) {
      console.warn('DexScreener fallback failed:', err)
    }

    // 2) Upgrade to real 72h OHLCV when Gecko allows it
    const prices = await getGeckoOhlcvPrices(props.pairAddress)
    if (await showPrices(prices)) return

    if (!synthetic) {
      throw new Error('No price data available')
    }
  } catch (err) {
    console.error('Error fetching price data:', err)
    if (priceData.value.length === 0) {
      error.value = true
    }
  } finally {
    loading.value = false
  }
}

const drawChart = () => {
  if (!chartCanvas.value || priceData.value.length === 0) return

  const canvas = chartCanvas.value
  const ctx = canvas.getContext('2d')
  const width = canvas.width
  const height = canvas.height

  ctx.clearRect(0, 0, width, height)

  const prices = priceData.value
  const currentPrice = prices[prices.length - 1]
  const rawMin = Math.min(...prices)
  const rawMax = Math.max(...prices)
  const minPrice = props.showMinus50Line ? 0 : rawMin * 0.98
  const maxPrice = props.showMinus50Line ? rawMax : rawMax * 1.02
  const priceRange = maxPrice - minPrice || 1

  // Borné : une donnée synthétique plus courte que prévu ne doit pas vider le
  // segment réel, seul porteur de la couleur et du remplissage.
  const known = Math.min(
    Math.max(extrapolatedUntil.value, 0),
    prices.length - 1,
  )

  const xAt = (index) => (index / (prices.length - 1)) * width
  const yAt = (index) =>
    height - ((prices[index] - minPrice) / priceRange) * height

  // La tendance se lit sur les données réelles uniquement : inclure la partie
  // extrapolée fausserait la couleur du graphe.
  const priceChange = prices[prices.length - 1] - prices[known]
  const isPositive = priceChange >= 0
  const color = isPositive ? '#3DDC84' : '#FF4757'

  if (known > 0) {
    ctx.save()
    ctx.strokeStyle = '#666'
    ctx.lineWidth = 1
    ctx.setLineDash([3, 3])
    ctx.beginPath()
    for (let index = 0; index <= known; index++) {
      if (index === 0) ctx.moveTo(xAt(index), yAt(index))
      else ctx.lineTo(xAt(index), yAt(index))
    }
    ctx.stroke()
    ctx.restore()
  }

  ctx.strokeStyle = color
  ctx.lineWidth = 2
  ctx.beginPath()
  for (let index = known; index < prices.length; index++) {
    if (index === known) ctx.moveTo(xAt(index), yAt(index))
    else ctx.lineTo(xAt(index), yAt(index))
  }
  ctx.stroke()

  // Le remplissage se referme sur le début du segment réel, pas sur le bord
  // gauche, pour ne pas colorer la zone extrapolée.
  ctx.lineTo(width, height)
  ctx.lineTo(xAt(known), height)
  ctx.closePath()
  ctx.fillStyle = isPositive
    ? 'rgba(61, 220, 132, 0.22)'
    : 'rgba(255, 71, 87, 0.22)'
  ctx.fill()

  if (props.showMinus50Line && currentPrice > 0) {
    const percentages = [0.5, 0.25]
    const labels = ['-50%', '-75%']

    percentages.forEach((percentage, index) => {
      const linePrice = currentPrice * percentage
      const lineY = height - ((linePrice - minPrice) / priceRange) * height

      if (lineY >= 0 && lineY <= height) {
        ctx.strokeStyle = '#888'
        ctx.lineWidth = 1
        ctx.setLineDash([4, 4])
        ctx.beginPath()
        ctx.moveTo(0, lineY)
        ctx.lineTo(width, lineY)
        ctx.stroke()
        ctx.setLineDash([])

        ctx.fillStyle = '#888'
        ctx.font = '10px sans-serif'
        ctx.textAlign = 'left'
        ctx.fillText(labels[index], 4, lineY - 4)
      }
    })
  }
}

const observeVisibility = () => {
  if (!rootEl.value || typeof IntersectionObserver === 'undefined') {
    fetchPriceData()
    return
  }

  observer = new IntersectionObserver(
    (entries) => {
      const visible = entries.some((entry) => entry.isIntersecting)
      if (!visible || hasFetched.value) return
      fetchPriceData()
      if (observer) {
        observer.disconnect()
        observer = null
      }
    },
    {
      rootMargin: '0px',
      threshold: 0.15,
    },
  )

  observer.observe(rootEl.value)
}

onMounted(() => {
  observeVisibility()
})

onUnmounted(() => {
  if (observer) {
    observer.disconnect()
    observer = null
  }
})

watch(
  () => [props.tokenAddress, props.pairAddress, props.showMinus50Line],
  () => {
    hasFetched.value = false
    priceData.value = []
    extrapolatedUntil.value = 0
    loading.value = true
    error.value = false
    if (observer) {
      observer.disconnect()
      observer = null
    }
    observeVisibility()
  },
)

watch(
  () => [props.width, props.height],
  () => {
    if (priceData.value.length > 0) {
      drawChart()
    }
  },
  // `flush: 'post'` est obligatoire : en flush 'pre' (défaut), drawChart tourne
  // avant que Vue applique le nouvel attribut `width` du canvas, et affecter
  // canvas.width réinitialise le bitmap — le tracé serait effacé aussitôt.
  { flush: 'post' },
)
</script>

<style scoped>
.price-chart {
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading,
.error {
  color: #888;
  font-size: 0.9em;
}

canvas {
  display: block;
}
</style>
