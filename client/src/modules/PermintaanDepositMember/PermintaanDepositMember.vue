<script setup lang="ts">
import Notification from '@/modules/Headline/Particle/Notification.vue';
import Confirmation from '@/modules/Headline/Particle/Confirmation.vue';
import DeleteIcon from '@/modules/Headline/Icon/DeleteIcon.vue';
import Pagination from '@/components/Pagination/Pagination.vue';

import { ref, onMounted, computed } from 'vue';

import {
  getDaftarPermintaanDepositMember,
  updateStatusRequestDepositMember,
  deleteRequestDepositMember,
} from '@/service/permintaan_deposit_member';

const itemsPerPage = 10;
const currentPage = ref(1);
const search = ref('');
const totalPages = ref(0);
const total = ref<number>(0);
const totalColumns = ref(5);

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

interface DepositMember {
  id: number;
  member_name: string;
  member_identity: string;
  jumlah: number;
  code: number;
  status: 'disetujui' | 'ditolak' | 'diproses';
  status_note: string;
  petugas: string;
  bank_info: string;
  sending_payment_status: 'sudah_dikirim' | 'belum_dikirim';
}

const isLoading = ref(true);
const confirmMessage = ref<string>('');
const confirmTitle = ref<string>('');
const confirmAction = ref<(() => void) | null>(null);
const showConfirmDialog = ref<boolean>(false);
const showNotification = ref(false);
const notificationType = ref('');
const notificationMessage = ref('');
const dataDepositMember = ref<DepositMember[]>([]);

const fetchData = async () => {
  isLoading.value = true;
  try {
    const response = await getDaftarPermintaanDepositMember({
      search: search.value,
      perpage: itemsPerPage,
      pageNumber: currentPage.value,
    });
    dataDepositMember.value = response.data;
    total.value = response.total;
    totalPages.value = Math.ceil(response.total / itemsPerPage);
  } catch (error) {
    displayNotification('Gagal mengambil data', 'error');
  } finally {
    isLoading.value = false;
  }
};

let timeoutId: number | null = null;

const displayNotification = (message: string, type: 'success' | 'error' = 'success') => {
  notificationMessage.value = message;
  notificationType.value = type;
  showNotification.value = true;
  if (timeoutId) clearTimeout(timeoutId);
  timeoutId = window.setTimeout(() => {
    showNotification.value = false;
  }, 3000);
};

const showConfirmation = (title: string, message: string, action: () => void) => {
  confirmTitle.value = title;
  confirmMessage.value = message;
  confirmAction.value = action;
  showConfirmDialog.value = true;
};

const deletePermintaanDeposit = async (id: number) => {
  showConfirmation(
    'Konfirmasi Hapus',
    'Apakah Anda yakin ingin menghapus permintaan deposit ini?',
    async () => {
      try {
        const res = await deleteRequestDepositMember(id);
        displayNotification(
          res.data?.error_msg || res.data?.message || 'Permintaan deposit berhasil dihapus.',
          'success',
        );
        fetchData();
      } catch (error: any) {
        displayNotification(
          error.response?.data?.error_msg ||
            error.response?.data?.message ||
            'Gagal menghapus permintaan deposit',
          'error',
        );
      }
      showConfirmDialog.value = false;
    },
  );
};

const updateRequestDepositMemberStatus = async (id: number, status: string) => {
  if (status !== 'disetujui' && status !== 'ditolak') {
    displayNotification('Status hanya boleh di setujui atau tolak', 'error');
    return;
  }
  showConfirmation(
    'Konfirmasi Aksi',
    `Apakah Anda yakin ingin ${status == 'ditolak' ? 'MENOLAK' : 'MENYETUJUI'} permintaan deposit ini?`,
    async () => {
      try {
        const res = await updateStatusRequestDepositMember({
          id: id,
          status: status,
        });
        displayNotification(
          res.error_msg || res.message || `Permintaan deposit berhasil ${status}.`,
          'success',
        );
        fetchData();
      } catch (error: any) {
        displayNotification(
          error.response?.data?.error_msg ||
            error.response?.data?.message ||
            `Gagal ${status} permintaan deposit`,
          'error',
        );
      }
      showConfirmDialog.value = false;
    },
  );
};

onMounted(() => {
  fetchData();
});
</script>

