<template>
  <div class="share-wrap">
    <button
      class="share-btn"
      type="button"
      :disabled="disabled || generating"
      title="Generate share card"
      @click="openShareCard"
    >
      <ShareIcon class="share-icon" />
      <span>Share</span>
    </button>

    <div v-if="showModal" class="modal-overlay" @click="closeModal">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h3>Share performance card</h3>
          <button class="close-btn" type="button" @click="closeModal">×</button>
        </div>

        <div v-if="generating" class="modal-loading">
          <Loader />
          <span>Generating card...</span>
        </div>

        <template v-else-if="previewUrl">
          <img :src="previewUrl" alt="DLMM performance share card" class="preview" >
          <div class="modal-actions">
            <button class="action-btn x-btn" type="button" @click="shareOnX">
              Share on X
            </button>
            <button class="action-btn" type="button" @click="downloadCard">
              Download PNG
            </button>
            <button
              class="action-btn secondary"
              type="button"
              :disabled="!canCopy"
              @click="copyCard"
            >
              {{ copied ? 'Copied!' : 'Copy image' }}
            </button>
          </div>
          <p v-if="shareHint" class="share-hint">{{ shareHint }}</p>
          <p v-if="copyError" class="error-note">{{ copyError }}</p>
        </template>

        <p v-else-if="errorMessage" class="error-note">{{ errorMessage }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ShareIcon } from '@heroicons/vue/24/outline'

const shareCardApi = () => import('@/utils/performanceShareCard.client.js')

const props = defineProps({
  chartRef: {
    type: Object,
    default: null,
  },
  walletLabel: {
    type: String,
    default: '',
  },
  periodLabel: {
    type: String,
    default: '',
  },
  quoteToken: {
    type: String,
    required: true,
  },
  winRate: {
    type: Number,
    default: 0,
  },
  totalProfit: {
    type: Number,
    default: 0,
  },
  totalFees: {
    type: Number,
    default: 0,
  },
  winRateColor: {
    type: String,
    default: '#3DDC84',
  },
  disabled: {
    type: Boolean,
    default: false,
  },
})

const showModal = ref(false)
const generating = ref(false)
const previewUrl = ref('')
const errorMessage = ref('')
const copyError = ref('')
const copied = ref(false)
const canCopy = ref(false)
const shareHint = ref('')

onMounted(() => {
  canCopy.value =
    typeof window !== 'undefined' &&
    typeof navigator !== 'undefined' &&
    !!navigator.clipboard &&
    typeof ClipboardItem !== 'undefined'
})

const sanitizeFilename = (value) =>
  value.replace(/[^a-zA-Z0-9._-]+/g, '-').replace(/-+/g, '-').slice(0, 80)

const buildCard = async () => {
  generating.value = true
  errorMessage.value = ''
  copyError.value = ''
  copied.value = false
  shareHint.value = ''
  previewUrl.value = ''

  try {
    await nextTick()
    const chartImageUrl = props.chartRef?.getChartImage?.()
    if (!chartImageUrl) {
      throw new Error('Chart is not ready yet. Try again in a moment.')
    }

    const {
      renderPerformanceShareCard,
    } = await shareCardApi()

    previewUrl.value = await renderPerformanceShareCard({
      chartImageUrl,
      walletLabel: props.walletLabel || 'Wallet',
      periodLabel: props.periodLabel,
      quoteToken: props.quoteToken,
      winRate: props.winRate,
      totalProfit: props.totalProfit,
      totalFees: props.totalFees,
      winRateColor: props.winRateColor,
    })
  } catch (error) {
    errorMessage.value = error?.message || 'Could not generate share card.'
  } finally {
    generating.value = false
  }
}

const openShareCard = async () => {
  showModal.value = true
  await buildCard()
}

const closeModal = () => {
  showModal.value = false
  previewUrl.value = ''
  errorMessage.value = ''
  copyError.value = ''
  copied.value = false
  shareHint.value = ''
}

