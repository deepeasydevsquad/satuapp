<script setup lang="ts">
import PrimaryButton from '@/components/Button/PrimaryButton.vue';
import Notification from '@/modules/TabunganUmrah/Particle/Notification.vue';
import Confirmation from '@/modules/TabunganUmrah/Particle/Confirmation.vue';
import SearchableSelect from '../Particle/SearchableSelect.vue';
import {
  getJamaah,
  getPaketTypes,
  getAgen,
  addTransaksiPaket,
} from '@/service/daftar_transaksi_paket';

import { ref, reactive, onMounted, watch } from 'vue';

const isLoading = ref(false);
const showNotification = ref(false);
const notificationMessage = ref('');
const notificationType = ref<'success' | 'error'>('success');
const timeoutId = ref<number | null>(null);

const showConfirmDialog = ref(false);
const confirmMessage = ref('');
const confirmTitle = ref('');
const confirmAction = ref<(() => void) | null>(null);

const props = defineProps<{
  isFormOpen: boolean;
  paketId: number;
  cabangId: number;
}>();

console.log(props);

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'status', payload: { error: boolean; err_msg?: string }): void;
}>();

const errors = ref({
  jamaah_id: '',
  paket_types_id: '',
});

interface Jamaah {
  id: number;
  name: string;
  agen_id: number | null;
}
interface PaketTypes {
  id: number;
  name: string;
  price: number;
}
interface Agen {
  id: number;
  name: string;
  default_fee: number;
}

// State
const JamaahList = ref<Jamaah[]>([]);
const PaketTypesList = ref<PaketTypes[]>([]);
const AgenDetail = ref<Agen | null>(null); // <- Diganti dari AgenList

const form = reactive({
  jamaah_id: 0,
  paket_types_id: 0,
});

// Function: Notification
function displayNotification(message: string, type: 'success' | 'error' = 'success') {
  showConfirmDialog.value = false;
  notificationMessage.value = message;
  notificationType.value = type;
  showNotification.value = true;
  if (timeoutId.value) clearTimeout(timeoutId.value);
  timeoutId.value = window.setTimeout(() => {
    showNotification.value = false;
  }, 3000);
}

// Function: Confirmation
function showConfirmation(title: string, message: string, action: () => void) {
  confirmTitle.value = title;
  confirmMessage.value = message;
  confirmAction.value = action;
  showConfirmDialog.value = true;
}

// Function: Ambil data agen dari jamaah terpilih
const checkAndFetchAgen = async (jamaahId: number) => {
  console.log('___________________');
  console.log(form.jamaah_id);
  console.log(JamaahList.value);
  console.log('___________________');
  const selected = JamaahList.value.find((j) => j.id === form.jamaah_id);
  console.log('Selected Jamaah:', selected);
  if (selected?.agen_id) {
    try {
      console.log('Agen ID:', selected.agen_id);
      const agenRes = await getAgen(selected.agen_id);
      AgenDetail.value = agenRes.data;
    } catch (err) {
      AgenDetail.value = null;
      displayNotification('Gagal mengambil data agen', 'error');
    }
  } else {
    AgenDetail.value = null;
  }
};

// Function: Fetch data
const fetchData = async () => {
  try {
    isLoading.value = true;
    const [jamaahResponse, paketResponse] = await Promise.all([
      getJamaah({
        id: props.paketId,
        // division_id: props.cabangId
      }),
      getPaketTypes(props.paketId),
    ]);

    JamaahList.value = jamaahResponse.data;
    PaketTypesList.value = paketResponse.data;
  } catch (error: any) {
    console.error('Error fetching data:', error);
    displayNotification(error.response.data.error_msg, 'error');
  } finally {
    isLoading.value = false;
  }
};

// Function: Validasi form
const validateForm = (): boolean => {
  let isValid = true;
  errors.value = {
    jamaah_id: '',
    paket_types_id: '',
  };

  if (!form.jamaah_id) {
    errors.value.jamaah_id = 'Nama Jamaah wajib dipilih';
    isValid = false;
  }
  if (!form.paket_types_id) {
    errors.value.paket_types_id = 'Tipe Paket wajib dipilih';
    isValid = false;
  }
  return isValid;
};

// Watcher: Saat jamaah_id berubah, cek apakah ada agen_id
watch(
  () => form.jamaah_id,
  async (newId) => {
    if (newId) {
      isLoading.value = true;
      try {
        await checkAndFetchAgen(newId);
      } catch (err) {
        AgenDetail.value = null;
        form.jamaah_id = 0;
        displayNotification('Gagal mengambil data agen', 'error');
      } finally {
        isLoading.value = false;
      }
    } else {
      AgenDetail.value = null;
    }
  },
);

onMounted(() => {
  fetchData();
});

