<script setup lang="ts">
import PrimaryButton from '@/components/Button/PrimaryButton.vue'
import InputFile from '@/components/Form/InputFile.vue';
import Notification from '@/components/User/Modules/DaftarJamaah/Particle/Notification.vue';
import SearchableSelect from '@/components/User/Modules/DaftarJamaah/Particle/SearchableSelect.vue'

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'status', payload: { error: boolean, err_msg?: string }): void
}>()

const props = defineProps<{
  isFormAddOpen: boolean
  cabangId: number
}>()

import { ref, onMounted, watch, computed } from 'vue'
import {
  daftarProvinsi,
  daftarKabupaten,
  daftarKecamatan,
  daftarKelurahan,
  daftarMahram,
  daftarPekerjaan,
  daftarPendidikan,
  daftarPengalaman,
} from '@/service/data_master'

import { paramCabang } from '@/service/param_cabang';

import {
  getAgen,
  getJamaahNotMember,
  addJamaah
} from '@/service/daftar_jamaah'

interface Mahram {
  mahram_id: number | null
  mst_mahram_type_id: number | null
}

interface FormDataState {
  photo: File | null
  division_id: number
  fullname: string | null
  identity_number: string | null
  identity_type: string
  gender: string
  birth_place: string | null
  birth_date: string | null
  agen_id: number | null
  title: string
  nama_ayah: string | null
  nama_passport: string | null
  nomor_passport: string | null
  tanggal_di_keluarkan_passport: string | null
  tempat_di_keluarkan_passport: string | null
  masa_berlaku_passport: string | null
  kode_pos: string | null
  whatsapp_number: string | null
  nomor_telephone: string | null
  pengalaman_haji: number
  tahun_haji: string | null
  pengalaman_umrah: number
  tahun_umrah: string | null
  desease: string
  last_education: string | null
  blood_type: string
  mst_pekerjaan_id: number
  profession_instantion_name: string | null
  profession_instantion_address: string | null
  profession_instantion_telephone: string | null
  nama_keluarga: string | null
  alamat_keluarga: string | null
  telephone_keluarga: string | null
  status_nikah: string
  tanggal_nikah: string | null
  kewarganegaraan: string
  mahram: Mahram[]
  keterangan: string | null
  address: string | null
  provinsi_id: number | null
  kabupaten_id: number | null
  kecamatan_id: number | null
  kelurahan_id: number | null
  email: string | null
  password: string
  confirm_password: string
}

interface DokumenState {
  photo_4_6: boolean
  photo_3_4: boolean
  fc_passport: boolean
  fc_kk: boolean
  fc_ktp: boolean
  buku_nikah: boolean
  akte_lahir: boolean
  buku_kuning: boolean
}

// Data Form
const formData = ref<FormDataState>({
  photo: null,
  division_id: props.cabangId,
  fullname: null,
  identity_number: null,
  identity_type: 'ktp',
  gender: 'laki_laki',
  birth_place: null,
  birth_date: null,
  agen_id: null,
  title: 'tuan',
  nama_ayah: null,
  nama_passport: null,
  nomor_passport: null,
  tanggal_di_keluarkan_passport: null,
  tempat_di_keluarkan_passport: null,
  masa_berlaku_passport: null,
  kode_pos: null,
  whatsapp_number: null,
  nomor_telephone: null,
  pengalaman_haji: 1,
  tahun_haji: null,
  pengalaman_umrah: 1,
  tahun_umrah: null,
  desease: '',
  last_education: null,
  blood_type: '',
  mst_pekerjaan_id: 8,
  profession_instantion_name: null,
  profession_instantion_address: null,
  profession_instantion_telephone: null,
  nama_keluarga: null,
  alamat_keluarga: null,
  telephone_keluarga: null,
  status_nikah: 'belum_menikah',
  tanggal_nikah: null,
  kewarganegaraan: 'wni',
  mahram: [
    {  mahram_id: null, mst_mahram_type_id: null  }
  ],
  keterangan: null,
  address: null,
  provinsi_id: null,
  kabupaten_id: null,
  kecamatan_id: null,
  kelurahan_id: null,
  email: null,
  password: '',
  confirm_password:''
})

// Dokumen (checkbox)
const dokumen = ref<DokumenState>({
  photo_4_6: false,
  photo_3_4: false,
  fc_passport: false,
  fc_kk: false,
  fc_ktp: false,
  buku_nikah: false,
  akte_lahir: false,
  buku_kuning: false,
})

interface Cabang { id: number; name: string }

// State untuk loading dan error
const showPassword = ref<boolean>(false)
const showConfirmPassword = ref<boolean>(false)
const timeoutId = ref<number | null>(null);
const isLoading = ref(false)
const showNotification = ref<boolean>(false);
const notificationMessage = ref<string>('');
const notificationType = ref<'success' | 'error'>('success');

// Data untuk select
const errors = ref<Record<string, string>>({})
const fileName = ref<string>('')
const optionCabang = ref<Cabang[]>([])
const provinsi = ref<{ id: number; name: string }[]>([])
const kabupaten = ref<{ id: number; provinsi_id: number; name: string }[]>([])
const kecamatan = ref<{ id: number; kabupaten_id: number; name: string }[]>([])
const kelurahan = ref<{ id: number; kecamatan_id: number; name: string }[]>([])
const mahram = ref<{ id: number; name: string }[]>([])
const pekerjaan = ref<{ id: number; name: string }[]>([])
const pendidikan = ref<{ id: number; name: string }[]>([])
const pengalaman = ref<{ id: number; name: string }[]>([])
const member = ref<{ id: number; fullname: string; }[]>([])
const agen = ref<{ id: number; fullname: string; }[]>([])

