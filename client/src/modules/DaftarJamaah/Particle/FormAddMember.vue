<script setup lang="ts">
import PrimaryButton from '@/components/Button/PrimaryButton.vue';
import SearchableSelect from '@/modules/DaftarJamaah/Particle/SearchableSelect.vue';
import { ref, onMounted, watch } from 'vue';

import { getMemberNotJamaah } from '@/service/daftar_jamaah';
import { paramCabang } from '@/service/param_cabang';

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'status', payload: { error: boolean; err_msg?: string }): void;
  (e: 'addMember', payload: { division_id: number; memberId: number }): void;
}>();

const props = defineProps<{
  isFormAddMemberOpen: boolean;
  cabangId: number;
}>();

interface Member {
  id: number;
  nama: string;
}

interface Cabang {
  id: number;
  name: string;
}

const members = ref<Member[]>([]);
const selectedMember = ref<number | null>(null);
const selectedCabang = ref<number>(0);
const optionCabang = ref<Cabang[]>([]);

const fetchData = async () => {
  try {
    const [memberRes, cabangRes] = await Promise.all([
      getMemberNotJamaah(selectedCabang.value),
      paramCabang(),
    ]);
    optionCabang.value = cabangRes.data;
    members.value = memberRes.data;
    console.log(members.value);
  } catch (error) {
    console.error(error);
    emit('status', { error: true, err_msg: 'Terjadi kesalahan saat mengambil data member' });
  }
};

const handleNextStep = () => {
  if (selectedMember.value !== null) {
    emit('addMember', { division_id: selectedCabang.value, memberId: selectedMember.value });
    emit('close');
  } else {
    emit('status', { error: true, err_msg: 'Mohon pilih member terlebih dahulu.' });
  }
};

onMounted(() => {
  selectedCabang.value = props.cabangId;
  fetchData();
});

watch(
  () => selectedCabang.value,
  async (newCabangId) => {
    selectedMember.value = null;
    await fetchData();
  },
);
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
    <div class="bg-white rounded-2xl p-6 w-full max-w-sm shadow-lg text-center">
      <h2 class="text-xl font-bold mb-6 text-gray-700">Tambah Jamaah Dari Member</h2>

      <div class="text-left mb-6 text-gray-700 space-y-6">
        <SearchableSelect
          v-model="selectedCabang"
          :options="optionCabang"
          :label="'Pilih Cabang'"
          :placeholder="'Cari Cabang...'"
          :idField="'id'"
          :nameField="'name'"
          :required="true"
          :disabled="false"
        />
        <SearchableSelect
          v-model="selectedMember"
          :options="members"
          :label="'Pilih Member'"
          :placeholder="'Cari Member...'"
          :idField="'id'"
          :nameField="'name'"
          :required="true"
          :disabled="false"
        />
      </div>

      <!-- Footer Buttons -->
      <div class="flex justify-end space-x-4 mt-6">
        <button
          @click="emit('close')"
          class="mt-3 inline-flex w-full justify-center rounded-md border border-gray-400 bg-gray-200 px-4 py-2 text-base font-medium text-gray-800 shadow-sm hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
        >
          BATAL
        </button>
        <PrimaryButton @click="handleNextStep"> SELANJUTNYA </PrimaryButton>
      </div>
    </div>
  </div>
</template>
