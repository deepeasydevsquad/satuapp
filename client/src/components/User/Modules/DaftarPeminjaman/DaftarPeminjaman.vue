<template>
  <div class="container mx-auto p-4">
    <!-- Header dengan Add User dan Search -->
    <div class="flex justify-between items-center mb-4 flex-wrap gap-4">
      <!-- Tombol Tambah & Download -->
      <div class="flex items-center gap-2">
        <PrimaryButton @click="bukaModalPeminjaman">
          <IconPlus />
          Tambah Peminjaman
        </PrimaryButton>

        <PrimaryButton @click="download_peminjaman">
          <IconDownload />
          Download Data
        </PrimaryButton>
      </div>

      <!-- Search + Filter Cabang -->
      <div class="flex items-center gap-0">
        <!-- Search -->
        <input type="text" id="search" v-model="searchQuery" @input="handleSearch" placeholder="Cari berdasarkan nama..."
          class="w-64 px-3 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-s-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
        />
        <!-- Dropdown Cabang -->
        <select v-model="selectedOptionCabang" @change="fetchPinjaman"
          class="w-60 px-3 py-2 text-sm bg-white border border-l-0 border-gray-300 text-gray-700 rounded-e-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
        >
          <option v-for="optionC in optionFilterCabang" :key="optionC.id" :value="optionC.id">
            {{ optionC.name }}
          </option>
        </select>
      </div>
    </div>

    <!-- Tabel Peminjaman -->
    <div class="overflow-x-auto rounded-lg border border-gray-200 shadow-md">
      <table class="w-full border-collapse bg-white text-left text-sm text-gray-500">
        <thead class="bg-gray-100">
          <tr>
            <th class="w-[10%] px-6 py-4 font-medium text-gray-900 text-center">No. Register</th>
            <th class="w-[20%] px-6 py-4 font-medium text-gray-900 text-center">Info Jamaah</th>
            <th class="w-[25%] px-6 py-4 font-medium text-gray-900 text-center">Info Pinjaman</th>
            <th class="w-[40%] px-6 py-4 font-medium text-gray-900 text-center w-[320px]">
              Detail Peminjaman
            </th>
            <th class="w-[5%] px-6 py-4 font-medium text-gray-900 text-center w-28">Aksi</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100 border-t border-gray-100">
          <!-- State Loading -->
          <tr v-if="isLoading">
            <td colspan="5" class="px-6 py-4 text-center">
              <div class="flex justify-center items-center py-8">
                <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-[#455494]"></div>
              </div>
            </td>
          </tr>
          <!-- State Kosong -->
          <tr v-else-if="pinjamans.length === 0">
            <td colspan="5" class="px-6 py-4 text-center text-base text-gray-600">
              {{ searchQuery ? 'Hasil pencarian tidak ditemukan' : 'Data peminjaman tidak ditemukan' }}
            </td>
          </tr>
          <!-- Baris Data -->
          <tr v-for="pinjaman in pinjamans" :key="pinjaman.id" class="hover:bg-gray-50 transition-colors">
            <!-- Nomor Register -->
            <td class="px-6 py-4 text-center align-top text-sm font-bold text-gray-700">
              {{ pinjaman.register_number }}
            </td>
            <!-- Info Jamaah -->
            <td class="px-6 py-4 text-left align-top space-y-2 text-sm text-gray-600">
              <table class="w-full">
                <tbody>
                  <tr>
                    <td class="w-[50%]">Nama Jamaah</td>
                    <td>:</td>
                    <td class="text-right space-y-2 text-sm py-1">{{ pinjaman.nama_jamaah }}</td>
                  </tr>
                  <tr>
                    <td>Nomor Identitas</td>
                    <td>:</td>
                    <td class="text-right space-y-2 text-sm py-1">{{ pinjaman.identity_number }}</td>
                  </tr>
                </tbody>
              </table>
            </td>
            <!-- Info Pinjaman -->
            <td class="px-6 py-4 text-left align-top space-y-2 text-sm text-gray-600">
              <table class="w-full">
                <tbody>
                  <tr>
                    <td class="w-[50%]">Jumlah Peminjaman</td>
                    <td>:</td>
                    <td class="text-right space-y-2 text-sm py-1">
                      {{ formatIDR(pinjaman.nominal) }}
                    </td>
                  </tr>
                  <tr>
                    <td>Jumlah DP</td>
                    <td>:</td>
                    <td class="text-right space-y-2 text-sm py-1">{{ formatIDR(pinjaman.dp) }}</td>
                  </tr>
                  <tr>
                    <td>Tenor</td>
                    <td>:</td>
                    <td class="text-right space-y-2 text-sm py-1">{{ pinjaman.tenor }} Bulan</td>
                  </tr>
                  <tr>
                    <td>Biaya Perbulan</td>
                    <td>:</td>
                    <td class="text-right space-y-2 text-sm py-1">
                      {{ formatIDR(pinjaman.nominal_skema) }}
                    </td>
                  </tr>
                  <tr>
                    <td>Sudah Bayar</td>
                    <td>:</td>
                    <td class="text-right space-y-2 text-sm py-1">
                      {{ formatIDR(pinjaman.total_bayar) }}
                    </td>
                  </tr>
                  <tr>
                    <td>Status Peminjaman</td>
                    <td>:</td>
                    <td class="text-right space-y-2 text-sm py-1">
                      {{ pinjaman.status_peminjaman.replace('_', ' ') }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>

            <!-- Detail Peminjaman (kosong / bisa diganti tabel nested) -->
            <td class="px-6 py-4 text-left align-top text-sm text-gray-600">
              <!-- Contoh nested tabel jika ingin -->
              <table class="w-full border border-gray-200 text-xs">
                <thead>
                  <tr class="bg-gray-100">
                    <th colspan="4" class="px-2 py-3 text-center">RIWAYAT PEMBAYARAN PEMINJAMAN</th>
                  </tr>
                  <tr>
                    <th class="w-[25%] px-2 py-2 border font-bold text-center text-sm">#Invoice</th>
                    <th class="w-[40%] px-2 py-2 border font-bold text-center text-sm">Biaya</th>
                    <th class="w-[20%] px-2 py-2 border font-bold text-center text-sm">Status</th>
                    <th class="w-[15%] px-2 py-2 border font-bold text-center text-sm">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  <template v-if="pinjaman.riwayat_pembayaran.length > 0">
                    <tr v-for="detail in pinjaman.riwayat_pembayaran" :key="detail.id">
                      <td class="px-2 py-2 text-center">{{ detail.invoice }}</td>
                      <td class="px-2 py-2 text-center">{{ formatIDR(detail.nominal) }}</td>
                      <td class="px-2 py-2 text-center">{{ detail.status }}</td>
                      <td class="px-2 py-2 text-center">
                        <center>
                          <LightButton @click="cetakInvoice(detail.invoice)">
                            <CetakIcon class="w-4 h-4" />
                          </LightButton>
                        </center>
                      </td>
                    </tr>
                  </template>
                  <tr v-else>
                    <td class="px-2 py-2 text-center" colspan="4">
                      Riwayat pembayaran pinjaman tidak ditemukan
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>
            <!-- Tombol Aksi -->
            <td class="px-2 py-2 text-center align-top">
              <div class="flex flex-wrap justify-center gap-1 max-w-[64px] mx-auto">
                <LightButton @click="handleCetak(pinjaman)">
                  <CetakIcon class="w-4 h-4" />
                </LightButton>
                <LightButton
                  @click="
                    bukaModalBayar({
                      id: pinjaman.id,
                      riwayat_pembayaran: pinjaman.riwayat_pembayaran,
                    })
                  "
                  title="Pembayaran Cicilan"
                  class="p-1 w-6 h-6"
                >
                  <BayarIcon class="w-4 h-4" />
                </LightButton>
                <LightButton
                  @click="handleModalUpdate(pinjaman.id)"
                  title="Edit Skema Cicilan"
                  class="p-1 w-6 h-6"
                >
                  <EditIcon class="w-4 h-4" />
                </LightButton>
                <DangerButton @click="handleHapusPeminjaman(pinjaman.id)" title="Hapus Peminjaman" class="p-1 w-6 h-6">
                  <DeleteIcon class="w-4 h-4" />
                </DangerButton>
              </div>
            </td>
          </tr>
        </tbody>
        <!-- Footer Pagination -->
        <tfoot class="bg-gray-100 font-bold">
          <Pagination
            :current-page="currentPage"
            :total-pages="totalPages"
            :pages="visiblePages"
            :total-columns="totalColumns"
            :total-row="totalItems"
            @prev-page="prevPage"
            @next-page="nextPage"
            @page-now="goToPage"
          />
        </tfoot>
      </table>
    </div>
  </div>

  <!-- Modal Konfirmasi Hapus -->
  <Confirmation :showConfirmDialog="showConfirmDialog" :confirmTitle="confirmTitle" :confirmMessage="confirmMessage" >
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

  <!-- Form Tambah Peminjaman -->
  <FormAddPeminjaman
    :modalTambahPinjaman="modalTambahPinjaman"
    @close="handleAddPinjaman()"
    @tutup="modalTambahPinjaman = false"
  />

  <!-- Notifikasi -->
  <Notification
    :showNotification="showNotification"
    :notificationType="notificationType"
    :notificationMessage="notificationMessage"
    @close="showNotification = false"
  />

  <FormPembayaran
    :isOpen="showFormPembayaranModal"
    :peminjaman="peminjamanData"
    @close="handleCloseBayarPinjaman"
    @success="handleSuccessBayarPinjaman"
  />
  <!--
  const handleCloseBayarPinjaman = () => {
  showFormPembayaranModal.value = false
}

const handleSuccessBayarPinjaman = () => { -->

  <FormUpdateSkema
    v-if="showFormUpdateModal"
    @close="showFormUpdateModal = false"
    :peminjamanId="peminjamanId"
    @update="handleUpdate"
  />
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { daftarPinjaman, downloadPeminjaman, hapus_transaksi_peminjaman } from '@/service/daftar_pinjaman'
import { paramCabang } from '@/service/param_cabang'
import DeleteIcon from '@/components/User/Modules/DaftarPeminjaman/Icon/DeleteIcon.vue'
import EditIcon from '@/components/User/Modules/DaftarPeminjaman/Icon/EditIcon.vue'
import CetakIcon from '@/components/User/Modules/DaftarPeminjaman/Icon/CetakIcon.vue'
import CetakButton from '@/components/User/Modules/DaftarPeminjaman/Particle/CetakButton.vue'
import BayarIcon from '@/components/User/Modules/DaftarPeminjaman/Icon/BayarIcon.vue'
import BayarButton from '@/components/User/Modules/DaftarPeminjaman/Particle/BayarButton.vue'
// Import komponen lainnya

import Notification from '@/components/Modal/Notification.vue'
import Confirmation from '@/components/Modal/Confirmation.vue'
import FormAddPeminjaman from '@/components/User/Modules/DaftarPeminjaman/widget/FormAddPeminjaman.vue'
import FormUpdateSkema from '@/components/User/Modules/DaftarPeminjaman/widget/FormUpdateSkema.vue'
import FormPembayaran from '@/components/User/Modules/DaftarPeminjaman/widget/FormPembayaran.vue'

// Button
import Pagination from '@/components/Pagination/Pagination.vue'
import LightButton from '@/components/Button/LightButton.vue'
import PrimaryButton from '@/components/Button/PrimaryButton.vue'
import DangerButton from '@/components/Button/DangerButton.vue'
// Icon
import IconPlus from '@/components/Icons/IconPlus.vue'
import IconDownload from '@/components/Icons/IconDownload.vue'

const totalColumns = ref(5)

const pages = computed(() => {
  return Array.from({ length: totalPages.value }, (_, i) => i + 1)
})

const pageNow = (page: number) => {
  currentPage.value = page
  fetchPinjaman()
}

// Interface untuk Type Safety
interface Pinjaman {
  id: number
  register_number: string
  nama_jamaah: string
  identity_number: string
  nominal: number
  dp: number
  tenor: number
  nominal_skema: number
  total_bayar: number
  status_peminjaman: string
  riwayat_pembayaran: Array<{
    id: number
    invoice: string
    nominal: number
    status: string
  }>
}

interface filterCabang {
  id: number
  name: string
}

//filter cabang
const selectedOptionCabang = ref(0)
const optionFilterCabang = ref<filterCabang[]>([])

const fetchFilterData = async () => {
  const response = await paramCabang()
  optionFilterCabang.value = response.data
  selectedOptionCabang.value = response.data[0].id
  await fetchPinjaman()
}

// Data State
const pinjamans = ref<Pinjaman[]>([])
const searchQuery = ref('')
const currentPage = ref(1)
const totalPages = ref(1)
const totalItems = ref(0)
const itemsPerPage = ref(10)
const maxVisiblePages = 5
const isLoading = ref(false)
const peminjamanId = ref(0)

// Modal State
const modalTambahPinjaman = ref(false)
const showDeleteConfirmDialog = ref(false)
const showFormUpdateModal = ref(false)
const showFormPembayaranModal = ref(false)

// Notifikasi State
const showNotification = ref(false)
const notificationMessage = ref('')
const notificationType = ref<'success' | 'error'>('success')
// const timeoutId = ref<number | null>(null)
const searchTimeout = ref<number | null>(null)

const handleModalUpdate = (id: number) => {
  peminjamanId.value = id // Set dulu id-nya
  showFormUpdateModal.value = true // Baru buka modal
  console.log(peminjamanId.value)
}

const handleCloseBayarPinjaman = () => {
  showFormPembayaranModal.value = false
}

const handleSuccessBayarPinjaman = () => {
  showFormPembayaranModal.value = false
  displayNotification('Berhasil Bayar Pinjaman', 'success')
  fetchPinjaman()
}

const handleUpdate = async () => {
  showFormUpdateModal.value = false
  displayNotification('Peminjaman berhasil diupdate', 'success')
}

const cetakInvoice = (invoice: string) => {
  // contoh pemakaian: buka tab baru ke URL cetak
  window.open(`/invoice-pembayaran/${invoice}`, '_blank')
}

const download_peminjaman = async () => {
  try {
    const response = await downloadPeminjaman()
    console.log('Downloaded data:', response)
  } catch (error) {
    console.error('Error fetching Jamaah:', error)
  }
}

const invoiceTerakhir = (pinjaman: Pinjaman): string | null => {
  const riwayat = pinjaman.riwayat_pembayaran ?? []

  if (riwayat.length === 0) return null

  const sorted = [...riwayat].sort((a, b) => {
    return new Date(b.create).getTime() - new Date(a.create).getTime()
  })

  return sorted[0].invoice
}

const handleCetak = (pinjaman: Pinjaman) => {
  const lastInvoice = invoiceTerakhir(pinjaman)
  if (lastInvoice) {
    // contoh pemakaian: buka tab baru ke URL cetak
    window.open(`/invoice-pembayaran/${lastInvoice}`, '_blank')
  } else {
    displayNotification('Nomor invoice tidak tersedia', 'error')
  }
}

// Computed Properties
const visiblePages = computed(() => {
  const pages = []
  const halfVisible = Math.floor(maxVisiblePages / 2)

  let startPage = Math.max(1, currentPage.value - halfVisible)
  let endPage = Math.min(totalPages.value, currentPage.value + halfVisible)

  // Adjust jika visible pages kurang dari maxVisiblePages
  if (endPage - startPage + 1 < maxVisiblePages) {
    if (currentPage.value < totalPages.value / 2) {
      endPage = Math.min(totalPages.value, startPage + maxVisiblePages - 1)
    } else {
      startPage = Math.max(1, endPage - maxVisiblePages + 1)
    }
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i)
  }
  return pages
})

// Format Currency
const formatIDR = (nominal: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(nominal)
}

// Fetch Data Peminjaman
const fetchPinjaman = async () => {
  isLoading.value = true
  pinjamans.value = []

  try {
    const response = await daftarPinjaman({
      search: searchQuery.value,
      perpage: itemsPerPage.value,
      pageNumber: currentPage.value,
      cabang: selectedOptionCabang.value,
    })

    // Handle berbagai kemungkinan struktur response
    if (response && response.data) {
      pinjamans.value = response.data
      totalItems.value = response.total || response.data.length || 0
      totalPages.value = Math.ceil(totalItems.value / itemsPerPage.value) || 1
    } else {
      pinjamans.value = []
      totalItems.value = 0
      totalPages.value = 1
    }
  } catch (error) {
    console.error('Error fetching pinjaman:', error)
    displayNotification('Gagal memuat data pinjaman: ' + (error as Error).message, 'error')
    pinjamans.value = []
    totalPages.value = 1
    totalItems.value = 0
  } finally {
    isLoading.value = false
  }
}

// Notifikasi
const displayNotification = (message: string, type: 'success' | 'error' = 'success') => {
  notificationMessage.value = message
  notificationType.value = type
  showNotification.value = true

  if (timeoutId.value) {
    clearTimeout(timeoutId.value)
  }

  timeoutId.value = window.setTimeout(() => {
    showNotification.value = false
  }, 3000)
}

// Handle Search dengan debounce
const handleSearch = () => {
  currentPage.value = 1
  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value)
  }

  searchTimeout.value = window.setTimeout(() => {
    fetchPinjaman()
  }, 500)
}

