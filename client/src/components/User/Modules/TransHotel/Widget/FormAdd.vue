<script lang="ts" setup>
import { ref, onMounted, watch, computed } from 'vue'
import FormEditProfile from '@/components/Modal/FormEditProfile.vue'
import InputText from '@/components/Form/InputText.vue'
import InputDate from '@/components/Form/InputDate.vue'
import Form from '@/components/Modal/Form.vue'
import SelectField from '@/components/Form/SelectField.vue'
import InputCurrency from '@/components/Form/InputCurrency.vue'
import TextArea from '@/components/Form/TextArea.vue'
import Notification from '@/components/Modal/Notification.vue'
import PrimaryButton from '@/components/Button/PrimaryButton.vue'
import DangerButton from '@/components/Button/DangerButton.vue'
import DeleteIcon from '@/components/Icons/DeleteIcon.vue'
import { paramCabang } from '@/service/param_cabang'
import { daftar_kostumer, get_jenis_visa, getSumberDanaPaket, addVisaUrl } from '@/service/transaksi_visa'
import { get_jenis_hotel, addHotelUrl } from '@/service/transaksi_hotel'

const props = defineProps<{ formStatus: boolean }>()
const emit = defineEmits(['cancel', 'submitted'])

interface option {
  id: number
  name: string
}

const errors = ref<Record<string, string>>({})

function reset() {
  errors.value = {}
  list_cabang.value = [{ id: 0, name: ' -- Pilih Cabang -- ' }];
  list_hotel.value = [{ id: 0, name: ' -- Pilih Daftar Hotel -- ' }];
  list_sumber_dana.value = [{ id: 0, name: ' -- Pilih Sumber Dana -- ' }];
  list_paket.value = [{ id: 0, name: ' -- Pilih Paket -- ' }];
  form.value = {
    cabang: 0,
    sumber_dana: 0,
    mst_hotel_id: 0,
    paket_id: 0,
    kostumer_id: 0,
    check_in: '',
    check_out: '',
    tipe_kamar: '',
    jumlah_hari: 0,
    jumlah_kamar: 0,
    harga_travel_kamar_per_hari: 0,
    harga_kostumer_kamar_per_hari: 0
  }
}

function handleCancel() {
  emit('cancel')
  reset();
}

const validateForm = (): boolean => {
  let isValid = true

  // Reset errors
  errors.value = {};

  if( form.value.cabang == 0 ) {
    // validasi cabang
    if (form.value.cabang == 0) {
      errors.value.cabang = 'Cabang wajib dipilih'
      isValid = false
    }
  }

  // Validate customer fields
  if ((!form.value.kostumer_id || form.value.kostumer_id === 0 ) && ( !form.value.paket_id || form.value.paket_id === 0 ) ) {
    errors.value.kostumer_paket = 'Kostumer atau paket wajib dipilih'
    isValid = false
  }

  if (form.value.mst_hotel_id == 0) {
    errors.value.mst_hotel_id = 'Daftar hotel wajib dipilih'
    isValid = false
  }

  if( form.value.check_in == '') {
    errors.value.check_in = 'Check in wajib diisi';
    isValid = false
  }

  if( form.value.check_out == '') {
    errors.value.check_out = 'Check out wajib diisi';
    isValid = false
  }

  if( form.value.tipe_kamar == '') {
    errors.value.tipe_kamar = 'Tipe kamar wajib diisi';
    isValid = false
  }

  if( form.value.jumlah_hari == 0) {
    errors.value.jumlah_hari = 'Jumlah hari wajib diisi';
    isValid = false
  }

  if( form.value.jumlah_kamar == 0) {
    errors.value.jumlah_kamar = 'Jumlah kamar wajib diisi';
    isValid = false
  }

  if( form.value.harga_travel_kamar_per_hari == 0) {
    errors.value.harga_travel_kamar_per_hari = 'Harga travel kamar per hari wajib diisi';
    isValid = false
  }

  if( form.value.harga_kostumer_kamar_per_hari == 0) {
    errors.value.harga_kostumer_kamar_per_hari = 'Harga kostumer kamar per hari wajib diisi';
    isValid = false
  }

  return isValid
}


async function handleSubmit() {
  if (!validateForm()) {
    return
  }

  try {
    const payload = {
      cabang: form.value.cabang,
      sumber_dana: form.value.sumber_dana,
      kostumer: form.value.kostumer_id,
      paket: form.value.paket_id,
      mst_hotel_id: form.value.mst_hotel_id,
      check_in: form.value.check_in,
      check_out: form.value.check_out,
      tipe_kamar: form.value.tipe_kamar,
      jumlah_hari: form.value.jumlah_hari,
      jumlah_kamar: form.value.jumlah_kamar,
      harga_travel_kamar_per_hari: form.value.harga_travel_kamar_per_hari,
      harga_kostumer_kamar_per_hari: form.value.harga_kostumer_kamar_per_hari
    }

    const response = await addHotelUrl(payload);
    openCetakKwitansi(response.invoice);
    emit('submitted');
    reset();
    displayNotification('Transaksi hotel berhasil dilakukan', 'success');
  } catch (error : any) {
    displayNotification(error.response.data.message, 'error');
  }
}

