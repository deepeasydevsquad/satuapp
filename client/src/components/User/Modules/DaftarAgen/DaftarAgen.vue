<template>
  <div class="container mx-auto p-4">
    <div class="flex justify-end items-center mb-4">
      <div class="inline-flex rounded-md shadow-xs" role="group">
        <label for="search" class="block text-sm font-medium text-gray-700 mr-2 mt-3">Filter</label>
        <input type="text" id="search" class="block w-64 px-3 py-2 text-gray-700 bg-white border border-gray-300 rounded-s-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
          v-model="searchQuery" @change="fetchAgens()" placeholder="Cari data..." />
        <select  v-model="selectedOptionCabang" style="width: 300px;" @change="fetchAgens()" class="border-t border-b border-e bg-gray-50 border-gray-300 text-gray-900 text-sm rounded-e-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
            <option v-for="optionC in optionFilterCabang" :key="optionC.id" :value="optionC.id">
              {{ optionC.name }}
            </option>
        </select>
      </div>
    </div>
    <div class="overflow-x-auto rounded-lg border border-gray-200 shadow-md">
      <table class="w-full border-collapse bg-white text-left text-sm text-gray-500">
        <thead class="bg-gray-100">
          <tr>
            <th class="w-[30%] px-6 py-3 font-medium text-gray-900 text-center">Nama Agen</th>
            <th class="w-[20%] px-6 py-3 font-medium text-gray-900 text-center">Nomor Identitas Agen</th>
            <th class="w-[25%] px-6 py-3 font-medium text-gray-900 text-center">Level Keagenan</th>
            <th class="w-[10%] px-6 py-3 font-medium text-gray-900 text-center">Fee Agen</th>
            <th class="w-[10%] px-6 py-3 font-medium text-gray-900 text-center">Cabang</th>
            <th class="w-[5%] px-6 py-3 font-medium text-gray-900 text-center">Aksi</th>
          </tr>
        </thead>
        <tbody v-if="agens.length" class="divide-y divide-gray-100 border-t border-gray-100" >
          <tr v-for="agen in agens" :key="agen?.id" class="hover:bg-gray-50 transition-colors">
            <td class="px-6 py-4 text-center">{{ agen?.fullname || '-' }}</td>
            <td class="px-6 py-4 text-center">{{ agen?.nomor_identitas || '-' }}</td>
            <td class="px-6 py-4 text-center">{{ agen?.level || '-' }}</td>
            <td class="px-6 py-4 text-center">{{ formatRupiah(agen?.fee_agen) }}</td>
            <td class="px-6 py-4 text-center">{{ agen?.cabang }}</td>
            <td class="px-6 py-4 text-center">
              <div class="flex justify-center gap-2">
                <DangerButton @click="confirmDelete(agen?.id)" title="Hapus Agen">
                  <DeleteIcon />
                </DangerButton>
              </div>
            </td>
          </tr>
        </tbody>
        <tbody v-else class="divide-y divide-gray-100 border-t border-gray-100">
          <tr>
            <td :colspan="totalColumns" class="px-6 py-4 text-center text-gray-500">
              Daftar Agen Tidak Di Temukan
            </td>
          </tr>
        </tbody>
        <tfoot class="bg-gray-100 font-bold">
          <Pagination :current-page="currentPage" :total-pages="totalPages" :pages="pages" :total-columns="totalColumns" @prev-page="prevPage" @next-page="nextPage" @page-now="pageNow" />
        </tfoot>
      </table>
    </div>
  </div>

  <!-- Delete Confirmation Modal -->
  <Confirmation
    :showConfirmDialog="showDeleteConfirmDialog"
    confirmTitle="Konfirmasi Hapus"
    confirmMessage="Apakah Anda yakin ingin menghapus agen ini?"
  >
    <button
      @click="executeDelete"
      class="inline-flex w-full justify-center rounded-md border border-transparent bg-yellow-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
    >
      Ya
    </button>
    <button
      @click="showDeleteConfirmDialog = false"
      class="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
    >
      Tidak
    </button>
  </Confirmation>

  <!-- Notification Component -->
  <Notification :showNotification="showNotification" :notificationType="notificationType" :notificationMessage="notificationMessage" @close="showNotification = false"/>

