<script setup lang="ts">
import { ref, defineProps, defineEmits, watch } from 'vue';
import { getAllJamaah, getAllCities, createBus, updateBus, getBusById } from '@/service/bus_paket';
import Form from '@/components/Modal/Form.vue';
import alertify from 'alertifyjs';

const props = defineProps<{
  id: number;
  isFormOpen: boolean;
  cabangId: number;
  paketId: number;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'save-success', message: string): void;
  (e: 'show-notification', message: string, type: 'success' | 'error'): void;
}>();

interface Jamaah {
  id: number;
  fullname: string;
  identity_number: string;
}

const cityList = ref<{ id: number; name: string }[]>([]);
const allJamaahList = ref<{ id: number; fullname: string; identity_number: string }[]>([]);
const isLoading = ref(false);
const ErrorsMessage = ref<Record<string, string>>({});

const formData = ref({
  id: 0,
  bus_number: '',
  city_id: 0,
  kapasitas_bus: 0,
  bus_leader: '',
  jamaah_ids: [{ id: 0 }],
});

const fetchData = async () => {
  try {
    var payload = {};
    if (props.id != 0) {
      const resp = await getBusById(props.id);
      formData.value = resp.data;
      payload = { id: props.id, division_id: props.cabangId, paket_id: props.paketId };
    } else {
      formData.value = {
        id: 0,
        bus_number: '',
        city_id: 0,
        kapasitas_bus: 0,
        bus_leader: '',
        jamaah_ids: [{ id: 0 }],
      };
      payload = { division_id: props.cabangId, paket_id: props.paketId };
    }
    const responseCity = await getAllCities();
    const responseJamaah = await getAllJamaah(payload);
    cityList.value = [{ id: 0, name: 'Pilih Kota' }, ...responseCity];
    allJamaahList.value = [
      { id: 0, fullname: 'Pilih Jamaah', identity_number: '' },
      ...responseJamaah,
    ];
  } catch (error) {
    emit('show-notification', 'Gagal memuat data untuk form.', 'error');
  }
};

function createEmptyJamaah(): Jamaah {
  return {
    id: 0,
    fullname: '',
    identity_number: '',
  };
}

const addRow = () => {
  formData.value.jamaah_ids.push(createEmptyJamaah());
};

function removeJamaah(index: number) {
  if (formData.value.jamaah_ids.length == 1) {
    alertify.error('Anda wajib memilih salah satu jamaah.');
  } else {
    formData.value.jamaah_ids.splice(index, 1);
  }
}

const validateForm = (): boolean => {
  let isValid = true;
  ErrorsMessage.value = {};

  if (formData.value.bus_number == '') {
    ErrorsMessage.value.name = 'Nomor Bus tidak boleh kosong.';
    isValid = false;
  }

  if (formData.value.city_id == 0) {
    ErrorsMessage.value.name = 'Anda wajib memilih salah satu kota.';
    isValid = false;
  }

  if (formData.value.kapasitas_bus == 0) {
    ErrorsMessage.value.name = 'Kapasitas bus harus lebih besar dari 0.';
    isValid = false;
  }

  if (formData.value.bus_leader == '') {
    ErrorsMessage.value.name = 'Anda wajib mengisi nama bus leader.';
    isValid = false;
  }
  if (formData.value.jamaah_ids.length == 0) {
    ErrorsMessage.value.name = 'Anda wajib memilih salah satu jamaah.';
    isValid = false;
  }

  if (
    formData.value.kapasitas_bus != 0 &&
    formData.value.kapasitas_bus < formData.value.jamaah_ids.length
  ) {
    ErrorsMessage.value.name = 'Jumlah jamaah tidak boleh melebihi kapasitas bus.';
    isValid = false;
  }

  var listJ = [];
  for (let x in formData.value.jamaah_ids) {
    if (formData.value.jamaah_ids[x].id != 0) {
      if (listJ.includes(formData.value.jamaah_ids[x].id)) {
        ErrorsMessage.value[formData.value.jamaah_ids[x].id] =
          'Anda tidak boleh memilih nama yang sama dalam satu kamar.';
        isValid = false;
      } else {
        listJ.push(formData.value.jamaah_ids[x].id);
      }
    } else {
      ErrorsMessage.value.name = 'Anda wajib memilih salah satu nama jamaah.';
      isValid = false;
    }
  }
  return isValid;
};

