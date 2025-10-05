<template>
  <Form
    :form-status="showForm"
    :label="'Form Transaksi Tiket'"
    width="w-full max-w-xl px-4 sm:px-6 lg:px-8"
    @close="handleCancel"
    @cancel="handleCancel"
    @submit="handleSubmit"
    :submitLabel="'BAYAR'"
  >
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
      <!-- Cabang -->
      <SelectField
        v-model="form.cabang"
        id="maskapai"
        label="Cabang"
        class="md:col-span-4"
        placeholder="Pilih Cabang"
        :options="list_cabang"
        :error="errors.cabang"
        @change="fetchPaketMaskapai"
      />
      <!-- Maskapai -->
      <SelectField
        v-model="form.maskapai"
        id="maskapai"
        label="Maskapai"
        class="md:col-span-4"
        placeholder="Pilih Maskapai"
        :options="list_maskapai"
        :error="errors.maskapai"
      />
      <!-- Kostumer -->
      <SelectField
        v-model="form.kostumer"
        id="kostumer"
        label="Kostumer"
        class="md:col-span-2"
        placeholder="Pilih Kostumer"
        :options="list_kostumer"
        :error="errors.kostumer"
      />
      <!-- Paket -->
      <SelectField
        v-model="form.paket"
        id="paket"
        label="Paket"
        class="md:col-span-2"
        placeholder="Pilih Paket"
        :options="list_paket"
        :error="errors.paket"
      />
      <!-- Pax -->
      <InputText
        v-model.number="form.pax"
        label="Pax"
        id="pax"
        type="number"
        :error="errors.pax"
        placeholder="Pax"
        class="md:col-span-1"
      />
      <!-- Kode Booking -->
      <InputText
        v-model="form.kode_booking"
        label="Kode Booking"
        id="kode_booking"
        :error="errors.kode_booking"
        placeholder="Kode Booking"
        class="md:col-span-3"
      />
      <!-- Tanggal Keberangkatan -->
      <InputDate
        v-model="form.tanggal_keberangkatan"
        label="Tanggal Keberangkatan"
        :error="errors.tanggal_keberangkatan"
        id="tanggal_keberangkatan"
        placeholder="Tanggal Keberangkatan"
        class="md:col-span-2"
      />
      <!-- Tanggal Kepulangan -->
      <InputDate
        v-model="form.tanggal_kepulangan"
        label="Tanggal Kepulangan"
        :error="errors.tanggal_kepulangan"
        id="tanggal_kepulangan"
        placeholder="Tanggal Kepulangan"
        class="md:col-span-2"
      />
      <!-- Harga Travel -->
      <InputText
        v-model="hargaTravel"
        label="Harga Travel"
        id="harga_travel"
        :error="errors.harga_travel"
        placeholder="Harga Travel"
        class="md:col-span-2"
      />
      <!-- Harga Kostumer -->
      <InputText
        v-model="hargaKostumer"
        label="Harga Kostumer"
        id="harga_kostumer"
        :error="errors.harga_kostumer"
        placeholder="Harga Kostumer"
        class="md:col-span-2"
      />
      <!-- Dibayar -->
      <div class="md:col-span-2">
        <InputText
          v-model="diBayar"
          :error="errors.dibayar"
          id="dibayar"
          label="Dibayar"
          placeholder="Dibayar"
        />
      </div>
      <!-- Sisa -->
      <div class="md:col-span-2">
        <label for="sisa" class="text-sm font-medium text-gray-700 mb-1">Sisa</label>
        <div id="sisa" class="bg-gray-100 text-gray-800 px-3 py-2 rounded border border-gray-300">
          {{ formatRupiah(calculateSisa) }}
        </div>
      </div>
    </div>
  </Form>
  <!-- Notification Popup -->
  <Notification
    :showNotification="showNotification"
    :notificationType="notificationType"
    :notificationMessage="notificationMessage"
    @closeNotification="showNotification = false"
  />
