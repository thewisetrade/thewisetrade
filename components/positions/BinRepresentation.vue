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
  positionKey: {
    type: String,
    required: true,
  },
})

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

const binStyle = (bin, index) => {
  // console.log(bin)
  // console.log(bin.positionXAmount, bin.positionYAmount, maxBinXAmount.value, maxBinYAmount.value, index)
  if (bin.positionXAmount > 0) {
    return {
      backgroundColor: '#6f61c0',
      height: '25px' // `${(bin.positionXAmount / maxBinXAmount.value) * 25}px`
    }
  }
  return {
    backgroundColor: '#06aed4',
    height: '25px' // `${(bin.positionYAmount / maxBinYAmount.value) * 25}px`
  }
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
