<script setup lang="ts">
import SearchableSelect from '@/components/User/Modules/TabunganUmrah/Particle/SearchableSelect.vue'
import Notification from '@/components/User/Modules/TabunganUmrah/Particle/Notification.vue';
import PrimaryButton from "@/components/Button/PrimaryButton.vue"

import { onMounted, reactive, ref, watch } from 'vue'
import { getJamaah, getPaket, getAgen, addTabunganUmrah } from '@/service/tabungan_umrah'
import { paramCabang } from '@/service/param_cabang';

const props = defineProps<{
  isFormOpen: boolean,
  cabangId: number,
}>();

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'status', payload: {error: boolean, err_msg?: string}): void
}>()

// Interfaces
interface ErrorFields {
  jamaah_id?: string;
  cabang_id?: string;
  sumber_dana?: string;
  biaya_deposit?: string;
  info_deposit?: string;
}
interface Jamaah { id: number; name: string; agen_id: number | null }
interface Paket { id: number; name: string }
interface Agen { id: number; name: string, default_fee: number }
interface Cabang { id: number; name: string }

// State
const optionCabang = ref<Cabang[]>([])
const JamaahList = ref<Jamaah[]>([])
const PaketList = ref<Paket[]>([])
const AgenDetail = ref<Agen | null>(null) // <- Diganti dari AgenList

const isLoading = ref(false)
const showNotification = ref(false)
const notificationMessage = ref('')
const notificationType = ref('')
const timeoutId = ref<number | null>(null)

const errors = ref<ErrorFields>({
  jamaah_id: '',
  cabang_id: '',
  sumber_dana: '',
  biaya_deposit: '',
  info_deposit: '',
})

const form = reactive({
  jamaah_id: 0,
  target_id: null,
  cabang_id: props.cabangId,
  sumber_dana: '',
  biaya_deposit: 0,
  info_deposit: '',
})

// Function: Notification
const displayNotification = (message: string, type: 'success' | 'error' = 'success') => {
  notificationMessage.value = message
  notificationType.value = type
  showNotification.value = true
  if (timeoutId.value) clearTimeout(timeoutId.value)
  timeoutId.value = window.setTimeout(() => {
    showNotification.value = false
  }, 3000)
}

// Function: Ambil data awal
const fetchData = async () => {
  try {
    isLoading.value = true
    const cabangRespoonse = await paramCabang()
    optionCabang.value = cabangRespoonse.data
    checkAndFetchAgen(form.jamaah_id) // kalau sudah ada isi default
  } catch (error) {
    displayNotification(error?.response?.data?.error_msg || 'Terjadi kesalahan dalam mengambil data', 'error')
  } finally {
    isLoading.value = false
  }
}

// Function: Ambil data agen dari jamaah terpilih
const checkAndFetchAgen = async (jamaahId: number) => {
  const selected = JamaahList.value.find(j => j.id === jamaahId)
  if (selected?.agen_id) {
    try {
      const agenRes = await getAgen(selected.agen_id)
      AgenDetail.value = agenRes.data
    } catch (err) {
      AgenDetail.value = null
      displayNotification('Terjadi kesalahan dalam mengambil data agen', 'error')
    }
  } else {
    AgenDetail.value = null
  }
}
const fetchDataJamaah = async (division_id: number) => {
  try {
    isLoading.value = true;
    const response = await getJamaah(division_id);
    JamaahList.value = response.data;
  } catch (error) {
    displayNotification('Terjadi kesalahan dalam mengambil data jamaah', 'error');
  } finally {
    isLoading.value = false;
  }
}

const fetchDataPaket = async (division_id: number) => {
  try {
    isLoading.value = true;
    const response = await getPaket(division_id);
    PaketList.value = [{ id: null, name: 'Pilih Paket' }, ...response?.data];
  } catch (error) {
    console.log(error)
    displayNotification('Terjadi kesalahan dalam mengambil data paket', 'error');
  } finally {
    isLoading.value = false;
  }
}

// Function: Validasi form
const validateForm = () => {
  let isValid = true
  errors.value = {
    jamaah_id: '',
    sumber_dana: '',
    cabang_id: '',
    biaya_deposit: '',
    info_deposit: '',
  }

  if (!form.jamaah_id) {
    errors.value.jamaah_id = 'Nama Jamaah wajib dipilih'
    isValid = false
  }
  if (!form.cabang_id) {
    errors.value.cabang_id = 'Cabang wajib dipilih'
    isValid = false
  }
  if (!form.sumber_dana) {
    errors.value.sumber_dana = 'Sumber Dana wajib dipilih'
    isValid = false
  }
  if (!form.biaya_deposit) {
    errors.value.biaya_deposit = 'Nominal Deposit wajib diisi'
    isValid = false
  }
  if (!form.info_deposit) {
    errors.value.info_deposit = 'Informasi Deposit wajib diisi'
    isValid = false
  }

  return isValid
}

const saveData = async () => {
  if (!validateForm()) return

  try {
    isLoading.value = true
    const payload: {
      jamaah_id: number;
      target_id: number | null;
      division_id: number;
      sumber_dana: string;
      biaya_deposit: number;
      info_deposit?: string;
    } = {
      jamaah_id: form.jamaah_id,
      target_id: form.target_id,
      division_id: form.cabang_id,
      sumber_dana: form.sumber_dana,
      biaya_deposit: form.biaya_deposit,
      info_deposit: form.info_deposit
    }

    if (form.info_deposit) payload.info_deposit = form.info_deposit

    const response = await addTabunganUmrah(payload)
    window.open(`/kwitansi-tabungan-umrah/${response.data.invoice}`, '_blank')
    emit('close')
    emit('status', { error: false, err_msg: response.error_msg || 'Tabungan berhasil disimpan' })
  } catch (error) {
    displayNotification(
      error?.response?.data?.error_msg ||
      error?.response?.data?.message ||
      'Terjadi kesalahan dalam menyimpan data',
      'error'
    )
  } finally {
    isLoading.value = false
  }
}

