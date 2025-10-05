<script setup lang="ts">
// Import Icon
import DeleteIcon from '@/components/Icons/DeleteIcon.vue';
// import EditIcon from '@/components/User/Modules/Supplier/Icon/EditIcon.vue'
import EditIcon from '@/components/Icons/EditIcon.vue';
import PrimaryButton from '@/components/Button/PrimaryButton.vue';

// import element
import DangerButton from '@/components/User/Modules/Supplier/Particle/DangerButton.vue';
import LightButton from '@/components/Button/LightButton.vue';
import Notification from '@/components/User/Modules/Supplier/Particle/Notification.vue';
import Confirmation from '@/components/User/Modules/Supplier/Particle/Confirmation.vue';

// import widget componen
import Pagination from '@/components/Pagination/Pagination.vue';
import Form from '@/components/User/Modules/Supplier/Widget/Form.vue';

// Import service API
import { daftarSupplier, deleteSupplier } from '@/service/supplier'; // Import function POST
import { ref, onMounted, computed } from 'vue';

const itemsPerPage = 100; // Jumlah supplier per halaman
const currentPage = ref(1);
const search = ref('');
const totalPages = ref(0);

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

interface Supplier {
  id: number;
  name: string;
  address: string;
  bank: string;
  bank_id: number;
  nomor_rekening: string;
}

interface EditSupplier {
  id: number;
  name: string;
  address: string;
  bank_id: number;
  nomor_rekening: string;
}

const timeoutId = ref<number | null>(null);
const total = ref<number>(0);
const dataSupplier = ref<Supplier[]>([]);
const isModalOpen = ref<boolean>(false);
const showNotification = ref<boolean>(false);
const showConfirmDialog = ref<boolean>(false);
const notificationMessage = ref<string>('');
const notificationType = ref<'success' | 'error'>('success');
const confirmMessage = ref<string>('');
const confirmTitle = ref<string>('');
const confirmAction = ref<(() => void) | null>(null);
const totalColumns = ref(5);

const selectedSupplier = ref<Partial<EditSupplier>>({
  name: '',
  address: '',
  bank_id: 0,
  nomor_rekening: '',
});

const fetchData = async () => {
  try {
    const supplierResponse = await daftarSupplier({
      search: search.value,
      perpage: itemsPerPage,
      pageNumber: currentPage.value,
    });

    dataSupplier.value = supplierResponse?.data || [];
    total.value = supplierResponse?.total;
    totalPages.value = supplierResponse?.total
      ? Math.ceil(supplierResponse.total / itemsPerPage)
      : 0;
  } catch (error) {
    displayNotification('Terjadi kesalahan saat mengambil data.', 'error');
  }
};

const openModal = (supplier?: Supplier) => {
  selectedSupplier.value = supplier
    ? {
        ...{
          id: supplier.id,
          name: supplier.name,
          address: supplier.address,
          bank_id: supplier.bank_id,
          nomor_rekening: supplier.nomor_rekening,
        },
      }
    : { name: '', address: '', bank_id: 0, nomor_rekening: '' };
  isModalOpen.value = true;
};

onMounted(async () => {
  await fetchData(); // Pastikan data sudah diambil sebelum menghitung jumlah kolom
  totalColumns.value = document.querySelectorAll('thead th').length;
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
      const response = await deleteSupplier(id);
      showConfirmDialog.value = false;
      displayNotification(response.error_msg);
      fetchData();
    } catch (error) {
      displayNotification('Terjadi kesalahan saat menghapus data.', 'error');
    }
  });
};
</script>

<template>
  <div class="container mx-auto p-4">
    <!-- Tambah data dan Search -->
    <div class="flex justify-between mb-4">
      <PrimaryButton @click="openModal()">
        <font-awesome-icon icon="fa-solid fa-plus"></font-awesome-icon>
        Tambah Supplier
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
    <div class="overflow-hidden rounded-lg border border-gray-200 shadow-md">
      <table class="w-full border-collapse bg-white text-left text-sm text-gray-500">
        <thead class="bg-gray-50">
          <tr>
            <th class="w-[25%] px-6 py-4 font-medium font-bold text-gray-900 text-center">
              Nama Supplier
            </th>
            <th class="w-[30%] px-6 py-4 font-medium font-bold text-gray-900 text-center">
              Alamat
            </th>
            <th class="w-[15%] px-6 py-4 font-medium font-bold text-gray-900 text-center">Bank</th>
            <th class="w-[20%] px-6 py-4 font-medium font-bold text-gray-900 text-center">
              Nomor Rekening
            </th>
            <th class="w-[10%] px-6 py-4 font-medium font-bold text-gray-900 text-center">Aksi</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100 border-t border-gray-100">
          <template v-if="dataSupplier && dataSupplier.length > 0">
            <tr v-for="supplier in dataSupplier" :key="supplier.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 text-center">{{ supplier.name }}</td>
              <td class="px-6 py-4 text-center">{{ supplier.address }}</td>
              <td class="px-6 py-4 text-center">{{ supplier.bank }}</td>
              <td class="px-6 py-4 text-center">{{ supplier.nomor_rekening }}</td>
              <td class="px-6 py-4 text-center">
                <div class="flex justify-center gap-2">
                  <LightButton @click="openModal(supplier)">
                    <EditIcon></EditIcon>
                  </LightButton>
                  <DangerButton @click="deleteData(supplier.id)">
                    <DeleteIcon></DeleteIcon>
                  </DangerButton>
                </div>
              </td>
            </tr>
          </template>
          <tr v-else>
            <td colspan="5" class="px-6 py-4 text-center text-base text-gray-600">
              Daftar supplier tidak ditemukan.
            </td>
          </tr>
        </tbody>
        <tfoot class="bg-gray-100 font-bold">
          <Pagination
            :current-page="currentPage"
            :total-pages="totalPages"
            :pages="pages"
            :total-columns="totalColumns"
            :total-row="total"
            @prev-page="prevPage"
            @next-page="nextPage"
            @page-now="pageNow"
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
      <Form
        v-if="isModalOpen"
        :isModalOpen="isModalOpen"
        :selectedSupplier="selectedSupplier"
        @close="
          isModalOpen = false;
          fetchData();
        "
        @status="
          (payload) =>
            displayNotification(
              payload.err_msg || 'Tambah atau Update Supplier gagal',
              payload.error ? 'error' : 'success',
            )
        "
      />
    </Transition>
  </div>
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
</template>
