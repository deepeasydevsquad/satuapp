<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue';
import PrimaryButton from '@/components/Button/PrimaryButton.vue';
import { addTransaksiVisa, getCityList, getVisaTypesList } from '@/service/transaksi_visa';
import FormInput from '@/modules/TransaksiVisa/Particle/BaseInput.vue';
import FormSelect from '@/modules/TransaksiVisa/Particle/BaseSelect.vue';
import Notification from '@/modules/TransaksiVisa/Particle/Notification.vue';

// Props & Emits
defineProps<{ isFormOpen: boolean }>();
const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'save-success', message: string): void;
}>();

// === STATE & INTERFACE ===
const showNotification = ref<boolean>(false);
const notificationMessage = ref<string>('');
const notificationType = ref<'success' | 'warning' | 'error'>('success');

interface FormState {
  invoice: string;
  payer: string;
  payer_identity: string;
  gender: string;
  birth_place: string;
  birth_date: string;
  nationality: string;
  jenis_visa: string;
  passport_number: string;
  passport_issued_place: string;
  passport_issued_date: string;
  passport_expire_date: string;
  indonesia_job: string;
  abroad_job: string;
  work_address: string;
  postal_code: string;
  city: number | string;
  origin_country: string;
  phone: string;
  valid_until: string;
  price: number;
  payment_method: boolean;
  name: string;
  identity_number: string;
  status?: 'pending' | 'success' | 'duplicate' | 'error';
}

interface DropdownOption {
  value: number | string;
  label: string;
}
interface CityOption {
  id: number;
  name: string;
  kode: string;
}

const formEntries = ref<FormState[]>([]);
const currentEntryIndex = ref(0);
const visaTypeOptions = ref<DropdownOption[]>([]);
const currentStep = ref(1);
const totalSteps = 3;
const isLoading = ref(false);
const cityOptions = ref<DropdownOption[]>([]);
const errors = ref<Partial<Record<keyof FormState, string>>>({});
const genders: DropdownOption[] = [
  { value: 'Laki-laki', label: 'Laki-laki' },
  { value: 'Perempuan', label: 'Perempuan' },
];

// === FUNGSI-FUNGSI ===

const generateInvoiceCode = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let randomCode = '';
  for (let i = 0; i < 5; i++) {
    randomCode += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `VISA-${randomCode}`;
};

const getDefaultFormState = (): FormState => ({
  invoice: generateInvoiceCode(),
  payer: '',
  payer_identity: '',
  gender: '',
  birth_place: '',
  birth_date: '',
  nationality: '',
  jenis_visa: '',
  passport_number: '',
  passport_issued_place: '',
  passport_issued_date: '',
  passport_expire_date: '',
  indonesia_job: '',
  abroad_job: '',
  work_address: '',
  postal_code: '',
  city: '',
  origin_country: '',
  phone: '',
  valid_until: '',
  price: 0,
  payment_method: false,
  name: '',
  identity_number: '',
  status: 'pending',
});

const form = reactive<FormState>(getDefaultFormState());

const isFormFilled = (): boolean =>
  form.payer.trim() !== '' ||
  form.payer_identity.trim() !== '' ||
  form.passport_number.trim() !== '';

const syncActiveFormToArray = () => {
  if (formEntries.value[currentEntryIndex.value]) {
    formEntries.value[currentEntryIndex.value] = { ...form };
  }
};

const addNewEntry = () => {
  syncActiveFormToArray();
  const newEntry = getDefaultFormState();
  formEntries.value.push(newEntry);
  currentEntryIndex.value = formEntries.value.length - 1;
  Object.assign(form, newEntry);
  currentStep.value = 1;
  errors.value = {};
  displayNotification('Form baru berhasil ditambahkan.', 'success');
};

const switchToEntry = (index: number) => {
  syncActiveFormToArray();
  currentEntryIndex.value = index;
  Object.assign(form, formEntries.value[index]);
  currentStep.value = 1;
  errors.value = {};
};

const removeEntry = (index: number) => {
  if (formEntries.value.length <= 1) {
    displayNotification('Tidak bisa menghapus satu-satunya entri.', 'error');
    return;
  }
  formEntries.value.splice(index, 1);
  if (currentEntryIndex.value >= index) {
    currentEntryIndex.value = Math.max(0, currentEntryIndex.value - 1);
  }
  Object.assign(form, formEntries.value[currentEntryIndex.value]);
};

