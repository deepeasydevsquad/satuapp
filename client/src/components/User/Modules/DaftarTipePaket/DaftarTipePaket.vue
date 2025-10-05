<script setup lang="ts">
import DeleteIcon from '@/components/User/Modules/DaftarTipePaket/Icon/DeleteIcon.vue'
import EditIcon from '@/components/User/Modules/DaftarTipePaket/Icon/EditIcon.vue'
import DangerButton from '@/components/User/Modules/DaftarTipePaket/Particle/DangerButton.vue'
import Notification from '@/components/User/Modules/DaftarTipePaket/Particle/Notification.vue'
import Confirmation from '@/components/User/Modules/DaftarTipePaket/Particle/Confirmation.vue'
import PrimaryButton from "@/components/Button/PrimaryButton.vue"
import LightButton from "@/components/Button/LightButton.vue"
import Pagination from '@/components/Pagination/Pagination.vue'
import Form from '@/components/Modal/Form.vue'

// Import service API
import { daftarTipePaket, addTipePaket, editTipePaket, deleteTipePaket } from '@/service/daftar_tipe_paket'; // Import function POST
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';

const itemsPerPage = 100; // Jumlah tipe_paket per halaman
const currentPage = ref(1);
const search = ref("");
const totalPages = ref(0);
const totalRow = ref(0);

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
    fetchData()
  }
};

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
    fetchData()
  }
};

const pageNow = (page : number) => {
  currentPage.value = page
  fetchData()
}

// Generate array angka halaman
const pages = computed(() => {
  return Array.from({ length: totalPages.value }, (_, i) => i + 1);
});

interface TipePaket {
  id: number;
  name: string;
}

interface Errors {
  name: string;
}

const timeoutId = ref<number | null>(null);
const dataTipePaket = ref<TipePaket[]>([]);
const isModalOpen = ref<boolean>(false);
const showNotification = ref<boolean>(false);
const showConfirmDialog = ref<boolean>(false);
const notificationMessage = ref<string>('');
const notificationType = ref<'success' | 'error'>('success');
const confirmMessage = ref<string>('');
const confirmTitle = ref<string>('');
const confirmAction = ref<(() => void) | null>(null);
const totalColumns = ref(2); // Default 3 kolom

const selectedTipePaket = ref<Partial<TipePaket>>({
  name: '',
});

const errors = ref<Errors>({
  name: '',
});

const fetchData = async () => {
  try {
    const response = await daftarTipePaket({ search: search.value, perpage: itemsPerPage, pageNumber: currentPage.value });
    totalPages.value = Math.ceil(response.total / itemsPerPage)
    totalRow.value = response.total;
    dataTipePaket.value = response.data;
  } catch (error) {
    console.error('Error fetching data:', error);
    displayNotification('Gagal mengambil data.', 'error');
  }
};

const openModal = (tipe_paket?: TipePaket) => {
  selectedTipePaket.value = tipe_paket
    ? { ...tipe_paket }
    : { name: '' };

  isModalOpen.value = true;
};

onMounted(async () => {
  await fetchData(); // Pastikan data sudah diambil sebelum menghitung jumlah kolom
  // totalColumns.value = document.querySelectorAll("thead th").length;
});

const validateForm = (): boolean => {
  errors.value = { name: '' };
  let isValid = true;

  if (!selectedTipePaket.value.name?.trim()) {
    errors.value.name = 'Nama tidak boleh kosong';
    isValid = false;
  }

  return isValid;
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

const saveData = async () => {
  if (!validateForm()) return;

  const isEdit = !!selectedTipePaket.value.id;
  const action = async () => {
    try {
      if (isEdit) {
        const response = await editTipePaket(selectedTipePaket.value.id, selectedTipePaket.value );
        showConfirmDialog.value = false;
        displayNotification(response.error_msg);
      } else {
        const response = await addTipePaket(selectedTipePaket.value);
        showConfirmDialog.value = false;
        displayNotification(response.error_msg);
      }
      isModalOpen.value = false;
      fetchData();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        displayNotification(error.response?.data?.error_msg || 'Terjadi kesalahan saat menyimpan data.', 'error');
      } else {
        displayNotification('Terjadi kesalahan yang tidak terduga.', 'error');
      }
      showConfirmDialog.value = false;
    }
  };

  isEdit ? showConfirmation('Konfirmasi Perubahan', 'Apakah Anda yakin ingin mengubah data ini?', action) : action();
};

