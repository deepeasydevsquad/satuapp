<script setup lang="ts">
import SearchableSelect from '@/modules/TabunganUmrah/Particle/SearchableSelect.vue';
import Notification from '@/modules/TabunganUmrah/Particle/Notification.vue';
import PrimaryButton from '@/components/Button/PrimaryButton.vue';
import Confirmation from '@/modules/TabunganUmrah/Particle/Confirmation.vue';

import { onMounted, reactive, ref, watch } from 'vue';
import {
  getPaket,
  updateTabunganUmrah,
  getInfoUpdateTabunganUmrah,
} from '@/service/tabungan_umrah';

const props = defineProps<{
  isFormUpdateOpen: boolean;
  tabunganId: number;
  cabangId: number;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'status', payload: { error: boolean; err_msg?: string }): void;
}>();

// Interfaces
interface Paket {
  id: number;
  name: string;
  price: number;
  hari_tersisa: string;
}
interface dataTabungan {
  id: number;
  kuota_jamaah_tersisa: number;
  total_tabungan: number;
  target_paket_id: number;
  member: {
    fullname: string;
    identity_number: string;
    birth_place: string;
    birth_date: string;
  };
}

// State
const PaketList = ref<Paket[]>([]);
const dataTabungan = ref<dataTabungan>();
const isLoading = ref(false);
const showNotification = ref(false);
const notificationMessage = ref('');
const notificationType = ref('');
const timeoutId = ref<number | null>(null);
const showConfirmDialog = ref<boolean>(false);
const confirmMessage = ref<string>('');
const confirmTitle = ref<string>('');
const confirmAction = ref<(() => void) | null>(null);

const form = reactive({
  id: props.tabunganId ?? null,
  target_paket_id: null,
});

// Function: Notification
const displayNotification = (message: string, type: 'success' | 'error' = 'success') => {
  showConfirmDialog.value = false;
  notificationMessage.value = message;
  notificationType.value = type;
  showNotification.value = true;
  if (timeoutId.value) clearTimeout(timeoutId.value);
  timeoutId.value = window.setTimeout(() => {
    showNotification.value = false;
  }, 3000);
};

// Function: Confirmation
const showConfirmation = (title: string, message: string, action: () => void) => {
  confirmTitle.value = title;
  confirmMessage.value = message;
  confirmAction.value = action;
  showConfirmDialog.value = true;
};

// Function: Ambil data awal
const fetchData = async () => {
  if (!props.cabangId || !props.tabunganId) {
    displayNotification(
      'ID tabungan atau cabang tidak ditemukan, silakan keluar dan masuk kembali.',
      'error',
    );
    return;
  }
  try {
    isLoading.value = true;
    const [paketResponse, dataTabunganResponse] = await Promise.all([
      getPaket(props.cabangId),
      getInfoUpdateTabunganUmrah(props.tabunganId),
    ]);
    if (paketResponse.data) {
      PaketList.value = [{ id: null, name: 'Pilih Paket' }, ...paketResponse.data];
    }
    if (dataTabunganResponse.data) {
      dataTabungan.value = dataTabunganResponse.data;
      form.target_paket_id = dataTabungan.value?.target_paket_id ?? null;
    }
  } catch (error) {
    displayNotification(
      error?.response?.data?.error_msg || 'Terjadi kesalahan dalam mengambil data tabungan',
      'error',
    );
  } finally {
    isLoading.value = false;
  }
};

// Function: Validasi form
const validateForm = (): boolean => {
  let isValid = true;

  if (!form.id) {
    displayNotification('ID tabungan tidak ditemukan, silakan keluar dan masuk kembali.', 'error');
    isValid = false;
  }

  if (!props.cabangId) {
    displayNotification('ID cabang tidak ditemukan, silakan keluar dan masuk kembali.', 'error');
    isValid = false;
  }

  return isValid;
};

// Save Data (contoh)
const saveData = async () => {
  if (!validateForm()) return;

  showConfirmation('Konfirmasi Simpan', 'Anda yakin ingin menyimpan perubahan?', async () => {
    try {
      isLoading.value = true;
      const payload: {
        id: number;
        target_id: number | null;
        division_id: number;
      } = {
        id: props.tabunganId,
        division_id: props.cabangId,
        target_id: form.target_paket_id ?? null,
      };

      const response = await updateTabunganUmrah(payload);
      emit('close');
      emit('status', {
        error: false,
        err_msg: response.error_msg || 'Update target berhasil disimpan',
      });
    } catch (error) {
      displayNotification(
        error?.response?.data?.error_msg ||
          error?.response?.data?.message ||
          'Terjadi kesalahan dalam menyimpan data',
        'error',
      );
    } finally {
      isLoading.value = false;
    }
  });
};

