<script setup lang="ts">
import SearchableCheckboxList from '@/modules/TabunganUmrah/Particle/SearchableCheckboxList.vue';
import Notification from '@/modules/DaftarJamaahPaket/Particle/Notification.vue';
import Confirmation from '@/modules/DaftarJamaahPaket/Particle/Confirmation.vue';
import PrimaryButton from '@/components/Button/PrimaryButton.vue';
import { onMounted, reactive, ref } from 'vue';
import {
  getHandoverFasilitas,
  getMstFasilitas,
  addHandoverFasilitas,
} from '@/service/daftar_jamaah_paket';

const props = defineProps<{
  isFormHandoverFasilitasOpen: boolean;
  transpaketId: number | null;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'status', payload: { error: boolean; err_msg?: string }): void;
}>();

// Interfaces
interface ErrorFields {
  nama_penerima: string;
  nomor_identitas_penerima: string;
  detail_fasilitas: string;
}

interface Mst_paket {
  id: number;
  name: string;
}

interface HandoverFasilitas {
  id: number;
  invoice: string;
  petugas: string;
  penerima: string;
  nomor_identitas_penerima: string;
  tgl_penerima: string;
  detail: Array<{
    id: number;
    name: string;
  }>;
}

// State
const Mst_paket = ref<Mst_paket[]>([]);
const handoverFasilitas = ref<HandoverFasilitas[]>([]);

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
  nama_penerima: '',
  nomor_identitas_penerima: '',
  detail_fasilitas: '',
});

const form = reactive({
  nama_penerima: '',
  nomor_identitas_penerima: '',
  detail_fasilitas: [] as any[],
});

// Function: Notification
const displayNotification = (message: string, type: 'success' | 'error' = 'success') => {
  notificationMessage.value = message;
  notificationType.value = type;
  showNotification.value = true;
  if (timeoutId.value) clearTimeout(timeoutId.value);
  timeoutId.value = window.setTimeout(() => {
    showNotification.value = false;
  }, 1500);
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
  try {
    isLoading.value = true;
    const [Mst_paketResponse, handoverFasilitasResponse] = await Promise.all([
      getMstFasilitas(props.transpaketId || 0),
      getHandoverFasilitas(props.transpaketId || 0),
    ]);

    Mst_paket.value = Mst_paketResponse.data || [];
    handoverFasilitas.value = handoverFasilitasResponse.data || [];
    if (Mst_paket.value.error === true) {
      emit('status', {
        error: true,
        err_msg:
          'Tidak ada data handover fasilitas ditemukan. Silakan ambil paket terlebih dahulu pada update target paket.',
      });
      emit('close');
      return;
    }
  } catch (error) {
    displayNotification('Failed to fetch data', 'error');
  } finally {
    isLoading.value = false;
  }
};

// Function: Validasi form
const validateForm = () => {
  let isValid = true;
  errors.value = {
    nama_penerima: '',
    nomor_identitas_penerima: '',
    detail_fasilitas: '',
  };

  if (!form.nama_penerima) {
    errors.value.nama_penerima = 'Nama penerima harus diisi';
    isValid = false;
  }

  if (!form.nomor_identitas_penerima) {
    errors.value.nomor_identitas_penerima = 'Nomor identitas penerima harus diisi';
    isValid = false;
  }

  if (form.detail_fasilitas.length === 0) {
    errors.value.detail_fasilitas = 'Fasilitas harus dipilih';
    isValid = false;
  }

  if (
    form.detail_fasilitas.some(
      (item: any) =>
        typeof item !== 'string' || !Mst_paket.value.find((paket) => paket.id === Number(item)),
    )
  ) {
    console.log(form.detail_fasilitas);
    errors.value.detail_fasilitas =
      'Fasilitas tidak valid, pastikan Anda memilih fasilitas yang benar';
    isValid = false;
  }

  return isValid;
};

