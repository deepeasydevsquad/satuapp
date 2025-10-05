<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { cetakKwitansiVisa } from '@/service/invoice';
import Header from '@/components/User/Modules/Invoice/Particle/Header.vue';

const isLoading = ref(true);
const data = ref<any>(null);
const route = useRoute();

const errorMessage = ref<string | null>(null);

onMounted(async () => {
  try {
    const invoice = route.params.invoice as string;

    if (!invoice || invoice === 'undefined') {
      errorMessage.value = 'Parameter invoice tidak valid atau hilang dari URL.';
      isLoading.value = false;
      return;
    }

    const responseData = await cetakKwitansiVisa(invoice);

    if (responseData.error) {
      errorMessage.value = `Gagal memuat data dari server: ${responseData.error_msg}`;
      isLoading.value = false;
      return;
    }

    data.value = responseData.data;

  } catch (error: any) {
    console.error('[VUE ERROR] Error fetching visa transaction:', error);
    errorMessage.value = `Terjadi kesalahan fatal: ${error.message}`;
  } finally {
    isLoading.value = false;
    if (data.value) {
      setTimeout(() => {
        window.print();
      }, 1000);
    }
  }
});

const formatCurrency = (amount: number) => {
  if (typeof amount !== 'number' || isNaN(amount)) return '0';
  return new Intl.NumberFormat('id-ID').format(amount);
};

const terbilangUang = (amount: number, withSen: boolean = false): string => {
  if (typeof amount !== "number" || isNaN(amount)) return "nol rupiah";

  const satuan = [
    "", "satu", "dua", "tiga", "empat", "lima", "enam", "tujuh", "delapan", "sembilan", "sepuluh", "sebelas",
  ];

  const toWords = (n: number): string => {
    if (n < 12) return satuan[n];
    if (n < 20) return `${toWords(n - 10)} belas`;
    if (n < 100) return `${toWords(Math.floor(n / 10))} puluh${n % 10 ? " " + toWords(n % 10) : ""}`;
    if (n < 200) return `seratus${n > 100 ? " " + toWords(n - 100) : ""}`;
    if (n < 1000) return `${toWords(Math.floor(n / 100))} ratus${n % 100 ? " " + toWords(n % 100) : ""}`;
    if (n < 2000) return `seribu${n > 1000 ? " " + toWords(n - 1000) : ""}`;
    if (n < 1_000_000) return `${toWords(Math.floor(n / 1000))} ribu${n % 1000 ? " " + toWords(n % 1000) : ""}`;
    if (n < 1_000_000_000) return `${toWords(Math.floor(n / 1_000_000))} juta${n % 1_000_000 ? " " + toWords(n % 1_000_000) : ""}`;
    if (n < 1_000_000_000_000) return `${toWords(Math.floor(n / 1_000_000_000))} miliar${n % 1_000_000_000 ? " " + toWords(n % 1_000_000_000) : ""}`;
    if (n < 1_000_000_000_000_000) return `${toWords(Math.floor(n / 1_000_000_000_000))} triliun${n % 1_000_000_000_000 ? " " + toWords(n % 1_000_000_000_000) : ""}`;
    return "terlalu besar";
  };

  const angka = Math.floor(amount);
  const pecahan = Math.round((amount - angka) * 100);

  let result = "";

  if (withSen && pecahan > 0) {
    result += ` ${toWords(pecahan)} sen`;
  }

  const hasil = toWords(angka).trim().replace(/\s+/g, ' ')
  return (hasil.charAt(0).toUpperCase() + hasil.slice(1) + ' Rupiah').replace(/\s+/g, ' ')
};

const formatDate = (dateString: string) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });
};
</script>

