<template>
  <div class="container mx-auto px-4 mt-10">
    <div class="flex justify-between items-center mb-6">
      <PrimaryButton @click="startTicketTransaction">
        <i class="pi pi-plus"></i> Mulai Transaksi Tiket
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
    <div class="overflow-hidden rounded-lg border border-gray-200 shadow-md">
      <table class="w-full border-collapse bg-white text-left text-sm text-gray-500">
        <thead class="bg-gray-50">
          <tr class="bg-gray-100">
            <th class="w-[15%] px-6 py-3 font-medium font-bold text-gray-900 text-center">
              Nomor Register
            </th>
            <th class="w-[45%] px-6 py-3 font-medium font-bold text-gray-900 text-center">
              Info Tiket
            </th>
            <th class="w-[35%] px-6 py-3 font-medium font-bold text-gray-900 text-center">
              Info Pembayaran
            </th>
            <th class="w-[5%] px-6 py-3 font-medium font-bold text-gray-900 text-center">Aksi</th>
          </tr>
        </thead>
        <tbody v-if="data.length" class="divide-y divide-gray-100 border-t border-gray-100">
          <tr v-for="transaction in data" :key="transaction?.id">
            <td
              class="px-4 py-2 align-top text-sm text-gray-800 whitespace-nowrap"
              :class="transaction.status != 'active' ? ' pointer-events-none opacity-50 ' : ''"
            >
              <div class="font-bold text-sm">{{ transaction.nomor_registrasi }}</div>
              <div class="text-xs text-gray-500">
                {{ new Date(transaction.updatedAt).toLocaleString() }}
              </div>
            </td>
            <td
              class="px-4 py-2 text-sm text-gray-700 align-top w-[480px]"
              :class="transaction.status != 'active' ? ' pointer-events-none opacity-50 ' : ''"
            >
              <div class="grid grid-cols-2 gap-x-6 gap-y-1 text-xs leading-snug">
                <div class="text-red-500">
                  KODE BOOKING: <b>{{ transaction.code_booking }}</b>
                </div>
                <div>PAX: {{ transaction.pax }}</div>
                <div>NAMA AIRLINES: {{ transaction.airlines_name || 'N/A' }}</div>
                <div>HARGA TRAVEL: Rp {{ transaction.travel_price.toLocaleString() }}</div>
                <div>TANGGAL BERANGKAT: {{ transaction.departure_date }}</div>
                <div>HARGA KOSTUMER: Rp {{ transaction.costumer_price.toLocaleString() }}</div>
                <div v-if="transaction.arrival_date != null">
                  TANGGAL KEPULANGAN: {{ transaction.arrival_date }}
                </div>
              </div>
              <div
                class="bg-red-100 mt-2 px-4 py-1 text-sm font-bold flex justify-between items-center w-full"
              >
                <span>SUBTOTAL</span>
                <span class="text-red-500"
                  >: Rp {{ (transaction.costumer_price * transaction.pax).toLocaleString() }}</span
                >
              </div>
            </td>
            <td
              class="px-4 py-2 text-xs text-gray-700 align-top"
              :class="transaction.status != 'active' ? ' pointer-events-none opacity-50 ' : ''"
            >
              <div class="space-y-1" v-if="transaction.status == 'active'">
                <template v-if="transaction.paket_name">
                  <strong>NAMA PAKET</strong> : {{ transaction.paket_name || 'N/A' }}
                </template>
                <template v-else>
                  <div>
                    <strong>NAMA PELANGGAN</strong> : {{ transaction.costumer_name || 'N/A' }}
                  </div>
                </template>
                <div>
                  <strong>TOTAL TRANSAKSI TIKET</strong> : Rp
                  {{ (transaction.costumer_price * transaction.pax).toLocaleString() }}
                </div>
                <div>
                  <strong>TOTAL PEMBAYARAN</strong> : Rp
                  {{ calculateTotalPayment(transaction).toLocaleString() }}
                </div>
                <div>
                  <strong>SISA PEMBAYARAN</strong> : Rp
                  {{
                    (
                      transaction.costumer_price * transaction.pax -
                      calculateTotalPayment(transaction)
                    ).toLocaleString()
                  }}
                </div>
              </div>
              <div class="space-y-1 text-center py-5" v-if="transaction.status == 'refund'">
                <strong class="text-red">TRANSAKSI SUDAH DIREFUND</strong>
              </div>
              <div
                v-if="transaction.payment_histories.length"
                class="mt-2 text-xs text-gray-600 border-t pt-2"
              >
                <div class="text-red-500 italic font-medium">
                  RIWAYAT PEMBAYARAN (Tiga transaksi terakhir)
                </div>
                <table class="w-full mb-5">
                  <tbody>
                    <tr
                      v-for="payment in transaction.payment_histories.slice(0, 3)"
                      :key="payment.id"
                    >
                      <td class="w-[30%] border-b border-dashed px-0 py-2 align-top">
                        {{ new Date(payment.createdAt).toLocaleString() }}
                      </td>
                      <td
                        class="text-left space-y-2 text-xs border-b border-dashed px-0 py-2 align-top"
                      >
                        Invoice:
                        <span class="text-red-600 font-semibold">{{ payment.invoice }}</span> |
                        Biaya: {{ formatRupiah(payment.nominal) }} | Nama Petugas:
                        {{ payment.petugas }}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </td>
            <td class="px-4 py-2 text-center align-top">
              <div class="flex flex-col items-center space-y-2">
                <LightButton
                  v-if="
                    transaction.costumer_price * transaction.pax >
                      calculateTotalPayment(transaction) && transaction.status == 'active'
                  "
                  class="p-2"
                  title="Pembayaran Tiket"
                  @click="openPembayaranForm(transaction.id)"
                >
                  <i class="pi pi-money-bill"></i>
                </LightButton>
                <LightButton
                  v-if="transaction.status == 'active'"
                  @click="openModalRefund(transaction.id)"
                  class="p-2"
                  title="Refund Tiket"
                >
                  <i class="pi pi-refresh"></i>
                </LightButton>
                <LightButton
                  @click="openModalEdit(transaction.id)"
                  class="p-2"
                  title="Edit Transaksi Tiket"
                  v-if="transaction.status == 'active'"
                >
                  <i class="pi pi-pencil"></i>
                </LightButton>
                <LightButton
                  class="p-2"
                  @click="openModalDetail(transaction.id)"
                  title="Detail Riwayat Pembayaran Tiket"
                >
                  <i class="pi pi-list"></i>
                </LightButton>
                <DangerButton
                  class="p-2"
                  title="Delete Tiket"
                  v-if="transaction.status == 'active'"
                  @click="deleteData(transaction.id)"
                >
                  <i class="pi pi-times"></i>
                </DangerButton>
              </div>
            </td>
          </tr>
        </tbody>
        <tbody v-else class="divide-y divide-gray-100 border-t border-gray-100">
          <tr>
            <td :colspan="totalColumns" class="px-6 py-3 text-center text-gray-500">
              Daftar transaksi tiket tidak di temukan
            </td>
          </tr>
        </tbody>
        <tfoot class="bg-gray-100 font-bold">
          <Pagination
            :current-page="currentPage"
            :totalRow="totalRow"
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
  <!-- Form untuk memulai transaksi pembelian tiket -->
  <FormTicketTransaction
    :showForm="showTicketTransactionDialog"
    @cancel="closeTicketTransactionForm"
    @submitted="onTicketTransactionSubmitted"
  />
  <!-- Form untuk pembayaran tiket -->
  <FormPembayaranTiket
    :formStatus="showModalPembayaran"
    :id="idPembayaranTicket"
    @cancel="showModalPembayaran = false"
    @submitted="
      () => {
        showModalPembayaran = false;
        fetchData();
      }
    "
  />
  <!-- Form untuk transaksi refund -->
  <FormRefun
    :formStatus="showModalRefund"
    :id="idRefundTicket"
    @cancel="showModalRefund = false"
    @close="showModalRefund = false"
    @submitted="
      () => {
        showModalRefund = false;
        fetchData();
      }
    "
  />
  <!-- Show detail Tiket -->
  <DetailTiket :formStatus="ShowModalDetail" :id="idDetail" @cancel="closeModalDetail" />
  <!-- Show Edit Form -->
  <FormEdit
    :formStatus="showModalEdit"
    :id="idEditTicket"
    @cancel="showModalEdit = false"
    @close="showModalEdit = false"
    @submitted="
      () => {
        showModalEdit = false;
        fetchData();
      }
    "
  />
  <!-- Show Notification -->
  <Notification
    :showNotification="showNotification"
    :notificationType="notificationType"
    :notificationMessage="notificationMessage"
    @close="showNotification = false"
  />
  <!-- Show Confirmation Dialog -->
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
</template>

