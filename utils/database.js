import Dexie from 'dexie';

class AddressDatabase extends Dexie {
    constructor() {
        super('AddressDB');

        this.version(1).stores({
            addresses: '++id, &address, domain, groupTag',// &address = unique index,
            group: '++id, &groupTag, walletCount'
        });
    }
}


// Function to store address with group tag
async function storeAddress(address, domain, groupTag) {

    try {
        // Check if address already exists
        const existing = await db.addresses.where('address').equals(address).first();
        if (domain == null) domain = "no domain";
        if (!existing) {
            await db.addresses.add({
                address: address,
                domain: domain,
                groupTag: groupTag,
                createdAt: new Date()
            });
            console.log(`Address ${address} added with group ${groupTag}`);
            addGroup(groupTag);
        } else {
            console.log(`Address ${address} already exists, skipping`);
        }
    } catch (error) {
        console.error('Error storing address:', error);
    }
}

async function addGroup(group) {
    try {
        const id = await db.group.add({
            groupTag: group,
            walletCount: 0
        })
        return id;
    } catch (error) {
        console.error("Error storing groupTag", error);
    }
}

async function getAllGroups() {
    return await db.group.toArray();
}

async function getAllAddresses() {
    try {
        const addresses = await db.addresses.toArray();
        console.log('All addresses:', addresses);
        return addresses;
    } catch (error) {
        console.error('Error reading addresses:', error);
        return [];
    }
}

async function addAddress(addressData) {
   
    const id = await db.addresses.add(addressData);
    return id;
}

async function updateAddress(addressId, updateData) {
  await db.addresses.update(addressId, updateData);
}
async function deleteAddress(addressId) {
  await db.addresses.delete(addressId);
}
const db = new AddressDatabase();
export { db, storeAddress, getAllAddresses, addGroup, getAllGroups, addAddress, updateAddress, deleteAddress };