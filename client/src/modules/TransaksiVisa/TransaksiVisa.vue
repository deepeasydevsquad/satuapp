<script setup lang="ts">
// Import Icon
import CetakIcon from '@/components/Icons/CetakIcon.vue';
import DeleteIcon from '@/components/Icons/DeleteIcon.vue';
import Pagination from '@/components/Pagination/Pagination.vue';
import PrimaryButton from '@/components/Button/PrimaryButton.vue';

// import element
import LightButton from '@/components/Button/LightButton.vue';
import DangerButton from '@/components/Button/DangerButton.vue';
import Notification from '@/modules/TransaksiVisa/Particle/Notification.vue';
import Confirmation from '@/modules/TransaksiVisa/Particle/Confirmation.vue';

// Import Service & Vue
import { getDaftarTransaksiVisa, deleteTransaksiVisa } from '@/service/transaksi_visa';
import { paramCabang } from '@/service/param_cabang';
import { ref, onMounted, computed } from 'vue';
import FormAddVisa from './Widget/FormAddVisa.vue';

const ModalVisa = ref(false);

const openModalVisa = () => {
  ModalVisa.value = true;
};

// --- State ---
const itemsPerPage = 100;
const currentPage = ref(1);
const search = ref('');
const filter = ref('belum_ada_transaksi');
const totalPages = ref(0);
const totalColumns = ref(6);
const totalRow = ref(0);

// --- Interface ---
interface TransaksiVisa {
  id: number;
  invoice: string;
  petugas: string;
  kostumer: string;
  paket: string;
  jenis_visa: string;
  pax: number;
  harga_travel: number;
  harga_costumer: number;
  tanggal_transaksi: string;
}

const TransaksiVisa = ref<TransaksiVisa[]>([]);
const isLoading = ref<boolean>(false);

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

// --- Computed Pagination ---
const pages = computed(() => {
  return Array.from({ length: totalPages.value }, (_, i) => i + 1);
});

// State untuk notifikasi & konfirmasi
const showConfirmDialog = ref<boolean>(false);
const showNotification = ref<boolean>(false);
const notificationMessage = ref<string>('');
const notificationType = ref<'success' | 'error'>('success');
const confirmMessage = ref<string>('');
const confirmTitle = ref<string>('');
const confirmAction = ref<(() => void) | null>(null);

