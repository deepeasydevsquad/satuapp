<script setup lang="ts">
import { ref, watch, computed, onMounted } from 'vue'
import {
  daftar_template,
  get_template_by_id,
  add_template,
  update_template,
  delete_template,
} from '@/service/template_pesan'

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
import EditIcon from '@/components/User/Modules/Airlines/Icon/EditIcon.vue'
import DeleteIcon from '@/components/Icons/DeleteIcon.vue'
import Pagination from '@/components/Pagination/Pagination.vue'
import { on } from 'events'

const confirmMessage = ref<string>('')
const confirmTitle = ref<string>('')
const confirmAction = ref<(() => void) | null>(null)
const showConfirmDialog = ref<boolean>(false)

const totalColumns = 5
const totalData = computed(() => data_template.value.length)

const itemsPerPage = 10

const search = ref('')
// State
const currentPage = ref(1)

// Computed total halaman
const totalPages = computed(() => Math.ceil(totalData.value / itemsPerPage))

// Generate array nomor halaman
const pages = computed<number[]>(() => {
  return Array.from({ length: totalPages.value }, (_, i) => i + 1)
})

// Emit handler
const handlePrev = () => {
  if (currentPage.value > 1) currentPage.value--
}

const handleNext = () => {
  if (currentPage.value < totalPages.value) currentPage.value++
}

const handlePageNow = (page: number) => {
  currentPage.value = page
}

const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return data_template.value.slice(start, end)
})

const showModal = ref(false)
const showNotification = ref(false)
const notificationMessage = ref('')
const notificationType = ref<'success' | 'error'>('success')
const timeoutId = ref<number | null>(null)

const data_template = ref<
  {
    id: string
    name: string
    type: string
    message: string
    variable: string[]
  }[]
>([])

const new_template = ref({
  id: '',
  name: '',
  type: '',
  message: '',
  variable: [] as string[],
})

const resetForm = () => {
  new_template.value = {
    id: '',
    name: '',
    type: '',
    message: '',
    variable: [],
  }
}

watch(
  () => new_template.value.type,
  (type) => {
    new_template.value.variable = getVariableByType(type)
  },
)

const getVariableByType = (type: string): string[] => {
  switch (type) {
    case 'semua_jamaah':
      return ['{{nama_jamaah}}', '{{nomor_identitas}}', '{{sisa_tenor}}']
    case 'staff':
      return ['{{nama_staff}}']
    case 'jamaah_paket':
      return [
        '{{nama_paket}}',
        '{{kode_paket}}',
        '{{nomor_register}}',
        '{{nama_jamaah}}',
        '{{nomor_identitas}}',
      ]
    case 'agen':
      return ['{{nama_agen}}', '{{level}}', '{{nomor_hp}}']
    case 'jamaah_sudah_berangkat':
      return [
        '{{nama_paket}}',
        '{{kode_paket}}',
        '{{nomor_register}}',
        '{{nama_jamaah}}',
        '{{nomor_identitas}}',
        '{{tanggal_keberangkatan}}',
        '{{tanggal_kepulangan}}',
      ]
    case 'jamaah_tabungan_umrah':
      return ['{{nama_jamaah}}', '{{nomor_identitas}}', '{{total_tabungan}}']
    case 'jamaah_utang_koperasi':
      return [
        '{{nama_jamaah}}',
        '{{nomor_identitas}}',
        '{{total_utang}}',
        '{{total_tenor}}',
        '{{sudah_bayar}}',
        '{{sisa_utang}}',
      ]
    case 'pesan_biasa':
    default:
      return []
  }
}

const variableDisplay = computed(() => getVariableByType(new_template.value.type).join(', '))

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

const fetchData = async () => {
  try {
    const response = await daftar_template()
    data_template.value = response
    console.log(data_template.value)
  } catch (error) {
    console.error('Error fetching data:', error)
  }
}

onMounted(() => {
  fetchData()
})

const isEditMode = ref(false)

const editTemplate = (template: typeof new_template.value) => {
  isEditMode.value = true
  showModal.value = true
  new_template.value = { ...template }
}

const isLoading = ref(false)

const submitForm = async () => {
  try {
    isLoading.value = true
    if (isEditMode.value) {
      await update_template(new_template.value)
      displayNotification('Template berhasil diperbarui!', 'success')
    } else {
      await add_template(new_template.value)
      displayNotification('Template berhasil ditambahkan!', 'success')
    }
    await fetchData()
    showModal.value = false
    resetForm()
    isEditMode.value = false
  } catch (error) {
    displayNotification('Gagal menyimpan template!', 'error')
  } finally {
    isLoading.value = false
  }
}

const showConfirmation = (title: string, message: string, action: () => void) => {
  confirmTitle.value = title
  confirmMessage.value = message
  confirmAction.value = action
  showConfirmDialog.value = true
}

const deleteData = async (id: number) => {
  showConfirmation('Konfirmasi Hapus', 'Apakah Anda yakin ingin menghapus data ini?', async () => {
    try {
      await delete_template({ id: String(id) })
      showConfirmDialog.value = false
      displayNotification('Operasi berhasil!', 'success')
      fetchData()
    } catch (error) {
      console.error('Error deleting data:', error)
      displayNotification(error?.response?.data?.error_msg, 'error')
    }
  })
}
</script>

