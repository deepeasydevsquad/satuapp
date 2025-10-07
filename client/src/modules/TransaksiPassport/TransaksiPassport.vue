<script setup lang="ts">
// Import Icon
import CetakIcon from '@/components/Icons/CetakIcon.vue';
import DeleteIcon from '@/components/Icons/DeleteIcon.vue';
import IconPlus from '@/components/Icons/IconPlus.vue';
import Pagination from '@/components/Pagination/Pagination.vue';
import PrimaryButton from '@/components/Button/PrimaryButton.vue';

// import element
import LightButton from '@/components/Button/LightButton.vue';
import DangerButton from '@/components/Button/DangerButton.vue';
import Notification from '@/modules/TransaksiPassport/Particle/Notification.vue';
import Confirmation from '@/modules/TransaksiPassport/Particle/Confirmation.vue';

// Import Form
import FormAdd from '@/modules/TransaksiPassport/Widget/FormAdd.vue';

import { getDaftarTransaksiPassport, deleteTransaksiPassport } from '@/service/transaksi_passport';
import { paramCabang } from '@/service/param_cabang';
import { ref, onMounted, computed } from 'vue';

// --- State ---
const itemsPerPage = 3;
const currentPage = ref(1);
const search = ref('');
const filter = ref('belum_ada_transaksi');
const totalPages = ref(0);
const totalColumns = ref(6);
const totalRow = ref(0);

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

const pages = computed(() => {
  return Array.from({ length: totalPages.value }, (_, i) => i + 1);
});

const showConfirmDialog = ref<boolean>(false);
const showNotification = ref<boolean>(false);
const notificationMessage = ref<string>('');
const notificationType = ref<'success' | 'error'>('success');
const confirmMessage = ref<string>('');
const confirmTitle = ref<string>('');
const confirmAction = ref<(() => void) | null>(null);

const TransaksiPassport = ref<TransaksiPassport[]>([]);
const isFormOpen = ref<boolean>(false);
const isLoading = ref<boolean>(false);

interface TransaksiPassport {
  id: number;
  invoice: string;
  petugas: string;
  kostumer_name: string;
  createdAt: string;
  detail: {
    name: string;
    identity_number: string;
    birth_place: string;
    birth_date: string;
    kk_number: string;
    address: string;
    price: number;
  }[];
}

const formatTanggal = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
};

const fetchData = async () => {
  try {
    isLoading.value = true;

    const response = await getDaftarTransaksiPassport({
      cabang: selectedOptionCabang.value,
      search: search.value,
      filter: filter.value,
      perpage: itemsPerPage,
      pageNumber: currentPage.value,
    });

    if (response && response.error) {
      displayNotification(response.error_msg || 'Terjadi kesalahan saat mengambil data', 'error');
      return;
    }

    totalPages.value = Math.ceil((response?.total || 0) / itemsPerPage);
    totalRow.value = response.total;
    TransaksiPassport.value = response?.data || [];

    totalRow.value = response.total;
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      displayNotification('Gagal terhubung ke server. Periksa koneksi internet Anda.', 'error');
    } else if (error instanceof Error) {
      displayNotification(`Error: ${error.message}`, 'error');
    } else {
      displayNotification('Gagal mengambil data. Silakan coba lagi.', 'error');
    }
  } finally {
    isLoading.value = false;
  }
};

const displayNotification = (message: string, type: 'success' | 'error' = 'success') => {
  setTimeout(() => {
    notificationMessage.value = message;
    notificationType.value = type;
    showNotification.value = true;
  }, 100);
};

const handleSaveSuccess = (message: string) => {
  isFormOpen.value = false;
  displayNotification(message, 'success');
  fetchData();
};

const handleSaveFailed = (message: string) => {
  isFormOpen.value = false;
  displayNotification(message, 'error');
  fetchData();
};

const showConfirmation = (title: string, message: string, action: () => void) => {
  confirmTitle.value = title;
  confirmMessage.value = message;
  confirmAction.value = action;
  showConfirmDialog.value = true;
};

interface filterCabang {
  id: number;
  name: string;
}

const selectedOptionCabang = ref(0);
const optionFilterCabang = ref<filterCabang[]>([]);
const fetchFilterData = async () => {
  const response = await paramCabang();
  optionFilterCabang.value = response.data;
  selectedOptionCabang.value = response.data[0].id;
  await fetchData();
};

