<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getDownloadData } from '@/service/kamar_paket';
import Header from '@/modules/Invoice/Particle/Header.vue';

const isLoading = ref(true);
const data = ref<any>(null);
const errorMessage = ref<string | null>(null);

onMounted(async () => {
  try {
    const response = await getDownloadData();
    if (response.error || !response.data) {
      errorMessage.value = `Gagal memuat data: ${response.error_msg || 'Data tidak ditemukan.'}`;
      return;
    }
    data.value = response.data;
    setTimeout(() => window.print(), 1000);
  } catch (error: any) {
    errorMessage.value = `Terjadi kesalahan fatal: ${error.message}`;
  } finally {
    isLoading.value = false;
  }
});
</script>

<template>
  <div v-if="isLoading" class="flex justify-center items-center h-screen">
    <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
    <span class="ml-2">Mempersiapkan data...</span>
  </div>

  <div
    v-else-if="errorMessage"
    class="flex flex-col justify-center items-center h-screen bg-red-50 p-4"
  >
    <div class="text-red-700 text-center">
      <h2 class="text-xl font-bold mb-2">Terjadi Kesalahan</h2>
      <p>{{ errorMessage }}</p>
      <button
        @click="window.close()"
        class="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
      >
        Tutup
      </button>
    </div>
  </div>

  <div
    v-else-if="data"
    class="bg-white max-w-[210mm] mx-auto p-[15mm] font-serif print:p-[10mm] print:m-0 print:shadow-none"
    style="color: black; font-size: 10pt"
  >
    <!-- Header Halaman Cetak -->
    <Header v-if="data.company" :data="data.company"></Header>
    <div class="border-b-2 border-black my-4"></div>
    <h2 class="text-lg font-bold text-center mb-6">DAFTAR KAMAR JAMAAH</h2>

    <!-- Tabel Per Kamar -->
    <div
      v-for="(room, roomIndex) in data.rooms"
      :key="roomIndex"
      class="mb-8 page-break-inside-avoid"
    >
      <table class="w-full border-collapse border border-black text-xs">
        <thead class="bg-gray-100">
          <tr>
            <th class="border border-black p-2 text-left w-[8%]">No.</th>
            <th class="border border-black p-2 text-left w-[30%]">Nama Lengkap</th>
            <th class="border border-black p-2 text-left w-[22%]">Nomor Identitas</th>
            <th class="border border-black p-2 text-left w-[15%]">Tipe Kamar</th>
            <th class="border border-black p-2 text-left w-[15%]">Nama Hotel</th>
            <th class="border border-black p-2 text-left w-[10%]">Kapasitas</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="room.jamaah.length === 0">
            <td class="border border-black p-2 text-center">-</td>
            <td class="border border-black p-2 text-center italic">
              Belum ada jamaah di kamar ini
            </td>
            <td class="border border-black p-2 text-center">-</td>
            <td class="border border-black p-2">{{ room.tipe_kamar }}</td>
            <td class="border border-black p-2">{{ room.hotel_name }} ({{ room.nama_kota }})</td>
            <td class="border border-black p-2 text-center">{{ room.kapasitas_kamar }}</td>
          </tr>

          <tr v-for="(jamaah, jamaahIndex) in room.jamaah" :key="jamaahIndex">
            <td class="border border-black p-2 text-center">{{ jamaahIndex + 1 }}</td>
            <td class="border border-black p-2">{{ jamaah.nama }}</td>
            <td class="border border-black p-2">{{ jamaah.no_identity }}</td>
            <td
              v-if="jamaahIndex === 0"
              class="border border-black p-2"
              :rowspan="room.jamaah.length"
            >
              {{ room.tipe_kamar }}
            </td>
            <td
              v-if="jamaahIndex === 0"
              class="border border-black p-2"
              :rowspan="room.jamaah.length"
            >
              {{ room.hotel_name }} ({{ room.nama_kota }})
            </td>
            <td
              v-if="jamaahIndex === 0"
              class="border border-black p-2 text-center"
              :rowspan="room.jamaah.length"
            >
              {{ room.kapasitas_kamar }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
@media print {
  @page {
    size: A4;
    margin: 10mm;
  }
  body,
  html {
    background: white;
    margin: 0;
    -webkit-print-color-adjust: exact;
  }
  .page-break-inside-avoid {
    page-break-inside: avoid;
  }
}
</style>