// --- Functions ---
const fetchData = async () => {
  try {
    isLoading.value = true;
    const response = await getDaftarTransaksiVisa({
      search: search.value,
      filter: filter.value,
      perpage: itemsPerPage,
      pageNumber: currentPage.value,
      cabang: selectedOptionCabang.value,
    });
    TransaksiVisa.value = response?.data;
    totalPages.value = Math.ceil((response?.total || 0) / itemsPerPage);
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

const displayNotification = (message: string, type: 'success' | 'error' = 'success') => {
  setTimeout(() => {
    notificationMessage.value = message;
    notificationType.value = type;
    showNotification.value = true;
  }, 100);
};

const showConfirmation = (title: string, message: string, action: () => void) => {
  confirmTitle.value = title;
  confirmMessage.value = message;
  confirmAction.value = action;
  showConfirmDialog.value = true;
};

const deleteItem = async (id: number) => {
  try {
    const response = await deleteTransaksiVisa(id);
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

// Fungsi untuk handle konfirmasi
const handleConfirm = () => {
  if (confirmAction.value) {
    confirmAction.value();
  }
  showConfirmDialog.value = false;
};

const openCetakKwitansi = (invoice: string) => {
  console.log('Invoice to print:', invoice); // TAMBAHKAN INI
  const url = `/cetak-kwitansi-visa/${invoice}`;
  window.open(url, '_blank');
};

const handleCancelConfirm = () => {
  showConfirmDialog.value = false;
};

const formatRupiah = (angka: any, prefix = 'Rp ') => {
  let numberString = angka.toString().replace(/\D/g, ''),
    split = numberString.split(','),
    sisa = split[0].length % 3,
    rupiah = split[0].substr(0, sisa),
    ribuan = split[0].substr(sisa).match(/\d{3}/g);

  if (ribuan) {
    let separator = sisa ? '.' : '';
    rupiah += separator + ribuan.join('.');
  }

  return prefix + (rupiah || '0');
};

// --- Lifecycle Hook ---
onMounted(async () => {
  await fetchFilterData();
});
</script>

<template>
  <div class="container mx-auto px-4 mt-10">
    <div class="flex justify-between items-center mb-6">
      <PrimaryButton @click="openModalVisa">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 4v16m8-8H4"
          />
        </svg>
        Tambah Transaksi Visa
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
            <th class="w-[10%] px-6 py-3 font-medium text-gray-900 text-center">Nomor Invoice</th>
            <th class="w-[25%] px-6 py-3 font-medium text-gray-900 text-center">
              Info Kostumer/Paket
            </th>
            <th class="w-[35%] px-6 py-3 font-medium text-gray-900 text-center">Info Visa</th>
            <th class="w-[20%] px-6 py-3 font-medium text-gray-900 text-center">Tanggal</th>
            <th class="w-[10%] px-6 py-3 font-medium text-gray-900 text-center">Aksi</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100 border-t border-gray-100">
          <tr v-if="TransaksiVisa.length === 0">
            <td colspan="6" class="px-6 py-3 text-center text-gray-500">
              {{ search ? 'Data tidak ditemukan' : 'Belum ada data transaksi visa' }}
            </td>
          </tr>
          <tr
            v-else
            v-for="item in TransaksiVisa"
            :key="item.id"
            class="hover:bg-gray-50 transition"
          >
            <td class="px-6 py-4 text-center align-top">
              <div class="font-bold text-sm">{{ item.invoice }}</div>
            </td>
            <td class="px-6 py-4 text-center align-top leading-tight">
              <span v-if="item.kostumer != '-'">
                <b>Nama Kostumer</b> <br />
                ( {{ item.kostumer }} )
              </span>
              <span v-if="item.paket != '-'">
                <b>Nama Paket</b> <br />
                ( {{ item.paket }} )
              </span>
            </td>
            <td class="px-6 py-4 text-center align-top">
              <table class="w-full mb-5">
                <tbody>
                  <tr>
                    <td class="w-[35%] border-b px-6 py-2 text-left">Jenis Visa</td>
                    <td class="text-center border-b py-2">:</td>
                    <td class="text-right space-y-2 text-sm border-b px-6 py-2">
                      {{ item.jenis_visa }}
                    </td>
                  </tr>
                  <tr>
                    <td class="border-b px-6 py-2 text-left">Pax</td>
                    <td class="text-center border-b py-2">:</td>
                    <td class="text-right space-y-2 text-sm border-b px-6 py-2">
                      {{ item.pax }} Pax
                    </td>
                  </tr>
                  <tr>
                    <td class="border-b px-6 py-2 text-left">Harga Travel</td>
                    <td class="text-center border-b py-2">:</td>
                    <td class="text-right space-y-2 text-sm border-b px-6 py-2">
                      {{ formatRupiah(item.harga_travel) }}
                    </td>
                  </tr>
                  <tr>
                    <td class="border-b px-6 py-2 text-left">Harga Kostumer</td>
                    <td class="text-center border-b py-2">:</td>
                    <td class="text-right space-y-2 text-sm border-b px-6 py-2">
                      {{ formatRupiah(item.harga_costumer) }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>
            <td class="px-6 py-4 text-center align-top">{{ item.tanggal_transaksi }}</td>
            <td class="px-6 py-4 text-center align-top">
              <div class="flex justify-end gap-2">
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
    <!-- Form Add Component -->
    <transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="transform scale-95 opacity-0"
      enter-to-class="transform scale-100 opacity-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="transform scale-100 opacity-100"
      leave-to-class="transform scale-95 opacity-0"
    >
    </transition>
  </div>
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
  <!-- Form Add Visa -->
  <FormAddVisa
    :formStatus="ModalVisa"
    @cancel="ModalVisa = false"
    @submitted="
      () => {
        ModalVisa = false;
        fetchData();
      }
    "
  />
  <!-- Notification Component -->
  <Notification
    v-if="showNotification"
    :show-notification="showNotification"
    :notification-message="notificationMessage"
    :notification-type="notificationType"
    @close="showNotification = false"
  />
</template>
