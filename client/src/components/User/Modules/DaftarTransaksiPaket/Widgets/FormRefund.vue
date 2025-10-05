<script setup lang="ts">
import PrimaryButton from "@/components/Button/PrimaryButton.vue"
import Notification from '@/components/User/Modules/TabunganUmrah/Particle/Notification.vue'
import Confirmation from '@/components/User/Modules/TabunganUmrah/Particle/Confirmation.vue'
import { refundTransaksiPaket, inforefundTransaksiPaket } from "@/service/daftar_transaksi_paket"

import { ref, reactive, onMounted, watch } from 'vue'

const isLoading = ref(false)
const showNotification = ref(false)
const notificationMessage = ref('')
const notificationType = ref<'success' | 'error'>('success')
const timeoutId = ref<number | null>(null)

const showConfirmDialog = ref(false)
const confirmMessage = ref('')
const confirmTitle = ref('')
const confirmAction = ref<(() => void) | null>(null)

const props = defineProps<{
  isFormRefundOpen: boolean,
  paketId: number,
  transpaketId: number
  cabangId: number
}>()

console.log(props)

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'status', payload: { error: boolean, err_msg?: string }): void
}>()


const dataPrice = ref<number>(0);

const errors = ref({
  nominal_refund: '',
})

const form = reactive({
  nominal_refund: 0,
})

const unformatPrice = (value: string): number => {
  const numericString = String(value).replace(/[^\d]/g, '');
  return parseInt(numericString, 10) || 0;
}

// Function: Notification
function displayNotification(message: string, type: 'success' | 'error' = 'success') {
  showConfirmDialog.value = false
  notificationMessage.value = message
  notificationType.value = type
  showNotification.value = true
  if (timeoutId.value) clearTimeout(timeoutId.value)
  timeoutId.value = window.setTimeout(() => {
    showNotification.value = false
  }, 3000)
}

// Function: Confirmation
function showConfirmation(title: string, message: string, action: () => void) {
  confirmTitle.value = title
  confirmMessage.value = message
  confirmAction.value = action
  showConfirmDialog.value = true
}

// Function: Fetch data
const fetchData = async () => {
  try {
    isLoading.value = true

    const response = await inforefundTransaksiPaket({
      id: props.paketId,
      transpaketId: props.transpaketId,
      division_id: props.cabangId
    })
    dataPrice.value = response.data.price;
  } catch (error: any) {
    console.error('Error fetching data:', error)
    emit('status', { error: true, err_msg: (error?.response?.data?.error_msg || error?.response?.data?.message) || 'Terjadi kesalahan saat mengambil data.' })
  } finally {
    isLoading.value = false
  }
}

// Function: Validasi form
const validateForm = (): boolean => {
  let isValid = true
  errors.value = {
    nominal_refund: '',
  }

  if (!form.nominal_refund) {
    errors.value.nominal_refund = 'Nominal Refund wajib diisi'
    isValid = false
  }

  if (form.nominal_refund > dataPrice.value) {
    displayNotification('Nominal Refund tidak boleh lebih besar dari transaksi paket', 'error')
    isValid = false
  }

  return isValid
}

onMounted(() => { fetchData() })

// Placeholder submit function
async function saveData() {
  if (!validateForm()) return

  showConfirmation(
    'Konfirmasi Refund',
    'Apakah Anda yakin ingin melakukan refund ini?',
    async () => {
      isLoading.value = true

      try {
        const payload = {
          id: props.paketId,
          transpaketId: props.transpaketId,
          division_id: props.cabangId,
          nominal_refund: form.nominal_refund,
        }

        console.debug("Payload:", payload)
        const response = await refundTransaksiPaket(payload)
        emit('status', { error: false, err_msg: response.data.error_msg || response.data.message || 'Dana berhasil dikembalikan' })
        emit('close')
      } catch (error:any) {
        displayNotification('Gagal melakukan refund', 'error')
        displayNotification(error.response.data.error_msg, 'error')
      } finally {
        isLoading.value = false
      }
    }
  )
}

// Fungsi format harga (Rp, titik ribuan)
const formatPrice = (value: number | string): string => {
  const numericString = String(value).replace(/[^\d]/g, '')
  const numericValue = parseInt(numericString, 10) || 0

  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(numericValue)
}
</script>

<template>
  <!-- Loading Spinner -->
  <div v-if="isLoading" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
    <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-400"></div>
  </div>
  <!-- Modal -->
  <div
    v-if="props.isFormRefundOpen && !isLoading"
    class="fixed inset-0 z-50 overflow-y-auto"
    role="dialog"
    aria-modal="true"
  >
    <div class="flex min-h-screen items-end justify-center px-6 pt-6 pb-20 text-center sm:block sm:p-0">
      <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" @click="$emit('close')"></div>
        <span class="hidden sm:inline-block sm:h-screen sm:align-middle" aria-hidden="true">&#8203;</span>
        <div class="relative inline-block transform overflow-hidden rounded-lg bg-white text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:align-middle p-6">
          <!-- Title -->
          <h3 class="text-2xl font-bold text-gray-900 mb-4">Form Refund Transaksi Paket</h3>
          <div class="overflow-y-auto no-scrollbar px-1">
            <div class="space-y-4 text-gray-800 sm:min-h-[200px]">
              <!-- Data Member -->
              <div class="mb-6">
                <div class="mt-4 p-3 border border-yellow-200 bg-yellow-50 rounded-md text-sm text-yellow-800">
                  Total tabungan yang dapat direfund : <strong>{{ formatPrice(dataPrice) }}</strong>
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Nominal Refund
                  <span class="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-600 font-normal"
                  placeholder="Masukkan nominal refund"
                  inputmode="numeric"
                  pattern="\d*"
                  :value="form.nominal_refund ? formatPrice(form.nominal_refund) : ''"
                  @input="form.nominal_refund = unformatPrice($event.target.value)"
                />
                <p v-if="errors.nominal_refund" class="mt-1 text-sm text-red-600">{{ errors.nominal_refund }}</p>
              </div>
            </div>
          </div>
          <div class="bg-gray-50 pb-3 pt-6 sm:flex sm:flex-row-reverse sm:px-0 gap-2">
            <PrimaryButton @click="saveData()">REFUND</PrimaryButton>
            <button
            @click="$emit('close')"
            class="mt-3 inline-flex w-full justify-center rounded-md border border-gray-400 bg-gray-200 px-4 py-2 text-base font-medium text-gray-800 shadow-sm hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            >
            BATAL
            </button>
          </div>
        </div>
    </div>
  </div>

  <!-- Notifikasi -->
  <Notification
    :showNotification="showNotification"
    :notificationType="notificationType"
    :notificationMessage="notificationMessage"
    @close="showNotification = false"
  />

  <!-- Konfirmasi -->
  <Confirmation
    :showConfirmDialog="showConfirmDialog"
    :confirmTitle="confirmTitle"
    :confirmMessage="confirmMessage"
  >
    <button @click="confirmAction && confirmAction()" class="mt-3 inline-flex w-full justify-center rounded-md border border-transparent bg-yellow-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm">
      Ya
    </button>
    <button @click="showConfirmDialog = false" class="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none sm:w-auto sm:text-sm">
      Tidak
    </button>
  </Confirmation>
</template>
