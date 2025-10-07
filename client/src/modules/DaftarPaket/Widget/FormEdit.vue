<script setup lang="ts">
import Notification from '@/modules/DaftarPaket/Particle/Notification.vue';
import Confirmation from '@/modules/DaftarPaket/Particle/Confirmation.vue';
import SearchableSelect from '@/modules/DaftarPaket/Particle/SearchableSelect.vue';
import SearchableCheckboxList from '@/modules/DaftarPaket/Particle/SearchableCheckboxList.vue';
import { onMounted, reactive, ref } from 'vue';
import { getPaket, editPaket } from '@/service/daftar_paket';

import PrimaryButton from '@/components/Button/PrimaryButton.vue';

import {
  daftarKota,
  daftarAirlines,
  daftarAsuransi,
  daftarHotel,
  daftarBandara,
  daftarTipePaket,
  daftarFasilitas,
  daftarProviderVisa,
} from '@/service/data_master';

import { paramCabang } from '@/service/param_cabang';

const props = defineProps<{
  isFormOpen: boolean;
  paketId: number;
  cabangId: number;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'status', payload: { error: boolean; err_msg?: string }): void;
}>();

interface ErrorFields {
  name: string;
  jenis_kegiatan: string;
  description: string;
  departure_date: string;
  return_date: string;
  departure_from: string;
  duration_trip: string;
  mahram_fee: string;
  quota_jamaah: string;
  city_visited: string;
  airlines: string;
  hotel: string;
  facilities: string;
  show_homepage: string;
  airport_destination: string;
  airport_departure: string;
  departure_time: string;
  arrival_time: string;
  provider_visa_id: string;
  asuransi_id: string;
  no_polis: string;
  tgl_input_polis: string;
  tgl_awal_polis: string;
  tgl_akhir_polis: string;
  paket_types: string;
}

interface Kota {
  id: number;
  kode: string;
  name: string;
}
interface Airlines {
  id: number;
  name: string;
}
interface Asuransi {
  id: number;
  name: string;
}
interface Hotel {
  id: number;
  name: string;
}
interface Bandara {
  id: number;
  name: string;
}
interface TipePaket {
  id: number;
  name: string;
}
interface Fasilitas {
  id: number;
  name: string;
}
interface ProviderVisa {
  id: number;
  name: string;
}

interface Cabang {
  id: number;
  name: string;
}

// Data from API
const cabangList = ref<Cabang[]>([]);
const paketList = ref<any[]>([]); // Ganti any dengan tipe data yang sesuai
const kotaList = ref<Kota[]>([]);
const airlinesList = ref<Airlines[]>([]);
const asuransiList = ref<Asuransi[]>([]);
const hotelList = ref<Hotel[]>([]);
const bandaraList = ref<Bandara[]>([]);
const tipePaketList = ref<TipePaket[]>([]);
const fasilitasList = ref<Fasilitas[]>([]);
const providerVisaList = ref<ProviderVisa[]>([]);

// notification, confirmation, error
const showConfirmDialog = ref(false);
const confirmMessage = ref('');
const confirmTitle = ref('');
const confirmAction = ref<(() => void) | null>(null);
const showNotification = ref(false);
const notificationMessage = ref('');
const notificationType = ref('');
const timeoutId = ref<number | null>(null);
const errors = ref<ErrorFields>({
  name: '',
  jenis_kegiatan: '',
  description: '',
  departure_date: '',
  return_date: '',
  departure_from: '',
  duration_trip: '',
  mahram_fee: '',
  quota_jamaah: '',
  city_visited: '',
  airlines: '',
  hotel: '',
  facilities: '',
  show_homepage: '',
  airport_destination: '',
  airport_departure: '',
  departure_time: '',
  arrival_time: '',
  provider_visa_id: '',
  asuransi_id: '',
  no_polis: '',
  tgl_input_polis: '',
  tgl_awal_polis: '',
  tgl_akhir_polis: '',
  paket_types: '',
});

