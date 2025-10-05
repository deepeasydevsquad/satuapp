<script setup lang="ts">
import Confirmation from '@/components/Modal/Confirmation.vue'
import PrimaryButton from '@/components/Button/PrimaryButton.vue'
import Form from '@/components/Modal/Form.vue'
import InputText from '@/components/Form/InputText.vue'
import SelectField from '@/components/Form/SelectField.vue'
import TextArea from '@/components/Form/TextArea.vue'
import Notification from '@/components/Modal/Notification.vue'
import InputReadonly from '@/components/Form/InputReadonly.vue'
import LightButton from '@/components/Button/LightButton.vue'
import DangerButton from '@/components/Button/DangerButton.vue'
import IconDetail from '@/components/Icons/IconDetail.vue'
import CetakIcon from '@/components/Icons/CetakIcon.vue'
import Pagination from '@/components/Pagination/Pagination.vue'
import { ref, watch, computed, onMounted } from 'vue'
import { paramCabang } from '@/service/param_cabang'

const showModalDetail = ref(false)
const showModal = ref(false)
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
const selectedOptionCabang = ref(0)
const optionFilterCabang = ref<filterCabang[]>([])
const search = ref('')
const itemsPerPage = ref(10)
const totalItems = ref(0)
const formCabangId = ref<number | 0>(0)
const errors = ref<Record<string, string>>({})

import {
  daftar_agen,
  daftar_fee,
  daftar_pembayaran,
  detail_fee,
  add_pembayaran_fee,
} from '@/service/pembayaran_fee_agen'
import { on } from 'events'
import IconPlus from '@/components/Icons/IconPlus.vue'
import IconMoney from '@/components/Icons/IconMoney.vue'

const validateForm = (): boolean => {
  let isValid = true
  errors.value = {}

  if (formCabangId.value == 0) {
    errors.value.cabang = 'Anda wajib memilih salah satu Cabang.'
    isValid = false
  }

  if (!applicantName.value.trim()) {
    errors.value.nama = 'Nama pemohon wajib diisi.'
    isValid = false
  }

  if (!applicantIdentity.value.trim()) {
    errors.value.identitas = 'Identitas pemohon wajib diisi.'
    isValid = false
  }

  if (selectedAgenId.value == 0) {
    errors.value.agen = 'Agen harus dipilih.'
    isValid = false
  }

  if (selectedFees.value.length === 0) {
    errors.value.fee = 'Minimal satu fee harus dipilih.'
    isValid = false
  }

  return isValid
}

interface filterCabang {
  id: number
  name: string
}

const fetchFilterData = async () => {
  const response = await paramCabang()
  optionFilterCabang.value = [
    { id: 0, name: 'Pilih Cabang' },
    ...response.data.map((item: any) => ({
      id: item.id,
      name: `${item.name}`,
    })),
  ];
  selectedOptionCabang.value = response.data[0]?.id || 0

  await get_data_agen()
  await fetch_data_pembayaran_fee_agen()
}

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
const totalColumns = 5 // karena table punya 5 kolom

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

onMounted(() => {
  get_data_agen()
  fetchFilterData()
})

const selectedAgenId = ref<number>(0) // v-model di select

const get_data_agen = async (cabangId?: number) => {
  try {
    const response = await daftar_agen({
      division_id: cabangId || selectedOptionCabang.value,
    })

    agenOptions.value = [
    { id: 0, name: 'Pilih Agen' },
    ...response.map((item: any) => ({
      id: item.id,
      name: `${item.name} `,
    })),
  ];

  selectedAgenId.value = 0;
  } catch (error) {
    console.error(error)
  }
}

const agenOptions = ref<{ id: number | string; name: string }[]>([])

const selectedFees = ref<number[]>([]) // id fee yang dicentang
const feeList = ref<any[]>([]) // dari API daftar_fee
const totalSelectedFee = computed(() => {
  return feeList.value
    .filter((fee) => selectedFees.value.includes(fee.id))
    .reduce((acc, fee) => {
      // convert "Rp 120.000" ke angka
      const numeric = parseInt(fee.nominal.replace(/[^\d]/g, ''))
      return acc + numeric
    }, 0)
})

const fetchFeeByAgen = async (agenId: string | number) => {
  try {
    const response = await daftar_fee({ agen_id: agenId })
    feeList.value = response
    selectedFees.value = []
  } catch (err) {
    console.error('Gagal ambil fee:', err)
  }
}

const resetForm = () => {
  formCabangId.value = 0
  selectedAgenId.value = ''
  feeList.value = []
  selectedFees.value = []
}

watch(formCabangId, async (val) => {
  if (!val) return
  selectedAgenId.value = ''
  feeList.value = []
  await get_data_agen(val)
})

watch(selectedAgenId, (val) => {
  if (val) {
    fetchFeeByAgen(val)
  }
})

