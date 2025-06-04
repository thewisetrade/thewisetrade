<template>
  <div class="flex flex-row items-center mb-8">
    <div class="flex-1"></div>
    <a
      class="credit"
      :href="link"
      target="_blank"
    >
      Powered by {{ author }}
    </a>
  </div>
</template>

<script setup>
defineProps({
  link: {
    type: String,
    required: true
  },
  author: {
    type: String,
    required: true
  }
})
</script>

<style scoped>
.credit {
  color: #CCE;
  font-size: 0.8em;
}
</style>
