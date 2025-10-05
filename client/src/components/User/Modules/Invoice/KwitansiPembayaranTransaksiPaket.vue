<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { getKwitansiPembayaranTransaksiPaketUmrah } from '@/service/invoice.ts'
import Header from '@/components/User/Modules/Invoice/Particle/Header.vue'

const route = useRoute()
const invoice = route.params.invoice
const data = ref<any>(null)
const isLoading = ref(true)

const fetchData = async () => {
  try {
    isLoading.value = true
    const response = await getKwitansiPembayaranTransaksiPaketUmrah(invoice.toString())
    data.value = response.data
    isLoading.value = false
  } catch (error) {
    console.error("Gagal ambil data kwitansi:", error)
    isLoading.value = false
  }
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value)
}

function formatDate(date: string) {
  return new Date(date).toISOString().slice(0, 19).replace('T', ' ')
}

onMounted(async () => {
  await fetchData()
  if (!data.value) {
    window.close()
  } else {
    setTimeout(() => {
      window.scrollTo(0, 0)
      window.print()
      setTimeout(() => {
        window.close()
      }, 1000)
    }, 1500)
  }
})
</script>

<template>
  <div v-if="isLoading" class="flex justify-center items-center h-screen">
    <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900"></div>
  </div>
   <div class="bg-white max-w-[210mm] mx-auto p-[15mm] font-serif print:p-[10mm] print:m-0 print:shadow-none" style="color: black; font-size: 10pt; text-align: justify; line-height: 1.3">
    <div v-if="!isLoading && data">
      <!-- Header Kwitansi -->
      <Header :data="data"></Header>
      <!-- Judul -->
      <h2 class="text-center text-lg font-bold pb-2 mb-2">KWITANSI PEMBAYARAN TRANSAKSI PAKET</h2>
      <!-- Info Jamaah & Transaksi -->
      <div class="border-t border-b px-0 py-4 bg-white mb-6 text-xs">
        <div class="grid grid-cols-5 gap-4">
          <div>
            <p class="text-gray-500 font-bold">Kode Transaksi</p>
            <p class="font-medium">{{ data.invoice }}</p>
          </div>
          <div>
            <p class="text-gray-500 font-bold">Sumber Dana</p>
            <p class="font-medium">Cash</p>
          </div>
          <div>
            <p class="text-gray-500 font-bold">Status Transaksi</p>
            <p class="font-medium">Sukses</p>
          </div>
          <div>
            <p class="text-gray-500 font-bold">Keperluan</p>
            <p class="font-medium">Transaksi Paket</p>
          </div>
          <div>
            <p class="text-gray-500 font-bold">Info Jamaah</p>
            <p class="font-medium">
              {{ data.fullname }}<br />
              <span class="text-gray-700">({{ data.whatsapp_number }})</span>
            </p>
          </div>
        </div>
      </div>
      <!-- Tabel Transaksi -->
      <div class="rounded p-0 bg-white mb-6">
        <h2 class="text-md font-bold mb-0 pb-2">Detail Transaksi</h2>
        <table class="w-full text-center  border-collapse mb-6 text-xs print:text-xs border-b border-gray-300">
          <thead class="bg-gray-100">
            <tr>
              <th class="border-b border-t border-s font-medium border-gray-300 p-2 w-[20%]">Tanggal</th>
              <th class="border-b border-t font-medium border-gray-300 p-2 w-[10%]">Keperluan</th>
              <th class="border-b border-t font-medium border-gray-300 p-2 w-[30%]">Penerima</th>
              <th class="border-b border-t font-medium border-gray-300 p-2 w-[30%]">Info</th>
              <th class="border-b border-t border-e font-medium border-gray-300 p-2 w-[10%]">Jumlah</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="border-b border-gray-300 p-2">{{ formatDate(data.createdAt) }}</td>
              <td class="border-b border-gray-300 p-2">Transaksi Paket</td>
              <td class="border-b border-gray-300 p-2">{{ data.penerima }}</td>
              <td class="border-b border-gray-300 p-2">{{ data.info_paket }}</td>
              <td class="border-b border-gray-300 p-2">{{ formatCurrency(data.nominal) }}</td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <td colspan="4" class="border-b border-gray-300 p-2 text-right font-bold"><i>Total Pembayaran</i></td>
              <td class="border-b border-gray-300 p-2 font-normal">{{ formatCurrency(data.nominal) }}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <!-- Tanda Tangan -->
      <div class="flex justify-between text-center mt-12">
        <div>
          <p class="mb-12">Member / Jamaah</p>
          <p class="border-t border-gray-400 w-48 mx-auto"></p>
        </div>
        <div>
          <p class="mb-12">Penerima</p>
          <p class="border-t border-gray-400 w-48 mx-auto"></p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@media print {
  @page {
    size: A4;
    margin: 0mm;
    -webkit-print-color-adjust: exact;
  }
}
</style>

