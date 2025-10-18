<template>
  <div class="">
    <AppHeader title="DLMM Wallets" />

    <div class="header">
      <div class="header-content">
        <p>List wallets you will use in the performance and position pages.</p>
      </div>
    </div>

    <div class="mb-4">
      <button class="button" @click="showAddWallet = true; addingWalletErrorMessage = null">
        Add a wallet to your list
      </button>
    </div>

    <div class="wallets-section">
      <div
        v-if="filteredWallets.length === 0 && !loading"
        class="no-wallets-message"
      >
        <div class="no-wallets-content">
          <h3>
            {{
              selectedGroupFilter && selectedGroupFilter !== 'all'
                ? 'No wallets in this group'
                : 'No wallets found'
            }}
          </h3>
          <p>
            {{
              selectedGroupFilter && selectedGroupFilter !== 'all'
                ? "This group doesn't have any wallets yet."
                : 'Start by adding your first wallet.'
            }}
          </p>
          <button class="button" @click="showAddWallet = true">
            Add Wallet
          </button>
        </div>
      </div>

      <!-- Wallets List -->
      <div v-else class="wallets-list">
        <div
          v-for="wallet in filteredWallets"
          :key="wallet.id"
          class="wallet-item"
        >
          <div class="wallet-info">
            <div class="wallet-name">
              {{ wallet.name }}
            </div>
            <div class="wallet-address">
              {{ formatAddress(wallet.address) }}
              <span
                class="wallet-domain"
                v-if="wallet.domain && wallet.domain !== wallet.name"
              >
                - {{ wallet.domain }}</span
              >
            </div>
            <div
              v-if="wallet.groupTag !== 'none' && wallet.groupTag !== null"
              class="wallet-group-tag"
            >
              {{ wallet.groupTag }}
            </div>
          </div>
          <button
            class="delete-wallet-btn"
            @click="deleteWallet(wallet.id)"
            title="Delete wallet"
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
            <WalletAddress @walletAddressChanged="updateWalletAddress" />
          </div>
          <!--div class="form-group">
            <label>Group</label>
            <select v-model="newWallet.groupTag">
              <option value="">No Group</option>
              <option v-for="group in groups" :key="group.id" :value="group.groupTag">
                {{ group.groupTag }}
              </option>
            </select>
          </div-->
          <div class="modal-actions">
            <button type="button" @click="closeModal" class="cancel-btn">
              Cancel
            </button>
            <button type="submit" class="button">Add Wallet</button>
          </div>
          <div class="error-message" v-if="addingWalletErrorMessage">
            {{ addingWalletErrorMessage }}
          </div>
        </form>
      </div>
    </div>

    <!-- Create Group Modal -->
    <div v-if="showCreateGroup" class="modal-overlay" @click="closeModal">
      <div class="modal create-group-modal" @click.stop>
        <h3>Create New Group</h3>
        <form @submit.prevent="addGroups">
          <div class="form-group">
            <label>Group Name</label>
            <input
              v-model="newGroup.name"
              type="text"
              placeholder="Enter group name"
              required
            />
          </div>

          <div class="form-group">
            <label>Select Wallets for this Group</label>
            <div class="wallet-selection">
              <div
                v-for="wallet in wallets"
                :key="wallet.id"
                class="wallet-checkbox-item"
              >
                <label class="checkbox-label">
                  <input
                    type="checkbox"
                    :value="wallet.id"
                    v-model="newGroup.selectedWallets"
                    class="wallet-checkbox"
                  />
                  <div class="wallet-item-info">
                    <div class="wallet-name-small">{{ wallet.name }}</div>
                    <div class="wallet-address-small">
                      {{ formatAddress(wallet.address) }}
                    </div>
                  </div>
                </label>
              </div>

              <div v-if="wallets.length === 0" class="no-wallets">
                No wallets available. Add some wallets first.
              </div>
            </div>
          </div>

          <div class="modal-actions">
            <button type="button" @click="closeModal" class="cancel-btn">
              Cancel
            </button>
            <button type="submit" class="button">Create Group</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

