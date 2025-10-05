<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { tambah_waktu_berlangganan, get_data_edit_perusahaan } from '@/service/daftar_perusahaan';
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
  start_subscribtion: string;
  end_subscribtion: string;
  new_end_subscribtion: string;
  durasi: number;
  whatsapp_company_number: number;
}

const form = ref<FormData>({
  company_name: '',
  start_subscribtion: '',
  end_subscribtion: '',
  new_end_subscribtion: '',
  durasi: 0,
  whatsapp_company_number: 0,
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
      start_subscribtion: response.data.start_subscribtion,
      end_subscribtion: response.data.end_subscribtion,
      new_end_subscribtion: response.data.end_subscribtion,
      durasi: 0,
      whatsapp_company_number: response.data.whatsapp_company_number,
    };
  } catch (error) {
    displayNotification(error.response.data.message, 'error');
  }
};

const errors = ref<Record<string, string>>({});

const reset = (): void => {
  form.value = {
    company_name: '',
    start_subscribtion: '',
    end_subscribtion: '',
    new_end_subscribtion: '',
    durasi: 0,
    whatsapp_company_number: 0,
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

  if (form.value.durasi == 0) {
    errors.value.durasi = 'Durasi tidak boleh kosong.';
    isValid = false;
  }

  return isValid;
};

const handleSubmit = async () => {
  if (!validateForm()) return;

  try {
    const response = await tambah_waktu_berlangganan({ id: props.id, durasi: form.value.durasi });
    displayNotification(response.error_msg, 'success');
    emit('close');
    reset();
  } catch (error) {
    displayNotification(error.response.data.message, 'error');
  }
};

watch(
  () => props.isModalOpen,
  (val) => {
    if (val) {
      fetchEditData();
    }
  },
);

watch(
  () => form.value.durasi,
  (newDurasi) => {
    if (!newDurasi || newDurasi <= 0) return;

    let baseDate: Date;

    if (form.value.end_subscribtion && form.value.end_subscribtion !== '-') {
      // Kalau sudah ada end_subscribtion sebelumnya → pakai sebagai base date
      baseDate = new Date(form.value.end_subscribtion);
    } else {
      // Kalau belum ada → pakai tanggal hari ini
      baseDate = new Date();
    }

    // Tambah bulan sesuai durasi
    baseDate.setMonth(baseDate.getMonth() + newDurasi);

    // Format ke YYYY-MM-DD biar rapi
    const year = baseDate.getFullYear();
    const month = String(baseDate.getMonth() + 1).padStart(2, '0');
    const day = String(baseDate.getDate()).padStart(2, '0');

    form.value.new_end_subscribtion = `${year}-${month}-${day}`;
  },
);
</script>

<template>
  <Form
    :form-status="isModalOpen"
    :label="'Tambah Durasi Berlangganan'"
    @close="handleCancel"
    @cancel="handleCancel"
    @submit="handleSubmit"
    width="sm:w-full sm:max-w-lg"
    :submitLabel="'TAMBAH DURASI PERUSAHAAN'"
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
      <div class="col-span-3">
        <InputText
          id="mulai_berlangganan"
          v-model="form.start_subscribtion"
          label="Mulai Berlangganan"
          placeholder="Mulai Berlangganan"
          required
          :disabled="true"
        />
      </div>
      <div class="col-span-3">
        <InputText
          id="akhir_berlangganan"
          v-model="form.new_end_subscribtion"
          label="Akhir Berlangganan"
          placeholder="Akhir Berlangganan"
          required
          :disabled="true"
        />
      </div>
      <div class="col-span-2">
        <InputText
          id="durasi"
          type="number"
          v-model="form.durasi"
          label="Durasi"
          placeholder="Durasi"
          :error="errors.durasi"
          required
        />
      </div>
      <div class="col-span-4">
        <InputText
          id="whatsapp_company_number"
          v-model="form.whatsapp_company_number"
          label="Nomor Whatsapp Perusahaan"
          placeholder="Nomor Whatsapp Perusahaan"
          required
          :disabled="true"
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
