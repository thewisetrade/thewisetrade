import Dexie from 'dexie'

class AddressDatabase extends Dexie {
  constructor() {
    super('AddressDB')

    this.version(1).stores({
      addresses: '++id, &address, domain, name, groupTag',
      group: '++id, &groupTag, walletCount',
    })

    // v2 retire la notion de groupe : `group: null` supprime la table et
    // `groupTag` n'est plus indexé sur les adresses. La v1 doit rester déclarée,
    // sinon Dexie ne sait pas migrer les bases déjà créées chez les visiteurs.
    // Les valeurs `groupTag` des enregistrements existants restent en base, plus
    // personne ne les lit.
    this.version(2).stores({
      addresses: '++id, &address, domain, name',
      group: null,
    })
  }
}

const db = new AddressDatabase()

const resetDatabase = async () => {
  await db.delete()
  await db.open()
  return db
}

async function storeAddress(name, address, domain) {
  try {
    const existing = await db.addresses.where('address').equals(address).first()
    if (!existing) {
      await db.addresses.add({
        name: name,
        address: address,
        domain: domain || null,
        createdAt: new Date(),
      })
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

export {
  resetDatabase,
  storeAddress,
  getAllAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
}
