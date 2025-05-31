<template>
  <div class="flex flex-col h-screen main">
    <Navigation />
    <div class="content" ref="contentDiv">
      <div
        class="apps-navigation flex-column gap-3 grid py-2 pl-2 left-0 fixed"
      >
        <div class="flex flex-row gap-2 text-gray-500 hover:text-gray-100">
          <NuxtLink
            class="flex flex-row gap-2 items-center app-link"
            to="/dlmm-pool-finder"
            active-class="active"
          >
            <MagnifyingGlassIcon class="size-4" />
            <span class="text-sm">Pool Finder</span>
          </NuxtLink>
        </div>
        <div class="flex flex-row gap-2 text-gray-500 hover:text-gray-100">
          <NuxtLink
            class="flex flex-row gap-2 items-center app-link"
            to="/dlmm-performance"
            active-class="active"
          >
            <ChartBarIcon class="size-4" />
            <span class="text-sm">Performance</span>
          </NuxtLink>
        </div>
        <div class="flex flex-row gap-2 text-gray-500 hover:text-gray-100">
          <NuxtLink
            class="flex flex-row gap-2 items-center app-link"
            to="/dlmm-opened-pools"
            active-class="active"
          >
            <LockOpenIcon class="size-4" />
            <span class="text-sm">Positions</span>
          </NuxtLink>
        </div>

      </div>
      <div
        class="app-container container max-w-screen-md mx-auto p-8 bg-paper shadow-md rounded-lg mt-8"
      >
        <slot />
      </div>
    </div>
    <ModalsContainer />
  </div>
</template>

<script setup>
import { MagnifyingGlassIcon, ChartBarIcon, LockOpenIcon  } from '@heroicons/vue/24/solid'
import { ModalsContainer } from 'vue-final-modal'
</script>

<style scoped>
.main {
  overflow-y: hidden;
}

.app-container {
  min-width: 1050px;
  border: 2px solid #223;
}

.content {
  overflow-y: auto;
}

.main {
  background-color: #000;
}

.apps-navigation {
  top: 60px;
  width: 140px;
}

.active {
  background-color: #223;
  border-radius: 8px;
  color: #fff;
}

.app-link {
  width: 130px;
  padding: 8px 8px;
}

@media (max-width: 1200px) {
  .apps-navigation {
    display: none;
  }
}

@media (max-width: 1400px) {
  .apps-navigation {
    .app-link {
      width: 35px;
    }

    .text-sm {
      display: none;
    }
  }
}
</style>