const formatErrorMessage = (message: string): string => {
  if (!message) return '';

  // Replace <br> tags dengan line breaks
  let formattedMessage = message.replace(/<br\s*\/?>/gi, '\n');

  // Split berdasarkan line breaks dan format sebagai bullet points
  const lines = formattedMessage.split('\n').filter((line) => line.trim() !== '');

  if (lines.length > 1) {
    return lines.map((line) => `• ${line.trim()}`).join('\n');
  }

  return formattedMessage;
};

const displayNotification = (
  message: string,
  type: 'success' | 'warning' | 'error' = 'success',
) => {
  notificationMessage.value = formatErrorMessage(message);
  notificationType.value = type;
  showNotification.value = true;
  setTimeout(() => {
    showNotification.value = false;
  }, 8000);
};

const validateStep = (step: number): boolean => {
  errors.value = {};
  let isValid = true;
  const checkField = (fieldName: keyof FormState, message: string) => {
    const value = form[fieldName];
    if (
      value === null ||
      value === undefined ||
      (typeof value === 'string' && value.trim() === '') ||
      (typeof value === 'number' && value <= 0)
    ) {
      errors.value[fieldName] = message;
      isValid = false;
    }
  };

  if (step === 1) {
    checkField('payer', 'Nama Pelanggan wajib diisi');
    checkField('payer_identity', 'Nomor Identitas wajib diisi');
    checkField('gender', 'Jenis Kelamin wajib dipilih');
    checkField('birth_place', 'Tempat Lahir wajib diisi');
    checkField('birth_date', 'Tanggal Lahir wajib diisi');
    checkField('nationality', 'Kewarganegaraan wajib diisi');
  } else if (step === 2) {
    checkField('jenis_visa', 'Jenis Visa wajib dipilih');
    checkField('passport_number', 'Nomor Passport wajib diisi');
    checkField('passport_issued_place', 'Tempat Dikeluarkan wajib diisi');
    checkField('passport_issued_date', 'Tanggal Dikeluarkan wajib diisi');
    checkField('passport_expire_date', 'Tanggal Berakhir wajib diisi');
    checkField('indonesia_job', 'Pekerjaan di Indonesia wajib diisi');
    checkField('abroad_job', 'Pekerjaan di Luar Negeri wajib diisi');
    checkField('work_address', 'Alamat Pekerjaan wajib diisi');
    checkField('postal_code', 'Kode Pos wajib diisi');
    checkField('city', 'Kota Alamat wajib dipilih');
    checkField('origin_country', 'Negara Asal wajib diisi');
    checkField('phone', 'Nomor Telepon wajib diisi');
  } else if (step === 3) {
    checkField('valid_until', 'Tanggal Permohonan wajib diisi');
    checkField('price', 'Harga wajib diisi');
  }

  if (!isValid) {
    displayNotification('Harap lengkapi semua field yang wajib diisi.', 'error');
  }
  return isValid;
};

const validateCompleteEntry = (entry: FormState): string[] => {
  const errors: string[] = [];
  const requiredFields: { key: keyof FormState; label: string }[] = [
    { key: 'payer', label: 'Nama Pelanggan' },
    { key: 'payer_identity', label: 'Nomor Identitas' },
    { key: 'gender', label: 'Jenis Kelamin' },
    { key: 'birth_place', label: 'Tempat Lahir' },
    { key: 'birth_date', label: 'Tanggal Lahir' },
    { key: 'nationality', label: 'Kewarganegaraan' },
    { key: 'jenis_visa', label: 'Jenis Visa' },
    { key: 'passport_number', label: 'Nomor Passport' },
    { key: 'passport_issued_place', label: 'Tempat Dikeluarkan Passport' },
    { key: 'passport_issued_date', label: 'Tanggal Dikeluarkan Passport' },
    { key: 'passport_expire_date', label: 'Tanggal Berakhir Passport' },
    { key: 'indonesia_job', label: 'Pekerjaan di Indonesia' },
    { key: 'abroad_job', label: 'Pekerjaan di Luar Negeri' },
    { key: 'work_address', label: 'Alamat Pekerjaan' },
    { key: 'postal_code', label: 'Kode Pos' },
    { key: 'city', label: 'Kota Alamat' },
    { key: 'origin_country', label: 'Negara Asal' },
    { key: 'phone', label: 'Nomor Telepon' },
    { key: 'valid_until', label: 'Tanggal Permohonan' },
    { key: 'price', label: 'Harga' },
  ];

  requiredFields.forEach((field) => {
    const value = entry[field.key];
    if (
      value === null ||
      value === undefined ||
      (typeof value === 'string' && value.trim() === '') ||
      (typeof value === 'number' && value <= 0)
    ) {
      errors.push(`${field.label} wajib diisi`);
    }
  });

  return errors;
};