import { TrashIcon } from '@heroicons/vue/24/solid'

definePageMeta({
  layout: 'app',
})

const groups = ref([])
const wallets = ref([])
const showAddWallet = ref(false)
const showCreateGroup = ref(false)
const loading = ref(true)
const selectedGroupFilter = ref(null)
const addingWalletErrorMessage = ref(null)

const newWallet = ref({
  name: '',
  address: '',
  domain: '',
  groupTag: '',
})

const newGroup = ref({
  name: '',
  selectedWallets: [],
})

onMounted(async () => {
  await loadData()
})

const totalWallets = computed(() => wallets.value.length)

const filteredWallets = computed(() => {
  if (!selectedGroupFilter.value) {
    return wallets.value
  }

  if (selectedGroupFilter.value === 'all') {
    return wallets.value
  }

  return wallets.value.filter(
    (wallet) => wallet.groupTag === selectedGroupFilter.value,
  )
})

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
      groupTag: item.groupTag || null,
    }))

    const groupsData = await getAllGroups()
    groups.value = groupsData
      .filter((group) => group.groupTag && group.groupTag !== 'none') // Filter out 'none' groups
      .map((group) => ({
        id: group.id,
        name: group.groupTag,
        groupTag: group.groupTag,
        walletCount: wallets.value.filter(
          (wallet) => wallet.groupTag === group.groupTag,
        ).length,
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

const updateGroupWalletCounts = () => {
  groups.value.forEach((group) => {
    group.walletCount = wallets.value.filter(
      (wallet) => wallet.groupTag === group.groupTag,
    ).length
  })
}

const createGroup = () => {
  showCreateGroup.value = true
}

const selectGroup = (group) => {
  selectedGroupFilter.value = group.groupTag
}

const selectAllWallets = () => {
  selectedGroupFilter.value = 'all'
}

const clearGroupFilter = () => {
  selectedGroupFilter.value = null
}

const addWallet = async () => {
  addingWalletErrorMessage.value = null
  if (newWallet.value.address) {
    try {
      console.log('adding wallet',newWallet.value.name, newWallet.value)
      const walletData = {
        name: newWallet.value.name || newWallet.value.domain,
        domain: newWallet.value.domain,
        address: newWallet.value.address,
        groupTag: newWallet.value.groupTag || null,
      }
      const newId = await addAddress(walletData)
      walletData.id = newId
      wallets.value.push(walletData)
      updateGroupWalletCounts()

      newWallet.value = {
        name: '',
        domain: '',
        address: '',
        groupTag: '',
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

const addGroups = async () => {
  if (newGroup.value.name) {
    try {
      const groupTag = newGroup.value.name
      const newId = await addGroup(groupTag)

      if (newGroup.value.selectedWallets.length > 0) {
        for (const walletId of newGroup.value.selectedWallets) {
          const walletIndex = wallets.value.findIndex((w) => w.id === walletId)
          if (walletIndex !== -1) {
            const walletData = {
              ...wallets.value[walletIndex],
              groupTag: newGroup.value.name,
            }
            await updateAddress(walletId, { groupTag: newGroup.value.name })
            wallets.value[walletIndex].groupTag = newGroup.value.name
          }
        }
      }

      const group = {
        id: newId,
        name: newGroup.value.name,
        groupTag: newGroup.value.name,
        walletCount: newGroup.value.selectedWallets.length,
      }

      groups.value.push(group)
      updateGroupWalletCounts()

      newGroup.value = {
        name: '',
        selectedWallets: [],
      }

      closeModal()
    } catch (error) {
      console.error('Error adding group:', error)
    }
  }
}

const deleteWallet = async (walletId) => {
  try {
    await deleteAddress(walletId)
    wallets.value = wallets.value.filter((w) => w.id !== walletId)
    console.log(wallets.value)
    updateGroupWalletCounts()
  } catch (error) {
    console.error('Error deleting wallet:', error)
  }
}

const closeModal = () => {
  showAddWallet.value = false
  showCreateGroup.value = false

  newWallet.value = {
    name: '',
    address: '',
    groupTag: '',
  }

  newGroup.value = {
    name: '',
    selectedWallets: [],
  }
}
</script>

<style scoped>
.wallet-groups {
  background: #0a0a0a;
  color: white;
  padding: 24px;
  font-family:
    -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  min-width: 820px;
  height: 78vh;
  overflow-y: auto;
  /* Parent prevents scrolling */
  display: flex;
  flex-direction: column;
}

/* Hide scrollbar for webkit browsers (Chrome, Safari, Edge) */
.wallet-groups::-webkit-scrollbar {
  display: none;
}

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

.create-group-btn {
  background: white;
  color: black;
  border: none;
  padding: 8px 18px;
  border-radius: 24px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.create-group-btn:hover {
  background: #f0f0f0;
  transform: translateY(-1px);
}

/* Groups Grid */
.groups-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px;
  margin-bottom: 48px;
}

.group-card {
  background: #1a1a1a;
  border: 1px solid #333;
  border-radius: 16px;
  padding: 12px;
  cursor: pointer;
  transition: all 0.2s;
  height: 60px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.group-card:hover {
  border-color: #555;
  transform: translateY(-2px);
}

.group-card.active {
  border-color: white;
  background: #2a2a2a;
}

.group-card.active .wallet-count {
  background: white;
  color: #0a0a0a;
}

.wallet-count {
  background: #333;
  color: #ccc;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 14px;
  align-self: flex-start;
  margin-bottom: 16px;
}

.group-name {
  font-size: 20px;
  font-weight: 600;
  color: white;
}

.custom-group .group-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.group-arrow {
  font-size: 20px;
  color: #888;
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

.clear-filter-btn {
  background: none;
  color: #ccc;
  border: 1px solid #333;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.clear-filter-btn:hover {
  border-color: #555;
  color: white;
  background: #333;
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

.wallet-group-tag {
  font-size: 12px;
  color: #aaa;
  background: #333;
  padding: 2px 8px;
  border-radius: 10px;
  margin-top: 4px;
  display: inline-block;
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

.create-group-modal {
  max-width: 500px;
  max-height: 80vh;
  overflow-y: auto;
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

.form-group input,
.form-group select {
  width: 100%;
  padding: 12px;
  background: #0a0a0a;
  border: 2px solid #333;
  border-radius: 8px;
  color: white;
  font-size: 16px;
  transition: border 0.3s ease;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border: 2px solid #607cf6;
}

/* Wallet Selection Styles */
.wallet-selection {
  max-height: 200px;
  overflow-y: auto;
  border: 1px solid #333;
  border-radius: 8px;
  padding: 12px;
  background: #0a0a0a;
}

.wallet-checkbox-item {
  margin-bottom: 12px;
}

.wallet-checkbox-item:last-child {
  margin-bottom: 0;
}

.checkbox-label {
  display: flex;
  flex-direction: row;
  align-items: center;
  cursor: pointer;
  padding: 8px;
  border-radius: 6px;
  transition: background-color 0.2s;
}

.checkbox-label:hover {
  background: #333;
}

.wallet-checkbox {
  flex: 1;
  margin-right: 12px;
  transform: scale(1.2);
  accent-color: white;
}

.wallet-item-info {
  flex: 1;
}

.wallet-name-small {
  font-size: 14px;
  font-weight: 600;
  color: white;
  margin-bottom: 2px;
}

.wallet-domain {
  font-size: 12px;
  color: #888;
}

.wallet-address-small {
  font-size: 12px;
  color: #888;
  font-family: 'Monaco', 'Menlo', monospace;
}

.no-wallets {
  text-align: center;
  color: #888;
  font-style: italic;
  padding: 20px;
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

  .groups-grid {
    grid-template-columns: 1fr;
  }
}
</style>
