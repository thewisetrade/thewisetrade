<template>
<div>
  <Dropdown
    :values="walletOptions"
    placeholder="Select a wallet"
    v-model="selectedWallet"
    v-if="wallets.length > 0"
  />
  <div v-else>
    No wallets found, please <NuxtLink to="/dlmm-wallets">add a wallet first</NuxtLink>
  </div>
</div>
</template>

<script setup>
const loading = ref(false)
const wallets = ref([])
const selectedWallet  = defineModel()

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
    wallets.value = addressesData.map(item => ({
      id: item.id,
      name: item.name || item.domain || item.address,
      domain: item.domain,
      address: item.address,
      groupTag: item.groupTag || null
    }))
  } catch (error) {
    console.error('Error loading data:', error)
    console.error('Make sure you have imported the database functions and they are working properly')
  } finally {
    loading.value = false
  }
}



onMounted(async () => {
  await loadData()
})

const walletOptions = computed(() => {
  let walletList = wallets.value.map(wallet => ({
    value: wallet.address,
    text: wallet.name
  }))
  if (props.withAllWallets) {
    walletList = walletList.concat({
      value: 'All wallets',
      text: 'All wallets'
    })
  }
  return walletList
})
</script>