</template>

<script setup lang="ts">
import { defineProps, ref, watch, computed } from 'vue';
import { add_tiket, daftar_costumer, daftar_paket } from '@/service/trans_tiket';
import { paramCabang } from '@/service/param_cabang';
import { getAirlines } from '@/service/trans_tiket';
import Form from '@/components/Modal/Form.vue';
import InputText from '@/components/Form/InputText.vue';
import InputDate from '@/components/Form/InputDate.vue';
import SelectField from '@/components/Form/SelectField.vue';
import Notification from '@/components/Modal/Notification.vue';

const props = defineProps<{ showForm: boolean }>();

const hargaTravel = computed({
  get() {
    return form.value.harga_travel
      ? 'Rp ' + form.value.harga_travel.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
      : '';
  },
  set(value: string) {
    const clean = value.replace(/[^\d]/g, '');
    form.value.harga_travel = Number(clean);
  },
});

const hargaKostumer = computed({
  get() {
    return form.value.harga_kostumer
      ? 'Rp ' + form.value.harga_kostumer.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
      : '';
  },
  set(value: string) {
    const clean = value.replace(/[^\d]/g, '');
    form.value.harga_kostumer = Number(clean);
  },
});

const diBayar = computed({
  get() {
    return form.value.dibayar
      ? 'Rp ' + form.value.dibayar.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
      : '';
  },
  set(value: string) {
    const clean = value.replace(/[^\d]/g, '');
    form.value.dibayar = Number(clean);
  },
});

const errors = ref<Record<string, string>>({});

// Definisikan tipe untuk form yang sesuai dengan semua field di template
interface FormData {
  cabang: number;
  maskapai: number;
  kostumer: number;
  paket: number;
  pax?: number;
  kode_booking?: string;
  tanggal_keberangkatan: string;
  tanggal_kepulangan?: string;
  harga_travel: number;
  harga_kostumer: number;
  dibayar?: number;
}

const emit = defineEmits<{
  (e: 'cancel'): void;
  (e: 'submitted'): void;
}>();

// Data form yang akan ditampilkan
const form = ref<FormData>({
  cabang: 0,
  maskapai: 0,
  kostumer: 0,
  paket: 0,
  tanggal_keberangkatan: '',
  harga_travel: 0,
  harga_kostumer: 0,
});

const reset = () => {
  errors.value = {};
  form.value = {
    cabang: 0,
    maskapai: 0,
    kostumer: 0,
    paket: 0,
    tanggal_keberangkatan: '',
    harga_travel: 0,
    harga_kostumer: 0,
  };
};

function handleCancel() {
  emit('cancel');
  reset();
}

const calculateSisa = computed(() => {
  return (form.value.pax ?? 0) * (form.value.harga_kostumer ?? 0) - (form.value.dibayar ?? 0);
});

const validateForm = (): boolean => {
  let isValid = true;

  // Reset errors
  errors.value = {};

  if (form.value.cabang == 0) {
    // validasi cabang
    if (form.value.cabang == 0) {
      errors.value.cabang = 'Cabang wajib dipilih';
      isValid = false;
    }
  }

  // Validate customer fields
  if (
    (!form.value.kostumer || form.value.kostumer === 0) &&
    (!form.value.paket || form.value.paket === 0)
  ) {
    errors.value.kostumer_paket = 'Kostumer atau paket wajib dipilih';
    isValid = false;
  }

  if (form.value.maskapai === 0) {
    errors.value.cabang = 'Maskapai wajib dipilih';
    isValid = false;
  }

  if (form.value.pax === 0) {
    errors.value.pax = 'Pax tidak boleh lebih kecil dari 1';
    isValid = false;
  }

  if (form.value.kode_booking === '') {
    errors.value.kode_booking = 'Kode booking wajib diisi';
    isValid = false;
  }

  if (form.value.tanggal_keberangkatan === '') {
    errors.value.tanggal_keberangkatan = 'Tanggal keberangkatan wajib diisi';
    isValid = false;
  }

  if (form.value.harga_travel === 0 || form.value.harga_travel < 0) {
    errors.value.harga_travel = 'Harga travel harus lebih besar dari 0';
    isValid = false;
  }

  if (form.value.harga_kostumer === 0 || form.value.harga_kostumer < 0) {
    errors.value.harga_kostumer = 'Harga kostumer harus lebih besar dari 0';
    isValid = false;
  }

  if ((form.value.dibayar ?? 0) < 0) {
    errors.value.dibayar = 'Dibayar tidak boleh lebih kecil dari 0';
    isValid = false;
  }

  return isValid;
};

