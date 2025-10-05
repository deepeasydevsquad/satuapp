<script setup lang="ts">
import Confirmation from '@/components/Modal/Confirmation.vue'
import PrimaryButton from '@/components/Button/PrimaryButton.vue'
import InputDate from '@/components/Form/InputDate.vue'
import Form from '@/components/Modal/Form.vue'
import InputText from '@/components/Form/InputText.vue'
import SelectField from '@/components/Form/SelectField.vue'
import TextArea from '@/components/Form/TextArea.vue'
import Notification from '@/components/Modal/Notification.vue'
import InputReadonly from '@/components/Form/InputReadonly.vue'
import LightButton from '@/components/Button/LightButton.vue'
import DangerButton from '@/components/Button/DangerButton.vue'
import DeleteIcon from '@/components/Icons/DeleteIcon.vue'
import CetakIcon from '@/components/Icons/CetakIcon.vue'
import Pagination from '@/components/Pagination/Pagination.vue'
import { ref, watch, computed, onMounted } from 'vue'

import { daftarTransFasilitas, daftar_kostumer, daftar_paket, daftar_fasilitas, add_transaksi, delete_transaksi } from '@/service/trans_fasilitas'
import { paramCabang } from '@/service/param_cabang'

const totalItems = ref(0)
const showModal = ref(false)
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
const FasilitasOption = ref<{ id: number | string; name: string }[]>([])

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
const totalColumns = 7 // karena table punya 5 kolom

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
    const response = await daftarTransFasilitas({
      cabang: selectedOptionCabang.value,
      search: searchQuery.value,
      perpage: itemsPerPage,
      pageNumber: currentPage.value,
    })
    data.value = response.data
    totalItems.value = response.total || response.data.length || 0
    totalPages.value = Math.ceil(response.total / itemsPerPage)
    console.log('Data fetched:', data.value)
  } catch (error) {
    console.error(error)
  }
}

const deleteData = async (id: number) => {
  showConfirmation('Konfirmasi Hapus', 'Apakah Anda yakin ingin menghapus data ini?', async () => {
    try {
      await delete_transaksi(id)
      showConfirmDialog.value = false
      displayNotification('Operasi berhasil!', 'success')
      fetchData()
    } catch (error: any) {
      console.error('Error deleting data:', error)
      displayNotification(error?.response?.data?.error_msg, 'error')
    }
  })
}

const formData = ref({
  // division_id: 0,
  kostumer_id: 0,
  // paket_id: 0,
})

const formFasilitasList = ref([
  {
    id: '0',
  },
])

const addFasilitas = () => {
  formFasilitasList.value.push({
    id: '0',
  })
}

const removeFasilitas = (index: number) => {
  if (formFasilitasList.value.length > 1) {
    formFasilitasList.value.splice(index, 1)
  }
}

const cetak_invoice = (invoice: string) => {
  const printUrl = `/kwitansi-trans-fasilitas/${invoice}`
  window.open(printUrl, '_blank')
}

const errors = ref<{
  kostumer_id?: string
  paket_id?: string
  division_id?: string
  address?: string
  details?: {
    id?: string
    general?: string
  }[]
}>({})

const validateForm = (): boolean => {
  let isValid = true
  errors.value = {}

  if (!formData.value.kostumer_id) {
    errors.value.kostumer_id = 'Kostumer harus dipilih.'
    isValid = false
  }

  if (!SelectedCabang.value || SelectedCabang.value === 0) {
    errors.value.division_id = 'Cabang harus dipilih.'
    isValid = false
  }

  // Validasi list fasilitas
  if (formFasilitasList.value.length === 0) {
    errors.value.details = [{ general: 'Minimal satu fasilitas harus ditambahkan.' }]
    isValid = false
  } else {
    errors.value.details = []

    formFasilitasList.value.forEach((fasilitas, index) => {
      const fasilitasErrors: Record<string, string> = {}

      if (!fasilitas.id || fasilitas.id == '0') {
        fasilitasErrors.id = 'Fasilitas harus dipilih.'
        isValid = false
      }

      errors.value.details[index] = { id: fasilitasErrors.id }
    })
  }

  return isValid
}

const submitForm = async () => {
  if (!validateForm()) {
    return
  }
  try {
    const payload = {
      kostumer_id: formData.value.kostumer_id,
      cabang: SelectedCabang.value,
      fasilitas: formFasilitasList.value.map((fasilitas) => ({
        item_id: fasilitas.id,
      })),
    }

    const response = await add_transaksi(payload)

    const invoice = response?.invoice

    if (!invoice) throw new Error('Invoice tidak ditemukan di response')

    showModal.value = false
    resetForm()

    displayNotification(`Transaksi berhasil! Invoice: ${invoice}`, 'success')

    // 🧾 Open tab baru buat print kwitansi
    const printUrl = `/kwitansi-trans-fasilitas/${invoice}`
    window.open(printUrl, '_blank')

    // refresh data
    fetchData()
  } catch (error: any) {
    console.error('❌ Gagal submit:', error)
    displayNotification(error?.response?.data?.error_msg || 'Gagal menambahkan transaksi', 'error')
  }
}

