<script setup lang="ts">
// Import Icon
import DeleteIcon from '@/components/User/Modules/Airlines/Icon/DeleteIcon.vue';
// import element
import DangerButton from '@/components/Button/DangerButton.vue';
import Notification from '@/components/Modal/Notification.vue';
import PrimaryButton from '@/components/Button/PrimaryButton.vue';
import Confirmation from '@/components/Modal/Confirmation.vue';
import Pagination from '@/components/Pagination/Pagination.vue';
import { ref, onMounted, computed } from 'vue';
import {
  riwayat_deposit_maskapai,
  delete_riwayat_deposit_maskapai,
} from '@/service/riwayat_deposit_maskapai'; // Import function POST
import { paramCabang } from '@/service/param_cabang';
import FormAddDeposit from './Widget/FormAddDeposit.vue';

interface MainInterface {
  id: number;
  invoice: string;
  nama_maskapai: string;
  nominal_deposit: string;
  tanggal_deposit: string;
}

interface filterCabang {
  id: number;
  name: string;
}

const data = ref<MainInterface[]>([]);
const search = ref('');
const currentPage = ref(1);
const total = ref<number>(0);
const totalPages = ref(0);
const totalColumns = ref(4);
const itemsPerPage = 100;

const timeoutId = ref<number | null>(null);
const showForm = ref(false);
const selectedOptionCabang = ref(0);
const optionFilterCabang = ref<filterCabang[]>([]);

const fetchData = async () => {
  try {
    const response = await riwayat_deposit_maskapai({
      cabang: selectedOptionCabang.value,
      search: search.value,
      perpage: itemsPerPage,
      pageNumber: currentPage.value,
    });

    totalPages.value = Math.ceil(response.total / itemsPerPage);
    data.value = response.data;
    total.value = response.total;
  } catch (error) {
    displayNotification('Terjadi kesalahan saat mengambil data.', 'error');
  }
};

const fetchFilterData = async () => {
  const response = await paramCabang();
  optionFilterCabang.value = response.data;
  selectedOptionCabang.value = response.data[0].id;
  await fetchData();
};

const deleteData = async (id: number) => {
  console.log('xxxxx----xxxxx');
  console.log(id);
  console.log('xxxxx----xxxxx');

  showConfirmation('Konfirmasi Hapus', 'Apakah Anda yakin ingin menghapus data ini?', async () => {
    try {
      const response = await delete_riwayat_deposit_maskapai({
        id: id,
        cabang: selectedOptionCabang.value,
      });
      if (response.error) {
        displayNotification(response.error_msg, 'error');
        return;
      }
      showConfirmDialog.value = false;
      displayNotification(response.error_msg || 'Operasi berhasil!', 'success');

      await fetchData();
    } catch (error: any) {
      displayNotification(
        error?.response?.data?.error_msg || error?.response?.data?.message || 'Terjadi kesalahan',
        'error',
      );
    }
  });
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

const addDepositModal = () => {
  showForm.value = true;
};

const closeAddForm = () => {
  showForm.value = false;
  fetchData();
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

onMounted(async () => {
  await fetchFilterData();
});
</script>
<template>
  <div class="container mx-auto p-4">
    <div class="flex justify-between mb-6">
      <PrimaryButton @click="addDepositModal()">
        <font-awesome-icon icon="fa-solid fa-plus"></font-awesome-icon>
        Tambah Deposit Maskapai
      </PrimaryButton>
      <div class="inline-flex rounded-md shadow-xs" role="group">
        <input
          type="text"
          id="search"
          class="block w-64 px-3 py-2 text-gray-700 bg-white border border-gray-300 rounded-s-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
          v-model="search"
          @input="fetchData"
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
    <div class="overflow-hidden rounded-lg border border-gray-200 shadow-md">
      <table class="w-full border-collapse bg-white text-left text-sm text-gray-500">
        <thead class="bg-gray-50">
          <tr>
            <th class="w-[30%] px-6 py-4 font-medium font-bold text-gray-900 text-center">
              Invoice
            </th>
            <th class="w-[30%] px-6 py-4 font-medium font-bold text-gray-900 text-center">
              Nama Maskapai
            </th>
            <th class="w-[30%] px-6 py-4 font-medium font-bold text-gray-900 text-center">
              Nominal Deposit
            </th>
            <th class="w-[10%] px-6 py-4 font-medium font-bold text-gray-900 text-center">Aksi</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100 border-t border-gray-100">
          <template v-if="data && data.length > 0">
            <tr v-for="item in data" :key="item.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 text-center">{{ item.invoice }}</td>
              <td class="px-6 py-4 text-center">{{ item.nama_maskapai }}</td>
              <td class="px-6 py-4 text-center">{{ formatRupiah(item.nominal_deposit) }}</td>
              <td class="px-6 py-4 text-center">
                <div class="flex justify-center gap-2">
                  <DangerButton @click="deleteData(item.id)">
                    <DeleteIcon></DeleteIcon>
                  </DangerButton>
                </div>
              </td>
            </tr>
          </template>
          <template v-else>
            <tr>
              <td colspan="4" class="px-6 py-4 text-center">
                Riwayat deposit maskapai tidak ditemukan.
              </td>
            </tr>
          </template>
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
    <!-- Notification Popup -->
    <Notification
      :showNotification="showNotification"
      :notificationType="notificationType"
      :notificationMessage="notificationMessage"
      @close="showNotification = false"
    ></Notification>
    <!-- Form Add Deposit -->
    <FormAddDeposit :showForm="showForm" @cancel="closeAddForm" />
    <!-- Konfirmasi -->
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
  </div>
</template>
