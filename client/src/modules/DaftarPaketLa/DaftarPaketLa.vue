<script setup lang="ts">
// Import Icon
import DeleteIcon from '@/modules/DaftarPaketLa/Icon/DeleteIcon.vue';
import EditIcon from '@/modules/DaftarPaketLa/Icon/EditIcon.vue';
import Pagination from '@/components/Pagination/Pagination.vue';
// import element
import Notification from '@/modules/DaftarPaketLa/Particle/Notification.vue';
import Confirmation from '@/modules/DaftarPaketLa/Particle/Confirmation.vue';
import FormItem from '@/modules/DaftarPaketLa/Particle/FormItem.vue';
import FormPembayaran from '@/modules/DaftarPaketLa/Particle/FormPembayaran.vue';
import FormRefund from '@/modules/DaftarPaketLa/Particle/FormRefund.vue';
import Form from '@/modules/DaftarPaketLa/Particle/Form.vue';

import LightButton from '@/components/Button/LightButton.vue';
import DangerButton from '@/components/Button/DangerButton.vue';

// import API
import { daftarPaketLA, addPaketLA, editPaketLA, deletePaketLA } from '@/service/daftar_paket_la';
import { daftarFasilitasPaketLA, deleteFasilitasPaketLA } from '@/service/fasilitas_paket_la';

import { ref, onMounted, computed } from 'vue';
import axios from 'axios';

const itemsPerPage = 100; // Jumlah paket_la per halaman
const currentPage = ref(1);
const search = ref('');
const totalPages = ref(0);
const totalRow = ref(0);

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

interface PaketLA {
  id: number;
  register_number: string;
  kostumer_id: number;
  client_name: string;
  client_hp_number: string;
  client_address: string;
  status: string;
  discount: number;
  total_price: number;
  total_jamaah: number;
  departure_date: string;
  arrival_date: string;
  terbayar: number;
  sisa: number;
}

interface Errors {
  client_name: string;
  client_hp_number: string;
  client_address: string;
  discount: string;
  total_jamaah: string;
  departure_date: string;
  arrival_date: string;
}

const paketlaId = ref<number>(0); // Id number untuk form item
const registerNumber = ref<string | null>(null); // regNumb untuk form KwitansiTerakhir
const fasilitaspaketla = ref<any[]>([]); // Array untuk menyimpan data fasilitas
const timeoutId = ref<number | null>(null);
const dataPaketLA = ref<PaketLA[]>([]);
const isModalOpen = ref<boolean>(false);
const isFormItemOpen = ref<boolean>(false);
const isFormPembayaranOpen = ref<boolean>(false);
const isFormRefundOpen = ref<boolean>(false);
const showConfirmDialog = ref<boolean>(false);
const showNotification = ref<boolean>(false);
const notificationMessage = ref<string>('');
const notificationType = ref<'success' | 'error'>('success');
const confirmMessage = ref<string>('');
const confirmTitle = ref<string>('');
const confirmAction = ref<(() => void) | null>(null);
const totalColumns = ref(4); // Default 3 kolom

const selectedPaketLA = ref<Partial<PaketLA>>({
  client_name: '',
  client_hp_number: '',
  client_address: '',
  discount: 0,
  total_price: 0,
  total_jamaah: 0,
  departure_date: '',
  arrival_date: '',
});

const errors = ref<Errors>({
  client_name: '',
  client_hp_number: '',
  client_address: '',
  discount: '',
  total_jamaah: '',
  departure_date: '',
  arrival_date: '',
});

const fetchData = async () => {
  try {
    const response = await daftarPaketLA({
      search: search.value,
      perpage: itemsPerPage,
      pageNumber: currentPage.value,
    });

    if (response.error) {
      displayNotification(response.error_msg, 'error');
      return;
    }

    totalPages.value = Math.ceil(response.total / itemsPerPage);
    totalRow.value = response.total;

    const fasilitasResponse = await daftarFasilitasPaketLA({
      search: search.value,
      perpage: itemsPerPage,
      pageNumber: currentPage.value,
    });

    if (fasilitasResponse.error) {
      displayNotification(fasilitasResponse.error_msg, 'error');
      return;
    }

    fasilitaspaketla.value = fasilitasResponse.data || [];
    dataPaketLA.value = response.data || [];
  } catch (error) {
    console.error('Error fetching data:', error);
    displayNotification('Gagal mengambil data.', 'error');
  }
};

const openModal = (paket_la?: PaketLA) => {
  selectedPaketLA.value = paket_la
    ? { ...paket_la }
    : {
        client_name: '',
        client_hp_number: '',
        client_address: '',
        discount: 0,
        total_jamaah: 0,
        departure_date: '',
        arrival_date: '',
      };

  isModalOpen.value = true;
};

