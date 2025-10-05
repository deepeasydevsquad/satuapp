<script setup lang="ts">
import Header from '@/components/User/Modules/Invoice/Particle/Header.vue'
import { ref, onMounted, nextTick } from 'vue'
import { kwitansi_pembayaran_tiket } from '@/service/invoice'
import { useRoute } from 'vue-router'

const data = ref<any>(null)
const route = useRoute()
const invoice = typeof route.params.invoice === 'string' ? route.params.invoice : ''
console.log('🚀 Invoice:', invoice)

const formatDate = (dateStr: string) => {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  return d.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

onMounted(async () => {
  try {
    const response = await kwitansi_pembayaran_tiket(invoice)

    const isWrapped = 'data' in response && 'error' in response
    data.value = isWrapped ? response.data : response

    console.log('🚀 Data:', data.value)

    await nextTick()

    if (data.value?.invoice) {
      setTimeout(() => {
        window.print()
      }, 300)
    } else {
      console.warn('❗ Data kosong atau tidak valid:', data.value)
    }
  } catch (error) {
    console.error('❌ Gagal mengambil data invoice:', error)
  }
})
</script>

<template>
  <div
    class="bg-white max-w-[210mm] min-h-[297mm] mx-auto p-[15mm] font-serif print:p-[10mm] print:m-0 print:shadow-none"
    style="color: black; font-size: 10pt; text-align: justify; line-height: 1.3"
  >
    <Header v-if="data" :data="data.header_kwitansi" />

    <div class="p-8 bg-white text-gray-800">
      <!-- Judul -->
      <h2 class="text-2xl font-bold text-center mb-6 tracking-wide">KWITANSI PEMBAYARAN TIKET</h2>

      <div class="grid grid-cols-2 gap-6 mb-8 text-sm">
        <div class="space-y-2">
          <p class="grid grid-cols-2">
            <span class="font-semibold">Invoice</span>
            <span>: {{ data?.invoice }}</span>
          </p>
          <p class="grid grid-cols-2">
            <span class="font-semibold">Tanggal Pembayaran</span>
            <span>: {{ formatDate(data?.tanggal_pembayaran) }}</span>
          </p>
          <p class="grid grid-cols-2">
            <span class="font-semibold">Customer</span>
            <span>: {{ data?.customer }}</span>
          </p>
        </div>

        <div class="space-y-2">
          <p class="grid grid-cols-2">
            <span class="font-semibold">Paket</span>
            <span>: {{ data?.paket }}</span>
          </p>
          <p class="grid grid-cols-2">
            <span class="font-semibold">Maskapai:</span>
            <span>: {{ data?.airline }}</span>
          </p>
          <p class="grid grid-cols-2">
            <span class="font-semibold">Status</span>
            <span>: {{ data?.statusPembayaran }}</span>
          </p>
        </div>
      </div>

      <!-- Tabel Ringkasan (Turun ke bawah) -->
      <div class="mb-8">
        <table class="w-full text-sm border border-gray-300 rounded-md">
          <tbody>
            <tr class="border-b">
              <td class="px-3 py-2 font-semibold">Total Tagihan</td>
              <td class="px-3 py-2 text-center">
                Rp {{ data?.totalTagihan.toLocaleString('id-ID') }}
              </td>
            </tr>
            <tr class="border-b">
              <td class="px-3 py-2 font-semibold">Total Pembayaran</td>
              <td class="px-3 py-2 text-center">
                Rp {{ data?.totalPembayaran.toLocaleString('id-ID') }}
              </td>
            </tr>
            <tr class="border-b">
              <td class="px-3 py-2 font-semibold">Sisa Pembayaran</td>
              <td class="px-3 py-2 text-center">
                Rp {{ data?.sisaPembayaran.toLocaleString('id-ID') }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Catatan -->
      <div class="border-t pt-4 text-sm text-gray-600">
        <p>
          Terima kasih atas pembayaran Anda. Mohon simpan kwitansi ini sebagai bukti transaksi yang
          sah.
        </p>
      </div>
    </div>
  </div>
</template>