// Pagination
const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
    fetchPinjaman()
  }
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
    fetchPinjaman()
  }
}

const goToPage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
    fetchPinjaman()
  }
}

// Modal
const bukaModalPeminjaman = () => {
  modalTambahPinjaman.value = true
}

const peminjamanData = ref({})

const bukaModalBayar = (data) => {
  peminjamanData.value = data
  showFormPembayaranModal.value = true
}

const handleAddPinjaman = () => {
  modalTambahPinjaman.value = false
  displayNotification('Peminjaman berhasil ditambahkan', 'success')
  fetchPinjaman()
}

const confirmMessage = ref('')
const confirmTitle = ref('')
const confirmAction = ref<(() => void) | null>(null)
const timeoutId = ref<number | null>(null)
const showConfirmDialog = ref(false)

const showConfirmation = (title: string, message: string, action: () => void) => {

  console.log("------1");
  console.log("------2");
  confirmTitle.value = title
  confirmMessage.value = message
  confirmAction.value = action
  showConfirmDialog.value = true
}

const handleHapusPeminjaman = (id: number) => {

  console.log("xxxx");
  console.log("xxxx");
  console.log("xxxx");
  showConfirmation('Konfirmasi Hapus', 'Apakah Anda yakin ingin menghapus data peminjaman ini?', async () => {
    try {
      await hapus_transaksi_peminjaman({ id: id })
      showConfirmDialog.value = false
      displayNotification('Operasi berhasil!', 'success')
      fetchPinjaman()
    } catch (error) {
      console.error('Error deleting data:', error)
    }
  })
}

// Lifecycle Hooks
onMounted(() => {
  fetchFilterData()
})

onUnmounted(() => {
  if (timeoutId.value) {
    clearTimeout(timeoutId.value)
  }
  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value)
  }
})
</script>

<style scoped>
/* Style tetap sama */
</style>