const openFormItem = (id: number) => {
  paketlaId.value = id;
  isFormItemOpen.value = true;
};
const openFormPembayaran = (id: number, register_number: string) => {
  paketlaId.value = id;
  registerNumber.value = register_number;
  isFormPembayaranOpen.value = true;
};

const openFormRefund = (id: number, register_number: string) => {
  paketlaId.value = id;
  registerNumber.value = register_number;
  isFormRefundOpen.value = true;
};

onMounted(async () => {
  await fetchData();
});

const validateModal = (): boolean => {
  errors.value = { client_name: '', total_jamaah: '', departure_date: '', arrival_date: '' };
  let isValid = true;

  if (!selectedPaketLA.value.client_name) {
    errors.value.client_name = 'Klien tidak boleh kosong.';
    isValid = false;
  }

  if (!selectedPaketLA.value.total_jamaah) {
    errors.value.total_jamaah = 'Jumlah jamaah tidak boleh kosong.';
    isValid = false;
  }

  if (!selectedPaketLA.value.departure_date) {
    errors.value.departure_date = 'Tanggal keberangkatan tidak boleh kosong.';
    isValid = false;
  }

  if (!selectedPaketLA.value.arrival_date) {
    errors.value.arrival_date = 'Tanggal kedatangan tidak boleh kosong.';
    isValid = false;
  }

  return isValid;
};

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

const saveData = async () => {
  if (!validateModal()) return;
  const paketLAData = { ...selectedPaketLA.value };

  console.log('Data paketLAData:', paketLAData); // Debugging

  const isEdit = !!selectedPaketLA.value.id;
  const action = async () => {
    try {
      let response;
      if (isEdit) {
        response = await editPaketLA(selectedPaketLA.value.id, paketLAData);
      } else {
        response = await addPaketLA(paketLAData);
      }

      console.log('Response dari API:', response); // Debugging

      showConfirmDialog.value = false;
      displayNotification(response?.error_msg || 'Paket berhasil disimpan!', 'success');
      isModalOpen.value = false;
      fetchData();
    } catch (error) {
      console.error('Error saat menyimpan:', error); // Debugging

      if (axios.isAxiosError(error)) {
        console.log('Response Error dari API:', error.response?.data); // Debugging
        displayNotification(
          error.response?.data?.error_msg || 'Terjadi kesalahan saat menyimpan data.',
          'error',
        );
      } else {
        displayNotification('Terjadi kesalahan yang tidak terduga.', 'error');
      }
      showConfirmDialog.value = false;
    }
  };

  isEdit
    ? showConfirmation('Konfirmasi Perubahan', 'Apakah Anda yakin ingin mengubah data ini?', action)
    : action();
};

const deleteData = async (id: number) => {
  showConfirmation('Konfirmasi Hapus', 'Apakah Anda yakin ingin menghapus data ini?', async () => {
    try {
      const response = await deletePaketLA(id);
      showConfirmDialog.value = false;
      displayNotification(response.error_msg);
      fetchData();
    } catch (error) {
      console.error('Error deleting data:', error);
      displayNotification('Terjadi kesalahan saat menghapus data.', 'error');
    }
  });
};

const deleteItem = async (id: number, fasilitaspaketlaId: number) => {
  showConfirmation('Konfirmasi Hapus', `Apakah Anda yakin ingin menghapus item?`, async () => {
    try {
      const response = await deleteFasilitasPaketLA(id, fasilitaspaketlaId);
      if (response.error) {
        displayNotification(response.error_msg, 'error');
        return;
      }
      showConfirmDialog.value = false;
      displayNotification('Item berhasil dihapus', 'success');
      fetchData();
    } catch (error) {
      console.error('Error deleting item:', error);
      displayNotification('Terjadi kesalahan saat menghapus item.', 'error');
    }
  });
};

