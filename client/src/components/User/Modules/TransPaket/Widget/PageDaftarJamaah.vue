<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { getDaftarJamaahTransPaket } from '@/service/trans_paket';
import { paramCabang } from '@/service/param_cabang';
import Pagination from '@/components/Pagination/Pagination.vue';
import LightButton from '@/components/Button/LightButton.vue';

// Import Icon
import CetakIcon from '@/components/Icons/CetakIcon.vue';
import HandoverBarangIcon from '@/components/User/Modules/TransPaket/Icon/HandoverBarangIcon.vue';
import HandoverIcon from '@/components/User/Modules/TransPaket/Icon/HandoverIcon.vue';

// import particle + widget
import Notification from '@/components/User/Modules/DaftarJamaahPaket/Particle/Notification.vue';
import FormCetakDataJamaah from '@/components/User/Modules/DaftarJamaahPaket/Widgets/FormCetakDataJamaah.vue';
import FormHandoverFasilitas from '@/components/User/Modules/DaftarJamaahPaket/Widgets/FormHandoverFasilitas.vue';
import FormOpsiHandoverBarang from '@/components/User/Modules/DaftarJamaahPaket/Widgets/FormOpsiHandoverBarang.vue';
import FormTerimaBarang from '@/components/User/Modules/DaftarJamaahPaket/Widgets/FormTerimaBarang.vue';
import FormPengembalianBarang from '@/components/User/Modules/DaftarJamaahPaket/Widgets/FormPengembalianBarang.vue';
import { c } from 'node_modules/vite/dist/node/moduleRunnerTransport.d-CXw_Ws6P';

const itemsPerPage = 100; // Jumlah paket_la per halaman
const search = ref('');
const currentPage = ref(1);
const totalPages = ref(0);
const totalColumns = ref(6);

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

interface PaketJamaah {
  id: number;
  kode: string;
  name: string;
  type: string;
  price: number;
  departure_date: string;
  jamaah_id: number;
  nomor_passport: string;
  fullname: string;
  identity_number: string;
  birth_date: string;
  birth_place: string;
  handover_barang: {
    id: number;
    name: string;
  }[];
  handover_fasilitas: {
    id: number;
    name: string;
  }[];
}

interface filterCabang {
  id: number;
  name: string;
}

const selectedOptionCabang = ref(0);
const optionFilterCabang = ref<filterCabang[]>([]);
const total = ref<number>(0);

const dataPaketJamaah = ref<PaketJamaah[]>([]);
const transpaketId = ref<number>(0);
const isLoading = ref<boolean>(false);
const isFormCetakDataJamaahOpen = ref<boolean>(false);
const isFormOpsiHandoverBarangOpen = ref<boolean>(false);
const isFormHandoverFasilitasOpen = ref<boolean>(false);
const isFormTerimaBarangOpen = ref<boolean>(false);
const isFormPengembalianBarangOpen = ref<boolean>(false);
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

const fetchFilterData = async () => {
  const response = await paramCabang();
  optionFilterCabang.value = response.data;
  selectedOptionCabang.value = response.data[0].id;
};

const fetchData = async () => {
  try {
    isLoading.value = true;
    const response = await getDaftarJamaahTransPaket({
      division_id: selectedOptionCabang.value,
      search: search.value,
      perpage: itemsPerPage,
      pageNumber: currentPage.value,
    });
    dataPaketJamaah.value = response.data;
    total.value = response.total;
    totalPages.value = Math.ceil(response.total / itemsPerPage);
  } catch (error) {
    console.error('Error fetching data:', error);
  } finally {
    isLoading.value = false;
  }
};

onMounted(async () => {
  await fetchFilterData();
  fetchData();
});

const handleCloseFormCetak = () => {
  isFormCetakDataJamaahOpen.value = false;
  fetchData();
};

const handleCloseFormHandoverFasilitas = () => {
  isFormHandoverFasilitasOpen.value = false;
  fetchData();
};

const handleCloseFormOpsiHandoverBarang = () => {
  isFormOpsiHandoverBarangOpen.value = false;
  fetchData();
};
</script>

