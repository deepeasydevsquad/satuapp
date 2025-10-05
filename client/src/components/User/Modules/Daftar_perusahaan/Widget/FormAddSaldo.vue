<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { tambah_saldo, get_data_edit_perusahaan } from '@/service/daftar_perusahaan';
import Form from '@/components/Modal/Form.vue';
import InputText from '@/components/Form/InputText.vue';
import Notification from '@/components/Modal/Notification.vue';

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const props = defineProps({
  id: {
    type: Number,
    required: true,
  },
  isModalOpen: {
    type: Boolean,
    required: true,
  },
});

interface FormData {
  company_name: string;
  saldo: number;
  new_saldo: number;
  add_saldo: number;
}

const form = ref<FormData>({
  company_name: '',
  saldo: 0,
  new_saldo: 0,
  add_saldo: 0,
});

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

const fetchEditData = async () => {
  try {
    const response = await get_data_edit_perusahaan({
      id: props.id,
    });

    form.value = {
      company_name: response.data.company_name,
      saldo: response.data.saldo,
      new_saldo: response.data.saldo,
      add_saldo: 0,
    };
  } catch (error) {
    displayNotification(error.response.data.message, 'error');
  }
};

const errors = ref<Record<string, string>>({});

const reset = (): void => {
  form.value = {
    company_name: '',
    saldo: 0,
    new_saldo: 0,
    add_saldo: 0,
  };
  errors.value = {};
};

const handleCancel = (): void => {
  emit('close');
  reset();
  errors.value = {};
};

const validateForm = (): boolean => {
  errors.value = {};

  let isValid = true;

  if (form.value.new_saldo == 0) {
    errors.value.new_saldo = 'Saldo tidak boleh kosong.';
    isValid = false;
  }

  return isValid;
};

const parseRupiah = (str: string): number => {
  const clean = str.replace(/[^0-9]/g, '');
  return Number(clean);
};

const formatRupiah = (angka: number | null): string => {
  if (angka === null) return '';
  return 'Rp ' + angka.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

const handleSubmit = async () => {
  if (!validateForm()) return;

  try {
    const response = await tambah_saldo({ id: props.id, saldo: form.value.new_saldo });
    displayNotification(response.error_msg, 'success');
    emit('close');
    reset();
  } catch (error) {
    displayNotification(error.response.data.message, 'error');
  }
};

const formattedNominal = computed({
  get() {
    return form.value.add_saldo ? formatRupiah(form.value.add_saldo) : '';
  },
  set(value: string) {
    form.value.add_saldo = parseRupiah(value); // harus update add_saldo, bukan saldo
  },
});

// newSaldo otomatis hitung dari saldo lama + saldo tambahan
const newSaldo = computed(() => {
  return formatRupiah((form.value.saldo || 0) + (form.value.add_saldo || 0));
});

watch(
  () => form.value.add_saldo,
  (val) => {
    form.value.new_saldo = (form.value.saldo || 0) + (val || 0);
  },
);

watch(
  () => props.isModalOpen,
  (val) => {
    if (val) {
      fetchEditData();
    }
  },
);
</script>

<template>
  <Form
    :form-status="isModalOpen"
    :label="'Tambah Saldo Perusahaan'"
    @close="handleCancel"
    @cancel="handleCancel"
    @submit="handleSubmit"
    width="sm:w-full sm:max-w-lg"
    :submitLabel="'TAMBAH SALDO PERUSAHAAN'"
  >
    <div class="grid grid-cols-6 gap-6">
      <div class="col-span-6">
        <InputText
          id="nama_perusahaan"
          v-model="form.company_name"
          label="Nama Perusahaan"
          placeholder="Masukkan nama perusahaan"
          required
          :error="errors.company_name"
          class="mb-0"
          :disabled="true"
        />
      </div>
      <div class="col-span-6">
        <InputText
          id="saldo"
          label="Saldo Perusahaan Sekarang"
          placeholder="Saldo Perusahaan Sekarang"
          v-model="newSaldo"
          required
          :disabled="true"
        />
      </div>
      <div class="col-span-6">
        <InputText
          id="saldo"
          v-model="formattedNominal"
          label="Penambahan Saldo"
          placeholder="Penambahan Saldo Perusahaan"
          required
        />
      </div>
    </div>
  </Form>
  <Notification
    :showNotification="showNotification"
    :notificationType="notificationType"
    :notificationMessage="notificationMessage"
    @close="showNotification = false"
  ></Notification>
</template>