<script setup lang="ts">
import DangerButton from '@/components/Button/DangerButton.vue';
import LightButton from '@/components/Button/LightButton.vue';
import PrimaryButton from '@/components/Button/PrimaryButton.vue';
import Pagination from '@/components/Pagination/Pagination.vue';
import Notification from '@/components/Modal/Notification.vue';
import Confirmation from '@/components/Modal/Confirmation.vue';
import { computed, ref, onMounted } from 'vue';
import { get_transactions, deleteUrl } from '@/service/trans_tiket';
import { paramCabang } from '@/service/param_cabang';
import FormTicketTransaction from './Particle/FormTicketTransaction.vue';
import FormPembayaranTiket from './Particle/FormPembayaranTiket.vue';
import FormEdit from './Particle/FormEdit.vue';
import FormRefun from './Particle/FormRefun.vue';
import DetailTiket from './Particle/DetailTiket.vue';

const data = ref<TicketTransaction[]>([]);
// const maskapaiList = ref<Maskapai[]>([])
const currentPage = ref(1);
const totalPages = ref(0);
const totalColumns = ref(4);
const totalRow = ref(0);
// const searchQuery = ref('')
const itemsPerPage = 2;
const search = ref('');
const filter = ref('');
const idPembayaranTicket = ref(0);
const idRefundTicket = ref(0);
const idEditTicket = ref(0);
const idDetail = ref(0);

