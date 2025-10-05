<script setup lang="ts">
import DangerButton from '@/components/Button/DangerButton.vue'
import DeleteIcon from '@/components/Icons/DeleteIcon.vue'
import Confirmation from '@/components/Modal/Confirmation.vue'
import Notification from '@/components/Modal/Notification.vue'
import Pagination from '@/components/Pagination/Pagination.vue'
import { hapus, list } from '@/service/items_fasilitas'
import { paramCabang } from '@/service/param_cabang'
import { computed, onMounted, ref } from 'vue'

interface ItemFasilitas {
  id: number
  item_code: string
  status: string
  harga_beli: string
  harga_jual: string
  createdAt: Date
  updatedAt: Date
  fasilitas_name: string
}

interface filterCabang {
  id: number
  name: string
}

const data = ref<ItemFasilitas[]>([])
const totalPages = ref(0)
const itemsPerPage = ref(100)
const currentPage = ref(1)
const totalRow = ref(0)
const searchQuery = ref('')
const timeoutId = ref<number | null>(null)
const searchTimeout = ref<number | null>(null)
const selectedStatus = ref('') // '' = semua
const selectedOptionCabang = ref(0)
const optionFilterCabang = ref<filterCabang[]>([])
const totalColumns = ref(6)

const pages = computed(() => {
  return Array.from({ length: totalPages.value }, (_, i) => i + 1)
})

const fetchData = async () => {
  try {
    const response = await list({
      cabang: selectedOptionCabang.value,
      search: searchQuery.value,
      perpage: itemsPerPage.value,
      pageNumber: currentPage.value,
      status: selectedStatus.value || undefined, // kalau kosong, kirim undefined
    })
    data.value = response.data || []
    totalRow.value = response.total
    totalPages.value = Math.ceil(response.total / itemsPerPage.value)
    console.log('data', data.value)
  } catch (error) {
    console.error('Error fetching data:', error)
  }
}

const fetchFilterData = async () => {
  const response = await paramCabang()
  optionFilterCabang.value = response.data
  selectedOptionCabang.value = response.data[0].id
  await fetchData()
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

const pageNow = (page: number) => {
  currentPage.value = page
  fetchData()
}

const handleSearch = () => {
  currentPage.value = 1
  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value)
  }

  searchTimeout.value = window.setTimeout(() => {
    fetchData()
  }, 500)
}

onMounted(() => {
  fetchFilterData()
})

const confirmMessage = ref<string>('')
const confirmTitle = ref<string>('')
const confirmAction = ref<(() => void) | null>(null)
const showNotification = ref<boolean>(false)
const showConfirmDialog = ref<boolean>(false)
const notificationMessage = ref<string>('')
const notificationType = ref<'success' | 'error'>('success')

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

