<script setup lang="ts">
import Header from '@/modules/RekapitulasiTicket/Particle/Header.vue';
import { ref, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { cetakDataRekapTicket } from '@/service/rekapitulasi_ticket';

const isLoading = ref(true);
const data = ref<any>(null);
const route = useRoute();

const fetchData = async () => {
  isLoading.value = true;
  try {
    const regnumb = String(route.params.regnumb);

    const response = await cetakDataRekapTicket(regnumb);
    if (response.error) {
      throw new Error(response.error_msg);
    }
    data.value = response.data;
  } catch (error: any) {
    console.error('Error fetching rekapitulasi:', error);
    closeWindow();
  } finally {
    isLoading.value = false;
  }
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(value);
};

const closeWindow = () => {
  setTimeout(() => {
    window.close();
  }, 500);
};

watch(data, (newData) => {
  if (newData) {
    setTimeout(() => {
      window.print();
      setTimeout(() => {
        if (window.opener) {
          window.opener.postMessage(
            { event: 'success', message: 'Data rekap berhasil dicetak' },
            '*',
          );
        }
        window.close();
      }, 500);
    }, 500);
  }
});

onMounted(async () => {
  await fetchData();
  if (!data.value || data.value.length === 0) {
    if (window.opener) {
      window.opener.postMessage({ event: 'error', message: 'Data rekap tidak ditemukan' }, '*');
      closeWindow;
    } else {
      closeWindow;
    }
  }
});
</script>

<template>
  <div v-if="isLoading" class="flex justify-center items-center h-screen">
    <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
  </div>
  <div
    v-else-if="data"
    class="bg-white text-gray-800 max-w-[210mm] mx-auto min-h-[297mm] p-14 font-serif text-base print:shadow-none print:p-16 print:bg-white print:text-black print:max-w-full"
  >
    <Header :data="data" />

    <div class="mt-4 mb-6">
      <div class="grid grid-cols-2 gap-x-4">
        <div>
          <p class="font-semibold text-gray-700">Kepada Yth:</p>
          <p class="text-lg font-bold">{{ data.costumer_name }}</p>
          <p class="text-gray-600">{{ data.costumer_whatsapp_number }}</p>
        </div>
        <div class="text-right">
          <p class="font-semibold text-gray-700">Petugas:</p>
          <p class="text-lg font-bold">{{ data.petugas }}</p>
        </div>
      </div>
    </div>

    <table
      class="w-full border-collapse rounded-lg overflow-hidden shadow print:shadow-none border border-gray-400 print:border-gray-300"
    >
      <thead>
        <tr class="bg-gray-200 print:bg-gray-100">
          <th class="border border-gray-300 p-3 text-left font-bold text-base print:text-sm">No</th>
          <th class="border border-gray-300 p-3 text-left font-bold text-base print:text-sm">
            Code Booking
          </th>
          <th class="border border-gray-300 p-3 text-left font-bold text-base print:text-sm">
            Pax
          </th>
          <th class="border border-gray-300 p-3 text-left font-bold text-base print:text-sm">
            Maskapai
          </th>
          <th class="border border-gray-300 p-3 text-left font-bold text-base print:text-sm">
            Tgl. Keberangkatan
          </th>
          <th class="border border-gray-300 p-3 text-left font-bold text-base print:text-sm">
            Tgl. Transaksi
          </th>
          <th class="border border-gray-300 p-3 text-right font-bold text-base print:text-sm">
            TOTAL HARGA
          </th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(ticket, index) in data.tickets"
          :key="ticket.id"
          :class="index % 2 === 0 ? 'bg-white print:bg-white' : 'bg-gray-50 print:bg-gray-100'"
        >
          <td class="border border-gray-300 p-3 print:p-2">{{ index + 1 }}</td>
          <td class="border border-gray-300 p-3 print:p-2">{{ ticket.code_booking }}</td>
          <td class="border border-gray-300 p-3 print:p-2">{{ ticket.pax }}</td>
          <td class="border border-gray-300 p-3 print:p-2">{{ ticket.airline }}</td>
          <td class="border border-gray-300 p-3 print:p-2">{{ ticket.departure_date }}</td>
          <td class="border border-gray-300 p-3 print:p-2">{{ ticket.tanggal_transaksi }}</td>
          <td class="border border-gray-300 p-3 text-right print:p-2">
            {{ formatCurrency(ticket.harga * ticket.pax) }}
          </td>
        </tr>
      </tbody>
      <tfoot>
        <tr class="bg-gray-100 print:bg-gray-200 font-bold">
          <td colspan="6" class="border border-gray-300 p-3 text-right print:p-2">
            Total Rekapitulasi
          </td>
          <td class="border border-gray-300 p-3 text-right print:p-2">
            {{ formatCurrency(data.total_rekapitulasi) }}
          </td>
        </tr>
      </tfoot>
    </table>

    <div class="mt-20 grid grid-cols-3 gap-4 text-center">
      <div>
        <p class="font-semibold mb-20">Diserahkan Oleh,</p>
        <div class="border-t border-gray-400 w-48 mx-auto mb-2"></div>
        <p class="font-bold">{{ data.petugas }}</p>
      </div>
      <div class="col-span-1"></div>
      <div>
        <p class="font-semibold mb-20">Diterima Oleh,</p>
        <div class="border-t border-gray-400 w-48 mx-auto mb-2"></div>
        <p class="font-bold">{{ data.costumer_name.toUpperCase() }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
@media print {
  @page {
    size: A4;
    margin: 0;
  }
  body {
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .print\:p-4 {
    padding: 1rem;
  }
  .print\:shadow-none {
    box-shadow: none;
  }
  .print\:bg-white {
    background-color: #fff;
  }
  .print\:text-black {
    color: #000;
  }
  .print\:max-w-full {
    max-width: 100%;
  }
  th,
  td {
    font-size: 12px !important;
    padding: 6px !important;
  }
}

.border-t {
  border-top-width: 2px;
}
</style>
