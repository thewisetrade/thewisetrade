export const SHARE_CARD_WIDTH = 1200
export const SHARE_CARD_HEIGHT = 630
export const SHARE_PAGE_URL = 'https://thewise.trade/dlmm-performance'

const drawRoundedRect = (ctx, x, y, width, height, radius) => {
  const r = Math.min(radius, width / 2, height / 2)
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + width - r, y)
  ctx.quadraticCurveTo(x + width, y, x + width, y + r)
  ctx.lineTo(x + width, y + height - r)
  ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height)
  ctx.lineTo(x + r, y + height)
  ctx.quadraticCurveTo(x, y + height, x, y + height - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}

const drawOverlayPanel = (ctx, x, y, width, height) => {
  ctx.save()
  drawRoundedRect(ctx, x, y, width, height, 14)
  ctx.fillStyle = 'rgba(10, 10, 12, 0.72)'
  ctx.fill()
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)'
  ctx.lineWidth = 1
  ctx.stroke()
  ctx.restore()
}

const truncateText = (ctx, text, maxWidth) => {
  if (ctx.measureText(text).width <= maxWidth) return text
  let trimmed = text
  while (
    trimmed.length > 1 &&
    ctx.measureText(`${trimmed}...`).width > maxWidth
  ) {
    trimmed = trimmed.slice(0, -1)
  }
  return `${trimmed}...`
}

const loadImage = (src) =>
  new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = reject
    image.src = src
  })