const cetakInvoice = async (invoice: string) => {
  try {
    if (!invoice) {
      displayNotification('Nomor invoice tidak tersedia', 'error');
      return;
    }

    const url = `/invoice-paket-la/${invoice}`;
    window.open(url, '_blank', 'noopener,noreferrer,width=800,height=600,scrollbars=yes');
  } catch (error) {
    console.error('Error printing invoice:', error);
    displayNotification('Terjadi kesalahan saat membuka invoice.', 'error');
  }
};
</script>
<template>
  <div class="container mx-auto p-4">
    <div class="flex justify-between mb-4">
      <button
        @click="openModal()"
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
        Tambah Transaksi Paket LA
      </button>
      <div class="flex items-center">
        <label for="search" class="block text-sm font-medium text-gray-700 mr-2">Search</label>
        <input
          type="text"
          id="search"
          class="block w-64 px-3 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
          v-model="search"
          @change="fetchData()"
          placeholder="Cari data..."
        />
      </div>
    </div>
    <div class="overflow-hidden rounded-lg border border-gray-200 shadow-md mb-5">
      <table class="w-full border-collapse bg-white text-left text-sm text-gray-500">
        <thead class="bg-gray-100">
          <tr>
            <th class="w-[15%] px-6 py-3 font-medium text-gray-900 text-center">No. Register</th>
            <th class="w-[40%] px-6 py-3 font-medium text-gray-900 text-center">
              Info Klien & Harga
            </th>
            <th class="w-[40%] px-6 py-3 font-medium text-gray-900 text-center">
              Info Item Transaksi
            </th>
            <th class="w-[5%] px-6 py-3 font-medium text-gray-900 text-center">Aksi</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100 border-t border-gray-100">
          <template v-if="dataPaketLA.length > 0">
            <tr v-for="paket in dataPaketLA" :key="paket.id">
              <td class="p-3 border-gray-300 align-top font-bold text-center">
                #{{ paket.register_number }}
              </td>
              <td class="py-3 px-6 border-gray-300 align-top">
                <table class="w-full mb-5">
                  <thead>
                    <tr>
                      <th
                        colspan="3"
                        class="text-center py-2 font-medium border text-gray-900 bg-gray-100"
                      >
                        Info Klien
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="(label, value) in {
                        'Nama Klien': paket.client_name,
                        'Nomor HP': paket.client_hp_number,
                        Alamat: paket.client_address,
                      }"
                      :key="label"
                      class="border-gray-200 hover:bg-gray-200"
                    >
                      <td class="w-[40%] border-b px-6 py-2">{{ value }}</td>
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
                        Info Harga
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td class="w-[40%] border-b px-6 py-2">Total Harga</td>
                      <td class="text-center border-b py-2">:</td>
                      <td class="text-right space-y-2 text-sm border-b px-6 py-2">
                        Rp {{ paket.total_price.toLocaleString() }}
                      </td>
                    </tr>
                    <tr>
                      <td class="border-b px-6 py-2">Diskon</td>
                      <td class="text-center border-b py-2">:</td>
                      <td class="text-right space-y-2 text-sm border-b px-6 py-2">
                        Rp {{ paket.discount.toLocaleString() }}
                      </td>
                    </tr>
                    <tr>
                      <td class="border-b px-6 py-2">Sudah Dibayar</td>
                      <td class="text-center border-b py-2">:</td>
                      <td class="text-right space-y-2 text-sm border-b px-6 py-2">
                        Rp {{ paket.terbayar.toLocaleString() }}
                      </td>
                    </tr>
                    <tr>
                      <td class="border-b px-6 py-2">Sisa</td>
                      <td class="text-center border-b py-2">:</td>
                      <td class="text-right space-y-2 text-sm border-b px-6 py-2">
                        Rp {{ paket.sisa.toLocaleString() }}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>
              <td class="px-3 py-3 border-gray-300 align-top text-center">
                <template v-if="fasilitaspaketla.length > 0">
                  <div
                    v-for="invoice in fasilitaspaketla.filter(
                      (inv) => inv.paket_la_id === paket.id,
                    )"
                    :key="invoice.id"
                    class="mb-4 px-2 py-0 bg-white"
                  >
                    <table class="w-full mb-5">
                      <thead>
                        <tr>
                          <th
                            colspan="3"
                            class="text-center py-2 font-medium border text-gray-900 bg-gray-100"
                          >
                            Info Total Transaksi
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td class="w-[25%] border-b px-6 py-2 text-left">Invoice</td>
                          <td class="text-center border-b py-2">:</td>
                          <td class="text-right space-y-2 text-sm border-b px-6 py-2">
                            {{ invoice.invoice }}
                          </td>
                        </tr>
                        <tr>
                          <td class="border-b px-6 py-2 text-left">Total</td>
                          <td class="text-center border-b py-2">:</td>
                          <td class="text-right space-y-2 text-sm border-b px-6 py-2">
                            Rp {{ invoice.total.toLocaleString() }},-
                          </td>
                        </tr>
                        <tr>
                          <td class="border-b px-6 py-0 text-left">Print BTN</td>
                          <td class="text-center border-b py-0">:</td>
                          <td class="space-y-2 text-sm border-b px-5 py-0">
                            <button
                              type="button"
                              class="float-right h-[35px] mx-[0.1rem] px-4 my-1 py-1 flex justify-center items-center rounded-lg text-gray-900 border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium text-sm dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700"
                              @click="cetakInvoice(invoice.invoice)"
                            >
                              <i class="fas fa-print" style="font-size: 11px"></i> Cetak Invoice
                            </button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                    <table class="w-full mt-2 border text-center text-xs">
                      <thead>
                        <tr class="text-center py-2 font-medium border text-gray-900 bg-gray-100">
                          <th class="p-2 border">Deskripsi</th>
                          <th class="p-2 border">Check-in / Check-out</th>
                          <th class="p-2 border">Day / Pax</th>
                          <th class="p-2 border">Price</th>
                          <th class="p-2 border">Aksi</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr
                          v-for="item in invoice.detail_fasilitas"
                          :key="item.id"
                          class="text-center"
                        >
                          <td class="p-2">{{ item.description }}</td>
                          <td class="p-2">{{ item.check_in }} / {{ item.check_out }}</td>
                          <td class="p-2">{{ item.day }} / {{ item.pax }}</td>
                          <td class="p-2">Rp {{ item.price.toLocaleString() }}</td>
                          <td class="p-2">
                            <button
                              @click="deleteItem(item.id, invoice.id)"
                              class="px-1.5 py-1.5 bg-red-500 text-white font-bold rounded hover:bg-red-600"
                            >
                              <DeleteIcon />
                            </button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </template>
                <template v-else>
                  <div class="p-3">
                    <span class="text-center">Item Tidak Ditemukan</span>
                  </div>
                </template>
              </td>
              <td class="px-6 py-4 text-center align-top">
                <div class="flex flex-col items-center gap-2">
                  <LightButton @click="openFormItem(paket.id)">
                    <font-awesome-icon icon="fa-solid fa-box" />
                  </LightButton>
                  <LightButton @click="openFormPembayaran(paket.id, paket.register_number)">
                    <font-awesome-icon icon="fa-solid fa-money-bill-alt" />
                  </LightButton>
                  <LightButton @click="openFormRefund(paket.id, paket.register_number)">
                    <font-awesome-icon icon="fa-solid fa-undo-alt" />
                  </LightButton>
                  <LightButton>
                    <font-awesome-icon icon="fa-solid fa-list-alt" />
                  </LightButton>
                  <LightButton @click="openModal(paket)" class="p-2 rounded">
                    <EditIcon />
                  </LightButton>
                  <DangerButton @click="deleteData(paket.id)" class="p-2 rounded">
                    <DeleteIcon />
                  </DangerButton>
                </div>
              </td>
            </tr>
          </template>
          <tr v-else>
            <td colspan="5" class="p-4 text-center text-gray-600">Tidak ada data paket la.</td>
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

  <!-- Modal -->
  <!-- <transition
    enter-active-class="transition duration-200 ease-out"
    enter-from-class="transform scale-95 opacity-0"
    enter-to-class="transform scale-100 opacity-100"
    leave-active-class="transition duration-200 ease-in"
    leave-from-class="transform scale-100 opacity-100"
    leave-to-class="transform scale-95 opacity-0"
  > -->
  <Form
    v-if="isModalOpen && selectedPaketLA"
    :isModalOpen="isModalOpen"
    :selectedPaketLA="selectedPaketLA"
    :errors="errors"
    @save="saveData"
    @close="
      isModalOpen = false;
      fetchData();
    "
  />
  <!-- </transition> -->

  <!-- FormItem Overlay -->
  <Transition
    enter-active-class="transition-opacity duration-200 ease-out"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition-opacity duration-200 ease-in"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <FormItem
      v-if="isFormItemOpen"
      :isFormItemOpen="isFormItemOpen"
      :paketlaId="paketlaId"
      @close="
        isFormItemOpen = false;
        fetchData();
      "
    />
  </Transition>

  <!-- FormPembayaran Overlay -->
  <Transition
    enter-active-class="transition-opacity duration-200 ease-out"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition-opacity duration-200 ease-in"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <FormPembayaran
      v-if="isFormPembayaranOpen"
      :isFormPembayaranOpen="isFormPembayaranOpen"
      :paketlaId="paketlaId"
      :registerNumber="registerNumber"
      @close="
        isFormPembayaranOpen = false;
        fetchData();
      "
    />
  </Transition>

  <!-- FormPembayaran Overlay -->
  <Transition
    enter-active-class="transition-opacity duration-200 ease-out"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition-opacity duration-200 ease-in"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <FormRefund
      v-if="isFormRefundOpen"
      :isFormRefundOpen="isFormRefundOpen"
      :paketlaId="paketlaId"
      :registerNumber="registerNumber"
      @close="
        isFormRefundOpen = false;
        fetchData();
      "
    />
  </Transition>

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

  <!-- Notification Popup -->
  <Notification
    :showNotification="showNotification"
    :notificationType="notificationType"
    :notificationMessage="notificationMessage"
    @close="showNotification = false"
  ></Notification>
</template>
