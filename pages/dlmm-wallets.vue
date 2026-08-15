<template>
  <div class="">
    <AppHeader title="DLMM Wallets" />

    <div class="header">
      <div class="header-content">
        <p>List wallets you will use in the performance and position pages.</p>
      </div>
    </div>

    <div class="mb-4">
      <button class="button" @click="openAddWallet">
        Add a wallet to your list
      </button>
    </div>

    <div class="wallets-section">
      <div v-if="wallets.length === 0 && !loading" class="no-wallets-message">
        <div class="no-wallets-content">
          <h3>No wallets found</h3>
          <p>Start by adding your first wallet.</p>
          <button class="button" @click="showAddWallet = true">
            Add Wallet
          </button>
        </div>
      </div>

      <!-- Wallets List -->
      <div v-else class="wallets-list">
        <div v-for="wallet in wallets" :key="wallet.id" class="wallet-item">
          <div class="wallet-info">
            <div class="wallet-name">
              {{ wallet.name }}
            </div>
            <div class="wallet-address">
              {{ formatAddress(wallet.address) }}
              <span
                v-if="wallet.domain && wallet.domain !== wallet.name"
                class="wallet-domain"
              >
                - {{ wallet.domain }}</span
              >
            </div>
          </div>
          <button
            class="delete-wallet-btn"
            title="Delete wallet"
            @click="deleteWallet(wallet.id)"
          >
            <trash-icon />
          </button>
        </div>
      </div>
    </div>

    <!-- Add Wallet Modal -->
    <div v-if="showAddWallet" class="modal-overlay" @click="closeModal">
      <div class="modal" @click.stop>
        <h3>Add New Wallet</h3>
        <form @submit.prevent="addWallet">
          <div class="form-group">
            <label>Wallet Name</label>
            <input v-model="newWallet.name" type="text" />
          </div>
          <div class="form-group">
            <label>Wallet Address</label>
            <WalletAddress @wallet-address-changed="updateWalletAddress" />
          </div>
          <div class="modal-actions">
            <button type="button" class="cancel-btn" @click="closeModal">
              Cancel
            </button>
            <button type="submit" class="button">Add Wallet</button>
          </div>
          <div v-if="addingWalletErrorMessage" class="error-message">
            {{ addingWalletErrorMessage }}
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

import { TrashIcon } from '@heroicons/vue/24/solid'
import { addAddress, deleteAddress, getAllAddresses } from '@/utils/wallets'

definePageMeta({
  layout: 'app',
})

const wallets = ref([])
const showAddWallet = ref(false)
const loading = ref(true)
const addingWalletErrorMessage = ref(null)

const newWallet = ref({
  name: '',
  address: '',
  domain: '',
})

onMounted(async () => {
  await loadData()
})

// Two statements, so this stays a named handler: an inline `a = 1; b = 2`
// handler is reformatted by Prettier into something Vue cannot parse.
const openAddWallet = () => {
  showAddWallet.value = true
  addingWalletErrorMessage.value = null
}

const formatAddress = (address) => {
  if (!address) return ''
  if (address.length <= 10) return address
  return `${address.slice(0, 4)}...${address.slice(-4)}`
}

const updateWalletAddress = ({ address, domain }) => {
  newWallet.value.address = address
  newWallet.value.domain = domain
}

