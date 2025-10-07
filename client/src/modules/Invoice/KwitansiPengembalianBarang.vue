<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue';
import { useRoute } from 'vue-router';
import { getKwitansiPengembalianBarang } from '@/service/invoice.ts';
import Header from '@/modules/Invoice/Particle/Header.vue';

const route = useRoute();
const invoice = route.params.invoice;
const data = ref<any>(null);
const isLoading = ref(false);

const fetchData = async () => {
  try {
    isLoading.value = true;
    const response = await getKwitansiPengembalianBarang(invoice.toString());
    data.value = response.data;
  } catch (error) {
    console.error('Gagal ambil data kwitansi:', error);
  } finally {
    isLoading.value = false;
  }
};

onMounted(async () => {
  await fetchData();
  await nextTick();
  if (!data.value) {
    window.close();
  } else {
    setTimeout(() => {
      window.scrollTo(0, 0);
      window.print();
      setTimeout(() => {
        window.close();
      }, 500);
    }, 1500);
  }
});
</script>

<template>
  <div v-if="isLoading" class="flex justify-center items-center h-screen">
    <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900"></div>
  </div>
  <div
    class="bg-white text-gray-800 max-w-[210mm] mx-auto min-h-[297mm] p-[20mm] font-serif text-xs print:shadow-none print:bg-white print:text-black print:max-w-full"
  >
    <div v-if="!isLoading && data">
      <!-- Header -->
      <Header :data="data"></Header>
      <!-- Informasi Umum -->
      <div class="flex justify-between items-start">
        <div>
          <p class="font-semibold text-lg">INVOICE: #{{ data.invoice_returned }}</p>
        </div>
        <div class="text-center font-semibold text-lg">BUKTI KWITANSI PENGEMBALIAN BARANG</div>
      </div>

      <div class="grid grid-cols-3 gap-4 mt-6">
        <div>
          <p class="font-semibold">ORDER DATE:</p>
          <p>ORDER DATE: {{ data.date_returned }}</p>
        </div>
        <div>
          <p class="font-semibold">YANG MENYERAHKAN (PIHAK I)</p>
          <p>{{ data.giver_returned }}</p>
          <p>{{ data.giver_jabatan }}</p>
        </div>
        <div>
          <p class="font-semibold">YANG MENERIMA (PIHAK II)</p>
          <p>{{ data.receiver_returned }}</p>
          <p>{{ data.receiver_returned_identity }}</p>
          <p>{{ data.receiver_returned_hp }}</p>
          <p>{{ data.receiver_returned_address }}</p>
        </div>
      </div>

      <div class="mt-8">
        <p class="font-semibold">Daftar item yang dikembalikan:</p>
        <div class="my-2 border-dashed border-t-2 border-black w-full"></div>
        <div class="flex flex-wrap">
          <span v-for="(item, index) in data.handover_barang" :key="index" class="mr-4"
            >{{ index + 1 }}. {{ item }}</span
          >
        </div>
        <div class="my-2 border-dashed border-t-2 border-black w-full"></div>
      </div>

      <div class="grid grid-cols-2 text-center mt-10">
        <div>
          <p class="font-semibold">Yang Menyerahkan PIHAK PERTAMA</p>
          <div class="mt-12">(<span class="inline-block w-48 border-t border-black"></span>)</div>
        </div>
        <div>
          <p class="font-semibold">Yang Menerima PIHAK KEDUA</p>
          <div class="mt-12">(<span class="inline-block w-48 border-t border-black"></span>)</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@media print {
  @page {
    size: A4;
    margin: 0;
    -webkit-print-color-adjust: exact;
  }
}
</style>
