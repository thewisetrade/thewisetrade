<template>
  <div class="p-3 pb-1 navigation bg-paper sticky top-0 flex">
    <div class="w-full flex m-auto pb-3">
      <div class="flex items-center">
        <NuxtLink class="text-blue hover:text-darkblue" to="/">
          <img class="logo" src="~/assets/images/title.png" width="160" />
        </NuxtLink>
      </div>

      <div class="flex flex-1 items-center justify-center menus">
        <DropdownMenu
          class="menus-item"
          title="DLMMs Guide"
          :items="[
            { to: '/dlmm-guide', label: 'DLMMs Guide' },
            { to: '/dlmm-guide-2', label: 'DLMMs Apps' },
            { to: '/dlmm-guide-multidays', label: 'DLMMs Multiday Positions' },
            {
              to: '/dlmm-guide-risk-management',
              label: 'DLMMs Risk Management',
            },
          ]"
        />

        <DropdownMenu
          class="ml-8 menus-item"
          title="DLMMs Tools"
          :items="[
            { to: '/dlmm-pool-finder', label: 'DLMM Pool Finder' },
            { to: '/dlmm-positions', label: 'DLMM Positions' },
            { to: '/dlmm-performance', label: 'DLMM Performance' },
            { to: '/dlmm-wallets', label: 'DLMM Wallets' },
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
            { to: '/about', label: 'About Author' },
          ]"
        />
      </div>

      <div class="flex links items-center justify-end gap-3">
        <a
          class="meteora-ref"
          href="https://edge.meteora.ag/ref/49QVJBQZQZ"
          target="_blank"
          rel="noopener noreferrer"
          title="Use my Meteora referral code"
        >
          <span class="meteora-ref__brand">Meteora Referral</span>
          <span class="meteora-ref__code">49QVJBQZQZ</span>
        </a>
        <a href="https://twitter.com/defilogist" target="_blank">
          <img src="~/assets/images/twitter.png" width="25" />
        </a>
        <a href="https://github.com/defilogist" target="_blank">
          <img src="~/assets/images/github.png" width="25" />
        </a>
      </div>
    </div>
  </div>
</template>

<style scoped>
.navigation {
  z-index: 90;
}

.links {
  min-width: 160px;
}

.meteora-ref {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.28rem 0.65rem 0.28rem 0.55rem;
  border-radius: 0.45rem;
  border: 1px solid rgba(247, 103, 39, 0.35);
  background: linear-gradient(
    135deg,
    rgba(247, 103, 39, 0.18),
    rgba(47, 43, 58, 0.9) 55%
  );
  color: #f3efe8;
  text-decoration: none;
  transition:
    border-color 0.2s ease,
    transform 0.2s ease,
    background 0.2s ease;
}

.meteora-ref:hover {
  border-color: rgba(247, 103, 39, 0.7);
  background: linear-gradient(
    135deg,
    rgba(247, 103, 39, 0.28),
    rgba(47, 43, 58, 1) 55%
  );
  transform: translateY(-1px);
  color: #fff;
}

.meteora-ref__brand {
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #f7824e;
}

.meteora-ref__code {
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  color: #f5f1ea;
}

@media screen and (max-width: 1100px) {
  .menus-item {
    display: none;
  }
}

@media screen and (max-width: 640px) {
  .meteora-ref__brand {
    display: none;
  }
}
</style>
