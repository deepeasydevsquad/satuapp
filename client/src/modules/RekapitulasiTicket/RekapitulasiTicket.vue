<script setup lang="ts">
// Import Icon
import DeleteIcon from '@/modules/DaftarPaket/Icon/DeleteIcon.vue';
import CetakIcon from '@/components/Icons/CetakIcon.vue';
import Pagination from '@/components/Pagination/Pagination.vue';

// import element
import Notification from '@/modules/RekapitulasiTicket/Particle/Notification.vue';
import Confirmation from '@/modules/RekapitulasiTicket/Particle/Confirmation.vue';

// import widget
import FormAdd from '@/modules/RekapitulasiTicket/Widget/FormAdd.vue';

import LightButton from '@/components/Button/LightButton.vue';
import DangerButton from '@/components/Button/DangerButton.vue';

// import API
import { daftarRekapitulasiTiket, deleteRekapitulasi } from '@/service/rekapitulasi_ticket';
import { ref, onMounted, computed } from 'vue';

const itemsPerPage = 100; // Jumlah rekapitulasi per halaman
const currentPage = ref(1);
const totalPages = ref(0);
const search = ref('');

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
    fetchData();
  }
};

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
    fetchData();
  }
};

const pageNow = (page: number) => {
  currentPage.value = page;
  fetchData();
};

// Generate array angka halaman
const pages = computed(() => {
  return Array.from({ length: totalPages.value }, (_, i) => i + 1);
});

interface Rekapitulasi {
  id: number;
  registration_number: string;
  costumer_name: string;
  costumer_whatsapp_number: string;
  petugas: string;
  total_rekapitulasi: number;
  createdAt: string;
}

const timeoutId = ref<number | null>(null);
const dataRekapitulasi = ref<Rekapitulasi[]>([]);
const isFormOpen = ref<boolean>(false);
const isLoading = ref<boolean>(false);
const showConfirmDialog = ref<boolean>(false);
const showNotification = ref<boolean>(false);
const notificationMessage = ref<string>('');
const notificationType = ref<'success' | 'error'>('success');
const confirmMessage = ref<string>('');
const confirmTitle = ref<string>('');
const confirmAction = ref<(() => void) | null>(null);
const totalColumns = ref(5);

const fetchData = async () => {
  try {
    isLoading.value = true;
    console.log(search);
    const response = await daftarRekapitulasiTiket({
      search: search.value,
      perpage: itemsPerPage,
      page: currentPage.value,
    });

    if (response.error) {
      displayNotification(response.error_msg, 'error');
      return;
    }

    totalPages.value = Math.ceil(response.total / itemsPerPage);
    dataRekapitulasi.value = response.data || [];

    isLoading.value = false;
  } catch (error) {
    console.error('Error fetching data:', error);
    displayNotification('Gagal mengambil data.', 'error');
    isLoading.value = false;
  }
};

onMounted(async () => {
  await fetchData();
  totalColumns.value = document.querySelectorAll('thead th').length;
  window.addEventListener('message', handleWindowMessage);
});

const handleWindowMessage = (event: MessageEvent) => {
  if (event.data?.event === 'success') {
    displayNotification(event.data.message, 'success');
  } else if (event.data?.event === 'error') {
    displayNotification(event.data.message, 'error');
  }
};

const displayNotification = (message: string, type: 'success' | 'error' = 'success') => {
  notificationMessage.value = message;
  notificationType.value = type;
  showNotification.value = true;

  if (timeoutId.value) clearTimeout(timeoutId.value);

  timeoutId.value = window.setTimeout(() => {
    showNotification.value = false;
  }, 3000);
};

const showConfirmation = (title: string, message: string, action: () => void) => {
  confirmTitle.value = title;
  confirmMessage.value = message;
  confirmAction.value = action;
  showConfirmDialog.value = true;
};

const openForm = () => {
  isFormOpen.value = true;
};

const handleSave = () => {
  fetchData();
  displayNotification('Rekapitulasi berhasil disimpan!', 'success');
};

const deleteData = async (id: number) => {
  showConfirmation('Konfirmasi Hapus', 'Apakah Anda yakin ingin menghapus data ini?', async () => {
    try {
      const response = await deleteRekapitulasi(id);
      if (response.error) {
        displayNotification(response.error_msg, 'error');
        return;
      }
      showConfirmDialog.value = false;
      displayNotification(response.error_msg || 'Operasi berhasil!', 'success');
      fetchData();
    } catch (error) {
      console.error('Error deleting data:', error);
      displayNotification('Terjadi kesalahan saat menghapus data.', 'error');
    }
  });
};

