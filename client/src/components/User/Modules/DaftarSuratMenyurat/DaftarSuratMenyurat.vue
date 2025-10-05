<template>
  <div class="container mx-auto p-4">
    <div class="flex justify-between mb-4 items-center gap-4">
      <!-- Container tombol-tombol -->
      <div class="flex gap-3">
        <PrimaryButton @click="modalTambahSurat()"><SuratIcon />Tambah Surat</PrimaryButton>
        <PrimaryButton @click="showModalKonfigurasi()"><GearIcon />Konfigurasi Surat</PrimaryButton>
      </div>

      <!-- Search -->
      <div class="flex items-center gap-2 min-w-[200px] max-w-sm">
        <label for="search" class="block text-sm font-medium text-gray-700">Filter</label>
        <input
          v-model="searchQuery"
          id="search"
          type="text"
          placeholder="Cari Surat"
          class="block w-full px-3 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
        />
      </div>
    </div>

    <div v-if="loading" class="text-center py-4 text-gray-500">Loading...</div>
    <div v-else-if="error" class="text-center py-4 text-red-500">{{ error }}</div>

    <div v-else class="overflow-hidden rounded-lg border border-gray-200 shadow-md">
      <table class="w-full border-collapse bg-white text-left text-sm text-gray-500">
        <thead class="bg-gray-100">
          <tr>
            <th class="px-6 py-4 font-bold text-gray-900 text-center w-[15%]">Nomor Surat</th>
            <th class="px-6 py-4 font-bold text-gray-900 text-center w-[15%]">Tipe Surat</th>
            <th class="px-6 py-4 font-bold text-gray-900 text-center w-[30%]">Info</th>
            <th class="px-6 py-4 font-bold text-gray-900 text-center w-[15%]">Tujuan</th>
            <th class="px-6 py-4 font-bold text-gray-900 text-center w-[10%]">Petugas</th>
            <th class="px-6 py-4 font-bold text-gray-900 text-center w-[10%]">Tanggal Surat</th>
            <th class="px-6 py-4 font-bold text-gray-900 text-center w-[5%]">Aksi</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200">
          <tr v-if="!riwayatSurat || riwayatSurat.length === 0">
            <td colspan="7" class="px-6 py-4 text-center text-gray-500">Data tidak ada</td>
          </tr>
          <tr
            v-for="riwayatSurat in riwayatSurat"
            :key="riwayatSurat.nomor_surat"
            class="hover:bg-gray-50"
          >
            <td class="px-6 py-4 text-center font-bold">{{ riwayatSurat.nomor_surat }}</td>
            <td class="px-6 py-4 text-center">
              {{ formatTipeSurat(riwayatSurat.tipe_surat) }}
            </td>
            <td class="px-6 py-4 text-center">
              <div v-if="riwayatSurat.tipe_surat === 'surat_cuti'">
                <!-- Misahin info surat_cuti -->
                <div v-for="(line, index) in riwayatSurat.info.text.split(',')" :key="index">
                  {{ line.trim() }}
                </div>
              </div>

              <div v-else-if="riwayatSurat.tipe_surat === 'rekom_paspor'">
                <!-- Misahin info rekom_paspor -->
                <div v-for="(line, index) in riwayatSurat.info.text.split(',')" :key="index">
                  {{ line.trim() }}
                </div>
              </div>

              <div v-else>
                {{ riwayatSurat.info }}
              </div>
            </td>
            <td class="px-6 py-4 text-center">{{ riwayatSurat.tujuan }}</td>
            <td class="px-6 py-4 text-center">{{ riwayatSurat.nama_petugas }}</td>
            <td class="px-6 py-4 text-center">{{ formatDate(riwayatSurat.tanggal_surat) }}</td>
            <td class="px-6 py-4 text-center grid grid-cols-2 gap-2">
              <div class="grid">
                <LightButton
                  @click="handleDownload(riwayatSurat.info.jamaah_id, riwayatSurat.tipe_surat)"
                  title="Cetak Surat"
                  class="p-1 w-6 h-6"
                >
                  <CetakIcon class="w-4 h-4" />
                </LightButton>
                <DangerButton
                  @click="handleDelete(riwayatSurat.id)"
                  title="Hapus Surat"
                  class="p-1 w-6 h-6"
                >
                  <DeleteIcon class="w-4 h-4" />
                </DangerButton>
              </div>
            </td>
          </tr>
        </tbody>
        <tfoot class="bg-gray-100 font-bold text-right">
          <Pagination
            :currentPage="currentPage"
            :totalPages="totalPages"
            :pages="pages"
            :totalColumns="totalColumns"
            :total-row="total"
            @prev-page="prevPage"
            @next-page="nextPage"
            @page-now="pageNow"
          />
        </tfoot>
      </table>
    </div>
  </div>

  <ModalKonfigurasi
    :show="modalKonfigurasi"
    @close="closeModalKonfigurasi"
    @konfigurasi_success="handleKonfigurasi"
  />
  <!-- Notification Popup -->
  <Notification
    :showNotification="showNotification"
    :notificationType="notificationType"
    :notificationMessage="notificationMessage"
    @close="showNotification = false"
  ></Notification>
  <ModalTambahSurat
    :formtambahsurat="showModalTambahSurat"
    @close="closeModalTambahSurat"
    @handletambahsurat="handleTambahSurat"
  />

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
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import Pagination from '@/components/Pagination/Pagination.vue'
import DeleteIcon from '@/components/User/Modules/DaftarPeminjaman/Icon/DeleteIcon.vue'
import PrimaryButton from '@/components/Button/PrimaryButton.vue'
import Confirmation from '@/components/User/Modules/DaftarPaketLa/Particle/Confirmation.vue'
import CetakIcon from '@/components/User/Modules/DaftarPeminjaman/Icon/CetakIcon.vue'
import DangerButton from '@/components/Button/DangerButton.vue'
import LightButton from '@/components/Button/LightButton.vue'
import Notification from '@/components/User/Modules/DaftarProviderVisa/Particle/Notification.vue'
import { getRiwayatSurat } from '@/service/daftar_konfigurasi_surat'
import ModalTambahSurat from '@/components/User/Modules/DaftarSuratMenyurat/widgets/ModalTambahSurat.vue'
import ModalKonfigurasi from '@/components/User/Modules/DaftarSuratMenyurat/widgets/ModalKonfigurasi.vue'
import { deleteSurat } from '../../../../service/daftar_konfigurasi_surat'
import SuratIcon from '@/components/Icons/SuratIcon.vue'
import GearIcon from '@/components/Icons/GearIcon.vue'

