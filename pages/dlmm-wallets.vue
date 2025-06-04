<template>
  <div class="wallet-groups">
    <!-- Header Section -->
    <div class="header">
      <div class="header-content">
        <h1>Your groups</h1>
        <p>Easily organize wallets into groups for smarter tracking</p>
      </div>
      <button class="create-group-btn" @click="createGroup">
        Create group
      </button>
    </div>

    <!-- Groups Grid -->
    <div class="groups-grid">
      <!-- All Wallets Group -->
      <div class="group-card default-group">
        <div class="wallet-count">{{ totalWallets }} wallets</div>
        <div class="group-name">All wallets</div>
      </div>

      <!-- Custom Groups -->
      <div v-for="group in groups" :key="group.id" class="group-card custom-group" @click="selectGroup(group)">
        <div class="wallet-count">{{ group.walletCount }} wallets</div>
        <div class="group-content">
          <div class="group-name">{{ group.name }}</div>
          <div class="group-arrow">→</div>
        </div>
      </div>
    </div>

    <!-- Wallets List Section -->
    <div class="wallets-section">
      <div class="section-header">
        <div class="section-info">
          <h2>{{ currentSectionInfo.title }}</h2>
          <p>{{ currentSectionInfo.description }}</p>
        </div>
        <div class="header-actions">
          <button v-if="selectedGroupFilter && selectedGroupFilter !== 'all'" class="clear-filter-btn"
            @click="clearGroupFilter" title="Show all wallets">
            Clear Filter
          </button>
          <button class="add-wallet-btn" @click="showAddWallet = true">
            Add
          </button>
        </div>
      </div>

      <!-- No wallets message -->
      <div v-if="filteredWallets.length === 0 && !loading" class="no-wallets-message">
        <div class="no-wallets-content">
          <div class="no-wallets-icon">📝</div>
          <h3>{{ selectedGroupFilter && selectedGroupFilter !== 'all' ? 'No wallets in this group' : 'No wallets found'
            }}</h3>
          <p>{{ selectedGroupFilter && selectedGroupFilter !== 'all' ? 'This group doesn\'t have any wallets yet.' :
            'Start by adding your first wallet.' }}</p>
          <button class="add-first-wallet-btn" @click="showAddWallet = true">
            Add Wallet
          </button>
        </div>
      </div>

      <!-- Wallets List -->
      <div v-else class="wallets-list">
        <div v-for="wallet in filteredWallets" :key="wallet.id" class="wallet-item">
          <div class="wallet-info">
            <div class="wallet-name">{{ wallet.name }}</div>
            <div class="wallet-address">{{ formatAddress(wallet.address) }}</div>
            <div v-if="wallet.groupTag" class="wallet-group-tag">{{ wallet.groupTag }}</div>
          </div>
          <button class="delete-wallet-btn" @click="deleteWallet(wallet.id)" title="Delete wallet">
            🗑️
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
            <input v-model="newWallet.name" type="text" placeholder="Enter wallet name" required />
          </div>
          <div class="form-group">
            <label>Wallet Address</label>
            <input v-model="newWallet.address" type="text" placeholder="Enter wallet address" required />
          </div>
          <div class="form-group">
            <label>Group</label>
            <select v-model="newWallet.groupTag">
              <option value="">No Group</option>
              <option v-for="group in groups" :key="group.id" :value="group.groupTag">
                {{ group.groupTag }}
              </option>
            </select>
          </div>
          <div class="modal-actions">
            <button type="button" @click="closeModal" class="cancel-btn">
              Cancel
            </button>
            <button type="submit" class="submit-btn">
              Add Wallet
            </button>
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
            <input v-model="newGroup.name" type="text" placeholder="Enter group name" required />
          </div>

          <div class="form-group">
            <label>Select Wallets for this Group</label>
            <div class="wallet-selection">
              <div v-for="wallet in wallets" :key="wallet.id" class="wallet-checkbox-item">
                <label class="checkbox-label">
                  <input type="checkbox" :value="wallet.id" v-model="newGroup.selectedWallets"
                    class="wallet-checkbox" />
                  <div class="wallet-item-info">
                    <div class="wallet-name-small">{{ wallet.name }}</div>
                    <div class="wallet-address-small">{{ formatAddress(wallet.address) }}</div>
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
            <button type="submit" class="submit-btn">
              Create Group
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
// Import your database functions here
// import { getAllAddresses, getAllGroups, addAddress, addGroup, updateAddress, deleteAddress } from '@/path/to/your/dexie-file'