// Form reactive
const form = reactive({
  division_id: props.cabangId,
  jenis_kegiatan: '',
  photo: null as File | null, // <-- photo diubah jadi File | null
  name: '',
  description: '',
  departure_date: '',
  return_date: '',
  departure_from: '',
  duration_trip: '',
  mahram_fee: '',
  quota_jamaah: '',
  city_visited: [] as any[], // Array untuk menyimpan kota yang dikunjungi
  airlines: [] as any[], // Array untuk menyimpan maskapai
  hotel: [] as any[], // Array untuk menyimpan hotel
  facilities: [] as any[], // Array untuk menyimpan fasilitas
  paket_types: [] as any[], // Array untuk menyimpan tipe paket yang dicentang
  paket_prices: {} as Record<number, number>, // Objek untuk menyimpan harga setiap id
  show_homepage: '',
  airport_destination: '',
  airport_departure: '',
  departure_time: '',
  arrival_time: '',
  provider_visa_id: '',
  asuransi_id: '',
  no_polis: '',
  tgl_input_polis: '',
  tgl_awal_polis: '',
  tgl_akhir_polis: '',
});

// Notification function
const displayNotification = (message: string, type: 'success' | 'error' = 'success') => {
  notificationMessage.value = message;
  notificationType.value = type;
  showNotification.value = true;

  if (timeoutId.value) clearTimeout(timeoutId.value);

  timeoutId.value = window.setTimeout(() => {
    showNotification.value = false;
  }, 3000);
};

// Handle file upload
const handleFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];

  if (file) {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    const maxSize = 600 * 1024; // 600KB

    if (!allowedTypes.includes(file.type)) {
      displayNotification('Format file tidak didukung. Hanya file .jpg, .jpeg, .png.', 'error');
      target.value = '';
      form.photo = null;
      return;
    }

    if (file.size > maxSize) {
      displayNotification('Ukuran file melebihi 600KB.', 'error');
      target.value = '';
      form.photo = null;
      return;
    }

    form.photo = file;
  }
};

const fetchData = async () => {
  if (!props.paketId || !props.cabangId) {
    displayNotification(
      'ID paket atau cabang tidak ditemukan, silakan keluar dan masuk kembali.',
      'error',
    );
    return;
  }
  console.log('Fetching data...');
  console.log('Paket ID:', props.paketId);

  const [
    cabang,
    paket,
    kota,
    airlines,
    asuransi,
    hotel,
    bandara,
    tipePaket,
    fasilitas,
    providerVisa,
  ] = await Promise.all([
    paramCabang(),
    getPaket(props.paketId, props.cabangId),
    daftarKota(),
    daftarAirlines(),
    daftarAsuransi(),
    daftarHotel(),
    daftarBandara(),
    daftarTipePaket(),
    daftarFasilitas(),
    daftarProviderVisa(),
  ]);

  if (paket.error) {
    displayNotification('Gagal mengambil data paket', 'error');
    return;
  }
  cabangList.value = cabang.data;
  paketList.value = paket.data;
  kotaList.value = kota.data;
  airlinesList.value = airlines.data;
  asuransiList.value = asuransi.data;
  hotelList.value = hotel.data;
  bandaraList.value = bandara.data;
  tipePaketList.value = tipePaket.data;
  fasilitasList.value = fasilitas.data;
  providerVisaList.value = providerVisa.data;

  if (paketList.value.length > 0) {
    const paketData = paketList.value[0];
    Object.assign(form, paketData);

    if (paketData.city_visited) {
      form.city_visited = paketData.city_visited.map((item: any) => item.id);
    }

    if (paketData.airlines) {
      form.airlines = paketData.airlines.map((item: any) => item.id);
    }

    if (paketData.hotel) {
      form.hotel = paketData.hotel.map((item: any) => item.id);
    }

    if (paketData.facilities) {
      form.facilities = paketData.facilities.map((item: any) => item.id);
    }

    if (paketData.mahram_fee) {
      form.mahram_fee = formatPrice(paketData.mahram_fee);
    }
  }

  console.log('Data fetched successfully');
  console.log('City Visited:', form.city_visited);
  console.log('Airlines:', form.airlines);
  console.log('Hotel:', form.hotel);
  console.log('Facilities:', form.facilities);

  // Debugging
  console.log('Paket List:', paketList.value);
  console.log('Kota List:', kotaList.value);
  console.log('Airlines List:', airlinesList.value);
  console.log('Asuransi List:', asuransiList.value);
  console.log('Hotel List:', hotelList.value);
  console.log('Bandara List:', bandaraList.value);
  console.log('Tipe Paket List:', tipePaketList.value);
  console.log('Fasilitas List:', fasilitasList.value);
  console.log('Provider Visa List:', providerVisaList.value);
};