const totalPages = ref(0)
const riwayatSurat = ref<any[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const searchQuery = ref('')
const currentPage = ref(1)
const itemsPerPage = 10
const total = ref(0)
const modalKonfigurasi = ref(false)
const showModalTambahSurat = ref(false)
const timeoutId = ref<number | null>(null)
const showNotification = ref<boolean>(false)
const showConfirmDialog = ref<boolean>(false)
const notificationMessage = ref<string>('')
const notificationType = ref<'success' | 'error'>('success')
const confirmMessage = ref<string>('')
const confirmTitle = ref<string>('')
const confirmAction = ref<(() => void) | null>(null)
const totalColumns = ref(7) // Default 3 kolom

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
    fetchRiwayatSurat()
  }
}

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
    fetchRiwayatSurat()
  }
}

const pageNow = (page: number) => {
  currentPage.value = page
  fetchRiwayatSurat()
}

const pages = computed(() => {
  return Array.from({ length: totalPages.value }, (_, i) => i + 1)
})

const handleTambahSurat = () => {
  showModalTambahSurat.value = false
  displayNotification('Surat Menyurat berhasil ditambahkan', 'success')
  fetchRiwayatSurat()
}

const modalTambahSurat = () => {
  showModalTambahSurat.value = true
}

const closeModalTambahSurat = () => {
  showModalTambahSurat.value = false
}

const showModalKonfigurasi = () => {
  modalKonfigurasi.value = true
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

const showConfirmation = (title: string, message: string, action: () => void) => {
  confirmTitle.value = title
  confirmMessage.value = message
  confirmAction.value = action
  showConfirmDialog.value = true
}

const handleDownload = async (jamaah_id: number, tipe_surat: string) => {
  showConfirmation('Konfirmasi Cetak', 'Apakah Anda yakin ingin mencetak surat ini?', async () => {
    try {
      const jenisSurat = tipe_surat
      const jamaahId = jamaah_id

      const url = `${window.location.origin}/cetak_surat/${jenisSurat}?jamaah_id=${jamaahId}`
      window.open(url, '_blank')
      showConfirmDialog.value = false
    } catch (error) {
      console.error('Error deleting data:', error)
      displayNotification('Terjadi kesalahan saat Mencetak Surat.', 'error')
    }
  })
}

const handleDelete = async (id: number) => {
  showConfirmation('Konfirmasi Hapus', 'Apakah Anda yakin ingin menghapus data ini?', async () => {
    try {
      const response = await deleteSurat({ id: id })
      showConfirmDialog.value = false
      displayNotification('Delete berhasil', 'success')
      fetchRiwayatSurat()
    } catch (error) {
      console.error('Error deleting data:', error)
      displayNotification('Terjadi kesalahan saat menghapus data.', 'error')
    }
  })
}

const handleKonfigurasi = () => {
  modalKonfigurasi.value = false
  displayNotification('Konfugurasi berhasil', 'success')
}

const closeModalKonfigurasi = () => {
  modalKonfigurasi.value = false
}

const fetchRiwayatSurat = async () => {
  try {
    loading.value = true
    error.value = null

    const payload = {
      perpage: itemsPerPage,
      pageNumber: currentPage.value,
      search: searchQuery.value || '',
    }

    const data = await getRiwayatSurat(payload)

    riwayatSurat.value = data.data
    total.value = data.total
    totalPages.value = Math.ceil(data.total / itemsPerPage)
    console.log('Riwayat Surat:', riwayatSurat.value)
  } catch (err) {
    console.error(err)
    error.value = 'Gagal mengambil data riwayat surat. Silakan coba lagi.'
  } finally {
    loading.value = false
  }
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const formatTipeSurat = (tipe: string) => {
  return tipe
    .replace(/_/g, ' ') // ganti underscore jadi spasi
    .split(' ') // pisah tiap kata
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1)) // kapital tiap awal kata
    .join(' ') // gabung lagi pake spasi
}

onMounted(() => {
  fetchRiwayatSurat()
})
</script>