const handleSubmit = async (): Promise<void> => {
  if (!validateForm()) {
    return;
  }

  try {
    const payload = {
      cabang: form.value.cabang,
      kostumer: form.value.kostumer,
      paket: form.value.paket,
      maskapai: form.value.maskapai,
      pax: form.value.pax,
      kode_booking: form.value.kode_booking,
      tanggal_keberangkatan: form.value.tanggal_keberangkatan,
      tanggal_kepulangan: form.value.tanggal_kepulangan,
      harga_travel: form.value.harga_travel,
      harga_kostumer: form.value.harga_kostumer,
      dibayar: form.value.dibayar,
    };

    const response = await add_tiket(payload);
    displayNotification(response.message, 'success');
    const printUrl = `/invoice-trans-tiket/${response.register_number}`;
    window.open(printUrl, '_blank');
    console.log(response.register_number);
    emit('submitted');
    reset();
  } catch (error) {
    displayNotification(error.response.data.message, 'error');
  }
};

const formatRupiah = (value: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 2,
  }).format(value);
};

interface costumer {
  id: number;
  name: string;
}

const list_kostumer = ref<costumer[]>([{ id: 0, name: ' -- Pilih Kostumer -- ' }]);
const fetchCustomer = async () => {
  try {
    const response = await daftar_costumer();
    list_kostumer.value = [{ id: 0, name: ' -- Pilih Kostumer -- ' }, ...response];
  } catch (error) {
    console.error(error);
  }
};

interface Maskapai {
  id: number;
  name: string;
}

const list_maskapai = ref<Maskapai[]>([{ id: 0, name: ' -- Pilih Maskapai -- ' }]);
const fetchMaskapai = async () => {
  try {
    const response = await getAirlines({ cabang: form.value.cabang });
    list_maskapai.value = response.data;
  } catch (error) {
    console.error('Gagal fetch data cabang:', error);
  }
};

interface cabang {
  id: number;
  name: string;
}

const list_cabang = ref<cabang[]>([{ id: 0, name: ' -- Pilih Cabang -- ' }]);
const fetchCabang = async () => {
  try {
    const response = await paramCabang();
    list_cabang.value = [{ id: 0, name: ' -- Pilih Cabang -- ' }, ...response.data];
  } catch (error) {
    console.error(error);
  }
};

interface paket {
  id: number;
  name: string;
}

const list_paket = ref<paket[]>([{ id: 0, name: ' -- Pilih Paket -- ' }]); // Tambahkan opsi default
const fetchPaket = async () => {
  try {
    const response = await daftar_paket({
      division_id: form.value.cabang,
    });
    list_paket.value = [{ id: 0, name: ' -- Pilih Paket -- ' }, ...response];
  } catch (error) {
    console.error(error);
  }
};

const fetchPaketMaskapai = async () => {
  if (form.value.cabang != 0) {
    fetchPaket();
    fetchMaskapai();
  } else {
    list_paket.value = [{ id: 0, name: ' -- Pilih Paket -- ' }];
    list_maskapai.value = [{ id: 0, name: ' -- Pilih Maskapai -- ' }];
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

watch(
  () => props.showForm,
  async (val) => {
    if (val) {
      await fetchCustomer();
      await fetchCabang();
    }
  },
);
</script>