// Notifikasi Setting
const showNotification = ref(false);
const notificationMessage = ref('');
const notificationType = ref('');
const timeoutId = ref<number | null>(null);
const displayNotification = (message: string, type: 'success' | 'error' = 'success') => {
  notificationMessage.value = message;
  notificationType.value = type;
  showNotification.value = true;
  resetNotificationTimeout();
};
const resetNotificationTimeout = () => {
  if (timeoutId.value) clearTimeout(timeoutId.value);
  timeoutId.value = window.setTimeout(() => {
    showNotification.value = false;
  }, 3000);
};

// Konfirmasi Setting
const showConfirmDialog = ref<boolean>(false);
const confirmMessage = ref<string>('');
const confirmTitle = ref<string>('');
const confirmAction = ref<(() => void) | null>(null);
const showConfirmation = (title: string, message: string, action: () => void) => {
  confirmTitle.value = title;
  confirmMessage.value = message;
  confirmAction.value = action;
  showConfirmDialog.value = true;
};

const pages = computed(() => {
  return Array.from({ length: totalPages.value }, (_, i) => i + 1);
});

interface TicketTransaction {
  id: number;
  division_id: number;
  nomor_registrasi: string;
  costumer_id: number;
  costumer_name: string;
  pax: number;
  code_booking: string;
  airlines_name: string | null;
  departure_date: string;
  arrival_date: string;
  travel_price: number;
  costumer_price: number;
  paket_name: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  payment_histories: PaymentHistory[];
}

interface PaymentHistory {
  id: number;
  invoice: string;
  paket_name: string;
  petugas: string;
  nominal: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

const fetchData = async () => {
  try {
    const response = await get_transactions({
      search: search.value,
      filter: filter.value,
      perpage: itemsPerPage || 10,
      pageNumber: currentPage.value || 1,
      cabang: selectedOptionCabang.value,
    });
    data.value = response.data;
    totalRow.value = response.total;
    console.log('data transaction -->');
    console.log(JSON.stringify(data.value));
    totalPages.value = Math.ceil(response.total / itemsPerPage);
  } catch (error) {
    console.error('Gagal fetch data ticket transactions:', error);
  }
};

interface Cabang {
  id: number;
  name: string;
}

interface filterCabang {
  id: number;
  name: string;
}

const selectedOptionCabang = ref(0);
const optionFilterCabang = ref<filterCabang[]>([]);
const fetchFilterData = async () => {
  const response = await paramCabang();
  optionFilterCabang.value = response.data;
  selectedOptionCabang.value = response.data[0].id;
  await fetchData();
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

const deleteData = async (id: number) => {
  showConfirmation('Konfirmasi Hapus', 'Apakah Anda yakin ingin menghapus data ini?', async () => {
    try {
      const response = await deleteUrl({ id: id });
      showConfirmDialog.value = false;
      displayNotification(response.message);
      fetchData();
    } catch (error) {
      console.error('Error deleting data:', error);
      displayNotification('Terjadi kesalahan saat menghapus data.', 'error');
    }
  });
};

const calculateTotalPayment = (transaction: TicketTransaction): number => {
  return transaction.payment_histories.reduce((sum, p) => sum + parseInt(p.nominal || '0'), 0);
};

const showTicketTransactionDialog = ref(false);

const startTicketTransaction = () => {
  showTicketTransactionDialog.value = true;
};

const closeTicketTransactionForm = () => {
  showTicketTransactionDialog.value = false;
};

const showModalEdit = ref(false);
const openModalEdit = (id: number) => {
  showModalEdit.value = true;
  idEditTicket.value = id;
};

const onTicketTransactionSubmitted = () => {
  showTicketTransactionDialog.value = false;
  fetchData();
};

const showModalRefund = ref(false);

const openModalRefund = (id: number) => {
  showModalRefund.value = true;
  idRefundTicket.value = id;
};

const ShowModalDetail = ref(false);
const nomor_register = ref('');

const closeModalDetail = () => {
  ShowModalDetail.value = false;
  nomor_register.value = '';
};

const openModalDetail = (id: number) => {
  idDetail.value = id;
  ShowModalDetail.value = true;
};

const showModalPembayaran = ref(false);

const openPembayaranForm = (id: number) => {
  idPembayaranTicket.value = id;
  showModalPembayaran.value = true;
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

onMounted(() => {
  fetchFilterData();
});
</script>
