<script setup lang="ts">
import { ref, computed, defineEmits, defineProps, onMounted, watch } from 'vue';
import PrimaryButton from '@/components/Button/PrimaryButton.vue';
import LightButton from '@/components/Button/LightButton.vue';
import DangerButton from '@/components/Button/DangerButton.vue';
import Confirmation from '@/modules/RekapitulasiTicket/Particle/Confirmation.vue';
import Notification from '@/modules/RekapitulasiTicket/Particle/Notification.vue';
import { getTicketTersedia, addRekapitulasi } from '@/service/rekapitulasi_ticket';

interface Errors {
  costumer_name: string;
  costumer_whatsapp_number: string;
  ticket_transaction_ids: string;
}

interface AvailableTicket {
  id: number;
  nomor_register: string;
  total_transaksi: number;
  status: 'active' | 'refund' | 'cancel';
  tanggal_transaksi: string;
  ticket_details: {
    id: number;
    pax: string;
    airlines_name: string | null;
    code_booking: string;
    departure_date: string;
    arrival_date: string | null;
    departure_time: string | null;
    arrival_time: string | null;
    travel_price: number;
    costumer_price: number;
  }[];
}

interface RekapitulasiPayload {
  costumer_name: string;
  costumer_whatsapp_number: string;
  ticket_transaction_ids: number[];
}

const props = defineProps<{ isFormOpen: boolean }>();
const emits = defineEmits(['close', 'save']);

const searchNomorRegistrasi = ref('');
const errors = ref<Errors>('');
const availableTickets = ref<AvailableTicket[]>([]); // Renamed from allAvailableTickets
const selectedTickets = ref<AvailableTicket[]>([]);
const costumerName = ref('');
const costumerWhatsappNumber = ref('');
const isLoading = ref(false);
const fetchError = ref('');
const notificationMessage = ref('');
const notificationType = ref<'success' | 'error'>('success');
const showNotification = ref(false);
const timeoutId = ref<number | null>(null);
const showConfirmDialog = ref(false);
const confirmTitle = ref('');
const confirmMessage = ref('');
const confirmAction = ref<() => void>(() => {});

