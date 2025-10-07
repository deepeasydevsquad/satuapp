<script setup lang="ts">
import Notification from '@/modules/TabunganUmrah/Particle/Notification.vue';
import Confirmation from '@/modules/TabunganUmrah/Particle/Confirmation.vue';
import PrimaryButton from '@/components/Button/PrimaryButton.vue';
import { onMounted, reactive, ref } from 'vue';
import { getInfoPaketPembelian, pembelianPaketTabunganUmrah } from '@/service/tabungan_umrah';

const props = defineProps<{
  isFormBeliPaketUmrahOpen: boolean;
  tabunganId: number;
  cabangId: number;
}>();
const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'status', payload: { error: boolean; err_msg?: string }): void;
}>();

// Interfaces
interface ErrorFields {
  tipe_paket_id: string;
}

interface Mst_paket {
  target_paket_id: number;
  kode_paket: string;
  nama_paket: string;
  total_tabungan: number;
  tipe_paket: {
    id: number;
    name: string;
    price: number;
  }[];
}

// State
const Mst_paket_type = ref<Mst_paket | null>();

const isLoading = ref(false);
const showNotification = ref(false);
const notificationMessage = ref('');
const notificationType = ref('');
const timeoutId = ref<number | null>(null);

const showConfirmDialog = ref<boolean>(false);
const confirmMessage = ref<string>('');
const confirmTitle = ref<string>('');
const confirmAction = ref<(() => void) | null>(null);

const errors = ref<ErrorFields>({
  tipe_paket_id: '',
});

const form = reactive({
  id: props.tabunganId ?? null,
  tipe_paket_id: null,
});

// Function: Notification
const displayNotification = (message: string, type: 'success' | 'error' = 'success') => {
  notificationMessage.value = message;
  notificationType.value = type;
  showNotification.value = true;
  if (timeoutId.value) clearTimeout(timeoutId.value);
  timeoutId.value = window.setTimeout(() => {
    showNotification.value = false;
  }, 2000);
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
  if (!props.tabunganId || !props.cabangId) {
    displayNotification(
      'ID tabungan atau cabang tidak ditemukan, silakan keluar dan masuk kembali.',
      'error',
    );
    return;
  }

  try {
    isLoading.value = true;
    const Mst_paket_typeResponse = await getInfoPaketPembelian(props.tabunganId);

    Mst_paket_type.value = Mst_paket_typeResponse.data || [];
    if (Mst_paket_type.value.tipe_paket.length === 0) {
      emit('status', {
        error: true,
        err_msg: Mst_paket_typeResponse.error_msg || 'Tidak ada data tipe paket ditemukan.',
      });
      emit('close');
      return;
    }
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
};

// Function: Validasi form
const validateForm = () => {
  let isValid = true;
  errors.value = {
    tipe_paket_id: '',
  };

  if (!form.tipe_paket_id) {
    displayNotification('Tipe paket harus dipilih', 'error');
    isValid = false;
  }

  if (!props.cabangId || !props.tabunganId) {
    displayNotification(
      'ID tabungan atau cabang tidak ditemukan, silakan keluar dan masuk kembali.',
      'error',
    );
    isValid = false;
  }

  return isValid;
};

// Save Data
const saveData = async () => {
  if (!validateForm()) return;

  showConfirmation(
    'Konfirmasi Handover Fasilitas',
    `Apakah Anda yakin ingin membeli tipe paket ${Mst_paket_type.value?.tipe_paket.find((item) => item.id === form.tipe_paket_id)?.name}?`,
    async () => {
      try {
        isLoading.value = true;
        const payload = {
          id: props.tabunganId,
          division_id: props.cabangId,
          target_paket_id: Mst_paket_type.value?.target_paket_id,
          tipe_paket_id: form.tipe_paket_id,
        };

        const response = await pembelianPaketTabunganUmrah(payload);
        emit('close');
        emit('status', {
          error: false,
          err_msg: response.error_msg || 'Pembelian paket tabungan umrah berhasil',
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
    },
  );
};

onMounted(() => {
  fetchData();
});
</script>

<template>
  <div
    v-if="isLoading"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
  >
    <div class="animate-spin h-5 w-5 border-b-2 border-white rounded-full"></div>
  </div>
  <div
    v-if="props.isFormBeliPaketUmrahOpen && !isLoading"
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
        class="relative p-6 inline-block transform overflow-hidden rounded-lg bg-white text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl sm:align-middle"
      >
        <div class="bg-white">
          <h3 class="text-2xl flex font-bold leading-6 text-gray-900 mb-4">
            Form Pembelian Paket Umrah
          </h3>
          <div class="space-y-4 text-gray-800">
            <div class="mb-2">
              <label class="block text-md font-medium text-gray-700 mb-1"
                >Informasi Tabungan Umrah</label
              >
              <div class="p-3 border border-gray-200 rounded-md bg-gray-50">
                <p class="text-gray-600">
                  Total Tabungan:
                  <strong>Rp {{ Mst_paket_type?.total_tabungan.toLocaleString() }}</strong>
                </p>
                <p class="text-gray-600">
                  Kode Paket: <strong>({{ Mst_paket_type?.kode_paket }})</strong>
                </p>
                <p class="text-gray-600">
                  Nama Paket: <strong>{{ Mst_paket_type?.nama_paket }}</strong>
                </p>
              </div>
            </div>
            <!-- Tabel Tipe Paket -->
            <label class="block ml-2 text-md font-medium text-gray-700">Daftar Tipe Paket</label>
            <div
              class="overflow-x-auto rounded-lg overflow-y-auto scroll-smoothTipe Paket shadow-md max-h-[36vh] border mb-4"
            >
              <table class="w-full mt-2 border text-center text-md mb-3">
                <thead>
                  <tr class="bg-gray-100">
                    <th class="w-[45%] p-2 border">Nama</th>
                    <th class="w-[45%] p-2 border">Harga</th>
                    <th class="w-[10%] p-2 border">Pilih</th>
                  </tr>
                </thead>
                <tbody>
                  <template v-if="Mst_paket_type && Mst_paket_type.tipe_paket.length > 0">
                    <template v-for="(tipe_paket, index) in Mst_paket_type.tipe_paket" :key="index">
                      <tr>
                        <td class="p-2 border">{{ tipe_paket.name }}</td>
                        <td class="p-2 border">Rp {{ tipe_paket.price.toLocaleString() }}</td>
                        <td class="p-2 border">
                          <input
                            type="radio"
                            :value="tipe_paket.id"
                            v-model="form.tipe_paket_id"
                            :disabled="tipe_paket.price > Mst_paket_type.total_tabungan"
                            class="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded disabled:opacity-50"
                          />
                        </td>
                      </tr>
                    </template>
                  </template>
                  <tr v-else>
                    <td colspan="3" class="text-center text-sm p-4 text-gray-600">
                      Daftar Tipe Paket tidak ditemukan
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div class="bg-gray-50 pb-3 pt-6 sm:flex sm:flex-row-reverse sm:px-0 gap-2">
          <PrimaryButton @click="saveData()">BELI PAKET</PrimaryButton>
          <button
            @click="$emit('close')"
            class="px-4 mt-3 inline-flex w-full justify-center rounded-md border border-gray-400 bg-gray-200 px-4 py-2 text-base font-medium text-gray-800 shadow-sm hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
          >
            BATAL
          </button>
        </div>
      </div>
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
