<template>
  <Loader class="" v-if="props.loading" />

  <div class="flex flex-row gap-2" v-else-if="isWalletAddressValid">
    <div class="flex flex-row gap-2">
      <div class="wallet-address-container">
        <div class="current-wallet-address">
          <div>{{ domainName ? domainName : props.currentWalletAddress }}</div>
          <span class="text-sm close-button" @click="resetWalletAddress">
            <XMarkIcon class="w-3 h-3" />
          </span>
        </div>
      </div>
    </div>
  </div>

  <div v-else>
    <div
      class="flex wallet-address-container gap-2"
      v-show="!isWalletAddressValid && !loading"
    >
      <div class="pl-2">Enter your wallet address</div>

      <div class="flex flex-row gap-2">
        <input
          ref="walletAddressInput"
          class="input w-full max-w-md border-2 border-gray-300 rounded-md p-2"
          type="text"
          v-model="walletAddress"
        />
      </div>

      <div class="error-message text-red-500 pl-2" v-if="errors.invalidAddress">
        Invalid wallet address
      </div>

      <div class="error-message text-red-500 pl-2" v-if="errors.invalidDomain">
        Invalid domain name
      </div>
      <!--div class="domain-name text-green-500 pl-2" v-if="domainName">
      {{ domainName }}
    </div-->
    </div>
  </div>
</template>

<script setup>
import { XMarkIcon } from '@heroicons/vue/24/outline'
import { useTemplateRef } from 'vue'

const props = defineProps({
  currentWalletAddress: {
    type: String,
    required: true,
  },
  loading: {
    type: Boolean,
    default: false,
  },
})

let emitedWalletAddress = ''

const emit = defineEmits({
  resetWalletAddress: () => true,
  walletAddressChanged: (payload) => true,
})

const walletAddress = ref('')
const domainName = ref('')
const errors = ref({
  invalidAddress: false,
  invalidDomain: false,
})

const walletAddressInput = useTemplateRef('walletAddressInput')

onMounted(() => {
  walletAddress.value = props.currentWalletAddress
  walletAddressInput?.value?.focus()
})

const isWalletAddressValid = computed(() => {
  return (
    walletAddress.value &&
    walletAddress.value !== null &&
    walletAddress.value !== 'undefined'
  )
})

const checkWalletAddress = async () => {
  errors.value.invalidAddress = false
  errors.value.invalidDomain = false
  const { solanaDomain, solanaAddress, wrongAddress, wrongDomain } =
    await validateWalletAddress(walletAddress.value)
  domainName.value = solanaDomain
  console.log("🚀 ~ checkWalletAddress ~ solanaDomain:", solanaDomain)
  
  errors.value.invalidAddress = wrongAddress
  errors.value.invalidDomain = wrongDomain
  if (
    !errors.value.invalidAddress &&
    !errors.value.invalidDomain &&
    walletAddress.value.length > 0 &&
    solanaAddress !== props.currentWalletAddress
  ) {
    console.log('walletAddressChanged', solanaAddress)
    await storeAddress(solanaAddress, solanaDomain, "none");
    emitedWalletAddress = solanaAddress
    emit('walletAddressChanged', {
      address: solanaAddress,
      domain: solanaDomain,
    })
  }
}

const resetWalletAddress = () => {
  walletAddress.value = ''
  domainName.value = ''
  errors.value.invalidAddress = false
  errors.value.invalidDomain = false
  emit('walletAddressChanged', '')
  nextTick(() => {
    walletAddressInput?.value?.focus()
  })
}

watch(walletAddress, (newVal) => {
  if (emitedWalletAddress !== newVal) {
    checkWalletAddress()
  }
})

watch(
  () => props.currentWalletAddress,
  (newVal) => {
    walletAddress.value = newVal
  },
)
</script>

<style scoped>
.current-wallet-address {
  display: inline-block;
  font-size: 1.4em;
  font-weight: bold;
  background: #00000a;
  border: 3px solid #445;
  border-radius: 10px;
  padding: 0.5em 1em;
  position: relative;
  text-align: left;
  max-width: 600px;

  .explainer {
    font-size: 0.7em;
    font-weight: normal;
    font-style: italic;
  }
}

.wallet-address-container {
  flex-direction: column;
  font-size: 0.8em;
  font-weight: bold;
  width: 400px;

  input {
    font-size: 1.1em;
    border-radius: 10px;
    border: 3px solid #445;
    padding: 0.5em;
    text-align: left;

    &:focus {
      border: 3px solid #686;
      outline: none;
      transition: all 0.5s ease;
    }
  }
}

.close-button {
  cursor: pointer;
  position: absolute;
  right: 2px;
  top: 2px;
}
</style>
