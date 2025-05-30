<template>
<div class="p-3 pb-1 navigation bg-paper sticky top-0 flex">
  <div class="w-full flex m-auto pb-3">
  <div class="flex items-center">
    <NuxtLink
      class="text-blue hover:text-darkblue"
      to="/"
    >
      <img class="logo" src="~/assets/images/title.png" width="160" />
    </NuxtLink>
  </div>

  <div class="flex flex-1 items-center justify-center menus">

    <DropdownMenu
      class="menus-item"
      title="DLMMs Guide"
      :items="[
        { to: '/dlmm-guide', label: 'DLMMs Getting Started' },
        { to: '/dlmm-guide-2', label: 'DLMMs Apps' },
        { to: '/dlmm-guide-multidays', label: 'DLMMs Multiday Positions' },
        { to: '/dlmm-guide-risk-management', label: 'DLMMs Risk Management' },

      ]"
    />

    <DropdownMenu
      class="ml-8 menus-item"
      title="DLMMs Tools"
      :items="[
        { to: '/dlmm-pool-finder', label: 'DLMMs Pool Finder' },
        { to: '/dlmm-performance', label: 'DLMMs Performance' },
        { to: '/dlmm-opened-pools', label: 'DLMMs Opened Position' },
      ]"
    />

    <DropdownMenu
      class="ml-8 menus-item"
      title="SOL Staking"
      :items="[
        { to: '/sanctum', label: 'Sanctum Staking' },
        { to: '/lsts', label: 'Sanctum LST Interest Rates' },
      ]"
    />

    <DropdownMenu
      class="ml-8 menus-item"
      title="About"
      :items="[
        { to: '/why', label: 'Why' },
        { to: '/about', label: 'About Author' }
      ]"
    />
  </div>

  <div class="flex links">
    <div class="flex-1"></div>
    <a
      class="mr-3"
      href="https://twitter.com/defilogist"
      target="_blank"
    >
      <img src="~/assets/images/twitter.png" width="25" />
    </a>
    <a
      href="https://github.com/defilogist"
      target="_blank"
    >
      <img src="~/assets/images/github.png" width="25" />
    </a>
  </div>
  </div>
</div>
</template>

<script setup>

</script>

<style scoped>
.navigation {
  z-index: 90;
}

.links {
  width: 160px;
}

@media screen and (max-width: 1100px) {
  .menus-item {
    display: none;
  }
}
</style>
