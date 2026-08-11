<template>
  <div class="wallet-selector">
    <Dropdown
      v-if="wallets.length > 0"
      compact
      :values="walletOptions"
      placeholder="Select a wallet"
      v-model="selectedWallet"
    />
    <div v-else class="wallet-empty">
      No wallets found, please
      <NuxtLink to="/dlmm-wallets">add a wallet first</NuxtLink>
    </div>
  </div>
</template>

<script setup>
const loading = ref(false)
const wallets = ref([])
const selectedWallet = defineModel()

const props = defineProps({
  withAllWallets: {
    type: Boolean,
    default: false,
  },
})

const loadData = async () => {
  try {
    loading.value = true
    const addressesData = await getAllAddresses()
    wallets.value = addressesData.map((item) => ({
      id: item.id,
      name: item.name || item.domain || item.address,
      domain: item.domain,
      address: item.address,
      groupTag: item.groupTag || null,
    }))
  } catch (error) {
    console.error('Error loading data:', error)
    console.error(
      'Make sure you have imported the database functions and they are working properly',
    )
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await loadData()
})

const walletOptions = computed(() => {
  const walletList = wallets.value.map((wallet) => ({
    value: wallet.address,
    text: wallet.name,
  }))
  if (props.withAllWallets) {
    return [{ value: 'All wallets', text: 'All wallets' }, ...walletList]
  }
  return walletList
})
</script>

<style scoped>
.wallet-selector {
  display: inline-flex;
  align-items: center;
  flex-shrink: 0;
}

.wallet-empty {
  font-size: 0.85em;
  color: #9aa0b8;
  white-space: nowrap;
}
</style>
