<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import Confirmation from '@/components/User/Modules/DaftarHotel/Particle/Confirmation.vue';
import InputText from '@/components/Form/InputText.vue';
import Form from '@/components/Modal/Form.vue';
import SelectField from '@/components/Form/SelectField.vue';
import {
  list_bank_transfer,
  add_deposit,
  get_info_edit,
  update_deposit,
} from '@/service/riwayat_tambah_saldo_perusahaan';
//

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const props = defineProps({
  id: {
    type: Number,
    required: false,
    default: 0,
  },
  isModalOpen: {
    type: Boolean,
    required: true,
  },
});

interface FormData {
  nominal: number;
  bank: number;
}

const errors = ref<Record<string, string>>({});
const form = ref<FormData>({
  nominal: 0,
  bank: 0,
});

const reset = (): void => {
  form.value = {
    nominal: 0,
    bank: 0,
  };
  errors.value = {};
};

const showConfirmDialog = ref<boolean>(false);
const confirmMessage = ref<string>('');
const confirmTitle = ref<string>('');
const confirmAction = ref<(() => void) | null>(null);

const showConfirmation = (title: string, message: string, action: () => void) => {
  confirmTitle.value = title;
  confirmMessage.value = message;
  confirmAction.value = action;
  showConfirmDialog.value = true;
};

const validateForm = (): boolean => {
  errors.value = { kota: '', name: '', desc: '', star: '' };
  let isValid = true;

  if (form.value.nominal == 0) {
    errors.value.nominal = 'Nominal deposit tidak boleh nol';
    isValid = false;
  }

  return isValid;
};

const nominalSaldo = computed({
  get() {
    return form.value.nominal
      ? 'Rp ' + form.value.nominal.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
      : '';
  },
  set(value: string) {
    const clean = value.replace(/[^\d]/g, '');
    form.value.nominal = Number(clean);
  },
});

const handleSubmit = async () => {
  if (!validateForm()) return;

  try {
    const response =
      props.id != 0
        ? await update_deposit({
            id: props.id,
            bank_id: form.value.bank,
            nominal: form.value.nominal,
          })
        : await add_deposit({ bank_id: form.value.bank, nominal: form.value.nominal });
    displayNotification(response.message, 'success');
    emit('close');
    reset();
  } catch (error) {
    displayNotification(error.response.data.message, 'error');
  }
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

const handleCancel = (): void => {
  emit('close');
  errors.value = {};
};

interface Bank {
  id: number;
  name: string;
}

const bankList = ref<Bank[]>([]);

async function fetchData() {
  try {
    const response = await list_bank_transfer();
    bankList.value = [{ id: 0, name: ' -- Pilih Bank Transfer -- ' }, ...response.data];
    form.value.bank = bankList.value.length > 0 ? bankList.value[0].id : 0;
  } catch (error) {
    console.error('Gagal memuat data bank transfer:', error);
  }
}

async function fetchEditData() {
  try {
    const response = await get_info_edit({ id: props.id });
    form.value.nominal = response.data.nominal;
    form.value.bank = response.data.bank_id;
  } catch (error) {
    console.error('Gagal memuat data bank transfer:', error);
  }
}

watch(
  () => props.isModalOpen,
  (val) => {
    if (val) {
      fetchData();
      if (props.id != 0) {
        fetchEditData();
      }
    }
  },
);
</script>

<template>
  <Form
    :form-status="props.isModalOpen"
    :label="'Request Deposit Saldo'"
    @close="handleCancel"
    @cancel="handleCancel"
    @submit="handleSubmit()"
    width="sm:w-full sm:max-w-md"
    :submitLabel="props.id == 0 ? 'TAMBAH DEPOSIT SALDO' : 'UPDATE DEPOSIT SALDO'"
  >
    <SelectField
      v-model="form.bank"
      label="Bank Transfer"
      placeholder="Pilih bank"
      class="mt-4"
      :options="bankList"
      optionLabel="Bank Transfer"
      optionValue="id"
    />
    <InputText
      v-model="nominalSaldo"
      label="Nominal Deposit"
      placeholder="Nominal Deposit"
      class="md:col-span-2 mt-4"
      :error="errors.nominal"
    />
  </Form>
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
