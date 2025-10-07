<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import {
  daftarMember,
  daftarCabang,
  getInfoEditMember,
  deleteMember as deleteMemberApi,
} from '@/service/member';
import { paramCabang } from '@/service/param_cabang';
import DeleteIcon from '@/modules/Member/Icon/DeleteIcon.vue';
import EditIcon from '@/modules/Member/Icon/EditIcon.vue';
import Pagination from '@/components/Pagination/Pagination.vue';
import Notification from '@/components/Modal/Notification.vue';
import Confirmation from '@/components/Modal/Confirmation.vue';
import LightButton from '@/components/Button/LightButton.vue';
import DangerButton from '@/components/Button/DangerButton.vue';
import PrimaryButton from '@/components/Button/PrimaryButton.vue';
import AddAgenIcon from '@/modules/Member/Icon/AddAgenIcon.vue';
import FormAddAgen from '@/modules/Member/Particle/FormAddAgen.vue';
import FormAddUpdate from '@/modules/Member/Particle/FormAddUpdate.vue';

interface Members {
  id: number;
  cabang_id: number;
  fullname: string;
  identity_number: string;
  identity_type: string;
  gender: string;
  photo: string;
  birth_date: string;
  birth_place: string;
  whatsapp_number: string;
  level_id: number;
  status_agen: boolean;
  status_jamaah: boolean;
  status_staff: boolean;
  cabang: string;
}

interface Cabang {
  id: number;
  name: string;
}

interface filterCabang {
  id: number;
  name: string;
}

// State
const data = ref<Partial<Members[]>>([]);

const formData = ref<Partial<Members>>({
  id: 0,
  cabang_id: 0,
  fullname: '',
  identity_number: '',
  identity_type: '0',
  gender: '0',
  photo: '',
  birth_date: '',
  birth_place: '',
  whatsapp_number: '',
  level_id: 0,
  status_agen: false,
  status_jamaah: false,
  status_staff: false,
  cabang: '',
});

const searchQuery = ref('');
const showForm = ref(false);
const showAgenForm = ref(false);
// Konfirmasi Variable
const showConfirmDialog = ref(false);
const confirmTitle = ref('');
const confirmMessage = ref('');
const confirmAction = ref(() => {});
// Notification Variable
const showNotification = ref(false);
const notificationType = ref('');
const notificationMessage = ref('');
// General Variable
const cabangs = ref<Cabang[]>([]);
// Pagination Variable
const itemsPerPage = 100; // Jumlah paket_la per halaman
const currentPage = ref(1);
const totalPages = ref(0);
const totalColumns = ref(7);
const search = ref('');
const filter = ref('');
const memberId = ref(0);
const memberName = ref('');
const memberIdentitas = ref('');
const selectedOptionCabang = ref(0);
const optionFilterCabang = ref<filterCabang[]>([]);

// Fetch data member
const fetchData = async () => {
  try {
    const response = await daftarMember({
      search: search.value,
      filter: filter.value,
      perpage: itemsPerPage,
      pageNumber: currentPage.value,
      cabang: selectedOptionCabang.value,
    });
    data.value = response.data;
    totalPages.value = Math.ceil(response.total / itemsPerPage);
  } catch (error) {
    console.error('Gagal fetch data member:', error);
    showNotification.value = true;
    notificationType.value = 'error';
    notificationMessage.value = 'Gagal fetch data member';
  }
};

const fetchFilterData = async () => {
  const response = await paramCabang();
  optionFilterCabang.value = response.data;
  selectedOptionCabang.value = response.data[0].id;
  await fetchData();
};

const fetchCabang = async () => {
  try {
    const response = await daftarCabang();
    cabangs.value = response.data;
  } catch (error) {
    console.error('Gagal fetch data cabang:', error);
  }
};

