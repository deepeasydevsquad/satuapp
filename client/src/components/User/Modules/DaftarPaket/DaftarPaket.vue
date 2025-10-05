<script setup lang="ts">
// Import Icon
import DeleteIcon from '@/components/User/Modules/DaftarPaket/Icon/DeleteIcon.vue'
import EditIcon from '@/components/User/Modules/DaftarPaket/Icon/EditIcon.vue'
import DetailIcon from '@/components/User/Modules/DaftarPaket/Icon/DetailIcon.vue'
import Pagination from '@/components/Pagination/Pagination.vue'

// import element
import Notification from '@/components/User/Modules/DaftarPaket/Particle/Notification.vue'
import Confirmation from '@/components/User/Modules/DaftarPaket/Particle/Confirmation.vue'

// import widget
import FormAdd from '@/components/User/Modules/DaftarPaket/Widget/FormAdd.vue'
import FormEdit from '@/components/User/Modules/DaftarPaket/Widget/FormEdit.vue'

// import component
import DetailPaket from '@/components/User/Modules/DetailPaket/DetailPaket.vue'

import LightButton from "@/components/Button/LightButton.vue"
import DangerButton from "@/components/Button/DangerButton.vue"
import PrimaryButton from "@/components/Button/PrimaryButton.vue"

// import API
import { daftarPaket, deletePaket } from '@/service/daftar_paket'
import { paramCabang } from '@/service/param_cabang'
import { ref, onMounted, computed } from 'vue';

const itemsPerPage = 100; // Jumlah paket_la per halaman
const currentPage = ref(1);
const totalPages = ref(0);
const search = ref('');
const filter = ref('');
const optionFilterCabang = ref<Cabang[]>([]);

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

interface Cabang {
  id: number;
  name: string
}

interface Paket {
  id: number;
  division_id: number;
  division_name: string;
  jenis_kegiatan: string;
  kode: string;
  photo: string;
  slug: string;
  name: string;
  description: string;
  departure_date: string;
  return_date: string;
  departure_from: number;
  duration_trip: number;
  mahram_fee: number;
  quota_jamaah: number;
  city_visited: string[];
  airlines: string[];
  hotel: string[];
  facilities: string[];
  show_homepage: boolean;
  airport_destination: number;
  airport_departure: number;
  departure_time: string;
  arrival_time: string;
  tutup_paket: string;
  provider_visa_id: number;
  provider_name: string | null;
  asuransi_id: number;
  asuransi_name: string | null;
  no_polis: string;
  tgl_input_polis: string;
  tgl_awal_polis: string;
  tgl_akhir_polis: string;
  prices: {
    id: number;
    paket_tipe: string;
    price: number;
  }[];
  status: string;
}


const filterCabang = ref(0);
const timeoutId = ref<number | null>(null);
const dataPaket = ref<Paket[]>([]);
const cabangId = ref<number>(0);
const isFormOpen = ref<boolean>(false);
const isFormOpenEdit = ref<boolean>(false);
const isPageDetailPaketOpen = ref<boolean>(false);
const isLoading = ref<boolean>(false);
const showConfirmDialog = ref<boolean>(false);
const showNotification = ref<boolean>(false);
const notificationMessage = ref<string>('');
const notificationType = ref<'success' | 'error'>('success');
const confirmMessage = ref<string>('');
const confirmTitle = ref<string>('');
const confirmAction = ref<(() => void) | null>(null);
const totalColumns = ref(7); // Default 3 kolom
const totalRow = ref(0);
const paket = ref<number>(0);
const paketName = ref<string>('');
const division_name = ref<string>('');

const fetchData = async () => {
  try {
    isLoading.value = true

    const response = await daftarPaket({
        division_id: filterCabang.value || 1,
        search: search.value,
        filter: filter.value,
        perpage: itemsPerPage,
        pageNumber: currentPage.value,
    });

    totalPages.value = Math.ceil(response.total / itemsPerPage);
    totalRow.value = response.total;
    dataPaket.value = response.data || []; // Ensure it assigns an array

    isLoading.value = false;
  } catch (error) {
      console.error('Error fetching data:', error);
      displayNotification('Gagal mengambil data.', 'error');
  }
};

const fetchDataCabang = async () => {
  const response = await paramCabang()
  optionFilterCabang.value = response.data
  filterCabang.value = response.data[0].id
}

