<script setup lang="ts">

// main elemen
import { ref, onMounted, computed } from 'vue';

// import service
import { paramCabang  } from '@/service/param_cabang';
import { listUrl, deleteUrl } from '@/service/kas_keluar_masuk';

// Import Icon Componen
import DeleteIcon from '@/components/Icons/DeleteIcon.vue'
import IconPlus from '@/components/Icons/IconPlus.vue'
import CetakIcon from '@/components/Icons/CetakIcon.vue'

// import Button Componen
import DangerButton from '@/components/Button/DangerButton.vue'
import LightButton from "@/components/Button/LightButton.vue"
import PrimaryButton from "@/components/Button/PrimaryButton.vue"

// import Modal Componen
import Notification from '@/components/Modal/Notification.vue'
import Confirmation from '@/components/Modal/Confirmation.vue'
import FormAddUpdate from '@/components/User/Modules/KasKeluarMasuk/Widget/FormAddUpdate.vue'

// import Feature Componen
import Pagination from '@/components/Pagination/Pagination.vue'

// interface inisialisasi
interface filterCabang {
  id: number;
  name: string;
}

interface Akun {
  name: string;
  nomor: string;
}

interface AkunTerlibat{
  akun_debet: Akun;
  akun_kredit: Akun;
}

interface KasKeluarMasuk {
  id: number;
  invoice: string;
  dibayar_diterima: string;
  petugas: string;
  status_kwitansi: string;
  tanggal_transaksi: string;
  details: AkunTerlibat[];
}

// variable inisialisasi
// pagination
const itemsPerPage = 100;
const currentPage = ref(1);
const search = ref("");
const totalPages = ref(0);
const total = ref<number>(0);
const selectedOptionCabang = ref(0);
const totalColumns = ref(6);
const totalRow = ref(0);
const optionFilterCabang = ref<filterCabang[]>([]);
const timeoutId = ref<number | null>(null);
const datas = ref<KasKeluarMasuk[]>([]);
const showAddUpdate = ref<boolean>(false);
const id = ref<number>(0);

// notification
const showNotification = ref<boolean>(false);
const showConfirmDialog = ref<boolean>(false);
const notificationMessage = ref<string>('');
const notificationType = ref<'success' | 'error'>('success');

// confirmation
const confirmMessage = ref<string>('');
const confirmTitle = ref<string>('');
const confirmAction = ref<(() => void) | null>(null);

// func inisialisasi
// Pagination
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

const fetchFilterData = async() => {
  const response = await paramCabang();
  optionFilterCabang.value = response.data;
  selectedOptionCabang.value = response.data[0].id;
  await fetchData();
}

const fetchData = async() => {
  const response = await listUrl(
    {
      cabang: selectedOptionCabang.value,
      search: search.value,
      perpage: itemsPerPage,
      pageNumber: currentPage.value
    });
  totalPages.value = Math.ceil(response.total / itemsPerPage)
  // total.value = response.total;
  totalRow.value= response.total;
  datas.value = response.data;
}

const addKasKeluarMasuk = () => {
  showAddUpdate.value = true;
};


async function deleteData(id: number) {
  showConfirmation(
    'Konfirmasi Hapus',
    'Apakah Anda yakin ingin menghapus data ini?',
    async () => {
      try {
        await deleteUrl({id : id})
        showConfirmDialog.value = false
        displayNotification('Data berhasil dihapus!', 'success')
        fetchData()
      } catch (error) {
        console.error('Error deleting data:', error)
        displayNotification(error?.response?.data?.error_msg, 'error')
      }
    }
  );
}

async function cetakInvoice(invoice: string) {
   const printUrl = `/invoice-kas-keluar-masuk/${invoice}`
   window.open(printUrl, '_blank')
}

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


const saveAddUpdateForm = async () => {
  fetchData();
  showAddUpdate.value = false;
  displayNotification('Transaksi Kas Keluar Masuk Berhasil Ditambahkan', 'success');
}

const closeForm = async () => {
  showAddUpdate.value = false;
}

onMounted(async () => {
  await fetchFilterData(); // Pastikan data sudah diambil sebelum menghitung jumlah kolom
});

</script>

