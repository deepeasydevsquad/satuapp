<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { getKwitansiHandoverFasilitasPaket } from '@/service/invoice.ts'
import Header from '@/components/User/Modules/Invoice/Particle/Header.vue'

const route = useRoute()
const invoice = route.params.invoice
const data = ref<any>(null)
const isLoading = ref(false)

const fetchData = async () => {
  try {
    isLoading.value = true
    console.log("Fetching data for invoice:", invoice)
    const response = await getKwitansiHandoverFasilitasPaket(invoice.toString())
    console.log("Response data kwitansi: ", response.data)
    data.value = response.data
    console.log("Data fetchednya bro: ", data.value)
  } catch (error) {
    console.error("Gagal ambil data kwitansi:", error)
  } finally {
    isLoading.value = false
  }
}

onMounted(async () => {
  await fetchData()
  await nextTick()
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
  <div class="bg-white text-gray-800 max-w-[210mm] mx-auto min-h-[297mm] p-[20mm] font-serif text-xs print:shadow-none print:bg-white print:text-black print:max-w-full">
    <div v-if="!isLoading && data">
      <!-- Header -->
      <Header :data="data"></Header>

      <!-- Judul -->
      <h2 class="text-lg font-bold text-center mb-6">KWITANSI HANDOVER FASILITAS</h2>

      <!-- Informasi Umum -->
      <div class="border border-gray-200 rounded p-4 grid grid-cols-6 gap-6 mb-6">
        <div>
          <p class="text-gray-600 font-semibold">Kode Transaksi</p>
          <p class="text-gray-500 font-medium"># {{ data.invoice }}</p>
        </div>
        <div>
          <p class="text-gray-600 font-semibold">Status Transaksi</p>
          <p class="text-gray-500 font-medium">Sukses</p>
        </div>
        <div>
          <p class="text-gray-600 font-semibold">Keperluan</p>
          <p class="text-gray-500 font-medium">Handover Fasilitas</p>
        </div>
        <div>
          <p class="text-gray-600 font-semibold">Petugas</p>
          <p class="text-gray-500 font-medium">{{ data.petugas }}</p>
        </div>
        <div>
          <p class="text-gray-600 font-semibold">Penerima</p>
          <p class="font-medium">
            {{ data.penerima }}<br />
            <span class="text-gray-500">(WA : {{ data.whatsapp_number }})</span>
          </p>
        </div>
        <div>
          <p class="text-gray-600 font-semibold">Tanggal Transaksi</p>
          <p class="text-gray-500 font-medium">{{ data.tanggal_transaksi }}</p>
        </div>
      </div>

      <!-- Detail Fasilitas -->
      <div>
        <h3 class="text-md font-bold mb-2">Detail Handover Fasilitas</h3>
        <div class="border border-gray-200 p-4 rounded flex flex-wrap gap-3">
          <span
            v-for="(item, index) in data.detail"
            :key="index"
            class="border border-black px-4 py-2 rounded hover:bg-gray-100 transition"
          >
            {{ (index + 1) + '# ' + item.name }}
          </span>
        </div>
      </div>
      <!-- Tanda Tangan -->
      <div class="flex justify-around text-center mt-12 text-xs">
        <div class="flex flex-col items-center">
          <p class="mb-2">Penerima</p>
          <div class="border-t border-gray-400 mt-12 w-48 mx-auto"></div>
          <p class="mt-2">( {{ data.penerima }} )</p>
        </div>
        <div class="flex flex-col items-center">
          <p class="mb-2">Petugas</p>
          <div class="border-t border-gray-400 mt-12 w-48 mx-auto"></div>
          <p class="mt-2">( {{ data.petugas }} )</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@media print {
  @page {
    size: A4;
    margin: 10mm;
    -webkit-print-color-adjust: exact;
  }
}
</style>

