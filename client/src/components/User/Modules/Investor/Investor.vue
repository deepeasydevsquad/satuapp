<script setup lang="ts">
// Import Icon
import DeleteIcon from '@/components/User/Modules/Airlines/Icon/DeleteIcon.vue'
import EditIcon from '@/components/User/Modules/Airlines/Icon/EditIcon.vue'
// import element
import DangerButton from '@/components/User/Modules/Airlines/Particle/DangerButton.vue'
import Pagination from '@/components/Pagination/Pagination.vue'
import LightButton from "@/components/Button/LightButton.vue"
import FormAddUpdate from '@/components/User/Modules/Investor/Widget/FormAddUpdate.vue'
import Confirmation from '@/components/Modal/Confirmation.vue'
import Notification from '@/components/Modal/Notification.vue'

// Import service API
import { daftarInvestorAPI, deleteInvestorAPI,  infoEdit  } from '@/service/investor'; // Import function POST
import { paramCabang  } from '@/service/param_cabang'; // Import function POST

// paramCabang
import { ref, onMounted, computed } from 'vue';

const itemsPerPage = 100; // Jumlah airlines per halaman
const currentPage = ref(1);
const search = ref("");
const totalPages = ref(0);
const totalRow = ref(0);

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

interface ListCabang {
  id: number,
  name :string;
}

interface Investor {
  id: number;
  list_cabang:ListCabang;
  name: string;
  cabang_id:number;
  identity_number: string;
  mobile_phone: string;
  address: string;
  invesment: number;
  stock: number;
}

interface Errors {
  name: string;
}

interface filterCabang {
  id: number;
  name: string;
}

const timeoutId = ref<number | null>(null);
const dataInvestor = ref<Investor[]>([]);
const formData = ref<Partial<Investor>>({cabang_id:0});

const isModalOpen = ref<boolean>(false);
const showConfirmDialog = ref<boolean>(false);
const confirmMessage = ref<string>('');
const confirmTitle = ref<string>('');
const confirmAction = ref<(() => void) | null>(null);
const totalColumns = ref(5); // Default 3 kolom
const optionFilterCabang = ref<filterCabang[]>([]);
const selectedOptionCabang = ref(0);

// mengambil data daftar investor ke server
const fetchData = async() => {
  const response = await daftarInvestorAPI({search: search.value, perpage: itemsPerPage, pageNumber: currentPage.value, cabang:selectedOptionCabang.value});
  totalPages.value = Math.ceil(response.total / itemsPerPage)
  dataInvestor.value = response.data;
  totalRow.value = response.total;
}

// Menhapus data di variable formData
const removeFormData = async () => {
  formData.value = {}
}

const  AddInvestor = async () => {
  const response = await paramCabang();
  formData.value.list_cabang = response.data;
  formData.value.cabang_id = 0;
  isModalOpen.value = true;
}

const editInvestor = async (id:number) => {
  isModalOpen.value = true;
  const responseCabang = await paramCabang();
  const e = await infoEdit({id});
  formData.value = {
    id : e.data.id,
    list_cabang: responseCabang.data,
    name: e.data.name,
    cabang_id: e.data.cabang_id,
    identity_number: e.data.identity_number,
    mobile_phone: e.data.mobile_phone,
    address: e.data.address,
    invesment: e.data.invesment,
    stock: e.data.stock
  };
}

const fetchFilterData = async() => {
  const response = await paramCabang();
  optionFilterCabang.value = response.data;
  selectedOptionCabang.value = response.data[0].id;
  await fetchData();
}

onMounted(async () => {
  await fetchFilterData();
  totalColumns.value = 5
});

const showConfirmation = (title: string, message: string, action: () => void) => {
  confirmTitle.value = title;
  confirmMessage.value = message;
  confirmAction.value = action;
  showConfirmDialog.value = true;
};

const deleteInvestor = async (id: number) => {
  showConfirmation(
    'Konfirmasi Hapus',
    'Apakah Anda yakin ingin menghapus data ini?',
    async () => {
      try {
        const response = await deleteInvestorAPI(id);
        showConfirmDialog.value = false;
        displayNotification(response.error_msg);
        fetchData();
      } catch (error) {
        console.error('Error deleting data:', error);
        displayNotification('Terjadi kesalahan saat menghapus data.', 'error');
      }
    }
  );
};

