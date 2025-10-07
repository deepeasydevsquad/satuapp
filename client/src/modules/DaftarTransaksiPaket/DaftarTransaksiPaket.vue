<script setup lang="ts">
// Import Icon
import DeleteIcon from '@/components/Icons/DeleteIcon.vue';
import EditIcon from '@/components/Icons/EditIcon.vue';
import RefundIcon from '@/components/Icons/RefundIcon.vue';
import IconUpload from '@/components/Icons/IconUpload.vue';

// import element
import DangerButton from '@/components/Button/DangerButton.vue';
import EditButton from '@/modules/DaftarTransaksiPaket/Particle/EditButton.vue';
import LightButton from '@/modules/DaftarTransaksiPaket/Particle/LightButton.vue';
import Notification from '@/modules/DaftarTransaksiPaket/Particle/Notification.vue';
import Confirmation from '@/modules/DaftarTransaksiPaket/Particle/Confirmation.vue';

// import widget
import FormAdd from '@/modules/DaftarTransaksiPaket/Widgets/FormAdd.vue';
import FormEditVisa from '@/modules/DaftarTransaksiPaket/Widgets/FormEditVisa.vue';
import FormRefund from '@/modules/DaftarTransaksiPaket/Widgets/FormRefund.vue';
import FormUploadFilePendukung from '@/modules/DaftarTransaksiPaket/Widgets/FormUploadFilePendukung.vue';
import Pagination from '@/components/Pagination/Pagination.vue';

// Import service API
import { daftarTransaksiPaket, deleteTransaksiPaket } from '@/service/daftar_transaksi_paket';
import { ref, onMounted, computed } from 'vue';

const props = defineProps<{
  paketId: number;
  cabangId: number;
  search: string | null;
  showBackButton?: boolean;
  showAddTransactionButton?: boolean;
}>();

console.log(props);

const { showBackButton = false, showAddTransactionButton = false } = props;

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

interface FilePendukung {
  title: string;
  filename: string;
}

interface PaketTransaction {
  id: number;
  paket_id: number;
  name: string;
  departure_date: string;
  type: string;
  total_price: number;
  price: number;
  sisa: number;
  jamaah_id: number;
  fullname: string;
  identity_number: string;
  nomor_visa: string;
  tanggal_berlaku_visa: string;
  tanggal_berakhir_visa: string;
  biaya_mahram: number;
  file_pendukung: FilePendukung[];
}

const dataPaketTransaction = ref<PaketTransaction[]>([]);
const status = ref<string>('tutup');
const transpaketId = ref<number>(0);
const isFormOpen = ref<boolean>(false);
const isFormEditVisaOpen = ref<boolean>(false);
const isFormRefundOpen = ref<boolean>(false);
const isFormFilePendukungOpen = ref<boolean>(false);
const notificationMessage = ref<string>('');
const notificationType = ref<'success' | 'error'>('success');
const showNotification = ref<boolean>(false);
const showConfirmDialog = ref<boolean>(false);
const confirmMessage = ref<string>('');
const confirmTitle = ref<string>('');
const confirmAction = ref<(() => void) | null>(null);
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

const showConfirmation = (title: string, message: string, action: () => void) => {
  confirmTitle.value = title;
  confirmMessage.value = message;
  confirmAction.value = action;
  showConfirmDialog.value = true;
};

const openForm = () => {
  isFormOpen.value = true;
};

const openFormEditVisa = (id: number) => {
  isFormEditVisaOpen.value = true;
  transpaketId.value = id;
};

const openFormRefund = (id: number) => {
  isFormRefundOpen.value = true;
  transpaketId.value = id;
};

const fetchData = async () => {
  if (!props.paketId || !props.cabangId) {
    displayNotification('Paket ID atau Cabang ID tidak valid', 'error');
    return;
  }
  try {
    isLoading.value = true;
    search.value = props.search ? props.search : search.value;
    const response = await daftarTransaksiPaket({
      id: props.paketId,
      division_id: props.cabangId,
      search: search.value,
      perpage: itemsPerPage,
      pageNumber: currentPage.value,
    });
    dataPaketTransaction.value = response.data;
    totalRow.value = response.total;
    status.value = response.status;
    totalPages.value = Math.ceil(response.total / itemsPerPage);
  } catch (error: any) {
    console.error('Error fetching data:', error);
    const errorMessage =
      error?.response?.data?.error_msg ||
      error?.response?.data?.message ||
      'Gagal memuat data transaksi paket';
    displayNotification(errorMessage, 'error');
  } finally {
    isLoading.value = false;
  }
};