// Placeholder untuk handle delete dan cetak kwitansi
const deleteItem = async (id: number) => {
  try {
    const response = await deleteTransaksiPassport(id);

    if (response && response.error) {
      displayNotification(response.error_msg || 'Terjadi kesalahan saat menghapus data', 'error');
    } else if (response && response.success) {
      displayNotification('Data transaksi berhasil dihapus.', 'success');
      await fetchData();
    } else if (response && response.success) {
      displayNotification(response.message || 'Data transaksi berhasil dihapus.', 'success');
      await fetchData();
    } else {
      displayNotification(response.error_msg || 'Gagal menghapus data.', 'error');
    }
  } catch (error) {
    console.error('Error deleting data:', error);

    // Cek jenis error yang lebih spesifik
    if (error instanceof TypeError && error.message.includes('fetch')) {
      displayNotification('Gagal terhubung ke server. Periksa koneksi internet Anda.', 'error');
    } else if (error instanceof Error) {
      displayNotification(`Error: ${error.message}`, 'error');
    } else {
      displayNotification('Gagal menghapus data. Silakan coba lagi.', 'error');
    }
  } finally {
    showConfirmDialog.value = false;
  }
};

const handleDelete = (id: number) => {
  showConfirmation(
    'Konfirmasi Hapus',
    'Apakah Anda yakin ingin menghapus data transaksi ini secara permanen?',
    () => deleteItem(id),
  );
};

const openCetakKwitansi = (invoice: string) => {
  console.log(`Mencetak kwitansi untuk invoice: ${invoice}`);
  const url = `/cetak-kwitansi-passport/${invoice}`;
  window.open(url, '_blank');
};

const handleConfirm = () => {
  if (confirmAction.value) {
    confirmAction.value();
  }
  showConfirmDialog.value = false;
};

const handleCancelConfirm = () => {
  showConfirmDialog.value = false;
};

// --- Lifecycle Hook ---
onMounted(async () => {
  // await fetchData()
  await fetchFilterData();
  // totalColumns.value = document.querySelectorAll('thead th').length
});

const closeModal = () => {
  isFormOpen.value = false;
};

const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const formatPrice = (num: number): string => {
  return num.toLocaleString('id-ID');
};
</script>