const deleteData = async (id: number) => {
  showConfirmation(
    'Konfirmasi Hapus',
    'Apakah Anda yakin ingin menghapus data ini?',
    async () => {
      try {
        const response = await deleteTipePaket(id);
        showConfirmDialog.value = false;
        displayNotification(response.error_msg);
        fetchData();
      } catch (error) {
        console.error('Error deleting data:', error);
        displayNotification('Terjadi kesalahan saat menghapus data.', 'error');
      }
    }
  );
};

</script>

<template>
  <div class="container mx-auto px-4 mt-10">
    <!-- Tambah data dan Search -->
    <div class="flex justify-between items-center mb-6">
       <PrimaryButton @click="openModal()">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Tambah Tipe Paket
      </PrimaryButton>
      <div class="flex items-center">
        <label for="search" class="block text-sm font-medium text-gray-700 mr-2">Search</label>
        <input
          type="text"
          id="search"
          class="block w-64 px-3 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
          v-model="search"
          @change="fetchData()"
          placeholder="Cari data..."
        />
      </div>
    </div>
    <!-- Table data -->
    <div class="overflow-hidden rounded-lg border border-gray-200 shadow-md mb-5">
      <table class="w-full border-collapse bg-white text-left text-sm text-gray-500">
        <thead class="bg-gray-100">
          <tr>
            <th class="w-[90%] px-6 py-3 font-medium text-gray-900 text-center">Nama Tipe Paket</th>
            <th class="w-[10%] px-6 py-3 font-medium text-gray-900 text-center">Aksi</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100 border-t border-gray-100">
          <template v-if="dataTipePaket && dataTipePaket.length > 0">
            <tr v-for="tipe_paket in dataTipePaket" :key="tipe_paket.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 text-center">{{ tipe_paket.name }}</td>
              <td class="px-6 py-4 text-center">
                <div class="flex justify-center gap-2">
                  <LightButton   @click="openModal(tipe_paket)">
                    <EditIcon></EditIcon>
                  </LightButton>
                  <DangerButton @click="deleteData(tipe_paket.id)">
                    <DeleteIcon></DeleteIcon>
                  </DangerButton>
                </div>
              </td>
            </tr>
          </template>
          <tr v-else>
            <td colspan="2" class="px-6 py-4 text-center text-base text-gray-600">Daftar tipe paket tidak ditemukan.</td>
          </tr>
        </tbody>
        <tfoot class="bg-gray-100 font-bold">
          <Pagination :current-page="currentPage" :total-pages="totalPages" :pages="pages" :total-columns="totalColumns" @prev-page="prevPage" @next-page="nextPage" @page-now="pageNow" :totalRow = "totalRow" />
        </tfoot>
      </table>
    </div>

    <!-- Modal Form -->
    <Form :form-status="isModalOpen" :label="selectedTipePaket.id ? 'Edit Data Tipe Paket' : 'Tambah Tipe Paket Baru'" width="sm:w-full sm:max-w-md" @close="isModalOpen = false" @cancel="isModalOpen = false"  @submit="saveData" :submitLabel="selectedTipePaket.id ? 'SIMPAN PERUBAHAN' : 'TAMBAH'">
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Nama</label>
          <input
            v-model="selectedTipePaket.name"
            type="text"
            class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-600 font-normal"
            placeholder="Nama Tipe Paket"
          />
          <p v-if="errors.name" class="mt-1 text-sm text-red-600">{{ errors.name }}</p>
        </div>
      </div>
    </Form>

    <!-- Confirmation Dialog -->
    <Confirmation  :showConfirmDialog="showConfirmDialog"  :confirmTitle="confirmTitle" :confirmMessage="confirmMessage" >
      <button @click="confirmAction && confirmAction()"
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
    <Notification  :showNotification="showNotification"  :notificationType="notificationType" :notificationMessage="notificationMessage" @close="showNotification = false"  ></Notification>
  </div>
</template>