const fetchData = async () => {
  if (!props.cabangId) {
    displayNotification('ID cabang tidak ditemukan, silakan keluar dan masuk kembali', 'error')
    return
  }

  try {
    isLoading.value = true
    const [cabangRes, agenRes, provinsiRes, mahramRes, pekerjaanRes, pendidikanRes, pengalamanRes] = await Promise.all([
      paramCabang(),
      getAgen(formData.value.division_id),
      daftarProvinsi(),
      daftarMahram(),
      daftarPekerjaan(),
      daftarPendidikan(),
      daftarPengalaman(),
    ])

    optionCabang.value = cabangRes.data
    agen.value = [{id: null, fullname: 'Tidak Ada'}, ...agenRes.data]
    provinsi.value = provinsiRes.data
    mahram.value = mahramRes.data
    pekerjaan.value = pekerjaanRes.data
    pendidikan.value = pendidikanRes.data
    pengalaman.value = pengalamanRes.data

    console.log("data cabang", optionCabang.value)
    console.log("data agen", agen.value)
    console.log("data member", member.value)
    console.log("data provinsi", provinsi.value)
    console.log("data mahram", mahram.value)
    console.log("data pekerjaan", pekerjaan.value)
    console.log("data pendidikan", pendidikan.value)
    console.log("data pengalaman", pengalaman.value)
  } catch (error: any) {
    emit('close')
    emit('status', {error: true, err_msg: error.response?.data?.error_msg || error.response?.data?.message || 'Terjadi kesalahan dalam mengambil data'})
  } finally {
    isLoading.value = false
  }
}

const fetchJamaah = async () => {
  if (!formData.value.division_id) {
    displayNotification('ID cabang tidak ditemukan, silakan keluar dan masuk kembali', 'error')
    return
  }
  try {
    const response = await getJamaahNotMember(formData.value.division_id)
    member.value = [{id: null, fullname: 'Tidak Ada'}, ...response.data]
  } catch (error) {
    displayNotification('Gagal memuat data jamaah mahram', 'error')
  }
}

const fetchKabupaten = async () => {
  try {
    const response = await daftarKabupaten({
      provinsi_id: formData.value.provinsi_id
    })
    kabupaten.value = response.data
    console.log("data kabupaten", kabupaten.value)
  } catch (error) {
    displayNotification('Gagal memuat data kabupaten', 'error')
  }
}

const fetchKecamatan = async () => {
  try {
    const response = await daftarKecamatan({
      kabupaten_id: formData.value.kabupaten_id
    })
    kecamatan.value = response.data
    console.log("data kecamatan", kecamatan.value)
  } catch (error) {
    displayNotification('Gagal memuat data kecamatan', 'error')
  }
}

const fetchKelurahan = async () => {
  try {
    const response = await daftarKelurahan({
      kecamatan_id: formData.value.kecamatan_id
    })
    kelurahan.value = response.data
    console.log("data kelurahan", kelurahan.value)
  } catch (error) {
    displayNotification('Gagal memuat data kelurahan', 'error')
  }
}

const displayNotification = (message: string, type: 'success' | 'error' = 'success') => {
  notificationMessage.value = message;
  notificationType.value = type;
  showNotification.value = true;

  if (timeoutId.value) clearTimeout(timeoutId.value);

  timeoutId.value = window.setTimeout(() => {
    showNotification.value = false;
  }, 3000);
};

const watcherConfig = [
  {
    source: () => formData.value.provinsi_id,
    reset: ['kabupaten_id', 'kecamatan_id', 'kelurahan_id'],
    fetch: fetchKabupaten,
  },
  {
    source: () => formData.value.kabupaten_id,
    reset: ['kecamatan_id', 'kelurahan_id'],
    fetch: fetchKecamatan,
  },
  {
    source: () => formData.value.kecamatan_id,
    reset: ['kelurahan_id'],
    fetch: fetchKelurahan,
  },
  {
    source: () => formData.value.status_nikah,
    reset: ['tanggal_nikah'],
  },
  {
    source: () => formData.value.pengalaman_haji,
    reset: ['tahun_haji'],
  },
  {
    source: () => formData.value.pengalaman_umrah,
    reset: ['tahun_umrah'],
  },
  {
    source: () => formData.value.mst_pekerjaan_id,
    reset: ['profession_instantion_name', 'profession_instantion_address', 'profession_instantion_telephone'],
  },
  {
    source: () => formData.value.division_id,
    reset: [],
    fetch: fetchJamaah
  }
];

watcherConfig.forEach(({ source, reset, fetch, watchCallback }) => {
  watch(
    source,
    async (newVal, oldVal) => {
      if (newVal !== oldVal) {
        reset.forEach((field) => (formData.value[field] = null)); // reset datanya
        if (newVal && fetch) await fetch(); // Fetch data
        if (watchCallback) watchCallback(newVal);
      }
    },
    { immediate: true }
  );
});

onMounted(async () => {
  fetchData()
})