// <div class="flex-1 min-w-[200px]">
//         <SelectField label="Kostumer" v-model="formData.kostumer_id" :options="customerOption" :error="errors.kostumer_id" />
//       </div>
//       <div class="flex-1 min-w-[200px]">
//         <SelectField label="Cabang" v-model="SelectedCabang" :options="cabangOption" :error="errors.division_id" />
//       </div>

const resetForm = () => {
  SelectedCabang.value = 0
  formData.value = {
    // division_id: 0,
    kostumer_id: 0,
    // paket_id: 0,
  }

  formFasilitasList.value = [
    {
      id: '0',
    },
  ]
}

interface costumer {
  id: number
  name: string
}

const customerOption = ref<costumer[]>([])
const fetchCustomer = async () => {
  try {
    const response = await daftar_kostumer()
    customerOption.value = [{ id: 0, name: 'Pilih Kostumer' }, ...response.data]
  } catch (error) {
    console.error(error)
  }
}

interface cabang {
  id: number
  name: string
}
const cabangOption = ref<cabang[]>([])
const SelectedCabang = ref(0)
const fetchCabang = async () => {
  try {
    const response = await paramCabang()
    cabangOption.value = [{ id: 0, name: 'Pilih Cabang' }, ...response.data]
  } catch (error) {
    console.error(error)
  }
}

const fetchFasilitas = async () => {
  try {
    const response = await daftar_fasilitas({
      division_id: SelectedCabang.value,
    })
    FasilitasOption.value = [
      { id: 0, name: 'Pilih Fasilitas' },
      ...response.data.map((item: any) => ({
        id: item.id,
        name: item.name,
      })),
    ]
  } catch (error) {
    console.error(error)
  }
}

// interface paket {
//   id: number
//   name: string
// }
// const paketOption = ref<paket[]>([{ id: 0, name: 'Pilih Paket' }]) // Tambahkan opsi default
// const fetchPaket = async () => {
//   try {
//     const response = await daftar_paket({
//       division_id: SelectedCabang.value,
//     })
//     paketOption.value = [{ id: 0, name: 'Pilih Paket' }, ...response.data]
//   } catch (error) {
//     console.error(error)
//   }
// }

watch(SelectedCabang, async (newCabang) => {
  if (newCabang) {
    // formData.value.paket_id = 0; // Reset paket saat cabang berubah
    // await fetchPaket()
    await fetchFasilitas();
    // fasilitas
  }
})

// watch(() => formData.value.paket_id, async (newPaketId) => {
//   if (newPaketId) {
//     await fetchFasilitas(newPaketId)
//   } else {
//     FasilitasOption.value = [{ id: 0, name: 'Pilih Fasilitas' }]
//   }
// })

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
  FasilitasOption.value = [
    { id: 0, name: 'Pilih Fasilitas' },
  ]
  await fetchData()
  await fetchCustomer()
  await fetchCabang()
}

onMounted(async () => {
  fetchFilterData()
})
</script>

