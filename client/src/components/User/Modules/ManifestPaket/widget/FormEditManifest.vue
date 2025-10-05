<script setup lang="ts">
import PrimaryButton from "@/components/Button/PrimaryButton.vue"
import Notification from '@/components/User/Modules/TabunganUmrah/Particle/Notification.vue'
import Confirmation from '@/components/User/Modules/TabunganUmrah/Particle/Confirmation.vue'
import { updateManifestPaket, infoUpdateManifestPaket } from "@/service/manifest_paket"

import { ref, reactive, onMounted } from 'vue'

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
  isFormEditMasnifestOpen: boolean,
  transpaketId: number
}>()

console.log(props)

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'status', payload: { error: boolean, err_msg?: string }): void
}>()

const errors = ref({
  fullname: '',
  birth_date: '',
  birth_place: '',
  nomor_passport: '',
  tanggal_di_keluarkan_passport: '',
  tempat_di_keluarkan_passport: '',
  masa_berlaku_passport: '',
})

const form = reactive({
  fullname: '',
  birth_date: '',
  birth_place: '',
  nomor_passport: '',
  tanggal_di_keluarkan_passport: '',
  tempat_di_keluarkan_passport: '',
  masa_berlaku_passport: '',
})

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

async function fetchData () {
  try {
    isLoading.value = true
    const response = await infoUpdateManifestPaket(props.transpaketId)
    form.fullname = response.data.fullname
    form.birth_date = response.data.birth_date
    form.birth_place = response.data.birth_place
    form.nomor_passport = response.data.nomor_passport
    form.tanggal_di_keluarkan_passport = response.data.tanggal_di_keluarkan_passport
    form.tempat_di_keluarkan_passport = response.data.tempat_di_keluarkan_passport
    form.masa_berlaku_passport = response.data.masa_berlaku_passport
  } catch (error) {
    console.error('Error fetching data:', error)
    displayNotification(error.response.data.error_msg, 'error')
  } finally {
    isLoading.value = false
  }
}

// Function: Validasi form
const validateForm = (): boolean => {
  let isValid = true
  errors.value = {
    nomor_passport: '',
    tanggal_di_keluarkan_passport: '',
    tempat_di_keluarkan_passport: '',
    masa_berlaku_passport: '',
    fullname: '',
    birth_date: '',
    birth_place: '',
  }

  return isValid
}

// Placeholder submit function
async function saveData() {
  if (!validateForm()) return

  showConfirmation(
    'Konfirmasi Update Visa',
    'Apakah Anda yakin ingin menyimpan perubahan ini?',
    async () => {
      isLoading.value = true

      try {
        const payload = {
          id: props.transpaketId,
          fullname: form.fullname,
          birth_date: form.birth_date,
          birth_place: form.birth_place,
          nomor_passport: form.nomor_passport,
          tanggal_di_keluarkan_passport: form.tanggal_di_keluarkan_passport,
          tempat_di_keluarkan_passport: form.tempat_di_keluarkan_passport,
          masa_berlaku_passport: form.masa_berlaku_passport,
        }

        console.log(payload)
        const response = await updateManifestPaket(payload)
        console.log(response)
        emit('status', { error: response.error, err_msg: response.error_msg })
        emit('close')
      } catch (error) {
        displayNotification(error.response.data.error_msg, 'error')
      } finally {
        isLoading.value = false
      }
    }
  )
}

onMounted(() => { fetchData() })
</script>

<template>
  <!-- Loading Spinner -->
  <div v-if="isLoading" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
    <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-400"></div>
  </div>

  <!-- Modal -->
  <div
    v-if="props.isFormEditMasnifestOpen && !isLoading"
    class="fixed inset-0 z-50 overflow-y-auto"
    role="dialog"
    aria-modal="true"
  >
    <div class="flex min-h-screen items-end justify-center px-6 pt-6 pb-20 text-center sm:block sm:p-0">
      <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" @click="$emit('close')"></div>
        <span class="hidden sm:inline-block sm:h-screen sm:align-middle" aria-hidden="true">&#8203;</span>
        <div class="relative inline-block transform overflow-hidden rounded-lg bg-white text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-xl sm:align-middle p-6">
          <!-- Title -->
          <h3 class="text-2xl font-bold text-gray-900 mb-4">Form Update Manifest Paket</h3>
          <div class="overflow-y-auto no-scrollbar px-1"><div class="overflow-y-auto no-scrollbar px-1">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-800 sm:min-h-[320px]">
              <!-- Kolom 1 -->
              <div>
                <label class="block text-sm font-medium mb-2">Nama Lengkap</label>
                <input type="text" v-model="form.fullname" class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" placeholder="Masukkan nama lengkap">
              </div>
              <div>
                <label class="block text-sm font-medium mb-2">Tanggal Lahir</label>
                <input type="date" v-model="form.birth_date" class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
              </div>
              <div>
                <label class="block text-sm font-medium mb-2">Tempat Lahir</label>
                <input type="text" v-model="form.birth_place" class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" placeholder="Masukkan tempat lahir">
              </div>
              <div>
                <label class="block text-sm font-medium mb-2">Nomor Passport</label>
                <input type="text" v-model="form.nomor_passport" class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" placeholder="Masukkan nomor passport">
              </div>
              <div>
                <label class="block text-sm font-medium mb-2">Tanggal Di Keluarkan Passport</label>
                <input type="date" v-model="form.tanggal_di_keluarkan_passport" class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
              </div>
              <div>
                <label class="block text-sm font-medium mb-2">Tempat Di Keluarkan Passport</label>
                <input type="text" v-model="form.tempat_di_keluarkan_passport" class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" placeholder="Masukkan tempat di keluarkan passport">
              </div>
              <div>
                <label class="block text-sm font-medium mb-2">Masa Berlaku Passport</label>
                <input type="date" v-model="form.masa_berlaku_passport" class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
              </div>
              </div>
            </div>
          </div>
          <div class="bg-gray-50 pb-3 pt-6 sm:flex sm:flex-row-reverse sm:px-0 gap-2">
            <PrimaryButton @click="saveData()">UPDATE MANIFEST</PrimaryButton>
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