<template>
  <div class="container mx-auto px-4 mt-10">
    <!-- Tombol Tambah Template -->
    <div class="flex justify-between items-center mb-6">
      <!-- Tombol Tambah di kiri -->
      <PrimaryButton @click="showModal = true" class="flex items-center gap-2">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="w-5 h-5"
          viewBox="0 0 32 32"
          fill="currentColor"
        >
          <path
            d="M16.001 2.667C8.64 2.667 2.667 8.64 2.667 16c0 2.773.746 5.361 2.048 7.622L2 30l6.61-2.049a13.22 13.22 0 006.391 1.716c7.36 0 13.333-5.973 13.333-13.334S23.361 2.667 16 2.667zm0 24a10.65 10.65 0 01-5.44-1.507l-.39-.233-3.92 1.215 1.268-3.822-.255-.401A10.67 10.67 0 1116 26.667zm5.946-8.092c-.328-.164-1.92-.943-2.226-1.06-.306-.119-.528-.177-.749.177-.22.354-.857 1.06-1.05 1.276-.192.213-.385.239-.713.08a8.857 8.857 0 01-2.608-1.963 9.834 9.834 0 01-1.84-2.276c-.192-.328-.02-.505.145-.667.15-.148.328-.384.492-.574.165-.19.219-.319.328-.525.109-.206.055-.384-.027-.548-.08-.163-.749-1.807-1.027-2.473-.271-.651-.546-.562-.749-.571l-.638-.012c-.219 0-.573.082-.872.384-.3.303-1.145 1.118-1.145 2.729 0 1.61 1.172 3.166 1.335 3.384.163.218 2.309 3.528 5.59 4.945 3.281 1.417 3.281.945 3.871.887.591-.06 1.92-.783 2.19-1.539.27-.755.27-1.403.188-1.539-.08-.136-.3-.217-.628-.381z"
          />
        </svg>
        Tambah Template
      </PrimaryButton>

      <!-- Search di kanan -->
      <div class="flex items-center">
        <label for="search" class="block text-sm font-medium text-gray-700 mr-2">Search</label>
        <input
          type="text"
          id="search"
          class="block w-64 px-3 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 placeholder:text-gray-400"
          v-model="search"
          placeholder="Cari Template..."
        />
      </div>
    </div>

    <!-- Tabel System Log -->
    <div class="overflow-hidden rounded-lg border border-gray-200 shadow-md">
      <table class="w-full border-collapse bg-white text-left text-sm text-gray-500">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-4 font-medium text-gray-900 text-center w-[20%]">Name</th>
            <th class="px-6 py-4 font-medium text-gray-900 text-center w-[15%]">Tipe Pesan</th>
            <th class="px-6 py-4 font-medium text-gray-900 text-center w-[25%]">Pesan</th>
            <th class="px-6 py-4 font-medium text-gray-900 text-center w-[25%]">Variable</th>
            <th class="px-6 py-4 font-medium text-gray-900 text-center w-[15%]">Aksi</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200">
          <tr v-if="data_template.length === 0">
            <td colspan="5" class="px-6 py-4 text-center text-gray-500">Data tidak ada</td>
          </tr>
          <tr
            v-for="data in paginatedData"
            :key="data.id"
            class="hover:bg-gray-50 transition-colors"
          >
            <td class="px-6 py-4 text-left">{{ data.name }}</td>
            <td class="px-6 py-4 text-center">{{ data.type }}</td>
            <td class="px-6 py-4 text-center">{{ data.message }}</td>
            <td class="px-6 py-4 text-center">{{ data.variable }}</td>
            <td class="px-6 py-4 text-center">
              <div class="flex justify-center gap-2">
                <LightButton @click="editTemplate(data)"><EditIcon /></LightButton>
                <DangerButton @click="deleteData(data.id)"><DeleteIcon /></DangerButton>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      <table class="w-full">
        <Pagination
          :currentPage="currentPage"
          :totalPages="totalPages"
          :pages="pages"
          :totalColumns="totalColumns"
          @prev-page="handlePrev"
          @next-page="handleNext"
          @page-now="handlePageNow"
        />
      </table>
    </div>

    <!-- Form Modal -->
    <Form
      :formStatus="showModal"
      @cancel="
        () => {
          showModal = false
          resetForm()
        }
      "
      @submit="submitForm"
      :submitLabel="'Simpan'"
      :width="'w-1/3'"
      :label="'Tambah Template'"
    >
      <InputText
        v-model="new_template.name"
        label="Nama"
        placeholder="Masukan Nama Template"
        id="name"
        class="mb-4"
      />

      <SelectField
        v-model="new_template.type"
        label="Jenis"
        placeholder="Pilih Jenis"
        id="type"
        :options="[
          { id: 'pesan_biasa', name: 'Pesan Biasa' },
          { id: 'semua_jamaah', name: 'Semua Jamaah' },
          { id: 'staff', name: 'Staff' },
          { id: 'agen', name: 'Agen' },
          { id: 'jamaah_paket', name: 'Jamaah Paket' },
          { id: 'jamaah_sudah_berangkat', name: 'Jamaah Sudah Berangkat' },
          { id: 'jamaah_tabungan_umrah', name: 'Jamaah Tabungan Umrah' },
          { id: 'jamaah_utang_koperasi', name: 'Jamaah Utang Koperasi' },
        ]"
        class="mb-4"
      />

      <InputReadonly
        v-if="new_template.type"
        :value="variableDisplay"
        label="Variabel Otomatis"
        id="variable"
        class="mb-4"
      />

      <TextArea
        v-if="new_template.type"
        v-model="new_template.message"
        label="Isi Pesan"
        id="message"
        placeholder="Tulis isi pesan WhatsApp..."
        :note="'Kamu bisa pakai variabel seperti yang ditampilkan di atas.'"
        class="mb-4"
      />
    </Form>

    <Confirmation
      :showConfirmDialog="showConfirmDialog"
      :confirmTitle="confirmTitle"
      :confirmMessage="confirmMessage"
    >
      <button
        @click="confirmAction && confirmAction()"
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
    />
  </div>
</template>