interface FormData {
  cabang:number
  sumber_dana:number
  mst_hotel_id: number
  paket_id:number
  kostumer_id: number
  check_in: string
  check_out: string
  tipe_kamar: string
  jumlah_hari: number
  jumlah_kamar: number
  harga_travel_kamar_per_hari: number
  harga_kostumer_kamar_per_hari: number
}

// Data form yang akan ditampilkan
const form = ref<FormData>({
  cabang: 0,
  sumber_dana: 0,
  mst_hotel_id: 0,
  paket_id: 0,
  kostumer_id: 0,
  check_in: '',
  check_out: '',
  tipe_kamar: '',
  jumlah_hari: 0,
  jumlah_kamar: 0,
  harga_travel_kamar_per_hari: 0,
  harga_kostumer_kamar_per_hari: 0
})

// mengambil daftar kostumer
const list_kostumer = ref<option[]>([{ id: 0, name: ' -- Pilih Kostumer -- ' }])
const fetchCustomer = async () => {
  try {
    const response = await daftar_kostumer()
    list_kostumer.value = [{ id: 0, name: ' -- Pilih Kostumer -- ' }, ...response]
  } catch (error) {
    console.error(error)
  }
}

// mengambil daftar paket
const list_paket = ref<option[]>([{ id: 0, name: ' -- Pilih Paket -- ' }]) // Tambahkan opsi default
const list_sumber_dana = ref<option[]>([{ id: 0, name: ' -- Pilih Sumber Dana -- ' }])
const fetchSumberDanaPaket = async () => {
  try {
    if( form.value.cabang != 0) {
      const response = await getSumberDanaPaket({ cabang: form.value.cabang })
      list_paket.value = [{ id: 0, name: ' -- Pilih Paket -- ' }, ...response.data.daftar_paket] ;
      list_sumber_dana.value = response.data.sumber_dana;
    }else{
      list_paket.value = [{ id: 0, name: ' -- Pilih Paket -- ' }]
      list_sumber_dana.value = [{ id: 0, name: ' -- Pilih Sumber Dana -- ' }];
    }
  } catch (error) {
    console.error(error)
  }
}

// mengambil daftar cabang
const list_cabang = ref<option[]>([{ id: 0, name: ' -- Pilih Cabang -- ' }])
const fetchCabang = async () => {
  try {
    const response = await paramCabang()
    list_cabang.value = [{ id: 0, name: ' -- Pilih Cabang -- ' }, ...response.data]
  } catch (error) {
    console.error(error)
  }
}

// mengambil jenis hotel
const list_hotel = ref<option[]>([{ id: 0, name: ' -- Pilih Daftar Hotel -- ' }])
const fetchDaftarHotel = async () => {
  try {
    const response = await get_jenis_hotel()
    list_hotel.value = [{ id: 0, name: ' -- Pilih Daftar Hotel -- ' }, ...response];
  } catch (error) {
    console.error(error)
  }
}

const harga_travel_kamar_per_hari = computed({
  get() {
    return form.value.harga_travel_kamar_per_hari
      ? 'Rp ' + form.value.harga_travel_kamar_per_hari.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
      : ''
  },
  set(value: string) {
    const clean = value.replace(/[^\d]/g, '')
    form.value.harga_travel_kamar_per_hari = Number(clean)
  },
});

const harga_kostumer_kamar_per_hari = computed({
  get() {
    return form.value.harga_kostumer_kamar_per_hari
      ? 'Rp ' + form.value.harga_kostumer_kamar_per_hari.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
      : ''
  },
  set(value: string) {
    const clean = value.replace(/[^\d]/g, '')
    form.value.harga_kostumer_kamar_per_hari = Number(clean)
  },
});

const total = computed(() => {
  return  form.value.jumlah_hari * form.value.jumlah_kamar  * form.value.harga_kostumer_kamar_per_hari;
})

const formatRupiah = (value: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(value)
}

const showNotification = ref(false)
const notificationMessage = ref('')
const notificationType = ref<'success' | 'error'>('success')
const timeoutId = ref<number | null>(null)
const displayNotification = (message: string, type: 'success' | 'error' = 'success') => {
  notificationMessage.value = message
  notificationType.value = type
  showNotification.value = true
  if (timeoutId.value) clearTimeout(timeoutId.value)
  timeoutId.value = window.setTimeout(() => {
    showNotification.value = false
  }, 3000)
}