const formatRupiah = (angka: any, prefix = 'Rp ') => {
  let numberString = angka.toString().replace(/\D/g, ''),
    split = numberString.split(','),
    sisa = split[0].length % 3,
    rupiah = split[0].substr(0, sisa),
    ribuan = split[0].substr(sisa).match(/\d{3}/g)

  if (ribuan) {
    let separator = sisa ? '.' : ''
    rupiah += separator + ribuan.join('.')
  }

  return prefix + (rupiah || '0')
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
</script>

<template>
  <div class="container mx-auto p-4">
    <div class="flex justify-between items-center mb-6 flex-wrap gap-4">
      <div class="flex items-center gap-2"></div>
      <div class="inline-flex rounded-md shadow-xs" role="group">
        <input
          type="text"
          id="search"
          class="block w-64 px-3 py-2 text-gray-700 bg-white border border-gray-300 rounded-s-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
          v-model="searchQuery"
          @input="handleSearch"
          placeholder="Cari data..."
        />
        <select
          v-model="selectedOptionCabang"
          style="width: 300px"
          @change="fetchData()"
          class="border-t border-b border-e bg-gray-50 border-gray-300 text-gray-900 text-sm rounded-e-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
        >
          <option v-for="optionC in optionFilterCabang" :key="optionC.id" :value="optionC.id">
            {{ optionC.name }}
          </option>
        </select>
        <select
          id="status"
          v-model="selectedStatus"
          @change="fetchData"
          class="px-3 py-2 ml-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
        >
          <option value="">Semua</option>
          <option value="terjual">Terjual</option>
          <option value="belum_terjual">Belum Terjual</option>
        </select>
      </div>
    </div>
    <div class="overflow-x-auto rounded-lg border border-gray-200 shadow-md">
      <table class="w-full border-collapse bg-white text-left text-sm text-gray-500">
        <thead class="bg-gray-100">
          <tr>
            <th class="w-[10%] px-6 py-4 font-medium text-gray-900 text-center">Code</th>
            <th class="w-[30%] px-6 py-4 font-medium text-gray-900 text-center">Nama</th>
            <th class="w-[20%] px-6 py-4 font-medium text-gray-900 text-center">Harga Beli</th>
            <th class="w-[20%] px-6 py-4 font-medium text-gray-900 text-center">Harga Jual</th>
            <th class="w-[10%] px-6 py-4 font-medium text-gray-900 text-center">Status</th>
            <th class="w-[10%] px-6 py-4 font-medium text-gray-900 text-center w-28">Aksi</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100 border-t border-gray-100">
          <template v-if="data.length > 0">
            <tr v-for="d in data" :key="d.id" class="hover:bg-gray-50 transition-colors">
              <td class="px-6 py-4 text-center align-top text-sm font-medium text-gray-700">
                {{ d.item_code }}
              </td>
              <td class="px-6 py-4 text-center align-top space-y-2 text-sm text-gray-600">
                {{ d.fasilitas_name }}
              </td>
              <td class="px-6 py-4 text-center align-top space-y-2 text-sm text-gray-600">
                {{ formatRupiah(d.harga_beli) }}
              </td>
              <td class="px-6 py-4 text-center align-top space-y-2 text-sm text-gray-600">
                {{ formatRupiah(d.harga_jual) }}
              </td>
              <td class="px-6 py-4 text-center align-top space-y-2 text-sm text-gray-600">
                {{ d.status.replace(/_/g, ' ').toUpperCase() }}
              </td>

              <td class="px-6 py-4 text-center">
                <div class="flex justify-center gap-2">
                  <DangerButton v-if="d.status !== 'terjual'" @click="deleteData(d.id)">
                    <DeleteIcon />
                  </DangerButton>
                </div>
              </td>
            </tr>
          </template>
          <template v-else>
            <tr>
              <td colspan="4" class="px-2 py-2 text-center align-top">
                Daftar Fasilitas Tidak Ditemukan
              </td>
            </tr>
          </template>
        </tbody>
        <tfoot class="bg-gray-100 font-bold">
          <Pagination
            :currentPage="currentPage"
            :totalPages="totalPages"
            :pages="pages"
            :totalColumns="totalColumns"
            @prev-page="prevPage"
            @next-page="nextPage"
            @page-now="pageNow"
            :totalRow="totalRow"
          />
        </tfoot>
      </table>
    </div>
  </div>

  <!-- Modal Konfirmasi Hapus -->
  <Confirmation
    :showConfirmDialog="showConfirmDialog"
    confirmTitle="Konfirmasi Hapus"
    confirmMessage="Apakah Anda yakin ingin menghapus pengguna ini?"
  >
    <button
      @click="confirmAction?.()"
      class="inline-flex w-full justify-center rounded-md border border-transparent bg-yellow-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
    >
      Ya
    </button>
    <button
      @click="showConfirmDialog = false"
      class="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
    >
      Tidak
    </button>
  </Confirmation>

  <Notification
    :showNotification="showNotification"
    :notificationType="notificationType"
    :notificationMessage="notificationMessage"
    @close="showNotification = false"
  ></Notification>
</template>
