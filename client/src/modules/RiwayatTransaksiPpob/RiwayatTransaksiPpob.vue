<script setup lang="ts">
import Pagination from '@/components/Pagination/Pagination.vue'
import { ref, computed, onMounted } from 'vue'
import { riwayat_transaksi } from '@/service/produk_ppob'

interface riwayatTransaksiPpob {
  id: number
  nama_produk: string
  kode_produk: string
  transaction_code: string
  nomor_tujuan: string
  company_price: string
  status: string
  createdAt: string
}

const riwayat = ref<riwayatTransaksiPpob[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const searchQuery = ref('')
const search = ref('')
const currentPage = ref(1)
const totalPages = ref(0)
const totalColumns = ref(6)
const itemsPerPage = ref(100)
const totalItems = ref(0)
const timeoutId = ref<number | null>(null)
const searchTimeout = ref<number | null>(null)
const totalRow = ref(0)

const fetchData = async () => {
  try {
    loading.value = true
    error.value = null
    const response = await riwayat_transaksi({
      search: searchQuery.value,
      perpage: itemsPerPage.value,
      pageNumber: currentPage.value,
    })
    riwayat.value = response.data
    totalItems.value = response.total || response.data.length || 0
    totalPages.value = Math.ceil(totalItems.value / itemsPerPage.value) || 1
    console.log('Riwayat Peminjaman:', riwayat.value)
  } catch (err) {
    error.value = 'Gagal mengambil data riwayat peminjaman. Silakan coba lagi.'
    console.error('Error fetching system logs:', err)
  } finally {
    loading.value = false
  }
}

const pages = computed(() => {
  return Array.from({ length: totalPages.value }, (_, i) => i + 1)
})

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

onMounted(() => {
  fetchData()
})

const handlePrev = () => {
  if (currentPage.value > 1) currentPage.value--
  fetchData()
}
const handleNext = () => {
  if (currentPage.value < totalPages.value) currentPage.value++
  fetchData()
}
const handlePageNow = (page: number) => {
  currentPage.value = page
  fetchData()
}

const handleSearch = () => {
  currentPage.value = 1
  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value)
  }

  searchTimeout.value = window.setTimeout(() => {
    fetchData()
  }, 500)
}
</script>

<template>
  <div class="container mx-auto p-4">
    <div class="flex justify-between items-center mb-4 flex-wrap gap-4">
      <div class="flex items-center gap-2"></div>
      <div class="flex items-center gap-2">
        <input
          type="text"
          id="search"
          v-model="searchQuery"
          @input="handleSearch"
          placeholder="Cari nama atau kode produk.."
          class="w-64 px-3 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
        />
      </div>
    </div>
    <div class="overflow-x-auto rounded-lg border border-gray-200 shadow-md">
      <table class="w-full border-collapse bg-white text-left text-sm text-gray-500">
        <thead class="bg-gray-100">
          <tr>
            <th class="w-[12%] px-6 py-4 font-medium text-gray-900 text-center">Transaction Code</th>
            <th class="w-[37%] px-6 py-4 font-medium text-gray-900 text-center">Info Produk</th>
            <th class="w-[10%] px-6 py-4 font-medium text-gray-900 text-center">Status</th>
            <th class="w-[15%] px-6 py-4 font-medium text-gray-900 text-center">Nomor Tujuan</th>
            <th class="w-[13%] px-6 py-4 font-medium text-gray-900 text-center">Harga Perusahaan</th>
            <th class="w-[13%] px-6 py-4 font-medium text-gray-900 text-center">Tanggal Transaksi</th>
          </tr>
        </thead>

        <tbody class="divide-y divide-gray-100 border-t border-gray-100">
          <template v-if="riwayat.length > 0">
            <tr v-for="d in riwayat" :key="d.id" class="hover:bg-gray-50 transition-colors">
              <td class="px-6 py-4 text-center text-sm text-gray-600 font-bold">#{{ d.transaction_code }}</td>
              <td class="px-6 py-4 text-sm font-medium text-gray-700 text-center align-middle">
                <table class="w-full mb-5">
                  <tbody>
                    <tr v-for="(label, value) in {
                      'Nama Produk': d.nama_produk,
                      'Kode Produk': d.kode_produk,
                       }"
                    :key="label" class="border-gray-200 hover:bg-gray-200">
                      <td class="w-[30%] border-b px-6 py-2 text-left">{{ value }}</td>
                      <td class="text-center border-b py-2">:</td>
                      <td class="border-b text-right space-y-2 text-sm px-6 py-2">{{ label }}</td>
                    </tr>
                  </tbody>
                </table>
              </td>
              <td class="px-6 py-4 text-center text-sm">
                <span
                  class="px-2 py-1 rounded-full font-semibold uppercase"
                  :class="{
                    'bg-green-100 text-green-700': d.status?.toLowerCase() === 'success',
                    'bg-yellow-100 text-yellow-700': d.status?.toLowerCase() === 'process',
                    'bg-red-100 text-red-700': d.status?.toLowerCase() === 'failed',
                  }"
                >
                  {{ d.status?.toUpperCase() }}
                </span>
              </td>
              <td class="px-6 py-4 text-center text-sm text-gray-600">
                {{ d.nomor_tujuan }}
              </td>
              <td class="px-6 py-4 text-center text-sm text-gray-600">
                {{ formatIDR(Number(d.company_price)) }}
              </td>
              <td class="px-6 py-4 text-center text-sm text-gray-600">
                {{ formatDate(d.createdAt) }}
              </td>
            </tr>
          </template>
          <template v-else>
            <tr>
              <td colspan="6" class="px-2 py-2 text-center">
                Data Riwayat Transaksi Tidak Ditemukan
              </td>
            </tr>
          </template>
        </tbody>

        <tfoot class="bg-gray-100 font-bold">
          <Pagination
            :currentPage="currentPage"
            :totalPages="totalPages"
            :pages="pages"
            :totalColumns="totalColumns"
            @prev-page="handlePrev"
            @next-page="handleNext"
            @page-now="handlePageNow"
            :totalRow="totalItems"
          />
        </tfoot>
      </table>
    </div>
  </div>
</template>
