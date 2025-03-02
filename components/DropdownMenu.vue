<template>
  <div class="relative group">
    <span class="cursor-pointer title text-purple font-bold text-darkblue">
      {{ title }}
    </span>
    <div class="submenu absolute mt-2 w-64 bg-paper rounded-md shadow-lg ring-1 ring-black ring-opacity-5 invisible group-hover:visible hover:visible opacity-0 group-hover:opacity-100 hover:opacity-100 transition-all duration-100 z-10">
      <div class="py-1">
        <NuxtLink
          class="entry block px-4 py-2 text-sm text-gray-700"
          :key="item.to"
          :to="item.to"
          :target="item.external ? '_blank' : null"
          v-for="item in items"
        >
          <span class="entry mr-1">{{ item.label }}</span>
          <span v-if="item.external" >↗</span>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    required: true
  },
  items: {
    type: Array,
    required: true,
    validator: (value) => value.every(item => 'to' in item && 'label' in item)
  }
});
</script>

<style scoped>
.entry:hover {
  color: #8e83f3;
}

.submenu {
  border: 3px solid #4e43A3;
  left: -20px;
  z-index: 100;
}
</style>