const cetakData = (id: string) => {
  window.open(`/rekapitulasi-ticket/cetak/${id}`, '_blank');
};

const formatPrice = (value: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(value);
};
</script>

<template>
  <div v-if="isLoading" class="flex items-center justify-center h-full">
    <div class="animate-spin rounded-full h-8 w-8 border-b-4 border-blue-700"></div>
  </div>
  <div v-else class="container mx-auto px-4 mt-10">
    <div class="flex justify-between items-center mb-6">
      <button
        @click="openForm()"
        class="bg-[#455494] text-white px-4 py-2 rounded-lg hover:bg-[#3a477d] transition-colors duration-200 ease-in-out flex items-center gap-2"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 4v16m8-8H4"
          />
        </svg>
        Rekapitulasi Ticket
      </button>

      <div class="flex items-center">
        <div class="flex items-center ml-4">
          <label for="search" class="block text-sm font-medium text-gray-700 mr-2">Search:</label>
          <input
            type="text"
            id="search"
            class="block w-64 px-3 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 placeholder:text-gray-400"
            v-model="search"
            @change="fetchData()"
            placeholder="Nomor Rekapitulasi"
          />
        </div>
      </div>
    </div>
    <!-- Table data -->
    <div class="overflow-hidden rounded-lg border border-gray-200 shadow-md">
      <table class="w-full border-collapse bg-white text-left text-sm text-gray-500">
        <thead class="bg-gray-100">
          <tr>
            <th class="w-[20%] px-6 py-3 font-medium text-gray-900 text-center">
              Nomor Rekapitulasi
            </th>
            <th class="w-[40%] px-6 py-4 font-medium text-gray-900 text-center">
              Info Rekapitulasi
            </th>
            <th class="w-[15%] px-6 py-4 font-medium text-gray-900 text-center">Total</th>
            <th class="w-[15%] px-6 py-4 font-medium text-gray-900 text-center">
              Tanggal Transaksi
            </th>
            <th class="w-[10%] px-6 py-4 font-medium text-gray-900 text-center">Aksi</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100 border-t border-gray-100">
          <template v-if="dataRekapitulasi && dataRekapitulasi.length > 0">
            <tr v-for="rekap in dataRekapitulasi" :key="rekap.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 text-center">
                <p class="font-medium text-gray-800">{{ rekap.registration_number }}</p>
              </td>
              <td class="px-6 py-4 text-center">
                <p class="font-medium text-gray-800">{{ rekap.costumer_name }}</p>
                <p class="text-gray-600">{{ rekap.costumer_whatsapp_number }}</p>
                <p class="text-gray-600">{{ rekap.petugas }}</p>
              </td>
              <td class="px-6 py-4 text-center">
                <p class="font-medium text-gray-800">{{ formatPrice(rekap.total_rekapitulasi) }}</p>
              </td>
              <td class="px-6 py-4 text-center">
                <p class="font-medium text-gray-800">{{ rekap.createdAt }}</p>
              </td>
              <td class="px-6 py-4 text-center">
                <div class="flex justify-center gap-2">
                  <LightButton @click="cetakData(rekap.registration_number)">
                    <CetakIcon></CetakIcon>
                  </LightButton>
                  <DangerButton @click="deleteData(rekap.id)">
                    <DeleteIcon></DeleteIcon>
                  </DangerButton>
                </div>
              </td>
            </tr>
          </template>
          <tr v-else>
            <td :colspan="totalColumns" class="px-6 py-4 text-center text-base text-gray-600">
              Daftar Rekapitulasi tidak ditemukan.
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

  <Transition
    enter-active-class="transition-opacity duration-200 ease-out"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition-opacity duration-200 ease-in"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <FormAdd
      v-if="isFormOpen"
      :is-form-open="isFormOpen"
      @close="((isFormOpen = false), fetchData())"
      @save="handleSave"
    />
  </Transition>

  <!-- Confirmation Dialog -->
  <Confirmation
    :showConfirmDialog="showConfirmDialog"
    :confirmTitle="confirmTitle"
    :confirmMessage="confirmMessage"
  >
    <button
      @click="confirmAction && confirmAction()"
      class="inline-flex w-full justify-center rounded-md border border-transparent bg-yellow-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
    >
      Ya
    </button>
    <button
      @click="showConfirmDialog = false"
      class="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
    >
      Tidak
    </button>
  </Confirmation>

  <!-- Notification -->
  <Notification
    :showNotification="showNotification"
    :notificationType="notificationType"
    :notificationMessage="notificationMessage"
    @close="showNotification = false"
  />
</template>
