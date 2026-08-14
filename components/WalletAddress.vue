<template>
  <div>
    <div
      class="flex wallet-address-container gap-2"
    >
      <div class="flex flex-row gap-2">
        <input
          ref="walletAddressInput"
          v-model="walletAddress"
          class="input w-full max-w-md border-2 border-gray-300 rounded-md p-2"
          type="text"
        >
      </div>

      <div v-if="errors.invalidAddress" class="error-message text-red-500 pl-2">
        Invalid wallet address
      </div>

      <div v-if="errors.invalidDomain" class="error-message text-red-500 pl-2">
        Invalid domain name
      </div>

      <div v-if="domainName" class="domain-name text-green-500 pl-2">
        {{ domainName }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { useTemplateRef } from 'vue'

const props = defineProps({
  currentWalletAddress: {
  },
  loading: {
    type: Boolean,
    default: false,
  },
})

let emitedWalletAddress = ''

const emit = defineEmits({
  walletAddressChanged: () => true,
})

const walletAddress = ref(null)
const domainName = ref('')
const errors = ref({
  invalidAddress: false,
  invalidDomain: false,
})

const walletAddressInput = useTemplateRef('walletAddressInput')

onMounted(() => {
  walletAddress.value = props.currentWalletAddress || ''
  walletAddressInput?.value?.focus()
})

const checkWalletAddress = async () => {
  errors.value.invalidAddress = false
  errors.value.invalidDomain = false
  const { solanaDomain, solanaAddress, wrongAddress, wrongDomain } =
    await validateWalletAddress(walletAddress.value)
  domainName.value = solanaDomain

  errors.value.invalidAddress = wrongAddress
  errors.value.invalidDomain = wrongDomain
  if (
    !errors.value.invalidAddress &&
    !errors.value.invalidDomain &&
    walletAddress.value.length > 0 &&
    solanaAddress !== props.currentWalletAddress
  ) {
    emitedWalletAddress = solanaAddress
    emit('walletAddressChanged', {
      address: solanaAddress,
      domain: solanaDomain,
    })
  }
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

  .input {
    background: #0a0a0a;
    font-size: 1.1em;
    border-radius: 6px;
    border: 2px solid #445;
    padding: 12px;
    text-align: left;

    &:focus {
      border: 2px solid #607CF6;
      outline: none;
      transition: all 0.5s ease;
    }
  }
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #555;
}

.close-button {
  cursor: pointer;
  position: absolute;
  right: 2px;
  top: 2px;
}
</style>