const saveCurrentEntry = async () => {
  if (!validateStep(1) || !validateStep(2) || !validateStep(3)) {
    displayNotification('Harap lengkapi semua field di semua langkah untuk entri ini.', 'error');
    return;
  }

  syncActiveFormToArray();
  const currentEntry = formEntries.value[currentEntryIndex.value];

  if (currentEntry.status === 'success') {
    displayNotification('Entri ini sudah berhasil disimpan.', 'success');
    return;
  }

  isLoading.value = true;
  try {
    currentEntry.name = currentEntry.payer;
    currentEntry.identity_number = currentEntry.payer_identity;
    const response = await addTransaksiVisa(currentEntry);
    if (response.success) {
      currentEntry.status = 'success';
      displayNotification(`Entri ${currentEntryIndex.value + 1} berhasil disimpan.`, 'success');
    } else {
      currentEntry.status = 'error';
      displayNotification(
        response.error_msg || `Gagal menyimpan entri ${currentEntryIndex.value + 1}.`,
        'error',
      );
    }
  } catch (error: any) {
    const errorMessage =
      error?.response?.data?.message ||
      error?.response?.data?.error_msg ||
      'Terjadi kesalahan jaringan.';
    if (errorMessage.includes('sudah terdaftar') || errorMessage.includes('sudah digunakan')) {
      currentEntry.status = 'duplicate';
      displayNotification(`Entri ${currentEntryIndex.value + 1} adalah data duplikat.`, 'warning');
    } else {
      currentEntry.status = 'error';
      displayNotification(errorMessage, 'error');
    }
  } finally {
    isLoading.value = false;
    Object.assign(form, formEntries.value[currentEntryIndex.value]);
  }
};

const saveAllEntries = async () => {
  syncActiveFormToArray();

  isLoading.value = true;
  let newlySavedCount = 0;
  let duplicateCount = 0;
  let errorCount = 0;
  let preSavedCount = 0;

  const allErrorDetails: string[] = [];

  for (const [index, entry] of formEntries.value.entries()) {
    if (entry.status === 'success') {
      preSavedCount++;
      continue;
    }

    const validationErrors = validateCompleteEntry(entry);
    if (validationErrors.length > 0) {
      entry.status = 'error';
      errorCount++;
      allErrorDetails.push(
        ` Entri ${index + 1} (Data Tidak Lengkap): \n ${validationErrors.join(', ')}.`,
      );
      continue;
    }
    try {
      entry.name = entry.payer;
      entry.identity_number = entry.payer_identity;
      const response = await addTransaksiVisa(entry);
      if (response.success) {
        entry.status = 'success';
        newlySavedCount++;
      } else {
        entry.status = 'error';
        errorCount++;
        allErrorDetails.push(
          ` Entri ${index + 1} (Gagal): \n ${response.error_msg || 'Terjadi kesalahan'}.`,
        );
      }
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error_msg ||
        'Terjadi kesalahan pada server.';

      if (errorMessage.includes('sudah terdaftar') || errorMessage.includes('sudah digunakan')) {
        entry.status = 'duplicate';
        duplicateCount++;
      } else {
        entry.status = 'error';
        errorCount++;
        const formattedApiError = formatErrorMessage(errorMessage);
        allErrorDetails.push(`Entri ${index + 1} (Gagal): \n ${formattedApiError}`);
      }
    }
  }

  isLoading.value = false;
  Object.assign(form, formEntries.value[currentEntryIndex.value]);

  const totalSuccess = preSavedCount + newlySavedCount + duplicateCount;

  if (errorCount === 0 && totalSuccess === formEntries.value.length) {
    emit('save-success', `${totalSuccess} transaksi berhasil diproses.`);
    resetFormAndClose();
  } else {
    let finalMessage = 'Proses Selesai.';
    let messageType: 'success' | 'warning' | 'error' = 'success';

    if (newlySavedCount > 0) finalMessage += `\n- ${newlySavedCount} data baru disimpan.`;
    if (preSavedCount > 0) finalMessage += `\n- ${preSavedCount} data sudah tersimpan sebelumnya.`;
    if (duplicateCount > 0) {
      finalMessage += `\n ${duplicateCount} data terdeteksi duplikat.`;
      if (errorCount === 0) messageType = 'warning'; // jadi warning jika hanya ada duplikat
    }
    if (errorCount > 0) {
      finalMessage += `\n ${errorCount} data gagal diproses.`;
      messageType = 'error';

      // Menambahkan semua detail error yang sudah terkumpul ke notifikasi
      if (allErrorDetails.length > 0) {
        finalMessage += `\n\nDetail Kesalahan:\n${allErrorDetails.join('\n')}`;
      }
    }
    displayNotification(finalMessage, messageType);
  }
};

