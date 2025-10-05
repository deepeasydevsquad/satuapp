<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { daftarBank, addSupplier, editSupplier } from '@/service/supplier';
import Confirmation from '@/components/User/Modules/Supplier/Particle/Confirmation.vue';
import PrimaryButton from '@/components/Button/PrimaryButton.vue';

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'status', payload: { error: boolean; err_msg?: string }): void;
}>();

const props = defineProps({
  isModalOpen: {
    type: Boolean,
    required: true,
  },
  selectedSupplier: {
    type: Object,
  },
});

interface Errors {
  name: string;
  address: string;
  bank: string;
  nomor_rekening: string;
}

interface Bank {
  id: number;
  name: string;
}

const errors = ref<Errors>({
  name: '',
  address: '',
  bank: '',
  nomor_rekening: '',
});

interface Supplier {
  id: number;
  name: string;
  address: string;
  bank: string;
  bank_id: number;
  nomor_rekening: string;
}

const Supplier = ref<Partial<Supplier>>({
  name: '',
  address: '',
  bank_id: 0,
  nomor_rekening: '',
});

const bankList = ref<Bank[]>([]);
const showConfirmDialog = ref<boolean>(false);
const confirmMessage = ref<string>('');
const confirmTitle = ref<string>('');
const confirmAction = ref<(() => void) | null>(null);

const fetchDataBank = async () => {
  try {
    const response = await daftarBank();
    bankList.value = response.data;
  } catch (error) {
    emit('close');
    emit('status', {
      error: true,
      err_msg:
        error.response.data?.err_msg ||
        error.response.data?.message ||
        'Terjadi kesalahan saat mengambil data bank.',
    });
  }
};

const showConfirmation = (title: string, message: string, action: () => void) => {
  confirmTitle.value = title;
  confirmMessage.value = message;
  confirmAction.value = action;
  showConfirmDialog.value = true;
};

const validateForm = (): boolean => {
  errors.value = { name: '', address: '', bank: '', nomor_rekening: '' };
  let isValid = true;

  if (!Supplier.value.name?.trim()) {
    errors.value.name = 'Nama tidak boleh kosong';
    isValid = false;
  }
  if (!Supplier.value.address?.trim()) {
    errors.value.address = 'Alamat tidak boleh kosong';
    isValid = false;
  }
  if (!Supplier.value.bank_id?.toString().trim() || Supplier.value.bank_id === 0) {
    errors.value.bank = 'Bank tidak boleh kosong';
    isValid = false;
  }
  if (!Supplier.value.nomor_rekening) {
    errors.value.nomor_rekening = 'Nomor rekening tidak boleh kosong';
    isValid = false;
  }
  return isValid;
};

const saveData = async () => {
  if (!validateForm()) return;

  const isEdit = !!Supplier.value.id;
  const action = async () => {
    try {
      if (isEdit) {
        const response = await editSupplier(Supplier.value.id, Supplier.value);
        showConfirmDialog.value = false;
        emit('status', {
          error: false,
          err_msg: response?.error_msg || response?.data?.message || 'Supplier berhasil di update',
        });
      } else {
        const response = await addSupplier(Supplier.value);
        showConfirmDialog.value = false;
        emit('status', {
          error: false,
          err_msg:
            response?.error_msg || response?.data?.message || 'Supplier berhasil di tambahkan',
        });
      }
      emit('close');
    } catch (error) {
      showConfirmDialog.value = false;
      emit('status', {
        error: true,
        err_msg:
          error.response?.data?.err_msg ||
          error.response?.data?.message ||
          'Terjadi kesalahan saat menyimpan data.',
      });
    }
  };

  isEdit
    ? showConfirmation('Konfirmasi Perubahan', 'Apakah Anda yakin ingin mengubah data ini?', action)
    : action();
};

onMounted(() => {
  Supplier.value = { ...Supplier.value, ...(props.selectedSupplier ?? {}) };
  fetchDataBank();
});
</script>

<template>
  <div
    v-if="isModalOpen"
    class="fixed inset-0 z-50 overflow-y-auto"
    aria-labelledby="modal-title"
    role="dialog"
    aria-modal="true"
  >
    <div
      class="flex min-h-screen items-end justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0"
    >
      <div
        class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
        aria-hidden="true"
        @click="emit('close')"
      ></div>
      <span class="hidden sm:inline-block sm:h-screen sm:align-middle" aria-hidden="true"
        >&#8203;</span
      >
      <div
        class="relative inline-block transform overflow-hidden rounded-lg bg-white text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:align-middle"
      >
        <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
          <h3 class="text-2xl flex justify-center font-bold leading-6 text-gray-900 mb-4">
            {{ Supplier.id ? 'Edit Data Supplier' : 'Tambah Supplier Baru' }}
          </h3>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Nama Supplier</label>
              <input
                v-model="Supplier.name"
                type="text"
                class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-600 font-normal"
                placeholder="Nama Supplier"
              />
              <p v-if="errors.name" class="mt-1 text-sm text-red-600">{{ errors.name }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Alamat Supplier</label>
              <textarea
                v-model="Supplier.address"
                rows="3"
                class="w-full resize-none rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-600 font-normal"
                placeholder="Alamat Supplier"
              ></textarea>
              <p v-if="errors.address" class="mt-1 text-sm text-red-600">{{ errors.address }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Bank</label>
              <select
                v-model="Supplier.bank_id"
                class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-600 font-normal"
              >
                <option value="0">Pilih Bank</option>
                <option v-for="bank in bankList" :key="bank.id" :value="bank.id">
                  {{ bank.name }}
                </option>
              </select>
              <p v-if="errors.bank" class="mt-1 text-sm text-red-600">{{ errors.bank }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Nomor Rekening</label>
              <input
                v-model="Supplier.nomor_rekening"
                type="text"
                class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-600 font-normal"
                placeholder="Nomor Rekening Supplier"
              />
              <p v-if="errors.nomor_rekening" class="mt-1 text-sm text-red-600">
                {{ errors.nomor_rekening }}
              </p>
            </div>
          </div>
        </div>
        <div class="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6 gap-2">
          <PrimaryButton @click="saveData">
            {{ Supplier.id ? 'Simpan Perubahan' : 'Tambah' }}
          </PrimaryButton>
          <button
            @click="emit('close')"
            class="mt-3 inline-flex w-full justify-center rounded-md border border-gray-400 bg-gray-200 px-4 py-2 text-base font-medium text-gray-800 shadow-sm hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
          >
            Batal
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
</template>
