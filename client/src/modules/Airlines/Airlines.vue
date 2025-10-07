<script setup lang="ts">
// Import Icon
import DeleteIcon from '@/components/Icons/DeleteIcon.vue';
import EditIcon from '@/modules/Airlines/Icon/EditIcon.vue';
// import element
import Form from '@/modules/Airlines/Widget/Form.vue';
import DangerButton from '@/components/Button/DangerButton.vue';
import Notification from '@/components/Modal/Notification.vue';
import Confirmation from '@/components/Modal/Confirmation.vue';
import LightButton from '@/components/Button/LightButton.vue';
import PrimaryButton from '@/components/Button/PrimaryButton.vue';
import Pagination from '@/components/Pagination/Pagination.vue';
// Import service API
import { daftarAirlines, deleteAirlines } from '@/service/airlines'; // Import function POST
import { ref, onMounted, computed } from 'vue';

const itemsPerPage = 100; // Jumlah airlines per halaman
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

interface DepositItem {
  cabang: string;
  deposit: string;
}

interface Airlines {
  id: number;
  name: string;
  nomor_akun_deposit: string;
  nomor_akun_pendapatan: string;
  nomor_akun_hpp: string;
  deposit: DepositItem[];
}

const timeoutId = ref<number | null>(null);
const dataAirlines = ref<Airlines[]>([]);
const total = ref<number>(0);
const isModalOpen = ref<boolean>(false);
const showNotification = ref<boolean>(false);
const showConfirmDialog = ref<boolean>(false);
const notificationMessage = ref<string>('');
const notificationType = ref<'success' | 'error'>('success');
const confirmMessage = ref<string>('');
const confirmTitle = ref<string>('');
const confirmAction = ref<(() => void) | null>(null);
const totalColumns = ref(6); // Default 3 kolom
const selectedAirlines = ref<Partial<Airlines>>({ name: '' });

const fetchData = async () => {
  try {
    const response = await daftarAirlines({
      search: search.value,
      perpage: itemsPerPage,
      pageNumber: currentPage.value,
    });

    totalPages.value = Math.ceil(response.total / itemsPerPage);
    dataAirlines.value = response.data;
    total.value = response.total;
  } catch (error) {
    displayNotification('Terjadi kesalahan saat mengambil data.', 'error');
  }
};

const openModal = (airlines?: Airlines) => {
  selectedAirlines.value = airlines ? { ...airlines } : { name: '' };
  isModalOpen.value = true;
};

onMounted(async () => {
  await fetchData();
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
      const response = await deleteAirlines(id);
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
        Tambah Maskapai
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
            <th class="w-[15%] px-6 py-4 font-medium font-bold text-gray-900 text-center">
              Nama Maskapai
            </th>
            <th class="w-[15%] px-6 py-4 font-medium font-bold text-gray-900 text-center">
              Nomor Akun Deposit
            </th>
            <th class="w-[15%] px-6 py-4 font-medium font-bold text-gray-900 text-center">
              Nomor Akun Pendapatan
            </th>
            <th class="w-[15%] px-6 py-4 font-medium font-bold text-gray-900 text-center">
              Nomor Akun HPP
            </th>
            <th class="w-[35%] px-6 py-4 font-medium font-bold text-gray-900 text-center">
              Deposit
            </th>
            <th class="w-[10%] px-6 py-4 font-medium font-bold text-gray-900 text-center">Aksi</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100 border-t border-gray-100">
          <template v-if="dataAirlines && dataAirlines.length > 0">
            <tr v-for="airlines in dataAirlines" :key="airlines.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 text-center">{{ airlines.name }}</td>
              <td class="px-6 py-4 text-center">{{ airlines.nomor_akun_deposit }}</td>
              <td class="px-6 py-4 text-center">{{ airlines.nomor_akun_pendapatan }}</td>
              <td class="px-6 py-4 text-center">{{ airlines.nomor_akun_hpp }}</td>
              <td class="px-6 py-4 text-center">
                <table class="w-full mb-0">
                  <tbody>
                    <tr
                      v-for="(value, index) in airlines.deposit"
                      :key="index"
                      class="border-gray-200 hover:bg-gray-200"
                    >
                      <td class="w-[65%] border-l border-t border-b px-6 py-2 text-left">
                        {{ value.cabang }}
                      </td>
                      <td class="w-[5%] text-center border-t border-b py-2">:</td>
                      <td class="border-r border-t border-b text-right space-y-2 text-sm px-2 py-2">
                        {{ value.deposit }}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>
              <td class="px-6 py-4 text-center">
                <div class="flex justify-center gap-2">
                  <LightButton @click="openModal(airlines)">
                    <EditIcon></EditIcon>
                  </LightButton>
                  <DangerButton @click="deleteData(airlines.id)">
                    <DeleteIcon></DeleteIcon>
                  </DangerButton>
                </div>
              </td>
            </tr>
          </template>
          <tr v-else>
            <td colspan="2" class="px-6 py-4 text-center text-base text-gray-600">
              Daftar maskapai tidak ditemukan.
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
        :is-modal-open="isModalOpen"
        :selected-airlines="selectedAirlines"
        @close="
          isModalOpen = false;
          fetchData();
        "
        @status="
          (payload) =>
            displayNotification(
              payload.err_msg || 'Tambah atau Update Airlines gagal',
              payload.error ? 'error' : 'success',
            )
        "
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
    <!-- Notification Popup -->
    <Notification
      :showNotification="showNotification"
      :notificationType="notificationType"
      :notificationMessage="notificationMessage"
      @close="showNotification = false"
    ></Notification>
  </div>
</template>
