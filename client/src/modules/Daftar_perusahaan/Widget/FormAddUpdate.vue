<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import {
  add_perusahaan,
  update_perusahaan,
  get_data_edit_perusahaan,
} from '@/service/daftar_perusahaan';
import Form from '@/components/Modal/Form.vue';
import InputText from '@/components/Form/InputText.vue';
import InputDate from '@/components/Form/InputDate.vue';
import SelectField from '@/components/Form/SelectField.vue';
import InputPassword from '@/components/Form/InputPassword.vue';
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
  type: string;
  whatsapp_company_number: string;
  start_subscribtion: string;
  end_subscribtion: string;
  email: string;
  saldo: number;
  username: string;
  password: string;
  konfirmasi_password: string;
}

const form = ref<FormData>({
  company_name: '',
  type: '0',
  whatsapp_company_number: '',
  start_subscribtion: '',
  end_subscribtion: '',
  // durasi: 0,
  email: '',
  saldo: 0,
  username: '',
  password: '',
  konfirmasi_password: '',
});

const errors = ref<Record<string, string>>({});

const reset = (): void => {
  form.value = {
    company_name: '',
    type: '0',
    whatsapp_company_number: '',
    start_subscribtion: '',
    end_subscribtion: '',
    // durasi: 0,
    email: '',
    saldo: 0,
    username: '',
    password: '',
    konfirmasi_password: '',
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

  const types = ['limited', 'unlimited'];

  let isValid = true;

  if (form.value.company_name == '') {
    errors.value.company_name = 'Nama perusahaan tidak boleh kosong.';
    isValid = false;
  }

  if (!types.includes(form.value.type)) {
    errors.value.type = 'Jenis langganan perusahaan tidak sesuai format.';
    isValid = false;
  }

  if (form.value.type == '0') {
    errors.value.type = 'Anda wajib memilih salah satu tipe berlangganan.';
    isValid = false;
  }

  if (form.value.whatsapp_company_number == '') {
    errors.value.whatsapp_company_number = 'Nomor whatsapp tidak boleh kosong.';
    isValid = false;
  }

  if (form.value.start_subscribtion == '') {
    errors.value.start_subscribtion = 'Tanggal mulai berlangganan tidak boleh kosong.';
    isValid = false;
  }

  if (form.value.type == 'limited' && form.value.end_subscribtion == '') {
    errors.value.end_subscribtion = 'Tanggal berakhir berlangganan tidak boleh kosong.';
    isValid = false;
  }

  // if (form.value.type == 'limited' && form.value.durasi == 0) {
  //   errors.value.durasi = 'Durasi tidak boleh kosong.';
  //   isValid = false;
  // }

  if (form.value.email == '') {
    errors.value.email = 'Email tidak boleh kosong.';
    isValid = false;
  }

  if (form.value.username == '') {
    errors.value.username = 'Username tidak boleh kosong.';
    isValid = false;
  }

  if (props.id == 0) {
    if (form.value.password == '') {
      errors.value.password = 'Password tidak boleh kosong.';
      isValid = false;
    }

    if (form.value.konfirmasi_password != form.value.password) {
      errors.value.konfirmasi_password = 'Konfirmasi password harus sama dengan password.';
      isValid = false;
    }
  }

  return isValid;
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

const handleSubmit = async () => {
  if (!validateForm()) return;

  try {
    const data = {
      company_name: form.value.company_name,
      type: form.value.type,
      whatsapp_company_number: form.value.whatsapp_company_number,
      start_subscribtion: form.value.start_subscribtion,
      end_subscribtion: form.value.end_subscribtion,
      email: form.value.email,
      saldo: form.value.saldo,
      username: form.value.username,
      password: form.value.password,
    };

    // console.log;

    const response =
      props.id != 0
        ? await update_perusahaan({ ...data, ...{ ['id']: props.id } })
        : await add_perusahaan(data);
    displayNotification(response.error_msg, 'success');
    emit('close');
    reset();
  } catch (error) {
    displayNotification(error.response.data.message, 'error');
  }
};

const saldoRp = computed({
  get() {
    return form.value.saldo
      ? 'Rp ' + form.value.saldo.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
      : '';
  },
  set(value) {
    const clean = value.replace(/[^\d]/g, '');
    form.value.saldo = Number(clean);
  },
});

const fetchEditData = async () => {
  try {
    const response = await get_data_edit_perusahaan({
      id: props.id,
    });

    form.value = {
      company_name: response.data.company_name,
      type: response.data.type,
      whatsapp_company_number: response.data.whatsapp_company_number,
      start_subscribtion: response.data.start_subscribtion,
      end_subscribtion: response.data.end_subscribtion,
      email: response.data.email,
      saldo: response.data.saldo,
      username: response.data.username,
      password: '',
      konfirmasi_password: '',
    };
  } catch (error) {
    displayNotification(error.response.data.message, 'error');
  }
};

watch(
  () => props.isModalOpen,
  (val) => {
    if (val) {
      if (props.id != 0) {
        fetchEditData();
      }
    }
  },
);
</script>
<template>
  <Form
    :form-status="isModalOpen"
    :label="props.id === 0 ? 'Tambah Perusahaan' : 'Update Perusahaan'"
    @close="handleCancel"
    @cancel="handleCancel"
    @submit="handleSubmit"
    width="sm:w-full sm:max-w-xl"
    :submitLabel="props.id === 0 ? 'TAMBAH PERUSAHAAN' : 'UPDATE PERUSAHAAN'"
  >
    <div class="grid grid-cols-6 gap-6">
      <div class="col-span-4">
        <InputText
          id="nama_perusahaan"
          v-model="form.company_name"
          label="Nama Perusahaan"
          placeholder="Masukkan nama perusahaan"
          required
          :error="errors.company_name"
        />
      </div>
      <div class="col-span-2">
        <SelectField
          id="type"
          v-model="form.type"
          label="Tipe Langganan"
          :options="[
            { id: '0', name: '-- Pilih Tipe --' },
            { id: 'limited', name: 'Limited' },
            { id: 'unlimited', name: 'Unlimited' },
          ]"
          required
          :error="errors.type"
        />
      </div>
      <div class="col-span-3">
        <InputDate
          id="start_subscribtion"
          v-model="form.start_subscribtion"
          label="Mulai berlangganan"
          placeholder="Masukkan mulai berlangganan"
          required
          :error="errors.start_subscribtion"
        />
      </div>
      <div class="col-span-3">
        <InputDate
          id="end_subscribtion"
          v-model="form.end_subscribtion"
          label="Akhir berlangganan"
          placeholder="Masukkan akhir berlangganan"
          required
          :error="errors.end_subscribtion"
          :disabled="form.type != 'limited' ? true : false"
        />
      </div>
      <div class="col-span-3">
        <InputText
          id="saldo"
          v-model="saldoRp"
          label="Saldo"
          placeholder="Saldo"
          required
          :error="errors.saldo"
        />
      </div>
      <div class="col-span-3">
        <InputText
          id="whatsapp_company_number"
          v-model="form.whatsapp_company_number"
          label="Nomor Whatsapp"
          placeholder="Nomor whatsapp"
          required
          :error="errors.whatsapp_company_number"
        />
      </div>
      <div class="col-span-3">
        <InputText
          type="email"
          id="email"
          v-model="form.email"
          label="Email"
          placeholder="Email"
          required
          :error="errors.email"
        />
      </div>
      <div class="col-span-3">
        <InputText
          id="username"
          v-model="form.username"
          label="Username"
          placeholder="Username"
          required
          :error="errors.username"
        />
      </div>
      <div class="col-span-3">
        <InputPassword
          id="password"
          v-model="form.password"
          label="Password"
          placeholder="Password"
          required
          :error="errors.password"
        />
      </div>
      <div class="col-span-3">
        <InputPassword
          id="konfirmmasi"
          v-model="form.konfirmasi_password"
          label="Konfirmasi Password"
          placeholder="Konfirmasi Password"
          required
          :error="errors.konfirmasi_password"
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
