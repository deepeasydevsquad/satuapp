<script setup lang="ts">
import Confirmation from '@/components/Modal/Confirmation.vue'
import PrimaryButton from '@/components/Button/PrimaryButton.vue'
import InputDate from '@/components/Form/InputDate.vue'
// import Form from '@/components/Modal/Form.vue'
// import InputText from '@/components/Form/InputText.vue'
// import SelectField from '@/components/Form/SelectField.vue'
// import TextArea from '@/components/Form/TextArea.vue'
import Notification from '@/components/Modal/Notification.vue'
import InputReadonly from '@/components/Form/InputReadonly.vue'
import LightButton from '@/components/Button/LightButton.vue'
import DangerButton from '@/components/Button/DangerButton.vue'
import DeleteIcon from '@/components/Icons/DeleteIcon.vue'
import CetakIcon from '@/components/Icons/CetakIcon.vue'
import Pagination from '@/components/Pagination/Pagination.vue'
import FormAdd from './Widget/FormAdd.vue'
import { ref, watch, computed, onMounted } from 'vue'
import { daftar_transaksi, add_transaksi, delete_transaksi, daftar_mobil, daftar_kostumer, daftar_paket } from '@/service/trans_transport'
import { paramCabang } from '@/service/param_cabang'

// const showModalDetail = ref(false)
const totalItems = ref(0)
const showModal = ref(false)
const search = ref('')
const itemsPerPage = 10
const currentPage = ref(1)
const totalPages = ref(1)
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

const showConfirmation = (title: string, message: string, action: () => void) => {
  confirmTitle.value = title
  confirmMessage.value = message
  confirmAction.value = action
  showConfirmDialog.value = true
}

const pages = computed<number[]>(() => {
  return Array.from({ length: totalPages.value }, (_, i) => i + 1)
})
const totalColumns = 6 // karena table punya 5 kolom

const searchQuery = ref('')

const handlePrev = () => {
  if (currentPage.value > 1) currentPage.value--
}
const handleNext = () => {
  if (currentPage.value < totalPages.value) currentPage.value++
}
const handlePageNow = (page: number) => {
  currentPage.value = page
}

const filteredData = computed(() => {
  if (!searchQuery.value) return data.value

  const keyword = searchQuery.value.toLowerCase()

  return data.value.filter(
    (item) =>
      item.invoice?.toLowerCase().includes(keyword) ||
      item.nama_mobil?.toLowerCase().includes(keyword) ||
      item.car_number?.toLowerCase().includes(keyword),
  )
})

const data = ref<any[]>([]) // array kosong

const fetchData = async () => {
  try {
    // const response = await get_paket_agen({ paket_id: props.paketId })
    const response = await daftar_transaksi({
      cabang: selectedOptionCabang.value,
      search: searchQuery.value,
      perpage: itemsPerPage,
      pageNumber: currentPage.value,
    })
    data.value = response.data
    totalItems.value = response.total || response.data.length || 0
    totalPages.value = Math.ceil(response.total / itemsPerPage)
  } catch (error) {
    console.error(error)
  }
}

const deleteData = async (id: number) => {
  showConfirmation('Konfirmasi Hapus', 'Apakah Anda yakin ingin menghapus data ini?', async () => {
    try {
      await delete_transaksi({ id: id })
      showConfirmDialog.value = false
      displayNotification('Operasi berhasil!', 'success')
      fetchData()
    } catch (error) {
      console.error('Error deleting data:', error)
      displayNotification(error?.response?.data?.error_msg, 'error')
    }
  })
}

const cetak_invoice = (invoice: string) => {
  const printUrl = `/kwitansi-trans-transport/${invoice}`
  window.open(printUrl, '_blank')
}

interface filterCabang {
  id: number
  name: string
}
const selectedOptionCabang = ref(0)
const optionFilterCabang = ref<filterCabang[]>([])
const fetchFilterData = async () => {
  const response = await paramCabang()
  optionFilterCabang.value = response.data
  selectedOptionCabang.value = response.data[0].id
  await fetchData()
}

onMounted(() => {
  fetchFilterData();
})

</script>