// Function: Validasi form
const validateForm = (): boolean => {
  type ValidatorFn = (value: any) => string | null;

  const required = (label: string): ValidatorFn => (value) =>
    !value?.toString().trim() ? `${label} tidak boleh kosong` : null;
  const isEmail = (): ValidatorFn => (value) =>
    value === null ? null : /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? null : 'Format email tidak valid';

  const isValidNumber = (label: string): ValidatorFn => (value) =>
    value === null ? null : /^08\d{8,}$/.test(value) ? null : `Nomor ${label} tidak valid`;

  const isBeforeToday = (label: string): ValidatorFn => (value) => {
    const date = new Date(value);
    return value === null ? null : date && date < new Date() ? null : `${label} harus sebelum hari ini`;
  };

  const isString = (label: string): ValidatorFn => (value) =>
    value === null ? null : typeof value === 'string' ? null : `${label} harus berupa teks`;

  const isNumber = (label: string): ValidatorFn => (value) =>
    value === null ? null : !isNaN(value) ? null : `${label} harus berupa angka`;

  const isDate = (label: string): ValidatorFn => (value) =>
    value === null ? null : !isNaN(new Date(value).getTime()) ? null : `${label} harus berupa tanggal yang valid`;

  const fieldValidators: Record<string, ValidatorFn[]> = {
    password: [required('Password'), isString('Password')],
    fullname: [required('Nama'), isString('Nama')],
    identity_number: [required('Nomor identitas'), isNumber('Nomor identitas')],
    identity_type: [required('Jenis identitas'), isString('Jenis identitas')],
    gender: [required('Jenis kelamin'), isString('Jenis kelamin')],
    birth_place: [required('Tempat lahir'), isString('Tempat lahir')],
    birth_date: [required('Tanggal lahir'), isDate('Tanggal lahir'), isBeforeToday('Tanggal lahir')],
    whatsapp_number: [required('Nomor WhatsApp'), isValidNumber('Whatsapp')],
    agen_id: [isNumber('ID Agen')],
    title: [isString('Titel')],
    nama_ayah: [isString('Nama Ayah')],
    nama_passport: [isString('Nama Passport')],
    nomor_passport: [isNumber('Nomor Passport')],
    tanggal_di_keluarkan_passport: [isDate('Tanggal Dikeluarkan Passport')],
    tempat_di_keluarkan_passport: [isString('Tempat Dikeluarkan Passport')],
    masa_berlaku_passport: [isDate('Masa Berlaku Passport')],
    kode_pos: [required('Kode Pos'), isNumber('Kode Pos')],
    nomor_telephone: [required('Nomor Telepon'), isValidNumber('Telepon')],
    pengalaman_haji: [required('Pengalaman Haji')],
    tahun_haji: [isNumber('Tahun Haji')],
    pengalaman_umrah: [required('Pengalaman Umrah')],
    tahun_umrah: [isNumber('Tahun Umrah')],
    desease: [isString('Penyakit')],
    last_education: [required('Pendidikan Terakhir')],
    blood_type: [isString('Golongan Darah')],
    mst_pekerjaan_id: [required('Pekerjaan')],
    profession_instantion_name: [isString('Nama Instansi')],
    profession_instantion_address: [isString('Alamat Instansi')],
    profession_instantion_telephone: [isValidNumber('Telepon Instansi')],
    nama_keluarga: [isString('Nama Keluarga')],
    alamat_keluarga: [isString('Alamat Keluarga')],
    telephone_keluarga: [isValidNumber('Telepon Keluarga')],
    status_nikah: [required('Status Nikah')],
    tanggal_nikah: [isDate('Tanggal Nikah')],
    kewarganegaraan: [required('Kewarganegaraan'), isString('Kewarganegaraan')],
    keterangan: [isString('Keterangan')],
    address: [required('Alamat')],
    provinsi_id: [required('Provinsi')],
    kabupaten_id: [required('Kabupaten')],
    kecamatan_id: [required('Kecamatan')],
    kelurahan_id: [required('Kelurahan')],
    email: [isEmail()],
  };

  errors.value = {} as Record<keyof typeof formData.value, string>;
  let isValid = true;

  const passwordRegex = new RegExp('^[a-zA-Z0-9]{6,}$');

  if (!passwordRegex.test(formData.value.password)) {
    errors.value.password = 'Password minimal 6 karakter dan hanya boleh berisi alphanumeric';
    isValid = false;
  }

  if (formData.value.password !== formData.value.confirm_password) {
    errors.value.confirm_password = 'Password tidak sama atau cocok';
    isValid = false;
  }

  if (!formData.value.division_id || !props.cabangId) {
    displayNotification('ID Cabang tidak ditemukan, silahkan keluar dan masuk kembali', 'error');
    isValid = false;
  }

  for (const [index, m] of formData.value.mahram.entries()) {
    if (m.mahram_id && !m.mst_mahram_type_id) {
      errors.value[`mahram.${index}.mst_mahram_type_id`] = 'Jenis mahram wajib diisi';
      isValid = false;
    }
  }

  for (const field of Object.keys(fieldValidators) as (keyof typeof formData.value)[]) {
    const validators = fieldValidators[field]!;
    for (const validate of validators) {
      const error = validate(formData.value[field]);
      if (error) {
        errors.value[field] = error;
        isValid = false;
        break;
      }
    }
  }

  if (!isValid) {
    displayNotification('Terdapat kesalahan dalam input data, silahkan periksa kembali', 'error');
  }

  return isValid;
};