<template>
  <div
    v-if="isLoading"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
  >
    <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-400"></div>
  </div>
  <div class="container mx-auto p-4">
    <div class="flex justify-end items-center mb-4">
      <div class="flex items-center">
        <label for="search" class="block text-sm font-medium text-gray-700 mr-2">Search</label>
        <input
          type="text"
          id="search"
          class="block w-64 px-3 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
          v-model="search"
          @change="fetchData()"
          placeholder="Cari nama atau no identitas..."
        />
      </div>
    </div>

    <div class="overflow-x-auto rounded-lg border border-gray-200 shadow-md">
      <table class="w-full bg-white text-left text-sm text-gray-700">
        <thead class="bg-gray-100">
          <tr>
            <th class="w-[25%] p-3 font-medium text-gray-900 text-left">Pemohon</th>
            <th class="w-[30%] p-3 font-medium text-gray-900 text-left">Detail Permintaan</th>
            <th class="w-[20%] p-3 font-medium text-gray-900 text-left">Bank Tujuan</th>
            <th class="w-[25%] p-3 font-medium text-gray-900 text-left">Status</th>
            <th class="w-[10%] p-3 font-medium text-gray-900 text-center">Aksi</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200">
          <template v-if="dataDepositMember.length > 0">
            <tr v-for="deposit in dataDepositMember" :key="deposit.id" class="hover:bg-gray-50">
              <td class="p-3 align-top">
                <p class="font-semibold">{{ deposit.member_name }}</p>
                <p class="text-sm text-gray-600">ID: {{ deposit.member_identity }}</p>
              </td>
              <td class="p-3 align-top">
                <p class="font-semibold text-green-600">Rp {{ deposit.jumlah.toLocaleString() }}</p>
                <p class="text-sm text-gray-600">Kode Unik: {{ deposit.code }}</p>
              </td>
              <td class="p-3 align-top">
                <p class="text-sm">{{ deposit.bank_info }}</p>
              </td>
              <td class="p-3 align-top">
                <div class="flex flex-col gap-1">
                  <div>
                    <span
                      v-if="deposit.status === 'disetujui'"
                      class="px-2 py-1 text-xs font-medium text-green-800 bg-green-100 rounded-full"
                      >Disetujui</span
                    >
                    <span
                      v-else-if="deposit.status === 'ditolak'"
                      class="px-2 py-1 text-xs font-medium text-red-800 bg-red-100 rounded-full"
                      >Ditolak</span
                    >
                    <span
                      v-else
                      class="px-2 py-1 text-xs font-medium text-yellow-800 bg-yellow-100 rounded-full"
                      >Diproses</span
                    >
                  </div>
                  <div>
                    <span
                      v-if="deposit.sending_payment_status === 'sudah_dikirim'"
                      class="px-2 py-1 text-xs font-medium text-blue-800 bg-blue-100 rounded-full"
                      >Sudah Dikirim</span
                    >
                    <span
                      v-else
                      class="px-2 py-1 text-xs font-medium text-gray-800 bg-gray-100 rounded-full"
                      >Belum Dikirim</span
                    >
                  </div>
                  <p
                    v-if="deposit.petugas && deposit.petugas !== '-'"
                    class="text-xs text-gray-500 mt-1"
                  >
                    Oleh: {{ deposit.petugas }}
                  </p>
                </div>
              </td>
              <td class="p-3 align-top text-center">
                <div class="flex justify-center items-center gap-2">
                  <button
                    v-if="deposit.status === 'diproses'"
                    @click="updateRequestDepositMemberStatus(deposit.id, 'disetujui')"
                    class="px-2 py-2 text-xs font-medium text-white bg-green-500 rounded-md hover:bg-green-600 transition-colors"
                    title="Setujui"
                  >
                    Setujui
                  </button>
                  <button
                    v-if="deposit.status === 'diproses'"
                    @click="updateRequestDepositMemberStatus(deposit.id, 'ditolak')"
                    class="px-2 py-2 text-xs font-medium text-white bg-red-500 rounded-md hover:bg-red-600 transition-colors"
                    title="Tolak"
                  >
                    Tolak
                  </button>
                  <button
                    v-if="deposit.status === 'diproses'"
                    @click="deletePermintaanDeposit(deposit.id)"
                    class="p-2 text-gray-500 bg-gray-100 rounded-md hover:bg-red-100 hover:text-red-500 transition-colors"
                    title="Hapus"
                  >
                    <DeleteIcon class="w-4 h-4" />
                  </button>
                  <span v-if="deposit.status !== 'diproses'" class="text-sm text-gray-400"
                    >Sudah Diproses</span
                  >
                </div>
              </td>
            </tr>
          </template>
          <tr v-else>
            <td :colspan="totalColumns" class="p-4 text-center text-gray-500">
              Daftar Permintaan tidak ditemukan.
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
            :totalRow="total"
          />
        </tfoot>
      </table>
    </div>
  </div>

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

  <Notification
    :showNotification="showNotification"
    :notificationType="notificationType"
    :notificationMessage="notificationMessage"
    @close="showNotification = false"
  ></Notification>
</template>