const fetchInfoEditMember = async (id: number) => {
  try {
    const response = await getInfoEditMember({ id });
    formData.value = response.data;
  } catch (error) {
    showNotification.value = true;
    notificationType.value = 'error';
    notificationMessage.value = 'Gagal fetch data member';
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

const tambahMember = () => {
  fetchCabang();
  showForm.value = true;
};

const editMember = (id: number) => {
  fetchCabang();
  fetchInfoEditMember(id);
  showForm.value = true;
};

const confirmDelete = (id: number) => {
  confirmTitle.value = 'Hapus Member';
  confirmMessage.value = 'Apakah Anda yakin ingin menghapus member ini?';
  confirmAction.value = async () => {
    try {
      await deleteMemberApi(id);
      fetchData();
      showConfirmDialog.value = false;
      showNotification.value = true;
      notificationType.value = 'success';
      notificationMessage.value = 'Member berhasil dihapus';
    } catch (error) {
      console.error('Gagal menghapus member:', error);
      showNotification.value = true;
      notificationType.value = 'error';
      notificationMessage.value = 'Gagal menghapus member';
    }
  };
  showConfirmDialog.value = true;
};

const closeAddForm = () => {
  showForm.value = false;
  formData.value = {
    id: 0,
    cabang_id: 0,
    fullname: '',
    identity_number: '',
    identity_type: '0',
    gender: '0',
    photo: '',
    birth_date: '',
    birth_place: '',
    whatsapp_number: '',
    status_agen: false,
    status_jamaah: false,
    status_staff: false,
    cabang: '',
  };

  fetchData();
};

const closeAgenFrom = () => {
  showAgenForm.value = false;
  fetchData();
};

onMounted(() => {
  fetchFilterData();
});

const addAgen = async (id: number, name: string, identity_number: string) => {
  showAgenForm.value = true;
  memberId.value = id;
  memberName.value = name;
  memberIdentitas.value = identity_number;
};
</script>

<template>
  <div class="container mx-auto p-4">
    <!-- Tambah data dan Search -->
    <div class="flex justify-between items-center mb-4">
      <PrimaryButton @click="tambahMember">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 4v16m8-8H4"
          />
        </svg>
        Tambah Member
      </PrimaryButton>
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
    <!-- Tabel Data -->
    <div class="overflow-hidden rounded-lg border border-gray-200 shadow-md mb-5">
      <table class="w-full border-collapse bg-white text-left text-sm text-gray-500">
        <thead class="bg-gray-50">
          <tr class="bg-gray-100">
            <th class="w-[20%] px-6 py-4 font-medium font-bold text-gray-900 text-center">Nama</th>
            <th class="w-[15%] px-6 py-4 font-medium font-bold text-gray-900 text-center">
              Nomor Identitas
            </th>
            <th class="w-[15%] px-6 py-4 font-medium font-bold text-gray-900 text-center">
              Jenis Kelamin
            </th>
            <th class="w-[15%] px-6 py-4 font-medium font-bold text-gray-900 text-center">
              WhatsApp
            </th>
            <th class="w-[15%] px-6 py-4 font-medium font-bold text-gray-900 text-center">
              Status
            </th>
            <th class="w-[10%] px-6 py-4 font-medium font-bold text-gray-900 text-center">
              Cabang
            </th>
            <th class="w-[10%] px-6 py-4 font-medium font-bold text-gray-900 text-center">Aksi</th>
          </tr>
        </thead>
        <tbody v-if="data.length" class="divide-y divide-gray-100 border-t border-gray-100">
          <tr v-for="member in data" :key="member?.id">
            <td class="px-6 py-4 text-center">{{ member?.fullname }}</td>
            <td class="px-6 py-4 text-center">{{ member?.identity_number }}</td>
            <td class="px-6 py-4 text-center">
              {{
                member?.gender === 'laki_laki'
                  ? 'Laki - Laki'
                  : member?.gender === 'perempuan'
                    ? 'Perempuan'
                    : '-'
              }}
            </td>
            <td class="px-6 py-4 text-center">{{ member?.whatsapp_number }}</td>
            <td class="px-6 py-4 text-center">
              <span
                class="bg-blue-100 text-blue-800 text-xs font-bold me-2 px-3 py-1.5 rounded-lg dark:bg-blue-900 dark:text-blue-300"
                >Member</span
              >
              <span
                v-if="member?.status_staff === true"
                class="bg-blue-100 text-blue-800 text-xs font-bold me-2 px-3 py-1.5 rounded-lg dark:bg-blue-900 dark:text-blue-300"
                >Staff</span
              >
              <span
                v-if="member?.status_agen === true"
                class="bg-blue-100 text-blue-800 text-xs font-bold me-2 px-3 py-1.5 rounded-lg dark:bg-blue-900 dark:text-blue-300"
                >Agen</span
              >
              <span
                v-if="member?.status_jamaah === true"
                class="bg-blue-100 text-blue-800 text-xs font-bold me-2 px-3 py-1.5 rounded-lg dark:bg-blue-900 dark:text-blue-300"
                >Jamaah</span
              >
            </td>
            <td class="px-6 py-4 text-center">{{ member?.cabang }}</td>
            <td class="px-6 py-4 text-right">
              <div class="flex justify-end gap-2">
                <LightButton @click="editMember(member!.id)" class="p-2"><EditIcon /></LightButton>
                <LightButton
                  v-if="member?.status_agen === false"
                  @click="addAgen(member.id, member?.fullname, member.identity_number)"
                  class="p-2"
                  ><AddAgenIcon
                /></LightButton>
                <DangerButton @click="confirmDelete(member!.id)" class="p-2"
                  ><DeleteIcon
                /></DangerButton>
              </div>
            </td>
          </tr>
        </tbody>
        <tbody v-else class="divide-y divide-gray-100 border-t border-gray-100">
          <tr>
            <td :colspan="totalColumns" class="px-6 py-4 text-center text-gray-500">
              Daftar Member Tidak di Temukan
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
      @click="confirmAction"
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
    :notificationType="'success'"
    :notificationMessage="'Data berhasil disimpan!'"
    @closeNotification="showNotification = false"
  />
  <!-- Form Add Update -->
  <FormAddUpdate
    :showForm="showForm"
    @cancel="closeAddForm"
    :cabangs="cabangs"
    :formData="formData"
  />
  <!-- Form Add Agen -->
  <FormAddAgen
    :showForm="showAgenForm"
    :memberId="memberId"
    :memberName="memberName"
    :memberIdentitas="memberIdentitas"
    @cancel="closeAgenFrom"
  />
</template>