const resetFormAndClose = () => {
  emit('close');
  setTimeout(() => {
    formEntries.value = [getDefaultFormState()];
    currentEntryIndex.value = 0;
    Object.assign(form, formEntries.value[0]);
    currentStep.value = 1;
    errors.value = {};
  }, 300);
};

const nextStep = () => {
  if (validateStep(currentStep.value) && currentStep.value < totalSteps) currentStep.value++;
};
const prevStep = () => {
  if (currentStep.value > 1) currentStep.value--;
};

onMounted(async () => {
  formEntries.value = [getDefaultFormState()];
  Object.assign(form, formEntries.value[0]);

  const citiesFromApi = await getCityList();
  if (citiesFromApi && citiesFromApi.length > 0) {
    cityOptions.value = citiesFromApi.map((city: CityOption) => ({
      value: city.id,
      label: `${city.name} (${city.kode})`,
    }));
  }

  const visaTypesFromApi = await getVisaTypesList();
  if (visaTypesFromApi && visaTypesFromApi.length > 0) {
    visaTypeOptions.value = visaTypesFromApi.map((visaType: any) => ({
      value: visaType.name,
      label: visaType.name,
    }));
  }
});

const formatPrice = (value: number) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(value);
const unformatPrice = (formatted: string) => parseInt(formatted.replace(/[^\d]/g, ''), 10) || 0;
</script>

