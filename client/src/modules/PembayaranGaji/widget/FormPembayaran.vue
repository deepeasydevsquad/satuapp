<script setup lang="ts">
import Form from '@/components/Modal/Form.vue';
import InputText from '@/components/Form/InputText.vue';
import SelectField from '@/components/Form/SelectField.vue';
import Notification from '@/components/Modal/Notification.vue';
import { ref, computed, watch, onMounted } from 'vue';
import { paramCabang } from '@/service/param_cabang';
import { daftar_staff_sumber_dana, add_pembayaran_gaji } from '@/service/pembayaran_gaji';

defineProps<{
  modalPembayaran: boolean;
}>();

const emit = defineEmits(['cancel', 'submit']);

interface cabang {
  id: number;
  name: string;
}

const optionCabang = ref<cabang[]>([]);
const selectedCabangId = ref(0);

const fetchCabang = async () => {
  const res = await paramCabang();
  optionCabang.value = [
    { id: 0, name: ' -- Pilih Cabang -- ' },
    ...res.data.map((item: any) => ({
      id: item.id,
      name: `${item.name}`,
    })),
  ];
};

interface staff {
  id: number;
  name: string;
}

interface sumberDana {
  id: any;
  name: string;
}

const optionSumberDana = ref<sumberDana[]>([{ id: 0, name: ' -- Pilih Sumber Dana -- ' }]);
const optionStaff = ref<staff[]>([{ id: 0, name: ' -- Pilih Staff -- ' }]);
const selectedStaffId = ref(0);
const selectedSumberDanaId = ref(0);

const errorCabang = ref('');
const errorSumberDana = ref('');
const errorStaff = ref('');

const fetchStaffSumberDana = async () => {
  const res = await daftar_staff_sumber_dana({
    division_id: selectedCabangId.value,
  });
  optionStaff.value = [
    { id: 0, name: ' -- Pilih Staff -- ' },
    ...res.data.staff.map((item: any) => ({
      id: item.id,
      name: `${item.name}`,
    })),
  ];

  optionSumberDana.value = [
    { id: 0, name: ' -- Pilih Sumber Dana -- ' },
    ...res.data.sumber_dana.map((item: any) => ({
      id: item.id,
      name: `${item.name}`,
    })),
  ];
};

const showNotification = ref(false);
const notificationMessage = ref('');
const notificationType = ref<'success' | 'error'>('success');
const timeoutId = ref<number | null>(null);
const displayNotification = (message: string, type: 'success' | 'error' = 'success') => {
  notificationMessage.value = message;
  notificationType.value = type;
  showNotification.value = true;

  if (timeoutId.value) clearTimeout(timeoutId.value);

  timeoutId.value = window.setTimeout(() => {
    showNotification.value = false;
  }, 3000);
};

// ✅ validasi sebelum submit
const handleSubmit = async () => {
  let valid = true;
  errorCabang.value = '';
  errorSumberDana.value = '';
  errorStaff.value = '';
  errorNominal.value = '';

  if (selectedCabangId.value === 0) {
    errorCabang.value = 'Cabang wajib dipilih';
    valid = false;
  }

  if (selectedSumberDanaId.value === 0) {
    errorSumberDana.value = 'Sumber Dana wajib dipilih';
    valid = false;
  }

  if (selectedStaffId.value === 0) {
    errorStaff.value = 'Staff wajib dipilih';
    valid = false;
  }

  if (!nominalGaji.value || isNaN(nominalGaji.value)) {
    errorNominal.value = 'Nominal wajib diisi dengan angka';
    valid = false;
  }

  if (!valid) return;

  try {
    const payload = {
      division_id: selectedCabangId.value,
      sumber_dana: selectedSumberDanaId.value,
      user_id: selectedStaffId.value,
      nominal: Number(nominalGaji.value),
    };

    await add_pembayaran_gaji(payload);

    // ✅ emit close biar nutup modal
    emit('submit');

    // ✅ reset form biar siap next
    resetForm();
  } catch (err) {
    console.error('Gagal simpan:', err);
    displayNotification(err.response.data.message, 'error');
  }
};

const resetForm = () => {
  selectedCabangId.value = 0;
  selectedStaffId.value = 0;
  selectedSumberDanaId.value = 0;
  nominalGaji.value = null;
  optionStaff.value = [{ id: 0, name: ' -- Pilih Staff -- ' }];
  errorCabang.value = '';
  errorStaff.value = '';
  errorSumberDana.value = '';
  errorNominal.value = '';
};

const nominalGaji = ref<number | null>(null);
const errorNominal = ref('');

// helper buat format Rp
const formatRupiah = (angka: number | null): string => {
  if (angka === null) return '';
  return 'Rp ' + angka.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

// helper buat ngubah dari string ke number
const parseRupiah = (str: string): number => {
  const clean = str.replace(/[^0-9]/g, '');
  return Number(clean);
};

const formattedNominal = computed({
  get() {
    return nominalGaji.value !== null ? formatRupiah(nominalGaji.value) : '';
  },
  set(value: string) {
    nominalGaji.value = parseRupiah(value);
  },
});

onMounted(() => {
  console.log('FormPembayaran mounted');
  console.log('FormPembayaran mounted');
  console.log('FormPembayaran mounted');
  console.log('FormPembayaran mounted');
  fetchCabang();
});
</script>

<template>
  <Form
    :formStatus="modalPembayaran"
    :label="'Pembayaran Gaji'"
    width="sm:w-1/4 sm:max-w-1/4"
    @close="$emit('cancel')"
    @cancel="
      () => {
        $emit('cancel');
        resetForm();
      }
    "
    @submit="handleSubmit"
    :submitLabel="'PROSES'"
  >
    <SelectField
      v-model="selectedCabangId"
      label="Cabang"
      placeholder="Pilih cabang"
      class="mt-4"
      :options="optionCabang"
      :error="errorCabang"
      @change="fetchStaffSumberDana"
    />
    <SelectField
      v-model="selectedSumberDanaId"
      label="Sumber Dana"
      placeholder="Pilih sumber dana"
      class="mt-4"
      :options="optionSumberDana"
      :error="errorSumberDana"
    />
    <SelectField
      v-model="selectedStaffId"
      label="Staff"
      placeholder="Pilih staff"
      class="mt-4"
      :options="optionStaff"
      :error="errorStaff"
    />
    <InputText
      v-model="formattedNominal"
      label="Nominal Gaji"
      placeholder="Masukkan nominal"
      class="mt-4"
      :error="errorNominal"
    />
  </Form>
  <!-- Notification Popup -->
  <Notification
    :showNotification="showNotification"
    :notificationType="notificationType"
    :notificationMessage="notificationMessage"
    @closeNotification="showNotification = false"
  />
</template>