// Save Data
const saveData = async () => {
  if (!Mst_paket.value) {
    displayNotification('Paket belum dipilih atau tidak memiliki fasilitas', 'error');
    return;
  }

  if (!validateForm()) return;

  showConfirmation(
    'Konfirmasi Handover Fasilitas',
    `Apakah Anda yakin ingin melakukan handover fasilitas?`,
    async () => {
      try {
        isLoading.value = true;
        const payload = {
          id: props.transpaketId,
          penerima: form.nama_penerima,
          nomor_identitas_penerima: form.nomor_identitas_penerima,
          detail_fasilitas: form.detail_fasilitas,
        };
        console.log(payload);

        const response = await addHandoverFasilitas(payload);
        console.log(response);
        if (response.data === null) {
          displayNotification('Nomor invoice tidak tersedia', 'error');
          return;
        }
        // window.open(`/kwitansi-handover-fasilitas-paket/${response.data.invoice}`, '_blank')
        window.open(`/kwitansi-trans-fasilitas/${response.data.invoice}`, '_blank');
        emit('close');
      } catch (error) {
        showConfirmDialog.value = false;
        emit('status', {
          error: true,
          err_msg: error?.response?.data?.error_msg || error?.response?.data?.message,
        });
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
    v-if="props.isFormHandoverFasilitasOpen && !isLoading"
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
        class="relative p-6 inline-block transform overflow-hidden rounded-lg bg-white text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-3xl sm:align-middle"
      >
        <div class="bg-white">
          <h3 class="text-2xl flex font-bold leading-6 text-gray-900 mb-4">
            Form Handover Fasilitas
          </h3>
          <div class="space-y-4 text-gray-800 overflow-y-auto max-h-[64vh] no-scrollbar px-1">
            <!-- Tabel Dummy -->
            <label class="block ml-2 text-md font-medium text-gray-700"
              >History Penerimaan Fasilitas</label
            >
            <div
              class="overflow-x-auto rounded-lg overflow-y-auto scroll-smooth shadow-md max-h-[36vh] border mb-4"
            >
              <table class="w-full mt-2 border text-center text-xs mb-3">
                <thead>
                  <tr class="bg-gray-100">
                    <th class="w-[15%] p-2 border">Invoice</th>
                    <th class="w-[20%] p-2 border">Nama Item</th>
                    <th class="w-[25%] p-2 border">Penerima</th>
                    <th class="w-[15%] p-2 border">Tgl. Terima</th>
                    <th class="w-[25%] p-2 border">Petugas</th>
                  </tr>
                </thead>
                <tbody>
                  <template v-if="handoverFasilitas && handoverFasilitas.length">
                    <template v-for="(handover, hIndex) in handoverFasilitas" :key="hIndex">
                      <tr
                        v-for="(item, iIndex) in handover.detail"
                        :key="`${hIndex}-${iIndex}`"
                        class="text-center"
                      >
                        <td class="p-2 border">{{ handover.invoice }}</td>
                        <td class="p-2 border">{{ item.name }}</td>
                        <td class="p-2 border">
                          <span class="block">{{ handover.penerima }}</span>
                          <span class="block">({{ handover.nomor_identitas_penerima }})</span>
                        </td>
                        <td class="p-2 border">{{ handover.tgl_penerima }}</td>
                        <td class="p-2 border">{{ handover.petugas }}</td>
                      </tr>
                    </template>
                  </template>
                  <tr v-else>
                    <td colspan="5" class="text-center text-sm p-4 text-gray-600">
                      Daftar handover fasilitas tidak ditemukan
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-4">
                <div class="space-y-2">
                  <label class="block text-sm font-medium text-gray-700">
                    Nama Penerima Fasilitas
                    <span class="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    v-model="form.nama_penerima"
                    class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-600 font-normal"
                    placeholder="Nama Penerima Fasilitas"
                  />
                  <p v-if="errors.nama_penerima" class="mt-1 text-sm text-red-600">
                    {{ errors.nama_penerima }}
                  </p>
                </div>
                <div class="space-y-2">
                  <label class="block text-sm font-medium text-gray-700">
                    No Identitas Penerima Fasilitas
                    <span class="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    inputmode="numeric"
                    pattern="[0-9]*"
                    v-model="form.nomor_identitas_penerima"
                    class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-600 font-normal"
                    placeholder="Nomor Identitas Penerima Fasilitas"
                  />
                  <p v-if="errors.nomor_identitas_penerima" class="mt-1 text-sm text-red-600">
                    {{ errors.nomor_identitas_penerima }}
                  </p>
                </div>
              </div>
              <div class="col-span-1">
                <SearchableCheckboxList
                  v-model="form.detail_fasilitas"
                  :options="Mst_paket"
                  label="Fasilitas paket yang belum diterima"
                  :error="errors.detail_fasilitas"
                  :required="true"
                />
              </div>
            </div>
          </div>
        </div>
        <div class="bg-gray-50 pb-3 pt-6 sm:flex sm:flex-row-reverse sm:px-0 gap-2">
          <PrimaryButton @click="saveData()">SIMPAN</PrimaryButton>
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