<template>
  <div class="container mx-auto px-4 mt-10">
    <!-- Tambah data dan Search -->
    <div class="flex justify-between mb-6">
      <PrimaryButton @click="addKasKeluarMasuk()"><IconPlus/> Tambah Transaksi Keluar Masuk</PrimaryButton>
      <div class="flex items-center">
        <input v-model="search" type="text" placeholder="Cari Nomor Invoice..."
        class="block w-full px-3 py-2 text-gray-700 bg-white border border-gray-300 rounded-s-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200" />
        <select  v-model="selectedOptionCabang" style="width: 300px;" @change="fetchData()" class="border-t border-b border-e bg-gray-50 border-gray-300 text-gray-900 text-sm rounded-e-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
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
            <th class="w-[10%] px-6 py-3 font-medium text-gray-900 text-center">Nomor Invoice</th>
            <th class="w-[20%] px-6 py-3 font-medium text-gray-900 text-center">Dibayar/Diterima Dari</th>
            <th class="w-[30%] px-6 py-3 font-medium text-gray-900 text-center">Akun Terlibat</th>
            <th class="w-[15%] px-6 py-3 font-medium text-gray-900 text-center">Status Kwitansi</th>
            <th class="w-[15%] px-6 py-3 font-medium text-gray-900 text-center">Tanggal Transaksi</th>
            <th class="w-[10%] px-6 py-3 font-medium text-gray-900 text-center">Aksi</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100 border-t border-gray-100">
          <template v-if="datas && datas.length > 0">
            <tr v-for="data in datas" :key="data.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 text-center">{{ data.invoice }}</td>
              <td class="px-6 py-4 text-center">{{ data.dibayar_diterima }}</td>
              <td class="px-6 py-4 ">
                  <template v-for="(detail, index) in data.details" :key="index">
                      <div class="grid grid-cols-8 gap-3">
                        <div class="col-span-2">Akun Debet :</div>
                        <div class="col-span-1"><b>[{{ detail.akun_debet.nomor }}]</b></div>
                        <div class="col-span-5 px-2" >{{ detail.akun_debet.name }}</div>
                      </div>
                      <div class="grid grid-cols-8 gap-3 border-b pb-2">
                        <div class="col-span-2">Akun Kredit :</div>
                        <div class="col-span-1"><b>[{{ detail.akun_kredit.nomor }}]</b></div>
                        <div class="col-span-5 px-2">{{ detail.akun_kredit.name }}</div>
                      </div>
                  </template>
              </td>
              <td class="px-6 py-4 text-center">{{ data.status_kwitansi == 'masuk' ? 'MASUK' : 'KELUAR' }}</td>
              <td class="px-6 py-4 text-center">{{ data.tanggal_transaksi }}</td>
              <td class="px-6 py-4 text-center">
                <div class="flex justify-center gap-2">
                  <LightButton @click="cetakInvoice(data.invoice)">
                     <CetakIcon />
                  </LightButton>
                  <DangerButton @click="deleteData(data.id)">
                    <DeleteIcon></DeleteIcon>
                  </DangerButton>
                </div>
              </td>
            </tr>
          </template>
          <tr v-else>
            <td colspan="6" class="px-6 py-3 text-center text-sm text-gray-600">Daftar Transaksi Keluar Masuk Tidak Ditemukan.</td>
          </tr>
        </tbody>
        <tfoot class="bg-gray-100 font-bold">
          <Pagination :current-page="currentPage" :total-pages="totalPages" :pages="pages" :total-columns="totalColumns" @prev-page="prevPage" @next-page="nextPage" @page-now="pageNow" :totalRow="totalRow" />
        </tfoot>
      </table>
    </div>

    <!-- Modal Form -->
    <FormAddUpdate :showForm="showAddUpdate" :id="id"  @cancel="closeForm" @save="saveAddUpdateForm"/>

    <!-- Confirmation Dialog -->
    <Confirmation  :showConfirmDialog="showConfirmDialog"  :confirmTitle="confirmTitle" :confirmMessage="confirmMessage" >
      <button @click="confirmAction && confirmAction()" class="inline-flex w-full justify-center rounded-md border border-transparent bg-yellow-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm" >
        Ya
      </button>
      <button @click="showConfirmDialog = false" class="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
        Tidak
      </button>
    </Confirmation>

    <!-- Notification Popup -->
    <Notification  :showNotification="showNotification"  :notificationType="notificationType" :notificationMessage="notificationMessage" @close="showNotification = false"  ></Notification>
  </div>
</template>
