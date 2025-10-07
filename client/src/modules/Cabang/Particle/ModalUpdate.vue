<template>
  <Form
    class="mr-6"
    :form-status="isOpen"
    :label="'Update Cabang'"
    width="sm:w-1/3 sm:max-w-1/3"
    @close="$emit('close')"
    @cancel="$emit('close')"
    @submit="updateForm"
    :submitLabel="'PERBAHARUI CABANG'"
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
        <div class="mb-4">
          <label class="block text-gray-700 font-medium mb-1">Nama Kota</label>
          <select
            v-model="form.city_id"
            class="text-gray-700 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            :disabled="!kotaList.length"
          >
            <option value="" disabled>Pilih Kota</option>
            <option v-for="kota in kotaList" :key="kota.id" :value="kota.id">
              {{ kota.name }}
            </option>
          </select>
        </div>
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
            class="text-gray-700 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <p v-if="form.tanda_tangan" class="text-sm text-gray-600 mt-1">
            File saat ini: {{ form.tanda_tangan.name || 'Sudah ada tanda tangan' }}
          </p>
          <p v-else class="text-xs text-gray-500 mt-1">
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
import { ref, defineEmits, defineProps, onMounted, watch } from 'vue';
import { daftarKota } from '@/service/cabang';
import Form from '@/components/Modal/Form.vue';

interface Kota {
  id: number;
  name: string;
}

const emit = defineEmits(['close', 'update']);

const isOpen = ref(true);

// Props untuk menerima data cabang yang akan diedit
const props = defineProps({
  cabang: Object,
});

const kotaList = ref<Kota[]>([]);
const form = ref({
  id: null,
  name: '',
  city: '',
  city_id: 0,
  pos_code: '',
  address: '',
  tanda_tangan: null,
  note: '',
});

// Update form ketika data cabang berubah
watch(
  () => props.cabang,
  (newCabang) => {
    if (newCabang) {
      console.log('________xxx________');
      console.log(newCabang);
      // console.log(newCabang.city_id);
      console.log('________xxx________');
      form.value = {
        id: newCabang.id,
        name: newCabang.name,
        city: newCabang.city,
        city_id: newCabang.city_id,
        pos_code: newCabang.pos_code,
        address: newCabang.address,
        tanda_tangan: newCabang.tanda_tangan,
        note: newCabang.note,
      };
    }
  },
  { immediate: true },
);

const fetchKota = async () => {
  try {
    const response = await daftarKota();
    kotaList.value = response.data;
  } catch (error) {
    console.error('Error fetching kota:', error);
  }
};

const handleFileUpload = (event) => {
  const file = event.target.files?.[0];
  if (file) {
    console.log('File yang dipilih:', file);
    form.value.tanda_tangan = file;
  }
};

const updateForm = () => {
  if (!form.value.city || !form.value.pos_code || !form.value.address) {
    alert('Harap isi semua field yang wajib!');
    return;
  }
  console.log('Mengirim update:', form.value);
  emit('update', {
    ...form.value,
    city: form.value.city, // city tetap sebagai ID kota
  });
  console.log('Update event emitted!');
};

onMounted(() => {
  fetchKota();
});
</script>
