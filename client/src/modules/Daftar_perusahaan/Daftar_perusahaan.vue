<script setup lang="ts">
import PrimaryButton from '@/components/Button/PrimaryButton.vue';
import DangerButton from '@/components/Button/DangerButton.vue';
import DeleteIcon from '@/components/Icons/DeleteIcon.vue';
import EditIcon from '@/components/Icons/EditIcon.vue';
import LightButton from '@/components/Button/LightButton.vue';
import Notification from '@/components/Modal/Notification.vue';
import Confirmation from '@/components/Modal/Confirmation.vue';
import FormAddUpdate from './Widget/FormAddUpdate.vue';
import FormAddDurasi from './Widget/FormAddDurasi.vue';
import { ref, computed, onMounted } from 'vue';
import { list, deletes } from '@/service/daftar_perusahaan'; // Import function POST
import Pagination from '@/components/Pagination/Pagination.vue';
import FormAddSaldo from './Widget/FormAddSaldo.vue';

interface Company {
  id: number;
  code: string;
  company_name: string;
  email: string;
  type: string;
  verify_status: string;
  verify_time: string;
  whatsapp_company_number: string;
  start_subscribtion: string;
  end_subscribtion: string;
  saldo: number;
  address: string;
}

const data = ref<Company[]>([]);
const notificationMessage = ref<string>('');
const notificationType = ref<'success' | 'error'>('success');
const showNotification = ref<boolean>(false);
const timeoutId = ref<number | null>(null);

const displayNotification = (message: string, type: 'success' | 'error' = 'success') => {
  notificationMessage.value = message;
  notificationType.value = type;
  showNotification.value = true;
  if (timeoutId.value) clearTimeout(timeoutId.value);
  timeoutId.value = window.setTimeout(() => {
    showNotification.value = false;
  }, 3000);
};

const id = ref(0);
const itemsPerPage = 100; // Jumlah airlines per halaman
const currentPage = ref(1);
const search = ref('');
const totalPages = ref(0);
const total = ref<number>(0);
const totalColumns = ref(7); // Default 3 kolom
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