const totalRekapitulasi = computed(() => {
  return selectedTickets.value.reduce((total, ticket) => total + ticket.total_transaksi, 0);
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

const fetchTickets = async () => {
  isLoading.value = true;
  fetchError.value = '';
  try {
    const response = await getTicketTersedia(searchNomorRegistrasi.value);
    if (response.data) {
      availableTickets.value = response.data;
    } else {
      fetchError.value = 'Gagal mengambil daftar tiket yang tersedia.';
    }
  } catch (error) {
    displayNotification('Gagal mengambil daftar tiket. Silakan coba lagi.', 'error');
    console.error(error);
  } finally {
    isLoading.value = false;
  }
};

const addTicketToRekap = (ticket: AvailableTicket) => {
  if (!selectedTickets.value.some((t) => t.id === ticket.id)) {
    selectedTickets.value.push(ticket);
  }
};

const removeTicketFromRekap = (ticketId: number) => {
  selectedTickets.value = selectedTickets.value.filter((t) => t.id !== ticketId);
};

const validateForm = () => {
  let isValid = true;
  errors.value = {
    costumer_name: '',
    costumer_whatsapp_number: '',
    ticket_transaction_ids: '',
  };

  if (!costumerName.value) {
    errors.value.costumer_name = 'Nama Kostumer wajib diisi.';
    isValid = false;
  } else {
    errors.value.costumer_name = '';
  }

  if (!costumerWhatsappNumber.value) {
    errors.value.costumer_whatsapp_number = 'No. WhatsApp Kostumer wajib diisi.';
    isValid = false;
  } else {
    errors.value.costumer_whatsapp_number = '';
  }

  if (selectedTickets.value.length === 0) {
    displayNotification('Pilih minimal satu tiket untuk rekapitulasi.', 'error');
    isValid = false;
  } else {
    errors.value.ticket_transaction_ids = '';
  }

  return isValid;
};

const submitForm = async () => {
  if (!validateForm()) {
    console.error('Form tidak valid:', errors.value);
    return;
  }

  const payload: RekapitulasiPayload = {
    costumer_name: costumerName.value,
    costumer_whatsapp_number: costumerWhatsappNumber.value,
    ticket_transaction_ids: selectedTickets.value.map((t) => t.id),
  };

  console.log('Payload untuk rekapitulasi:', payload);
  showConfirmation(
    'Konfirmasi',
    'Apakah Anda yakin ingin menyimpan rekapitulasi ini?',
    async () => {
      try {
        await addRekapitulasi(payload);
        emits('save');
        closeForm();
      } catch (error) {
        console.error('Failed to create rekapitulasi:', error);
      }
    },
  );
};

const closeForm = () => {
  searchNomorRegistrasi.value = '';
  availableTickets.value = [];
  selectedTickets.value = [];
  costumerName.value = '';
  costumerWhatsappNumber.value = '';
  fetchError.value = '';
  emits('close');
};

const formatPrice = (value: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(value);
};

onMounted(() => {
  fetchTickets();
});

// Watch for changes in isFormOpen prop to re-fetch data when opened
watch(
  () => props.isFormOpen,
  (newValue) => {
    if (newValue) {
      fetchTickets();
    }
  },
);
</script>

<template>
  <div
    v-if="isFormOpen"
    class="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-gray-900/60"
    aria-labelledby="modal-title"
    role="dialog"
    aria-modal="true"
  >
    <div
      class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
      aria-hidden="true"
      @click="$emit('close')"
    ></div>
    <div class="relative w-full max-w-4xl mx-auto my-8 bg-white rounded-lg shadow-xl">
      <!-- Header -->
      <div class="flex items-center justify-between px-6 py-4 border-b">
        <h3 class="text-2xl font-bold text-gray-900">Rekapitulasi Tiket</h3>
        <button @click="closeForm" class="text-gray-400 hover:text-gray-700 transition">
          <span class="sr-only">Tutup</span>
          <font-awesome-icon
            icon="fa-solid fa-times"
            aria-hidden="true"
            style="font-size: 1.5rem"
          ></font-awesome-icon>
        </button>
      </div>

      <!-- Search -->
      <div class="flex flex-wrap items-center justify-end gap-2 px-6 pt-2">
        <label class="text-sm font-medium text-gray-700">Cari:</label>
        <input
          type="text"
          v-model="searchNomorRegistrasi"
          placeholder="Nomor Registrasi Tiket"
          class="w-56 px-3 py-1 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700"
          @change="fetchTickets"
        />
        <p v-if="fetchError" class="text-sm text-red-600">{{ fetchError }}</p>
      </div>

      <!-- Ticket List -->
      <div class="px-6 mt-2">
        <div class="overflow-hidden border rounded-lg max-h-[300px]">
          <div class="overflow-y-auto max-h-[300px] no-scrollbar">
            <table
              v-if="availableTickets.length"
              class="w-full text-sm text-left text-gray-700 bg-white"
            >
              <thead class="sticky top-0 bg-gray-50">
                <tr>
                  <th class="px-4 py-3 w-[20%] font-semibold">Nomor Registrasi</th>
                  <th class="px-4 py-3 w-[50%] font-semibold">Info Detail Tiket</th>
                  <th class="px-4 py-3 w-[20%] font-semibold">Tanggal Transaksi</th>
                  <th class="px-4 py-3 w-[10%] font-semibold">Aksi</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="ticket in availableTickets" :key="ticket.id" class="border-t">
                  <td class="px-4 py-3 align-top hover:bg-gray-100 font-medium">
                    {{ ticket.nomor_register }}
                  </td>
                  <td class="px-4 py-2 align-top hover:bg-gray-100">
                    <div v-for="detail in ticket.ticket_details" :key="detail.id" class="mb-2">
                      <div class="p-2 bg-gray-50 border rounded flex flex-col gap-1">
                        <div class="flex items-center justify-between text-sm font-semibold">
                          <span>
                            <span class="px-2 py-0.5 mr-2 bg-blue-100 text-blue-700 rounded">{{
                              detail.code_booking
                            }}</span>
                            <span class="text-xs text-gray-500">PAX {{ detail.pax }}</span>
                          </span>
                          <span class="font-bold text-green-600">
                            {{ formatPrice(Number(detail.pax) * detail.costumer_price) }}
                          </span>
                        </div>
                        <div class="flex flex-wrap gap-2 mt-1 text-xs text-gray-600">
                          <span v-if="detail.airlines_name" class="inline-flex items-center gap-1">
                            <svg
                              class="w-3 h-3 text-gray-400"
                              fill="none"
                              stroke="currentColor"
                              stroke-width="2"
                              viewBox="0 0 24 24"
                            >
                              <path d="M2.5 19.5L21.5 4.5M2.5 4.5l19 15M12 2v20" />
                            </svg>
                            {{ detail.airlines_name }}
                          </span>
                          <span>
                            {{ detail.departure_date }}
                            <span v-if="detail.departure_time">({{ detail.departure_time }})</span>
                          </span>
                          <span v-if="detail.arrival_date">
                            &rarr; {{ detail.arrival_date }}
                            <span v-if="detail.arrival_time">({{ detail.arrival_time }})</span>
                          </span>
                          <span class="font-bold text-green-600">{{
                            formatPrice(detail.costumer_price)
                          }}</span>
                        </div>
                      </div>
                    </div>
                    <div class="flex justify-end mt-2">
                      <div
                        class="flex items-center gap-2 px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-sm font-semibold text-gray-700"
                      >
                        <span class="text-xs text-gray-500">TOTAL</span>
                        <span class="text-md font-bold text-indigo-700">{{
                          formatPrice(ticket.total_transaksi)
                        }}</span>
                      </div>
                    </div>
                  </td>
                  <td class="px-4 py-3 align-top hover:bg-gray-100">
                    {{ ticket.tanggal_transaksi }}
                  </td>
                  <td class="px-4 py-3 align-top hover:bg-gray-100 justify-center">
                    <LightButton
                      @click="addTicketToRekap(ticket)"
                      :disabled="selectedTickets.some((t) => t.id === ticket.id)"
                    >
                      <font-awesome-icon
                        icon="fa-solid fa-plus"
                        class="text-xl"
                        :class="{
                          'text-gray-400': selectedTickets.some((t) => t.id === ticket.id),
                        }"
                      />
                    </LightButton>
                  </td>
                </tr>
              </tbody>
            </table>
            <p v-else class="py-4 text-center text-gray-500">
              Tidak ada tiket yang tersedia atau cocok dengan pencarian.
            </p>
          </div>
        </div>
      </div>

      <!-- Form & Selected Tickets -->
      <div class="grid grid-cols-1 gap-8 px-6 mt-6 md:grid-cols-2">
        <div class="space-y-4 text-gray-800">
          <h4 class="font-bold text-gray-800">Info Kostumer</h4>
          <div>
            <label for="costumerName" class="block text-sm font-medium text-gray-700"
              >Nama Kostumer <span class="text-red-600">*</span></label
            >
            <input
              id="costumerName"
              v-model="costumerName"
              type="text"
              placeholder="Masukkan Nama Kostumer"
              class="block w-full mt-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
            <p v-if="errors.costumer_name" class="mt-1 text-sm text-red-600">
              {{ errors.costumer_name }}
            </p>
          </div>
          <div>
            <label for="costumerWhatsapp" class="block text-sm font-medium text-gray-700"
              >No. WhatsApp <span class="text-red-600">*</span></label
            >
            <input
              id="costumerWhatsapp"
              v-model="costumerWhatsappNumber"
              type="text"
              placeholder="Masukkan No. WhatsApp"
              class="block w-full mt-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
            <p v-if="errors.costumer_whatsapp_number" class="mt-1 text-sm text-red-600">
              {{ errors.costumer_whatsapp_number }}
            </p>
          </div>
        </div>

        <!-- Selected Tickets -->
        <div>
          <h4 class="mb-2 font-bold text-gray-800">Daftar Tiket Cetak Rekapitulasi</h4>
          <div class="overflow-hidden border rounded-lg max-h-[250px]">
            <div class="overflow-y-auto max-h-[250px] no-scrollbar">
              <table class="w-full text-sm text-left text-gray-700 bg-white">
                <thead class="sticky top-0 bg-gray-50">
                  <tr>
                    <th class="px-4 py-3 font-semibold">Nomor Registrasi</th>
                    <th class="px-4 py-3 font-semibold">Total Harga</th>
                    <th class="px-4 py-3 font-semibold">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-if="selectedTickets.length === 0">
                    <td colspan="3" class="py-4 text-center text-gray-500">
                      Data rekap tiket tidak ditemukan.
                    </td>
                  </tr>
                  <tr v-for="ticket in selectedTickets" :key="ticket.id" class="border-t">
                    <td class="px-4 py-3">{{ ticket.nomor_register }}</td>
                    <td class="px-4 py-3">{{ formatPrice(ticket.total_transaksi) }}</td>
                    <td class="px-4 py-3">
                      <DangerButton @click="removeTicketFromRekap(ticket.id)">
                        <font-awesome-icon icon="fa-solid fa-times" class="text-lg text-white" />
                      </DangerButton>
                    </td>
                  </tr>
                </tbody>
              </table>
              <div v-if="selectedTickets.length" class="px-4 py-2 text-right bg-gray-50">
                <span class="text-gray-800">Total Rekapitulasi: </span>
                <span class="font-semibold text-gray-800">{{
                  formatPrice(totalRekapitulasi)
                }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex flex-row-reverse gap-2 px-6 pb-4 mt-6 bg-gray-50">
        <PrimaryButton @click="submitForm">REKAP TIKET</PrimaryButton>
        <button
          type="button"
          @click="closeForm"
          class="inline-flex items-center justify-center px-4 py-2 text-base font-medium text-gray-800 bg-gray-200 border border-gray-400 rounded-md shadow-sm hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto sm:text-sm"
        >
          CANCEL
        </button>
      </div>
    </div>

    <!-- Confirmation Dialog -->
    <Confirmation
      :showConfirmDialog="showConfirmDialog"
      :confirmTitle="confirmTitle"
      :confirmMessage="confirmMessage"
    >
      <button
        @click="confirmAction && confirmAction()"
        class="inline-flex justify-center w-full px-4 py-2 text-base font-medium text-white bg-yellow-600 border border-transparent rounded-md shadow-sm hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
      >
        Ya
      </button>
      <button
        @click="showConfirmDialog = false"
        class="inline-flex justify-center w-full px-4 py-2 mt-3 text-base font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
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
  </div>
</template>