const showNotification = ref<boolean>(false);
const notificationMessage = ref<string>('');
const notificationType = ref<'success' | 'error'>('success');

const displayNotification = (message: string, type: 'success' | 'error' = 'success') => {
  notificationMessage.value = message;
  notificationType.value = type;
  showNotification.value = true;
};

</script>

<template>
  <div class="container mx-auto p-4">
    <!-- Tambah data dan Search -->
    <div class="flex justify-between mb-4">
      <button
        @click="AddInvestor()"
        class="bg-[#455494] text-white px-4 py-2 rounded-lg hover:bg-[#3a477d] transition-colors duration-200 ease-in-out flex items-center gap-2" >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
        </svg>
        Tambah Investor
      </button>
      <div class="flex items-center">
        <label for="search" class="block text-sm font-medium text-gray-700 mr-2">Filter</label>
        <div class="inline-flex rounded-md shadow-xs" role="group">
          <input type="text" id="search" class="block w-64 px-3 py-2 text-gray-700 bg-white border border-gray-300 rounded-s-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            v-model="search" @change="fetchData()" placeholder="Cari data..." />
          <select  v-model="selectedOptionCabang" style="width: 300px;" @change="fetchData()" class="border-t border-b border-e bg-gray-50 border-gray-300 text-gray-900 text-sm rounded-e-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
              <option v-for="optionC in optionFilterCabang" :key="optionC.id" :value="optionC.id">
                {{ optionC.name }}
              </option>
          </select>
        </div>
      </div>
    </div>

    <!-- Table data -->
    <div class="overflow-hidden rounded-lg border border-gray-200 shadow-md">
      <table class="w-full border-collapse bg-white text-left text-sm text-gray-500">
        <thead class="bg-gray-100">
          <tr>
            <th class="w-[25%] px-6 py-3 font-medium font-bold text-gray-900 text-center">Nama & Nomor Identitas Investor</th>
            <th class="w-[25%] px-6 py-3 font-medium font-bold text-gray-900 text-center">Nomor Kontak & Alamat</th>
            <th class="w-[25%] px-6 py-3 font-medium font-bold text-gray-900 text-center">Investasi & Saham</th>
            <th class="w-[15%] px-6 py-3 font-medium font-bold text-gray-900 text-center">Cabang</th>
            <th class="w-[10%] px-6 py-3 font-medium font-bold text-gray-900 text-center">Aksi</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100 border-t border-gray-100">
          <template v-if="dataInvestor && dataInvestor.length > 0">
            <tr v-for="investor in dataInvestor" :key="investor.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 text-center">{{ investor.name }}<br> {{ investor.identity_number }}</td>
              <td class="px-6 py-4 text-center">{{ investor.mobile_phone }}<br> {{ investor.address }}</td>
              <td class="px-6 py-4 text-center">{{ investor.invesment }}<br> {{ investor.stock }}% Saham</td>
              <td class="px-6 py-4 text-center">{{ investor.cabang }}</td>
              <td class="px-6 py-4 text-center">
                <div class="flex justify-center gap-2">
                  <LightButton @click="editInvestor(investor.id)" class="p-2 "><EditIcon /></LightButton>
                  <DangerButton @click="deleteInvestor(investor.id)">
                    <DeleteIcon></DeleteIcon>
                  </DangerButton>
                </div>
              </td>
            </tr>
          </template>
          <tr v-else>
            <td colspan="5" class="px-6 py-3 text-center text-base text-gray-600">Daftar investor tidak ditemukan.</td>
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
              :totalRow = "totalRow"
            />
        </tfoot>
      </table>
    </div>
    <FormAddUpdate :isModalOpen="isModalOpen" :formData="formData" @close="isModalOpen = false; removeFormData() ; fetchData()"></FormAddUpdate>
    <Confirmation  :showConfirmDialog="showConfirmDialog"  :confirmTitle="confirmTitle" :confirmMessage="confirmMessage" >
      <button @click="confirmAction && confirmAction()"
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
  <!-- Notification Popup -->
  <Notification  :showNotification="showNotification"  :notificationType="notificationType" :notificationMessage="notificationMessage" @close="showNotification = false"  ></Notification>
</template>
