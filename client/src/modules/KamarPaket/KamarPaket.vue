<script setup lang="ts">
// Import Icon
import EditIcon from '@/modules/KamarPaket/Icon/EditIcon.vue';
import DeleteIcon from '@/modules/KamarPaket/Icon/DeleteIcon.vue';
import IconDownload from '@/modules/KamarPaket/Icon/IconDownload.vue';
import Pagination from '@/components/Pagination/Pagination.vue';
import PrimaryButton from '@/components/Button/PrimaryButton.vue';

// import element
import LightButton from '@/components/Button/LightButton.vue';
import DangerButton from '@/components/Button/DangerButton.vue';
import Notification from '@/modules/KamarPaket/Particle/Notification.vue';
import Confirmation from '@/modules/KamarPaket/Particle/Confirmation.vue';

// Import form pop-up
import FormAddUpdate from '@/modules/KamarPaket/Widget/FormAddUpdate.vue';
// import FormEdit from '@/modules/KamarPaket/Widget/FormEdit.vue'

import { getDaftarKamarPaket, deleteKamar } from '@/service/kamar_paket';
import { ref, onMounted, computed } from 'vue';

const props = defineProps<{
  paketId: number;
  cabangId: number;
}>();

// --- State ---
const itemsPerPage = 10;
const currentPage = ref(1);
const search = ref('');
const totalPages = ref(0);
const totalColumns = ref(5);
const totalRow = ref(0);
const isDeletingId = ref<number | null>(null); // <-- State untuk melacak ID yang sedang dihapus

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
const status = ref<string>('tutup');
const showNotification = ref<boolean>(false);
const notificationMessage = ref<string>('');
const notificationType = ref<'success' | 'error'>('success');
const confirmMessage = ref<string>('');
const confirmTitle = ref<string>('');
const confirmAction = ref<(() => void) | null>(null);
const kamarList = ref<Kamar[]>([]);
const isFormOpen = ref<boolean>(false);
const isLoading = ref<boolean>(false);
const id = ref<number>(0);

interface JamaahDetail {
  fullname: string;
  identity_number: string;
  tipe_paket: string;
}

interface Kamar {
  id: number;
  tipe_kamar: string;
  hotel_name: string;
  kapasitas_kamar: number;
  daftar_jamaah: JamaahDetail[];
  nama_kota: string;
}