<template>
  <div class="container mx-auto px-0 py-0">
    <div class="flex justify-end items-center mb-6 text-right">
      <div class="flex items-center">
        <label for="search" class="block text-sm font-medium text-gray-700 mr-2">Search</label>
        <input
          type="text"
          id="search"
          class="block w-64 px-3 py-2 text-gray-700 bg-white border border-gray-300 rounded-s-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
          v-model="search"
          @change="fetchData()"
          placeholder="Cari Jamaah..."
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
          <tr class="bg-gray-100">
            <th class="w-[10%] px-6 py-3 font-medium font-bold text-gray-900 text-center">
              Nomor Identitas
            </th>
            <th class="w-[20%] px-6 py-3 font-medium font-bold text-gray-900 text-center">
              Nama Jamaah
            </th>
            <th class="w-[15%] px-6 py-3 font-medium font-bold text-gray-900 text-center">
              Tempat/Tanggal Lahir
            </th>
            <th class="w-[15%] px-6 py-3 font-medium font-bold text-gray-900 text-center">
              Nomor Passport
            </th>
            <th class="w-[20%] px-6 py-3 font-medium font-bold text-gray-900 text-center">
              Informasi Paket
            </th>
            <th class="w-[10%] px-6 py-3 font-medium font-bold text-gray-900 text-center">Aksi</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100 border-t border-gray-100">
          <tr
            v-if="dataPaketJamaah.length > 0"
            v-for="paketJamaah in dataPaketJamaah"
            :key="paketJamaah.id"
            class="hover:bg-gray-50 transition-colors"
          >
            <td class="px-6 py-4 text-center">{{ paketJamaah.identity_number }}</td>
            <td class="px-6 py-4 text-center">{{ paketJamaah.fullname }}</td>
            <td class="px-6 py-4 text-center">
              {{ paketJamaah.birth_place }} / {{ paketJamaah.birth_date }}
            </td>
            <td class="px-6 py-4 text-center">{{ paketJamaah.nomor_passport }}</td>
            <td class="px-6 py-4 text-center">
              <p>{{ paketJamaah.name.toUpperCase() }}</p>
              <p>(Kode Paket: {{ paketJamaah.kode }})</p>
              <p>(Tipe Paket: {{ paketJamaah.type }})</p>
              <p>
                (Harga:
                {{
                  paketJamaah.price.toLocaleString('id-ID', {
                    style: 'currency',
                    currency: 'IDR',
                    minimumFractionDigits: 0,
                  })
                }})
              </p>
            </td>
            <td class="px-6 py-4 text-center flex gap-2 justify-center">
              <LightButton @click="openFormOpsiHandoverBarang(paketJamaah)" title="Handover Barang">
                <HandoverIcon class="h-4 w-4 text-gray-600" />
              </LightButton>
              <LightButton
                @click="openFormHandoverFasilitas(paketJamaah)"
                title="Handover Fasilitas"
              >
                <HandoverBarangIcon class="h-4 w-4 text-gray-600" />
              </LightButton>
              <LightButton
                col-span-1
                title="Cetak Data Jamaah"
                @click="openFormCetakDataJamaah(paketJamaah)"
              >
                <CetakIcon class="h-4 w-4 text-gray-600" />
              </LightButton>
            </td>
          </tr>
          <tr v-else>
            <td :colspan="totalColumns" class="px-6 py-3 text-center text-gray-500">
              Daftar Jamaah Tidak di Temukan
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
      :isFormCetakDataJamaahOpen="isFormCetakDataJamaahOpen"
      :transpaketId="transpaketId"
      :cabang-id="selectedOptionCabang"
      @close="handleCloseFormCetak"
      @success="displayNotification('Jamaah berhasil dicetak', 'success')"
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
      @close="handleCloseFormHandoverFasilitas"
      @status="
        (payload: any) =>
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
      @close="handleCloseFormOpsiHandoverBarang"
      @terima-barang="
        () => {
          isFormOpsiHandoverBarangOpen = false;
          openTerimaBarangHandover(transpaketId);
        }
      "
      @pengembalian-barang="
        () => {
          isFormOpsiHandoverBarangOpen = false;
          openPengembalianBarangHandover(transpaketId);
        }
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
        () => {
          isFormTerimaBarangOpen = false;
          fetchData();
        }
      "
      @status="
        (payload: any) =>
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
        () => {
          isFormPengembalianBarangOpen = false;
          fetchData();
        }
      "
      @status="
        (payload: any) =>
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
