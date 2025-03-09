<template>
<div class="p-3 pb-1 navigation bg-paper sticky top-0 flex">
  <div class="w-full flex m-auto pb-3">
  <div class="flex items-center">
    <NuxtLink
      class="text-blue hover:text-darkblue"
      to="/"
    >
      <img class="logo" src="~/assets/images/logo.png" width="30" />
    </NuxtLink>
  </div>

  <div class="flex flex-1 items-center justify-center">

    <DropdownMenu
      class="ml-8"
      title="Liquidity Providing"
      :items="[
        { to: '/dlmm-guide', label: 'DLMMs Guide' },
        { to: '/dlmm-guide-2', label: 'DLMMs Tools' },
        { to: '/dlmm-guide-multidays', label: 'DLMMs Multiday Positions' },
        { to: '/dlmm-pool-finder', label: 'DLMMs Pool Finder' }
      ]"
    />

    <DropdownMenu
      class="ml-8"
      title="SOL Staking"
      :items="[
        { to: '/sanctum', label: 'Sanctum Staking' },
        { to: '/lsts', label: 'Sanctum LST Interest Rates' },
      ]"
    />

    <DropdownMenu
      class="ml-8"
      title="Automation"
      :items="[
        { to: 'https://github.com/defilogist/sanctum-py', label: 'Sanctum Python Client', external: true },
        { to: 'https://github.com/defilogist/sanctum-js', label: 'Sanctum Javascript Client', external: true }
      ]"
    />

    <DropdownMenu
      class="ml-8"
      title="About"
      :items="[
        { to: '/why', label: 'Why' },
        { to: '/about', label: 'About Author' },
        { to: '/archives', label: 'Archives' },
      ]"
    />
  </div>

  <div class="flex links">
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
</style>
