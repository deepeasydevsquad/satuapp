<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getKwitansiTerakhir  } from '@/service/invoice.ts'
import { useRoute } from 'vue-router'
import Header from '@/components/User/Modules/Invoice/Particle/Header.vue'

const route = useRoute()
const regnum = route.params.invoice
const kwitansiData = ref<any>({});

const fetchData = async () => {
  try {
    const response = await getKwitansiTerakhir(regnum.toString())
    kwitansiData.value = response.data
    console.log(kwitansiData.value)
  } catch (error) {
    console.error("Error fetching invoice data:", error)
  }
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("id-ID").format(value)
}

onMounted(() => {
  try {
    fetchData()

    // Tunggu sebentar agar DOM selesai dirender
    setTimeout(() => {
      window.scrollTo(0, 0)
      window.print()
      setTimeout(() => {
        window.close();
      }, 1000);
    }, 1500) // kasih delay dikit kalau perlu render dulu

  } catch (err) {
    console.error("Error:", err)
  }
})
</script>

<template>
  <div class="bg-white p-8 text-sm text-gray-800 min-h-screen">
    <div v-if="kwitansiData && Object.keys(kwitansiData).length > 0">
      <Header :data="kwitansiData"></Header>
      <h2 class="text-center text-lg font-bold mb-3 pb-2">KWITANSI TERAKHIR PAKET LA</h2>
      <!-- Info Transaksi -->
      <div class="grid grid-cols-3 gap-4 mb-6">
        <div class="border rounded-md p-3 min-h-[60px]">
          <p class="text-xs font-semibold text-gray-600">Nomor Register</p>
          <p class="text-base font-medium">{{ kwitansiData?.register_number || '-' }}</p>
        </div>
        <div class="border rounded-md p-3 min-h-[60px]">
          <p class="text-xs font-semibold text-gray-600">Status</p>
          <p class="text-base font-medium uppercase">{{ kwitansiData?.Transaksi[0].status || '-' }}</p>
        </div>
        <div class="border rounded-md p-3 min-h-[60px]">
          <p class="text-xs font-semibold text-gray-600">Info Client</p>
          <p class="text-base font-medium">
            {{ kwitansiData?.client_name || '-' }}
          </p>
        </div>
      </div>

      <!-- Tabel Transaksi -->
      <div class="overflow-x-auto print:overflow-visible">
        <table class="w-full text-center border border-collapse mb-4 print:text-xs">
          <thead class="bg-gray-100">
            <tr>
              <th class="w-[20%] border p-2">Tanggal Transaksi</th>
              <th class="w-[15%] border p-2">Nomor Invoice</th>
              <th class="w-[15%] border p-2 capitalize">Status</th>
              <th class="w-[30%] border p-2">Penerima</th>
              <th class="w-[20%] border p-2">Biaya</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="border p-2">{{ kwitansiData?.Transaksi[0].date }}</td>
              <td class="border p-2">{{ kwitansiData?.Transaksi[0].invoice }}</td>
              <td class="border p-2 capitalize">{{ kwitansiData?.Transaksi[0].status }}</td>
              <td class="border p-2">{{ kwitansiData?.Transaksi[0].receiver }}</td>
              <td class="border p-2">Rp {{ formatCurrency(kwitansiData?.Transaksi[0].paid) }}</td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <td class="border p-2 text-right" colspan="4">Total Pembayaran</td>
              <td class="border p-2">Rp {{ formatCurrency(kwitansiData?.Transaksi[0].paid) }}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <!-- Tanda Tangan -->
      <div class="flex justify-between mt-8">
        <div>
          <p class="mb-12">Klien</p>
          <p class="border-t border-gray-400 w-40"></p>
        </div>
        <div>
          <p class="mb-12">Penerima</p>
          <p class="border-t border-gray-400 w-40"></p>
        </div>
      </div>
    </div>
    <div v-else class="flex items-center justify-center min-h-screen">
      <div class="text-center bg-red-50 border border-red-200 text-red-600 p-6 rounded-xl shadow-sm">
        <h2 class="text-xl font-semibold mb-2">Nomor Register Tidak Ditemukan</h2>
        <p class="text-sm">Silakan periksa kembali nomor register atau hubungi administrator.</p>
      </div>
    </div>
  </div>
</template>


<style scoped>
@media print {
  @page {
    size: A4;
    background-color: #fff !important;
    -webkit-print-color-adjust: exact;
    font-size: 12px;
  }
}
</style>