const data = ref<any[]>([]) // array kosong

const fetch_data_pembayaran_fee_agen = async () => {
  try {
    const response = await daftar_pembayaran({
      search: searchQuery.value,
      perpage: itemsPerPage.value,
      pageNumber: currentPage.value,
      cabang: selectedOptionCabang.value,
    })
    data.value = response.data
    totalItems.value = response.total || response.data.length || 0
    totalPages.value = Math.ceil(totalItems.value / itemsPerPage.value)
  } catch (error) {
    console.error(error)
  }
}

const data_detail = ref<any[]>([])

const detail_fee_pembayaran = async (id_pembayaran: any) => {
  showModalDetail.value = true
  try {
    const response = await detail_fee({ id_pembayaran: id_pembayaran })
    data_detail.value = response
    console.log('data detail', data_detail.value)
  } catch (error) {}
}

const resetDetail = () => {
  data_detail.value = []
}

const filteredData = computed(() => {
  if (!searchQuery.value) return data.value
  const keyword = searchQuery.value.toLowerCase()
  return data.value.filter(
    (pembayaran) =>
      pembayaran.invoice.toLowerCase().includes(keyword) ||
      pembayaran.applicant_name.toLowerCase().includes(keyword) ||
      pembayaran.penerima.toLowerCase().includes(keyword),
  )
})

const applicantName = ref('')
const applicantIdentity = ref('')
const latestInvoice = ref<string | null>(null)

const submitForm = async () => {
  if (!validateForm()) return
  try {
    const payload = {
      division_id: formCabangId.value,
      agen_id: selectedAgenId.value,
      aplicant_name: applicantName.value,
      applicant_identity: applicantIdentity.value,
      fee_agen_id: selectedFees.value,
      nominal: totalSelectedFee.value,
    }

    const response = await add_pembayaran_fee(payload)

    if (response && response.invoice) {
      latestInvoice.value = response.invoice
      displayNotification(`Pembayaran berhasil! Invoice: ${response.invoice}`, 'success')

      // 🧾 Open new tab buat cetak invoice
      const printUrl = `/kwitansi-pembayaran-fee-agen/${response.invoice}`
      window.open(printUrl, '_blank') // Tab baru
    } else {
      displayNotification('Pembayaran berhasil, tapi invoice tidak ditemukan.', 'warning')
    }

    showModal.value = false
    resetForm()
    fetch_data_pembayaran_fee_agen()
  } catch (error) {
    console.error(error)
    displayNotification('Pembayaran gagal, coba lagi.', 'error')
  }
}

const cetak_invoice = (invoice: string) => {
  const printUrl = `/kwitansi-pembayaran-fee-agen/${invoice}`
  window.open(printUrl, '_blank')
}
</script>

