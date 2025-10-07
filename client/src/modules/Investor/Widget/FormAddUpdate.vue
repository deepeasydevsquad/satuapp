<script setup lang="ts">
import { onMounted, reactive, ref, watch, computed } from 'vue';
import { editInfo } from '@/service/investor';
import { formatToRupiah } from '@/libs/rupiahFormatter';
import { editInvestorAPI, addInvestorAPI } from '@/service/investor';
import Notification from '@/components/Modal/Notification.vue';
import Form from '@/components/Modal/Form.vue';

const props = defineProps<{ isModalOpen: boolean; formData?: Investor }>();
const emit = defineEmits(['close']);

interface ListCabang {
  id: number;
  name: string;
}

interface Investor {
  id: number;
  list_cabang: ListCabang;
  cabang_id: number;
  name: string;
  identity_number: string;
  mobile_phone: string;
  address: string;
  invesment: number;
  stock: number;
}

interface ErrorInvestor {
  id: number;
  cabang: string;
  name: string;
  identity_number: string;
  mobile_phone: string;
  address: string;
  invesment: string;
  stock: string;
}

interface LocalInvestor {
  id: number;
  cabang_id: number;
  name: string;
  identity_number: string;
  mobile_phone: string;
  address: string;
  invesment: number;
  stock: number;
}

const showNotification = ref<boolean>(false);
const notificationMessage = ref<string>('');
const notificationType = ref<'success' | 'error'>('success');
const localFormData = ref<Partial<LocalInvestor>>({ invesment: 0, cabang_id: 0 });
const errors = ref<Partial<ErrorInvestor>>({});

const validateForm = (): boolean => {
  errors.value = { name: '' };
  let isValid = true;

  if (localFormData.value.cabang_id == 0) {
    errors.value.cabang = 'Anda wajib memilih salah satu cabang';
    isValid = false;
  }

  if (!localFormData.value.name?.trim()) {
    errors.value.name = 'Nama Investor tidak boleh kosong';
    isValid = false;
  }

  if (!localFormData.value.identity_number?.trim()) {
    errors.value.identity_number = 'Nomor Identitas Investor tidak boleh kosong';
    isValid = false;
  }

  if (!localFormData.value.mobile_phone?.trim()) {
    errors.value.mobile_phone = 'Nomor Kontak Investor tidak boleh kosong';
    isValid = false;
  }

  if (!localFormData.value.address?.trim()) {
    errors.value.address = 'Alamat Investor tidak boleh kosong';
    isValid = false;
  }

  if (!localFormData.value.invesment) {
    errors.value.invesment = 'Investasi Investor tidak boleh kosong';
    isValid = false;
  }

  if (!localFormData.value.stock) {
    errors.value.stock = 'Persentase saham Investor tidak boleh kosong';
    isValid = false;
  }

  return isValid;
};

const displayNotification = (message: string, type: 'success' | 'error' = 'success') => {
  notificationMessage.value = message;
  notificationType.value = type;
  showNotification.value = true;
};

const saveData = async () => {
  try {
    if (!validateForm()) return;

    if (localFormData.value.id) {
      const response = await editInvestorAPI(localFormData.value);
      showNotification.value = false;
      displayNotification(response.error_msg);
    } else {
      const response = await addInvestorAPI(localFormData.value);
      showNotification.value = false;
      displayNotification(response.error_msg);
    }

    setTimeout(() => emit('close'), 3000);
  } catch (error) {
    displayNotification('Gagal menyimpan data', 'error');
  }
};

const formattedPrice = computed(() => {
  return formatToRupiah(
    localFormData.value.invesment !== undefined ? localFormData.value.invesment : 0,
  );
});

const formatToRupiahInvestasi = (event: any) => {
  let value = event.target.value.replace(/\D/g, '');
  localFormData.value.invesment = value;
};

const handleCancel = (): void => {
  emit('close');

  localFormData.value = {
    cabang_id: 0,
  };

  errors.value = {
    id: 0,
    cabang: '',
    name: '',
    identity_number: '',
    mobile_phone: '',
    address: '',
    invesment: '',
    stock: '',
  };
};

watch(
  () => props.isModalOpen,
  (e) => {
    if (e) {
      // localFormData.value = { ...e };
    }
  },
  { immediate: true },
);
</script>

<template>
  <Form
    :form-status="isModalOpen"
    :label="formData?.id === 0 ? 'Tambah Investor Baru' : 'Edit Data Investor'"
    @close="handleCancel"
    @cancel="handleCancel"
    @submit="saveData"
    width="sm:w-full sm:max-w-xl"
    :submitLabel="formData?.id === 0 ? 'TAMBAH INVESTOR' : 'PERBAHARUI INVESTOR'"
  >
    <div class="space-y-4">
      <div>
        <label class="block text-gray-700 font-medium mb-1">Daftar Cabang</label>
        <select
          v-model="localFormData.cabang_id"
          class="border p-2 rounded w-full focus:ring focus:ring-sky-600 text-gray-700"
        >
          <option value="0">Pilih Cabang</option>
          <option v-for="cabang in formData?.list_cabang" :key="cabang.id" :value="cabang.id">
            {{ cabang.name }}
          </option>
        </select>
        <p v-if="errors.cabang" class="mt-1 text-sm text-red-600">{{ errors.cabang }}</p>
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Nama Investor</label>
        <input
          v-model="localFormData.name"
          type="text"
          class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-600 font-normal"
          placeholder="Nama Investor"
        />
        <p v-if="errors.name" class="mt-1 text-sm text-red-600">{{ errors.name }}</p>
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Nomor Identitas Investor</label>
        <input
          v-model="localFormData.identity_number"
          type="text"
          class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-600 font-normal"
          placeholder="Nomor Identitas Investor"
        />
        <p v-if="errors.identity_number" class="mt-1 text-sm text-red-600">
          {{ errors.identity_number }}
        </p>
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Nomor Kontak Investor</label>
        <input
          v-model="localFormData.mobile_phone"
          type="text"
          class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-600 font-normal"
          placeholder="Nomor Kontak Investor"
        />
        <p v-if="errors.mobile_phone" class="mt-1 text-sm text-red-600">
          {{ errors.mobile_phone }}
        </p>
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Alamat Investor</label>
        <textarea
          v-model="localFormData.address"
          placeholder="Alamat Investor"
          class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-600 font-normal resize-none"
        ></textarea>
        <p v-if="errors.mobile_phone" class="mt-1 text-sm text-red-600">
          {{ errors.mobile_phone }}
        </p>
      </div>
      <div class="flex flex-row gap-4">
        <div class="w-1/2">
          <label class="block text-sm font-medium text-gray-700 mb-1">Investasi</label>
          <input
            v-model="formattedPrice"
            @input="formatToRupiahInvestasi"
            type="text"
            class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-600 font-normal"
            placeholder="Jumlah Investasi"
          />
          <p v-if="errors.invesment" class="mt-1 text-sm text-red-600">{{ errors.invesment }}</p>
        </div>
        <div class="w-1/2">
          <label class="block text-sm font-medium text-gray-700 mb-1">Saham</label>
          <input
            v-model="localFormData.stock"
            type="text"
            class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-600 font-normal"
            placeholder="Persentasi Saham"
          />
          <p v-if="errors.stock" class="mt-1 text-sm text-red-600">{{ errors.stock }}</p>
        </div>
      </div>
    </div>
  </Form>
  <!-- Notification Popup -->
  <Notification
    :showNotification="showNotification"
    :notificationType="notificationType"
    :notificationMessage="notificationMessage"
    @close="showNotification = false"
  ></Notification>
</template>
