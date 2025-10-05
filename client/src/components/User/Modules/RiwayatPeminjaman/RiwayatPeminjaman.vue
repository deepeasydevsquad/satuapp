<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { getRiwayatPeminjaman } from '@/service/riwayat_peminjaman'
import { paramCabang } from '@/service/param_cabang'
import Pagination from '@/components/Pagination/Pagination.vue'

interface filterCabang {
  id: number
  name: string
}

//filter cabang

const fetchFilterData = async () => {
  const response = await paramCabang()
  optionFilterCabang.value = response.data
  selectedOptionCabang.value = response.data[0].id
  await fetchRiwayatPeminjaman()
}

interface RiwayatPeminjamanItem {
  nama_jamaah: string
  nomor_identitas: string
  register_number: string
  invoice: string
  nominal: number
  petugas: string
  status: string
  tanggal_transaksi: string
}

// State utama
const riwayat = ref<RiwayatPeminjamanItem[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const searchQuery = ref('')
const selectedOptionCabang = ref(0)
const optionFilterCabang = ref<filterCabang[]>([])
const search = ref('')
const currentPage = ref(1)
const totalPages = ref(0)
const totalColumns = ref(6)
const itemsPerPage = ref(10)
const totalItems = ref(0)

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
    fetchRiwayatPeminjaman()
  }
}

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
    fetchRiwayatPeminjaman()
  }
}

const goToPage = (page: number) => {
  currentPage.value = page
  fetchRiwayatPeminjaman()
}

const visiblePages = computed(() => {
  const pagesToShow = 5
  const total = totalPages.value
  const current = currentPage.value
  let start = Math.max(1, current - Math.floor(pagesToShow / 2))
  let end = Math.min(total, start + pagesToShow - 1)

  if (end - start < pagesToShow - 1) {
    start = Math.max(1, end - pagesToShow + 1)
  }

  return Array.from({ length: end - start + 1 }, (_, i) => start + i)
})

const pageNow = (page: number) => {
  currentPage.value = page
  fetchRiwayatPeminjaman()
}

const pages = computed(() => {
  return Array.from({ length: totalPages.value }, (_, i) => i + 1)
})

// Filter tanggal
const filters = ref({
  tanggal_awal: '',
  tanggal_akhir: '',
})

// Pagination

// Ambil data
const fetchRiwayatPeminjaman = async () => {
  try {
    loading.value = true
    error.value = null
    const response = await getRiwayatPeminjaman({
      search: searchQuery.value,
      perpage: itemsPerPage.value,
      pageNumber: currentPage.value,
      cabang: selectedOptionCabang.value,
    })
    riwayat.value = response.data
    totalItems.value = response.total || response.data.length || 0
    totalPages.value = Math.ceil(totalItems.value / itemsPerPage.value) || 1
  } catch (err) {
    error.value = 'Gagal mengambil data riwayat peminjaman. Silakan coba lagi.'
    console.error('Error fetching system logs:', err)
  } finally {
    loading.value = false
  }
}

// Format tanggal
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

// Format IDR
const formatIDR = (value: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(value)
}

// Filter berdasarkan nama, invoice, dan tanggal
const filteredRiwayat = computed(() => {
  return riwayat.value.filter((r) => {
    const search = searchQuery.value.toLowerCase()
    const matchSearch =
      r.nama_jamaah?.toLowerCase().includes(search) || r.invoice?.toLowerCase().includes(search)

    const tanggalTransaksi = new Date(r.tanggal_transaksi)
    const afterStart = filters.value.tanggal_awal
      ? tanggalTransaksi >= new Date(filters.value.tanggal_awal)
      : true
    const beforeEnd = filters.value.tanggal_akhir
      ? tanggalTransaksi <= new Date(filters.value.tanggal_akhir)
      : true

    return matchSearch && afterStart && beforeEnd
  })
})

onMounted(() => {
  fetchFilterData()
})
</script>

