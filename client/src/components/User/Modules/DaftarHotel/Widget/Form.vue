<script setup lang="ts">
import { ref, onMounted } from 'vue'
import PrimaryButton from '@/components/Button/PrimaryButton.vue';
import Confirmation from '@/components/User/Modules/DaftarHotel/Particle/Confirmation.vue';
import { daftarKota, addHotel, editHotel } from '@/service/daftar_hotel';

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'status', payload: { error: boolean, err_msg?: string }): void
}>()

const props = defineProps({
  isModalOpen: {
    type: Boolean,
    required: true
  },
  selectedHotel: {
    type: Object,
  }
})

interface Errors {
  kota: string;
  name: string;
  desc: string;
  star: string;
}

interface Kota {
  id: number;
  name: string;
}

interface Hotel {
  id: number;
  kota: string;
  name: string;
  desc: string;
  star: number;
}

const errors = ref<Errors>({
  kota: '',
  name: '',
  desc: '',
  star: ''
});

const Hotel = ref<Partial<Hotel>>({
  kota: '',
  name: '',
  desc: '',
  star: 0,
})

const kotaList = ref<Kota[]>([]);
const showConfirmDialog = ref<boolean>(false);
const confirmMessage = ref<string>('');
const confirmTitle = ref<string>('');
const confirmAction = ref<(() => void) | null>(null);

const fetchDataKota = async () => {
  try {
    const response = await daftarKota()
    kotaList.value = response.data
  } catch (error) {
    emit('close')
    emit('status', { error: true, err_msg: (error.response.data?.err_msg || error.response.data?.message) || 'Terjadi kesalahan saat mengambil data kota.' });
  }
}

const showConfirmation = (title: string, message: string, action: () => void) => {
  confirmTitle.value = title;
  confirmMessage.value = message;
  confirmAction.value = action;
  showConfirmDialog.value = true;
};

const validateForm = (): boolean => {
  errors.value = { kota: '', name: '', desc: '', star: '' };
  let isValid = true;

  if (!Hotel.value.kota?.trim()) {
    errors.value.kota = 'Kota tidak boleh kosong';
    isValid = false;
  }
  if (!Hotel.value.name?.trim()) {
    errors.value.name = 'Nama tidak boleh kosong';
    isValid = false;
  }
  if (!Hotel.value.desc?.trim()) {
    errors.value.desc = 'Deskripsi tidak boleh kosong';
    isValid = false;
  }
  if (!Hotel.value.star || Hotel.value.star < 1) {
    errors.value.star = 'Bintang harus lebih dari 0';
    isValid = false;
  }
  return isValid;
};

const saveData = async () => {
  if (!validateForm()) return;

  const isEdit = !!Hotel.value.id;
  const action = async () => {
    try {
      if (isEdit) {
        const response = await editHotel(Hotel.value.id, Hotel.value );
        showConfirmDialog.value = false;
        emit('status', { error: false, err_msg: (response?.error_msg || response?.message) || 'Kota berhasil di update' });
      } else {
        const response = await addHotel(Hotel.value);
        showConfirmDialog.value = false;
        emit('status', { error: false, err_msg: (response?.error_msg || response?.message) || 'Kota berhasil di tambahkan' });
      }
      emit('close')
    } catch (error) {
      showConfirmDialog.value = false;
      emit('status', { error: true, err_msg: (error?.response?.data?.error_msg || error.response?.data?.message) || 'Terjadi kesalahan saat menyimpan data.' });
    }
  };

  isEdit ? showConfirmation('Konfirmasi Perubahan', 'Apakah Anda yakin ingin mengubah data ini?', action) : action();
};

onMounted(() => {
  Hotel.value = { ...Hotel.value, ...(props.selectedHotel ?? {}) };
  fetchDataKota();
})
</script>


<template>
  <div v-if="props.isModalOpen" class="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
    <div class="flex min-h-screen items-end justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
      <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" @click="emit('close')"></div>
      <span class="hidden sm:inline-block sm:h-screen sm:align-middle" aria-hidden="true">&#8203;</span>
      <div class="relative inline-block transform overflow-hidden rounded-lg bg-white text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:align-middle">
        <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
          <h3 class="text-2xl flex justify-center font-bold leading-6 text-gray-900 mb-4">
            {{ Hotel.id ? "Edit Data Hotel" : "Tambah Hotel Baru" }}
          </h3>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Nama Kota</label>
              <select
                v-model="Hotel.kota"
                class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-600 font-normal"
              >
                <option value="" disabled>Pilih Kota</option>
                <option v-for="kota in kotaList" :key="kota.id" :value="kota.name">{{ kota.name }}</option>
              </select>
              <p v-if="errors.kota" class="mt-1 text-sm text-red-600">{{ errors.kota }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Nama Hotel</label>
              <input
                v-model="Hotel.name"
                type="text"
                class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-600 font-normal"
                placeholder="Nama Hotel"
              />
              <p v-if="errors.name" class="mt-1 text-sm text-red-600">{{ errors.name }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Deskripsi Hotel</label>
              <textarea
                v-model="Hotel.desc"
                rows="3"
                class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-600 font-normal"
                placeholder="Deskripsi Hotel"
              ></textarea>
              <p v-if="errors.desc" class="mt-1 text-sm text-red-600">{{ errors.desc }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Jumlah Bintang</label>
              <input
                v-model="Hotel.star"
                type="text"
                class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-600 font-normal"
                placeholder="Jumlah Bintang Hotel"
              />
              <p v-if="errors.star" class="mt-1 text-sm text-red-600">{{ errors.star }}</p>
            </div>
          </div>
        </div>
        <div class="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6 gap-2">
          <PrimaryButton
            @click="saveData"
          >
            {{ Hotel.id ? "Simpan Perubahan" : "Tambah" }}
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
  <Confirmation :showConfirmDialog="showConfirmDialog"  :confirmTitle="confirmTitle" :confirmMessage="confirmMessage" >
    <button @click="confirmAction && confirmAction()"
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
