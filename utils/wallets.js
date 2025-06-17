import Dexie from 'dexie'

class AddressDatabase extends Dexie {
  constructor() {
    super('AddressDB')

    this.version(1).stores({
      addresses: '++id, &address, domain, name, groupTag',
      group: '++id, &groupTag, walletCount',
    })
  }
}

const db = new AddressDatabase()

const resetDatabase = async () => {
  await db.delete()
  await db.open()
  return db
}

async function storeAddress(name, address, domain, groupTag) {
  try {
    const existing = await db.addresses.where('address').equals(address).first()
    if (!existing) {
      await db.addresses.add({
        name: name,
        address: address,
        domain: domain || null,
        groupTag: groupTag,
        createdAt: new Date(),
      })
      addGroup(groupTag)
    }
  } catch (error) {
    console.error('Error storing address:', error)
  }
}

async function addAddress(addressData) {
  const id = await db.addresses.add(addressData)
  return id
}

async function getAllAddresses() {
  try {
    const addresses = await db.addresses.toArray()
    return addresses
  } catch (error) {
    console.error('Error reading addresses:', error)
    return []
  }
}

async function updateAddress(addressId, updateData) {
  await db.addresses.update(addressId, updateData)
}

async function deleteAddress(addressId) {
  await db.addresses.delete(addressId)
}

async function addGroup(group) {
  try {
    const id = await db.group.add({
      groupTag: group,
      walletCount: 0,
    })
    return id
  } catch (error) {
    console.error('Error storing groupTag', error)
  }
}

async function getAllGroups() {
  return await db.group.toArray()
}

export {
  resetDatabase,
  storeAddress,
  getAllAddresses,
  addGroup,
  getAllGroups,
  addAddress,
  updateAddress,
  deleteAddress,
}
