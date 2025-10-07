<template>
  <Form
    class="mr-6"
    :form-status="isOpen"
    :label="'Tambah Cabang Baru'"
    width="sm:w-1/3 sm:max-w-1/3"
    @close="$emit('close')"
    @cancel="$emit('close')"
    @submit="saveForm"
    :submitLabel="'TAMBAH CABANG'"
  >
    <div class="mb-4">
      <label class="block text-gray-700 font-medium mb-1">Nama Cabang</label>
      <input
        v-model="form.name"
        placeholder="Nama Cabang"
        type="text"
        class="text-gray-700 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />
    </div>
    <div class="mb-4 grid grid-cols-2">
      <div class="me-2">
        <label class="block text-gray-700 font-medium mb-1">Nama Kota</label>
        <select
          v-model="form.city"
          class="text-gray-700 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          :disabled="kotaList.length == 0"
        >
          <option value="" disabled>Pilih Kota</option>
          <option v-for="kota in kotaList" :key="kota.id" :value="kota.id">
            {{ kota.name }}
          </option>
        </select>
      </div>
      <div class="ms-2">
        <div class="mb-4">
          <label class="block text-gray-700 font-medium mb-1">Kode Pos</label>
          <input
            v-model="form.pos_code"
            placeholder="Kode Pos"
            type="text"
            class="text-gray-700 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>
    </div>
    <div class="mb-4 grid grid-cols-2">
      <div class="me-2">
        <div class="mb-4">
          <label class="block text-gray-700 font-medium mb-1">Tanda Tangan</label>
          <input
            type="file"
            @change="handleFileUpload"
            accept="image/png"
            class="text-gray-700 w-full px-4 pt-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <p class="text-xs text-gray-500 mt-1">
            Gambar harus berekstensi <span class="font-semibold">.png</span>, maksimal
            <span class="font-semibold">1 MB</span>, dan berukuran
            <span class="font-semibold">110 x 80 pixel</span>.
          </p>
        </div>
      </div>
      <div class="ms-2">
        <div class="mb-4">
          <label class="block text-gray-700 font-medium mb-1">Alamat</label>
          <textarea
            placeholder="Alamat"
            v-model="form.address"
            class="text-gray-700 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            rows="4"
          ></textarea>
        </div>
      </div>
    </div>
    <div class="mb-4">
      <label class="block text-gray-700 font-medium mb-1">Catatan</label>
      <textarea
        placeholder="Catatan"
        v-model="form.note"
        class="text-gray-700 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
        rows="4"
      ></textarea>
    </div>
  </Form>
</template>

<script setup lang="ts">
import { ref, defineEmits, onMounted } from 'vue';
import { daftarKota } from '@/service/cabang';
import Form from '@/components/Modal/Form.vue';

interface Kota {
  id: number;
  name: string;
}

const emit = defineEmits(['close', 'save']);

const kotaList = ref<Kota[]>([]);

const form = ref({
  name: '',
  city: '',
  pos_code: '',
  address: '',
  tanda_tangan: null,
  note: '',
});

const isOpen = ref(true);

onMounted(() => {
  fetchKota();
});

const fetchKota = async () => {
  try {
    const response = await daftarKota();
    kotaList.value = response.data;
    console.log('Kota:', kotaList.value);
  } catch (error) {
    console.error('Error fetching kota:', error);
  }
};

const handleFileUpload = (event) => {
  const file = event.target.files?.[0];
  if (file) {
    form.value.tanda_tangan = file;
  }
};

const saveForm = () => {
  if (!form.value.city || !form.value.pos_code || !form.value.address) {
    alert('Harap isi semua field yang wajib!');
    return;
  }
  emit('save', { ...form.value, city: form.value.city });
  isOpen.value = false;
};
</script>

<style scoped>
/* Background Fade */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.4s ease-out;
}
.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

/* Modal Scale & Slide */
.modal-scale-enter-active {
  transition:
    transform 0.4s cubic-bezier(0.25, 1, 0.5, 1),
    opacity 0.3s ease-out;
}
.modal-scale-leave-active {
  transition:
    transform 0.3s ease-in,
    opacity 0.2s ease-in;
}
.modal-scale-enter-from {
  transform: scale(0.8) translateY(20px);
  opacity: 0;
}
.modal-scale-leave-to {
  transform: scale(0.9) translateY(-10px);
  opacity: 0;
}
</style>