const fetchData = async () => {
  try {
    isLoading.value = true;
    const response = await getDaftarKamarPaket({
      paketId: props.paketId,
      division_id: props.cabangId,
      search: search.value,
      perpage: itemsPerPage,
      pageNumber: currentPage.value,
    });

    if (response && response.error) {
      displayNotification(response.error_msg || 'Terjadi kesalahan saat mengambil data', 'error');
      return;
    }
    totalRow.value = response.total;
    status.value = response.status;
    totalPages.value = Math.ceil((response?.total || 0) / itemsPerPage);
    kamarList.value = response?.data || [];
  } catch (error) {
    console.error('Error fetching data:', error);
    if (error instanceof Error) {
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
  displayNotification(message, 'success');
  fetchData();
};

const showConfirmation = (title: string, message: string, action: () => void) => {
  confirmTitle.value = title;
  confirmMessage.value = message;
  confirmAction.value = action;
  showConfirmDialog.value = true;
};

const deleteItem = async (id: number) => {
  isDeletingId.value = id; // <-- Atur ID yang sedang dihapus
  try {
    const response = await deleteKamar(id);

    if (response && response.error) {
      displayNotification(response.message || 'Gagal menghapus data.', 'error');
    } else {
      displayNotification(response.message || 'Data kamar berhasil dihapus.', 'success');
      fetchData();
    }
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || 'Terjadi kesalahan saat menghapus data.';
    displayNotification(errorMessage, 'error');
  } finally {
    showConfirmDialog.value = false;
    isDeletingId.value = null; // <-- Reset ID setelah selesai
  }
};

const handleDelete = (id: number) => {
  showConfirmation('Konfirmasi Hapus', 'Apakah Anda yakin ingin menghapus data kamar ini?', () =>
    deleteItem(id),
  );
};

const handleEdit = (ids: number) => {
  id.value = ids;
  isFormOpen.value = true;
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

const handleDownload = () => {
  const url = '/download-daftar-kamar';
  window.open(url, '_blank');
};

const tabelutama = ref<HTMLTableElement | null>(null);
// --- Lifecycle Hook ---
onMounted(async () => {
  await fetchData();
  // totalColumns.value = tabelutama.value?.querySelectorAll(':scope > thead > tr > th:not(.hidden)').length
});
</script>

<template>
  <div class="container mx-auto p-4 min-h-screen">
    <div class="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-4">
      <div class="flex gap-2">
        <PrimaryButton @click="isFormOpen = true" v-if="status == 'buka'">
          <font-awesome-icon icon="fas fa-plus"></font-awesome-icon>
          <span class="text-base">Tambah Kamar</span>
        </PrimaryButton>
        <button
          type="button"
          @click="handleDownload"
          class="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md font-medium text-sm text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-25 transition ease-in-out duration-150"
        >
          <IconDownload class="w-5 h-5 mr-3" />
          <span class="text-base">Download Daftar Kamar</span>
        </button>
      </div>

      <div class="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
        <label for="search" class="text-sm font-medium text-gray-700">Filter:</label>
        <div class="relative w-full sm:w-72">
          <input
            type="text"
            id="search"
            class="w-full pl-3 pr-10 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            v-model="search"
            @input="fetchData"
            placeholder="Cari nama atau nomor id jamaah..."
            style="font-size: 0.875rem"
          />
        </div>
      </div>
    </div>

    <div class="overflow-x-auto rounded-lg border border-gray-200 shadow-md">
      <table
        ref="tabelutama"
        class="w-full border-collapse bg-white text-center text-sm justify-center text-gray-700"
      >
        <thead class="bg-gray-100">
          <tr>
            <th class="w-[25%] px-4 py-3 font-medium text-gray-900 text-sm">Tipe Kamar</th>
            <th class="w-[10%] px-4 py-3 font-medium text-gray-900 text-sm">Kapasitas Kamar</th>
            <th class="w-[35%] px-4 py-3 font-medium text-gray-900 text-sm">Daftar Jamaah</th>
            <th class="w-[15%] px-4 py-3 font-medium text-gray-900 text-sm">Nama Kota</th>
            <th class="w-[10%] px-4 py-3 font-medium text-center text-gray-900 text-sm">Aksi</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100 border-t border-gray-100">
          <tr v-if="isLoading">
            <td :colspan="totalColumns || 5" class="px-4 py-4 text-center">
              <div class="flex justify-center items-center py-8">
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            </td>
          </tr>
          <tr v-else-if="kamarList.length === 0">
            <td :colspan="totalColumns || 5" class="px-4 py-3 text-center text-gray-500">
              {{ search ? 'Data tidak ditemukan' : 'Daftar Kamar Tidak Ditemukan' }}
            </td>
          </tr>
          <tr
            v-for="item in kamarList"
            :key="item.id"
            class="hover:bg-gray-50 transition"
            :class="status == 'tutup' ? ' pointer-events-none opacity-50 ' : ''"
          >
            <td class="px-4 py-3 align-top">
              <div class="font-bold">{{ item.tipe_kamar }}</div>
              <div class="text-sm text-gray-500">(Hotel: {{ item.hotel_name }})</div>
            </td>
            <td class="px-4 py-3 align-top text-center">{{ item.kapasitas_kamar }} Orang</td>
            <td class="px-4 py-3 align-top">
              <div class="flex justify-center">
                <div class="text-left">
                  <ul v-if="item.daftar_jamaah.length > 0" class="space-y-3">
                    <li
                      v-for="jamaah in item.daftar_jamaah"
                      :key="jamaah.identity_number"
                      class="border-b border-gray-100 pb-2 last:border-b-0 flex gap-2"
                    >
                      <div class="flex-shrink-0 flex items-center justify-center mt-1">
                        <span class="text-gray-500">&#x1F464;</span>
                      </div>
                      <div class="flex-1">
                        <div class="font-medium text-gray-800 mb-1">{{ jamaah.fullname }}</div>
                        <ul class="text-sm text-gray-500 space-y-1">
                          <li>No. ID: {{ jamaah.identity_number }}</li>
                          <li>Tipe Paket: {{ jamaah.tipe_paket }}</li>
                        </ul>
                      </div>
                    </li>
                  </ul>
                  <span v-else class="text-gray-400 italic">Belum ada jamaah</span>
                </div>
              </div>
            </td>
            <td class="px-4 py-3 align-top">{{ item.nama_kota }}</td>
            <td class="px-4 py-3 flex items-start justify-center gap-2">
              <template v-if="status == 'buka'">
                <LightButton title="Edit" @click="handleEdit(item.id)">
                  <EditIcon class="h-4 w-4 text-gray-600" />
                </LightButton>
                <DangerButton
                  title="Delete"
                  @click="handleDelete(item.id)"
                  :disabled="isDeletingId === item.id"
                >
                  <span v-if="isDeletingId === item.id">
                    <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  </span>
                  <span v-else>
                    <DeleteIcon class="w-5 h-5" />
                  </span>
                </DangerButton>
              </template>
              <template v-else>
                <span class="italic">Paket ini sudah ditutup</span>
              </template>
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
    <Notification
      v-if="showNotification"
      :show-notification="showNotification"
      :notification-message="notificationMessage"
      :notification-type="notificationType"
      @close="showNotification = false"
    />
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
    <FormAddUpdate
      :isFormOpen="isFormOpen"
      :id="id"
      :cabang-id="props.cabangId"
      :paketId="props.paketId"
      @close="
        isFormOpen = false;
        id = 0;
      "
      @save-success="handleSaveSuccess"
      @show-notification="displayNotification"
    />
  </div>
</template>