// Handle file upload
const handleFileUpload = (event: Event): void => {
  const input = event as HTMLInputElement
  if (input) {
    const file = input

    // Validasi jenis file
    if (!['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) {
      errors.value.photo = 'File harus berupa JPG, JPEG, atau PNG'
      fileName.value = ''
      return
    }

    // Validasi ukuran file (600KB = 614400 bytes)
    if (file.size > 614400) {
      errors.value.photo = 'Ukuran file maksimum 600KB'
      displayNotification('Ukuran file gambar maksimum 600KB', 'error')
      fileName.value = ''
      return
    }

    fileName.value = file.name
    formData.value.photo = file
    console.log(fileName.value)
    console.log(formData.value.photo)
  }
}

const photoPreviewUrl = computed(() => {
  if (!formData.value.photo) return null;
  return typeof formData.value.photo === 'string'
    ? formData.value.photo
    : URL.createObjectURL(formData.value.photo);
});

const saveData = async () => {
  if (!validateForm()) return

  const objectToFormData = (
    obj: Record<string, any>,
    form: FormData = new FormData(),
    parentKey = ''
  ): FormData => {
    Object.entries(obj).forEach(([key, value]) => {
      const formKey = parentKey ? `${parentKey}[${key}]` : key

      if (value instanceof Date) {
        form.append(formKey, value.toISOString())
      } else if (value instanceof File || value instanceof Blob) {
        form.append(formKey, value)
      } else if (Array.isArray(value)) {
        value.forEach((item, index) => {
          if (typeof item === 'object' && item !== null) {
            objectToFormData(item, form, `${formKey}[${index}]`)
          } else {
            form.append(`${formKey}[${index}]`, item)
          }
        })
      } else if (typeof value === 'object' && value !== null) {
        objectToFormData(value, form, formKey)
      } else if (value !== null && value !== undefined) {
        form.append(formKey, value)
      }
    })

    return form
  }

  try {
    isLoading.value = true

    const combinedData = {
      ...formData.value,
      ...Object.fromEntries(
        Object.entries(dokumen.value).map(([key, val]) => [key, val ? '1' : '0'])
      )
    }

    const formDataToSend = objectToFormData(combinedData)

    console.log('ISI FORMDATA:', Array.from(formDataToSend.entries()))

    const response = await addJamaah(formDataToSend)
    console.log(response)

    emit('close')
    emit('status', {
      error: false,
      err_msg: response.error_msg || response.message || 'Data jamaah berhasil disimpan'
    })
  } catch (error: any) {
    if (error?.response?.data?.errors) {
      const errors = error.response.data.errors;
      let errMsg = '';
      for (const err of errors) {
        errMsg += `${err.msg}\n`;
      }
      displayNotification(errMsg, 'error');
    } else {
      displayNotification(
        error?.response?.data?.error_msg ||
        error?.response?.data?.message ||
        'Terjadi kesalahan dalam menyimpan data',
        'error'
      )
    }
  } finally {
    isLoading.value = false
  }
}
</script>


<template>
  <div v-if="isLoading" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
    <div class="animate-spin h-5 w-5 border-b-2 border-white rounded-full"></div>
  </div>
  <div v-if="props.isFormAddOpen && !isLoading" class="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
    <div class="flex min-h-screen items-end justify-center px-6 pt-6 pb-20 text-center sm:block sm:p-0">
      <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>
      <span class="hidden sm:inline-block sm:h-screen sm:align-middle" aria-hidden="true">&#8203;</span>
      <div class="relative p-6 inline-block transform overflow-hidden rounded-lg bg-white text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-4xl sm:align-middle">
        <h1 class="border-b border-gray-200 pb-4 text-2xl flex items-center justify-center font-bold leading-6 text-gray-900 mb-4">
          Form Tambah Jamaah
        </h1>
        <div class="bg-white max-h-[68vh] text-gray-800 overflow-y-auto no-scrollbar">
          <!-- Section 1: Identitas Diri  -->
          <div class="space-y-3 p-1">
            <h2 class="text-xl font-semibold">Identitas Diri</h2>
            <div class="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="space-y-1">
                <SearchableSelect
                  v-model="formData.division_id"
                  :options="optionCabang "
                  label="Cabang"
                  placeholder="Pilih Cabang"
                  :error="errors.cabang_id"
                  required
                />
              </div>
              <div class="space-y-1">
                <label class="block w-full text-sm font-medium text-gray-700">Title <span class="text-red-500">*</span></label>
                <select
                  v-model="formData.title"
                  class="block w-full px-3 py-2 placeholder:text-gray-500 text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  required
                >
                  <option value="">Pilih Title</option>
                  <option value="tuan">Tuan</option>
                  <option value="nona">Nona</option>
                  <option value="nyonya">Nyonya</option>
                </select>
                <span v-if="errors.title" class="mt-1 text-sm text-red-600">{{ errors.title }}</span>
              </div>
              <div class="space-y-1">
                <label class="block w-full text-sm font-medium text-gray-700">Nama Lengkap <span class="text-red-500">*</span></label>
                <input
                  v-model="formData.fullname"
                  type="text"
                  class="block w-full px-3 py-2 placeholder:text-gray-500 text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  placeholder="Nama Lengkap"
                  required
                />
                <span v-if="errors.fullname" class="mt-1 text-sm text-red-600 ">{{ errors.fullname }}</span>
              </div>
              <div class="space-y-1">
                <label class="block w-full text-sm font-medium text-gray-700">Nama Passport</label>
                <input
                  v-model="formData.nama_passport"
                  type="text"
                  class="block w-full px-3 py-2 placeholder:text-gray-500 text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  placeholder="Nama Passport"
                />
                <span v-if="errors.nama_passport" class="mt-1 text-sm text-red-600">{{ errors.nama_passport }}</span>
              </div>
              <div class="space-y-1">
                <label class="block w-full text-sm font-medium text-gray-700">Nomor Identitas <span class="text-red-500">*</span></label>
                <input
                  v-model="formData.identity_number"
                  type="text"
                  class="block w-full px-3 py-2 placeholder:text-gray-500 text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  placeholder="Nomor Identitas (NIK/KTP)"
                  required
                />
                <span v-if="errors.identity_number" class="mt-1 text-sm text-red-600">{{ errors.identity_number }}</span>
              </div>
              <div class="space-y-1">
                <label class="block w-full text-sm font-medium text-gray-700">Jenis Identitas <span class="text-red-500">*</span></label>
                <select
                  v-model="formData.identity_type"
                  class="block w-full px-3 py-2 placeholder:text-gray-500 text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  required
                >
                  <option value="">Pilih Jenis Identitas</option>
                  <option value="passport">Passport</option>
                  <option value="ktp">KTP</option>
                </select>
                <span v-if="errors.identity_type" class="mt-1 text-sm text-red-600">{{ errors.identity_type }}</span>
              </div>
              <div class="space-y-1">
                <label class="block w-full text-sm font-medium text-gray-700">Kewarganegaraan <span class="text-red-500">*</span></label>
                <select
                  v-model="formData.kewarganegaraan"
                  class="block w-full px-3 py-2 placeholder:text-gray-500 text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  required
                >
                  <option value="">Pilih Kewarganegaraan</option>
                  <option value="wni">WNI</option>
                  <option value="wna">WNA</option>
                </select>
                <span v-if="errors.kewarganegaraan" class="mt-1 text-sm text-red-600">{{ errors.kewarganegaraan }}</span>
              </div>
              <div class="space-y-1">
                <label class="block w-full text-sm font-medium text-gray-700">Jenis Kelamin <span class="text-red-500">*</span></label>
                <select
                  v-model="formData.gender"
                  class="block w-full px-3 py-2 placeholder:text-gray-500 text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  required
                >
                  <option value="">Pilih Jenis Kelamin</option>
                  <option value="laki_laki">Laki-laki</option>
                  <option value="perempuan">Perempuan</option>
                </select>
                <span v-if="errors.gender" class="mt-1 text-sm text-red-600 ">{{ errors.gender }}</span>
              </div>
              <div class="space-y-1">
                <label class="block w-full text-sm font-medium text-gray-700">Golongan Darah</label>
                <select
                  v-model="formData.blood_type"
                  class="block w-full px-3 py-2 placeholder:text-gray-500 text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  required
                >
                  <option value="">Pilih Golongan Darah</option>
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="AB">AB</option>
                  <option value="O">O</option>
                </select>
                <span v-if="errors.blood_type" class="mt-1 text-sm text-red-600 ">{{ errors.blood_type }}</span>
              </div>
              <div class="space-y-1">
                <label class="block w-full text-sm font-medium text-gray-700">Tempat Lahir <span class="text-red-500">*</span></label>
                <input
                  v-model="formData.birth_place"
                  type="text"
                  class="block w-full px-3 py-2 placeholder:text-gray-500 text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  placeholder="Kota kelahiran"
                  required
                />
                <span v-if="errors.birth_place" class="mt-1 text-sm text-red-600">{{ errors.birth_place }}</span>
              </div>
              <div class="space-y-1">
                <label class="block w-full text-sm font-medium text-gray-700">Tanggal Lahir <span class="text-red-500">*</span></label>
                <input
                  v-model="formData.birth_date"
                  type="date"
                  class="block w-full px-3 py-2 placeholder:text-gray-500 text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  required
                />
                <span v-if="errors.birth_date" class="mt-1 text-sm text-red-600 ">{{ errors.birth_date }}</span>
              </div>
            </div>
            <!-- Section 2: Kontak dan Alamat  -->
            <h2 class="text-xl font-semibold">Kontak dan Alamat</h2>
            <div class="mt-2">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="space-y-1">
                  <SearchableSelect
                    v-model="formData.provinsi_id"
                    :options="provinsi"
                    label="Provinsi"
                    placeholder="Pilih Provinsi"
                    idField="id"
                    nameField="name"
                    required
                    :error="errors.provinsi_id"
                  />
                </div>
                <div class="space-y-1">
                  <SearchableSelect
                    v-model="formData.kabupaten_id"
                    :options="kabupaten"
                    label="Kabupaten"
                    placeholder="Pilih Kabupaten"
                    idField="id"
                    nameField="name"
                    required
                    :error="errors.kabupaten_id"
                    :disabled="!formData.provinsi_id"
                  />
                </div>
                <div class="space-y-1">
                  <SearchableSelect
                    v-model="formData.kecamatan_id"
                    :options="kecamatan"
                    label="Kecamatan"
                    placeholder="Pilih Kecamatan"
                    idField="id"
                    nameField="name"
                    required
                    :error="errors.kecamatan_id"
                    :disabled="!formData.kabupaten_id"
                  />
                </div>
                <div class="space-y-1">
                  <SearchableSelect
                    v-model="formData.kelurahan_id"
                    :options="kelurahan"
                    label="Kelurahan"
                    placeholder="Pilih Kelurahan"
                    idField="id"
                    nameField="name"
                    required
                    :error="errors.kelurahan_id"
                    :disabled="!formData.kecamatan_id"
                  />
                </div>
              </div>
              <div class="space-y-1 pt-2 pb-2">
                <label class="block w-full text-sm font-medium text-gray-700">Alamat Lengkap <span class="text-red-500">*</span></label>
                <textarea
                  v-model="formData.address"
                  class="resize-none block w-full px-3 py-2 placeholder:text-gray-500 text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  placeholder="Jl. Nama Jalan No. XX"
                  required
                ></textarea>
                <span v-if="errors.address" class="mt-1 text-sm text-red-600">{{ errors.address }}</span>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="space-y-1">
                  <label class="block w-full text-sm font-medium text-gray-700">Kode POS <span class="text-red-500">*</span></label>
                  <input
                    v-model="formData.kode_pos"
                    type="text"
                    class="block w-full px-3 py-2 placeholder:text-gray-500 text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    placeholder="12345"
                    required
                  />
                  <span v-if="errors.kode_pos" class="mt-1 text-sm text-red-600">{{ errors.kode_pos }}</span>
                </div>
                <div class="space-y-1">
                  <label class="block w-full text-sm font-medium text-gray-700">Nomor Telepon <span class="text-red-500">*</span></label>
                  <input
                    v-model="formData.nomor_telephone"
                    type="text"
                    class="block w-full px-3 py-2 placeholder:text-gray-500 text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    placeholder="081234567890"
                    required
                  />
                  <span v-if="errors.nomor_telephone" class="mt-1 text-sm text-red-600">{{ errors.nomor_telephone }}</span>
                </div>
                <div class="space-y-1">
                  <label class="block w-full text-sm font-medium text-gray-700">Nomor Whatsapp <span class="text-red-500">*</span></label>
                  <input
                    v-model="formData.whatsapp_number"
                    type="text"
                    class="block w-full px-3 py-2 placeholder:text-gray-500 text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    placeholder="081234567890"
                    required
                  />
                  <span v-if="errors.whatsapp_number" class="mt-1 text-sm text-red-600">{{ errors.whatsapp_number }}</span>
                </div>
                <div class="space-y-1">
                  <label class="block w-full text-sm font-medium text-gray-700">Email</label>
                  <input
                    v-model="formData.email"
                    type="email"
                    class="block w-full px-3 py-2 placeholder:text-gray-500 text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    placeholder="jamaah@example.com"
                  />
                  <span v-if="errors.email" class="mt-1 text-sm text-red-600">{{ errors.email }}</span>
                </div>
              </div>
            </div>
            <!-- Section 3: Informasi Passport -->
            <h2 class="text-xl font-semibold">Informasi Passport</h2>
            <div class="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="space-y-1">
                <label class="block w-full text-sm font-medium text-gray-700">Nomor Passport</label>
                <input
                  v-model="formData.nomor_passport"
                  type="text"
                  class="block w-full px-3 py-2 placeholder:text-gray-500 text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  placeholder="A1234567"
                />
                <span v-if="errors.nomor_passport" class="mt-1 text-sm text-red-600">{{ errors.nomor_passport }}</span>
              </div>
              <div class="space-y-1">
                <label class="block w-full text-sm font-medium text-gray-700">Masa Berlaku Passport</label>
                <input
                  v-model="formData.masa_berlaku_passport"
                  type="date"
                  class="block w-full px-3 py-2 placeholder:text-gray-500 text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                />
                <span v-if="errors.masa_berlaku_passport" class="mt-1 text-sm text-red-600">{{ errors.masa_berlaku_passport }}</span>
              </div>
              <div class="space-y-1">
                <label class="block w-full text-sm font-medium text-gray-700">Tanggal Dikeluarkan Passport</label>
                <input
                  v-model="formData.tanggal_di_keluarkan_passport"
                  type="date"
                  class="block w-full px-3 py-2 placeholder:text-gray-500 text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                />
                <span v-if="errors.tanggal_di_keluarkan_passport" class="mt-1 text-sm text-red-600">{{ errors.tanggal_di_keluarkan_passport }}</span>
              </div>
              <div class="space-y-1">
                <label class="block w-full text-sm font-medium text-gray-700">Tempat Dikeluarkan Passport</label>
                <input
                  v-model="formData.tempat_di_keluarkan_passport"
                  type="text"
                  class="block w-full px-3 py-2 placeholder:text-gray-500 text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  placeholder="Tempat dikeluarkan passport"
                />
                <span v-if="errors.tempat_di_keluarkan_passport" class="mt-1 text-sm text-red-600">{{ errors.tempat_di_keluarkan_passport }}</span>
              </div>
            </div>
            <!-- Section 4: Informasi Keluarga -->
            <h2 class="text-xl font-semibold">Informasi Keluarga</h2>
            <div class="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="space-y-1">
                <label class="block w-full text-sm font-medium text-gray-700">Nama Ayah Kandung</label>
                <input
                  v-model="formData.nama_ayah"
                  type="text"
                  class="block w-full px-3 py-2 placeholder:text-gray-500 text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  placeholder="Nama Ayah"
                />
                <span v-if="errors.nama_ayah" class="mt-1 text-sm text-red-600">{{ errors.nama_ayah }}</span>
              </div>
              <div class="space-y-1">
                <label class="block w-full text-sm font-medium text-gray-700">Nama Keluarga</label>
                <input
                  v-model="formData.nama_keluarga"
                  type="text"
                  class="block w-full px-3 py-2 placeholder:text-gray-500 text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  placeholder="Nama Keluarga"
                />
                <span v-if="errors.nama_keluarga" class="mt-1 text-sm text-red-600">{{ errors.nama_keluarga }}</span>
              </div>
              <div class="space-y-1">
                <label class="block w-full text-sm font-medium text-gray-700">Nomor Telepon Keluarga</label>
                <input
                  v-model="formData.telephone_keluarga"
                  type="text"
                  class="block w-full px-3 py-2 placeholder:text-gray-500 text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  placeholder="Nomor Telepon Keluarga"
                />
                <span v-if="errors.telephone_keluarga" class="mt-1 text-sm text-red-600">{{ errors.telephone_keluarga }}</span>
              </div>
              <div class="space-y-1">
                <label class="block w-full text-sm font-medium text-gray-700">Alamat Keluarga</label>
                <textarea
                  v-model="formData.alamat_keluarga"
                  class="resize-none block w-full px-3 py-2 placeholder:text-gray-500 text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  placeholder="Alamat Keluarga"
                ></textarea>
                <span v-if="errors.alamat_keluarga" class="mt-1 text-sm text-red-600">{{ errors.alamat_keluarga }}</span>
              </div>
            </div>
            <!-- Section 5: Informasi Mahram -->
            <h2 class="text-xl font-semibold mb-2">Informasi Mahram</h2>

            <div
              v-for="(mahramData, index) in formData.mahram"
              :key="index"
              class="relative pr-4 pl-4 pt-2 pb-2 border border-gray-300 rounded-lg bg-gray-50 shadow-sm"
            >
              <!-- Tombol Hapus -->
              <button
                type="button"
                @click="formData.mahram.splice(index, 1)"
                class="absolute top-2 right-2 text-red-500 hover:text-red-700 transition"
                title="Hapus Mahram"
              >
                <font-awesome-icon icon="fa-solid fa-times"></font-awesome-icon>
              </button>
              <div class="grid grid-cols-1 md:grid-cols-2">
                <div class="space-y-1 pr-4">
                  <SearchableSelect
                    v-model="mahramData.mahram_id"
                    :options="member"
                    label="Nama Jamaah"
                    placeholder="Pilih Nama Jamaah"
                    idField="id"
                    nameField="fullname"
                  />
                </div>
                <div class="space-y-1">
                  <SearchableSelect
                    v-model="mahramData.mst_mahram_type_id"
                    :options="mahram"
                    label="Jenis Mahram"
                    placeholder="Pilih Jenis Mahram"
                    idField="id"
                    nameField="name"
                    :disabled="!mahramData.mahram_id"
                  />
                </div>
                <template v-if="mahramData.mahram_id && !mahramData.mst_mahram_type_id">
                  <p class="text-sm text-red-600">
                    Jenis mahram wajib diisi
                  </p>
                </template>
              </div>
            </div>
            <PrimaryButton
              type="button"
              @click="formData.mahram.push({ mahram_id: null, mst_mahram_type_id: null })"
            >
              <font-awesome-icon icon="fa-solid fa-plus"></font-awesome-icon>
              Tambah Mahram
            </PrimaryButton>
            <!-- Section 6: Informasi Tambahan -->
            <h2 class="text-xl font-semibold">Informasi Tambahan</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="space-y-1">
                <label class="block text-sm font-medium text-gray-700">Status Nikah</label>
                <select v-model="formData.status_nikah" class="block w-full px-3 py-2 placeholder:text-gray-500 text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200">
                  <option value="belum_menikah">Belum Menikah</option>
                  <option value="menikah">Menikah</option>
                  <option value="janda_duda">Janda Duda</option>
                </select>
                <span class="mt-1 text-sm text-red-600" v-if="errors.status_nikah">{{ errors.status_nikah }}</span>
              </div>
              <div class="space-y-1">
                <label class="block text-sm font-medium text-gray-700">Tanggal Nikah</label>
                <input
                  v-model="formData.tanggal_nikah"
                  type="date"
                  :class="{ 'opacity-50': formData.status_nikah !== 'menikah' }"
                  class="block w-full px-3 py-2 placeholder:text-gray-500 text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  :disabled="formData.status_nikah !== 'menikah'"
                />
                <span class="mt-1 text-sm text-red-600" v-if="errors.tanggal_nikah">{{ errors.tanggal_nikah }}</span>
              </div>
            </div>
            <!-- Section 7: Pengalaman Haji/Umrah -->
            <h2 class="text-xl font-semibold">Pengalaman Haji/Umrah</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="space-y-1">
                <label class="block text-sm font-medium text-gray-700">Pengalaman Haji</label>
                <select v-model="formData.pengalaman_haji" class="block w-full px-3 py-2 placeholder:text-gray-500 text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200">
                  <option v-for="item in pengalaman" :key="item.id" :value="item.id">{{ item.name }}</option>
                </select>
                <span class="mt-1 text-sm text-red-600" v-if="errors.pengalaman_haji">{{ errors.pengalaman_haji }}</span>
              </div>
              <div class="space-y-1">
                <label class="block text-sm font-medium text-gray-700">Tahun Haji</label>
                <input
                  v-model="formData.tahun_haji"
                  type="text"
                  pattern="[0-9]{4}"
                  :class="{ 'opacity-50': formData.pengalaman_haji === 1 || formData.pengalaman_haji === null }"
                  class="block w-full px-3 py-2 placeholder:text-gray-500 text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  :disabled="formData.pengalaman_haji === 1 || formData.pengalaman_haji === null"
                  placeholder="Tahun Haji"
                />
                <span class="mt-1 text-sm text-red-600" v-if="errors.tahun_haji">{{ errors.tahun_haji }}</span>
              </div>
              <div class="space-y-1">
                <label class="block text-sm font-medium text-gray-700">Pengalaman Umrah</label>
                <select v-model="formData.pengalaman_umrah" class="block w-full px-3 py-2 placeholder:text-gray-500 text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200">
                  <option v-for="item in pengalaman" :key="item.id" :value="item.id">{{ item.name }}</option>
                </select>
                <span class="mt-1 text-sm text-red-600" v-if="errors.pengalaman_umrah">{{ errors.pengalaman_umrah }}</span>
              </div>
              <div class="space-y-1">
                <label class="block text-sm font-medium text-gray-700">Tahun Umrah</label>
                <input
                  v-model="formData.tahun_umrah"
                  type="text"
                  pattern="[0-9]{4}"
                  :class="{ 'opacity-50': formData.pengalaman_umrah === 1 || formData.pengalaman_umrah === null }"
                  class="block w-full px-3 py-2 placeholder:text-gray-500 text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  :disabled="formData.pengalaman_umrah === 1 || formData.pengalaman_umrah === null"
                  placeholder="Tahun Umrah"
                />
                <span class="mt-1 text-sm text-red-600" v-if="errors.tahun_umrah">{{ errors.tahun_umrah }}</span>
              </div>
            </div>
            <!-- Section 8: Informasi Pekerjaan -->
            <h2 class="text-xl font-semibold">Informasi Pekerjaan</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="space-y-1">
                <label class="block text-sm font-medium text-gray-700">Pekerjaan</label>
                <select v-model="formData.mst_pekerjaan_id" class="block w-full px-3 py-2 placeholder:text-gray-500 text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200">
                  <option value="" disabled selected>Pilih pekerjaan</option>
                  <option v-for="item in pekerjaan" :key="item.id" :value="item.id">{{ item.name }}</option>
                </select>
                <span class="mt-1 text-sm text-red-600" v-if="errors.mst_pekerjaan_id">{{ errors.mst_pekerjaan_id }}</span>
              </div>
              <div class="space-y-1">
                <label class="block text-sm font-medium text-gray-700">Nama Perusahaan</label>
                <input
                  v-model="formData.profession_instantion_name"
                  type="text"
                  :class="{ 'opacity-50': formData.mst_pekerjaan_id === 8 || formData.mst_pekerjaan_id === null }"
                  :disabled="formData.mst_pekerjaan_id === 8 || formData.mst_pekerjaan_id === null"
                  class="block w-full px-3 py-2 placeholder:text-gray-500 text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  placeholder="Nama Perusahaan"
                />
                <span class="mt-1 text-sm text-red-600" v-if="errors.profession_instantion_name">{{ errors.profession_instantion_name }}</span>
              </div>
              <div class="space-y-1">
                <label class="block text-sm font-medium text-gray-700">Nomor Telepon Perusahaan</label>
                <input
                  v-model="formData.profession_instantion_telephone"
                  type="text"
                  :class="{ 'opacity-50': formData.mst_pekerjaan_id === 8 || formData.mst_pekerjaan_id === null }"
                  :disabled="formData.mst_pekerjaan_id === 8 || formData.mst_pekerjaan_id === null"
                  class="block w-full px-3 py-2 placeholder:text-gray-500 text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  placeholder="Nomor Telepon Perusahaan"
                />
                <span class="mt-1 text-sm text-red-600" v-if="errors.profession_instantion_telephone">{{ errors.profession_instantion_telephone }}</span>
              </div>
              <div class="space-y-1">
                <label class="block text-sm font-medium text-gray-700">Alamat Perusahaan</label>
                <textarea
                  v-model="formData.profession_instantion_address"
                  :class="{ 'opacity-50': formData.mst_pekerjaan_id === 8 || formData.mst_pekerjaan_id === null }"
                  :disabled="formData.mst_pekerjaan_id === 8 || formData.mst_pekerjaan_id === null"
                  class="resize-none block w-full px-3 py-2 placeholder:text-gray-500 text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  placeholder="Alamat Perusahaan"
                ></textarea>
                <span class="mt-1 text-sm text-red-600" v-if="errors.profession_instantion_address">{{ errors.profession_instantion_address }}</span>
              </div>
            </div>
            <!-- Section 9: Kesehatan -->
            <h2 class="text-xl font-semibold">Pendidikan dan Kesehatan</h2>
            <div class="space-y-1">
              <SearchableSelect
                v-model="formData.last_education"
                :options="pendidikan"
                label="Pendidikan Terakhir"
                placeholder="Pilih Pendidikan"
                idField="id"
                nameField="name"
                :error="errors.last_education"
              />
            </div>
            <div class="space-y-1">
              <label class="block text-sm font-medium text-gray-700">Riwayat Penyakit</label>
              <textarea
                v-model="formData.desease"
                class="resize-none block w-full px-3 py-2 placeholder:text-gray-500 text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                placeholder="Riwayat penyakit yang diderita"
                maxlength="255"
              ></textarea>
              <span v-if="formData.desease.length >= 255" class="mt-1 text-sm text-red-600">Maksimal 255 karakter</span>
              <span v-if="errors.desease" class="mt-1 text-sm text-red-600">{{ errors.desease }}</span>
            </div>
            <!-- Section 10: Agen -->
            <h2 class="text-xl font-semibold">Agen</h2>
            <div class="space-y-1">
              <SearchableSelect
                v-model="formData.agen_id"
                :options="agen"
                label="Agen"
                placeholder="Pilih Agen"
                idField="id"
                nameField="fullname"
                :error="errors.agen_id"
              />
            </div>
            <!-- Section 11: Kelengkapan Dokumen -->
            <h2 class="text-xl font-semibold mb-4">Kelengkapan Dokumen</h2>
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div class="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="foto4x6"
                  v-model="dokumen.photo_4_6"
                  class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label for="foto4x6" class="text-sm font-medium text-gray-700">
                  Pas Foto 4x6
                </label>
              </div>
              <div class="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="foto3x4"
                  v-model="dokumen.photo_3_4"
                  class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label for="foto3x4" class="text-sm font-medium text-gray-700">
                  Pas Foto 3x4
                </label>
              </div>
              <div class="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="fcPassport"
                  v-model="dokumen.fc_passport"
                  class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label for="fcPassport" class="text-sm font-medium text-gray-700">
                  FC Passport
                </label>
              </div>
              <div class="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="fcKK"
                  v-model="dokumen.fc_kk"
                  class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label for="fcKK" class="text-sm font-medium text-gray-700">
                  FC KK
                </label>
              </div>
              <div class="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="fcKTP"
                  v-model="dokumen.fc_ktp"
                  class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label for="fcKTP" class="text-sm font-medium text-gray-700">
                  FC KTP
                </label>
              </div>
              <div class="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="bukuNikah"
                  v-model="dokumen.buku_nikah"
                  class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label for="bukuNikah" class="text-sm font-medium text-gray-700">
                  Buku Nikah
                </label>
              </div>
              <div class="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="akteLahir"
                  v-model="dokumen.akte_lahir"
                  class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label for="akteLahir" class="text-sm font-medium text-gray-700">
                  Akte Kelahiran
                </label>
              </div>
              <div class="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="bukuKuning"
                  v-model="dokumen.buku_kuning"
                  class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label for="bukuKuning" class="text-sm font-medium text-gray-700">
                  Buku Kuning
                </label>
              </div>
            </div>
            <!-- Section 12: Keterangan dan password -->
            <div class="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="space-y-1">
                <label class="block text-sm font-medium text-gray-700">Keterangan</label>
                <textarea
                  id="keterangan"
                  v-model="formData.keterangan"
                  rows="4"
                  class="resize-none block w-full px-3 py-2 placeholder:text-gray-500 text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  placeholder="keterangan"
                ></textarea>
                <p v-if="errors.keterangan" class="mt-1 text-sm text-red-600">{{ errors.keterangan }}</p>
              </div>
              <div class="space-y-2">
                <div class="space-y-1">
                  <label class="block text-sm font-medium text-gray-700">Password <span class="text-red-500">*</span></label>
                  <div class="relative">
                    <input
                      :type="showPassword ? 'text' : 'password'"
                      id="password"
                      v-model="formData.password"
                      class="block w-full px-3 py-2 placeholder:text-gray-500 text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      placeholder="Password"
                    />
                    <button
                      type="button"
                      @click="showPassword = !showPassword"
                      class="absolute inset-y-0 right-0 px-3 text-gray-500 hover:text-gray-900"
                    >
                      <span v-if="!showPassword">
                        <font-awesome-icon icon="fa-solid fa-eye-slash"></font-awesome-icon>
                      </span>
                      <span v-else>
                        <font-awesome-icon icon="fa-regular fa-eye"></font-awesome-icon>
                      </span>
                    </button>
                  </div>
                  <p v-if="errors.password" class="mt-1 text-sm text-red-600">{{ errors.password }}</p>
                </div>
                <div class="space-y-1">
                  <label class="block text-sm font-medium text-gray-700">Konfirmasi Password <span class="text-red-500">*</span></label>
                  <div class="relative">
                    <input
                      :type="showConfirmPassword ? 'text' : 'password'"
                      id="confirm-password"
                      v-model="formData.confirm_password"
                      class="block w-full px-3 py-2 placeholder:text-gray-500 text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      placeholder="Konfirmasi Password"
                    />
                    <button
                      type="button"
                      @click="showConfirmPassword = !showConfirmPassword"
                      class="absolute inset-y-0 right-0 px-3 text-gray-500 hover:text-gray-900"
                    >
                      <span v-if="!showConfirmPassword">
                        <font-awesome-icon icon="fa-solid fa-eye-slash"></font-awesome-icon>
                      </span>
                      <span v-else>
                        <font-awesome-icon icon="fa-regular fa-eye"></font-awesome-icon>
                      </span>
                    </button>
                  </div>
                  <p v-if="errors.confirm_password || formData.password !== formData.confirm_password" class="mt-1 text-sm text-red-600">{{ errors.confirm_password || 'Password tidak sama atau cocok' }}</p>
                </div>
              </div>
              <!-- Section 13: Photo -->
              <div class="space-y-1">
                <label class="block text-sm font-medium text-gray-700">Photo</label>
                <InputFile
                  label_status="false"
                  id="photo-upload"
                  :error="errors.photo"
                  @file-selected="handleFileUpload"
                  accept=".jpg,.jpeg,.png"
                  >
                </InputFile>
              </div>
              <div>
                <div v-if="photoPreviewUrl">
                  <h2 class="text-sm font-medium text-gray-700">Preview Foto</h2>
                  <img
                  v-if="photoPreviewUrl"
                  :src="photoPreviewUrl"
                  alt="photo"
                  class="h-auto w-32 object-cover rounded-md"
                  />
                </div>
              </div>
            </div>
          </div>
          <div class="pb-2 pt-4 sm:flex sm:flex-row-reverse sm:px-0 gap-2">
            <PrimaryButton @click="saveData()">TAMBAH JAMAAH</PrimaryButton>
            <button
              @click="emit('close')"
              class="mt-3 inline-flex w-full justify-center rounded-md border border-gray-400 bg-gray-200 px-4 py-2 text-base font-medium text-gray-800 shadow-sm hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            >
              BATAL
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>

    <!-- Notification -->
  <Notification
    :showNotification="showNotification"
    :notificationType="notificationType"
    :notificationMessage="notificationMessage"
    @close="showNotification = false"
  />
</template>
