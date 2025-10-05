<script setup lang="ts">
import Header from '@/components/User/Modules/Invoice/Particle/Header.vue'
import { ref, onMounted, nextTick } from 'vue'
import { kwitansi_trans_fasilitas } from '@/service/invoice'
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
    const response = await kwitansi_trans_fasilitas(invoice)

    const isWrapped = 'data' in response && 'error' in response
    data.value = isWrapped ? response.data : response

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
    class="bg-white max-w-[210mm] min-h-[297mm] mx-auto p-[15mm] font-serif print:p-[15mm] print:m-0 print:shadow-none"
    style="color: black; font-size: 10pt; text-align: justify; line-height: 1.3"
  >
    <Header v-if="data" :data="data.header_kwitansi" />

    <div v-if="data" class="mt-8">
      <div class="flex justify-between items-center text-sm font-semibold pb-1 mb-4">
        <div>DETAIL TRANSAKSI FASILITAS</div>
        <div>INVOICE : {{ data.invoice || '-' }}</div>
      </div>

      <div class="flex justify-between text-sm mb-4">
        <div>
          <div class="font-semibold">DITERIMA OLEH</div>
          <div>{{ data.petugas || '-' }}</div>
        </div>
        <div class="text-right">
          <div class="font-semibold">DITERIMA DARI</div>
          <div>{{ data.nama_kostumer || '-' }}<br /></div>
        </div>
      </div>

      <div class="flex justify-between text-sm mb-4" v-if="data.nama_paket !== '-'  ">
        <div>

        </div>
        <div class="text-right">
          <div class="font-semibold">NAMA PAKET</div>
          <div>{{ data.nama_paket }}</div>
        </div>
      </div>

      <h2 class="font-semibold text-sm mb-1">DETAIL TRANSAKSI :</h2>

      <table class="w-full border-collapse text-[10pt] mb-8">
        <thead>
          <tr class="bg-gray-100 border">
            <th class="border px-4 py-2 text-center w-[30%]">KODE ITEM</th>
            <th class="border px-4 py-2 text-center w-[40%]">NAMA FASILITAS</th>
            <th class="border px-4 py-2 text-center w-[30%]">HARGA FASILITAS</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="(detail, i) in data.detail_fasilitas" :key="i" class="border-b border-gray-200">
            <td class="px-4 py-2 text-center">{{ detail.item_code }}</td>
            <td class="px-4 py-2 text-center">{{ detail.nama_fasilitas }}</td>
            <td class="px-4 py-2 text-right">
              Rp {{ Number(detail.price).toLocaleString('id-ID') }}
            </td>
          </tr>
        </tbody>

        <tfoot>
          <tr>
            <td class="px-4 py-2 text-right font-semibold" colspan="2">TOTAL</td>
            <td class="px-4 py-2 text-right font-semibold">
              Rp {{ Number(data.total_price || 0).toLocaleString('id-ID') }}
            </td>
          </tr>
        </tfoot>
      </table>

      <div class="flex justify-between text-sm mt-10">
        <div class="text-center">
          <div>Penerima</div>
          <br /><br />
          <div>({{ data.petugas || '-' }})</div>
        </div>
        <div class="text-center">
          <div>Penyetor</div>
          <br /><br />
          <div>({{ data.nama_kostumer || '-' }})</div>
        </div>
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
    size: 210mm 330mm;
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
