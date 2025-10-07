<script setup lang="ts">
import Header from '@/modules/Invoice/Particle/Header.vue';
import { ref, onMounted, nextTick } from 'vue';
import { get_header, get_kas_keluar_masuk_data } from '@/service/invoice';
import { useRoute } from 'vue-router';

const data = ref<any>(null);
const header = ref<any>(null);
const route = useRoute();
const invoice = route.params.invoice;
const total = ref(0);

const formatDate = (dateStr: string) => {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return d.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
};

const formatRupiah = (angka: any, prefix = 'Rp ') => {
  let numberString = angka.toString().replace(/\D/g, ''),
    split = numberString.split(','),
    sisa = split[0].length % 3,
    rupiah = split[0].substr(0, sisa),
    ribuan = split[0].substr(sisa).match(/\d{3}/g);

  if (ribuan) {
    let separator = sisa ? '.' : '';
    rupiah += separator + ribuan.join('.');
  }

  return prefix + (rupiah || '0');
};

onMounted(async () => {
  try {
    // get header
    const responseHeader = await get_header();
    header.value = responseHeader.data;

    const response = await get_kas_keluar_masuk_data(invoice);
    data.value = response.data;

    console.log('******************');
    console.log(data.value);
    console.log('******************');

    total.value = data.value.details.reduce((sum, item) => {
      const cleaned = item.saldo.replace(/[Rp\s.]/g, '').trim(); // Hapus "Rp", spasi, dan titik
      const value = parseInt(cleaned, 10); // Konversi ke angka
      return sum + (isNaN(value) ? 0 : value);
    }, 0);

    await nextTick();

    window.print();
  } catch (error) {
    console.error('❌ Gagal mengambil data invoice:', error);
  }
});
</script>

<template>
  <div
    class="bg-white max-w-[210mm] mx-auto p-[15mm] font-serif print:p-[10mm] print:m-0 print:shadow-none"
    style="color: black; font-size: 10pt; text-align: justify; line-height: 1.3"
  >
    <Header v-if="header" :data="header" />
    <div v-if="data" class="mt-6">
      <div class="flex justify-between items-center text-sm font-semibold pb-1 mb-4">
        <div>KWITANSI KAS KELUAR MASUK</div>
        <div>INVOICE : {{ data.invoice || '-' }}</div>
      </div>
      <div class="flex justify-between text-xs mb-4">
        <div>
          <div class="font-semibold">PETUGAS</div>
          <div>{{ data.petugas || '-' }}</div>
          <div class="font-semibold mt-6">TANGGAL TRANSAKSI</div>
          <div>{{ data.tanggal_transaksi || '-' }}</div>
        </div>
        <div class="text-right">
          <div class="font-semibold">DIBAYARKAN KEPADA / DITERIMA DARI</div>
          <div>{{ data.dibayar_diterima || '-' }}<br /></div>

          <div class="font-semibold mt-6">STATUS KWITANSI</div>
          <div>{{ data.status_kwitansi || '-' }}<br /></div>
        </div>
      </div>

      <!-- Judul -->
      <h2 class="font-semibold text-xs mb-2 mt-10">DETAIL AKUN TERLIBAT :</h2>
      <table class="w-full border-collapse text-xs mb-8">
        <thead>
          <tr class="bg-gray-100 border">
            <th class="border px-4 py-2 text-center font-medium w-[20%]">REF</th>
            <th class="border px-4 py-2 text-center font-medium w-[25%]">KETERANGAN</th>
            <th class="border px-4 py-2 text-center font-medium w-[20%]">AKUN DEBET</th>
            <th class="border px-4 py-2 text-center font-medium w-[20%]">AKUN KREDIT</th>
            <th class="border px-4 py-2 text-center font-medium w-[15%]">SALDO</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="dt in data.details" :key="dt.id" class="border-b">
            <td class="px-4 py-4 align-top whitespace-nowrap text-center">{{ dt.ref }}</td>
            <td class="px-4 py-4 align-top whitespace-nowrap text-center">{{ dt.ket }}</td>
            <td class="px-0 py-4 align-top text-center" v-html="dt.akun_debet"></td>
            <td class="px-0 py-4 align-top text-center" v-html="dt.akun_kredit"></td>
            <td class="px-0 py-4 align-top text-center">{{ dt.saldo }}</td>
          </tr>
        </tbody>
        <tfoot>
          <tr class="bg-gray-100 border-b">
            <td colspan="4" class="px-4 py-4 align-top text-end font-bold border">TOTAL</td>
            <td class="px-0 py-4 align-top text-center font-bold border">
              {{ formatRupiah(total) }}
            </td>
          </tr>
        </tfoot>
      </table>

      <div class="flex justify-between text-xs mt-16">
        <div class="text-center">
          <div>Petugas</div>
          <br /><br />
          <div>({{ data.petugas || '-' }})</div>
        </div>
        <div class="text-center">
          <div>Penerima</div>
          <br /><br />
          <div>({{ data.dibayar_diterima || '-' }})</div>
        </div>
      </div>
    </div>
  </div>
</template>
