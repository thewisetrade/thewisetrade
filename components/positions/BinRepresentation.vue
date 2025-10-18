<template>
  <div class="bin-wrapper">
    <a
      class="flex flex-row bin-container"
      :href="`https://app.meteora.ag/dlmm/${props.positionKey}`"
      target="_blank"
    >
      <div
        :key="bin.id"
        class="bin"
        :style="binStyle(bin,index)"
        v-for="(bin, index) in props.binData"
      ></div>
    </a>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  binData: {
    type: Array,
    required: true,
  },
  positionToken1: {
    type: Object,
    required: true,
  },
  positionToken2: {
    type: Object,
    required: true,
  },
  positionKey: {
    type: String,
    required: true,
  },
})

console.log(props.positionToken1, props.positionToken2)

const maxBinXAmount = computed(() => {
  const bins = props.binData || []
  return bins.reduce((max, bin) => {
    return Math.max(max, bin.positionXAmount)
  }, 0)
})

const maxBinYAmount = computed(() => {
  const bins = props.binData || []
  return bins.reduce((max, bin) => {
    return Math.max(max, bin.positionYAmount)
  }, 0)
})

const maxBinAmount = computed(() => {
  return Math.max(maxBinXAmount.value, maxBinYAmount.value)
})

const maxBinPrice = computed(() => {
  return Math.max(...props.binData.map(bin => bin.price))
})

const binStyle = (bin, index) => {
  // console.log(bin)
  // console.log(bin.positionXAmount, bin.positionYAmount, maxBinXAmount.value, maxBinYAmount.value, index)  )
  console.log(maxBinPrice.value)
  const styles = {
    width: '3px',
  }
  if (props.binData.length > 140) {
    styles.width = '2px'
  }
  if (bin.positionXAmount > 0) {
    styles.backgroundColor = '#6f61c0'
    styles.height = `${(1 - bin.price / maxBinPrice.value) * 25}px`
  }
  if (bin.positionYAmount > 0) {
    styles.backgroundColor = '#06aed4'
    styles.height = `${(1 -bin.price / maxBinPrice.value) * 25}px`
  }
  return styles
}
</script>

<style scoped>
.bin-wrapper {
  width: 100%;
}
.bin-container {
  display: flex;
  flex-direction: row;
  align-items: end;
  justify-content: flex-start;
  width: 100%;
}
.bin {
  width: 3px;
  height: 25px;
  margin-right: 0px;
  padding: 0;
}
</style>