<template>
  <div v-if="isLoading" class="flex justify-center items-center h-screen no-print">
    <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
    <span class="ml-2">Memuat data kwitansi...</span>
  </div>

  <div v-else-if="errorMessage" class="flex flex-col justify-center items-center h-screen bg-red-50 p-4 no-print">
      <div class="text-red-700 text-center">
          <h2 class="text-xl font-bold mb-2">Terjadi Kesalahan</h2>
          <p>{{ errorMessage }}</p>
          <button @click="window.close()" class="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
              Tutup Jendela
          </button>
      </div>
  </div>

  <div v-else-if="data" class="bg-white max-w-[210mm] min-h-[297mm] mx-auto p-[15mm] font-serif print:p-[15mm] print:m-0 print:shadow-none"
    style="color: black; font-size: 10pt; line-height: 1.5;"
  >
    <Header :data="data" />

    <div class="border-b-2 border-black my-4"></div>

    <h2 class="text-center text-lg font-bold mb-4 uppercase">Kwitansi Pembayaran Visa</h2>

    <div class="flex justify-between mb-4 text-xs">
      <div>
        <p class="font-semibold">NO. INVOICE</p>
        <p>{{ data.invoice }}</p>
      </div>
      <div class="text-right">
        <p class="font-semibold">TANGGAL</p>
        <p>{{ formatDate(data.createdAt) }}</p>
      </div>
    </div>

    <div class="mb-4 text-xs">
      <p class="font-semibold mb-1">DITERIMA DARI:</p>
      <p class="font-bold">{{ data.kostumer_name }}</p>
      <p>{{ data.kostumer_address }}</p>
      <p>{{ data.kostumer_mobile }}</p>
    </div>

    <div class="mb-4">
      <table class="w-full border-collapse border border-black text-xs">
        <thead>
          <tr class="bg-gray-100">
            <th class="border border-black p-2 text-left">DESKRIPSI</th>
            <th class="border border-black p-2 text-right">HARGA</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="border border-black p-2 align-top">
              <p class="font-semibold">Pengurusan Visa: {{ data.jenis_visa }}</p>
              <div class="pl-4 text-gray-700">
                <p>Nama: {{ data.kostumer_name }}</p>
                <p>Jumlah Pax: {{ data.pax }} Orang</p>
                <p>Harga Satuan: Rp {{ formatCurrency(data.harga_costumer) }}</p>
              </div>
            </td>
            <td class="border border-black p-2 text-right align-top">
              <p>Rp {{ formatCurrency(data.harga_costumer * data.pax) }}</p>
            </td>
          </tr>
          <tr v-if="data.harga_costumer > 0">
            <td class="border border-black p-2 align-top">
              <p class="font-semibold">Biaya Kostumer</p>
            </td>
            <td class="border border-black p-2 text-right align-top">
              <p>Rp {{ formatCurrency(data.harga_costumer * data.pax) }}</p>
            </td>
          </tr>
        </tbody>
        <tfoot>
          <tr class="font-bold bg-gray-100">
            <td class="border border-black p-2 text-right">TOTAL</td>
            <td class="border border-black p-2 text-right">Rp {{ formatCurrency(data.harga_costumer * data.pax) }}</td>
          </tr>
        </tfoot>
      </table>
    </div>

    <div class="mb-8 text-sm">
      <p class="font-semibold italic">Terbilang: {{ terbilangUang(data.harga_costumer * data.pax) }}</p>
    </div>

    <div class="flex justify-between" style="margin-top: 50px;">
      <div class="text-center w-1/2">
        <p class="mb-16">Penerima,</p>
        <p class="font-bold uppercase"> ( {{ data.petugas }} ) </p>
        <p class="border-t border-black mt-1 pt-1">{{ data.company_name }}</p>
      </div>
      <div class="text-center w-1/2">
        <p class="mb-16">Hormat Kami,</p>
        <p class="font-bold uppercase"> ( {{ data.kostumer_name }} ) </p>
        <p class="border-t border-black mt-1 pt-1">Customer</p>
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
  body, html {
    background: white;
    -webkit-print-color-adjust: exact;
    color-adjust: exact;
  }
  .no-print {
    display: none !important;
  }
  .print\:p-\[10mm\] {
    padding: 10mm !important;
  }
  .print\:m-0 {
    margin: 0 !important;
  }
  .print\:shadow-none {
    box-shadow: none !important;
  }
}
</style>
