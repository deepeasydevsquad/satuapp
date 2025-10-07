<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue';
import { useRoute } from 'vue-router';
import { kwitatsi_trans_tiket } from '@/service/invoice.ts';
import Header from '@/modules/Invoice/Particle/Header.vue';

const route = useRoute();
const invoice = route.params.regnum;
const data = ref<any>(null);
const isLoading = ref(false);

const fetchData = async () => {
  try {
    isLoading.value = true;
    console.log('Fetching data for invoice:', invoice);
    const response = await kwitatsi_trans_tiket(invoice.toString());
    data.value = response.data.data;
  } catch (error) {
    console.error('Gagal ambil data kwitansi:', error);
  } finally {
    isLoading.value = false;
  }
};

onMounted(async () => {
  await fetchData();
  await nextTick();
  if (!data.value) {
    window.close();
  } else {
    setTimeout(() => {
      window.scrollTo(0, 0);
      window.print();
      setTimeout(() => {
        window.close();
      }, 1000);
    }, 1500);
  }
});
</script>

<template>
  <div
    class="bg-white max-w-[210mm] min-h-[297mm] mx-auto p-[15mm] font-sans print:p-[10mm] print:m-0 print:shadow-none text-[10pt] leading-relaxed"
    style="color: black"
  >
    <Header v-if="data" :data="data.header" />
    <!-- TITLE -->
    <h2 class="text-center font-bold text-lg mb-6">INVOICE TIKET PESAWAT</h2>

    <!-- DATA PEMESAN + DETAIL PEMBAYARAN -->
    <div class="grid grid-cols-2 gap-8 mb-8">
      <!-- DATA PEMESAN -->
      <div>
        <h3 class="font-semibold mb-3 border-b pb-1">DATA PEMESAN</h3>
        <div class="space-y-1">
          <div class="flex">
            <span class="w-40 font-medium">Nomor Registrasi</span>
            <span class="mr-1">:</span>
            <span class="flex-1">{{ data?.nomor_registrasi || '-' }}</span>
          </div>
          <div class="flex">
            <span class="w-40 font-medium">Customer</span>
            <span class="mr-1">:</span>
            <span class="flex-1">{{ data?.customer || '-' }}</span>
          </div>
        </div>
      </div>

      <!-- DETAIL PEMBAYARAN -->
      <div>
        <h3 class="font-semibold mb-3 border-b pb-1">DETAIL TIKET</h3>
        <div class="space-y-1">
          <div class="flex">
            <span class="w-40 font-medium">Kode Booking</span>
            <span class="mr-1">:</span>
            <span class="flex-1">{{ data?.code_booking || '-' }}</span>
          </div>
          <div class="flex">
            <span class="w-40 font-medium">Paket</span>
            <span class="mr-1">:</span>
            <span class="flex-1">{{ data?.paket || '-' }}</span>
          </div>
          <div class="flex">
            <span class="w-40 font-medium">Status</span>
            <span class="mr-1">:</span>
            <span class="flex-1 uppercase">{{ data?.status || '-' }}</span>
          </div>
          <div class="flex">
            <span class="w-40 font-medium">Pax</span>
            <span class="mr-1">:</span>
            <span class="flex-1">{{ data?.pax || '-' }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- DETAIL PEMBELIAN -->
    <div class="mb-10">
      <h3 class="font-semibold mb-3">DETAIL PEMBELIAN</h3>
      <table class="w-full border border-collapse text-sm">
        <thead>
          <tr class="bg-gray-100">
            <th class="border px-2 py-1 text-center w-8">No</th>
            <th class="border px-2 py-1 text-center">Jenis Barang</th>
            <th class="border px-2 py-1 text-center">Deskripsi</th>
            <th class="border px-2 py-1 text-center w-12">Jumlah</th>
            <th class="border px-2 py-1 text-center">Harga Per Tiket</th>
            <th class="border px-2 py-1 text-center">Total</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="border px-2 py-1 text-center">1</td>
            <td class="border px-2 py-1">Tiket Pesawat</td>
            <td class="border px-2 py-1">
              {{ data?.airlines_name || '-' }} | {{ data?.departure_date || '-' }} -
              {{ data?.arrival_date || '-' }}
            </td>
            <td class="border px-2 py-1 text-center">{{ data?.pax || 0 }}</td>
            <td class="border px-2 py-1 text-right">
              Rp {{ data?.costumer_price ? data.costumer_price.toLocaleString() : '0' }}
            </td>
            <td class="border px-2 py-1 text-right">
              Rp {{ data?.total_harga ? data.total_harga.toLocaleString() : '0' }}
            </td>
          </tr>
        </tbody>
        <tfoot>
          <tr class="font-semibold bg-gray-50">
            <td colspan="5" class="border px-2 py-1 text-right">TOTAL</td>
            <td class="border px-2 py-1 text-right">
              Rp {{ data?.total_harga ? data.total_harga.toLocaleString() : '0' }}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>

    <!-- FOOTER -->
    <div class="mt-16 text-right">
      <p>Langsa, {{ data?.createdAt ? new Date(data.createdAt).toLocaleDateString() : '-' }}</p>
    </div>
  </div>
</template>
