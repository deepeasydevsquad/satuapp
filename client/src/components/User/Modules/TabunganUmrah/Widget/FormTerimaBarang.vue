<script setup lang="ts">
import PrimaryButton from "@/components/Button/PrimaryButton.vue"
import Notification from '@/components/User/Modules/TabunganUmrah/Particle/Notification.vue'
import Confirmation from '@/components/User/Modules/TabunganUmrah/Particle/Confirmation.vue'
import { addHandoverBarang } from "@/service/tabungan_umrah"

import { ref, reactive } from 'vue'

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
  isFormTerimaBarangOpen: boolean,
  tabunganId: number,
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'status', payload: { error: boolean, err_msg?: string }): void
}>()

const errors = ref({
  barangList: [] as string[],
  giver_handover: '',
  giver_handover_identity: '',
  giver_handover_hp: '',
  giver_handover_address: '',
})

const form = reactive({
  id: props.tabunganId ?? null,
  barangList: [''] as string[],
  giver_handover: '',
  giver_handover_identity: '',
  giver_handover_hp: '',
  giver_handover_address: '',
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

// Function: Validasi form
const validateForm = (): boolean => {
  let isValid = true
  errors.value = {
    barangList: [] as string[],
    giver_handover: '',
    giver_handover_identity: '',
    giver_handover_hp: '',
    giver_handover_address: '',
  }

  if (!form.id) {
    displayNotification('ID Tabungan Umrah kosong', 'error')
    isValid = false
  }

  if (!form.giver_handover.trim()) {
    errors.value.giver_handover = 'Nama pemberi wajib diisi'
    isValid = false
  }

  if (!form.giver_handover_identity.trim()) {
    errors.value.giver_handover_identity = 'Nomor identitas pemberi wajib diisi'
    isValid = false
  }

  if (!form.giver_handover_hp.trim()) {
    errors.value.giver_handover_hp = 'Nomor HP pemberi wajib diisi'
    isValid = false
  }

  if (!form.giver_handover_address.trim()) {
    errors.value.giver_handover_address = 'Alamat pemberi wajib diisi'
    isValid = false
  }

  errors.value.barangList = form.barangList.map((item, index) => {
    if (!item.trim()) {
      isValid = false
      return `Kolom ke-${index + 1} tidak boleh kosong`
    }
    return ''
  })

  return isValid
}

// Form Logic
function addBarang() {
  form.barangList.push('')
  errors.value.barangList.push('')
}

function deleteBarang(index: number) {
  form.barangList.splice(index, 1)
  errors.value.barangList.splice(index, 1)
}

// Placeholder submit function
async function saveData() {
  if (!validateForm()) return

  showConfirmation(
    'Konfirmasi Terima Barang',
    'Apakah Anda yakin ingin menyimpan data serah terima barang ini?',
    async () => {
      isLoading.value = true

      try {
        const payload = {
          id: form.id,
          barangList: form.barangList,
          giver_handover: form.giver_handover,
          giver_handover_identity: form.giver_handover_identity,
          giver_handover_hp: form.giver_handover_hp,
          giver_handover_address: form.giver_handover_address
        }

        const response = await addHandoverBarang(payload)
        if (response.data === null) {
          displayNotification('Nomor invoice tidak tersedia', 'error')
          return
        }
        window.open(`/kwitansi-handover-barang/${response.data.invoice}`, '_blank')
        emit('status', { error: false, err_msg: 'Data handover barang berhasil diserahkan' })
        emit('close')
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
  )
}
</script>

<template>
  <div v-if="isLoading" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
    <div class="animate-spin h-6 w-6 border-4 border-white border-t-transparent rounded-full"></div>
  </div>

  <!-- Modal -->
  <div
    v-if="props.isFormTerimaBarangOpen && !isLoading"
    class="fixed inset-0 z-50 overflow-y-auto"
    role="dialog"
    aria-modal="true"
  >
    <div class="flex min-h-screen items-end justify-center px-6 pt-6 pb-20 text-center sm:block sm:p-0">
      <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" @click="$emit('close')"></div>
        <span class="hidden sm:inline-block sm:h-screen sm:align-middle" aria-hidden="true">&#8203;</span>
        <div class="relative inline-block transform overflow-hidden rounded-lg bg-white text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-3xl sm:align-middle p-6">
          <!-- Title -->
          <h3 class="text-2xl font-bold text-gray-900 mb-4">Form Handover Barang Jamaah</h3>
          <div class="overflow-y-auto max-h-[64vh] no-scrollbar px-1">

            <!-- Input Data -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 text-gray-600">
              <div>
                <input v-model="form.giver_handover" type="text" placeholder="Nama Pemberi Barang" class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-600 font-normal" />
                <p v-if="errors.giver_handover" class="mt-1 text-sm text-red-600">{{ errors.giver_handover }}</p>
              </div>
              <div>
                <input v-model="form.giver_handover_identity" type="text" placeholder="No Identitas Pemberi Barang" class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-600 font-normal" />
                <p v-if="errors.giver_handover_identity" class="mt-1 text-sm text-red-600">{{ errors.giver_handover_identity }}</p>
              </div>
              <div>
                <input v-model="form.giver_handover_hp" type="text" placeholder="No HP Pemberi Barang" class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-600 font-normal" />
                <p v-if="errors.giver_handover_hp" class="mt-1 text-sm text-red-600">{{ errors.giver_handover_hp }}</p>
              </div>
            </div>

            <div class="mb-4 text-gray-600">
              <textarea v-model="form.giver_handover_address" rows="3" placeholder="Alamat Pemberi Barang" class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-600 font-normal"></textarea>
              <p v-if="errors.giver_handover_address" class="mt-1 text-sm text-red-600">{{ errors.giver_handover_address }}</p>
            </div>

            <!-- Barang List -->
            <ul class="space-y-2 mb-4 text-gray-600">
              <li v-for="(barang, index) in form.barangList" :key="index" class="flex flex-col gap-1">
                <div class="flex items-center gap-2">
                  <input
                    v-model="form.barangList[index]"
                    type="text"
                    placeholder="Nama Barang"
                    class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-600 font-normal"
                  />
                  <button
                    @click="deleteBarang(index)"
                    class="text-gray-500 hover:text-red-600 border border-gray-300 px-3 py-2 rounded mr-1"
                    type="button"
                  >✕</button>
                </div>
                <p v-if="errors.barangList[index]" class="text-sm text-red-600">{{ errors.barangList[index] }}</p>
              </li>
            </ul>

            <button @click="addBarang" class="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-100 flex items-center gap-2" type="button">
              <span>+</span> Tambah Barang
            </button>

            <!-- Actions -->
            <div class="bg-gray-50 pt-6 sm:flex sm:flex-row-reverse sm:px-0 gap-2">
              <PrimaryButton @click="saveData()">TERIMA BARANG DARI JAMAAH</PrimaryButton>
              <button
              @click="$emit('close')"
              class="mt-3 inline-flex w-full justify-center rounded-md border border-gray-400 bg-gray-200 px-4 py-2 text-base font-medium text-gray-800 shadow-sm hover:bg-gray-300 focus:outline-none sm:mt-0 sm:w-auto sm:text-sm"
              >
              BATAL
            </button>
          </div>
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