const handleSubmit = async () => {
  if (!validateForm()) {
    for (let x in ErrorsMessage.value) {
      alertify.error(ErrorsMessage.value[x]);
    }
    return;
  }

  try {
    const payload = {
      ...formData.value,
      division_id: props.cabangId,
      paketId: props.paketId,
      jamaah_ids: formData.value.jamaah_ids.map((j) => j.id).filter((id) => id !== null),
    };

    if (props.id != 0) {
      await updateBus(props.id, payload);
      emit('save-success', 'Data  bus berhasil diperbaharui.');
    } else {
      await createBus(payload);
      emit('save-success', 'Data bus berhasil ditambahkan.');
    }

    emit('close');
  } catch (error: any) {
    if (error.response && error.response.status === 400) {
      alertify.error(error.response.data.message);
    } else {
      const errorMessage =
        error.response?.data?.message || 'Terjadi kesalahan saat menyimpan data.';
      emit('show-notification', errorMessage, 'error');
    }
    console.error('Gagal menyimpan data:', error);
  } finally {
    isLoading.value = false;
  }
};

const handleCancel = (): void => {
  formData.value = {
    id: 0,
    bus_number: '',
    city_id: 0,
    kapasitas_bus: 0,
    bus_leader: '',
    jamaah_ids: [{ id: 0 }],
  };
  emit('close');
  ErrorsMessage.value = {};
};

watch(
  () => props.isFormOpen,
  (e) => {
    fetchData();
  },
);
</script>
<template>
  <Form
    :form-status="isFormOpen"
    :label="formData.id === 0 ? 'Tambah Bus' : 'Edit Bus'"
    @close="handleCancel"
    @cancel="handleCancel"
    @submit="handleSubmit"
    width="sm:w-full sm:max-w-xl"
    :submitLabel="formData.id === 0 ? 'TAMBAH BUS' : 'PERBAHARUI BUS'"
  >
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label for="bus_number" class="block text-sm font-medium text-black mb-1">Nomor Bus</label>
        <input
          id="bus_number"
          type="text"
          placeholder="Nomor Bus contoh: BL 12345 UA"
          v-model="formData.bus_number"
          class="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-black placeholder:text-gray-400"
        />
      </div>
      <div>
        <label for="bus_leader" class="block text-sm font-medium text-black mb-1">Bus Leader</label>
        <input
          id="bus_leader"
          type="text"
          placeholder="Pemimpin Bus"
          v-model="formData.bus_leader"
          class="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-black placeholder:text-gray-400"
        />
      </div>
      <div>
        <label for="kapasitas" class="block text-sm font-medium text-black mb-1"
          >Kapasitas Bus</label
        >
        <input
          type="number"
          id="kapasitas"
          v-model="formData.kapasitas_bus"
          min="1"
          class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-black placeholder:text-gray-400"
        />
      </div>
      <div>
        <label for="city" class="block text-sm font-medium text-black mb-1">Nama Kota</label>
        <select
          id="city"
          v-model="formData.city_id"
          class="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-black placeholder:text-gray-400"
        >
          <option v-for="city in cityList" :key="city.id" :value="city.id">{{ city.name }}</option>
        </select>
      </div>
      <div class="md:col-span-2">
        <label class="block text-sm font-medium text-black mb-1">Daftar Jamaah</label>
        <div
          v-for="(jamaah, index) in formData.jamaah_ids"
          :key="index"
          class="flex items-center gap-2 mb-2"
        >
          <select
            v-model="jamaah.id"
            class="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-black"
          >
            <option v-for="j in allJamaahList" :key="j.id" :value="j.id">
              {{ j.fullname }}
              <template v-if="j.id != 0"> ({{ j.identity_number }}) </template>
            </option>
          </select>
          <button
            type="button"
            @click="removeJamaah(index)"
            class="p-2 text-red-500 hover:text-red-700 text-2xl"
            title="Hapus Jamaah"
          >
            &times;
          </button>
        </div>
        <button
          type="button"
          @click="addRow"
          class="w-full mt-2 px-4 py-2 border border-dashed border-gray-300 text-sm font-medium rounded-md text-black hover:bg-gray-50"
        >
          + Tambah Jamaah
        </button>
      </div>
    </div>
  </Form>
</template>
<style scoped></style>