<template>
  <div class="container mx-auto px-4 mt-10">
    <div class="flex justify-between items-center mb-6">
      <PrimaryButton @click="isFormOpen = true">
        <IconPlus></IconPlus>
        Tambah Transaksi Passport
      </PrimaryButton>
      <div class="inline-flex rounded-md shadow-xs" role="group">
        <label for="search" class="block text-sm font-medium text-gray-700 mr-2 mt-3">Filter</label>
        <input
          type="text"
          id="search"
          class="block w-64 px-3 py-2 text-gray-700 bg-white border border-gray-300 rounded-s-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
          v-model="search"
          @change="fetchData()"
          placeholder="Cari data..."
        />
        <select
          v-model="selectedOptionCabang"
          style="width: 300px"
          @change="fetchData()"
          class="border-t border-b border-e bg-gray-50 border-gray-300 text-gray-900 text-sm rounded-e-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
        >
          <option v-for="optionC in optionFilterCabang" :key="optionC.id" :value="optionC.id">
            {{ optionC.name }}
          </option>
        </select>
      </div>
    </div>

    <div class="overflow-x-auto rounded-lg border border-gray-200 shadow-md">
      <table class="w-full border-collapse bg-white text-left text-sm text-gray-700">
        <thead class="bg-gray-100">
          <tr>
            <th class="w-[10%] px-6 py-3 text-gray-900 font-medium text-center">Nomor Invoice</th>
            <th class="w-[20%] px-6 py-3 text-gray-900 font-medium text-center">Info Pembayar</th>
            <th class="w-[30%] px-6 py-3 text-gray-900 font-medium text-center">
              Info Tansaksi Passport
            </th>
            <th class="w-[20%] px-6 py-3 text-gray-900 font-medium text-center">Total</th>
            <th class="w-[15%] px-6 py-3 text-gray-900 font-medium text-center">Tanggal</th>
            <th class="w-[5%] px-6 py-3 text-gray-900 font-medium text-center">Aksi</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100 border-t border-gray-100">
          <tr v-if="isLoading">
            <td colspan="6" class="px-6 py-6 text-center align-top">
              <div class="flex justify-center items-center py-8">
                <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
              </div>
            </td>
          </tr>
          <tr v-else-if="TransaksiPassport.length === 0">
            <td colspan="6" class="px-6 py-3 text-center text-gray-500 align-top">
              {{ search ? 'Data tidak ditemukan' : 'Transaksi Passport Tidak Ditemukan' }}
            </td>
          </tr>
          <tr v-for="item in TransaksiPassport" :key="item.id" class="hover:bg-gray-50 transition">
            <td class="px-6 py-4 text-center align-top">{{ item.invoice }}</td>
            <td class="px-6 py-4 text-center align-top">
              {{ item.kostumer_name }}
            </td>
            <td class="px-6 py-4">
              <div
                v-for="(detail, i) in item.details"
                :key="i"
                class="mb-2 border-b border-dashed border-gray-200 pb-2 last:border-0 last:pb-0"
              >
                <div class="text-sm leading-5 space-y-1">
                  <div class="grid grid-cols-[120px_1fr] gap-y-1 items-start">
                    <div>Nama</div>
                    <div>: {{ detail.name }}</div>
                    <div>No ID</div>
                    <div>: {{ detail.identity_number }}</div>
                    <div>No. KK</div>
                    <div>: {{ detail.kk_number }}</div>
                    <div>Tempat Lahir</div>
                    <div>: {{ detail.birth_place }}</div>
                    <div>Tanggal Lahir</div>
                    <div>: {{ formatDate(detail.birth_date) }}</div>
                    <div>Harga</div>
                    <div>: Rp. {{ formatPrice(detail.price) }}</div>
                  </div>
                </div>
              </div>
            </td>
            <td class="px-0 py-4 text-center align-top">
              <table class="w-full mb-5">
                <tbody>
                  <tr>
                    <td class="w-[60%] border-b px-0 py-2 text-left">Total Harga Travel</td>
                    <td class="text-center border-b py-2">:</td>
                    <td class="text-right space-y-2 text-sm border-b px-0 py-2">
                      Rp.{{
                        formatPrice(
                          item.details.reduce((total, detail) => total + (detail.price || 0), 0),
                        )
                      }}
                    </td>
                  </tr>
                  <tr>
                    <td class="border-b px-0 py-2 text-left">Total Harga Kostumer</td>
                    <td class="text-center border-b py-2">:</td>
                    <td class="text-right space-y-2 text-sm border-b px-0 py-2">
                      Rp.{{
                        formatPrice(
                          item.details.reduce(
                            (total, detail) => total + (detail.priceCostumer || 0),
                            0,
                          ),
                        )
                      }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>
            <td class="px-6 py-4 text-sm text-center text-gray-900 whitespace-nowrap align-top">
              {{ formatTanggal(item.createdAt) }}
            </td>
            <td class="px-6 py-4 text-center align-top">
              <div class="flex flex-col items-center gap-2">
                <LightButton title="Cetak Kwitansi" @click="openCetakKwitansi(item.invoice)">
                  <CetakIcon class="h-4 w-4 text-gray-600" />
                </LightButton>
                <DangerButton title="Delete" @click="handleDelete(item.id)">
                  <DeleteIcon class="w-5 h-5" />
                </DangerButton>
              </div>
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
            :totalRow="totalRow"
          />
        </tfoot>
      </table>
    </div>

    <!-- Notification Component -->
    <Notification
      v-if="showNotification"
      :show-notification="showNotification"
      :notification-message="notificationMessage"
      :notification-type="notificationType"
      @close="showNotification = false"
    />

    <!-- Confirmation Component -->
    <Confirmation
      v-if="showConfirmDialog"
      :show-confirm-dialog="showConfirmDialog"
      :confirm-title="confirmTitle"
      :confirm-message="confirmMessage"
      @close="handleCancelConfirm"
    >
      <button
        type="button"
        class="w-full justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
        @click="handleConfirm"
      >
        Hapus
      </button>
      <button
        type="button"
        class="mt-3 w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
        @click="handleCancelConfirm"
      >
        Batal
      </button>
    </Confirmation>

    <!-- Form Add Component -->
    <FormAdd
      :isFormOpen="isFormOpen"
      @cancel="closeModal"
      @save-success="handleSaveSuccess"
      @error="handleSaveFailed"
    />
  </div>
</template>
