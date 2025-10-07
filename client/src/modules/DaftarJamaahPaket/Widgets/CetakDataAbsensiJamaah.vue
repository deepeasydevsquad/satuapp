<script setup lang="ts">
// import Header from '@/modules/DaftarJamaahPaket/Particle/Header.vue';
import Header from '@/modules/Invoice/Particle/Header.vue';
import { ref, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { cetakDataAbsensiJamaahPaket } from '@/service/daftar_jamaah_paket';

const props = defineProps<{
  isFormCetakDataJamaahOpen: boolean;
}>();
const isLoading = ref(true);
const data = ref<any>(null);
const route = useRoute();

const params = route.params;
const query = route.query;

const fetchData = async () => {
  isLoading.value = true;
  try {
    const response = await cetakDataAbsensiJamaahPaket(params.paketId, query.petugasId);
    data.value = response.data;
    console.log('Petugas data:', data.value);
  } catch (error) {
    console.error('Error fetching petugas:', error);
  } finally {
    isLoading.value = false;
  }
};

watch(data, () => {
  if (data.value) {
    setTimeout(() => {
      window.scrollTo(0, 0);
      window.print();
      setTimeout(() => {
        if (window.opener) {
          window.opener.postMessage(
            { event: 'sukses', message: 'Data absensi jamaah berhasil dicetak' },
            '*',
          );
        }
        window.close();
      }, 500);
    }, 500);
  }
});

onMounted(async () => {
  await fetchData();
  if (!data.value || data.value.length === 0) {
    if (window.opener) {
      window.opener.postMessage(
        { event: 'gagal', message: 'Data absensi jamaah tidak ditemukan' },
        '*',
      );
      window.close();
    } else {
      window.close();
    }
  }
});
</script>

<template>
  <div v-if="isLoading" class="flex justify-center items-center h-screen">
    <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900"></div>
  </div>
  <div v-if="!isLoading && data">
    <div
      class="bg-white text-gray-800 max-w-[216mm] mx-auto min-h-[356mm] p-8 font-serif text-sm print:text-xs print:shadow-none space-y-[10px] print:bg-white print:text-black print:max-w-full"
    >
      <!-- Header Kwitansi -->
      <Header :data="data"></Header>
      <!-- Judul -->
      <div class="container mx-auto font-bold text-lg flex justify-between">
        <div class="grid grid-cols-[150px_10px_1fr]">
          <div>NAMA PAKET</div>
          <div>:</div>
          <div>{{ data.paket.toUpperCase() }}</div>
          <div>KODE PAKET</div>
          <div>:</div>
          <div>{{ data.kode }}</div>
        </div>
        <div>
          <h2>ABSENSI JAMAAH</h2>
        </div>
      </div>

      <!-- Tabel Absensi Jamaah -->
      <table class="table-auto w-full border border-collapse text-xs text-center mt-6">
        <thead>
          <tr class="border">
            <th class="border px-2 py-1 w-[4%]" rowspan="2">NO</th>
            <th class="border px-2 py-1 w-[22%]" rowspan="2">NAMA JAMAAH</th>
            <th class="border px-2 py-1 w-[22%]" rowspan="2">ALAMAT</th>
            <th class="border px-2 py-1 w-[16%]" rowspan="2">NO HP</th>
            <th class="border px-2 py-1 w-[18%]" colspan="3">PERTEMUAN</th>
            <th class="border px-2 py-1 w-[18%]" rowspan="2">KETERANGAN</th>
          </tr>
          <tr class="border">
            <th class="border px-2 py-1 w-[6%]">1</th>
            <th class="border px-2 py-1 w-[6%]">2</th>
            <th class="border px-2 py-1 w-[6%]">3</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(jamaah, index) in data.Jamaah" :key="jamaah.id" class="border">
            <td class="border px-2 py-1">{{ index + 1 }}</td>
            <td class="border px-2 py-1">{{ jamaah.fullname }}</td>
            <td class="border px-2 py-1">{{ jamaah.alamat }}</td>
            <td class="border px-2 py-1">{{ jamaah.nomor_telepon }}</td>
            <td class="border px-2 py-1"></td>
            <td class="border px-2 py-1"></td>
            <td class="border px-2 py-1"></td>
            <td class="border px-2 py-1"></td>
          </tr>
        </tbody>
      </table>

      <div class="py-10 flex items-start justify-end text-xs w-full">
        <div class="w-64 flex flex-col items-center">
          <p class="font-semibold text-gray-600 text-center">PETUGAS</p>
          <p class="mt-10 text-center">
            ({{ data.petugas }}) <br />
            Jabatan: {{ data.jabatan }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@media print {
  @page {
    size: 210mm 297mm; /* A4 Size */
    margin: 0;
    -webkit-print-color-adjust: exact;
  }
}
</style>
