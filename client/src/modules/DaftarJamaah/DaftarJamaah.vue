<script setup lang="ts">
import IconDownload from '@/components/Icons/IconDownload.vue';
import Confirmation from '@/modules/DaftarJamaah/Particle/Confirmation.vue';
import Notification from '@/modules/DaftarJamaah/Particle/Notification.vue';
import DeleteIcon from '@/modules/DaftarJamaah/Icon/DeleteIcon.vue';
import EditIcon from '@/modules/DaftarJamaah/Icon/EditIcon.vue';
import LightButton from '@/components/Button/LightButton.vue';
import PrimaryButton from '@/components/Button/PrimaryButton.vue';
import DangerButton from '@/components/Button/DangerButton.vue';
import Pagination from '@/components/Pagination/Pagination.vue';

import FormAddNew from '@/modules/DaftarJamaah/Particle/FormAddNew.vue';
import FormAddMember from '@/modules/DaftarJamaah/Particle/FormAddMember.vue';
import FormMember from '@/modules/DaftarJamaah/Particle/FormMember.vue';
import FormUpdate from '@/modules/DaftarJamaah/Particle/FormUpdate.vue';
import ModalConfirm from '@/modules/DaftarJamaah/Particle/ModalConfirm.vue';

import { ref, computed, onMounted } from 'vue';
import { daftarJamaah, deleteJamaah, getDownloadJamaah } from '@/service/daftar_jamaah';
import { paramCabang } from '@/service/param_cabang';

const itemsPerPage = 100; // Jumlah paket_la per halaman
const currentPage = ref(1);
const search = ref('');
const filterCabang = ref(0);
const optionFilterCabang = ref<filterCabang[]>([]);
const totalPages = ref(0);
const totalColumns = ref(3); // Default 3 kolom

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

interface filterCabang {
  id: number;
  name: string;
}

interface Jamaah {
  id: number;
  identity_number: string;
  nomor_passport: string;
  fullname: string;
  birth_place: string;
  birth_date: string;
}

const timeoutId = ref<number | null>(null);
const dataJamaah = ref<Jamaah[]>([]);
const divisionId = ref<number>(0);
const jamaahId = ref<number>(0);
const memberId = ref<number>(0);
const total = ref<number>(0);
const isLoading = ref<boolean>(false);
const isModalConfirmOpen = ref<boolean>(false);
const isFormAddMemberOpen = ref<boolean>(false);
const isFormAddOpen = ref<boolean>(false);
const isFormMemberOpen = ref<boolean>(false);
const isFormUpdateOpen = ref<boolean>(false);
const showConfirmDialog = ref<boolean>(false);
const showNotification = ref<boolean>(false);
const notificationMessage = ref<string>('');
const notificationType = ref<'success' | 'error'>('success');
const confirmMessage = ref<string>('');
const confirmTitle = ref<string>('');
const confirmAction = ref<(() => void) | null>(null);

const fetchData = async () => {
  try {
    isLoading.value = true;
    const response = await daftarJamaah({
      search: search.value,
      filterCabang: filterCabang.value,
      perpage: itemsPerPage,
      pageNumber: currentPage.value,
    });

    if (response.data.error || response.error) {
      displayNotification(response.error_msg, 'error');
      return;
    }

    totalPages.value = Math.ceil(response.total / itemsPerPage);
    dataJamaah.value = response.data || [];
    total.value = response.total;
  } catch (error: any) {
    displayNotification(
      error.response.data.error_msg || 'Terjadi kesalahan saat memuat data.',
      'error',
    );
  } finally {
    isLoading.value = false;
  }
};

const fetchDataCabang = async () => {
  const response = await paramCabang();
  optionFilterCabang.value = response.data;
  filterCabang.value = response.data[0].id;
};

const tabelutama = ref<HTMLTableElement | null>(null);