// Placeholder submit function
let isSaving = false;
async function saveData() {
  if (isSaving) return;

  if (!validateForm()) {
    isSaving = false;
    return;
  }

  showConfirmation(
    'Konfirmasi Transaksi Paket',
    'Apakah Anda yakin ingin menambah transaksi paket ini?',
    async () => {
      isLoading.value = true;
      isSaving = true;

      try {
        const payload = {
          id: props.paketId,
          jamaah_id: form.jamaah_id,
          paket_types_id: form.paket_types_id,
          division_id: props.cabangId,
        };

        const response = await addTransaksiPaket(payload);
        console.log('Response:', response);
        displayNotification(`Transaksi Paket berhasil invoice ${response.data.invoice}`, 'success');
        if (response.data === null) {
          displayNotification('Nomor invoice tidak tersedia', 'error');
          return;
        }
        window.open(`/kwitansi-pembayaran-transaksi-paket/${response.data.invoice}`, '_blank');
        emit('status', { error: false, err_msg: 'Transaksi Paket berhasil ditambahkan' });
        emit('close');
      } catch (error) {
        displayNotification('Gagal menyimpan Transaksi Paket', 'error');
        emit('status', { error: true, err_msg: error.response.data.error_msg });
      } finally {
        isLoading.value = false;
        isSaving = false;
      }
    },
  );
}

// Fungsi format harga (Rp, titik ribuan)
const formatPrice = (value: number | string): string => {
  const numericString = String(value).replace(/[^\d]/g, '');
  const numericValue = parseInt(numericString, 10) || 0;

  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(numericValue);
};
</script>

<template>
  <!-- Loading Spinner -->
  <div
    v-if="isLoading"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
  >
    <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-400"></div>
  </div>

  <!-- Modal -->
  <div
    v-if="props.isFormOpen && !isLoading"
    class="fixed inset-0 z-50 overflow-y-auto"
    role="dialog"
    aria-modal="true"
  >
    <div
      class="flex min-h-screen items-end justify-center px-6 pt-6 pb-20 text-center sm:block sm:p-0"
    >
      <div
        class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
        @click="$emit('close')"
      ></div>
      <span class="hidden sm:inline-block sm:h-screen sm:align-middle" aria-hidden="true"
        >&#8203;</span
      >
      <div
        class="relative inline-block transform overflow-hidden rounded-lg bg-white text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:align-middle p-6"
      >
        <!-- Title -->
        <h3 class="text-2xl font-bold text-gray-900 mb-4">Form Transaksi Paket</h3>
        <div class="overflow-y-auto max-h-[64vh] no-scrollbar px-1">
          <div class="space-y-4 text-gray-800 sm:min-h-[300px]">
            <div>
              <SearchableSelect
                v-model="form.jamaah_id"
                :options="JamaahList"
                label="Nama Jamaah"
                placeholder="Pilih Jamaah"
                :error="errors.jamaah_id"
                required
              />
            </div>
            <div>
              <SearchableSelect
                v-model="form.paket_types_id"
                :options="PaketTypesList"
                label="Tipe Paket"
                placeholder="Pilih Tipe Paket"
                :error="errors.paket_types_id"
                required
              />
            </div>
            <div v-if="form.paket_types_id">
              <label class="block text-sm font-medium text-gray-700 mb-1">Harga Tipe Paket</label>
              <p
                class="block w-full px-3 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm"
              >
                {{
                  formatPrice(
                    PaketTypesList.find((pt) => pt.id === form.paket_types_id)?.price || 0,
                  )
                }}
              </p>
            </div>
            <div v-if="AgenDetail" class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-1"
                >Fee Agen ({{ AgenDetail.name }})</label
              >
              <p
                class="block w-full px-3 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm mb-6"
              >
                {{ formatPrice(AgenDetail.default_fee) }}
              </p>
            </div>
          </div>
        </div>
        <div class="bg-gray-50 pb-3 pt-6 sm:flex sm:flex-row-reverse sm:px-0 gap-2">
          <PrimaryButton @click="saveData()">TAMBAH TRANSAKSI PAKET</PrimaryButton>
          <button
            @click="$emit('close')"
            class="mt-3 inline-flex w-full justify-center rounded-md border border-gray-400 bg-gray-200 px-4 py-2 text-base font-medium text-gray-800 shadow-sm hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
          >
            BATAL
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Notifikasi -->
  <Notification
    :showNotification="showNotification"
    :notificationType="notificationType"
    :notificationMessage="notificationMessage"
    @close="showNotification = false"
  />

  <!-- Konfirmasi -->
  <Confirmation
    :showConfirmDialog="showConfirmDialog"
    :confirmTitle="confirmTitle"
    :confirmMessage="confirmMessage"
  >
    <button
      @click="confirmAction && confirmAction()"
      class="mt-3 inline-flex w-full justify-center rounded-md border border-transparent bg-yellow-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
    >
      Ya
    </button>
    <button
      @click="showConfirmDialog = false"
      class="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none sm:w-auto sm:text-sm"
    >
      Tidak
    </button>
  </Confirmation>
</template>
