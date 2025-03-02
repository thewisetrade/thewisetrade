<template>
<div class="flex flex-col h-screen main-container">
  <h1>Sanctum LST Interest Rates (APYs)</h1>
  <div v-if="loading" class="loader-container">
    <div class="loader"></div>
  </div>
  <div v-else class="table-container">
    <table class="text-center">
      <thead>
        <tr>
          <th></th>
          <th>Name</th>
          <th>Symbol</th>
          <th>Apy</th>
          <th>Ap5y</th>
          <th>Ap10y</th>
        </tr>
      </thead>
      <tbody class="tbody">
        <tr v-for="lst in lsts" :key="lst.symbol">
          <td><img :src="lst.logo_uri" width="32" /></td>
          <td>{{ lst.name }}</td>
          <td>{{ lst.symbol }}</td>
          <td>{{ (apys[lst.mint] * 100 || 0).toFixed(2) }}%</td>
          <td>{{ ((Math.pow((apys[lst.mint] + 1), 5) - 1) * 100 || 0).toFixed(2) }}%</td>
          <td>{{ ((Math.pow((apys[lst.mint] + 1), 10) - 1) * 100 || 0).toFixed(2) }}%</td>
        </tr>
      </tbody>
    </table>
  </div>
</div>
</template>

<script setup>
import sanctumClient from '@/utils/sanctum'

const lsts = ref([])
const apys = ref({})
const loading = ref(true)

lsts.value = sanctumClient.lstList

onMounted(async () => {
  try {
    loading.value = true
    const res = await sanctumClient.getLstApys()
    apys.value = res.apys
    lsts.value = lsts.value.sort((a, b) => {
      if (apys.value[b.mint] === undefined) {
        return -1
      } else if (apys.value[a.mint] === undefined) {
        return 1
      } else if (apys.value[b.mint] === apys.value[a.mint]) {
        return 0
      } else if (apys.value[b.mint] < apys.value[a.mint]) {
        return -1
      } else {
        return 1
      }
    })
  } catch (error) {
    console.error('Error fetching APYs:', error)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>

h1 {
  margin-top: 0;
}

.main-container {
  height: 65vh;
  overflow: hidden;
}

.table-container {
  position: relative;
  overflow: scroll;
  border-radius: 8px;
}

table {
  margin: 0 auto;
  border-collapse: collapse;
  width: 100%;
  overflow: scroll;
  height: 800px;

  thead {
    position: sticky;
    top: 0;
    z-index: 1;
  }

  tbody {
    overflow: scroll;
  }
}

th, td {
  padding: 8px;
  text-align: left;
  border: none;
}

tr:nth-child(odd) {
  background-color: #232022;
}

tr:nth-child(even) {
  background-color: #333032;
}

thead th,
thead {
  background-color: #403848;
  font-weight: bold;
  font-size: 1em;
}

tbody {
  overflow: auto;
}

.tbody {
  height: 80%;
}

.loader-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
}

.loader {
  border: 5px solid #f3f3f3;
  border-top: 5px solid #403848;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
