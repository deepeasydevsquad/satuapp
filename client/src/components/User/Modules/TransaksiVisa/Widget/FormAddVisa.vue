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

// Props & Emit
const props = defineProps<{ formStatus: boolean }>()
const emit = defineEmits(['cancel', 'submitted'])

interface option {
  id: number
  name: string
}

const errors = ref<Record<string, string>>({})

function reset() {
  errors.value = {}
  list_sumber_dana.value = [{ id: 0, name: ' -- Pilih Sumber Dana -- ' }];
  form.value = {
    cabang: 0,
    sumber_dana: 0,
    jenis_visa_id: 0,
    paket_id: 0,
    kostumer_id: 0,
    pax: 0,
    harga_travel:0,
    harga_costumer:0
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

  if (form.value.jenis_visa_id == 0) {
    errors.value.jenis_visa_id = 'Jenis visa wajib dipilih'
    isValid = false
  }

   if (form.value.pax === 0) {
    errors.value.pax = 'Pax tidak boleh lebih kecil dari 1'
    isValid = false
  }

  if ( form.value.harga_travel === 0 ) {
    errors.value.harga_travel = 'Harga travel harus lebih besar dari 0'
    isValid = false
  }

  if ( form.value.harga_costumer === 0 ) {
    errors.value.harga_costumer = 'Harga kostumer harus lebih besar dari 0'
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
      jenis_visa: form.value.jenis_visa_id,
      pax: form.value.pax,
      harga_travel: form.value.harga_travel,
      harga_costumer: form.value.harga_costumer
    }
    const response = await addVisaUrl(payload);
    openCetakKwitansi(response.invoice);
    emit('submitted');
    reset();
    displayNotification('Transaksi Visa berhasil dilakukan.', 'success');
  } catch (error : any) {
    displayNotification(error.response.data.message, 'error');
  }
}

interface FormData {
  cabang:number
  sumber_dana:number
  jenis_visa_id: number
  paket_id:number
  kostumer_id: number
  pax: number
  harga_travel: number
  harga_costumer: number
}

// Data form yang akan ditampilkan
const form = ref<FormData>({
  cabang: 0,
  sumber_dana: 0,
  jenis_visa_id: 0,
  paket_id: 0,
  kostumer_id: 0,
  pax: 0,
  harga_travel:0,
  harga_costumer:0
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
    const response = await getSumberDanaPaket({ cabang: form.value.cabang })
    list_paket.value = [{ id: 0, name: ' -- Pilih Paket -- ' }, ...response.data.daftar_paket] ;
    list_sumber_dana.value = response.data.sumber_dana;
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

// mengambil jenis visa
const list_jenis_visa = ref<option[]>([{ id: 0, name: ' -- Pilih Jenis Visa -- ' }])
const fetchJenisVisa = async () => {
  try {
    const response = await get_jenis_visa()
    list_jenis_visa.value = [{ id: 0, name: ' -- Pilih Jenis Visa -- ' }, ...response.data]
  } catch (error) {
    console.error(error)
  }
}

const harga_travel = computed({
  get() {
    return form.value.harga_travel
      ? 'Rp ' + form.value.harga_travel.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
      : ''
  },
  set(value: string) {
    const clean = value.replace(/[^\d]/g, '')
    form.value.harga_travel = Number(clean)
  },
});

const harga_costumer = computed({
  get() {
    return form.value.harga_costumer
      ? 'Rp ' + form.value.harga_costumer.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
      : ''
  },
  set(value: string) {
    const clean = value.replace(/[^\d]/g, '')
    form.value.harga_costumer = Number(clean)
  },
});

const total = computed(() => {
  return ( form.value.pax ?? 0 ) * (form.value.harga_costumer ?? 0 )
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
  const url = `/cetak-kwitansi-visa/${invoice}`
  window.open(url, '_blank')
}

watch(
  () => props.formStatus,
  async (val) => {
    if (val) {
      await fetchCustomer()
      await fetchCabang()
      await fetchJenisVisa()
    }
  },
)
</script>

<template>
  <Form :formStatus="props.formStatus" :label="'Tambah Transaksi Visa'" :width="'md:w-1/2 lg:w-1/4'" :submitLabel="'Tambah Transaksi Visa'" @submit="handleSubmit" @cancel="handleCancel">
    <div class="grid md:grid-cols-4 gap-6 mb-6">
      <!-- Cabang -->
      <SelectField v-model.number="form.cabang" id="cabang" label="Cabang" class="md:col-span-4"  placeholder="Pilih Cabang" :options="list_cabang"  :error="errors.cabang"  @change="fetchSumberDanaPaket" />
      <!-- Sumber Dana -->
      <SelectField v-model.number="form.sumber_dana" id="sumber_dana" label="Sumber  Dana" class="md:col-span-4"  placeholder="Pilih Sumber Dana" :error="errors.sumber_dana" :options="list_sumber_dana" />
      <!-- Kostumer -->
      <SelectField v-model.number="form.kostumer_id" id="kostumer" label="Kostumer" class="md:col-span-4"  placeholder="Pilih Kostumer" :error="errors.kostumer_paket" :options="list_kostumer" />
      <!-- Paket -->
      <SelectField v-model.number="form.paket_id" id="paket" label="Paket" class="md:col-span-4"  placeholder="Pilih Paket" :error="errors.kostumer_paket" :options="list_paket" />
      <!-- Jenis Visa -->
      <SelectField v-model.number="form.jenis_visa_id" id="jenis_visa" label="Jenis Visa" class="md:col-span-3"  placeholder="Pilih Jenis Visa" :error="errors.jenis_visa_id" :options="list_jenis_visa" />
      <!-- Paket -->
      <InputText v-model.number="form.pax" label="Pax" id="pax"  type="number" :error="errors.pax" placeholder="Pax" class="md:col-span-1"  />
      <!-- Harga Travel -->
      <InputText v-model="harga_travel" label="Harga Travel" id="harga_travel" :error="errors.harga_travel" placeholder="Harga Travel" class="md:col-span-2"  />
      <!-- Harga Costumer -->
      <InputText v-model="harga_costumer" label="Harga Kostumer" id="harga_costumer" :error="errors.harga_costumer" placeholder="Harga Kostumer" class="md:col-span-2"  />
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
