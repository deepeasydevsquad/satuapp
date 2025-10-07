<template>
  <div class="bg-white p-0 text-sm text-gray-800 min-h-screen">
    <!-- Wrapper PDF -->
    <div id="invoice" v-if="company && Object.keys(company.data).length > 0">
      <!-- Header -->
      <Header :data="company.data"></Header>
      <!-- <div class="flex justify-between items-start border-b pb-4 mb-4">
        <div class="w-1/3">
          <img
            :src="company?.data.logo ? `${BASE_URL}/uploads/pengaturan/${company.data.logo}` : 'default.png'"
            alt="Logo"
            class="h-14"
          />
        </div>
        <div class="text-right w-2/3">
          <h2 class="text-xl font-extrabold uppercase" style="font-size: 28px;">{{ company?.data.company_name || '-' }}</h2>
          <p class="text-sm font-normal tracking-wide leading-snug">
            {{ company?.data.address || '-' }}, {{ company?.data.city || '-'
            }}<br />
            Kode Pos: {{ company?.data.pos_code || '-' }}, Email:
            {{ company?.data.email || '-' }} Telp: {{ company?.data.whatsapp_company_number || '-' }}
          </p>
        </div>
      </div> -->

      <h2 class="text-lg font-bold mb-4 text-left">Kwitansi Pembayaran Deposit Saldo</h2>

      <!-- Info Transaksi -->
      <div class="grid grid-cols-3 gap-4 mb-6">
        <div class="border rounded-md p-3 min-h-[80px]">
          <p class="text-xs font-semibold text-gray-600">Kode Transaksi</p>
          <p class="text-base font-medium">{{ company?.data.invoice || '-' }}</p>
        </div>
        <div class="border rounded-md p-3 min-h-[80px]">
          <p class="text-xs font-semibold text-gray-600">Status</p>
          <p class="text-base font-medium">Sukses</p>
        </div>
        <div class="border rounded-md p-3 min-h-[80px]">
          <p class="text-xs font-semibold text-gray-600">Info Member</p>
          <p class="text-base font-medium">
            {{ company?.data.fullname || '-' }}
          </p>
        </div>
      </div>

      <!-- Tabel Transaksi -->
      <table class="w-full text-left border border-collapse mb-4">
        <thead class="bg-gray-100">
          <tr>
            <th class="w-[20%] border p-2">Waktu Transaksi</th>
            <th class="w-[15%] border p-2">Keperluan</th>
            <th class="w-[20%] border p-2">Penerima</th>
            <th class="w-[25%] border p-2">Info</th>
            <th class="w-[20%] border p-2">Jumlah</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="border p-2">{{ formatDate(company?.data.createdAt) }}</td>
            <td class="border p-2 capitalize">{{ company?.data.tipe_transaksi }}</td>
            <td class="border p-2">{{ company?.data.penerima }}</td>
            <td class="border p-2">{{ company?.data.info }}</td>
            <td class="border p-2">Rp {{ formatRupiah(company?.data.nominal) }}</td>
          </tr>
        </tbody>
        <tfoot>
          <tr>
            <td class="border p-2 text-right" colspan="4">Total Penambahan Deposit</td>
            <td class="border p-2">Rp {{ formatRupiah(company?.data.nominal) }}</td>
          </tr>
          <tr>
            <td class="border p-2 text-right" colspan="4">Total Deposit Sekarang</td>
            <td class="border p-2">Rp {{ formatRupiah(company?.data.saldo_sesudah) }}</td>
          </tr>
        </tfoot>
      </table>
      <!-- Tanda Tangan -->
      <div class="flex justify-between mt-8">
        <div>
          <p class="mb-12">Member/Jamaah</p>
          <p class="border-t border-gray-400 w-40"></p>
        </div>
        <div>
          <p class="mb-12">Penerima</p>
          <p class="border-t border-gray-400 w-40"></p>
        </div>
      </div>
    </div>
    <div v-else class="flex items-center justify-center min-h-screen">
      <div
        class="text-center bg-red-50 border border-red-200 text-red-600 p-6 rounded-xl shadow-sm"
      >
        <h2 class="text-xl font-semibold mb-2">Invoice Deposit Tidak Ditemukan</h2>
        <p class="text-sm">Silakan periksa kembali kode invoice atau hubungi administrator.</p>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { dataInvoiceDeposit } from '@/service/invoice.ts';
import { useRoute } from 'vue-router';
import Header from '@/modules/Invoice/Particle/Header.vue';

const route = useRoute();
const invoiceId = route.params.id;
const company = ref<any>(null);

const fetch = async () => {
  try {
    company.value = await dataInvoiceDeposit(invoiceId.toString());
  } catch (error) {
    console.log('gagal fetch data', error);
  }
};

const formatRupiah = (val: number) => (val ? val.toLocaleString('id-ID') : '0');
const formatDate = (val: string) => (val ? val.replace('T', ' ').slice(0, 19) : '-');

onMounted(() => {
  console.log('xxx');
  fetch();
  setTimeout(() => {
    window.scrollTo(0, 0);
    window.onafterprint = function () {
      window.close();
    };
    window.print();
  }, 500);
});
</script>

<style scoped>
@media print {
  @page {
    size: A4;
    margin: 0;
  }

  html,
  body {
    margin: 0 !important;
    padding: 0 !important;
    font-size: 12px;
    overflow: hidden;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
    background: white !important;
  }

  #invoice {
    margin: 0 !important;
    padding: 2.5rem !important;
    width: 100%;
    height: 100%;
    box-sizing: border-box;
    page-break-after: avoid;
    page-break-inside: avoid;
    break-inside: avoid;
    padding: 20mm;
    background: white !important;
  }

  .no-print {
    display: none !important;
  }
}
</style>
