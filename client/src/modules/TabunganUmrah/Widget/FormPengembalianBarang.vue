<script setup lang="ts">
import PrimaryButton from '@/components/Button/PrimaryButton.vue';
import Notification from '@/modules/TabunganUmrah/Particle/Notification.vue';
import Confirmation from '@/modules/TabunganUmrah/Particle/Confirmation.vue';
import { getInfoPengembalianBarang, pengembalianHandoverBarang } from '@/service/tabungan_umrah';

import { ref, reactive, onMounted } from 'vue';

const props = defineProps<{
  isFormPengembalianBarangOpen: boolean;
  tabunganId: number;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'status', payload: { error: boolean; err_msg?: string }): void;
}>();

interface RiwayatHandoverBarang {
  id: number;
  nama_barang: string;
  giver_handover: string;
  receiver_handover: string;
  giver_returned: string;
  receiver_returned: string;
  date_taken: string;
  date_returned: string;
  status: string;
}

const isLoading = ref(false);
const dataRiwayatHandoverBarang = ref<RiwayatHandoverBarang[]>([]);
const selectedItems = ref<number[]>([]);
const showNotification = ref(false);
const notificationMessage = ref('');
const notificationType = ref<'success' | 'error'>('success');
const timeoutId = ref<number | null>(null);
const showConfirmDialog = ref(false);
const confirmMessage = ref('');
const confirmTitle = ref('');
const confirmAction = ref<(() => void) | null>(null);

const errors = ref({
  receiver_returned: '',
  receiver_returned_identity: '',
  receiver_returned_hp: '',
  receiver_returned_address: '',
});

