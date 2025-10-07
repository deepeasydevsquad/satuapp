<script setup lang="ts">
import { daftar_pembayaran_gaji, delete_pembayaran } from '@/service/pembayaran_gaji'
import { paramCabang } from '@/service/param_cabang'
import { ref, onMounted, watch, computed } from 'vue'
import Pagination from '@/components/Pagination/Pagination.vue'
import DeleteIcon from '@/components/Icons/DeleteIcon.vue'
import DangerButton from '@/components/Button/DangerButton.vue'
import PrimaryButton from '@/components/Button/PrimaryButton.vue'
import IconMoney from '@/components/Icons/IconMoney.vue'
import FormPembayaran from './widget/FormPembayaran.vue'
import Notification from '@/components/Modal/Notification.vue'
import Confirmation from '@/components/Modal/Confirmation.vue'

const itemsPerPage = 100 // Jumlah paket_la per halaman
const currentPage = ref(1)
const totalPages = ref(0)
const totalColumns = ref(5)

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

const pages = computed(() => {
  return Array.from({ length: totalPages.value }, (_, i) => i + 1)
})

interface PembayaranGaji {
  id: number
  name: string
  identity_number: number
  whatsapp_number: string
  invoice: string
  nominal: number
  division: string
}

interface Cabang {
  id: number
  name: string
}

const pembayaranGajiList = ref<PembayaranGaji[]>([])
const cabangList = ref<Cabang[]>([])
const selectedOptionCabang = ref(0)
const search = ref('')
const showModal = ref(false)
const totalItems = ref(0)

const fetchFilterData = async () => {
  const response = await paramCabang()
  cabangList.value = response.data
  selectedOptionCabang.value = response.data[0].id
  await fetchData()
}

const fetchData = async () => {
  try {
    const response = await daftar_pembayaran_gaji({
      search: search.value,
      perpage: itemsPerPage,
      pageNumber: currentPage.value,
      cabang: selectedOptionCabang.value,
    })
    pembayaranGajiList.value = response.data
    totalItems.value = response.total || response.data.length || 0
    totalPages.value = Math.ceil(response.total / itemsPerPage)
  } catch (error) {
    console.error('Error fetching data:', error)
  }
}

onMounted(() => {
  fetchFilterData()
})

const ModalPembayaran = ref(false)

const showModalPembayaran = () => {
  ModalPembayaran.value = true
}

const showNotification = ref(false)
const notificationMessage = ref('')
const notificationType = ref('')
const showConfirmDialog = ref(false)
const confirmMessage = ref('')
const confirmTitle = ref('')
const confirmAction = ref<(() => void) | null>(null)
const timeoutId = ref<number | null>(null)

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

const handleSucces = () => {
  displayNotification('Pembayaran Berhasil', 'success')
  ModalPembayaran.value = false
}

const confirmDelete = (id: number) => {
  confirmTitle.value = 'Hapus Riwayat'
  confirmMessage.value = 'Apakah Anda yakin ingin menghapus data ini?'
  confirmAction.value = async () => {
    try {
      await delete_pembayaran({ id: id })
      fetchData()
      showConfirmDialog.value = false
      showNotification.value = true
      notificationType.value = 'success'
      notificationMessage.value = 'Data berhasil dihapus'
    } catch (error) {
      console.error('Gagal menghapus data:', error)
      showNotification.value = true
      notificationType.value = 'error'
      notificationMessage.value = 'Gagal menghapus data'
    }
  }
  showConfirmDialog.value = true
}
</script>