<template>
  <div class="container mx-auto px-4 mt-10">
    <div class="flex justify-between items-center mb-6">
      <!-- Tombol Tambah di kiri -->
      <PrimaryButton @click="showModal = true">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" >
          <path d="M2 4a2 2 0 012-2h16a2 2 0 012 2v4H2V4zm0 6h20v10a2 2 0 01-2 2H4a2 2 0 01-2-2V10zm4 4a1 1 0 000 2h4a1 1 0 000-2H6z" />
        </svg>
        Tambah Transaksi
      </PrimaryButton>
      <div class="inline-flex rounded-md shadow-xs" role="group">
        <label for="search" class="block text-sm font-medium text-gray-700 mr-2 mt-3">Filter</label>
        <input type="text" id="search"
          class="block w-64 px-3 py-2 text-gray-700 bg-white border border-gray-300 rounded-s-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
          v-model="searchQuery" @change="fetchData()" placeholder="Cari data..." />
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
            <th class="text-center font-medium text-gray-900 px-6 py-3 w-[5%]">Invoice</th>
            <th class="text-center font-medium text-gray-900 px-6 py-3 w-[20%]">Nama Kostumer / Nama Jamaah</th>
            <th class="text-center font-medium text-gray-900 px-6 py-3 w-[15%]">Paket</th>
            <th class="text-center font-medium text-gray-900 px-6 py-3 w-[30%]">Info Fasilitas</th>
            <th class="text-center font-medium text-gray-900 px-6 py-3 w-[10%]">Total</th>
            <th class="text-center font-medium text-gray-900 px-6 py-3 w-[15%]">Tanggal</th>
            <th class="text-center font-medium text-gray-900 px-6 py-3 w-[5%]">Aksi</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200">
          <tr v-if="filteredData.length === 0">
            <td colspan="6" class="text-center py-3 text-gray-500">
              Daftar Transaksi Transport Tidak Ditemukan
            </td>
          </tr>
          <tr v-for="item in filteredData" :key="item.invoice" class="hover:bg-gray-50">
            <td class="text-center px-6 py-4 align-top">{{ item.invoice }}</td>
            <td class="text-center px-6 py-4 align-top">
              <div v-if="item.kostumer_name != '-'">
                <b>Nama Kostumer</b> <br> ({{ item.kostumer_name }})
              </div>
              <div v-else-if="item.tabungan_name != '-'">
                <b>Nama Jamaah</b> <br> ( {{ item.tabungan_name }})
              </div>
              <div v-else-if="item.nama_jamaah != '-'">
                <b>Nama Jamaah</b> <br> ( {{ item.nama_jamaah }})
              </div>
              <div v-else-if="item.kostumer_name">{{ item.kostumer_name }}</div>
              <div v-else-if="item.tabungan_name">{{ item.tabungan_name }}</div>
            </td>
            <td class="text-center px-6 py-4 align-top">
              {{ item.paket_name }}
            </td>
            <td class="px-6 py-4 align-top">
              <div v-if="item.details && item.details.length > 0">
                <div
                  v-for="(detail, idx) in item.details"
                  :key="idx"
                  class="grid grid-cols-[120px_1fr] gap-y-1 items-start"
                >
                  <div>Nama Fasilitas</div>
                  <div>
                    : <strong>{{ detail.fasilitas_name }}</strong>
                  </div>
                  <div>Kode Fasilitas</div>
                  <div>
                    : <strong>{{ detail.item_code }}</strong>
                  </div>
                  <div>Status</div>
                  <div>: {{ detail.status }}</div>
                  <div>Harga Fasilitas</div>
                  <div>: Rp {{ detail.harga?.toLocaleString() }}</div>
                  <hr class="my-2 border-dashed" />
                </div>
              </div>
              <div v-else class="text-center py-2 text-gray-500">
                Belum ada info fasilitas
              </div>

            </td>
            <td class="text-center px-6 py-4 align-top">
              Rp {{ item.total_harga?.toLocaleString() }}
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
          <Pagination :total-row="totalItems" :currentPage="currentPage" :totalPages="totalPages" :pages="pages" :totalColumns="totalColumns" @prev-page="handlePrev" @next-page="handleNext" @page-now="handlePageNow"/>
        </tfoot>
      </table>
    </div>
  </div>
  <Form :formStatus="showModal" @cancel="() => { showModal = false; resetForm(); }" @submit="submitForm" :submitLabel="'Simpan'" :width="'w-1/3'" :label="'Tambah Transaksi Fasilitas'" >
    <div class="flex flex-wrap gap-4">
      <div class="flex-1 min-w-[200px]">
        <SelectField label="Kostumer" v-model="formData.kostumer_id" :options="customerOption" :error="errors.kostumer_id" />
      </div>
      <div class="flex-1 min-w-[200px]">
        <SelectField label="Cabang" v-model="SelectedCabang" :options="cabangOption" :error="errors.division_id" />
      </div>
      <!--
      <div class="flex-1 min-w-[200px]">
        <SelectField label="Paket" v-model="formData.paket_id" :options="paketOption" :error="errors.paket_id" />
      </div>
      -->
    </div>
    <div class="mt-6">
      <h3 class="font-semibold text-sm mb-2">Detail Fasilitas</h3>
      <table class="table-auto w-full">
        <thead class="bg-gray-100 text-sm text-gray-700">
          <tr class="text-center">
            <th class="w-[90%] px-4 py-3">Info Fasilitas</th>
            <th class="w-[10%] px-4 py-3">Aksi</th>
          </tr>
        </thead>
        <tbody class="align-top border-t border-gray-200">
          <tr v-for="(fasilitas, index) in formFasilitasList" :key="index" class="hover:bg-gray-100 border-b border-dashed border-gray-700 pt-4" >
            <td class="px-4 py-2">
              <SelectField v-model="fasilitas.id" placeholder="Pilih Fasilitas" :options="FasilitasOption" :error="errors.details?.[index]?.id"/>
            </td>
            <td class="px-4 py-2 text-center">
              <DangerButton class="mt-2.5" @click="removeFasilitas(index)">
                <DeleteIcon class="w-5 h-5" />
              </DangerButton>
            </td>
          </tr>
        </tbody>
      </table>
      <div class="mt-4 flex justify-end">
        <PrimaryButton @click="addFasilitas">
          <font-awesome-icon icon="fa-solid fa-plus"></font-awesome-icon>
          Tambah Fasilitas
        </PrimaryButton>
      </div>
    </div>
  </Form>
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
  <Notification :showNotification="showNotification" :notificationType="notificationType" :notificationMessage="notificationMessage" @close="showNotification = false" />
</template>
