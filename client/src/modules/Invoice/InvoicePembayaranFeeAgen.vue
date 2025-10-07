<script setup lang="ts">
import Header from '@/modules/Invoice/Particle/Header.vue';
import { ref, onMounted, nextTick } from 'vue';
import { kwitansi_pembayaran_fee_agen } from '@/service/invoice';
import { useRoute } from 'vue-router';

const data = ref<any>(null);
const isLoading = ref(false);

const route = useRoute();
const invoice = route.params.invoice;

onMounted(async () => {
  try {
    const response = await kwitansi_pembayaran_fee_agen(invoice);
    const isWrapped = 'data' in response && 'error' in response;
    const result = isWrapped ? response.data : response;
    data.value = result;

    await nextTick();
    window.print();
  } catch (error) {
    console.error('Gagal mengambil data invoice:', error);
  }
});
</script>

<template>
  <div
    class="bg-white text-gray-800 max-w-[216mm] mx-auto min-h-[356mm] p-8 font-serif text-sm print:text-xs print:shadow-none space-y-[10px] print:bg-white print:text-black print:max-w-full"
  >
    <Header v-if="data" :data="data.data_header" />

    <div v-if="data?.pembayaran" class="mb-8 mt-6">
      <h3 class="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">Detail Pembayaran</h3>
      <div class="grid grid-cols-2 gap-4 text-sm">
        <div class="bg-gray-50 p-4 rounded-md border border-gray-200">
          <p class="mb-2">
            <span class="font-medium">Invoice:</span><br />
            {{ data.pembayaran.invoice }}
          </p>
          <p class="mb-2">
            <span class="font-medium">Petugas:</span><br />
            {{ data.pembayaran.penerima }}
          </p>
          <p>
            <span class="font-medium">Total Pembayaran:</span><br />
            <span class="font-bold"
              >Rp {{ Number(data.pembayaran.nominal_pembayaran).toLocaleString() }}</span
            >
          </p>
        </div>

        <!-- KANAN -->
        <div class="bg-gray-50 p-4 rounded-md border border-gray-200">
          <p class="mb-2">
            <span class="font-medium">Tanggal Pembayaran:</span><br />
            {{ new Date(data.pembayaran.tanggal_pembayaran).toLocaleDateString() }}
          </p>
          <p class="mb-2">
            <span class="font-medium">Nama Pemohon:</span><br />
            {{ data.pembayaran.nama_pemohon }}
          </p>
          <p>
            <span class="font-medium">Identitas Pemohon:</span><br />
            {{ data.pembayaran.identitas_pemohon }}
          </p>
        </div>
      </div>
    </div>

    <div v-if="data?.data_invoice">
      <h3 class="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">Rincian Fee Agen</h3>
      <div class="overflow-x-auto">
        <table class="w-full text-sm text-left border border-gray-300 rounded-lg overflow-hidden">
          <thead class="bg-gray-100 text-gray-700">
            <tr>
              <th class="px-4 py-2 border-b border-gray-300">No</th>
              <th class="px-4 py-2 border-b border-gray-300">Nama Agen</th>
              <th class="px-4 py-2 border-b border-gray-300">Identitas</th>
              <th class="px-4 py-2 border-b border-gray-300">Keterangan</th>
              <th class="px-4 py-2 border-b border-gray-300 text-right">Nominal Fee</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(item, i) in data.data_invoice"
              :key="i"
              class="hover:bg-gray-50 transition-colors"
            >
              <td class="px-4 py-2 border-b border-gray-200">{{ i + 1 }}</td>
              <td class="px-4 py-2 border-b border-gray-200">{{ item.agen_name }}</td>
              <td class="px-4 py-2 border-b border-gray-200">{{ item.agen_identity }}</td>
              <td class="px-4 py-2 border-b border-gray-200">{{ item.info }}</td>
              <td class="px-4 py-2 border-b border-gray-200 text-right">
                Rp {{ Number(item.nominal_fee).toLocaleString() }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<style>
@media screen {
  body {
    background-color: #f3f4f6;
  }

  .print-area {
    width: 210mm;
    height: 330mm;
    box-shadow: 0 0 15px rgba(0, 0, 0, 0.2);
    margin: auto;
    overflow: hidden;
  }
}

@media print {
  @page {
    size: 210mm 330mm; /* Ukuran F4 */
    margin: 20mm;
  }

  html,
  body {
    margin: 0;
    padding: 0;
    background: white;
  }

  .print-area {
    width: 210mm;
    height: 330mm;
    box-shadow: none;
    margin: 0;
    padding: 0;
  }
}
</style>