<template>
  <div class="container mx-auto px-4 mt-10">
    <div class="flex justify-between items-center mb-6">
      <PrimaryButton @click="showModal = true">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M2 4a2 2 0 012-2h16a2 2 0 012 2v4H2V4zm0 6h20v10a2 2 0 01-2 2H4a2 2 0 01-2-2V10zm4 4a1 1 0 000 2h4a1 1 0 000-2H6z" />
        </svg>
        Tambah Transaksi
      </PrimaryButton>
      <div class="inline-flex rounded-md shadow-xs" role="group">
        <label for="search" class="block text-sm font-medium text-gray-700 mr-2 mt-3">Filter</label>
        <input type="text" id="search"
          class="block w-64 px-3 py-2 text-gray-700 bg-white border border-gray-300 rounded-s-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
          v-model="search" @change="fetchData()" placeholder="Cari data..." />
        <select v-model="selectedOptionCabang" style="width: 300px" @change="fetchData()" class="border-t border-b border-e bg-gray-50 border-gray-300 text-gray-900 text-sm rounded-e-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
        >
          <option v-for="optionC in optionFilterCabang" :key="optionC.id" :value="optionC.id">
            {{ optionC.name }}
          </option>
        </select>
      </div>
    </div>
    <div class="overflow-hidden rounded-lg border border-gray-200 shadow-md">
      <table class="w-full border-collapse bg-white text-left text-sm text-gray-500">
        <thead class="bg-gray-100">
          <tr>
            <th class="text-center font-medium text-gray-900 px-6 py-3 w-[10%]">Invoice</th>
            <th class="text-center font-medium text-gray-900 px-6 py-3 w-[20%]">Nama Kostumer / Paket</th>
            <th class="text-center font-medium text-gray-900 px-6 py-3 w-[35%]">Info Transport</th>
            <th class="text-center font-medium text-gray-900 px-6 py-3 w-[15%]">Total</th>
            <th class="text-center font-medium text-gray-900 px-6 py-3 w-[15%]">Tanggal</th>
            <th class="text-center font-medium text-gray-900 px-6 py-3 w-[5%]">Aksi</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200">
          <tr v-if="filteredData.length === 0">
            <td colspan="6" class="text-center py-3 text-gray-500">Daftar Transaksi Transport Tidak Ditemukan</td>
          </tr>
          <tr v-for="item in filteredData" :key="item.invoice" class="hover:bg-gray-50">
            <td class="text-center px-6 py-4 align-top">{{ item.invoice }}</td>
            <td class="text-center px-6 py-4 align-top">
              <span v-if="item.kostumer != '-'">
                Nama Kostumer : <br> {{ item.kostumer}}
              </span>
              <span v-if="item.paket != '-'">
                Nama Paket : <br> {{ item.paket}}
              </span>
            </td>
            <td class="px-6 py-4 align-top">

              <table class="w-full mb-5 border-b border-dashed border-gray-300" v-for="(mobil, idx) in item.detail_mobil" :key="idx">
                <tbody>
                  <tr>
                    <td class="w-[40%] px-0 py-2">Nama Mobil</td>
                    <td class="text-center py-2">:</td>
                    <td class="text-right space-y-2 text-sm px-0 py-2">{{ mobil.nama_mobil }}</td>
                  </tr>
                  <tr>
                    <td class="px-0 py-2">Plat Mobil</td>
                    <td class="text-center py-2">:</td>
                    <td class="text-right space-y-2 text-sm px-0 py-2">{{ mobil.car_number }}</td>
                  </tr>
                  <tr>
                    <td class="px-0 py-2">Harga Travel Per Paket</td>
                    <td class="text-center py-2">:</td>
                    <td class="text-right space-y-2 text-sm bordepx-6 px-0 py-2"><b>Rp {{ mobil.travel_price?.toLocaleString() }}</b></td>
                  </tr>
                  <tr>
                    <td class="px-0 pt-2 pb-4">Harga Kostumer Per Paket</td>
                    <td class="text-center pt-2 pb-4">:</td>
                    <td class="text-right space-y-2 text-sm px-0 pt-2 pb-4"><b>Rp {{ mobil.costumer_price?.toLocaleString() }}</b></td>
                  </tr>
                </tbody>
              </table>
             </td>
            <td class="text-center px-6 py-4 align-top">
              <div class="mb-4"><span> <b>Harga Travel</b> <br> Rp {{ item.total_travel_price?.toLocaleString() }}</span></div>
              <div class="mb-4"><span> <b>Harga Kostumer</b> <br> Rp {{ item.total_costumer_price?.toLocaleString() }}</span></div>
            </td>
            <td class="text-center px-6 py-4 align-top">{{ item.tanggal_transaksi }}</td>
            <td class="px-6 py-4 text-center align-top">
              <div class="flex flex-col items-center gap-2">
                <LightButton @click="cetak_invoice(item.invoice)">
                  <CetakIcon class="h-4 w-4 text-gray-600" />
                </LightButton>
                <DangerButton @click="deleteData(item.id)">
                  <DeleteIcon class="w-5 h-5" />
                </DangerButton>
              </div>
            </td>
          </tr>
        </tbody>
        <tfoot class="bg-gray-100 font-bold">
          <Pagination :total-row="totalItems" :currentPage="currentPage" :totalPages="totalPages" :pages="pages" :totalColumns="totalColumns" @prev-page="handlePrev" @next-page="handleNext" @page-now="handlePageNow" />
        </tfoot>
      </table>
    </div>
  </div>
  <FormAdd  :showModal="showModal"  @cancel="showModal = false" @submit="showModal = false; fetchData();" />
  <Confirmation :showConfirmDialog="showConfirmDialog" :confirmTitle="confirmTitle" :confirmMessage="confirmMessage">
    <button @click="confirmAction && confirmAction()"
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
  <Notification :showNotification="showNotification" :notificationType="notificationType" :notificationMessage="notificationMessage" @close="showNotification = false"/>
</template>