onMounted(async () => {
  await fetchDataCabang();
  await fetchData();
  totalColumns.value = tabelutama.value?.querySelectorAll(
    ':scope > thead > tr > th:not(.hidden)',
  ).length;
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

const openModalConfirm = () => {
  isModalConfirmOpen.value = true;
};

const openFormAdd = () => {
  isFormAddOpen.value = true;
};

const openFormAddMember = () => {
  isFormAddMemberOpen.value = true;
};

const openFormMember = (memId: number, divId: number) => {
  memberId.value = memId;
  divisionId.value = divId;
  console.log(memberId.value);
  isFormMemberOpen.value = true;
};

const downloadJamaah = async () => {
  try {
    const response = await getDownloadJamaah(filterCabang.value);
    console.log('Downloaded data:', response);
  } catch (error) {
    console.error('Error fetching Jamaah:', error);
  }
};

const handleFormUpdate = (id: number) => {
  jamaahId.value = id;
  isFormUpdateOpen.value = true;
};

const deleteData = async (jamaahId: number) => {
  showConfirmation('Konfirmasi Hapus', 'Apakah Anda yakin ingin menghapus data ini?', async () => {
    isLoading.value = true;
    try {
      const response = await deleteJamaah({
        id: jamaahId,
        division_id: filterCabang.value, // ✅
      });
      displayNotification(
        response.error_msg || response.message || 'Tabungan umrah berhasil dihapus!',
        'success',
      );
      fetchData();
    } catch (error) {
      displayNotification(
        error?.response?.data?.error_msg ||
          error?.response?.data?.message ||
          'Terjadi kesalahan dalam menghapus data',
        'error',
      );
    } finally {
      isLoading.value = false;
    }
  });
};
</script>

<template>
  <div class="container mx-auto p-4">
    <div class="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-4">
      <!-- Wrap tombol-tombol dalam satu flex container -->
      <div class="flex flex-wrap items-center gap-2">
        <!-- Button Tambah Jamaah -->
        <PrimaryButton @click="openModalConfirm()">
          <font-awesome-icon icon="fa-solid fa-plus"></font-awesome-icon>
          Tambah Jamaah
        </PrimaryButton>

        <!-- Button Download -->
        <PrimaryButton @click="downloadJamaah()">
          <IconDownload />
          Download Data Jamaah
        </PrimaryButton>
      </div>

      <!-- Search Input -->
      <div class="inline-flex rounded-md shadow-xs" role="group">
        <label for="search" class="block text-sm font-medium text-gray-700 mr-2 mt-3">Filter</label>
        <input
          type="text"
          id="search"
          class="block w-64 px-3 py-2 text-gray-700 bg-white border border-gray-300 rounded-s-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
          v-model="search"
          @change="fetchData()"
          placeholder="Cari data..."
        />
        <select
          v-model="filterCabang"
          style="width: 300px"
          @change="fetchData()"
          class="border-t border-b border-e bg-gray-50 border-gray-300 text-gray-900 text-sm rounded-e-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
        >
          <option v-for="optionC in optionFilterCabang" :key="optionC.id" :value="optionC.id">
            {{ optionC.name }}
          </option>
        </select>
        <!-- <label for="filter" class="block text-sm font-medium text-gray-700 mr-2">Filter</label>
        <select
          v-model="filterCabang"
          @change="fetchData()"
          class="block w-64 border-t border-b border-e bg-white border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
        >
          <option v-for="optionC in optionFilterCabang" :key="optionC.id" :value="optionC.id">
            {{ optionC.name }}
          </option>
        </select>
        <label for="search" class="text-sm font-medium text-gray-700">Search</label>
        <input
          type="text"
          id="search"
          class="w-full sm:w-72 px-3 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
          v-model="search"
          @change="fetchData()"
          placeholder="Cari berdasarkan nama..."
        /> -->
      </div>
    </div>
    <div class="overflow-x-auto rounded-lg border border-gray-200 shadow-md mb-5">
      <table
        ref="tabelutama"
        class="w-full border-collapse bg-white text-left text-sm text-gray-500"
      >
        <thead class="bg-gray-100">
          <tr>
            <th class="w-[15%] px-6 py-3 font-medium text-gray-900 text-center">Nomor Identitas</th>
            <th class="w-[25%] px-6 py-3 font-medium text-gray-900 text-center">Nama Jamaah</th>
            <th class="w-[25%] px-6 py-3 font-medium text-gray-900 text-center">Nomor Passport</th>
            <th class="w-[25%] px-6 py-3 font-medium text-gray-900 text-center">
              Tempat / Tanggal Lahir
            </th>
            <th class="w-[10%] px-6 py-3 font-medium text-gray-900 text-center">Aksi</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100 border-t border-gray-100">
          <!-- Loading State -->
          <tr v-if="isLoading">
            <td colspan="5" class="px-6 py-4 text-center">
              <div class="flex justify-center items-center py-8">
                <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-[#455494]"></div>
              </div>
            </td>
          </tr>

          <!-- Empty State -->
          <tr v-else-if="dataJamaah.length === 0">
            <td colspan="5" class="px-6 py-4 text-center text-sm text-gray-600">
              {{ search ? 'Hasil pencarian tidak ditemukan' : 'Daftar Jamaah Tidak Ditemukan' }}
            </td>
          </tr>

          <!-- Data Jamaah -->
          <tr
            v-for="jamaahs in dataJamaah"
            :key="jamaahs.id"
            class="hover:bg-gray-50 transition-colors"
          >
            <td class="px-6 py-4 text-center">{{ jamaahs.identity_number || '-' }}</td>
            <td class="px-6 py-4 text-center">{{ jamaahs.fullname || '-' }}</td>
            <td class="px-6 py-4 text-center">{{ jamaahs.nomor_passport || '-' }}</td>
            <td class="px-6 py-4 text-center">
              {{ `${jamaahs.birth_place} / ${jamaahs.birth_date}` || '-' }}
            </td>
            <td class="px-6 py-4 text-center">
              <div class="flex justify-center gap-2">
                <LightButton @click="handleFormUpdate(jamaahs.id)" title="Edit Jamaah"
                  ><EditIcon
                /></LightButton>
                <DangerButton @click="deleteData(jamaahs.id)" title="Print Invoice">
                  <DeleteIcon />
                </DangerButton>
              </div>
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
  </div>

  <FormAddNew
    v-if="isFormAddOpen"
    :is-form-add-open="isFormAddOpen"
    :cabang-id="filterCabang"
    @close="
      isFormAddOpen = false;
      fetchData();
    "
    @status="
      (payload) =>
        displayNotification(
          payload.err_msg || 'Jamaah gagal ditambahkan',
          payload.error ? 'error' : 'success',
        )
    "
  />

  <FormUpdate
    v-if="isFormUpdateOpen"
    :is-form-update-open="isFormUpdateOpen"
    :cabang-id="filterCabang"
    :jamaah-id="jamaahId"
    @close="
      isFormUpdateOpen = false;
      fetchData();
    "
    @status="
      (payload) =>
        displayNotification(
          payload.err_msg || 'Jamaah gagal diupdate',
          payload.error ? 'error' : 'success',
        )
    "
  />

  <FormAddMember
    v-if="isFormAddMemberOpen"
    :is-form-add-member-open="isFormAddMemberOpen"
    :cabang-id="filterCabang"
    @add-member="
      openFormMember($event.memberId, $event.division_id);
      isFormAddMemberOpen = false;
    "
    @close="
      isFormAddMemberOpen = false;
      fetchData();
    "
    @status="
      (payload) =>
        displayNotification(
          payload.err_msg || 'Jamaah dari Member gagal ditambahkan',
          payload.error ? 'error' : 'success',
        )
    "
  />

  <FormMember
    v-if="isFormMemberOpen"
    :is-form-member-open="isFormMemberOpen"
    :cabang-id="divisionId"
    :member-id="memberId"
    @close="
      isFormMemberOpen = false;
      fetchData();
    "
    @status="
      (payload) =>
        displayNotification(
          payload.err_msg || 'Jamaah dari Member gagal ditambahkan',
          payload.error ? 'error' : 'success',
        )
    "
  />

  <!-- Delete Confirmation Modal -->
  <Confirmation
    :showConfirmDialog="showConfirmDialog"
    :confirmTitle="confirmTitle"
    :confirmMessage="confirmMessage"
  >
    <button
      @click="
        confirmAction && confirmAction();
        showConfirmDialog = false;
      "
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

  <!-- Notification -->
  <Notification
    :showNotification="showNotification"
    :notificationType="notificationType"
    :notificationMessage="notificationMessage"
    @close="showNotification = false"
  />

  <ModalConfirm
    :is-modal-confirm-open="isModalConfirmOpen"
    @close="isModalConfirmOpen = false"
    @pilih-baru="
      isModalConfirmOpen = false;
      openFormAdd();
    "
    @pilih-member="
      isModalConfirmOpen = false;
      openFormAddMember();
    "
  />
</template>
