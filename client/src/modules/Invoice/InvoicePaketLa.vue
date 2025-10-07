<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getInvoicePaketLA } from '@/service/invoice.ts';
import { useRoute } from 'vue-router';
import Header from '@/modules/Invoice/Particle/Header.vue';

const route = useRoute();
const invoiceId = route.params.id;
const invoiceData = ref<any>({});

const fetchData = async () => {
  try {
    const response = await getInvoicePaketLA(invoiceId.toString());
    invoiceData.value = response.data;
    console.log(invoiceData.value);
  } catch (error) {
    console.error('Error fetching invoice data:', error);
  }
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat('id-ID').format(value);
}

onMounted(() => {
  try {
    fetchData();

    // Tunggu sebentar agar DOM selesai dirender
    setTimeout(() => {
      window.scrollTo(0, 0);
      window.print();
      setTimeout(() => {
        window.close();
      }, 1000);
    }, 1500); // kasih delay dikit kalau perlu render dulu
  } catch (err) {
    console.error('Error:', err);
  }
});
</script>

<template>
  <div
    class="bg-white text-gray-800 max-w-[210mm] mx-auto min-h-[297mm] p-[20mm] font-serif text-xs print:shadow-none print:bg-white print:text-black print:max-w-full"
  >
    <div v-if="invoiceData && Object.keys(invoiceData).length > 0">
      <!-- Header -->
      <Header :data="invoiceData"></Header>

      <!-- Title -->
      <h3 class="text-center text-lg font-bold mb-6 border-b pb-2">
        INVOICE ITEM FASILITAS PAKET LA
      </h3>

      <!-- Info Client & Invoice -->
      <div class="grid grid-cols-2 gap-6 mb-8">
        <div class="space-y-1">
          <p><span class="font-medium">Nama Client:</span> {{ invoiceData?.client_name }}</p>
          <p><span class="font-medium">No HP:</span> {{ invoiceData?.client_hp_number }}</p>
          <p><span class="font-medium">Alamat:</span> {{ invoiceData?.client_address }}</p>
        </div>
        <div class="text-right space-y-1">
          <p><span class="font-medium">No Invoice:</span> #{{ invoiceData?.invoice }}</p>
          <p><span class="font-medium">Tanggal Transaksi:</span> {{ invoiceData?.order_date }}</p>
        </div>
      </div>

      <!-- Tabel Detail -->
      <div class="overflow-x-auto print:overflow-visible">
        <p class="font-semibold mb-2">Detail Item Paket LA:</p>
        <table class="w-full table-fixed text-xs border border-collapse mb-8">
          <thead class="bg-gray-100 text-center">
            <tr>
              <th class="border px-2 py-1 w-[15%]">Description</th>
              <th class="border px-2 py-1 w-[15%]">Check In</th>
              <th class="border px-2 py-1 w-[15%]">Check Out</th>
              <th class="border px-2 py-1 w-[10%]">Day</th>
              <th class="border px-2 py-1 w-[10%]">Qty</th>
              <th class="border px-2 py-1 w-[17.5%]">Price</th>
              <th class="border px-2 py-1 w-[17.5%]">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(item, index) in invoiceData?.detail_fasilitas"
              :key="index"
              class="text-center"
            >
              <td class="border px-2 py-1">{{ item.description }}</td>
              <td class="border px-2 py-1">{{ item.check_in }}</td>
              <td class="border px-2 py-1">{{ item.check_out }}</td>
              <td class="border px-2 py-1">{{ item.day }}</td>
              <td class="border px-2 py-1">{{ item.pax }}</td>
              <td class="border px-2 py-1">Rp {{ formatCurrency(item.price) }}</td>
              <td class="border px-2 py-1">Rp {{ formatCurrency(item.amount || 0) }}</td>
            </tr>
          </tbody>
          <tfoot>
            <tr class="font-semibold">
              <td colspan="6" class="text-right border border-gray-300 px-2 py-2">Total Harga:</td>
              <td class="text-center border border-gray-300 px-2 py-2">
                Rp {{ formatCurrency(invoiceData?.total || 0) }}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      <!-- Ketentuan -->
      <div class="text-xs mb-8">
        <p class="font-semibold mb-2">Ketentuan dan Syarat:</p>
        <ul class="list-decimal pl-5 space-y-1">
          <li>Prioritas penerbitan visa sudah menyetor pembayaran/memiliki deposit</li>
          <li>Proses visa dilakukan minimal H+1 setelah pelunasan</li>
          <li>Ketentuan visa error mengacu pada sistem dari muassasah</li>
          <li>Jadwal Raudhah tergantung kepada sistem dan ketentuan dari muassasah</li>
          <li>Perubahan jadwal bus tergantung kepada company terkait</li>
          <li>
            Jama'ah batal berangkat dikarenakan visa tidak keluar bukan menjadi tanggung jawab PT.
            Zam Zam Wisata Islami:
            <ul class="list-disc pl-5 mt-1 space-y-1">
              <li>Jadwal keberangkatan mendadak (H-3)</li>
              <li>Perubahan jadwal keberangkatan dari maskapai</li>
              <li>Pembatasan kuota jama'ah umroh</li>
            </ul>
          </li>
        </ul>
      </div>

      <!-- TTD -->
      <div class="text-right mt-6 leading-tight">
        <p>{{ invoiceData.client_address }}, {{ invoiceData?.order_date }}</p>
        <p class="font-semibold mt-10">SIGNATURE</p>
      </div>
    </div>
    <div v-else class="flex items-center justify-center min-h-screen">
      <div
        class="text-center bg-red-50 border border-red-200 text-red-600 p-6 rounded-xl shadow-sm"
      >
        <h2 class="text-xl font-semibold mb-2">Invoice Paket La Tidak Ditemukan</h2>
        <p class="text-sm">Silakan periksa kembali invoice paket la atau hubungi administrator.</p>
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
