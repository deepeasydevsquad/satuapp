<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { hapus, list } from '@/service/akun_bank'
import { paramCabang } from '@/service/param_cabang'
import Pagination from '@/components/Pagination/Pagination.vue'
import LightButton from '@/components/Button/LightButton.vue'
import DangerButton from '@/components/Button/DangerButton.vue'
import EditIcon from '@/components/Icons/EditIcon.vue'
import DeleteIcon from '@/components/Icons/DeleteIcon.vue'
import PrimaryButton from '@/components/Button/PrimaryButton.vue'
import IconPlus from '@/components/Icons/IconPlus.vue'
import FormAdd from './widget/FormAdd.vue'
import FormUpdate from './widget/FormUpdate.vue'
import Confirmation from '@/components/Modal/Confirmation.vue'
import Notification from '@/components/Modal/Notification.vue'

// interface filterCabang {
//   id: number
//   name: string
// }

interface AkunBank {
  id: number
  nama_bank: string
  kode_bank: string
  nomor_akun: string
  nama_akun: string
}

// State untuk menyimpan data, loading, dan error
const data = ref<Partial<AkunBank[]>>([])
// const logs = ref([])
const loading = ref(true)
const error = ref<string | null>(null)
const search = ref('')
const selectedOptionCabang = ref(0)
// const optionFilterCabang = ref<filterCabang[]>([])

// const fetchFilterData = async () => {
//   const response = await paramCabang()
//   optionFilterCabang.value = response.data
//   selectedOptionCabang.value = response.data[0].id
//   await fetchData()
// }

// Fungsi untuk mengambil data log
const fetchData = async () => {
  try {
    loading.value = true
    error.value = null
    const response = await list({
      search: search.value,
      perpage: itemsPerPage,
      pageNumber: currentPage.value,
      cabang: selectedOptionCabang.value,
    })
    data.value = response.data
    totalRow.value = response.total
    totalPages.value = Math.ceil(response.total / itemsPerPage)
  } catch (err) {
    error.value = 'Gagal mengambil data log. Silakan coba lagi.'
    console.error('Error fetching system logs:', err)
  } finally {
    loading.value = false
  }
}

// Pagination logic
const currentPage = ref(1)
const itemsPerPage = 100
const totalColumns = ref(4)
const totalPages = ref(0)
const totalRow = ref(0)

const pages = computed(() => {
  return Array.from({ length: totalPages.value }, (_, i) => i + 1)
})

const pageNow = (page: number) => {
  currentPage.value = page
  fetchData()
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
    fetchData()
  }
}

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
    fetchData()
  }
}

// Ambil data saat komponen dimuat
onMounted(() => {
  fetchData()
})

const ModalAdd = ref(false)
const openModalAdd = () => {
  ModalAdd.value = true
}

const ModalUpdate = ref(false)
const selectedId = ref(0)
const openModalUpdate = (id: any) => {
  ModalUpdate.value = true
  selectedId.value = id
}

const confirmMessage = ref<string>('')
const confirmTitle = ref<string>('')
const confirmAction = ref<(() => void) | null>(null)
const showNotification = ref<boolean>(false)
const showConfirmDialog = ref<boolean>(false)
const notificationMessage = ref<string>('')
const notificationType = ref<'success' | 'error'>('success')
const timeoutId = ref<number | null>(null)

const showConfirmation = (title: string, message: string, action: () => void) => {
  confirmTitle.value = title
  confirmMessage.value = message
  confirmAction.value = action
  showConfirmDialog.value = true
}

const displayNotification = (message: string, type: 'success' | 'error' = 'success') => {
  notificationMessage.value = message
  notificationType.value = type
  showNotification.value = true

  if (timeoutId.value) clearTimeout(timeoutId.value)

  timeoutId.value = window.setTimeout(() => {
    showNotification.value = false
  }, 3000)
}