onMounted(() => {
  fetchData();
});

const validateForm = (): boolean => {
  errors.value = {
    name: '',
    jenis_kegiatan: '',
    description: '',
    departure_date: '',
    return_date: '',
    departure_from: '',
    duration_trip: '',
    mahram_fee: '',
    quota_jamaah: '',
    city_visited: '',
    airlines: '',
    hotel: '',
    facilities: '',
    show_homepage: '',
    airport_destination: '',
    airport_departure: '',
    departure_time: '',
    arrival_time: '',
    provider_visa_id: '',
    asuransi_id: '',
    no_polis: '',
    tgl_input_polis: '',
    tgl_awal_polis: '',
    tgl_akhir_polis: '',
    paket_types: '',
  };
  let isValid = true;

  if (!props.paketId || !props.cabangId) {
    displayNotification(
      'ID paket atau cabang tidak ditemukan, silakan keluar dan masuk kembali.',
      'error',
    );
    return false;
  }

  if (!form.name) {
    errors.value.name = 'Nama paket tidak boleh kosong.';
    isValid = false;
  }

  if (!form.jenis_kegiatan) {
    errors.value.jenis_kegiatan = 'Jenis kegiatan tidak boleh kosong.';
    isValid = false;
  }

  if (!form.description) {
    errors.value.description = 'Deskripsi paket tidak boleh kosong.';
    isValid = false;
  }

  if (!form.departure_date) {
    errors.value.departure_date = 'Tanggal keberangkatan tidak boleh kosong.';
    isValid = false;
  }

  if (!form.return_date) {
    errors.value.return_date = 'Tanggal kembali tidak boleh kosong.';
    isValid = false;
  }

  if (!form.departure_from) {
    errors.value.departure_from = 'Kota keberangkatan tidak boleh kosong.';
    isValid = false;
  }

  if (!form.mahram_fee) {
    errors.value.mahram_fee = 'Biaya mahram tidak boleh kosong.';
    isValid = false;
  }

  if (!form.quota_jamaah) {
    errors.value.quota_jamaah = 'Kuota jamaah tidak boleh kosong.';
    isValid = false;
  }

  if (!form.city_visited || !form.city_visited.length) {
    errors.value.city_visited = 'Kota yang dikunjungi tidak boleh kosong.';
    isValid = false;
  }

  if (!form.airlines || !form.airlines.length) {
    errors.value.airlines = 'Maskapai tidak boleh kosong.';
    isValid = false;
  }

  if (!form.hotel || !form.hotel.length) {
    errors.value.hotel = 'Hotel tidak boleh kosong.';
    isValid = false;
  }

  if (!form.facilities || !form.facilities.length) {
    errors.value.facilities = 'Fasilitas tidak boleh kosong.';
    isValid = false;
  }

  if (!form.airport_destination) {
    errors.value.airport_destination = 'Bandara tujuan tidak boleh kosong.';
    isValid = false;
  }

  if (!form.airport_departure) {
    errors.value.airport_departure = 'Bandara keberangkatan tidak boleh kosong.';
    isValid = false;
  }

  if (!form.departure_time) {
    errors.value.departure_time = 'Waktu keberangkatan tidak boleh kosong.';
    isValid = false;
  }

  if (!form.arrival_time) {
    errors.value.arrival_time = 'Waktu kedatangan tidak boleh kosong.';
    isValid = false;
  }

  if (!form.provider_visa_id) {
    errors.value.provider_visa_id = 'Provider visa tidak boleh kosong.';
    isValid = false;
  }

  if (!form.asuransi_id) {
    errors.value.asuransi_id = 'Asuransi tidak boleh kosong.';
    isValid = false;
  }

  if (!form.no_polis) {
    errors.value.no_polis = 'Nomor polis tidak boleh kosong.';
    isValid = false;
  }

  if (!form.tgl_input_polis) {
    errors.value.tgl_input_polis = 'Tanggal input polis tidak boleh kosong.';
    isValid = false;
  }

  if (!form.tgl_awal_polis) {
    errors.value.tgl_awal_polis = 'Tanggal awal polis tidak boleh kosong.';
    isValid = false;
  }

  if (!form.tgl_akhir_polis) {
    errors.value.tgl_akhir_polis = 'Tanggal akhir polis tidak boleh kosong.';
    isValid = false;
  }

  if (!form.paket_types || !form.paket_types.length) {
    errors.value.paket_types = 'Tipe paket tidak boleh kosong.';
    isValid = false;
  }

  return isValid;
};