const getTweetText = async () => {
  const { buildShareTweetText } = await shareCardApi()
  return buildShareTweetText({
    walletLabel: props.walletLabel || 'Wallet',
    periodLabel: props.periodLabel,
    quoteToken: props.quoteToken,
    winRate: props.winRate,
    totalProfit: props.totalProfit,
    totalFees: props.totalFees,
  })
}

const shareOnX = async () => {
  if (!previewUrl.value) return
  shareHint.value = ''
  copyError.value = ''

  const { getShareTweetUrl, copyDataUrlToClipboard } = await shareCardApi()
  const tweetText = await getTweetText()
  window.open(getShareTweetUrl(tweetText), '_blank', 'noopener,noreferrer')

  if (canCopy.value) {
    try {
      await copyDataUrlToClipboard(previewUrl.value)
      shareHint.value =
        'Card copied to clipboard — paste it into your post on X (Ctrl+V / Cmd+V).'
    } catch {
      shareHint.value =
        'Post composer opened. Download the PNG and attach it to your post on X.'
    }
    return
  }

  shareHint.value =
    'Post composer opened. Download the PNG and attach it to your post on X.'
}

const downloadCard = async () => {
  if (!previewUrl.value) return
  const { downloadDataUrl } = await shareCardApi()
  const filename = `dlmm-performance-${sanitizeFilename(props.walletLabel || 'wallet')}.png`
  downloadDataUrl(previewUrl.value, filename)
}

const copyCard = async () => {
  if (!previewUrl.value || !canCopy.value) return
  copyError.value = ''
  try {
    const { copyDataUrlToClipboard } = await shareCardApi()
    await copyDataUrlToClipboard(previewUrl.value)
    copied.value = true
  } catch {
    copyError.value = 'Copy failed. Download the PNG instead.'
  }
}
</script>

<style scoped>
.share-wrap {
  display: inline-flex;
}

.share-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.45rem 0.85rem;
  border: 1px solid #607cf6;
  border-radius: 8px;
  background: transparent;
  color: #d8deff;
  font-size: 0.8125rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s ease, color 0.2s ease;
}

.share-btn:hover:not(:disabled) {
  background: #304ca6;
  color: #fff;
}

.share-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.share-icon {
  width: 1rem;
  height: 1rem;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 1200;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.82);
}

.modal {
  width: min(960px, 100%);
  max-height: 92vh;
  overflow: auto;
  padding: 1.25rem;
  border: 1px solid #333;
  border-radius: 14px;
  background: #141418;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.modal-header h3 {
  margin: 0;
  color: #fff;
  font-size: 1.125rem;
}

.close-btn {
  border: none;
  background: transparent;
  color: #aaa;
  font-size: 1.5rem;
  line-height: 1;
  cursor: pointer;
}

.close-btn:hover {
  color: #fff;
}

.modal-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 2rem 0;
  color: #aaa;
}

.preview {
  display: block;
  width: 100%;
  border: 1px solid #2a2a2a;
  border-radius: 10px;
}

.modal-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 1rem;
}

.action-btn {
  padding: 0.65rem 1rem;
  border: 1px solid #607cf6;
  border-radius: 8px;
  background: #304ca6;
  color: #fff;
  font-weight: 600;
  cursor: pointer;
}

.action-btn.secondary {
  background: transparent;
  color: #d8deff;
}

.action-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.action-btn.x-btn {
  background: #000;
  border-color: #333;
  color: #fff;
}

.action-btn.x-btn:hover {
  background: #111;
  border-color: #555;
}

.share-hint {
  margin: 0.75rem 0 0;
  color: #9aa7ff;
  font-size: 0.875rem;
  line-height: 1.45;
}

.error-note {
  margin: 0.75rem 0 0;
  color: #ff7a7a;
  font-size: 0.875rem;
}
</style>
