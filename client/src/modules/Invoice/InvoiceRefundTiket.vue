<script setup lang="ts">
import Header from '@/modules/Invoice/Particle/Header.vue';
import { ref, onMounted, nextTick } from 'vue';
import { kwitansi_refund_tiket } from '@/service/invoice';
import { useRoute } from 'vue-router';

const data = ref<any>(null);
const route = useRoute();
const invoice = typeof route.params.invoice === 'string' ? route.params.invoice : '';
console.log('🚀 Invoice:', invoice);

const formatDate = (dateStr: string) => {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return d.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
};

onMounted(async () => {
  try {
    const response = await kwitansi_refund_tiket(invoice);

    const isWrapped = 'data' in response && 'error' in response;
    data.value = isWrapped ? response.data : response;

    await nextTick();

    if (data.value?.invoice) {
      setTimeout(() => {
        window.print();
      }, 300);
    } else {
      console.warn('❗ Data kosong atau tidak valid:', data.value);
    }
  } catch (error) {
    console.error('❌ Gagal mengambil data invoice:', error);
  }
});
</script>

<template>
  <div
    class="bg-white max-w-[210mm] min-h-[297mm] mx-auto p-[15mm] font-serif print:p-[10mm] print:m-0 print:shadow-none"
    style="color: black; font-size: 10pt; text-align: justify; line-height: 1.3"
  >
    <Header v-if="data" :data="data.header" />

    <!-- Judul -->
    <h2 class="text-center font-bold text-lg mt-6 mb-4 underline">KWITANSI REFUND</h2>

    <div class="grid grid-cols-2 gap-6 mb-6">
      <!-- Kolom kiri -->
      <dl class="grid grid-cols-[140px_1fr] gap-x-3 gap-y-1 items-baseline">
        <dt class="font-semibold after:content-[':']">Invoice</dt>
        <dd class="text-right tabular-nums">{{ data?.transaksi?.invoice }}</dd>

        <dt class="font-semibold after:content-[':']">Nomor Registrasi</dt>
        <dd class="text-right">{{ data?.transaksi?.nomor_registrasi }}</dd>

        <dt class="font-semibold after:content-[':']">Customer</dt>
        <dd class="text-right">{{ data?.transaksi?.customer }}</dd>

        <dt class="font-semibold after:content-[':']">Paket</dt>
        <dd class="text-right">{{ data?.transaksi?.paket }}</dd>
      </dl>

      <!-- Kolom kanan -->
      <dl class="grid grid-cols-[140px_1fr] gap-x-3 gap-y-1 items-baseline">
        <dt class="font-semibold after:content-[':']">Tanggal</dt>
        <dd class="text-right">{{ formatDate(data?.transaksi?.tanggal) }}</dd>

        <dt class="font-semibold after:content-[':']">Maskapai</dt>
        <dd class="text-right">{{ data?.transaksi?.airline }}</dd>

        <dt class="font-semibold after:content-[':']">Jadwal</dt>
        <dd class="text-right">
          {{ formatDate(data?.transaksi?.departure_date) }} -
          {{ formatDate(data?.transaksi?.arrival_date) }}
        </dd>
      </dl>
    </div>

    <!-- Tabel Refund -->
    <div class="border-t pt-3">
      <h3 class="font-semibold mb-2">Detail Refund</h3>
      <table class="w-full border-collapse">
        <thead>
          <tr class="bg-gray-100">
            <th class="border px-2 py-1 text-left">Deskripsi</th>
            <th class="border px-2 py-1 text-right">Nominal</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="border px-2 py-1">Refund Pembayaran</td>
            <td class="border px-2 py-1 text-right">
              Rp {{ new Intl.NumberFormat('id-ID').format(data?.transaksi?.nominal_refund) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Footer TTD -->
    <div class="flex justify-between mt-12">
      <div></div>
      <div class="text-center">
        <p class="mb-16">Hormat Kami,</p>
        <p class="font-semibold">{{ data?.transaksi?.petugas }}</p>
      </div>
    </div>
  </div>
</template>