onMounted(async () => {
  await fetchDataCabang();
  await fetchData(); // Pastikan data sudah diambil sebelum menghitung jumlah kolom
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

const openForm = () => {
  isFormOpen.value = true;
}

const openFormEdit = (paketId: number) => {
  isFormOpenEdit.value = true;
  paket.value = paketId;
}

const openDetailPaket = (paketId: number, division_id: number, divisionName: string, paket_name: string) => {
  paket.value = paketId;
  cabangId.value = division_id;
  division_name.value = divisionName;
  paketName.value = paket_name;
  isPageDetailPaketOpen.value = true;
}

const deleteData = async (id: number) => {
  showConfirmation(
    'Konfirmasi Hapus',
    'Apakah Anda yakin ingin menghapus data ini?',
    async () => {
      try {
        isLoading.value = true
        const response = await deletePaket(id, filterCabang.value);
        if (response.error) {
          displayNotification(response.error_msg, 'error');
          return;
        }
        showConfirmDialog.value = false;
        displayNotification(response.error_msg || "Operasi berhasil!", "success");
      } catch (error: any) {
        displayNotification(
          error?.response?.data?.error_msg ||
          error?.response?.data?.message ||
          'Terjadi kesalahan', 'error');
      } finally {
        isLoading.value = false
      }
    }
  );
};

const shortText = (teks:string, maxKarakter: number) => {
  if (!teks) return '';
  return teks.length > maxKarakter ? teks.slice(0, maxKarakter) + '...' : teks;
}
</script>

<template>
    <div v-if="isLoading" class="flex items-center justify-center">
      <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900"></div>
    </div>
    <!-- Form Add -->
    <div v-else-if="isFormOpen">
      <FormAdd
        :is-form-open="isFormOpen"
        :cabang-id="filterCabang"
        @close="isFormOpen = false; fetchData()"
        @status="(payload) => displayNotification(payload.err_msg || 'Paket gagal ditambahkan', payload.error ? 'error' : 'success')"
      />
    </div>

    <!-- Form Edit -->
    <div v-else-if="isFormOpenEdit">
      <FormEdit
        :is-form-open="isFormOpenEdit"
        :paket-id="paket"
        :cabang-id="filterCabang"
        @close="isFormOpenEdit = false; fetchData()"
        @status="(payload) => displayNotification(payload.err_msg || 'Paket gagal diubah', payload.error ? 'error' : 'success')"
      />
    </div>
    <div v-else-if="isPageDetailPaketOpen">

       <!-- division_name.value = divisionName;
  paketName.value = paket_name; -->

      <DetailPaket :isPageDetailPaketOpen="isPageDetailPaketOpen" :paket-id="paket" :cabang-id="filterCabang" :divisionName="division_name" :paketName="paketName" @closeDetailPaket="isPageDetailPaketOpen = false; fetchData()" />
    </div>
    <div v-else-if="dataPaket" class="container mx-auto px-4 mt-10">
      <div class="flex justify-between items-center mb-6">
        <PrimaryButton @click="openForm()">
          <font-awesome-icon :icon="['fas', 'plus']"></font-awesome-icon>
          Tambah Paket
        </PrimaryButton>

        <div class="flex items-center">
          <div class="flex items-center ml-4">
            <label for="search" class="block text-sm font-medium text-gray-700 mr-2">Search</label>
            <input
              type="text"
              id="search"
              class="block w-64 px-3 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 placeholder:text-gray-400"
              v-model="search"
              @change="fetchData()"
              placeholder="Nama Paket/Kode Paket"
            />
          </div>
          <div class="flex items-center ml-4">
            <label for="filter" class="block text-sm font-medium text-gray-700 mr-2">Filter</label>
            <select id="filter"
              class="block w-64 px-3 py-2 text-gray-700 bg-white border border-gray-300 rounded-s-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              v-model="filter" @change="fetchData()">
              <option value="" selected>Lihat Semua</option>
              <option value="sudah_berangkat">Sudah Berangkat</option>
              <option value="belum_berangkat">Belum Berangkat</option>
            </select>
            <select id="cabang"
              class="block w-64 px-3 py-2 text-gray-700 bg-white border-t border-b border-e border-gray-300 rounded-e-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              v-model="filterCabang" @change="fetchData()">
              <option v-for="cabang in optionFilterCabang" :key="cabang.id" :value="cabang.id">{{ cabang.name }}</option>
            </select>
          </div>
        </div>
      </div>
      <!-- Table data -->
      <div class="overflow-hidden rounded-lg border border-gray-200 shadow-md mb-5">
        <table class="w-full border-collapse bg-white text-left text-sm text-gray-500">
          <thead class="bg-gray-100">
            <tr>
              <th class="w-[20%] px-6 py-3 font-medium text-gray-900 text-center">Nama Paket</th>
              <th class="w-[15%] px-6 py-3 font-medium text-gray-900 text-center">Harga</th>
              <th class="w-[20%] px-6 py-3 font-medium text-gray-900 text-center">Deskripsi</th>
              <th class="w-[15%] px-6 py-3 font-medium text-gray-900 text-center">Tgl. Berangkat</th>
              <th class="w-[10%] px-6 py-3 font-medium text-gray-900 text-center">Tgl. Kembali</th>
              <th class="w-[10%] px-6 py-3 font-medium text-gray-900 text-center">Total Jamaah</th>
              <th class="w-[10%] px-6 py-3 font-medium text-gray-900 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100 border-t border-gray-100">
            <template v-if="dataPaket && dataPaket.length > 0">
              <tr v-for="paket in dataPaket" :key="paket.id" class="hover:bg-gray-50" >
                <td class="px-6 py-4 text-center" :class="paket.tutup_paket == 'tutup' ? ' pointer-events-none opacity-50 ' : '' ">
                  <strong>{{ paket.kode }} id : ({{ paket.id }}) </strong> -
                  <strong v-if="paket.jenis_kegiatan === 'umrah'">UMRAH</strong>
                  <strong v-else-if="paket.jenis_kegiatan === 'haji'">HAJI</strong>
                  <strong v-else-if="paket.jenis_kegiatan === 'haji_umrah'">HAJI DAN UMRAH</strong>
                  <br>{{ paket.name }}


                </td>
                <td class="px-0 py-4" :class="paket.tutup_paket == 'tutup' ? ' pointer-events-none opacity-50 ' : '' ">
                  <span class="absolute left-1/2 top-full -translate-x-1/2 -translate-y-1/2
                              bg-white px-4 py-2 rounded shadow text-gray-600">
                    Daftar Paket tidak ditemukan.
                  </span>
                  <ul class="list-disc list-inside text-sm">
                    <li v-for="(price, index) in paket.prices" :key="index">
                      {{ price.paket_tipe }}: Rp {{ price.price.toLocaleString() }}
                    </li>
                  </ul>
                </td>
                <td class="px-6 py-4" :class="paket.tutup_paket == 'tutup' ? ' pointer-events-none opacity-50 ' : '' ">{{ shortText( paket.description, 200 ) }}</td>
                <td class="px-6 py-4 text-center" :class="paket.tutup_paket == 'tutup' ? ' pointer-events-none opacity-50 ' : '' ">
                  {{ paket.departure_date }}
                  <br>
                  <br>
                  <span
                    :class="{
                      'text-red-500': paket.status === 'belum_berangkat',
                      'text-green-500': paket.status === 'sudah_berangkat'
                    }"
                  >
                    <strong>{{ paket.status === 'belum_berangkat' ? 'BELUM BERANGKAT' : 'SUDAH BERANGKAT' }}</strong>
                  </span>
                </td>
                <td class="px-6 py-4 text-left" :class="paket.tutup_paket == 'tutup' ? ' pointer-events-none opacity-50 ' : '' ">{{ paket.return_date }}</td>
                <td class="px-6 py-4 text-center" :class="paket.tutup_paket == 'tutup' ? ' pointer-events-none opacity-50 ' : '' ">{{ paket.quota_jamaah }} Orang</td>
                <td class="px-6 py-4 text-center">
                  <div class="flex justify-end gap-2">
                    <LightButton  @click="openDetailPaket(paket.id, paket.division_id, paket.division_name, paket.name)">
                      <DetailIcon></DetailIcon>
                    </LightButton>
                    <LightButton @click="openFormEdit(paket.id)" v-if="paket.tutup_paket == 'buka'">
                      <EditIcon></EditIcon>
                    </LightButton>
                    <DangerButton @click="deleteData(paket.id)" v-if="paket.tutup_paket == 'buka'">
                      <DeleteIcon></DeleteIcon>
                    </DangerButton>
                  </div>
                </td>
              </tr>
            </template>
            <tr v-else>
              <td colspan="7" class="px-6 py-4 text-center text-base text-gray-600">
                Daftar Paket tidak ditemukan.
              </td>
            </tr>
          </tbody>
          <tfoot class="bg-gray-100 font-bold">
            <Pagination
              :current-page="currentPage"
              :total-pages="totalPages"
              :pages="pages"
              :total-columns="totalColumns"
              :totalRow = "totalRow"
              @prev-page="prevPage"
              @next-page="nextPage"
              @page-now="pageNow"
            />
          </tfoot>
        </table>
      </div>
    </div>

  <!-- Confirmation Dialog -->
  <Confirmation
    :showConfirmDialog="showConfirmDialog"
    :confirmTitle="confirmTitle"
    :confirmMessage="confirmMessage"
  >
    <button @click="confirmAction && confirmAction()" class="inline-flex w-full justify-center rounded-md border border-transparent bg-yellow-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm">
      Ya
    </button>
    <button @click="showConfirmDialog = false" class="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
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
</template>