const deleteData = async (id: number) => {
  showConfirmation('Konfirmasi Hapus', 'Apakah Anda yakin ingin menghapus data ini?', async () => {
    try {
      const response = await hapus({ id: id })
      showConfirmDialog.value = false
      displayNotification(response.error_msg)
      fetchData()
    } catch (error) {
      displayNotification('Terjadi kesalahan saat menghapus data.', 'error')
    }
  })
}

const handleAdd = () => {
  ModalAdd.value = false
  displayNotification('Data berhasil ditambahkan.', 'success')
  fetchData()
}

const handleUpdate = () => {
  ModalUpdate.value = false
  displayNotification('Data berhasil diupdate.', 'success')
  fetchData()
}
</script>
<template>
  <div class="container mx-auto p-4">
    <div class="flex justify-between items-center mb-4">
      <PrimaryButton @click="openModalAdd">
        <IconPlus /> Tambah Akun Bank
      </PrimaryButton>
      <div class="flex items-center">
        <label for="search" class="block text-sm font-medium text-gray-700 mr-2">Search</label>
        <input v-model="search" type="text" placeholder="Cari akun..."
          class="block w-64 px-3 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
        />
      </div>
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
            <th class="px-6 py-3 font-medium text-gray-900 text-center">Info Bank</th>
            <th class="px-6 py-3 font-medium text-gray-900 text-center">Nama Rekening</th>
            <th class="px-6 py-3 font-medium text-gray-900 text-center">Nomor Rekening</th>
            <th class="w-[5%] px-6 py-3 font-medium text-gray-900 text-center">Aksi</th>
          </tr>
        </thead>
        <tbody v-if="data.length > 0" class="divide-y divide-gray-200">
          <tr v-for="d in data" :key="d?.id" class="hover:bg-gray-50 transition-colors">
            <td class="px-6 py-4 text-center">{{ d?.nama_bank }}</td>
            <td class="px-6 py-4 text-center">{{ d?.nama_akun }}</td>
            <td class="px-6 py-4 text-center">{{ d?.nomor_akun }}</td>
            <td class="px-6 py-4 text-center">
              <div class="flex justify-center items-center gap-2">
                <LightButton @click="openModalUpdate(d?.id)"><EditIcon /></LightButton>
                <DangerButton @click="deleteData(d.id)"><DeleteIcon /></DangerButton>
              </div>
            </td>
          </tr>
        </tbody>
        <tbody v-else class="divide-y divide-gray-100 border-t border-gray-100">
          <tr>
            <td :colspan="totalColumns" class="px-6 py-4 text-center text-gray-500">
              Akun Bank tidak di temukan
            </td>
          </tr>
        </tbody>
        <tfoot class="bg-gray-100 font-bold">
          <Pagination :current-page="currentPage" :total-pages="totalPages" :pages="pages" :total-columns="totalColumns" @prev-page="prevPage" @next-page="nextPage" @page-now="pageNow" :totalRow="totalRow"/>
        </tfoot>
      </table>
    </div>
  </div>
  <FormAdd v-if="ModalAdd" :ModalAdd="ModalAdd" @close="ModalAdd = false" @success="handleAdd" />
  <FormUpdate v-if="ModalUpdate" :ModalUpdate="ModalUpdate" :id="selectedId" @close="ModalUpdate = false" @success="handleUpdate" />
  <!-- Modal Konfirmasi Hapus -->
  <Confirmation :showConfirmDialog="showConfirmDialog" confirmTitle="Konfirmasi Hapus" confirmMessage="Apakah Anda yakin ingin menghapus pengguna ini?" >
    <button @click="confirmAction?.()"
      class="inline-flex w-full justify-center rounded-md border border-transparent bg-yellow-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
    >
      Ya
    </button>
    <button @click="showConfirmDialog = false"
      class="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
    >
      Tidak
    </button>
  </Confirmation>
  <Notification :showNotification="showNotification" :notificationType="notificationType" :notificationMessage="notificationMessage" @close="showNotification = false" ></Notification>
</template>
