<script setup lang="ts">
// Import Icon
import DeleteIcon from '@/components/Icons/DeleteIcon.vue';
import EditIcon from '@/components/Icons/EditIcon.vue';
// import element
import DangerButton from '@/components/Button/DangerButton.vue';
import LightButton from '@/components/Button/LightButton.vue';
import Notification from '@/components/Modal/Notification.vue';
import Confirmation from '@/components/Modal/Confirmation.vue';
import PrimaryButton from '@/components/Button/PrimaryButton.vue';
import Pagination from '@/components/Pagination/Pagination.vue';
// import FormAddUpdate from '@/components/User/Modules/RiwayatTambahSaldoPerusahaan/widget/FormAddUpdate.vue';
import { ref, onMounted, computed } from 'vue';
import { list } from '@/service/riwayat_mutasi_saldo_perusahaan'; // Import function GET

interface MainInterface {
  id: number;
  transaction_code: string;
  nominal: number;
  type_transaction: string;
  ket: string;
  status: string;
  updatedAt: string;
}

const data = ref<MainInterface[]>([]);
const search = ref('');
const edit_id = ref(0);
const currentPage = ref(1);
const total = ref<number>(0);
const totalPages = ref(0);
const totalRow = ref(0);
const totalColumns = ref(7);
const itemsPerPage = 100;
const timeoutId = ref<number | null>(null);

const fetchData = async () => {
  try {
    const response = await list({
      search: search.value,
      perpage: itemsPerPage,
      pageNumber: currentPage.value,
    });
    totalPages.value = Math.ceil(response.total / itemsPerPage);
    data.value = response.data;
    totalRow.value = response.total;
  } catch (error) {
    displayNotification('Terjadi kesalahan saat mengambil data.', 'error');
  }
};

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

const notificationMessage = ref<string>('');
const notificationType = ref<'success' | 'error'>('success');
const showNotification = ref<boolean>(false);
const displayNotification = (message: string, type: 'success' | 'error' = 'success') => {
  notificationMessage.value = message;
  notificationType.value = type;
  showNotification.value = true;
  if (timeoutId.value) clearTimeout(timeoutId.value);
  timeoutId.value = window.setTimeout(() => {
    showNotification.value = false;
  }, 3000);
};

// confirmTitle="Konfirmasi Hapus"
//     confirmMessage="Apakah Anda yakin ingin menghapus pengguna ini?"
const confirmMessage = ref<string>('');
const confirmTitle = ref<string>('');
const showConfirmDialog = ref<boolean>(false);
const confirmAction = ref<(() => void) | null>(null);
const showConfirmation = (title: string, message: string, action: () => void) => {
  confirmTitle.value = title;
  confirmMessage.value = message;
  confirmAction.value = action;
  showConfirmDialog.value = true;
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

const isModalOpen = ref<boolean>(false);
const openModal = () => {
  isModalOpen.value = true;
};

// const deleteData = async (id: number) => {
//   showConfirmation('Konfirmasi Hapus', 'Apakah Anda yakin ingin menghapus data ini?', async () => {
//     try {
//       const response = await delete_deposit({ id: id });
//       showConfirmDialog.value = false;
//       displayNotification(response.error_msg);
//       fetchData();
//     } catch (error) {
//       console.error('Error deleting data:', error);
//       displayNotification('Terjadi kesalahan saat menghapus data.', 'error');
//     }
//   });
// };

// const sudahDikirim = async (id: number) => {
//   showConfirmation(
//     'Konfirmasi Pengiriman Dana Deposit',
//     'Apakah Anda yakin sudah mengirimkan Dana deposit anda?',
//     async () => {
//       try {
//         const response = await sudah_dikirim({ id: id });
//         showConfirmDialog.value = false;
//         displayNotification(response.error_msg);
//         fetchData();
//       } catch (error) {
//         console.error('Error deleting data:', error);
//         displayNotification('Terjadi kesalahan saat mengupdate data.', 'error');
//       }
//     },
//   );
// };

onMounted(async () => {
  await fetchData();
});
</script>
<template>
  <div class="container mx-auto p-4">
    <div class="flex justify-end mb-4">
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
    <div class="overflow-x-auto rounded-lg border border-gray-200 shadow-md">
      <table class="w-full border-collapse bg-white text-left text-sm text-gray-500">
        <thead class="bg-gray-100">
          <tr>
            <th class="w-[10%] px-6 py-4 font-medium text-gray-900 text-center">Kode</th>
            <th class="w-[15%] px-6 py-4 font-medium text-gray-900 text-center">Nominal</th>
            <th class="w-[15%] px-6 py-4 font-medium text-gray-900 text-center">Jenis Transaksi</th>
            <th class="w-[30%] px-6 py-4 font-medium text-gray-900 text-center">Ket</th>
            <th class="w-[15%] px-6 py-4 font-medium text-gray-900 text-center">Status</th>
            <th class="w-[15%] px-6 py-4 font-medium text-gray-900 text-center w-28">
              Tanggal Transaksi
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100 border-t border-gray-100">
          <template v-if="data.length > 0">
            <tr v-for="d in data" :key="d.id" class="hover:bg-gray-50 transition-colors">
              <td class="px-6 py-4 text-center align-top text-sm font-medium text-gray-700">
                <span class="font-bold">#{{ d.transaction_code }}</span>
              </td>
              <td class="px-6 py-4 text-center align-top space-y-2 text-sm text-gray-600">
                {{ formatRupiah(d.nominal) }}
              </td>
              <td class="px-6 py-4 text-center align-top space-y-2 text-sm text-gray-600">
                {{ d.type_transaction }}
              </td>
              <td class="px-6 py-4 text-center align-top space-y-2 text-sm text-gray-600">
                {{ d.ket }}
              </td>
              <td class="px-6 py-4 text-center align-top space-y-2 text-sm text-gray-600">
                {{ d.status }}
              </td>
              <td class="px-6 py-4 text-center align-top">
                {{ d.updatedAt }}
              </td>
            </tr>
          </template>
          <template v-else>
            <tr>
              <td colspan="6" class="px-2 py-2 text-center align-top">
                Daftar Riwayat Tambah Saldo Tidak Ditemukan
              </td>
            </tr>
          </template>
        </tbody>
        <tfoot class="bg-gray-100 font-bold">
          <Pagination
            :currentPage="currentPage"
            :totalPages="totalPages"
            :pages="pages"
            :totalColumns="totalColumns"
            @prev-page="prevPage"
            @next-page="nextPage"
            @page-now="pageNow"
            :totalRow="totalRow"
          />
        </tfoot>
      </table>
    </div>
  </div>

  <!-- <Confirmation
    :showConfirmDialog="showConfirmDialog"
    :confirmTitle="confirmTitle"
    :confirmMessage="confirmMessage"
  >
    <button
      @click="confirmAction?.()"
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
  </Confirmation> -->

  <Notification
    :showNotification="showNotification"
    :notificationType="notificationType"
    :notificationMessage="notificationMessage"
    @close="showNotification = false"
  ></Notification>

  <!-- <FormAddUpdate
    :id="edit_id"
    :isModalOpen="isModalOpen"
    @close="
      isModalOpen = false;
      fetchData();
    "
  /> -->
</template>
