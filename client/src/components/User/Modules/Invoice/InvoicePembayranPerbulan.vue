<template>
  <div class="bg-white text-sm text-gray-800 min-h-screen">
    <div id="invoice" v-if="company && company.data" class="mx-auto p-4">
      <!-- Header -->
      <Header :data="company.data" />

      <div class="border border-gray-400 rounded-md p-4 mt-4">
        <table class="w-full text-sm leading-relaxed border-collapse">
          <tbody>
            <tr>
              <!-- No Register -->
              <td class="align-top w-[23%] p-2">
                <p class="font-semibold mb-1 text-center uppercase">No Register</p>
                <p class="text-center">{{ company.data.register_number }}</p>
              </td>

              <!-- Info Peminjaman -->
              <td class="align-top w-[23%] p-2">
                <p class="font-semibold mb-1 text-center uppercase">Info Peminjaman</p>
                <table class="w-full pl-4 font-bold">
                  <tbody>
                    <tr>
                      <td>Pinjam:</td>
                      <td>{{ formatRupiah(company.data.pinjaman_nominal) }}</td>
                    </tr>
                    <tr>
                      <td>Tenor:</td>
                      <td>{{ company.data.pinjaman_tenor }} Bulan</td>
                    </tr>
                    <tr>
                      <td>Sudah Bayar:</td>
                      <td>{{ formatRupiah(company.data.total_pembayaran) }}</td>
                    </tr>
                    <tr>
                      <td>Status:</td>
                      <td>
                        <span>
                          {{
                            company.data.status_peminjaman === 'belum_lunas'
                              ? 'Belum Lunas'
                              : 'Lunas'
                          }}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>

              <!-- Info Jamaah -->
              <td class="align-top w-[23%] p-2">
                <p class="font-semibold mb-1 text-center uppercase">Info Jamaah</p>
                <p class="text-center">
                  {{ company.data.nama_jamaah }}<br />
                  (&nbsp;{{ company.data.identity_number }}&nbsp;)
                </p>
              </td>

              <!-- Tanggal Transaksi -->
              <td class="align-top w-[23%] p-2">
                <p class="font-semibold mb-1 text-center uppercase">Tanggal Transaksi</p>
                <p class="text-center">{{ company.data.createdAt }}</p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <h3 class="text-left text-xl font-bold mt-10 mb-4">Detail Pembayaran Pinjaman</h3>
      <table class="min-w-full border border-gray-400 print-table">
        <thead>
          <tr>
            <th class="border border-gray-400">No. Invoice</th>
            <th class="border border-gray-400">Pembayaran</th>
            <th class="border border-gray-400">Status</th>
            <th class="border border-gray-400">Term</th>
            <th class="border border-gray-400">Tanggal Transaksi</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="border border-gray-400">{{ company.data.invoice }}</td>
            <td class="border border-gray-400">{{ formatRupiah(company.data.nominal) }}</td>
            <td class="border border-gray-400">{{ company.data.status_pembayaran }}</td>
            <td class="border border-gray-400">{{ company.data.term }}</td>
            <td class="border border-gray-400">{{ company.data.createdAt }}</td>
          </tr>
        </tbody>
      </table>

      <div class="mt-10 flex justify-end space-x-20 pr-10">
        <div class="flex flex-col items-center">
          <p class="font-bold">Jamaah</p>
          <p class="mt-20 text-sm font-semibold">{{ company.data.nama_jamaah }}</p>
          <p>(&nbsp;{{ company.data.identity_number }}&nbsp;)</p>
        </div>
        <div class="flex flex-col items-center">
          <p class="font-bold">Petugas</p>
          <p class="mt-20 font-semibold">( &nbsp;{{ company.data.nama_petugas }} &nbsp;)</p>
        </div>
      </div>
    </div>

    <div v-else class="text-center py-10">Memuat data invoice...</div>
  </div>
</template>

<script setup lang="ts">
import Header from '@/components/User/Modules/Invoice/Particle/Header.vue'
import { ref, onMounted, nextTick } from 'vue'
import { getInvoicePembayaranPerbulan } from '@/service/invoice'
import { useRoute } from 'vue-router'

const route = useRoute()
const invoicePembayaranPerbulan = route.params.invoice
const company = ref<{ data: any } | null>(null)

onMounted(async () => {
  try {
    const response = await getInvoicePembayaranPerbulan(invoicePembayaranPerbulan)
    const isWrapped = 'data' in response && 'error' in response
    const data = isWrapped ? response.data : response
    company.value = { data }
    await nextTick()
    window.print()
  } catch (error) {
    console.error('Gagal mengambil data invoice:', error)
  }
})

const formatRupiah = (value: number | string): string => {
  const angka = typeof value === 'number' ? value : parseInt(value)
  return angka.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })
}
</script>

<style scoped>
#invoice {
  max-width: 100%;
  margin: 0 auto;
  padding: 1rem;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th,
td {
  padding: 8px 12px;
  text-align: left;
}

.print-table th,
.print-table td {
  border: 1px solid #000;
  padding: 6px 10px;
}

td p {
  margin-bottom: 0.5rem; /* atau 8px */
}
@media print {
  html,
  body {
    width: 100%;
    margin: 0;
    padding: 0;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  #invoice {
    width: 210mm !important;
    padding: 1rem !important;
  }

  .flex-wrap {
    flex-wrap: wrap !important;
  }

  .w-\[23\%\] {
    width: 23% !important;
  }

  .list-disc {
    list-style-type: disc !important;
  }
}
</style>