// Watcher 1: Saat jamaah_id berubah, fetch data agen
watch(() => form.jamaah_id, async (newJamaahId) => {
  if (newJamaahId) {
    isLoading.value = true;
    try {
      await checkAndFetchAgen(newJamaahId);
    } catch (err) {
      AgenDetail.value = null;
      displayNotification('Terjadi kesalahan dalam mengambil data agen', 'error');
    } finally {
      isLoading.value = false;
    }
  } else {
    AgenDetail.value = null;
  }
});

// Watcher 2: Saat cabang_id berubah, kosongkan jamaah_id serta paket_id dan fetch data baru
watch(() => form.cabang_id, async (newCabangId) => {
  if (newCabangId) {
    form.jamaah_id = 0;
    form.target_id = null;
    AgenDetail.value = null;

    isLoading.value = true;
    try {
      await fetchDataJamaah(newCabangId);
      await fetchDataPaket(newCabangId);
    } catch (err) {
      displayNotification('Terjadi kesalahan dalam mengambil data jamaah', 'error');
    } finally {
      isLoading.value = false;
    }
  } else {
    form.jamaah_id = 0;
    form.target_id = null;
    AgenDetail.value = null;
  }
});

onMounted(async() => {
  await Promise.all([
    fetchData(),
    fetchDataJamaah(props.cabangId),
    fetchDataPaket(props.cabangId),
  ])
})

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

// Fungsi untuk ambil angka asli (unformat Rp)
const unformatPrice = (formatted: string): number => { return parseInt(formatted.replace(/[^\d]/g, ''), 10) || 0 }
</script>

<template>
  <div v-if="isLoading" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
    <div class="animate-spin h-5 w-5 border-b-2 border-white rounded-full"></div>
  </div>
  <div v-if="props.isFormOpen && !isLoading" class="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
    <div class="flex min-h-screen items-end justify-center px-6 pt-6 pb-20 text-center sm:block sm:p-0">
      <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" @click="$emit('close')"></div>
      <span class="hidden sm:inline-block sm:h-screen sm:align-middle" aria-hidden="true">&#8203;</span>
      <div class="relative p-6 inline-block transform overflow-hidden rounded-lg bg-white text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:align-middle">
        <div class="bg-white">
          <h3 class="text-2xl flex font-bold leading-6 text-gray-900 mb-4">
            Form Transaksi Tabungan Umrah
          </h3>
          <div class="space-y-4 text-gray-800">
            <div>
              <SearchableSelect
                v-model="form.cabang_id"
                :options="optionCabang"
                label="Cabang"
                placeholder="Pilih Cabang"
                :error="errors.cabang_id"
                :required="true"
              />
            </div>
            <div>
              <SearchableSelect
                v-model="form.jamaah_id"
                :options="JamaahList"
                label="Nama Jamaah"
                placeholder="Pilih Jamaah"
                :error="errors.jamaah_id"
                :required="true"
              />
            </div>
            <div>
              <SearchableSelect
                v-model="form.target_id"
                :options="PaketList"
                label="Target Paket"
                placeholder="Pilih Target Paket"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Sumber Dana
                <span class="text-red-600">*</span>
              </label>
              <select
                v-model="form.sumber_dana"
                class="block w-full px-3 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                :error="errors.sumber_dana"
              >
                <option value="" disabled>Pilih Sumber Dana</option>
                <option value="cash" selected>Cash</option>
                <option value="deposit">Deposit</option>
              </select>
              <p v-if="errors.sumber_dana" class="mt-1 text-sm text-red-600">{{ errors.sumber_dana }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Biaya Tabungan
                <span class="text-red-600">*</span>
              </label>
              <input
                type="text"
                class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-600 font-normal"
                placeholder="Biaya Deposit"
                :value="form.biaya_deposit ? formatPrice(form.biaya_deposit) : ''"
                @input="form.biaya_deposit = unformatPrice($event.target.value)"
              />
              <p v-if="errors.biaya_deposit" class="mt-1 text-sm text-red-600">{{ errors.biaya_deposit }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Informasi Tabungan
                <span class="text-red-600">*</span>
              </label>
              <textarea
                v-model="form.info_deposit"
                class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-600 font-normal"
                placeholder="Informasi Deposit"
              ></textarea>
              <p v-if="errors.info_deposit" class="mt-1 text-sm text-red-600">{{ errors.info_deposit }}</p>
            </div>
            <div v-if="AgenDetail">
              <label class="block text-sm font-medium text-gray-700 mb-1">Fee Agen ({{ AgenDetail.name }})</label>
              <p class="block w-full px-3 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm">
                {{ formatPrice(AgenDetail.default_fee) }}
              </p>
            </div>
          </div>
        </div>
        <div class="bg-gray-50 pb-3 pt-6 sm:flex sm:flex-row-reverse sm:px-0 gap-2">
          <PrimaryButton @click="saveData()">TAMBAH DEPOSIT</PrimaryButton>
          <button
            @click="$emit('close')"
            class="px-4 mt-3 inline-flex w-full justify-center rounded-md border border-gray-400 bg-gray-200 px-4 py-2 text-base font-medium text-gray-800 shadow-sm hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
          >
            BATAL
          </button>
        </div>
      </div>
    </div>
  </div>
    <!-- Notification -->
  <Notification :showNotification="showNotification" :notificationType="notificationType" :notificationMessage="notificationMessage" @close="showNotification = false" />
</template>