const saveData = async () => {
  try {
    if (!validateForm()) {
      displayNotification('Tolong lengkapi form dengan benar.', 'error');
      return;
    }

    console.log('Form data:', form);

    const formData = new FormData();

    // Menambahkan data form lainnya
    Object.entries(form).forEach(([key, value]) => {
      if (value !== null && value !== '') {
        if (key !== 'photo' && key !== 'paket_prices') {
          // photo & paket_prices sudah ditangani manual
          if (key === 'mahram_fee') {
            formData.append(key, unformatPrice(value));
          } else if (
            ['city_visited', 'airlines', 'hotel', 'facilities', 'paket_types'].includes(key)
          ) {
            if (Array.isArray(value) && value.length > 0) {
              formData.append(key, JSON.stringify(value));
            }
          } else {
            formData.append(key, value);
          }
        }
      }
    });

    if (form.paket_prices && typeof form.paket_prices === 'object') {
      const pricesArray = Object.entries(form.paket_prices).map(([id, price]) => ({
        id: Number(id),
        price: Number(price),
      }));
      formData.append('paket_prices', JSON.stringify(pricesArray));
    }

    // Jika ada file baru, ganti fotonya; jika tidak, biarkan foto yang lama
    if (form.photo instanceof File) {
      formData.append('photo', form.photo);
    }

    // Debug isi formData (optional, bisa dihapus saat production)
    for (let [key, value] of formData.entries()) {
      console.log(`${key}:`, value);
    }

    const response = await editPaket(props.paketId, Object.fromEntries(formData));

    emit('close');
    emit('status', { error: false, err_msg: response.error_msg || 'Paket berhasil di update' });
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
        'error',
      );
    }
  }
};

// Fungsi format harga (Rp, titik ribuan)
const formatPrice = (value: number | string): string => {
  const numericString = String(value).replace(/[^\d]/g, '');
  const numericValue = parseInt(numericString, 10) || 0;

  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(numericValue);
};

// Fungsi untuk ambil angka asli (unformat Rp)
const unformatPrice = (formatted: string): number => {
  return parseInt(formatted.replace(/[^\d]/g, ''), 10) || 0;
};

// Fungsi saat input harga
const onPriceInput = (event: Event, id: number) => {
  const target = event.target as HTMLInputElement;
  const rawValue = target.value;

  // Simpan harga numerik ke form
  form.paket_prices[id] = unformatPrice(rawValue);

  // Format ulang tampilan input
  target.value = formatPrice(form.paket_prices[id]);
};
</script>

