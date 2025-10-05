<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import Pagination from '@/components/Pagination/Pagination.vue';
import LightButton from '@/components/Button/LightButton.vue';
import DangerButton from '@/components/Button/DangerButton.vue';
import PrimaryButton from '@/components/Button/PrimaryButton.vue';

const itemsPerPage = 100; // Jumlah paket_la per halaman
const currentPage = ref(1);
const totalPages = ref(0);
const totalColumns = ref(7);

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
    // fetchData()
  }
};

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
    // fetchData()
  }
};

const pageNow = (page: number) => {
  currentPage.value = page;
  // fetchData()
};

const pages = computed(() => {
  return Array.from({ length: totalPages.value }, (_, i) => i + 1);
});
</script>

<template>
  <div class="container mx-auto px-0 py-0">
    <div class="flex justify-end items-center mb-6 text-right">
      <div class="inline-flex rounded-md shadow-xs float-right" role="group">
        <label for="search" class="block text-sm font-medium text-gray-700 mr-2 mt-3">Filter</label>
        <input
          type="text"
          id="search"
          class="block w-64 px-3 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 placeholder:text-gray-400"
          placeholder="Cari data..."
        />
      </div>
    </div>
    <div class="overflow-hidden rounded-lg border border-gray-200 shadow-md">
      <table class="w-full border-collapse bg-white text-left text-sm text-gray-500">
        <thead class="bg-gray-50">
          <tr class="bg-gray-100">
            <th class="w-[11%] px-6 py-4 font-medium font-bold text-gray-900 text-center">
              Nomor Register
            </th>
            <th class="w-[22%] px-6 py-4 font-medium font-bold text-gray-900 text-center">Paket</th>
            <th class="w-[12%] px-6 py-4 font-medium font-bold text-gray-900 text-center">
              Tipe Paket
            </th>
            <th class="w-[16%] px-6 py-4 font-medium font-bold text-gray-900 text-center">
              Jamaah / Visa
            </th>
            <th class="w-[12%] px-6 py-4 font-medium font-bold text-gray-900 text-center">
              Total Harga
            </th>
            <th class="w-[12%] px-6 py-4 font-medium font-bold text-gray-900 text-center">
              Status Pembayaran
            </th>
            <th class="w-[15%] px-6 py-4 font-medium font-bold text-gray-900 text-center">Aksi</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100 border-t border-gray-100">
          <tr>
            <td :colspan="7" class="px-6 py-4 text-center text-gray-500">
              Daftar Info Pembayaran Paket Jamaah Tidak di Temukan
            </td>
          </tr>
        </tbody>
        <tfoot class="bg-gray-100 font-bold">
          <Pagination
            :current-page="currentPage"
            :total-pages="totalPages"
            :pages="pages"
            :total-columns="totalColumns"
            @prev-page="prevPage"
            @next-page="nextPage"
            @page-now="pageNow"
          />
        </tfoot>
      </table>
    </div>
  </div>
</template>