<template>
  <div class="container mx-auto p-4">
    <div class="flex justify-between mb-4">
      <div class="inline-flex rounded-md shadow-xs" role="group"></div>
      <div class="flex items-center">
        <label for="search" class="block text-sm font-medium text-gray-700 mr-2">Filter</label>
        <div class="flex flex-wrap items-center gap-4">
          <!-- Input Pencarian -->

          <!-- Tanggal Awal -->
          <input
            v-model="filters.tanggal_awal"
            @change="fetchRiwayatPeminjaman"
            type="date"
            class="px-3 py-2 border border-gray-300 rounded-lg shadow-sm text-sm text-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />

          <!-- Tanggal Akhir -->
          <input
            v-model="filters.tanggal_akhir"
            @change="fetchRiwayatPeminjaman"
            type="date"
            class="px-3 py-2 border border-gray-300 rounded-lg shadow-sm text-sm text-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />

          <!-- Filter Cabang -->
          <div class="flex">
            <input
              v-model="searchQuery"
              @input="fetchRiwayatPeminjaman"
              type="text"
              placeholder="Nama atau Invoice"
              class="w-64 px-3 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-s-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            />
            <select
              v-model="selectedOptionCabang"
              @change="fetchRiwayatPeminjaman"
              class="w-60 px-3 py-2 text-sm bg-white border border-l-0 border-gray-300 text-gray-700 rounded-e-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            >
              <option value="">Semua Cabang</option>
              <option v-for="optionC in optionFilterCabang" :key="optionC.id" :value="optionC.id">
                {{ optionC.name }}
              </option>
            </select>
          </div>

        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-4">
      <span class="text-gray-500">Loading...</span>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="text-center py-4">
      <span class="text-red-500">{{ error }}</span>
    </div>

    <!-- Tabel System Log -->
    <div v-else class="overflow-hidden rounded-lg border border-gray-200 shadow-md">
      <table class="w-full border-collapse bg-white text-left text-sm text-gray-500">
        <thead class="bg-gray-100">
          <tr>
            <th class="w-[15%] px-6 py-4 font-medium text-gray-900 text-center">
              Ne Registrasi / Invoice
            </th>
            <th class="w-[30%] px-6 py-4 font-medium text-gray-900 text-center">Info Jamaah</th>
            <th class="w-[15%] px-6 py-4 font-medium text-gray-900 text-center">Biaya</th>
            <th class="w-[10%] px-6 py-4 font-medium text-gray-900 text-center">Status Biaya</th>
            <th class="w-[15%] px-6 py-4 font-medium text-gray-900 text-center">Penerima</th>
            <th class="w-[15%] px-6 py-4 font-medium text-gray-900 text-center">
              Tanggal Transaksi
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200">
          <tr v-if="filteredRiwayat.length === 0">
            <td colspan="6" class="px-6 py-4 text-center text-gray-500">Data tidak ada</td>
          </tr>
          <tr
            v-for="riwayat in filteredRiwayat"
            :key="riwayat.invoice"
            class="hover:bg-gray-50 transition-colors"
          >
            <td class="px-6 py-4 text-center font-bold">
              {{ riwayat.register_number }}/<br />{{ riwayat.invoice }}
            </td>
            <td class="px-6 py-4 text-left">
              <div class="space-y-1">
                <div class="grid grid-cols-3 gap-2">
                  <span class="font-medium text-gray-600">Nama</span>
                  <span class="col-span-2">: {{ riwayat.nama_jamaah }}</span>
                </div>
                <div class="grid grid-cols-3 gap-2">
                  <span class="font-medium text-gray-600">Identitas</span>
                  <span class="col-span-2">: {{ riwayat.nomor_identitas }}</span>
                </div>
              </div>
            </td>

            <td class="px-6 py-4 text-center">{{ formatIDR(riwayat.nominal) }}</td>
            <td class="px-6 py-4 text-center">{{ riwayat.status }}</td>
            <td class="px-6 py-4 text-center">{{ riwayat.petugas }}</td>
            <td class="px-6 py-4 text-center">{{ formatDate(riwayat.tanggal_transaksi) }}</td>
          </tr>
        </tbody>
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
</template>
