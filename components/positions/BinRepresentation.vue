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
        :style="binStyle(bin)"
        v-for="bin in props.binData"
      ></div>
    </a>
  </div>
</template>

<script setup>
const props = defineProps({
  binData: {
    type: Object,
    required: true,
  },
  positionKey: {
    type: String,
    required: true,
  },
})

const binStyle = (bin) => {
  return {
    backgroundColor: bin.positionXAmount > 0 ? '#6f61c0' : '#06aed4',
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
  align-items: center;
  justify-content: flex-start;
  width: 100%;
}
.bin {
  width: 3px;
  height: 25px;
  margin-right: 0px;
}
</style>
