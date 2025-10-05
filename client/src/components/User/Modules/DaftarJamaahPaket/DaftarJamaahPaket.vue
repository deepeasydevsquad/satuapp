<script setup lang="ts">
// Import Icon
import CetakIcon from '@/components/Icons/CetakIcon.vue';
import HandoverBarangIcon from '@/components/User/Modules/DaftarJamaahPaket/Icon/HandoverBarangIcon.vue';
import HandoverIcon from '@/components/User/Modules/DaftarJamaahPaket/Icon/HandoverIcon.vue';
import DownloadIcon from '@/components/User/Modules/DaftarJamaahPaket/Icon/DownloadIcon.vue';

// import element
import LightButton from '@/components/User/Modules/DaftarJamaahPaket/Particle/LightButton.vue';
import Notification from '@/components/User/Modules/DaftarJamaahPaket/Particle/Notification.vue';

// import widget
import FormDownloadAbsensi from '@/components/User/Modules/DaftarJamaahPaket/Widgets/FormDownloadAbsensi.vue';
import FormCetakDataJamaah from '@/components/User/Modules/DaftarJamaahPaket/Widgets/FormCetakDataJamaah.vue';
import FormHandoverFasilitas from '@/components/User/Modules/DaftarJamaahPaket/Widgets/FormHandoverFasilitas.vue';
import FormOpsiHandoverBarang from '@/components/User/Modules/DaftarJamaahPaket/Widgets/FormOpsiHandoverBarang.vue';
import FormTerimaBarang from '@/components/User/Modules/DaftarJamaahPaket/Widgets/FormTerimaBarang.vue';
import FormPengembalianBarang from '@/components/User/Modules/DaftarJamaahPaket/Widgets/FormPengembalianBarang.vue';

import Pagination from '@/components/Pagination/Pagination.vue';

// Import service API
import { daftarJamaahPaket } from '@/service/daftar_jamaah_paket';
import { ref, onMounted, computed } from 'vue';

const props = defineProps<{
  paketId: number;
  cabangId: number;
}>();

const isLoading = ref(false);
const itemsPerPage = 100; // Jumlah daftar transaksi per halaman
const currentPage = ref(1);
const search = ref('');
const totalPages = ref(0);
const timeoutId = ref<number | null>(null);

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
interface PaketJamaah {
  id: number;
  kode: string;
  name: string;
  type: string;
  price: number;
  jamaah_id: number;
  fullname: string;
  identity_number: string;
  mahram: {
    id: number;
    mahram_type: string;
    fullname: string;
  }[];
  handover_barang: {
    id: number;
    name: string;
  }[];
  handover_fasilitas: {
    id: number;
    name: string;
  }[];
}

const dataPaketJamaah = ref<PaketJamaah[]>([]);
const status = ref<string>('tutup');
const transpaketId = ref<number>(0);
const isFormDownloadAbsensiOpen = ref<boolean>(false);
const isFormCetakDataJamaahOpen = ref<boolean>(false);
const isFormOpsiHandoverBarangOpen = ref<boolean>(false);
const isFormHandoverFasilitasOpen = ref<boolean>(false);
const isFormTerimaBarangOpen = ref<boolean>(false);
const isFormPengembalianBarangOpen = ref<boolean>(false);
const notificationMessage = ref<string>('');
const notificationType = ref<'success' | 'error'>('success');
const showNotification = ref<boolean>(false);
const totalColumns = ref(5);
const totalRow = ref(0);

const displayNotification = (message: string, type: 'success' | 'error' = 'success') => {
  notificationMessage.value = message;
  notificationType.value = type;
  showNotification.value = true;

  if (timeoutId.value) clearTimeout(timeoutId.value);

  timeoutId.value = window.setTimeout(() => {
    showNotification.value = false;
  }, 3000);
};

const openFormDownloadAbsensi = () => {
  isFormDownloadAbsensiOpen.value = true;
};

const openFormCetakDataJamaah = (paketJamaah: PaketJamaah) => {
  transpaketId.value = paketJamaah.id;
  isFormCetakDataJamaahOpen.value = true;
};