<template>
  <!-- FORM START -->
  <div v-if="props.isFormOpen" class="bg-white p-2 rounded-lg">
    <form @submit.prevent="saveData">
      <!-- Halaman Atas -->
      <div class="grid grid-cols-2 gap-4 text-gray-500 md:grid-cols-[minmax(0,_1fr)_500px]">
        <div>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-gray-800">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1"> Photo </label>
              <div
                class="flex items-center border border-gray-300 rounded-lg shadow-sm focus-within:ring-1 focus-within:ring-blue-500 focus-within:border-blue-500"
              >
                <label
                  for="file-upload"
                  class="px-3 py-2 bg-gray-100 text-gray-700 border-gray-300 rounded-l-lg cursor-pointer hover:bg-gray-200 text-sm shrink-0 transition duration-150 ease-in-out"
                >
                  Pilih File
                </label>
                <input
                  type="file"
                  id="file-upload"
                  class="hidden"
                  @change="handleFileUpload"
                  accept=".jpg, .jpeg, .png"
                />
                <span class="ml-3 text-sm text-gray-500 truncate max-w-[175px]">
                  {{ form.photo ? form.photo.name : 'Tidak ada file yang dipilih' }}
                </span>
                <button
                  type="button"
                  class="px-3 py-2 bg-red-400 text-white border-red-300 rounded-r-lg cursor-pointer hover:bg-red-600 text-sm shrink-0 transition duration-150 ease-in-out ml-auto"
                  @click="form.photo = null"
                  for="file-upload"
                >
                  <font-awesome-icon icon="fa-solid fa-image" class="mr-0" />
                </button>
              </div>
              <small class="text-gray-400">Ukuran Maksimum 600KB (Tipe: .jpg, .jpeg, .png)</small>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1"
                >Cabang<span class="text-red-500">*</span></label
              >
              <select
                v-model="form.division_id"
                class="w-full border-gray-300 placeholder:text-gray-500 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
              >
                <option v-for="cabang in cabangList" :value="cabang.id" :key="cabang.id">
                  {{ cabang.name }}
                </option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Nama Paket <span class="text-red-500">*</span>
              </label>
              <input
                type="text"
                v-model="form.name"
                class="w-full border-gray-300 placeholder:text-gray-500 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="Nama Paket"
              />
              <p v-if="errors.name" class="mt-1 text-sm text-red-600">{{ errors.name }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1"> Jenis Kegiatan </label>
              <select
                v-model="form.jenis_kegiatan"
                class="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="" disabled>Pilih Jenis Kegiatan</option>
                <option value="haji" selected>Haji</option>
                <option value="umrah">Umrah</option>
                <option value="haji_umrah">Haji dan Umrah</option>
              </select>
              <p v-if="errors.jenis_kegiatan" class="mt-1 text-sm text-red-600">
                {{ errors.jenis_kegiatan }}
              </p>
            </div>

            <div>
              <SearchableSelect
                v-model="form.provider_visa_id"
                :options="providerVisaList"
                label="Provider Visa"
                placeholder="Pilih Provider Visa"
                :error="errors.provider_visa_id"
              />
            </div>

            <div>
              <SearchableSelect
                v-model="form.asuransi_id"
                :options="asuransiList"
                label="Asuransi"
                placeholder="Pilih Asuransi"
                :error="errors.asuransi_id"
              />
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-4 gap-4 text-gray-800 mt-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1"> No Polis </label>
              <input
                type="text"
                v-model="form.no_polis"
                class="w-full border-gray-300 placeholder:text-gray-500 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="No Polis"
              />
              <p v-if="errors.no_polis" class="mt-1 text-sm text-red-600">{{ errors.no_polis }}</p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Tanggal Input Polis
              </label>
              <input
                type="date"
                v-model="form.tgl_input_polis"
                class="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
              <p v-if="errors.tgl_input_polis" class="mt-1 text-sm text-red-600">
                {{ errors.tgl_input_polis }}
              </p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Tanggal Awal Polis
              </label>
              <input
                type="date"
                v-model="form.tgl_awal_polis"
                class="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
              <p v-if="errors.tgl_awal_polis" class="mt-1 text-sm text-red-600">
                {{ errors.tgl_awal_polis }}
              </p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Tanggal Akhir Polis
              </label>
              <input
                type="date"
                v-model="form.tgl_akhir_polis"
                class="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
              <p v-if="errors.tgl_akhir_polis" class="mt-1 text-sm text-red-600">
                {{ errors.tgl_akhir_polis }}
              </p>
            </div>
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1"> Deskripsi Paket </label>
          <textarea
            v-model="form.description"
            class="w-full border-gray-300 placeholder-gray-500 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
            placeholder="Deskripsi Paket"
            rows="9"
            style="resize: none"
          ></textarea>
          <p v-if="errors.description" class="mt-1 text-sm text-red-600">
            {{ errors.description }}
          </p>
        </div>
      </div>

      <!-- Halaman tengah -->
      <div class="grid grid-cols-1 pt-4 text-gray-800 gap-6 md:grid-cols-[0.50fr_1fr]">
        <!-- Kolom 1: Daftar Tipe Paket -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Daftar Tipe Paket</label>
          <div class="space-y-2">
            <template v-for="item in tipePaketList" :key="item.id">
              <div class="flex items-center gap-2">
                <input
                  type="checkbox"
                  :id="`tipe-paket-${item.id}`"
                  :value="{ id: item.id }"
                  v-model="form.paket_types"
                  class="w-4 h-4 rounded-sm border-2 border-gray-400 text-blue-500 focus:ring-blue-500"
                />
                <label :for="`tipe-paket-${item.id}`" class="w-40 text-sm">{{ item.name }}</label>
                <input
                  type="text"
                  :class="`${!form.paket_types.some((type) => type.id === item.id) ? 'opacity-50 cursor-default transition duration-300 ease-in-out' : 'transition duration-300 ease-in-out'} px-2 py-1 flex-1 border border-gray-300 placeholder:text-gray-500 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500`"
                  :value="formatPrice(form.paket_prices?.[item.id] || 0)"
                  :disabled="!form.paket_types.some((type) => type.id === item.id)"
                  @input="onPriceInput($event, item.id)"
                />
              </div>
            </template>
          </div>
        </div>

        <!-- Kolom 2: Form Tengah -->
        <div class="grid grid-cols-9 gap-4">
          <!-- Tanggal -->
          <div class="col-span-3">
            <label class="block text-sm font-medium text-gray-700 mb-1"
              >Tanggal Keberangkatan</label
            >
            <input
              type="date"
              v-model="form.departure_date"
              class="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
            <p v-if="errors.departure_date" class="mt-1 text-sm text-red-600">
              {{ errors.departure_date }}
            </p>
          </div>
          <div class="col-span-3">
            <label class="block text-sm font-medium text-gray-700 mb-1">Tanggal Kepulangan</label>
            <input
              type="date"
              v-model="form.return_date"
              class="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
            <p v-if="errors.return_date" class="mt-1 text-sm text-red-600">
              {{ errors.return_date }}
            </p>
          </div>
          <!-- Biaya Mahram -->
          <div class="col-span-3">
            <label class="block text-sm font-medium text-gray-700 mb-1">Biaya Mahram</label>
            <input
              type="text"
              v-model="form.mahram_fee"
              placeholder="Biaya Mahram"
              class="w-full border-gray-300 placeholder:text-gray-500 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
              @input="form.mahram_fee = formatPrice(form.mahram_fee)"
            />
            <p v-if="errors.mahram_fee" class="mt-1 text-sm text-red-600">
              {{ errors.mahram_fee }}
            </p>
          </div>

          <!-- Quota, Durasi, dan Berangkat Dari -->
          <div class="col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-1">Quota Jamaah</label>
            <input
              type="number"
              v-model="form.quota_jamaah"
              placeholder="Quota Jamaah"
              class="w-full border-gray-300 placeholder:text-gray-500 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
            <p v-if="errors.quota_jamaah" class="mt-1 text-sm text-red-600">
              {{ errors.quota_jamaah }}
            </p>
          </div>
          <div class="col-span-2">
            <SearchableSelect
              v-model="form.departure_from"
              :options="kotaList"
              label="Berangkat Dari"
              placeholder="Pilih Kota"
              :error="errors.departure_from"
            />
          </div>

          <!-- Kolom 3: Fasilitas Paket -->
          <div class="col-span-5">
            <SearchableCheckboxList
              v-model="form.facilities"
              :options="fasilitasList"
              label="Fasilitas Paket"
              :error="errors.facilities"
            />
          </div>
        </div>
      </div>

      <!-- Halaman Bawah -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 text-gray-800 mt-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Tampilkan di Halaman Utama
          </label>
          <div class="flex items-center">
            <input
              type="checkbox"
              v-model="form.show_homepage"
              class="w-4 h-4 rounded-sm border-2 border-gray-400 text-blue-500 focus:ring-blue-500"
              :value="1"
            />
            <span class="text-sm ml-2">Tampilkan</span>
          </div>
        </div>

        <!-- Kolom 1: Maskapai -->
        <div>
          <SearchableCheckboxList
            v-model="form.airlines"
            :options="airlinesList"
            label="Airlines"
            :error="errors.airlines"
          />
        </div>

        <!-- Kolom 2: Hotel -->
        <div>
          <SearchableCheckboxList
            v-model="form.hotel"
            :options="hotelList"
            label="Hotel"
            :error="errors.hotel"
          />
        </div>

        <!-- Kolom 3: Kota yang dikunjungi -->
        <div>
          <SearchableCheckboxList
            v-model="form.city_visited"
            :options="kotaList"
            label="Kota yang dikunjungi"
            :error="errors.city_visited"
          />
        </div>

        <!-- Kolom 4: Bandara Keberangkatan -->
        <div>
          <SearchableSelect
            v-model="form.airport_departure"
            :options="bandaraList"
            label="Bandara Keberangkatan"
            placeholder="Pilih Bandara"
            :error="errors.airport_departure"
          />
        </div>

        <!-- Kolom 5: Bandara Tujuan -->
        <div>
          <SearchableSelect
            v-model="form.airport_destination"
            :options="bandaraList"
            label="Bandara Tujuan"
            placeholder="Pilih Bandara"
            :error="errors.airport_destination"
            required
          />
        </div>

        <!-- Kolom 6: Waktu Keberangkatan -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1"> Waktu Keberangkatan </label>
          <input
            type="datetime-local"
            v-model="form.departure_time"
            class="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
          <p v-if="errors.departure_time" class="mt-1 text-sm text-red-600">
            {{ errors.departure_time }}
          </p>
        </div>

        <!-- Kolom 7: Waktu Kedatangan -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1"> Waktu Kedatangan </label>
          <input
            type="datetime-local"
            v-model="form.arrival_time"
            class="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
          <p v-if="errors.arrival_time" class="mt-1 text-sm text-red-600">
            {{ errors.arrival_time }}
          </p>
        </div>
      </div>

      <div class="flex justify-end mt-6 bg-gray-100 p-2 rounded-lg shadow-sm">
        <button
          type="button"
          @click="$emit('close')"
          class="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors duration-200 mr-3"
        >
          Batal
        </button>
        <PrimaryButton type="submit">UPDATE PAKET</PrimaryButton>
      </div>
    </form>
  </div>
  <!-- FORM END -->

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

  <!-- Notification -->
  <Notification
    :showNotification="showNotification"
    :notificationType="notificationType"
    :notificationMessage="notificationMessage"
    @close="showNotification = false"
  />
</template>