async function openFilePendukung(id: number) {
  // id paket transaksi
  isFormFilePendukungOpen.value = true;
  transpaketId.value = id;
}

async function deleteData(transpaketId: number) {
  showConfirmation('Konfirmasi Hapus', 'Apakah Anda yakin ingin menghapus data ini?', async () => {
    try {
      await deleteTransaksiPaket(props.paketId, transpaketId);
      showConfirmDialog.value = false;
      displayNotification('Data berhasil dihapus!', 'success');
      fetchData();
    } catch (error: any) {
      console.error('Error deleting data:', error);
      displayNotification(
        error?.response?.data?.error_msg ||
          error?.response?.data?.message ||
          'Terjadi kesalahan saat menghapus data.',
        'error',
      );
    }
  });
}

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

onMounted(() => {
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
    <div class="flex justify-between mb-4">
      <div class="flex items-center gap-2">
        <button
          v-if="props.showBackButton"
          @click="$emit('close')"
          class="bg-[#455494] text-white px-4 py-2 rounded-lg hover:bg-[#3a477d] transition-colors duration-200 ease-in-out flex items-center gap-2"
        >
          <font-awesome-icon :icon="['fas', 'arrow-left']" class="w-5 h-5 mr-1" />
          Kembali
        </button>
        <button
          v-if="props.showAddTransactionButton && status == 'buka'"
          @click="openForm()"
          class="bg-[#455494] text-white px-4 py-2 rounded-lg hover:bg-[#3a477d] transition-colors duration-200 ease-in-out flex items-center gap-2"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 4v16m8-8H4"
            />
          </svg>
          Mulai transaksi
        </button>
      </div>
      <!-- Teks Tengah -->
      <!-- <div class="mx-auto absolute left-1/2 -translate-x-1/2 text-lg font-semibold text-gray-800">
        Paket Umrah Keren : Cabang Langsa
      </div> -->
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
    <div class="overflow-hidden rounded-lg border border-gray-200 shadow-md">
      <table class="w-full border-collapse bg-white text-left text-sm text-gray-500">
        <thead class="bg-gray-100">
          <tr>
            <th class="w-[30%] px-6 py-3 font-medium text-gray-900 text-center">Info Paket</th>
            <th class="w-[30%] px-6 py-3 font-medium text-gray-900 text-center">
              Jamaah / Visa / File Pendukung
            </th>
            <th class="w-[15%] px-6 py-3 font-medium text-gray-900 text-center">Total Harga</th>
            <th class="w-[20%] px-6 py-3 font-medium text-gray-900 text-center">
              Status Pembayaran {{ status }}
            </th>
            <th class="w-[5%] px-6 py-3 font-medium text-gray-900 text-center">Aksi</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100 border-t border-gray-100 text-sm">
          <template v-if="dataPaketTransaction && dataPaketTransaction.length > 0">
            <tr
              v-for="dataTransPaket in dataPaketTransaction"
              :key="dataTransPaket.id"
              class="hover:bg-gray-50"
              :class="status == 'tutup' ? ' pointer-events-none opacity-50 ' : ''"
            >
              <td class="px-3 py-4 text-center align-top">
                <table class="w-full mb-5">
                  <thead>
                    <tr>
                      <th
                        colspan="3"
                        class="text-center py-2 font-medium border text-gray-900 bg-gray-100"
                      >
                        Paket
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="(label, value) in {
                        'Nama Paket': dataTransPaket.name.toUpperCase(),
                        'Tanggal Berangkat': dataTransPaket.departure_date,
                      }"
                      :key="label"
                      class="border-gray-200 hover:bg-gray-200"
                    >
                      <td class="w-[50%] border-b px-6 py-2 text-left">{{ value }}</td>
                      <td class="text-center border-b py-2">:</td>
                      <td class="border-b text-right space-y-2 text-sm px-6 py-2">{{ label }}</td>
                    </tr>
                  </tbody>
                </table>

                <table class="w-full mb-5">
                  <thead>
                    <tr>
                      <th
                        colspan="3"
                        class="text-center py-2 font-medium border text-gray-900 bg-gray-100"
                      >
                        Tipe Paket
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="(label, value) in {
                        'Tipe Paket': dataTransPaket.type,
                        'Harga Paket': dataTransPaket.price.toLocaleString('id-ID', {
                          style: 'currency',
                          currency: 'IDR',
                          minimumFractionDigits: 0,
                        }),
                      }"
                      :key="label"
                      class="border-gray-200 hover:bg-gray-200"
                    >
                      <td class="w-[50%] border-b px-6 py-2 text-left">{{ value }}</td>
                      <td class="text-center border-b py-2">:</td>
                      <td class="border-b text-right space-y-2 text-sm px-6 py-2">{{ label }}</td>
                    </tr>
                  </tbody>
                </table>
              </td>
              <td class="px-3 py-4 align-top">
                <table class="w-full mb-5">
                  <thead>
                    <tr>
                      <th
                        colspan="3"
                        class="text-center py-2 font-medium border text-gray-900 bg-gray-100"
                      >
                        Info Jamaah
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="(label, value) in {
                        'Nama Jamaah': dataTransPaket.fullname,
                        'Nomor ID': dataTransPaket.identity_number,
                      }"
                      :key="label"
                      class="border-gray-200 hover:bg-gray-200"
                    >
                      <td class="w-[50%] border-b px-6 py-2 text-left">{{ value }}</td>
                      <td class="text-center border-b py-2">:</td>
                      <td class="border-b text-right space-y-2 text-sm px-6 py-2">{{ label }}</td>
                    </tr>
                  </tbody>
                </table>

                <table class="w-full mb-5">
                  <thead>
                    <tr>
                      <th
                        colspan="3"
                        class="text-center py-2 font-medium border text-gray-900 bg-gray-100"
                      >
                        Info Visa
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="(label, value) in {
                        'Nomor Visa': dataTransPaket.nomor_visa,
                        'Tanggal Berlaku': dataTransPaket.tanggal_berlaku_visa,
                        'Tanggal Berakhir': dataTransPaket.tanggal_berakhir_visa,
                      }"
                      :key="label"
                      class="border-gray-200 hover:bg-gray-200"
                    >
                      <td class="w-[50%] border-b px-6 py-2 text-left">{{ value }}</td>
                      <td class="text-center border-b py-2">:</td>
                      <td class="border-b text-right space-y-2 text-sm px-6 py-2">{{ label }}</td>
                    </tr>
                  </tbody>
                </table>

                <table class="w-full mb-5">
                  <thead>
                    <tr>
                      <th
                        colspan="3"
                        class="text-center py-2 font-medium border text-gray-900 bg-gray-100"
                      >
                        File Pendukung
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-if="
                        dataTransPaket.file_pendukung && dataTransPaket.file_pendukung.length == 0
                      "
                    >
                      <td colspan="3" class="text-center border-b py-2">
                        File pendukung tidak ditemukan
                      </td>
                    </tr>
                    <tr
                      v-else
                      v-for="(file, index) in dataTransPaket.file_pendukung"
                      :key="index"
                      class="border-gray-200 hover:bg-gray-200"
                    >
                      <td class="w-[50%] border-b px-6 py-2 text-left">{{ file.title }}</td>
                      <td class="text-center border-b py-2">:</td>
                      <td class="border-b text-right space-y-2 text-sm px-6 py-2">
                        <a
                          :href="`/api/file-pendukung/${file.filename}`"
                          target="_blank"
                          class="text-blue-600 hover:underline"
                        >
                          {{ file.filename }}
                        </a>
                      </td>
                    </tr>
                    <!-- <tr v-for="(label, value) in {
                      'Nomor Visa': dataTransPaket.nomor_visa,
                      'Tanggal Berlaku': dataTransPaket.tanggal_berlaku_visa,
                      'Tanggal Berakhir': dataTransPaket.tanggal_berakhir_visa,
                       }"
                    :key="label" class="border-gray-200 hover:bg-gray-200">
                      <td class="w-[50%] border-b px-6 py-2 text-left">{{ value }}</td>
                      <td class="text-center border-b py-2">:</td>
                      <td class="border-b text-right space-y-2 text-sm px-6 py-2">{{ label }}</td>
                    </tr> -->
                  </tbody>
                </table>
              </td>
              <td class="px-3 py-4 text-center align-top">
                {{ formatRupiah(dataTransPaket.total_price ?? 0) }}
              </td>
              <td class="px-3 py-4 align-top">
                <table class="w-full">
                  <tbody>
                    <tr>
                      <td class="w-[40%]">Biaya Mahram</td>
                      <td>:</td>
                      <td class="text-right space-y-2 py-1">
                        {{ formatRupiah(dataTransPaket.biaya_mahram ?? 0) }}
                      </td>
                    </tr>
                    <tr>
                      <td>Sudah Bayar</td>
                      <td>:</td>
                      <td class="text-right space-y-2 py-1">
                        {{ formatRupiah(dataTransPaket.total_price ?? 0) }}
                      </td>
                    </tr>
                    <tr>
                      <td>Sisa</td>
                      <td>:</td>
                      <td class="text-right space-y-2 py-1">
                        {{ formatRupiah(dataTransPaket.sisa ?? 0) }}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>
              <td class="px-4 py-2 text-center align-top">
                <div class="flex flex-col items-center space-y-2">
                  <template v-if="status == 'buka'">
                    <LightButton
                      @click="openFormRefund(dataTransPaket.id)"
                      title="Refund Transaksi Paket"
                    >
                      <RefundIcon class="h-4 w-4 text-gray-600" />
                    </LightButton>
                    <LightButton
                      @click="openFormEditVisa(dataTransPaket.id)"
                      title="Update Informasi Visa"
                    >
                      <EditIcon></EditIcon>
                    </LightButton>
                    <LightButton
                      @click="openFilePendukung(dataTransPaket.id)"
                      title="Upload File Pendukung"
                    >
                      <IconUpload></IconUpload>
                    </LightButton>
                    <DangerButton
                      @click="deleteData(dataTransPaket.id)"
                      title="Hapus Transaksi Paket"
                    >
                      <DeleteIcon></DeleteIcon>
                    </DangerButton>
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
              Daftar Transaksi Paket Tidak Ditemukan.
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

  <!-- Cabang Id ini akan ditambahkan setelah merge untuk menghindari konflik pada module sebelumnya -->
  <FormUploadFilePendukung
    :showForm="isFormFilePendukungOpen"
    :transpaketId="transpaketId"
    :cabang-id="cabangId || 1"
    @cancel="
      isFormFilePendukungOpen = false;
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

  <!-- Form Pengembalian Barang Handover -->
  <transition
    enter-active-class="transition duration-200 ease-out"
    enter-from-class="transform scale-95 opacity-0"
    enter-to-class="transform scale-100 opacity-100"
    leave-active-class="transition duration-200 ease-in"
    leave-from-class="transform scale-100 opacity-100"
    leave-to-class="transform scale-95 opacity-0"
  >
    <FormAdd
      v-if="isFormOpen"
      :is-form-open="isFormOpen"
      :paket-id="props.paketId"
      :cabang-id="props.cabangId"
      @close="
        isFormOpen = false;
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

  <!-- Form Pengembalian Barang Handover -->
  <transition
    enter-active-class="transition duration-200 ease-out"
    enter-from-class="transform scale-95 opacity-0"
    enter-to-class="transform scale-100 opacity-100"
    leave-active-class="transition duration-200 ease-in"
    leave-from-class="transform scale-100 opacity-100"
    leave-to-class="transform scale-95 opacity-0"
  >
    <FormAdd
      v-if="isFormOpen"
      :isFormOpen="isFormOpen"
      :paketId="props.paketId"
      @close="
        isFormOpen = false;
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

  <!-- Form Edit Visa -->
  <transition
    enter-active-class="transition duration-200 ease-out"
    enter-from-class="transform scale-95 opacity-0"
    enter-to-class="transform scale-100 opacity-100"
    leave-active-class="transition duration-200 ease-in"
    leave-from-class="transform scale-100 opacity-100"
    leave-to-class="transform scale-95 opacity-0"
  >
    <FormEditVisa
      v-if="isFormEditVisaOpen"
      :isFormEditVisaOpen="isFormEditVisaOpen"
      :paketId="props.paketId"
      :transpaketId="transpaketId"
      :cabang-id="props.cabangId"
      @close="
        isFormEditVisaOpen = false;
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

  <!-- Form Refund -->
  <transition
    v-if="isFormRefundOpen"
    enter-active-class="transition duration-200 ease-out"
    enter-from-class="transform scale-95 opacity-0"
    enter-to-class="transform scale-100 opacity-100"
    leave-active-class="transition duration-200 ease-in"
    leave-from-class="transform scale-100 opacity-100"
    leave-to-class="transform scale-95 opacity-0"
  >
    <FormRefund
      v-if="isFormRefundOpen"
      :isFormRefundOpen="isFormRefundOpen"
      :paketId="props.paketId"
      :transpaketId="transpaketId"
      :cabang-id="props.cabangId"
      @close="
        isFormRefundOpen = false;
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

  <!-- Confirmation Dialog -->
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

  <!-- Notification -->
  <Notification
    :showNotification="showNotification"
    :notificationType="notificationType"
    :notificationMessage="notificationMessage"
    @close="showNotification = false"
  />
</template>