const openFormOpsiHandoverBarang = (paketJamaah: PaketJamaah) => {
  transpaketId.value = paketJamaah.id;
  isFormOpsiHandoverBarangOpen.value = true;
};

const openFormHandoverFasilitas = (paketJamaah: PaketJamaah) => {
  transpaketId.value = paketJamaah.id;
  isFormHandoverFasilitasOpen.value = true;
};

const openTerimaBarangHandover = (id: number) => {
  transpaketId.value = id;
  isFormTerimaBarangOpen.value = true;
};

const openPengembalianBarangHandover = (id: number) => {
  transpaketId.value = id;
  isFormPengembalianBarangOpen.value = true;
};

const fetchData = async () => {
  try {
    isLoading.value = true;
    const response = await daftarJamaahPaket({
      paketId: props.paketId,
      division_id: props.cabangId,
      search: search.value,
      perpage: itemsPerPage,
      pageNumber: currentPage.value,
    });
    dataPaketJamaah.value = response.data;
    status.value = response.status;
    totalRow.value = response.total;
    console.log(dataPaketJamaah);
    totalPages.value = Math.ceil(response.total / itemsPerPage);
  } catch (error) {
    console.error('Error fetching data:', error);
  } finally {
    isLoading.value = false;
  }
};

// Define state untuk menyimpan menu yang aktif
onMounted(() => {
  // Set default menu yang aktif
  fetchData();
});
</script>