const loadData = async () => {
  try {
    loading.value = true

    const addressesData = await getAllAddresses()
    wallets.value = addressesData.map((item) => ({
      id: item.id,
      name: item.name || item.domain || item.address,
      domain: item.domain,
      address: item.address,
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

const addWallet = async () => {
  addingWalletErrorMessage.value = null
  if (newWallet.value.address) {
    try {
      const walletData = {
        name: newWallet.value.name || newWallet.value.domain,
        domain: newWallet.value.domain,
        address: newWallet.value.address,
      }
      const newId = await addAddress(walletData)
      walletData.id = newId
      wallets.value.push(walletData)

      newWallet.value = {
        name: '',
        domain: '',
        address: '',
      }
      closeModal()
    } catch (error) {
      if (error.name === 'ConstraintError') {
        console.error('Wallet already exists')
        addingWalletErrorMessage.value = 'Wallet already exists'
      } else {
        console.error('Error adding wallet:', error)
        addingWalletErrorMessage.value = 'Error adding wallet'
      }
    }
  }
}

const deleteWallet = async (walletId) => {
  try {
    await deleteAddress(walletId)
    wallets.value = wallets.value.filter((w) => w.id !== walletId)
  } catch (error) {
    console.error('Error deleting wallet:', error)
  }
}

const closeModal = () => {
  showAddWallet.value = false

  newWallet.value = {
    name: '',
    address: '',
  }
}
</script>

<style scoped>
/* Header */
.header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 32px;
}

.header-content h2 {
  margin-top: 0;
}

.header-content p {
  font-size: 16px;
  color: #888;
  margin: 0;
}

.wallets-section {
  margin-top: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
}

.header-content h1 {
  text-align: left;
}

.header-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.section-info h2 {
  font-size: 24px;
  font-weight: 600;
  margin: 0 0 8px 0;
  color: white;
}

.section-info p {
  font-size: 16px;
  color: #888;
  margin: 0;
}

.wallets-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  flex: 1;
  overflow-y: auto;
  padding-right: 8px;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.wallets-list::-webkit-scrollbar {
  display: none;
}

.wallet-item {
  background: #1a1a1a;
  border: 1px solid #333;
  border-radius: 12px;
  padding: 20px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.2s;
}

.wallet-item:hover {
  border-color: #555;
}

.wallet-name {
  font-size: 16px;
  font-weight: 600;
  color: white;
  margin-bottom: 4px;
}

.wallet-address {
  font-size: 14px;
  color: #888;
  font-family: 'Monaco', 'Menlo', monospace;
}

/* No wallets message */
.no-wallets-message {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
}

.no-wallets-content {
  text-align: center;
  max-width: 400px;
}

.no-wallets-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.no-wallets-content h3 {
  color: white;
  font-size: 20px;
  margin: 0 0 8px 0;
}

.no-wallets-content p {
  color: #888;
  margin: 0 0 24px 0;
  line-height: 1.5;
}

.delete-wallet-btn {
  background: none;
  border: none;
  font-size: 16px;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  transition: all 0.2s;
  opacity: 0.6;
  width: 30px;
}

.delete-wallet-btn:hover {
  background: #333;
  opacity: 1;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: #1a1a1a;
  border: 1px solid #333;
  border-radius: 16px;
  padding: 32px;
  max-width: 400px;
  width: 90%;
}

.modal h3 {
  margin: 0 0 24px 0;
  color: white;
  font-size: 20px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: flex;
  margin-bottom: 8px;
  color: #ccc;
  font-weight: 500;
}

.form-group input {
  width: 100%;
  padding: 12px;
  background: #0a0a0a;
  border: 2px solid #333;
  border-radius: 8px;
  color: white;
  font-size: 16px;
  transition: border 0.3s ease;
}

.form-group input:focus {
  outline: none;
  border: 2px solid #607cf6;
}

.wallet-domain {
  font-size: 12px;
  color: #888;
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 24px;
}

.cancel-btn {
  background: none;
  border: 1px solid #333;
  color: #ccc;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.cancel-btn:hover {
  border-color: #555;
  color: white;
}

.submit-btn {
  background: white;
  color: black;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}

.submit-btn:hover {
  background: #f0f0f0;
}

.button {
  border: 1px solid #607cf6;
  border-radius: 10px;
  padding: 10px 20px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #304ca6;
    color: white;
  }
}

.error-message {
  color: red;
  font-size: 14px;
  margin-top: 10px;
  text-align: right;
}

@media (max-width: 768px) {
  .header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }

  .section-header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
}
</style>