onMounted(() => {
  fetchData();
});

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

const price_sisa = ref<number>(0);
const price_harga = ref<number>(0);
const hari_tersisa = ref('');
const kuota_jamaah_tersisa = ref<number>(0);

watch(
  () => form.target_paket_id,
  async (newTargetPaketId) => {
    if (!newTargetPaketId) return;

    try {
      isLoading.value = true;
      const paketResponse = await getPaket(props.cabangId ?? 0);
      const paket = paketResponse.data?.find((p: Paket) => p.id === newTargetPaketId);

      if (paket) {
        kuota_jamaah_tersisa.value = paket.kuota_jamaah_tersisa;
        price_sisa.value = paket.price - (dataTabungan.value?.total_tabungan || 0);
        price_harga.value = paket.price;
        hari_tersisa.value = paket.hari_tersisa || '';
      }
    } catch (error) {
      displayNotification(
        error?.response?.data?.error_msg || 'Terjadi kesalahan dalam mengambil data paket',
        'error',
      );
    } finally {
      isLoading.value = false;
    }
  },
  { immediate: true },
);
</script>

<template>
  <div
    v-if="isLoading"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
  >
    <div class="animate-spin h-5 w-5 border-b-2 border-white rounded-full"></div>
  </div>
  <div
    v-if="props.isFormUpdateOpen && !isLoading"
    class="fixed inset-0 z-50 overflow-y-auto"
    aria-labelledby="modal-title"
    role="dialog"
    aria-modal="true"
  >
    <div
      class="flex min-h-screen items-end justify-center px-6 pt-6 pb-20 text-center sm:block sm:p-0"
    >
      <div
        class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
        aria-hidden="true"
        @click="$emit('close')"
      ></div>
      <span class="hidden sm:inline-block sm:h-screen sm:align-middle" aria-hidden="true"
        >&#8203;</span
      >
      <div
        class="relative p-6 inline-block transform overflow-hidden rounded-lg bg-white text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:align-middle"
      >
        <div class="bg-white">
          <h3 class="text-2xl flex font-bold leading-6 text-gray-900 mb-4">
            Form Target Paket Tabungan Umrah
          </h3>
          <div class="space-y-4 text-gray-800">
            <!-- Pilih Target Paket -->
            <div class="mb-6">
              <SearchableSelect
                v-model="form.target_paket_id"
                :options="PaketList"
                label="Target Paket"
                placeholder="Pilih Target Paket"
              />
            </div>
            <!-- Data Member -->
            <div class="mb-6">
              <label class="block text-sm font-medium text-gray-700 mb-1">Data Member</label>
              <div class="p-3 border border-gray-200 rounded-md bg-gray-50">
                <p class="text-sm font-semibold text-gray-800">
                  {{ dataTabungan?.member.fullname || '-' }}
                </p>
                <p class="text-sm text-gray-600">
                  Nomor Identitas: {{ dataTabungan?.member.identity_number || '-' }}
                </p>
                <p class="text-sm text-gray-600">
                  Tempat / Tgl Lahir:
                  {{
                    `${dataTabungan?.member.birth_place || '-'} / ${dataTabungan?.member.birth_date || '-'}`
                  }}
                </p>
              </div>
            </div>
            <div class="mb-6">
              <label class="block text-sm font-medium text-gray-700 mb-1">Data Paket</label>
              <div
                class="p-3 border border-yellow-200 bg-yellow-50 rounded-md text-sm text-yellow-800"
              >
                <p>
                  Kuota jamaah tersisa : <strong>{{ kuota_jamaah_tersisa || '-' }} orang</strong>
                </p>
                <p>
                  Harga paket : <strong>{{ formatPrice(price_harga) }}</strong>
                </p>
                <p>
                  Sisa kekurangan : <strong>{{ formatPrice(price_sisa) }}</strong>
                </p>
                <p>
                  Perkiraan keberangkatan :
                  <strong>{{ hari_tersisa ? hari_tersisa + ' Hari lagi' : '-' }}</strong>
                </p>
              </div>
            </div>
          </div>
        </div>
        <div class="bg-gray-50 pb-3 pt-6 sm:flex sm:flex-row-reverse sm:px-0 gap-2">
          <PrimaryButton @click="saveData()">UPDATE TARGET PAKET</PrimaryButton>
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
  <!-- Notification -->
  <Notification
    :showNotification="showNotification"
    :notificationType="notificationType"
    :notificationMessage="notificationMessage"
    @close="showNotification = false"
  />

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