<template>
  <div class="container mx-auto px-4 mt-10">
    <div class="flex justify-between items-center mb-6">
      <!-- Tombol Tambah di kiri -->
      <PrimaryButton @click="showModal = true" class="flex items-center gap-2">
        <IconMoney />
        Bayar Fee Agen
      </PrimaryButton>

      <div class="flex items-center gap-0">
        <label for="search" class="block text-sm font-medium text-gray-700 mr-2">Search</label>
        <input
          v-model="searchQuery"
          type="text"
          id="search"
          class="w-64 px-3 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-s-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
          placeholder="Cari Pembayaran..."
        />
        <select
          v-model="selectedOptionCabang"
          @change="fetch_data_pembayaran_fee_agen"
          class="w-60 px-3 py-2 text-sm bg-white border border-l-0 border-gray-300 text-gray-700 rounded-e-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
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
            <th class="px-6 py-3 font-medium text-gray-900 text-center w-[20%]">Nomor Invoice</th>
            <th class="px-6 py-3 font-medium text-gray-900 text-center w-[15%]">
              Total Pembayaran
            </th>
            <th class="px-6 py-3 font-medium text-gray-900 text-center w-[25%]">
              Penerima Pembayaran
            </th>
            <th class="px-6 py-3 font-medium text-gray-900 text-center w-[25%]">
              Petugas Pembayaran
            </th>
            <th class="px-6 py-3 font-medium text-gray-900 text-center w-[15%]">Aksi</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200">
          <tr v-if="filteredData.length === 0">
            <td colspan="5" class="px-6 py-4 text-center text-gray-500">
              Riwayat Pembayaran Fee Agen Tidak Ditemukan
            </td>
          </tr>
          <tr
            v-for="pembayaran in filteredData"
            :key="pembayaran.id"
            class="hover:bg-gray-50 transition-colors"
          >
            <td class="px-6 py-4 text-center">{{ pembayaran.invoice }}</td>
            <td class="px-6 py-4 text-center">{{ pembayaran.nominal }}</td>
            <td class="px-6 py-4 text-center">{{ pembayaran.applicant_name }}</td>
            <td class="px-6 py-4 text-center">{{ pembayaran.penerima }}</td>
            <td class="px-6 py-4 text-center">
              <div class="flex justify-center gap-2">
                <LightButton @click="detail_fee_pembayaran(pembayaran.id_pembayaran)">
                  <IconDetail
                /></LightButton>
                <LightButton @click="cetak_invoice(pembayaran.invoice)"> <CetakIcon /></LightButton>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      <table class="w-full text-gray-500">
        <Pagination
          :currentPage="currentPage"
          :totalPages="totalPages"
          :pages="pages"
          :totalColumns="totalColumns"
          :total-row="totalItems"
          @prev-page="handlePrev"
          @next-page="handleNext"
          @page-now="handlePageNow"
        />
      </table>
    </div>
  </div>

  <Form
    :formStatus="showModalDetail"
    @cancel="
      () => {
        showModalDetail = false
        resetDetail()
      }
    "
    @submit=""
    :width="'w-1/3'"
    :label="'Detail Fee Agen Yang Di Bayar'"
  >
    <div class="space-y-6">
      <div
        v-for="(detail, index) in data_detail"
        :key="index"
        class="space-y-2 border-b pb-4 last:border-b-0"
      >
        <div>
          <p class="text-sm text-gray-500">Invoice</p>
          <p class="text-gray-800 font-medium">{{ detail.invoice }}</p>
        </div>
        <div>
          <p class="text-sm text-gray-500">Nominal</p>
          <p class="text-gray-800">{{ detail.nominal }}</p>
        </div>
        <div>
          <p class="text-sm text-gray-500">Status Bayar</p>
          <div class="flex items-center gap-2 mt-1">
            <span
              :class="[
                'px-2 py-1 rounded-full text-xs font-semibold inline-flex items-center',
                detail.status_bayar === 'lunas'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800',
              ]"
            >
              <svg
                v-if="detail.status_bayar === 'lunas'"
                xmlns="http://www.w3.org/2000/svg"
                class="w-4 h-4 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="2"
              >
                <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <svg
                v-else
                xmlns="http://www.w3.org/2000/svg"
                class="w-4 h-4 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="2"
              >
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
              {{
                detail.status_bayar === 'lunas'
                  ? detail.status_bayar.toUpperCase()
                  : detail.status_bayar
              }}
            </span>
          </div>
        </div>
        <div>
          <p class="text-sm text-gray-500">Info</p>
          <p class="text-gray-700">{{ detail.info }}</p>
        </div>
      </div>
    </div>
  </Form>

  <Form :formStatus="showModal" @cancel="
      () => {
        resetForm()
        showModal = false
      }
    " @submit="submitForm()" :submitLabel="'Bayar'" :width="'w-1/4'" :label="'Bayar Fee Agen'" >
    <SelectField
      v-model="formCabangId"
      label="Pilih Cabang"
      placeholder="Pilih Cabang"
      id="division"
      :options="optionFilterCabang"
      :error="errors.cabang"
      class=" mb-3"
    />

    <InputText
      v-model="applicantName"
      label="Nama Pemohon"
      placeholder="Masukkan nama pemohon"
      :error="errors.nama"
      class=" mb-3"
    />

    <InputText
      v-model="applicantIdentity"
      label="Identitas Pemohon"
      placeholder="Masukkan identitas pemohon"
      :error="errors.identitas"
      class=" mb-3"
    />

    <SelectField
      v-model="selectedAgenId"
      label="Pilih Agen"
      placeholder="Pilih Agen"
      id="name"
      :options="agenOptions"
      :error="errors.agen"
    />

    <div v-if="feeList.length" class="space-y-2 mt-4">
      <p class="font-semibold text-gray-700">Rincian Fee Belum Dibayar:</p>

      <p v-if="errors.fee" class="text-sm text-red-600 font-medium -mt-2">
        {{ errors.fee }}
      </p>

      <div
        v-for="fee in feeList"
        :key="fee.id"
        class="flex items-center justify-between p-2 border rounded"
      >
        <div>
          <p class="font-medium text-gray-700">{{ fee.info }}</p>
          <p class="text-sm text-gray-500">{{ fee.nominal }}</p>
        </div>

        <input
          type="checkbox"
          class="w-5 h-5 border-gray-300 text-gray-600 rounded focus:ring-gray-500"
          v-model="selectedFees"
          :value="fee.id"
        />
      </div>

      <div class="mt-4 text-right font-bold text-lg text-gray-700">
        Total Bayar: Rp {{ totalSelectedFee.toLocaleString('id-ID') }}
      </div>
    </div>
  </Form>

  <Notification
    :showNotification="showNotification"
    :notificationType="notificationType"
    :notificationMessage="notificationMessage"
    @close="showNotification = false"
  />
</template>
