<script setup lang="ts">
// Import Icon
import DeleteIcon from '@/modules/Jurnal/Icon/DeleteIcon.vue';
import EditIcon from '@/modules/Jurnal/Icon/EditIcon.vue';

// import element
import DangerButton from '@/components/Button/DangerButton.vue';
import EditButton from '@/modules/Jurnal/Particle/EditButton.vue';
import Notification from '@/modules/Jurnal/Particle/Notification.vue';
import Confirmation from '@/modules/Jurnal/Particle/Confirmation.vue';
import Pagination from '@/components/Pagination/Pagination.vue';

// Import service API
import { getFilter, daftarJurnal, deleteJurnal } from '@/service/jurnal'; // Import function POST
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';

const itemsPerPage = 100;
const currentPage = ref(1);
const search = ref('');
const totalPages = ref(0);

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
    fetch();
  }
};

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
    fetch();
  }
};

const pageNow = (page: number) => {
  currentPage.value = page;
  fetch();
};

// Generate array angka halaman
const pages = computed(() => {
  return Array.from({ length: totalPages.value }, (_, i) => i + 1);
});

interface Jurnal {
  id: number;
  Cabang: string;
  source: string;
  ref: string;
  ket: string;
  akun_debet: string;
  akun_debet_name: string;
  akun_kredit: string;
  akun_kredit_name: string;
  saldo: string;
  createdAt: string;
  removable: string;
}

interface Errors {
  kode: string;
  name: string;
}

interface filterCabang {
  id: number;
  name: string;
}

const optionFilterPeriode = ref([{ id: 0, name: 'Periode Sekarang' }]);
const optionFilterCabang = ref<filterCabang[]>([]);
const selectedOptionPeriode = ref(0);
const selectedOptionCabang = ref(0);
const tanggalTransaksi = ref('');

const timeoutId = ref<number | null>(null);
const dataJurnal = ref<Jurnal[]>([]);
const isModalOpen = ref<boolean>(false);
const showNotification = ref<boolean>(false);
const showConfirmDialog = ref<boolean>(false);
const notificationMessage = ref<string>('');
const notificationType = ref<'success' | 'error'>('success');
const confirmMessage = ref<string>('');
const confirmTitle = ref<string>('');
const confirmAction = ref<(() => void) | null>(null);
const totalColumns = ref(9); // Default 3 kolom
const totalRow = ref(0);

const selectedJurnal = ref<Partial<Jurnal>>({ id: 0 });

const errors = ref<Errors>({
  kode: '',
  name: '',
});

const fetchFilter = async () => {
  const response = await getFilter();
  optionFilterPeriode.value = response.data.periode;
  optionFilterCabang.value = response.data.cabang;
  selectedOptionPeriode.value = response.data.periode[0].id;
  selectedOptionCabang.value = response.data.cabang[0].id;
  await fetch();
};

const fetch = async () => {
  const response = await daftarJurnal({
    tanggal_transaksi: tanggalTransaksi.value,
    periode: selectedOptionPeriode.value,
    cabang: selectedOptionCabang.value,
    perpage: itemsPerPage,
    pageNumber: currentPage.value,
  });
  totalPages.value = Math.ceil(response.total / itemsPerPage);
  dataJurnal.value = response.data;
  totalRow.value = response.total;
};

onMounted(async () => {
  await fetchFilter();
});

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

const deleteData = async (id: number) => {
  showConfirmation('Konfirmasi Hapus', 'Apakah Anda yakin ingin menghapus data ini?', async () => {
    try {
      const response = await deleteJurnal(id);
      showConfirmDialog.value = false;
      displayNotification(response.error_msg);
      fetch();
    } catch (error) {
      console.error('Error deleting data:', error);
      displayNotification('Terjadi kesalahan saat menghapus data.', 'error');
    }
  });
};
</script>

