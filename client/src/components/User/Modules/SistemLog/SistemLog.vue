<template>
  <div class="container mx-auto p-4">

    <!-- Pencarian -->
    <div class="flex justify-end items-center mb-4">
      <label for="search" class="block text-sm font-medium text-gray-700 mr-2">Search</label>
      <input v-model="search" type="text" placeholder="Cari log..."
        class="block w-64 px-3 py-2 text-gray-700 bg-white border border-gray-300 rounded-s-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200" />
      <select  v-model="selectedOptionCabang" style="width: 300px;" @change="fetchData()" class="border-t border-b border-e bg-gray-50 border-gray-300 text-gray-900 text-sm rounded-e-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
            <option v-for="optionC in optionFilterCabang" :key="optionC.id" :value="optionC.id">
              {{ optionC.name }}
            </option>
        </select>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-4">
      <span class="text-gray-500">Loading...</span>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="text-center py-4">
      <span class="text-red-500">{{ error }}</span>
    </div>

    <!-- Tabel System Log -->
    <div v-else class="overflow-hidden rounded-lg border border-gray-200 shadow-md">
      <table class="w-full border-collapse bg-white text-left text-sm text-gray-500">
        <thead class="bg-gray-100">
          <tr>
            <th class="px-6 py-3 font-medium text-gray-900 text-center">Log Message</th>
            <th class="px-6 py-3 font-medium text-gray-900 text-center">User</th>
            <th class="px-6 py-3 font-medium text-gray-900 text-center">Transaction Date</th>
            <th class="px-6 py-3 font-medium text-gray-900 text-center">IP Address</th>
            <th class="px-6 py-3 font-medium text-gray-900 text-center">Cabang</th>
          </tr>
        </thead>
        <tbody v-if="data.length > 0" class="divide-y divide-gray-200">
          <tr v-for="log in data" :key="log?.id" class="hover:bg-gray-50 transition-colors">
            <td class="px-6 py-4 text-left">{{ log?.logMsg }}</td>
            <td class="px-6 py-4 text-center">{{ log?.userName }}</td>
            <td class="px-6 py-4 text-center">{{ formatDate(log.transactionDate) }}</td>
            <td class="px-6 py-4 text-center">{{ log.logIpAccess }}</td>
            <td class="px-6 py-4 text-center">{{ log.cabangName }}</td>
          </tr>
        </tbody>
        <tbody v-else class="divide-y divide-gray-100 border-t border-gray-100">
          <tr>
            <td :colspan="totalColumns" class="px-6 py-4 text-center text-gray-500">
              Daftar system log tidak di temukan
            </td>
          </tr>
        </tbody>
        <tfoot class="bg-gray-100 font-bold">
          <Pagination :current-page="currentPage" :total-pages="totalPages" :pages="pages" :total-columns="totalColumns" @prev-page="prevPage" @next-page="nextPage" @page-now="pageNow" :totalRow="totalRow"/>
        </tfoot>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { getSistemLog } from '@/service/sistem_log'
import { paramCabang  } from '@/service/param_cabang';
import Pagination from '@/components/Pagination/Pagination.vue'

interface filterCabang {
  id: number;
  name: string;
}

interface SystemLogs {
  id: number;
  logMsg: string;
  userName:string;
  transactionDate: string;
  logIpAccess: string;
  cabangName: string;
}

// State untuk menyimpan data, loading, dan error
const data = ref<Partial<SystemLogs[]>>([])
const logs = ref([])
const loading = ref(true)
const error = ref<string | null>(null)
const search = ref('');
const selectedOptionCabang = ref(0);
const optionFilterCabang = ref<filterCabang[]>([]);

const fetchFilterData = async() => {
  const response = await paramCabang();
  optionFilterCabang.value = response.data;
  selectedOptionCabang.value = response.data[0].id;
  await fetchData();
}

// Fungsi untuk mengambil data log
const fetchData = async () => {
  try {
    loading.value = true
    error.value = null
    const response = await getSistemLog({
      search: search.value,
      perpage: itemsPerPage,
      pageNumber: currentPage.value,
      cabang: selectedOptionCabang.value
    });
    data.value = response.data
    totalRow.value = response.total;
    totalPages.value = Math.ceil(response.total / itemsPerPage);
  } catch (err) {
    error.value = 'Gagal mengambil data log. Silakan coba lagi.'
    console.error('Error fetching system logs:', err)
  } finally {
    loading.value = false
  }
}

// Fungsi untuk memformat tanggal
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleString() // Sesuaikan format sesuai kebutuhan
}

// Pagination logic
const currentPage = ref(1)
const itemsPerPage = 100
const totalColumns = ref(5);
const totalPages = ref(0);
const totalRow = ref(0);

const pages = computed(() => {
  return Array.from({ length: totalPages.value }, (_, i) => i + 1);
});


const pageNow = (page : number) => {
  currentPage.value = page
  fetchData()
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
    fetchData()
  }
};

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
    fetchData()
  }
};

// Ambil data saat komponen dimuat
onMounted(() => {
  fetchFilterData()
})
</script>

<style scoped>
/* Tambahkan custom CSS jika diperlukan */
</style>