const openCetakKwitansi = (invoice: string) => {
  console.log('Invoice to print:', invoice) // Debug log
  const url = `/kwitansi-trans-hotel/${invoice}`
  window.open(url, '_blank')
}

watch(
  () => props.formStatus,
  async (val) => {
    if (val) {
      await fetchCustomer()
      await fetchCabang()
      await fetchDaftarHotel()
    }
  },
)

</script>

<template>
  <Form :formStatus="props.formStatus" :label="'Tambah Transaksi Hotel'" :width="'md:w-1/2 lg:w-1/4'" :submitLabel="'Tambah Transaksi Hotel'" @submit="handleSubmit" @cancel="handleCancel">
    <div class="grid md:grid-cols-4 gap-6 mb-6">
      <!-- Cabang -->
      <SelectField v-model.number="form.cabang" id="cabang" label="Cabang" class="md:col-span-4"  placeholder="Pilih Cabang" :options="list_cabang"  :error="errors.cabang"  @change="fetchSumberDanaPaket" />
      <!-- Sumber Dana -->
      <SelectField v-model.number="form.sumber_dana" id="sumber_dana" label="Sumber  Dana" class="md:col-span-4"  placeholder="Pilih Sumber Dana" :error="errors.sumber_dana" :options="list_sumber_dana" />
      <!-- Kostumer -->
      <SelectField v-model.number="form.kostumer_id" id="kostumer" label="Kostumer" class="md:col-span-4"  placeholder="Pilih Kostumer" :error="errors.kostumer_paket" :options="list_kostumer" />
      <!-- Paket -->
      <SelectField v-model.number="form.paket_id" id="paket" label="Paket" class="md:col-span-4"  placeholder="Pilih Paket" :error="errors.kostumer_paket" :options="list_paket" />
      <!-- Daftar Hotel -->
      <SelectField v-model.number="form.mst_hotel_id" id="hotel" label="Daftar Hotel" class="md:col-span-2"  placeholder="Pilih Daftar hotel" :error="errors.mst_hotel_id" :options="list_hotel" />
      <!-- Tipe Kamar -->
      <InputText v-model="form.tipe_kamar" label="Tipe Kamar" id="tipe_kamar" :error="errors.tipe_kamar" placeholder="Tipe Kamar" class="md:col-span-2"  />
      <!-- Tanggal Check In -->
      <InputDate v-model="form.check_in" label="Check In" id="check_in" :error="errors.check_in" placeholder="Check In" class="md:col-span-2"  />
      <!-- Tanggal Check Out -->
      <InputDate v-model="form.check_out" label="Check Out" id="check_out" :error="errors.check_out" placeholder="Check Out" class="md:col-span-2"  />
      <!-- Jumlah Hari -->
      <InputText v-model.number="form.jumlah_hari" label="Jmlh. Hari" id="jumlah_hari" :error="errors.jumlah_hari" type="number" placeholder="Jumlah Hari" class="md:col-span-2"  />
      <!-- Jumlah Kamar -->
      <InputText v-model.number="form.jumlah_kamar" label="Jmlh. Kamar" id="jumlah_kamar" :error="errors.jumlah_kamar" type="number" placeholder="Jumlah Kamar" class="md:col-span-2"  />
      <!-- Harga Travel Kamar Per Hari -->
      <InputText v-model="harga_travel_kamar_per_hari" label="Harga Travel Per Hari" id="harga_travel_kamar_per_hari" :error="errors.harga_travel_kamar_per_hari" placeholder="Harga Travel Kamar Per Hari" class="md:col-span-2" />
      <!-- Harga Kostumer Kamar Per Hari -->
      <InputText v-model="harga_kostumer_kamar_per_hari" label="Harga Kostumer Per Hari" id="harga_kostumer_kamar_per_hari" :error="errors.harga_kostumer_kamar_per_hari" placeholder="Harga Kostumer Kamar Per Hari" class="md:col-span-2" />
      <!-- Total -->
      <div class="md:col-span-1 mt-0 md:col-span-4">
        <label for="total" class="text-sm font-medium text-gray-700 mb-1">Total Harga</label>
        <div id="total" class="bg-gray-100 text-gray-800 px-3 py-2 mt-1 rounded border border-gray-300">
          {{ formatRupiah(total) }}
        </div>
      </div>
    </div>
  </Form>
  <!-- Notification Popup -->
  <Notification :showNotification="showNotification" :notificationType="notificationType" :notificationMessage="notificationMessage" @closeNotification="showNotification = false" />
</template>
