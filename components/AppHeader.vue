<template>
  <div class="app-header flex flex-row items-center mb-8 w-100">
    <h1 class="app-title" v-if="title">{{ title }}</h1>
    <a
      class="credit"
      :href="link"
      target="_blank"
      v-if="author"
    >
      Powered by {{ author }}
    </a>
  </div>
</template>

<script setup>
defineProps({
  link: {
    type: String
  },
  author: {
    type: String
  },
  title: {
    type: String
  }
})
</script>

<style scoped>
.app-header {
  width: 100%;
}

.app-title {
  flex: 1;
  margin: 0;
  text-align: left;
  text-transform: uppercase;
  font-size: 1.4em;
}

.credit {
  color: #CCE;
  font-size: 0.8em;
}
</style>