const formatAmount = (value, quoteToken) => {
  if (quoteToken === 'USDC' || quoteToken === 'EURC') {
    return Math.round(value).toLocaleString('fr-FR')
  }
  return value.toLocaleString('fr-FR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

const drawContainImage = (ctx, image, width, height) => {
  const scale = Math.min(width / image.width, height / image.height)
  const drawWidth = image.width * scale
  const drawHeight = image.height * scale
  const drawX = (width - drawWidth) / 2
  const drawY = (height - drawHeight) / 2
  ctx.drawImage(image, drawX, drawY, drawWidth, drawHeight)
}

const drawCenteredText = (ctx, text, centerX, centerY) => {
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(text, centerX, centerY)
  ctx.textAlign = 'left'
  ctx.textBaseline = 'alphabetic'
}

const drawDoubleChevronUp = (ctx, x, y, size, color) => {
  ctx.save()
  ctx.strokeStyle = color
  ctx.lineWidth = 2.4
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  const half = size * 0.42
  const step = size * 0.34

  ctx.beginPath()
  ctx.moveTo(x - half, y + step * 1.5)
  ctx.lineTo(x, y + step * 0.35)
  ctx.lineTo(x + half, y + step * 1.5)
  ctx.stroke()

  ctx.beginPath()
  ctx.moveTo(x - half, y + step * 2.85)
  ctx.lineTo(x, y + step * 1.7)
  ctx.lineTo(x + half, y + step * 2.85)
  ctx.stroke()
  ctx.restore()
}

const drawDoubleChevronDown = (ctx, x, y, size, color) => {
  ctx.save()
  ctx.strokeStyle = color
  ctx.lineWidth = 2.4
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  const half = size * 0.42
  const step = size * 0.34

  ctx.beginPath()
  ctx.moveTo(x - half, y + step * 0.35)
  ctx.lineTo(x, y + step * 1.5)
  ctx.lineTo(x + half, y + step * 0.35)
  ctx.stroke()

  ctx.beginPath()
  ctx.moveTo(x - half, y + step * 1.7)
  ctx.lineTo(x, y + step * 2.85)
  ctx.lineTo(x + half, y + step * 1.7)
  ctx.stroke()
  ctx.restore()
}

const drawStatValue = (ctx, stat, statX, topY, statWidth) => {
  const valueY = topY + 58
  const paddingX = 18
  const maxWidth = statWidth - paddingX * 2
  ctx.font = '700 22px ui-sans-serif, system-ui, sans-serif'
  ctx.fillStyle = stat.color

  if (stat.pnlDirection) {
    const iconSize = 16
    const iconGap = 8
    const valueText = truncateText(
      ctx,
      stat.value,
      maxWidth - iconSize - iconGap,
    )
    const textWidth = ctx.measureText(valueText).width
    const blockWidth = iconSize + iconGap + textWidth
    const blockStart = statX + (statWidth - blockWidth) / 2
    const iconX = blockStart + iconSize / 2
    const iconY = valueY - 14

    if (stat.pnlDirection === 'up') {
      drawDoubleChevronUp(ctx, iconX, iconY, iconSize, stat.color)
    } else {
      drawDoubleChevronDown(ctx, iconX, iconY, iconSize, stat.color)
    }

    ctx.fillText(valueText, blockStart + iconSize + iconGap, valueY)
    return
  }

  const valueText = truncateText(ctx, stat.value, maxWidth)
  ctx.fillText(valueText, statX + paddingX, valueY)
}

const drawStatsRow = (ctx, stats, cardWidth, topY) => {
  const statWidth = 250
  const statHeight = 78
  const statGap = 14
  const statsTotalWidth =
    stats.length * statWidth + (stats.length - 1) * statGap
  const statsLeft = (cardWidth - statsTotalWidth) / 2

  stats.forEach((stat, index) => {
    const statX = statsLeft + index * (statWidth + statGap)
    drawOverlayPanel(ctx, statX, topY, statWidth, statHeight)

    ctx.fillStyle = '#888'
    ctx.font = '600 12px ui-sans-serif, system-ui, sans-serif'
    ctx.fillText(stat.label, statX + 18, topY + 26)

    drawStatValue(ctx, stat, statX, topY, statWidth)
  })

  return topY + statHeight
}

const drawPeriodCapsule = (ctx, periodLabel, cardWidth) => {
  const periodText = periodLabel || 'Period'
  ctx.font = '600 18px ui-sans-serif, system-ui, sans-serif'
  const textWidth = ctx.measureText(periodText).width
  const panelPaddingX = 28
  const panelWidth = Math.min(textWidth + panelPaddingX * 2, cardWidth - 80)
  const panelHeight = 46
  const panelX = (cardWidth - panelWidth) / 2
  const panelY = 28

  drawOverlayPanel(ctx, panelX, panelY, panelWidth, panelHeight)

  ctx.fillStyle = '#f0f0f0'
  drawCenteredText(
    ctx,
    truncateText(ctx, periodText, panelWidth - panelPaddingX * 2),
    cardWidth / 2,
    panelY + panelHeight / 2,
  )

  return panelY + panelHeight
}

export const buildShareTweetText = ({
  walletLabel,
  periodLabel,
  quoteToken,
  winRate,
  totalProfit,
  totalFees,
}) => {
  const pnlSign = totalProfit >= 0 ? '+' : ''
  const pnl = `${pnlSign}${formatAmount(totalProfit, quoteToken)} ${quoteToken}`
  const fees = `${formatAmount(totalFees, quoteToken)} ${quoteToken}`
  const win = `${(winRate * 100).toFixed(1)}%`

  return [
    `My Meteora DLMM performance (${walletLabel})`,
    `${periodLabel}`,
    `Win rate ${win} | P&L ${pnl} | Fees ${fees}`,
    SHARE_PAGE_URL,
  ].join('\n')
}

export const getShareTweetUrl = (text) =>
  `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`

export const renderPerformanceShareCard = async ({
  chartImageUrl,
  periodLabel,
  quoteToken,
  winRate,
  totalProfit,
  totalFees,
  winRateColor,
}) => {
  const canvas = document.createElement('canvas')
  canvas.width = SHARE_CARD_WIDTH
  canvas.height = SHARE_CARD_HEIGHT
  const ctx = canvas.getContext('2d')

  const profitPositive = totalProfit >= 0
  const profitColor = profitPositive ? '#3DDC84' : '#FF4757'

  ctx.fillStyle = '#070708'
  ctx.fillRect(0, 0, SHARE_CARD_WIDTH, SHARE_CARD_HEIGHT)

  if (chartImageUrl) {
    const chartImage = await loadImage(chartImageUrl)
    drawContainImage(ctx, chartImage, SHARE_CARD_WIDTH, SHARE_CARD_HEIGHT)
  }

  ctx.fillStyle = 'rgba(0, 0, 0, 0.12)'
  ctx.fillRect(0, 0, SHARE_CARD_WIDTH, SHARE_CARD_HEIGHT)

  const topGradient = ctx.createLinearGradient(0, 0, 0, 260)
  topGradient.addColorStop(0, 'rgba(6, 6, 8, 0.88)')
  topGradient.addColorStop(1, 'rgba(6, 6, 8, 0)')
  ctx.fillStyle = topGradient
  ctx.fillRect(0, 0, SHARE_CARD_WIDTH, 260)

  const bottomGradient = ctx.createLinearGradient(
    0,
    SHARE_CARD_HEIGHT - 90,
    0,
    SHARE_CARD_HEIGHT,
  )
  bottomGradient.addColorStop(0, 'rgba(6, 6, 8, 0)')
  bottomGradient.addColorStop(1, 'rgba(6, 6, 8, 0.82)')
  ctx.fillStyle = bottomGradient
  ctx.fillRect(0, SHARE_CARD_HEIGHT - 90, SHARE_CARD_WIDTH, 90)

  const periodBottom = drawPeriodCapsule(ctx, periodLabel, SHARE_CARD_WIDTH)

  const stats = [
    {
      label: 'WIN RATE',
      value: `${(winRate * 100).toFixed(2)}%`,
      color: winRateColor || '#3DDC84',
    },
    {
      label: 'P&L',
      value: `${formatAmount(totalProfit, quoteToken)} ${quoteToken}`,
      color: profitColor,
      pnlDirection: profitPositive ? 'up' : 'down',
    },
    {
      label: 'FEES',
      value: `${formatAmount(totalFees, quoteToken)} ${quoteToken}`,
      color: '#f0f0f0',
    },
  ]

  drawStatsRow(ctx, stats, SHARE_CARD_WIDTH, periodBottom + 14)

  ctx.fillStyle = 'rgba(255, 255, 255, 0.55)'
  ctx.font = '500 14px ui-sans-serif, system-ui, sans-serif'
  const footer = 'thewise.trade/dlmm-performance'
  const footerWidth = ctx.measureText(footer).width
  ctx.fillText(
    footer,
    (SHARE_CARD_WIDTH - footerWidth) / 2,
    SHARE_CARD_HEIGHT - 24,
  )

  return canvas.toDataURL('image/png')
}

export const downloadDataUrl = (dataUrl, filename) => {
  const link = document.createElement('a')
  link.href = dataUrl
  link.download = filename
  link.click()
}

export const copyDataUrlToClipboard = async (dataUrl) => {
  const response = await fetch(dataUrl)
  const blob = await response.blob()
  await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
}
