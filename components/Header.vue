<template>
<div class="flex mb-4 items-center ">
</div>
</template>


<script setup>
import { useRoute } from 'vue-router'

function isActivePage (page) {
  const route = useRoute()
  return page === route.name
}
</script>

<style>
.logo {
  border-radius: 5px;
}

.links {
  display: flex;
}
</style>
