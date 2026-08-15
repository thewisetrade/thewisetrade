<template>
  <div class="relative group">
    <!-- Pas de classe de couleur : les titres héritent du blanc du body. Ils
         portaient `text-darkblue` (violet #5e43f3) et `text-purple` (couleur
         jamais définie dans @theme), deux règles restées sans effet tant que les
         valeurs de @theme étaient citées, donc invalides comme couleurs. -->
    <span class="cursor-pointer title font-bold">
      {{ title }}
    </span>
    <div
      class="submenu absolute mt-2 w-64 bg-paper rounded-md shadow-lg ring-1 ring-black ring-opacity-5 invisible group-hover:visible hover:visible opacity-0 group-hover:opacity-100 hover:opacity-100 transition-all duration-100 z-10"
    >
      <div class="py-1">
        <NuxtLink
          v-for="item in items"
          :key="item.to"
          class="entry block px-4 py-2 text-sm text-gray-700"
          :to="item.to"
          :target="item.external ? '_blank' : null"
        >
          <span class="entry mr-1">{{ item.label }}</span>
          <span v-if="item.external">↗</span>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    required: true,
  },
  items: {
    type: Array,
    required: true,
    validator: (value) =>
      value.every((item) => 'to' in item && 'label' in item),
  },
})
</script>

<style scoped>
.entry:hover {
  color: #8e83f3;
}

.submenu {
  border: 3px solid #4e43a3;
  left: -20px;
  z-index: 200;
}
</style>