<template>
  <div class="container mx-auto px-4 mt-10">
    <div class="flex justify-between items-center mb-6">
      <!-- Tombol Tambah di kiri -->
      <PrimaryButton @click="showModalPembayaran()" class="flex items-center gap-2">
        <IconMoney />
        Bayar Gaji
      </PrimaryButton>

      <div class="flex items-center gap-0">
        <label for="search" class="block text-sm font-medium text-gray-700 mr-2">Search</label>
        <input
          v-model="search"
          @input="fetchData()"
          type="text"
          id="search"
          class="w-64 px-3 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-s-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
          placeholder="Cari Pembayaran..."
        />
        <select
          v-model="selectedOptionCabang"
          @change="fetchData()"
          class="w-60 px-3 py-2 text-sm bg-white border border-l-0 border-gray-300 text-gray-700 rounded-e-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
        >
          <option v-for="optionC in cabangList" :key="optionC.id" :value="optionC.id">
            {{ optionC.name }}
          </option>
        </select>
      </div>
    </div>

    <div class="overflow-hidden rounded-lg border border-gray-200 shadow-md">
      <table class="w-full border-collapse bg-white text-left text-sm text-gray-500">
        <thead class="bg-gray-50">
          <tr class="bg-gray-100">
            <th class="w-[10%] px-6 py-3 font-medium font-bold text-gray-900 text-center">
              Invoice
            </th>
            <th class="w-[20%] px-6 py-3 font-medium font-bold text-gray-900 text-center">
              Nominal
            </th>
            <th class="w-[45%] px-6 py-3 font-medium font-bold text-gray-900 text-center">
              Info Staff
            </th>
            <th class="w-[20%] px-6 py-3 font-medium font-bold text-gray-900 text-center">
              Cabang
            </th>
            <th class="w-[5%] px-6 py-3 font-medium font-bold text-gray-900 text-center">Aksi</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr v-if="pembayaranGajiList.length === 0">
            <td :colspan="totalColumns" class="text-center text-gray-500 py-3">
              Tidak ada data pembayaran gaji
            </td>
          </tr>
          <tr v-for="(item, index) in pembayaranGajiList" :key="item.id">
            <td class="px-6 py-4 text-center font-medium text-gray-900">
              {{ item.invoice }}
            </td>
            <td class="px-6 py-4 text-center font-medium text-gray-900">
              Rp{{ item.nominal.toLocaleString('id-ID') }}
            </td>
            <td class="px-6 py-4 text-left">
              <div class="text-sm font-medium text-gray-900 flex gap-2">
                <span class="w-20">Nama</span> : <span>{{ item.name }}</span>
              </div>
              <div class="text-sm font-medium text-gray-900 flex gap-2">
                <span class="w-20">NIK</span> : <span>{{ item.identity_number }}</span>
              </div>
              <div class="text-sm font-medium text-gray-900 flex gap-2">
                <span class="w-20">WA</span> : <span>{{ item.whatsapp_number }}</span>
              </div>
            </td>

            <td class="px-6 py-4 text-center text-gray-900">
              {{ item.division }}
            </td>
            <td class="px-6 py-4">
              <div class="flex items-center justify-center h-full">
                <DangerButton @click="confirmDelete(item.id)" class="mr-2">
                  <DeleteIcon class="w-4 h-4" />
                </DangerButton>
              </div>
            </td>
          </tr>
        </tbody>

        <tfoot class="bg-gray-100 font-bold">
          <Pagination
            :current-page="currentPage"
            :total-pages="totalPages"
            :pages="pages"
            :total-columns="totalColumns"
            :total-row="totalItems"
            @prev-page="prevPage"
            @next-page="nextPage"
            @page-now="pageNow"
          />
        </tfoot>
      </table>
    </div>
  </div>

  <Notification
    :showNotification="showNotification"
    :notificationType="notificationType"
    :notificationMessage="notificationMessage"
    @close="showNotification = false"
  />

  <Confirmation
    :showConfirmDialog="showConfirmDialog"
    :confirmTitle="confirmTitle"
    :confirmMessage="confirmMessage"
  >
    <button
      @click="confirmAction"
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

  <FormPembayaran :modalPembayaran="ModalPembayaran"  @cancel="ModalPembayaran = false" @close="ModalPembayaran = false" @submit="
      () => {
        fetchFilterData()
        handleSucces()
      }
    "
  />
</template>