definePageMeta({
  layout: 'app',
})

// Reactive state
const groups = ref([])
const wallets = ref([])
const showAddWallet = ref(false)
const showCreateGroup = ref(false)
const loading = ref(true)
const selectedGroupFilter = ref(null) // Track selected group for filtering

const newWallet = ref({
  name: '',
  address: '',
  groupTag: ''
})

const newGroup = ref({
  name: '',
  selectedWallets: []
})

// Computed properties
const totalWallets = computed(() => wallets.value.length)

// Filtered wallets based on selected group
const filteredWallets = computed(() => {
  if (!selectedGroupFilter.value) {
    return wallets.value // Show all wallets when no group is selected
  }

  if (selectedGroupFilter.value === 'all') {
    return wallets.value // Show all wallets when "All wallets" is selected
  }

  return wallets.value.filter(wallet => wallet.groupTag === selectedGroupFilter.value)
})

// Current section title and description
const currentSectionInfo = computed(() => {
  if (!selectedGroupFilter.value || selectedGroupFilter.value === 'all') {
    return {
      title: 'List of your saved wallets',
      description: 'All wallets saved across your groups.',
      count: totalWallets.value
    }
  }

  const group = groups.value.find(g => g.groupTag === selectedGroupFilter.value)
  return {
    title: `Wallets in "${selectedGroupFilter.value}"`,
    description: `Wallets belonging to the ${selectedGroupFilter.value} group.`,
    count: group ? group.walletCount : 0
  }
})

// Methods
const formatAddress = (address) => {
  if (!address) return ''
  if (address.length <= 10) return address
  return `${address.slice(0, 4)}...${address.slice(-4)}`
}

const loadData = async () => {
  try {
    loading.value = true

    // Check if database functions are available
    if (typeof getAllAddresses !== 'function') {
      console.error('getAllAddresses function not found. Please import your database functions.')
      return
    }

    if (typeof getAllGroups !== 'function') {
      console.error('getAllGroups function not found. Please import your database functions.')
      return
    }

    // Load wallets from Dexie
    const addressesData = await getAllAddresses()
    wallets.value = addressesData.map(item => ({
      id: item.id,
      name: item.domain || item.address, // Use domain if available, otherwise use address
      address: item.address,
      groupTag: item.groupTag || null
    }))

    // Load groups from Dexie
    const groupsData = await getAllGroups()
    groups.value = groupsData
      .filter(group => group.groupTag && group.groupTag !== 'none') // Filter out 'none' groups
      .map(group => ({
        id: group.id,
        name: group.groupTag,
        groupTag: group.groupTag,
        walletCount: wallets.value.filter(wallet => wallet.groupTag === group.groupTag).length
      }))

  } catch (error) {
    console.error('Error loading data:', error)
    console.error('Make sure you have imported the database functions and they are working properly')
  } finally {
    loading.value = false
  }
}

const updateGroupWalletCounts = () => {
  groups.value.forEach(group => {
    group.walletCount = wallets.value.filter(wallet => wallet.groupTag === group.groupTag).length
  })
}

const createGroup = () => {
  showCreateGroup.value = true
}

const selectGroup = (group) => {
  console.log('Selected group:', group)
  selectedGroupFilter.value = group.groupTag
}

const selectAllWallets = () => {
  selectedGroupFilter.value = 'all'
}

const clearGroupFilter = () => {
  selectedGroupFilter.value = null
}

const addWallet = async () => {
  if (newWallet.value.name && newWallet.value.address) {
    try {
      // Check if addAddress function is available
      if (typeof addAddress !== 'function') {
        console.error('addAddress function not found. Please import your database functions.')
        return
      }

      // Add wallet to Dexie
      const walletData = {
        domain: newWallet.value.name,
        address: newWallet.value.address,
        groupTag: newWallet.value.groupTag || null
      }

      // Call your database function to add address
      const newId = await addAddress(walletData)

      const wallet = {
        id: newId,
        name: walletData.domain,
        address: walletData.address,
        groupTag: walletData.groupTag
      }

      wallets.value.push(wallet)
      updateGroupWalletCounts()

      // Reset form
      newWallet.value = {
        name: '',
        address: '',
        groupTag: ''
      }

      closeModal()
    } catch (error) {
      console.error('Error adding wallet:', error)
    }
  }
}

