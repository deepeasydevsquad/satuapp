<script setup lang="ts">
// Import Icon
import CetakIcon from '@/components/Icons/CetakIcon.vue';
import EditIcon from '@/modules/TabunganUmrah/Icon/EditIcon.vue';
import RefundIcon from '@/modules/TabunganUmrah/Icon/RefundIcon.vue';
import NabungIcon from '@/modules/TabunganUmrah/Icon/NabungIcon.vue';
import HandoverIcon from '@/modules/TabunganUmrah/Icon/HandoverIcon.vue';
import HandoverBarangIcon from '@/modules/TabunganUmrah/Icon/HandoverBarangIcon.vue';
import BeliPaketIcon from '@/modules/TabunganUmrah/Icon/BeliPaketIcon.vue';
import DeleteIcon from '@/components/Icons/DeleteIcon.vue';
import Pagination from '@/components/Pagination/Pagination.vue';

// import element
import PrimaryButton from '@/components/Button/PrimaryButton.vue';
import LightButton from '@/components/Button/LightButton.vue';
import DangerButton from '@/components/Button/DangerButton.vue';
import Notification from '@/modules/TabunganUmrah/Particle/Notification.vue';
import Confirmation from '@/modules/TabunganUmrah/Particle/Confirmation.vue';

// import widget
import FormAdd from '@/modules/TabunganUmrah/Widget/FormAdd.vue';
import FormAddHandover from '@/modules/TabunganUmrah/Widget/FormAddHandover.vue';
import FormUpdate from '@/modules/TabunganUmrah/Widget/FormUpdate.vue';
import FormMenabung from '@/modules/TabunganUmrah/Widget/FormMenabung.vue';
import FormRefund from '@/modules/TabunganUmrah/Widget/FormRefund.vue';
import FormCetakDataJamaah from '@/modules/TabunganUmrah/Widget/FormCetakDataJamaah.vue';
import FormOpsiHandoverBarang from '@/modules/TabunganUmrah/Widget/FormOpsiHandoverBarang.vue';
import FormTerimaBarang from '@/modules/TabunganUmrah/Widget/FormTerimaBarang.vue';
import FormPengembalianBarang from '@/modules/TabunganUmrah/Widget/FormPengembalianBarang.vue';
import FormBeliPaket from '@/modules/TabunganUmrah/Widget/FormBeliPaket.vue';
import DaftarTransaksiPaket from '@/modules/DaftarTransaksiPaket/DaftarTransaksiPaket.vue';

// import API
import {
  daftar_tabungan_umrah,
  deleteTabunganUmrah,
  cekKwitansiTabunganUmrah,
} from '@/service/tabungan_umrah';
import { paramCabang } from '@/service/param_cabang';
import { ref, onMounted, computed } from 'vue';

const itemsPerPage = 100; // Jumlah paket_la per halaman
const currentPage = ref(1);
const search = ref('');
const filter = ref('belum_beli_paket'); // Default filter
const filterCabang = ref(0);
const optionFilterCabang = ref<filterCabang[]>([]);
const totalPages = ref(0);

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

interface filterCabang {
  id: number;
  name: string;
}

interface TabunganUmrah {
  id: number;
  member: {
    fullname: string;
    identity_number: string;
    birth_place: string;
    birth_date: string;
  };
  target_paket_name: string;
  target_paket_id: number;
  total_tabungan: number;
  status_paket: boolean;
  fee_agen_id: number;
  agen: {
    fullname: string;
    level: string;
    default_fee: number;
  };
  batal_berangkat: number;
  sisa_pembelian: number;
  riwayat_tabungan: {
    id: number;
    invoice: string;
    nominal_tabungan: number;
    transaksi: string;
    penerima: string;
  }[];
  riwayat_handover_fasilitas: {
    id: number;
    name: string;
  }[];
}

const timeoutId = ref<number | null>(null);
const dataTabunganUmrah = ref<TabunganUmrah[]>([]);
const total = ref<number>(0);
const tabunganId = ref<number>(0);
const paketId = ref<number>(0);
const dataSearch = ref<string | null>(null);
const isDaftarTransaksiPaketOpen = ref<boolean>(false);
const isFormOpen = ref<boolean>(false);
const isFormUpdateOpen = ref<boolean>(false);
const isFormAddHandoverOpen = ref<boolean>(false);
const isFormMenabungOpen = ref<boolean>(false);
const isFormRefundOpen = ref<boolean>(false);
const isFormCetakDataJamaahOpen = ref<boolean>(false);
const isFormOpsiHandoverBarangOpen = ref<boolean>(false);
const isFormTerimaBarangOpen = ref<boolean>(false);
const isFormPengembalianBarangOpen = ref<boolean>(false);
const isFormBeliPaketUmrahOpen = ref<boolean>(false);
const isLoading = ref<boolean>(false);
const showConfirmDialog = ref<boolean>(false);
const showNotification = ref<boolean>(false);
const notificationMessage = ref<string>('');
const notificationType = ref<'success' | 'error'>('success');
const confirmMessage = ref<string>('');
const confirmTitle = ref<string>('');
const confirmAction = ref<(() => void) | null>(null);
const totalColumns = ref(3); // Default 3 kolom