</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { daftarAgen, deleteAgen } from '../../../../service/agen'
import { paramCabang  } from '../../../../service/param_cabang'; // Import function POST
import Confirmation from './Particle/Confirmation.vue'
import Notification from './Particle/Notification.vue'
import DeleteIcon from './Icon/DeleteIcon.vue'
import DangerButton from './Particle/DangerButton.vue'
import Pagination from '@/components/Pagination/Pagination.vue'

interface filterCabang {
  id: number;
  name: string;
}

interface Agens {
  id: number;
  fullname: string;
  nomor_identitas: string;
  level: string;
  fee_agen: string;
  cabang: string;
}

// Reactive State
const searchQuery = ref('')
const currentPage = ref(1)
const totalPages = ref(1)
const totalColumns = ref(6);
const itemsPerPage = ref(10)
const isLoading = ref(false)
const showDeleteConfirmDialog = ref(false)
const agenIdToDelete = ref(null)
const selectedOptionCabang = ref(0);
const optionFilterCabang = ref<filterCabang[]>([]);
const agens = ref<Partial<Agens[]>>([])

// Notification State
const showNotification = ref(false)
const notificationMessage = ref('')
const notificationType = ref<'success' | 'error'>('success')
const timeoutId = ref<number | null>(null)
const searchTimeout = ref<number | null>(null)

const fetchFilterData = async() => {
  const response = await paramCabang();
  optionFilterCabang.value = response.data;
  selectedOptionCabang.value = response.data[0].id;
  await fetchAgens();
}

const fetchAgens = async () => {
  isLoading.value = true
  try {

    const response = await daftarAgen({
      search: searchQuery.value,
      perpage: itemsPerPage.value,
      pageNumber: currentPage.value,
      cabang: selectedOptionCabang.value
    });

    agens.value = response.data
    totalPages.value = Math.ceil(response.total / itemsPerPage.value);

  } catch (error) {
    displayNotification('Gagal memuat data agen', 'error')
  } finally {
    isLoading.value = false
  }
}

const formatRupiah = (angka :any, prefix = "Rp ") => {
  let numberString = angka.toString().replace(/\D/g, ""),
    split = numberString.split(","),
    sisa = split[0].length % 3,
    rupiah = split[0].substr(0, sisa),
    ribuan = split[0].substr(sisa).match(/\d{3}/g);

  if (ribuan) {
    let separator = sisa ? "." : "";
    rupiah += separator + ribuan.join(".");
  }

  return prefix + (rupiah || "0");
};

const displayNotification = (message: string, type: 'success' | 'error' = 'success') => {
  notificationMessage.value = message
  notificationType.value = type
  showNotification.value = true
  resetNotificationTimeout()
}

const resetNotificationTimeout = () => {
  if (timeoutId.value) clearTimeout(timeoutId.value)
  timeoutId.value = window.setTimeout(() => {
    showNotification.value = false
  }, 3000)
}

// Pagination Methods
const goToPage = (page: number) => {
  if (page >= 1 && page <= totalPages.value && page !== currentPage.value) {
    currentPage.value = page
    fetchAgens()
  }
}

const nextPage = () => goToPage(currentPage.value + 1)
const prevPage = () => goToPage(currentPage.value - 1)


const pageNow = (page : number) => {
  currentPage.value = page
  fetchAgens()
}

const pages = computed(() => {
  return Array.from({ length: totalPages.value }, (_, i) => i + 1);
});

// Agen Actions
const confirmDelete = (id:any) => {
  agenIdToDelete.value = id
  showDeleteConfirmDialog.value = true
}

const executeDelete = async () => {
  if (!agenIdToDelete.value) {
    console.error('ID agen yang akan dihapus tidak tersedia')
    return
  }

  try {
    const response = await deleteAgen(agenIdToDelete.value)
    console.log('Response dari backend:', response)

    displayNotification(response.message || 'Agen berhasil dihapus', 'success')

    if (agens.value.length === 1 && currentPage.value > 1) {
      currentPage.value--
    }

    fetchAgens()
  } catch (error) {
    console.error('Error detail:', error)
    displayNotification(error.response?.data?.message || 'Gagal menghapus agen', 'error')
  } finally {
    showDeleteConfirmDialog.value = false
    agenIdToDelete.value = null
  }
}

// Lifecycle Hooks
onMounted(() => {
  // fetchAgens()
  fetchFilterData()
})

onUnmounted(() => {
  if (timeoutId.value) clearTimeout(timeoutId.value)
  if (searchTimeout.value) clearTimeout(searchTimeout.value)
})
</script>