<template>
  <div v-if="isFormOpen" class="fixed inset-0 z-50 overflow-y-auto">
    <div class="flex min-h-screen items-center justify-center px-2 py-2">
      <div
        class="fixed inset-0 bg-gray-900 bg-opacity-75 backdrop-blur-sm"
        @click="resetFormAndClose"
      ></div>

      <div
        class="relative w-full max-w-2xl max-h-xl transform rounded-lg bg-white text-left shadow-xl transition-all"
      >
        <!-- Header -->
        <div
          class="bg-white px-4 py-2 border-b border-gray-200 rounded-t-lg flex justify-between items-center"
        >
          <h3 class="text-lg font-bold text-gray-800">Tambah Transaksi Visa</h3>
          <button @click="resetFormAndClose" class="text-gray-400 hover:text-gray-600 text-xl">
            &times;
          </button>
        </div>

        <!-- Entry Management -->
        <div class="px-4 py-2 bg-gray-50 border-b border-gray-200">
          <div class="flex items-center justify-between mb-2">
            <h4 class="text-xs font-semibold text-gray-700">
              Kelola Entries ({{ formEntries.length }})
            </h4>
            <PrimaryButton @click="addNewEntry" class="px-2 py-1 text-white text-xs rounded">
              + Tambah Entry
            </PrimaryButton>
          </div>

          <div class="flex flex-wrap gap-1">
            <template v-for="(entry, index) in formEntries" :key="`entry-${index}`">
              <div
                class="flex items-center bg-white border rounded px-2 py-1 text-xs transition-all"
                :class="{ 'ring-2 ring-blue-500 shadow-md': currentEntryIndex === index }"
              >
                <span
                  v-if="entry.status === 'success'"
                  title="Berhasil Disimpan"
                  class="mr-2 text-green-500 text-base"
                  >✅</span
                >
                <span
                  v-if="entry.status === 'duplicate'"
                  title="Data Duplikat"
                  class="mr-2 text-yellow-500 text-base"
                  >⚠️</span
                >
                <span
                  v-if="entry.status === 'error'"
                  title="Gagal Disimpan"
                  class="mr-2 text-red-500 text-base"
                  >❌</span
                >

                <button
                  @click="switchToEntry(index)"
                  :class="
                    currentEntryIndex === index ? 'text-blue-600 font-semibold' : 'text-gray-600'
                  "
                  class="hover:text-blue-600"
                >
                  Entry {{ index + 1 }} {{ entry.payer ? `(${entry.payer})` : '(Kosong)' }}
                </button>
                <button
                  v-if="formEntries.length > 1"
                  @click="removeEntry(index)"
                  class="ml-2 text-red-500 hover:text-red-700 font-bold"
                >
                  ×
                </button>
              </div>
            </template>
          </div>
        </div>

        <!-- Steps Progress -->
        <div class="px-4 py-3">
          <div class="flex items-center">
            <template v-for="step in totalSteps" :key="step">
              <div
                class="flex items-center"
                :class="step <= currentStep ? 'text-gray-800' : 'text-gray-400'"
              >
                <div
                  class="w-6 h-6 flex items-center justify-center rounded-full border-2 font-bold text-xs"
                  :class="step <= currentStep ? 'border-gray-800 bg-gray-100' : 'border-gray-300'"
                >
                  {{ step }}
                </div>
                <div class="ml-2 text-xs font-semibold">
                  <span v-if="step === 1">Info Pelanggan</span>
                  <span v-if="step === 2">Info Permohonan</span>
                  <span v-if="step === 3">Biaya & Aksi</span>
                </div>
              </div>
              <div
                v-if="step < totalSteps"
                class="flex-auto border-t-2 mx-3"
                :class="step < currentStep ? 'border-gray-800' : 'border-gray-300'"
              ></div>
            </template>
          </div>
        </div>

        <!-- Form Content -->
        <div class="px-4 py-3 max-h-[55vh] overflow-y-auto space-y-3 border-t">
          <div v-show="currentStep === 1" class="space-y-3">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
              <FormInput
                label="Nama Pelanggan"
                v-model="form.payer"
                placeholder="Masukkan nama lengkap pelanggan"
                :error="errors.payer"
                :required="true"
                class="placeholder:text-xs"
              />
              <FormInput
                label="Nomor Identitas"
                v-model="form.payer_identity"
                placeholder="Contoh: 3201234567890123 atau A1234567"
                :error="errors.payer_identity"
                :required="true"
                class="placeholder:text-xs"
              />
            </div>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
              <FormSelect
                label="Jenis Kelamin"
                v-model="form.gender"
                :options="genders"
                placeholder="Pilih jenis kelamin"
                :error="errors.gender"
                :required="true"
                :class="!form.gender ? 'text-gray-500' : 'text-black'"
              />
              <FormInput
                label="Tempat Lahir"
                v-model="form.birth_place"
                placeholder="Contoh: Jakarta, London, dll"
                :error="errors.birth_place"
                :required="true"
                class="placeholder:text-xs"
              />
              <FormInput
                label="Tanggal Lahir"
                v-model="form.birth_date"
                type="date"
                :error="errors.birth_date"
                :required="true"
                class="placeholder:text-xs"
              />
            </div>
            <FormInput
              label="Kewarganegaraan"
              v-model="form.nationality"
              placeholder="Contoh: Indonesia, Malaysia, Singapura, dll"
              :error="errors.nationality"
              :required="true"
              class="placeholder:text-xs"
            />
          </div>

          <div v-show="currentStep === 2" class="space-y-3">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
              <FormSelect
                label="Jenis Permohonan Visa"
                v-model="form.jenis_visa"
                :options="visaTypeOptions"
                placeholder="Pilih jenis visa"
                :required="true"
                :error="errors.jenis_visa"
                :class="!form.jenis_visa ? 'text-gray-500' : 'text-black'"
              />
              <FormInput
                label="Nomor Passport"
                v-model="form.passport_number"
                placeholder="Contoh: A1234567, X9876543"
                :error="errors.passport_number"
                :required="true"
                class="placeholder:text-xs"
              />
            </div>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
              <FormInput
                label="Tempat Dikeluarkan Passport"
                v-model="form.passport_issued_place"
                placeholder="Contoh: Jakarta, Kuala Lumpur"
                :required="true"
                :error="errors.passport_issued_place"
                class="placeholder:text-xs"
              />
              <FormInput
                label="Tgl Dikeluarkan Passport"
                v-model="form.passport_issued_date"
                type="date"
                :required="true"
                :error="errors.passport_issued_date"
              />
              <FormInput
                label="Tgl Berakhir Passport"
                v-model="form.passport_expire_date"
                type="date"
                :required="true"
                :error="errors.passport_expire_date"
              />
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
              <FormInput
                label="Pekerjaan di Indonesia"
                v-model="form.indonesia_job"
                placeholder="Contoh: Karyawan, Wiraswasta, Mahasiswa"
                :required="true"
                :error="errors.indonesia_job"
                class="placeholder:text-xs"
              />
              <FormInput
                label="Pekerjaan di Luar Negeri"
                v-model="form.abroad_job"
                placeholder="Contoh: Engineer, Teacher, Tourist"
                :required="true"
                :error="errors.abroad_job"
                class="placeholder:text-xs"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-800"
                >Alamat Pekerjaan <span class="text-red-500">*</span></label
              >
              <textarea
                v-model="form.work_address"
                rows="2"
                placeholder="Masukkan alamat lengkap tempat kerja"
                class="w-full mt-1 px-3 py-2 border rounded-md text-black placeholder:text-gray-400 text-sm placeholder:text-xs"
                :class="errors.work_address ? 'border-red-500' : 'border-gray-300'"
              ></textarea>
              <p v-if="errors.work_address" class="text-xs text-red-600 mt-1">
                {{ errors.work_address }}
              </p>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
              <FormInput
                label="Kode Pos"
                v-model="form.postal_code"
                placeholder="Contoh: 12345, 10110"
                :required="true"
                :error="errors.postal_code"
                class="placeholder:text-xs"
              />
              <FormSelect
                label="Kota Alamat"
                v-model="form.city"
                :options="cityOptions"
                placeholder="Pilih kota"
                :required="true"
                :error="errors.city"
                :class="!form.city ? 'text-gray-500' : 'text-black'"
              />
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
              <FormInput
                label="Negara Asal"
                v-model="form.origin_country"
                placeholder="Contoh: Indonesia, Malaysia, Thailand"
                :required="true"
                :error="errors.origin_country"
                class="placeholder:text-xs"
              />
              <FormInput
                label="Nomor Telepon"
                v-model="form.phone"
                placeholder="Contoh: +62812345678, 08123456789"
                :error="errors.phone"
                :required="true"
                class="placeholder:text-xs"
              />
            </div>
          </div>

          <div v-show="currentStep === 3" class="space-y-3">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
              <FormInput
                label="Tanggal Permohonan Visa"
                v-model="form.valid_until"
                type="date"
                :error="errors.valid_until"
                :required="true"
              />
              <div>
                <label class="block text-sm font-medium text-gray-800"
                  >Harga Per Paket <span class="text-red-500">*</span></label
                >
                <input
                  type="text"
                  :value="formatPrice(form.price)"
                  @input="form.price = unformatPrice(($event.target as HTMLInputElement).value)"
                  placeholder="Contoh: 1500000"
                  class="w-full mt-1 px-3 py-2 border rounded-md font-semibold text-black text-sm placeholder:text-xs"
                  :class="errors.price ? 'border-red-500' : 'border-gray-300'"
                />
                <p v-if="errors.price" class="text-xs text-red-600 mt-1">{{ errors.price }}</p>
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-800">Aksi</label>
              <div class="mt-2 flex items-center gap-3 p-2 border border-gray-200 rounded-md">
                <input
                  id="pembayar"
                  type="checkbox"
                  v-model="form.payment_method"
                  class="h-4 w-4 rounded border-gray-300 text-gray-900 focus:ring-gray-500"
                />
                <label for="pembayar" class="text-sm font-medium text-gray-800">Pembayar</label>
              </div>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="bg-gray-50 px-4 py-3 flex items-center justify-between rounded-b-lg">
          <div class="flex items-center gap-2">
            <button
              @click="resetFormAndClose"
              type="button"
              class="px-4 py-2 bg-white border border-gray-300 text-gray-800 rounded-lg hover:bg-gray-100 font-semibold transition-colors duration-200 text-sm"
            >
              Cancel
            </button>
            <button
              v-if="currentStep > 1"
              @click="prevStep"
              type="button"
              class="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-semibold text-sm"
            >
              Kembali
            </button>
          </div>
          <div class="flex items-center gap-2">
            <button
              v-if="currentStep === totalSteps"
              @click="saveCurrentEntry"
              :disabled="isLoading"
              class="px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 font-semibold disabled:opacity-50 text-sm"
            >
              Simpan Entry Ini
            </button>
            <PrimaryButton v-if="currentStep < totalSteps" @click="nextStep">
              Selanjutnya
            </PrimaryButton>
            <PrimaryButton
              v-if="currentStep === totalSteps"
              @click="saveAllEntries"
              :is-loading="isLoading"
            >
              Simpan Semua ({{ formEntries.length }})
            </PrimaryButton>
          </div>
        </div>
      </div>
    </div>

    <!-- Notification Component -->
    <Notification
      :show-notification="showNotification"
      :notification-message="notificationMessage"
      :notification-type="notificationType"
      @close="showNotification = false"
    />
  </div>
</template>