<template>
  <div class="container mx-auto p-4">
    <div class="flex justify-end items-center mb-4">
      <label for="search" class="block text-sm font-medium text-gray-700 mr-2">Filter</label>
      <div class="inline-flex rounded-md shadow-xs" role="group">
        <input
          v-model="tanggalTransaksi"
          @change="fetch()"
          type="date"
          placeholder="Cari log..."
          class="block w-64 px-3 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 mr-6"
        />
        <select
          v-model="selectedOptionPeriode"
          style="width: 300px"
          @change="fetch()"
          class="bg-white border-t border-b border-gray-300 text-gray-900 text-sm rounded-s-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
        >
          <option v-for="optionA in optionFilterPeriode" :key="optionA.id" :value="optionA.id">
            {{ optionA.name }}
          </option>
        </select>
        <select
          v-model="selectedOptionCabang"
          style="width: 300px"
          @change="fetch()"
          class="bg-white border-gray-300 text-gray-900 text-sm rounded-e-lg border-t border-b border-e focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
        >
          <option v-for="optionC in optionFilterCabang" :key="optionC.id" :value="optionC.id">
            {{ optionC.name }}
          </option>
        </select>
      </div>
    </div>
    <!-- Table data -->
    <div class="overflow-hidden rounded-lg border border-gray-200 shadow-md">
      <table class="w-full border-collapse bg-white text-left text-sm text-gray-500">
        <thead class="bg-gray-100">
          <tr>
            <th
              class="w-[10%] px-6 py-3 font-medium text-gray-900 border text-center align-bottom"
              rowspan="2"
            >
              Tanggal Transaksi
            </th>
            <th
              class="w-[15%] px-6 py-3 font-medium text-gray-900 border text-center align-bottom"
              rowspan="2"
            >
              Ref
            </th>
            <th
              class="w-[15%] px-6 py-3 font-medium text-gray-900 border text-center align-bottom"
              rowspan="2"
            >
              Keterangan
            </th>
            <th
              class="w-[40%] px-6 py-3 font-medium text-gray-900 border text-center align-bottom"
              colspan="4"
            >
              Akun
            </th>
            <th
              class="w-[15%] px-6 py-3 font-medium text-gray-900 border text-center align-bottom"
              rowspan="2"
            >
              Saldo
            </th>
            <th
              class="w-[5%] px-6 py-3 font-medium text-gray-900 border text-center align-bottom"
              rowspan="2"
            >
              Aksi
            </th>
          </tr>
          <tr>
            <th
              class="w-[20%] px-6 py-3 font-medium text-gray-900 border text-center align-bottom"
              colspan="2"
            >
              Debet
            </th>
            <th
              class="w-[20%] px-6 py-3 font-medium text-gray-900 border text-center align-bottom"
              colspan="2"
            >
              Kredit
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100 border-t border-gray-100">
          <template v-if="dataJurnal && dataJurnal.length > 0">
            <tr v-for="jurnal in dataJurnal" :key="jurnal.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 text-center">{{ jurnal.createdAt }}</td>
              <td class="px-6 py-4 text-center">{{ jurnal.ref }}</td>
              <td class="px-6 py-4 text-center">{{ jurnal.ket }}</td>
              <td class="px-6 py-4 text-center">
                {{ jurnal.akun_debet == null ? '-' : jurnal.akun_debet_name }}
              </td>
              <td class="px-6 py-4 text-center">
                {{ jurnal.akun_debet == null ? '-' : jurnal.akun_debet }}
              </td>
              <td class="px-6 py-4 text-center">
                {{ jurnal.akun_kredit == null ? '-' : jurnal.akun_kredit_name }}
              </td>
              <td class="px-6 py-4 text-center">
                {{ jurnal.akun_kredit == null ? '-' : jurnal.akun_kredit }}
              </td>
              <td class="px-6 py-4 text-center font-bold">{{ jurnal.saldo }}</td>
              <td class="px-6 py-4 text-center">
                <div v-if="jurnal.removable == 'true'" class="flex justify-center gap-2">
                  <DangerButton @click="deleteData(jurnal.id)">
                    <DeleteIcon></DeleteIcon>
                  </DangerButton>
                </div>
                <template v-else>
                  <span class="text-gray-500" style="font-size: 13px">
                    <i>Tidak dapat dihapus</i>
                  </span>
                </template>
              </td>
            </tr>
          </template>
          <tr v-else>
            <td colspan="9" class="px-6 py-4 text-center text-base text-gray-600">
              Daftar jurnal tidak ditemukan.
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

    <!-- Modal Form -->
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="transform scale-95 opacity-0"
      enter-to-class="transform scale-100 opacity-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="transform scale-100 opacity-100"
      leave-to-class="transform scale-95 opacity-0"
    >
      <div
        v-if="isModalOpen"
        class="fixed inset-0 z-50 overflow-y-auto"
        aria-labelledby="modal-title"
        role="dialog"
        aria-modal="true"
      >
        <div
          class="flex min-h-screen items-end justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0"
        >
          <div
            class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
            aria-hidden="true"
            @click="isModalOpen = false"
          ></div>
          <span class="hidden sm:inline-block sm:h-screen sm:align-middle" aria-hidden="true"
            >&#8203;</span
          >
          <div
            class="relative inline-block transform overflow-hidden rounded-lg bg-white text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:align-middle"
          >
            <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <h3 class="text-2xl flex justify-center font-bold leading-6 text-gray-900 mb-4">
                {{ selectedKota.id ? 'Edit Data Kota' : 'Tambah Kota Baru' }}
              </h3>
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Kode</label>
                  <input
                    v-model="selectedKota.kode"
                    type="text"
                    class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-600 font-normal"
                    placeholder="Kode Kota"
                  />
                  <p v-if="errors.kode" class="mt-1 text-sm text-red-600">{{ errors.kode }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Nama</label>
                  <input
                    v-model="selectedKota.name"
                    type="text"
                    class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-600 font-normal"
                    placeholder="Nama Kota"
                  />
                  <p v-if="errors.name" class="mt-1 text-sm text-red-600">{{ errors.name }}</p>
                </div>
              </div>
            </div>
            <div class="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
              <button
                @click="saveData"
                class="inline-flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
              >
                {{ selectedKota.id ? 'Simpan Perubahan' : 'Tambah' }}
              </button>
              <button
                @click="isModalOpen = false"
                class="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      </div>
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

    <!-- Notification Popup -->
    <Notification
      :showNotification="showNotification"
      :notificationType="notificationType"
      :notificationMessage="notificationMessage"
      @close="showNotification = false"
    ></Notification>
  </div>
</template>