const addGroups = async () => {
  if (newGroup.value.name) {
    try {

      const groupTag = newGroup.value.name

      // Call the database function to create the group
      const newId = await addGroup(groupTag)

      // Update selected wallets to belong to this new group
      if (newGroup.value.selectedWallets.length > 0) {
        for (const walletId of newGroup.value.selectedWallets) {
          const walletIndex = wallets.value.findIndex(w => w.id === walletId)
          if (walletIndex !== -1) {
            // Update wallet in database
            const walletData = {
              ...wallets.value[walletIndex],
              groupTag: newGroup.value.name
            }

            // Call database function to update wallet
            await updateAddress(walletId, { groupTag: newGroup.value.name })

            // Update local state
            wallets.value[walletIndex].groupTag = newGroup.value.name
          }
        }
      }

      // Add to local state with the ID returned from database
      const group = {
        id: newId,
        name: newGroup.value.name,
        groupTag: newGroup.value.name,
        walletCount: newGroup.value.selectedWallets.length
      }

      groups.value.push(group)
      updateGroupWalletCounts()

      // Reset form
      newGroup.value = {
        name: '',
        selectedWallets: []
      }

      closeModal()
    } catch (error) {
      console.error('Error adding group:', error)
      // You might want to show an error message to the user here
    }
  }
}

const deleteWallet = async (walletId) => {
  try {
    // Check if deleteAddress function is available
    if (typeof deleteAddress === 'function') {
      // Delete from Dexie
      await deleteAddress(walletId)
    } else {
      console.warn('deleteAddress function not found. Only removing from local state.')
    }

    // Remove from local state
    const walletIndex = wallets.value.findIndex(w => w.id === walletId)
    if (walletIndex !== -1) {
      wallets.value.splice(walletIndex, 1)
      updateGroupWalletCounts()
    }
  } catch (error) {
    console.error('Error deleting wallet:', error)
  }
}

const closeModal = () => {
  showAddWallet.value = false
  showCreateGroup.value = false

  // Reset forms when closing modals
  newWallet.value = {
    name: '',
    address: '',
    groupTag: ''
  }

  newGroup.value = {
    name: '',
    selectedWallets: []
  }
}

// Load data on component mount
onMounted(() => {
  loadData()
})

</script>

<style scoped>
.wallet-groups {
  background: #0a0a0a;
  color: white;
  padding: 24px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
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

.header-content h1 {
  font-size: 32px;
  font-weight: 600;
  margin: 0 0 8px 0;
  color: white;
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
  padding: 12px 24px;
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
  padding: 24px;
  cursor: pointer;
  transition: all 0.2s;
  min-height: 120px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
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

/* Wallets Section */
.wallets-section {
  margin-top: 48px;
  flex: 1;
  /* Take remaining space */
  display: flex;
  flex-direction: column;
  min-height: 0;
  /* Important for flex child to shrink */
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
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

.add-wallet-btn {
  background: white;
  color: black;
  border: none;
  padding: 12px 24px;
  border-radius: 24px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.add-wallet-btn:hover {
  background: #f0f0f0;
  transform: translateY(-1px);
}

/* Wallets List */
.wallets-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  flex: 1;
  /* Take remaining space in wallets-section */
  overflow-y: auto;
  /* Allow vertical scrolling */
  padding-right: 8px;
  /* Add some padding for better UX */

  /* Hide scrollbar while keeping functionality */
  scrollbar-width: none;
  /* Firefox */
  -ms-overflow-style: none;
  /* IE/Edge */
}

.wallets-list::-webkit-scrollbar {
  display: none;
  /* Webkit browsers */
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

.add-first-wallet-btn {
  background: white;
  color: black;
  border: none;
  padding: 12px 24px;
  border-radius: 24px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.add-first-wallet-btn:hover {
  background: #f0f0f0;
  transform: translateY(-1px);
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
  border: 1px solid #333;
  border-radius: 8px;
  color: white;
  font-size: 16px;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #555;
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

/* Responsive */
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