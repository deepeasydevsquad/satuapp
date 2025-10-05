<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { cetakKwitansiPassport } from '@/service/invoice.ts'
import Header from '@/components/User/Modules/Invoice/Particle/Header.vue'

const isLoading = ref(true)
const data = ref<any>(null)
const route = useRoute()

const errorMessage = ref<string | null>(null)

onMounted(async () => {
  try {
    const invoice = route.params.invoice as string

    console.log('[VUE DEBUG] Invoice from params:', invoice)

    if (!invoice || invoice === 'undefined') {
      console.error('[VUE ERROR] Invoice parameter is missing or invalid.')
      errorMessage.value = 'Parameter invoice tidak valid atau hilang dari URL.'
      isLoading.value = false
      return
    }

    console.log('[VUE DEBUG] Fetching kwitansi for invoice:', invoice)

    const response = await cetakKwitansiPassport(invoice)

    console.log('[VUE DEBUG] Response received:', response)

    if (response.error || !response.data) {
      console.error('[VUE ERROR] API Error:', response.error_msg)
      errorMessage.value = `Gagal memuat data dari server: ${response.error_msg || 'Data tidak ditemukan.'}`
      isLoading.value = false
      return
    }

    data.value = response.data
    console.log('[VUE DEBUG] Kwitansi data loaded:', data.value)
  } catch (error: any) {
    console.error('[VUE ERROR] Error fetching passport transaction:', error)
    errorMessage.value = `Terjadi kesalahan fatal: ${error.message}`
  } finally {
    isLoading.value = false

    if (data.value) {
      setTimeout(() => {
        console.log('[VUE DEBUG] About to print...')
        window.print()
      }, 1000)
    }
  }
})

const formatCurrency = (amount: number) => {
  if (typeof amount !== 'number') return '0'
  return new Intl.NumberFormat('id-ID').format(amount)
}

const formatDate = (dateString: string) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}
</script>

<template>
  <div v-if="isLoading" class="flex justify-center items-center h-screen">
    <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
    <span class="ml-2">Memuat data kwitansi...</span>
  </div>

  <div
    v-else-if="errorMessage"
    class="flex flex-col justify-center items-center h-screen bg-red-50 p-4"
  >
    <div class="text-red-700 text-center">
      <h2 class="text-xl font-bold mb-2">Terjadi Kesalahan</h2>
      <p>{{ errorMessage }}</p>
      <button
        @click="window.close()"
        class="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
      >
        Tutup Jendela
      </button>
    </div>
  </div>

  <div
    v-else-if="data"
    class="bg-white max-w-[210mm] mx-auto p-[15mm] font-serif print:p-[10mm] print:m-0 print:shadow-none"
    style="color: black; font-size: 10pt; text-align: justify; line-height: 1.3"
  >
    <!-- Header Kwitansi -->
    <div v-if="data" class="mb-4">
      <Header :data="data"></Header>
    </div>

    <div class="border-b-2 border-black mb-4"></div>

    <!-- Info Header -->
    <div class="flex justify-between mb-4">
      <div>
        <h2 class="text-lg font-bold">DETAIL TRANSAKSI PASSPORT</h2>
        <p><span class="font-semibold">DITERIMA OLEH:</span></p>
        <p>{{ 'ADMINISTRATOR' }}</p>
      </div>
      <div class="text-right">
        <p><span class="font-semibold">INVOICE:</span> {{ data.invoice }}</p>
        <br />
        <p><span class="font-semibold">DITERIMA DARI</span></p>
        <p>{{ data.nama_kostumer }}</p>
      </div>
    </div>

    <!-- Detail Transaksi Table -->
    <div class="mb-6">
      <h3 class="font-semibold mb-2">DETAIL TRANSAKSI:</h3>
      <table class="w-full border-collapse border border-gray-800 text-xs">
        <thead>
          <tr class="bg-gray-100">
            <th class="border border-gray-800 p-2 text-left">IDENTITAS</th>
            <th class="border border-gray-800 p-2 text-left">INFO PASSPORT</th>
            <th class="border border-gray-800 p-2 text-center">HARGA PAKET</th>
          </tr>
        </thead>
        <tbody>
          <!-- Menggunakan v-for untuk menampilkan semua detail -->
          <tr v-for="(item, index) in data.details" :key="index">
            <td class="border border-gray-800 p-2 align-top">
              <div class="space-y-1">
                <p><strong>Nama:</strong> {{ item.name }}</p>
                <p><strong>No. Identitas:</strong> {{ item.identity_number }}</p>
              </div>
            </td>
            <td class="border border-gray-800 p-2 align-top">
              <div class="space-y-1">
                <p><strong>Nama Kota:</strong> {{ item.city }}</p>
                <p><strong>Nomor KK:</strong> {{ item.kk_number }}</p>
                <p>
                  <strong>TTL:</strong> {{ item.birth_place }}, {{ formatDate(item.birth_date) }}
                </p>
                <p><strong>Alamat:</strong> {{ item.address }}</p>
              </div>
            </td>
            <td class="border border-gray-800 p-2 text-center align-top">
              <p>Rp {{ formatCurrency(item.price) }}</p>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Total -->
    <div class="flex justify-end mb-6">
      <div class="text-right border border-gray-800 p-2">
        <!-- Menampilkan total harga yang sudah dihitung -->
        <p class="font-semibold">TOTAL: Rp {{ formatCurrency(data.total_price) }}</p>
      </div>
    </div>

    <!-- Tanda Tangan -->
    <div class="flex justify-between mt-12">
      <div class="text-center">
        <p class="mb-16">Penerima</p>
        <div class="border-t border-gray-800 pt-1">
          <p>
            (ADMINISTRATOR) <br />
            {{ data.company_name }}
          </p>
        </div>
      </div>
      <div class="text-center">
        <p class="mb-16">Penyetor</p>
        <div class="border-t border-gray-800 pt-1">
          <p>( {{ data.nama_kostumer }} )</p>
        </div>
      </div>
    </div>

    <!-- Footer Info -->
    <div class="mt-8 text-xs">
      <p><strong>Tanggal Transaksi:</strong> {{ formatDate(data.createdAt) }}</p>
    </div>
  </div>
</template>

<style scoped>
@media print {
  @page {
    size: A4;
    margin: 10mm;
  }
  body,
  html {
    background: white;
    margin: 0;
    color: black !important;
  }
  .print\:text-\[12px\] {
    font-size: 12px !important;
  }
  .no-print {
    display: none !important;
  }
}
</style>