const fetchData = async () => {
  try {
    isLoading.value = true;
    const response = await daftar_tabungan_umrah({
      search: search.value,
      filter: filter.value,
      filterCabang: filterCabang.value,
      perpage: itemsPerPage,
      pageNumber: currentPage.value,
    });

    if (response.data.error || response.error) {
      displayNotification(response.error_msg, 'error');
      return;
    }

    totalPages.value = Math.ceil(response.total / itemsPerPage);
    dataTabunganUmrah.value = response.data || [];
    total.value = response.total;
  } catch (error) {
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

const openFormAdd = () => {
  isFormOpen.value = true;
};

const openFormUpdate = (tabungan: TabunganUmrah) => {
  tabunganId.value = tabungan.id;
  isFormUpdateOpen.value = true;
};

const openFormMenabung = (tabungan: TabunganUmrah) => {
  tabunganId.value = tabungan.id;
  isFormMenabungOpen.value = true;
};

const openFormRefund = (tabungan: TabunganUmrah) => {
  tabunganId.value = tabungan.id;
  isFormRefundOpen.value = true;
};

const openFormAddHandover = (tabungan: TabunganUmrah) => {
  tabunganId.value = tabungan.id;
  isFormAddHandoverOpen.value = true;
};

const openFormCetakDataJamaah = (tabungan: TabunganUmrah) => {
  tabunganId.value = tabungan.id;
  isFormCetakDataJamaahOpen.value = true;
};

const openFormOpsiHandoverBarang = (tabungan: TabunganUmrah) => {
  tabunganId.value = tabungan.id;
  isFormOpsiHandoverBarangOpen.value = true;
};

const openTerimaBarangHandover = (tabungan_id: number) => {
  tabunganId.value = tabungan_id;
  isFormTerimaBarangOpen.value = true;
};

const openPengembalianBarangHandover = (tabungan_id: number) => {
  tabunganId.value = tabungan_id;
  isFormPengembalianBarangOpen.value = true;
};

const openFormBeliPaketUmrah = (tabungan: TabunganUmrah) => {
  tabunganId.value = tabungan.id;
  paketId.value = tabungan.target_paket_id;
  dataSearch.value = tabungan.member.identity_number;
  isFormBeliPaketUmrahOpen.value = true;
};

const deleteData = async (id: number) => {
  showConfirmation('Konfirmasi Hapus', 'Apakah Anda yakin ingin menghapus data ini?', async () => {
    isLoading.value = true;
    try {
      const response = await deleteTabunganUmrah(id, filterCabang.value);
      displayNotification(response.error_msg || 'Tabungan umrah berhasil dihapus!', 'success');
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

const cetakKwitansi = async (invoice: string) => {
  try {
    const adaInvoice = await cekKwitansiTabunganUmrah(invoice);
    if (adaInvoice === null) {
      displayNotification('Nomor invoice tidak tersedia', 'error');
      return;
    }

    const url = `/kwitansi-tabungan-umrah/${invoice}`;
    window.open(url, '_blank', 'noopener,noreferrer,width=800,height=600,scrollbars=yes');
  } catch (error) {
    displayNotification(
      error.response.data.error_msg || 'Terjadi kesalahan saat membuka invoice.',
      'error',
    );
  }
};
</script>

<template>
  <div v-if="isDaftarTransaksiPaketOpen === false" class="p-4 bg-white min-h-screen">
    <div v-if="isLoading" class="flex items-center justify-center">
      <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900"></div>
    </div>
    <div v-else-if="dataTabunganUmrah" class="container mx-auto">
      <div class="flex justify-between mb-4">
        <PrimaryButton @click="openFormAdd()">
          <font-awesome-icon icon="fa-solid fa-plus"></font-awesome-icon>
          Tabungan Umrah
        </PrimaryButton>
        <div class="flex items-center">
          <label for="filter" class="block text-sm font-medium text-gray-700">Search</label>
          <div class="flex items-center mx-4">
            <input
              type="text"
              id="search"
              class="block w-64 px-3 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 placeholder:text-gray-400"
              v-model="search"
              @change="fetchData()"
              placeholder="Cari jamaah atau paket..."
            />
          </div>
          <label for="filter" class="block text-sm font-medium text-gray-700 mr-2">Filter</label>
          <select
            id="filter"
            class="block w-64 px-3 py-2 text-gray-700 bg-white border rounded-s-lg border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            v-model="filter"
            @change="fetchData()"
          >
            <option value="belum_beli_paket" selected>Belum Beli Paket</option>
            <option value="sudah_beli_paket">Sudah Beli Paket</option>
            <option value="batal_berangkat">Batal Berangkat</option>
          </select>
          <select
            v-model="filterCabang"
            @change="fetchData()"
            class="block w-64 border-t border-b border-e bg-white border-gray-300 text-gray-900 text-sm rounded-e-lg focus:ring-blue-500 focus:border-blue-500 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          >
            <option v-for="optionC in optionFilterCabang" :key="optionC.id" :value="optionC.id">
              {{ optionC.name }}
            </option>
          </select>
        </div>
      </div>
      <div class="overflow-hidden rounded-lg border border-gray-200 shadow-md">
        <table
          ref="tabelutama"
          class="w-full border-collapse bg-white text-left text-sm text-gray-500"
        >
          <thead class="bg-gray-100">
            <tr>
              <th class="w-[25%] px-6 py-3 font-medium text-gray-900 text-center">Info Jamaah</th>
              <th
                :class="filter === 'sudah_beli_paket' ? 'w-[75%]' : 'w-[70%]'"
                class="px-6 py-3 font-medium text-gray-900 text-center"
              >
                Info Deposit
              </th>
              <th
                class="w-[5%] px-6 py-3 font-medium text-gray-900 text-center"
                v-if="filter === 'belum_beli_paket'"
              >
                Aksi
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100 border-t border-gray-100">
            <tr
              v-if="dataTabunganUmrah && dataTabunganUmrah.length > 0"
              v-for="tabungan in dataTabunganUmrah"
              :key="tabungan.id"
              class="hover:bg-gray-100"
            >
              <td class="px-6 align-top">
                <table class="w-full">
                  <tr
                    v-for="(label, value) in {
                      'Nama Jamaah': tabungan.member.fullname,
                      'Nomor Identitas': tabungan.member.identity_number,
                      'Tempat / Tgl Lahir': `${tabungan.member.birth_place} / ${tabungan.member.birth_date}`,
                      'Nama Agen': tabungan.agen
                        ? `${tabungan.agen.fullname} (Level : ${tabungan.agen.level})`
                        : '-',
                      'Nama Target Paket':
                        tabungan.target_paket_name || 'Target Paket Tidak Ditemukan',
                    }"
                    :key="label"
                    class="border-gray-200 hover:bg-gray-200"
                  >
                    <td class="py-1.5">{{ value }}</td>
                    <td class="pl-8 pr-2">:</td>
                    <td class="text-right space-y-2 text-sm py-1">{{ label }}</td>
                  </tr>
                </table>
              </td>
              <td class="px-6 py-3 align-top">
                <div class="text-sm text-gray-800 space-y-2">
                  <div class="flex items-start">
                    <span class="w-40 font-semibold">Total Tabungan</span>
                    <span class="px-2">:</span>
                    <span class="font-bold">Rp {{ tabungan.total_tabungan.toLocaleString() }}</span>
                  </div>
                </div>
                <div class="mt-4 border-t pt-2">
                  <div class="rounded-t bg-gray-200 px-2 py-2 font-semibold text-center">
                    Riwayat Tabungan Umrah
                  </div>
                  <template v-if="tabungan.riwayat_tabungan.length">
                    <div class="max-h-[340px] overflow-y-auto">
                      <table class="w-full mb-4 text-xs text-center text-gray-700 border">
                        <thead class="bg-gray-50 border-b">
                          <tr>
                            <th class="p-2 border w-[7%] text-sm">#</th>
                            <th class="p-2 border w-[13%] text-sm">Invoice</th>
                            <th class="p-2 border w-[23%] text-sm">Biaya</th>
                            <th class="p-2 border w-[26%] text-sm">Tanggal Transaksi</th>
                            <th class="p-2 border w-[25%] text-sm">Penerima</th>
                            <th class="p-2 border w-[5%] text-sm">Aksi</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr
                            v-for="(riwayat, index) in tabungan.riwayat_tabungan"
                            :key="index"
                            class="border-t hover:bg-gray-200 text-sm"
                          >
                            <td class="p-2 border">{{ index + 1 }}</td>
                            <td class="p-2 border">{{ riwayat.invoice }}</td>
                            <td class="p-2 border">
                              Rp {{ riwayat.nominal_tabungan.toLocaleString() }},-
                            </td>
                            <td class="p-2 border">{{ riwayat.transaksi }}</td>
                            <td class="p-2 border">{{ riwayat.penerima }}</td>
                            <td class="p-2 border">
                              <button
                                class="rounded bg-gray-200 p-2 hover:bg-gray-300"
                                @click.prevent="cetakKwitansi(riwayat.invoice)"
                              >
                                <CetakIcon class="h-4 w-4 text-gray-600" />
                              </button>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </template>
                  <template v-else>
                    <p class="text-gray-500 text-xs italic mt-2 text-center mb-2">
                      Daftar Riwayat Tabungan Umrah Tidak Ditemukan
                    </p>
                  </template>
                  <div class="rounded-t bg-gray-200 px-2 py-2 font-semibold text-center">
                    Riwayat Handover Fasilitas
                  </div>
                  <template v-if="tabungan.riwayat_handover_fasilitas.length">
                    <div>
                      <div class="border border-gray-200 p-4 rounded flex flex-wrap gap-3">
                        <span
                          v-for="(item, index) in tabungan.riwayat_handover_fasilitas || []"
                          :key="index"
                          class="border border-black px-4 py-2 rounded hover:bg-gray-100 transition"
                        >
                          {{ index + 1 + '# ' + item.name }}
                        </span>
                      </div>
                    </div>
                  </template>
                  <template v-else>
                    <p class="text-gray-500 text-md italic mt-2 text-center mb-2">
                      Daftar Handover Fasilitas Tidak Ditemukan
                    </p>
                  </template>
                </div>
              </td>
              <td
                v-if="filter !== 'sudah_beli_paket' && filter !== 'batal_berangkat'"
                class="px-6 py-4 text-center grid grid-cols-2 gap-2"
              >
                <div class="grid">
                  <LightButton
                    col-span-1
                    title="Cetak Data Jamaah"
                    @click="openFormCetakDataJamaah(tabungan)"
                  >
                    <CetakIcon class="h-4 w-4 text-gray-600" />
                  </LightButton>
                  <LightButton
                    col-span-1
                    title="Update Target Paket"
                    @click="openFormUpdate(tabungan)"
                  >
                    <EditIcon class="h-4 w-4 text-gray-600" />
                  </LightButton>
                  <LightButton col-span-1 title="Refund Tabungan" @click="openFormRefund(tabungan)">
                    <RefundIcon class="h-4 w-4 text-gray-600" />
                  </LightButton>
                  <LightButton col-span-1 title="Menabung" @click="openFormMenabung(tabungan)">
                    <NabungIcon class="h-4 w-4 text-gray-600" />
                  </LightButton>
                  <LightButton
                    v-if="tabungan.target_paket_name != '-'"
                    col-span-1
                    title="Handover Fasilitas"
                    @click="openFormAddHandover(tabungan)"
                  >
                    <HandoverIcon class="h-4 w-4 text-gray-600" />
                  </LightButton>
                  <LightButton
                    col-span-1
                    title="Handover Barang"
                    @click="openFormOpsiHandoverBarang(tabungan)"
                  >
                    <HandoverBarangIcon class="h-4 w-4 text-gray-600" />
                  </LightButton>
                  <template v-if="tabungan.status_paket">
                    <LightButton
                      col-span-1
                      title="Beli Paket Umrah"
                      @click="openFormBeliPaketUmrah(tabungan)"
                    >
                      <BeliPaketIcon class="h-4 w-4 text-gray-600" />
                    </LightButton>
                  </template>
                  <DangerButton title="Hapus Tabungan" @click="deleteData(tabungan.id)">
                    <DeleteIcon></DeleteIcon>
                  </DangerButton>
                </div>
              </td>
            </tr>
            <tr v-else>
              <td
                :colspan="filter === 'sudah_beli_paket' ? 2 : 3"
                class="px-6 py-4 text-center text-sm text-gray-600"
              >
                Daftar Tabungan Umrah Tidak Ditemukan.
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
  </div>

  <!-- Form Add -->
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
      :cabang-id="filterCabang"
      @close="
        isFormOpen = false;
        fetchData();
      "
      @status="
        (payload) =>
          displayNotification(
            payload.err_msg || 'Tabungan Umrah gagal ditambahkan',
            payload.error ? 'error' : 'success',
          )
      "
    />
  </transition>

  <!-- Form Update -->
  <transition
    enter-active-class="transition duration-200 ease-out"
    enter-from-class="transform scale-95 opacity-0"
    enter-to-class="transform scale-100 opacity-100"
    leave-active-class="transition duration-200 ease-in"
    leave-from-class="transform scale-100 opacity-100"
    leave-to-class="transform scale-95 opacity-0"
  >
    <FormUpdate
      v-if="isFormUpdateOpen"
      :isFormUpdateOpen="isFormUpdateOpen"
      :tabungan-id="tabunganId"
      :cabang-id="filterCabang"
      @close="
        isFormUpdateOpen = false;
        fetchData();
      "
      @status="
        (payload) =>
          displayNotification(
            payload.err_msg || 'Target Paket Tabungan Umrah gagal diupdate',
            payload.error ? 'error' : 'success',
          )
      "
    />
  </transition>

  <!-- Form Add Menabung -->
  <transition
    enter-active-class="transition duration-200 ease-out"
    enter-from-class="transform scale-95 opacity-0"
    enter-to-class="transform scale-100 opacity-100"
    leave-active-class="transition duration-200 ease-in"
    leave-from-class="transform scale-100 opacity-100"
    leave-to-class="transform scale-95 opacity-0"
  >
    <FormMenabung
      v-if="isFormMenabungOpen"
      :isFormMenabungOpen="isFormMenabungOpen"
      :tabunganId="tabunganId"
      :cabang-id="filterCabang"
      @close="
        isFormMenabungOpen = false;
        fetchData();
      "
      @status="
        (payload) =>
          displayNotification(
            payload.err_msg || 'Menabung Tabungan Umrah gagal ditambahkan',
            payload.error ? 'error' : 'success',
          )
      "
    />
  </transition>

  <!-- Form Refund -->
  <transition
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
      :tabunganId="tabunganId"
      :cabang-id="filterCabang"
      @close="
        isFormRefundOpen = false;
        fetchData();
      "
      @status="
        (payload) =>
          displayNotification(
            payload.err_msg || 'Tabungan Umrah gagal direfund',
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
    <FormAddHandover
      v-if="isFormAddHandoverOpen"
      :isFormAddHandoverOpen="isFormAddHandoverOpen"
      :tabunganId="tabunganId"
      @close="
        isFormAddHandoverOpen = false;
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
      :tabunganId="tabunganId"
      :cabang-id="filterCabang"
      @close="
        isFormCetakDataJamaahOpen = false;
        fetchData();
      "
      @status="
        (payload) =>
          displayNotification(
            payload.err_msg || 'Jamaah gagal dicetak',
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
      :tabunganId="tabunganId"
      @close="
        isFormOpsiHandoverBarangOpen = false;
        fetchData();
      "
      @terima-barang="
        isFormOpsiHandoverBarangOpen = false;
        openTerimaBarangHandover(tabunganId);
      "
      @pengembalian-barang="
        isFormOpsiHandoverBarangOpen = false;
        openPengembalianBarangHandover(tabunganId);
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
      :tabunganId="tabunganId"
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
      :tabunganId="tabunganId"
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

  <!-- Form Beli Paket -->
  <transition
    enter-active-class="transition duration-200 ease-out"
    enter-from-class="transform scale-95 opacity-0"
    enter-to-class="transform scale-100 opacity-100"
    leave-active-class="transition duration-200 ease-in"
    leave-from-class="transform scale-100 opacity-100"
    leave-to-class="transform scale-95 opacity-0"
  >
    <FormBeliPaket
      v-if="isFormBeliPaketUmrahOpen"
      :isFormBeliPaketUmrahOpen="isFormBeliPaketUmrahOpen"
      :tabunganId="tabunganId"
      :cabangId="filterCabang"
      @close="
        isFormBeliPaketUmrahOpen = false;
        fetchData();
      "
      @status="
        (payload) => {
          displayNotification(
            payload.err_msg || 'Paket Umrah gagal dibeli',
            payload.error ? 'error' : 'success',
          );
          if (!payload.error) {
            filter = 'sudah_beli_paket';
            isDaftarTransaksiPaketOpen = true;
            fetchData();
          }
        }
      "
    />
  </transition>

  <!-- Form Transaksi Paket -->
  <DaftarTransaksiPaket
    v-if="isDaftarTransaksiPaketOpen"
    :paketId="paketId"
    :search="dataSearch"
    :showBackButton="true"
    :showAddTransactionButton="false"
    @close="
      isDaftarTransaksiPaketOpen = false;
      fetchData();
    "
  />
  <!-- Confirmation Dialog -->
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
</template>