<template>
  <div class="p-4 bg-white min-h-screen">
    <div
      v-if="isLoading"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
    >
      <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-400"></div>
    </div>
    <!-- Tambah data dan Search -->
    <div class="flex justify-between mb-6">
      <button
        @click="openFormDownloadAbsensi()"
        class="bg-[#455494] text-white px-4 py-2 rounded-lg hover:bg-[#3a477d] transition-colors duration-200 ease-in-out flex items-center gap-2"
      >
        <DownloadIcon />
        Download Absensi
      </button>
      <div class="flex items-center">
        <label for="search" class="block text-sm font-medium text-gray-700 mr-2">Search</label>
        <input
          type="text"
          id="search"
          class="block w-64 px-3 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
          v-model="search"
          @change="fetchData()"
          placeholder="Cari Jamaah..."
        />
      </div>
    </div>

    <!-- Table data -->
    <div class="overflow-hidden rounded-lg border border-gray-200 shadow-md mb-5">
      <table class="w-full border-collapse bg-white text-left text-sm text-gray-500">
        <thead class="bg-gray-100">
          <tr>
            <th class="w-[15%] px-6 py-3 font-medium text-gray-900 text-center">Jamaah</th>
            <th class="w-[15%] px-6 py-3 font-medium text-gray-900 text-center">Mahram</th>
            <th class="w-[25%] px-6 py-3 font-medium text-gray-900 text-center">Paket</th>
            <th class="w-[30%] px-6 py-3 font-medium text-gray-900 text-center">Info</th>
            <th class="w-[5%] px-6 py-3 font-medium text-gray-900 text-center">Aksi</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100 border-t border-gray-100">
          <template v-if="dataPaketJamaah && dataPaketJamaah.length > 0">
            <tr
              v-for="dataJamaah in dataPaketJamaah"
              :key="dataJamaah.id"
              class="hover:bg-gray-50"
              :class="status == 'tutup' ? ' pointer-events-none opacity-50 ' : ''"
            >
              <td class="px-6 py-4 text-center align-top">
                <p>{{ dataJamaah.fullname }}</p>
                <p>(No Identitas : {{ dataJamaah.identity_number }})</p>
              </td>
              <td
                class="px-6 py-4 align-top"
                :class="{ 'text-center': !dataJamaah.mahram || dataJamaah.mahram.length === 0 }"
              >
                <template v-if="dataJamaah.mahram && dataJamaah.mahram.length > 0">
                  <p v-for="mahram in dataJamaah.mahram">
                    {{ mahram.fullname }} ({{ mahram.mahram_type }})
                  </p>
                </template>
                <p v-else>Tidak Ada Mahram</p>
              </td>
              <td class="px-6 py-4 text-center align-top">
                <p>{{ dataJamaah.name.toUpperCase() }}</p>
                <p>(Kode Paket: {{ dataJamaah.kode }})</p>
                <p>(Tipe Paket: {{ dataJamaah.type }})</p>
                <p>
                  (Harga:
                  {{
                    dataJamaah.price.toLocaleString('id-ID', {
                      style: 'currency',
                      currency: 'IDR',
                      minimumFractionDigits: 0,
                    })
                  }})
                </p>
              </td>
              <td class="px-6 py-4 align-top">
                <p class="font-bold">Barang Jamaah Yang Diambil</p>
                <ul
                  v-if="dataJamaah.handover_barang.length > 0"
                  v-for="barang in dataJamaah.handover_barang"
                  :key="barang.id"
                  class="list-disc list-inside text-sm pl-3"
                >
                  <li class="items-center gap-1">{{ barang.name }}</li>
                </ul>
                <p v-else>Barang Jamaah belum diterima</p>
                <p class="font-bold">Fasilitas Jamaah Yang Sudah Diberikan</p>
                <ul
                  v-if="dataJamaah.handover_fasilitas.length > 0"
                  v-for="fasilitas in dataJamaah.handover_fasilitas"
                  :key="fasilitas.id"
                  class="list-disc list-inside text-sm pl-3"
                >
                  <li class="items-center gap-1">{{ fasilitas.name }}</li>
                </ul>
                <p v-else>Fasilitas Jamaah belum diberikan</p>
              </td>
              <td class="px-4 py-2 text-center align-top">
                <div class="flex flex-col items-center space-y-2">
                  <template v-if="status == 'buka'">
                    <LightButton
                      @click="openFormOpsiHandoverBarang(dataJamaah)"
                      title="Handover Barang"
                    >
                      <HandoverIcon class="h-4 w-4 text-gray-600" />
                    </LightButton>
                    <LightButton
                      @click="openFormHandoverFasilitas(dataJamaah)"
                      title="Handover Fasilitas"
                    >
                      <HandoverBarangIcon class="h-4 w-4 text-gray-600" />
                    </LightButton>
                    <LightButton
                      col-span-1
                      title="Cetak Data Jamaah"
                      @click="openFormCetakDataJamaah(dataJamaah)"
                    >
                      <CetakIcon class="h-4 w-4 text-gray-600" />
                    </LightButton>
                  </template>
                  <template v-else>
                    <span class="italic">Paket ini sudah ditutup</span>
                  </template>
                </div>
              </td>
            </tr>
          </template>
          <tr v-else>
            <td :colspan="totalColumns" class="px-6 py-3 text-center text-sm text-gray-600">
              Daftar Jamaah Tidak Ditemukan.
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
  </div>

  <!-- Form Pengembalian Barang Handover -->
  <transition
    enter-active-class="transition duration-200 ease-out"
    enter-from-class="transform scale-95 opacity-0"
    enter-to-class="transform scale-100 opacity-100"
    leave-active-class="transition duration-200 ease-in"
    leave-from-class="transform scale-100 opacity-100"
    leave-to-class="transform scale-95 opacity-0"
  >
    <FormDownloadAbsensi
      v-if="isFormDownloadAbsensiOpen"
      :is-form-download-absensi-open="isFormDownloadAbsensiOpen"
      :paket-id="props.paketId"
      :cabang-id="props.cabangId"
      @close="
        isFormDownloadAbsensiOpen = false;
        fetchData();
      "
      @status="
        (payload) =>
          displayNotification(
            payload.err_msg || 'Absensi gagal diunduh',
            payload.error ? 'error' : 'success',
          )
      "
    />
  </transition>

  <!-- Form Cetak Data Jamaah -->
  <transition
    enter-active-class="transition duration-200 ease-out"
    enter-from-class="transform scale-95 opacity-0"
    enter-to-class="transform scale-100 opacity-100"
    leave-active-class="transition duration-200 ease-in"
    leave-from-class="transform scale-100 opacity-100"
    leave-to-class="transform scale-95 opacity-0"
  >
    <FormCetakDataJamaah
      v-if="isFormCetakDataJamaahOpen"
      :is-form-cetak-data-jamaah-open="isFormCetakDataJamaahOpen"
      :transpaket-id="transpaketId"
      :cabang-id="props.cabangId"
      @close="
        isFormCetakDataJamaahOpen = false;
        fetchData();
      "
      @status="
        (payload) =>
          displayNotification(
            payload.err_msg || 'Data Jamaah gagal dicetak',
            payload.error ? 'error' : 'success',
          )
      "
    />
  </transition>

  <!-- Form Add Handover Fasilitas -->
  <transition
    enter-active-class="transition duration-200 ease-out"
    enter-from-class="transform scale-95 opacity-0"
    enter-to-class="transform scale-100 opacity-100"
    leave-active-class="transition duration-200 ease-in"
    leave-from-class="transform scale-100 opacity-100"
    leave-to-class="transform scale-95 opacity-0"
  >
    <FormHandoverFasilitas
      v-if="isFormHandoverFasilitasOpen"
      :isFormHandoverFasilitasOpen="isFormHandoverFasilitasOpen"
      :transpaketId="transpaketId"
      @close="
        isFormHandoverFasilitasOpen = false;
        fetchData();
      "
      @status="
        (payload) =>
          displayNotification(
            payload.err_msg || 'Handover Fasilitas gagal ditambahkan',
            payload.error ? 'error' : 'success',
          )
      "
    />
  </transition>

  <!-- Form Opsi Handover Barang -->
  <transition
    enter-active-class="transition duration-200 ease-out"
    enter-from-class="transform scale-95 opacity-0"
    enter-to-class="transform scale-100 opacity-100"
    leave-active-class="transition duration-200 ease-in"
    leave-from-class="transform scale-100 opacity-100"
    leave-to-class="transform scale-95 opacity-0"
  >
    <FormOpsiHandoverBarang
      v-if="isFormOpsiHandoverBarangOpen"
      :isFormOpsiHandoverBarangOpen="isFormOpsiHandoverBarangOpen"
      :transpaketId="transpaketId"
      @close="
        isFormOpsiHandoverBarangOpen = false;
        fetchData();
      "
      @terima-barang="
        isFormOpsiHandoverBarangOpen = false;
        openTerimaBarangHandover(transpaketId);
      "
      @pengembalian-barang="
        isFormOpsiHandoverBarangOpen = false;
        openPengembalianBarangHandover(transpaketId);
      "
    />
  </transition>

  <!-- Form Terima Barang Handover -->
  <transition
    enter-active-class="transition duration-200 ease-out"
    enter-from-class="transform scale-95 opacity-0"
    enter-to-class="transform scale-100 opacity-100"
    leave-active-class="transition duration-200 ease-in"
    leave-from-class="transform scale-100 opacity-100"
    leave-to-class="transform scale-95 opacity-0"
  >
    <FormTerimaBarang
      v-if="isFormTerimaBarangOpen"
      :isFormTerimaBarangOpen="isFormTerimaBarangOpen"
      :transpaketId="transpaketId"
      @close="
        isFormTerimaBarangOpen = false;
        fetchData();
      "
      @status="
        (payload) =>
          displayNotification(
            payload.err_msg || 'Handover Barang gagal ditambahkan',
            payload.error ? 'error' : 'success',
          )
      "
    />
  </transition>

  <!-- Form Pengembalian Barang Handover -->
  <transition
    enter-active-class="transition duration-200 ease-out"
    enter-from-class="transform scale-95 opacity-0"
    enter-to-class="transform scale-100 opacity-100"
    leave-active-class="transition duration-200 ease-in"
    leave-from-class="transform scale-100 opacity-100"
    leave-to-class="transform scale-95 opacity-0"
  >
    <FormPengembalianBarang
      v-if="isFormPengembalianBarangOpen"
      :isFormPengembalianBarangOpen="isFormPengembalianBarangOpen"
      :transpaketId="transpaketId"
      @close="
        isFormPengembalianBarangOpen = false;
        fetchData();
      "
      @status="
        (payload) =>
          displayNotification(
            payload.err_msg || 'Pengembalian Barang gagal ditambahkan',
            payload.error ? 'error' : 'success',
          )
      "
    />
  </transition>

  <!-- Notification -->
  <Notification
    :showNotification="showNotification"
    :notificationType="notificationType"
    :notificationMessage="notificationMessage"
    @close="showNotification = false"
  />
</template>
