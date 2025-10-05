<script setup lang="ts">
import Header from '@/components/User/Modules/Invoice/Particle/Header.vue'
import { ref, onMounted, nextTick, computed } from 'vue'
import { kwitansi_trans_hotel } from '@/service/invoice'
import { useRoute } from 'vue-router'

const data = ref<any>(null)
const route = useRoute()
const invoice = route.params.invoice as string

const formatDate = (dateStr: string | null) => {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  return d.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  })
}

const formatCurrency = (value: number | null) => {
  if (value === null || isNaN(value)) return 'Rp 0'
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value)
}

const transactionDate = computed(() => {
  return data.value?.data?.createdAt ? formatDate(data.value.data.createdAt) : '-'
})

const terbilangUang = (amount: number, withSen: boolean = false): string => {
  if (typeof amount !== "number" || isNaN(amount)) return "Nol Rupiah";

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

onMounted(async () => {
  try {
    const response = await kwitansi_trans_hotel(invoice)
    data.value = response.data

    await nextTick()

    if (data.value?.data) {
      setTimeout(() => {
        window.print()
      }, 300)
    } else {
      console.warn('❗ Data invoice kosong atau tidak valid:', data.value)
    }
  } catch (error) {
    console.error('❌ Gagal mengambil data invoice:', error)
  }
})
</script>

<template>
  <div class="bg-gray-100 print:bg-white font-sans">
    <div
      class="bg-white max-w-[210mm] min-h-[297mm] mx-auto p-[15mm] print:p-[15mm] print:m-0 print:shadow-none shadow-lg"
    >
      <div v-if="data" class="text-gray-800 text-[11pt] leading-normal">
        <!-- Header -->
        <Header :data="data.header" />

        <!-- Invoice Title & Details -->
        <div class="mt-12 mb-8">
          <h1 class="text-3xl font-bold text-gray-900 text-right">INVOICE</h1>
          <div class="text-right mt-2">
            <div class="text-sm">
              <span class="font-semibold">Invoice #:</span> {{ data.data?.invoice || '-' }}
            </div>
            <div class="text-sm">
              <span class="font-semibold">Tanggal Terbit:</span> {{ transactionDate }}
            </div>
          </div>
        </div>

        <!-- Customer & Company Details -->
        <div class="grid grid-cols-2 gap-8 mb-10">
          <div>
            <div class="font-semibold text-gray-600 mb-2">Ditujukan Kepada:</div>
            <div class="font-bold text-lg">{{ data.data?.nama_kostumer || '-' }}</div>
            <div class="text-sm">{{ data.data?.address || '-' }}</div>
            <div class="text-sm">{{ data.data?.mobile_number || '-' }}</div>
          </div>
          <div class="text-right">
            <div class="font-semibold text-gray-600 mb-2">Diterbitkan Oleh:</div>
            <div class="font-bold text-lg">{{ data.header?.company_name || '-' }}</div>
            <div class="text-sm">{{ data.header?.address || '-' }}</div>
            <div class="text-sm">{{ data.header?.email || '-' }} / {{ data.header?.telp || '-' }}</div>
          </div>
        </div>

        <!-- Transaction Details Table -->
        <div class="mb-10">
          <table class="w-full border-collapse">
            <thead>
              <tr class="bg-gray-100 print:bg-gray-50">
                <th class="p-3 text-left font-semibold text-sm w-[60%]">Deskripsi</th>
                <th class="p-3 text-center font-semibold text-sm">Kuantitas</th>
                <th class="p-3 text-right font-semibold text-sm">Harga Satuan</th>
                <th class="p-3 text-right font-semibold text-sm">Total</th>
              </tr>
            </thead>
            <tbody>
              <tr class="border-b">
                <td class="p-3 align-top">
                  <div class="font-semibold">{{ data.data?.hotel_name || '-' }}</div>
                  <div class="text-xs text-gray-600">
                    Tipe Kamar: {{ data.data?.tipe_kamar || '-' }} <br />
                    Check-in: {{ formatDate(data.data?.check_in) }} | Check-out:
                    {{ formatDate(data.data?.check_out) }}
                  </div>
                </td>
                <td class="p-3 text-center align-top">
                  {{ data.data?.jumlah_kamar }} kamar x {{ data.data?.jumlah_hari }} hari
                </td>
                <td class="p-3 text-right align-top">
                  {{ formatCurrency(data.data?.harga_kostumer_kamar_per_hari) }}
                </td>
                <td class="p-3 text-right align-top font-semibold">
                  {{ formatCurrency(data.data?.total_harga) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Total Calculation -->
        <div class="flex justify-end mb-12">
          <div class="w-full max-w-sm">
            <div class="flex justify-between py-2 border-b">
              <span class="font-semibold">Subtotal</span>
              <span>{{ formatCurrency(data.data?.total_harga) }}</span>
            </div>
            <div class="flex justify-between py-2 bg-gray-100 print:bg-gray-50 rounded-md px-3 mt-2">
              <span class="font-bold text-lg">TOTAL</span>
              <span class="font-bold text-lg">{{ formatCurrency(data.data?.total_harga) }}</span>
            </div>
            <div
              class="text-right italic text-sm mt-2 text-gray-700 bg-gray-50 print:bg-gray-50 p-2 rounded-md"
            >
              <span class="font-semibold">Terbilang:</span>
              {{ terbilangUang(data.data?.total_harga) }}
            </div>
          </div>
        </div>

        <!-- Notes & Signature -->
        <div class="mt-16">
          <div class="text-sm text-gray-600 mb-4">
            <div class="font-semibold">Catatan:</div>
            <p>
              Pembayaran dapat dilakukan melalui transfer ke rekening perusahaan kami. Terima kasih
              atas kepercayaan Anda.
            </p>
          </div>

          <div class="grid grid-cols-2 gap-8 pt-10">
            <div class="text-center">
              <div class="font-semibold">Hormat Kami,</div>
              <div class="mt-20 border-t w-48 mx-auto"></div>
              <div class="mt-2">{{ data.data?.petugas || '-' }}</div>
              <div class="text-xs">({{ data.header?.company_name || '-' }})</div>
            </div>
            <div class="text-center">
              <div class="font-semibold">Penerima,</div>
              <div class="mt-20 border-t w-48 mx-auto"></div>
              <div class="mt-2">{{ data.data?.nama_kostumer || '-' }}</div>
            </div>
          </div>
        </div>
      </div>
      <div v-else class="text-center py-20">
        <p>Memuat data invoice...</p>
      </div>
    </div>
  </div>
</template>

<style>
@media screen {
  body, html{
    background-color: #f3f4f6;
    -webkit-print-color-adjust: exact;
    color-adjust: exact;
  }
}

@media print {
  @page {
    size: A4;
    margin: 0;
  }

  html,
  body {
    margin: 0;
    padding: 0;
    background: white;
  }

  .print-area {
    box-shadow: none;
    margin: 0;
    padding: 0;
  }
}
</style>