const fetchData = async () => {
  try {
    const response = await list({
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

const modalAddPerusahaan = ref<boolean>(false);
const addPerusahaan = async () => {
  modalAddPerusahaan.value = true;
};

const editData = async (ids: number) => {
  id.value = ids;
  modalAddPerusahaan.value = true;
};

const modalAddDurasi = ref<boolean>(false);
const addDurasi = async (ids: number) => {
  id.value = ids;
  modalAddDurasi.value = true;
};

const modalAddSaldo = ref<boolean>(false);
const addSaldo = async (ids: number) => {
  id.value = ids;
  modalAddSaldo.value = true;
};

const confirmMessage = ref<string>('');
const confirmTitle = ref<string>('');
const confirmAction = ref<(() => void) | null>(null);
const showConfirmDialog = ref<boolean>(false);
const showConfirmation = (title: string, message: string, action: () => void) => {
  confirmTitle.value = title;
  confirmMessage.value = message;
  confirmAction.value = action;
  showConfirmDialog.value = true;
};

const deleteData = async (id: number) => {
  showConfirmation('Konfirmasi Hapus', 'Apakah Anda yakin ingin menghapus data ini?', async () => {
    try {
      const response = await deletes({ id });
      showConfirmDialog.value = false;
      displayNotification(response.error_msg);
      fetchData();
    } catch (error) {
      displayNotification('Terjadi kesalahan saat menghapus data.', 'error');
    }
  });
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
  await fetchData();
});
</script>

<template>
  <div class="container mx-auto p-4">
    <div class="flex justify-between mb-4">
      <PrimaryButton @click="addPerusahaan()">
        <font-awesome-icon icon="fa-solid fa-plus"></font-awesome-icon>
        Tambah Perusahaan
      </PrimaryButton>
      <div class="flex items-center">
        <label for="search" class="block text-sm font-medium text-gray-700 mr-2">Search</label>
        <input
          type="text"
          id="search"
          class="block w-64 px-3 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
          v-model="search"
          @change="fetchData()"
          placeholder="Kode / Nama Perusahaan"
        />
      </div>
    </div>
    <div class="overflow-hidden rounded-lg border border-gray-200 shadow-md mb-5">
      <table class="w-full border-collapse bg-white text-left text-sm text-gray-500">
        <thead class="bg-gray-50">
          <tr>
            <th class="w-[20%] px-6 py-4 font-medium font-bold text-gray-900 text-center">
              Info Perusahaan
            </th>
            <th class="w-[15%] px-6 py-4 font-medium font-bold text-gray-900 text-center">
              Whatsapp
            </th>
            <th class="w-[15%] px-6 py-4 font-medium font-bold text-gray-900 text-center">Email</th>
            <th class="w-[20%] px-6 py-4 font-medium font-bold text-gray-900 text-center">
              Berlangganan
            </th>
            <th class="w-[10%] px-6 py-4 font-medium font-bold text-gray-900 text-center">Saldo</th>
            <th class="w-[20%] px-6 py-4 font-medium font-bold text-gray-900 text-center">Aksi</th>
          </tr>
        </thead>
        <tbody class="text-sm">
          <template v-if="data && data.length > 0">
            <tr v-for="dat in data" :key="dat.id">
              <td class="px-6 py-4 text-left">
                <b>#{{ dat.code }}</b>
                <br />
                {{ dat.company_name }}
                <br />
                <span v-if="dat.type == 'limited'" class="font-bold text-orange-500 uppercase">{{
                  dat.type
                }}</span>
                <span v-if="dat.type == 'unlimited'" class="font-bold text-blue-500 uppercase">{{
                  dat.type
                }}</span>
              </td>
              <td class="px-6 py-4 text-center">{{ dat.whatsapp_company_number }}</td>
              <td class="px-6 py-4 text-center">{{ dat.email }}</td>
              <td class="px-6 py-4 text-left">
                <b>Mulai :</b> {{ dat.start_subscribtion }}<br />
                <b>Berakhir :</b> {{ dat.end_subscribtion == '' ? '-' : dat.end_subscribtion
                }}<br />
              </td>
              <td class="px-6 py-4 text-center">{{ formatRupiah(dat.saldo) }}</td>
              <td class="px-6 py-4 text-center">
                <div class="flex justify-center gap-2">
                  <LightButton @click="addDurasi(dat.id)" title="Tambah waktu berlangganan">
                    <font-awesome-icon icon="fa-solid fa-plus" />
                  </LightButton>
                  <LightButton @click="addSaldo(dat.id)" title="Tambah saldo perusahaan">
                    <font-awesome-icon icon="fa-solid fa-money-bill-wave" />
                  </LightButton>
                  <LightButton @click="editData(dat.id)" title="Edit info perusahaan">
                    <EditIcon></EditIcon>
                  </LightButton>
                  <DangerButton @click="deleteData(dat.id)" title="Delete perusahaan">
                    <DeleteIcon></DeleteIcon>
                  </DangerButton>
                </div>
              </td>
            </tr>
          </template>
          <template v-else>
            <tr>
              <td :colspan="totalColumns" class="px-6 py-4 text-center text-base text-gray-600">
                Daftar Perusahaan Tidak Ditemukan
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
  </div>
  <FormAddUpdate
    :isModalOpen="modalAddPerusahaan"
    :id="id"
    @close="
      modalAddPerusahaan = false;
      fetchData();
      id = 0;
    "
  ></FormAddUpdate>
  <FormAddDurasi
    :isModalOpen="modalAddDurasi"
    :id="id"
    @close="
      modalAddDurasi = false;
      fetchData();
      id = 0;
    "
  ></FormAddDurasi>
  <FormAddSaldo
    :isModalOpen="modalAddSaldo"
    :id="id"
    @close="
      modalAddSaldo = false;
      fetchData();
      id = 0;
    "
  ></FormAddSaldo>
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