const form = reactive({
  id: props.tabunganId,
  barangList: [''] as string[],
  receiver_returned: '',
  receiver_returned_identity: '',
  receiver_returned_hp: '',
  receiver_returned_address: '',
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

const fetchData = async () => {
  if (!props.tabunganId) {
    displayNotification('ID Tabungan Umrah kosong', 'error');
    return;
  }

  try {
    isLoading.value = true;
    const response = await getInfoPengembalianBarang(props.tabunganId);

    if (response.error) {
      displayNotification(response.data.error_msg, 'error');
    } else if (response.data.length === 0) {
      emit('status', { error: true, err_msg: 'Data riwayat handover barang kosong' });
      emit('close');
    } else {
      dataRiwayatHandoverBarang.value = response.data;
    }
  } catch (error) {
    displayNotification('Gagal mengambil data', 'error');
  } finally {
    isLoading.value = false;
  }
};
// Function: Validasi form
const validateForm = (): boolean => {
  let isValid = true;
  errors.value = {
    receiver_returned: '',
    receiver_returned_identity: '',
    receiver_returned_hp: '',
    receiver_returned_address: '',
  };

  if (!form.id) {
    displayNotification('ID Tabungan Umrah kosong', 'error');
    isValid = false;
  }

  if (!form.receiver_returned.trim()) {
    errors.value.receiver_returned = 'Nama pemberi wajib diisi';
    isValid = false;
  }

  if (!form.receiver_returned_identity.trim()) {
    errors.value.receiver_returned_identity = 'Nomor identitas pemberi wajib diisi';
    isValid = false;
  }

  if (!form.receiver_returned_hp.trim()) {
    errors.value.receiver_returned_hp = 'Nomor HP pemberi wajib diisi';
    isValid = false;
  }

  if (!form.receiver_returned_address.trim()) {
    errors.value.receiver_returned_address = 'Alamat pemberi wajib diisi';
    isValid = false;
  }

  // Tambahkan validasi ini:
  const dikembalikanItems = dataRiwayatHandoverBarang.value.filter(
    (item) => selectedItems.value.includes(item.id) && item.status.toLowerCase() === 'dikembalikan',
  );

  if (dikembalikanItems.length > 0) {
    displayNotification('Ada item yang sudah dikembalikan dan tidak boleh dipilih lagi', 'error');
    isValid = false;
  }

  return isValid;
};

// Form Logic
const onItemSelect = (item: RiwayatHandoverBarang) => {
  if (item.status === 'dikembalikan') {
    displayNotification('Barang sudah dikembalikan dan tidak bisa dipilih.', 'error');

    selectedItems.value = selectedItems.value.filter((id) => id !== item.id);
  }
};

// Placeholder submit function
const saveData = async () => {
  if (!validateForm()) return;

  showConfirmation(
    'Konfirmasi Terima Barang',
    'Apakah Anda yakin ingin menyimpan data serah terima barang ini?',
    async () => {
      try {
        isLoading.value = true;
        const payload = {
          id: form.id,
          selectedItems: selectedItems.value,
          receiver_returned: form.receiver_returned,
          receiver_returned_identity: form.receiver_returned_identity,
          receiver_returned_hp: form.receiver_returned_hp,
          receiver_returned_address: form.receiver_returned_address,
        };

        const response = await pengembalianHandoverBarang(payload);
        if (response.data.error === true) {
          displayNotification(response.data.error_msg, 'error');
          return;
        }

        if (!response.data.invoice) {
          displayNotification('Nomor invoice tidak tersedia', 'error');
          return;
        }
        window.open(`/kwitansi-pengembalian-handover-barang/${response.data.invoice}`, '_blank');
        emit('status', { error: false, err_msg: 'Data handover barang berhasil diserahkan' });
        emit('close');
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

onMounted(async () => {
  await fetchData();
});
</script>

<template>
  <!-- Loading Spinner -->
  <div
    v-if="isLoading"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
  >
    <div class="animate-spin h-6 w-6 border-4 border-white border-t-transparent rounded-full"></div>
  </div>

  <!-- Modal -->
  <div
    v-if="props.isFormPengembalianBarangOpen && !isLoading"
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
        class="relative inline-block transform overflow-hidden rounded-lg bg-white text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-5xl sm:align-middle p-6"
      >
        <!-- Title -->
        <h3 class="text-2xl font-bold text-gray-900 mb-4">Form Pengembalian Barang Jamaah</h3>
        <div class="overflow-y-auto max-h-[64vh] no-scrollbar px-1">
          <div class="overflow-auto">
            <h3 class="font-bold text-gray-800 mb-2">History Penerimaan Barang</h3>
            <table class="w-full text-gray-800 text-sm border border-gray-300">
              <thead class="bg-gray-100 text-center">
                <tr>
                  <th class="w-[15%] px-4 py-2 border">Nama Item</th>
                  <th class="w-[20%] px-4 py-2 border">Serah</th>
                  <th class="w-[20%] px-4 py-2 border">Terima</th>
                  <th class="w-[10%] px-4 py-2 border">Tgl. Terima</th>
                  <th class="w-[14%] px-4 py-2 border">Tgl. Dikembali</th>
                  <th class="w-[10%] px-4 py-2 border">Status</th>
                  <th class="w-[10%] px-4 py-2 border">Menu</th>
                </tr>
              </thead>
              <tbody>
                <!-- Loop baris item -->
                <tr
                  v-for="(item, index) in dataRiwayatHandoverBarang"
                  :key="index"
                  class="border-t text-center align-top"
                >
                  <td class="px-4 py-2 border">{{ item.nama_barang }}</td>
                  <td class="px-4 py-2 border text-left">
                    <strong>Penyerah</strong> :<br />{{ item.giver_handover }}<br />
                    <strong>Penerima</strong> :<br />{{ item.receiver_handover }}
                  </td>
                  <td class="px-4 py-2 border text-left">
                    <strong>Penyerah</strong> :<br />{{ item.giver_returned }}<br />
                    <strong>Penerima</strong> :<br />{{ item.receiver_returned }}
                  </td>
                  <td class="px-4 py-2 border">{{ item.date_taken }}</td>
                  <td class="px-4 py-2 border">{{ item.date_returned }}</td>
                  <td class="px-4 py-2 border">{{ item.status }}</td>
                  <td class="px-4 py-2 border">
                    <label class="flex items-center justify-center space-x-2">
                      <input
                        type="checkbox"
                        class="w-4 h-4 rounded-sm border-2 border-gray-400 text-blue-500 focus:ring-blue-500"
                        :value="item.id"
                        v-model="selectedItems"
                        :disabled="item.status === 'dikembalikan'"
                        @change="onItemSelect(item)"
                      />
                    </label>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Input Data -->
          <h3 class="font-bold text-gray-800 mt-4 mb-4">Form Pengembalian Barang</h3>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 text-gray-600">
            <div>
              <input
                v-model="form.receiver_returned"
                type="text"
                placeholder="Nama Penerima Barang"
                class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-600 font-normal"
              />
              <p v-if="errors.receiver_returned" class="mt-1 text-sm text-red-600">
                {{ errors.receiver_returned }}
              </p>
            </div>
            <div>
              <input
                v-model="form.receiver_returned_identity"
                type="text"
                placeholder="No Identitas Penerima Barang"
                class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-600 font-normal"
              />
              <p v-if="errors.receiver_returned_identity" class="mt-1 text-sm text-red-600">
                {{ errors.receiver_returned_identity }}
              </p>
            </div>
            <div>
              <input
                v-model="form.receiver_returned_hp"
                type="text"
                placeholder="No HP Penerima Barang"
                class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-600 font-normal"
              />
              <p v-if="errors.receiver_returned_hp" class="mt-1 text-sm text-red-600">
                {{ errors.receiver_returned_hp }}
              </p>
            </div>
          </div>

          <div class="mb-4 text-gray-600">
            <textarea
              v-model="form.receiver_returned_address"
              rows="3"
              placeholder="Alamat Penerima Barang"
              class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-600 font-normal"
            ></textarea>
            <p v-if="errors.receiver_returned_address" class="mt-1 text-sm text-red-600">
              {{ errors.receiver_returned_address }}
            </p>
          </div>

          <!-- Actions -->
          <div class="bg-gray-50 pt-6 sm:flex sm:flex-row-reverse sm:px-0 gap-2">
            <PrimaryButton @click="saveData()">KEMBALIKAN BARANG JAMAAH</PrimaryButton>
            <button
              @click="$emit('close')"
              class="mt-3 inline-flex w-full justify-center rounded-md border border-gray-400 bg-gray-200 px-4 py-2 text-base font-medium text-gray-800 shadow-sm hover:bg-gray-300 focus:outline-none sm:mt-0 sm:w-auto sm:text-sm"
            >
              BATAL
            </button>
          </div>
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
