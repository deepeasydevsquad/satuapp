<script setup lang="ts">
import Form from '@/components/Modal/Form.vue'
import InputText from '@/components/Form/InputText.vue'
import InputDate from '@/components/Form/InputDate.vue'
import { ref, watch, computed } from 'vue'
import { getInfoPembayaranTicketUrl, getAirlinesByIdUrl, editTiketUrl } from '@/service/trans_tiket'
import SelectField from '@/components/Form/SelectField.vue'

const props = defineProps<{
  id: number
  formStatus: boolean
}>()

const emit = defineEmits<{
  (e: 'cancel'): void
  (e: 'submitted'): void
}>()

interface FormData {
  id:number
  nomor_registrasi: string
  kode_booking: string
  maskapai: string
  maskapai_id: number
  pax:number
  dibayar:number
  sudah_bayar:number
  nominal_sisa: number
  harga: number
  harga_travel: number
  tanggal_keberangkatan: string
  total: number
}

const errors = ref<Record<string, string>>({})

const form = ref<FormData>({
  id: props.id,
  nomor_registrasi: '',
  kode_booking: '',
  maskapai_id: 0,
  maskapai: '',
  pax: 0,
  harga: 0,
  harga_travel: 0,
  tanggal_keberangkatan: '',
  total: 0,
  dibayar: 0,
  sudah_bayar: 0,
  nominal_sisa: 0,
})

interface Maskapai {
  id: number
  name: string
}

const list_maskapai = ref<Maskapai[]>([{id: 0, name: ' -- Pilih Maskapai -- '}]);

const formatRupiah = (value: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(value)
}


const validateForm = (): boolean => {
  let isValid = true

  // Reset errors
  errors.value = {};

  if (form.value.kode_booking == '') {
    errors.value.kode_booking = 'Kode booking wajib diisi';
    isValid = false
  }

  if (form.value.maskapai_id == 0) {
    errors.value.maskapai_id = 'Maskapai wajib dipilih';
    isValid = false
  }

  if( form.value.tanggal_keberangkatan == '') {
    errors.value.tanggal_keberangkatan = 'Tanggal Keberangkatan wajib dipilih';
    isValid = false
  }

  if (form.value.harga_travel == 0) {
    errors.value.harga_travel = 'Harga travel wajib diisi atau lebih dari 0';
    isValid = false
  }

  if (form.value.harga == 0) {
    errors.value.harga = 'Harga kostumer wajib diisi atau lebih dari 0';
    isValid = false
  }

  if (form.value.pax == 0) {
    errors.value.pax = 'Pax wajib diisi atau lebih dari 0';
    isValid = false
  }

  if( form.value.sudah_bayar > (form.value.pax * form.value.harga)) {
    errors.value.harga = 'Harga total tidak boleh lebih besar dari sudah bayar';
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
      id: props.id,
      kode_booking: form.value.kode_booking,
      maskapai: form.value.maskapai_id,
      harga_travel : form.value.harga_travel,
      harga_kostumer: form.value.harga,
      pax: form.value.pax,
      tanggal_keberangkatan: form.value.tanggal_keberangkatan
    }
    await editTiketUrl(payload);
    emit('submitted');
    reset();
    displayNotification('Update data tiket berhasil dilakukan.', 'success');
  } catch (error : any) {
    displayNotification(error.response.data.message, 'error');
  }
}

const fetchData = async () => {
  try {

    const response = await getAirlinesByIdUrl({ id: props.id });
    list_maskapai.value = response.data;

    const response2 = await getInfoPembayaranTicketUrl({ id: props.id });
    form.value.id = props.id;
    form.value.nomor_registrasi = response2.data.nomor_registrasi;
    form.value.kode_booking = response2.data.kode_booking;
    form.value.maskapai = response2.data.maskapai;
    form.value.maskapai_id = response2.data.maskapai_id;
    form.value.pax = response2.data.pax;
    form.value.harga = response2.data.harga;
    form.value.tanggal_keberangkatan = response2.data.tanggal_keberangkatan;
    form.value.harga_travel = response2.data.harga_travel;
    form.value.total = response2.data.total;
    form.value.sudah_bayar = response2.data.sudah_bayar;
    form.value.nominal_sisa = response2.data.total - response.data.sudah_bayar;
  } catch (error) {
    console.error(error)
  }
}

function reset() {
  errors.value = {}
  form.value = {
    id: props.id,
    nomor_registrasi: '',
    kode_booking: '',
    maskapai: '',
    maskapai_id: 0,
    pax: 0,
    harga: 0,
    harga_travel: 0,
    tanggal_keberangkatan: '',
    total: 0,
    dibayar: 0,
    sudah_bayar: 0,
    nominal_sisa: 0,
  };
}

function handleCancel() {
  emit('cancel')
  reset();
}

// harga travel
const hargaTravel = computed({
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

// harga kostumer
const hargaKostumer = computed({
  get() {
    return form.value.harga
      ? 'Rp ' + form.value.harga.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
      : ''
  },
  set(value: string) {
    const clean = value.replace(/[^\d]/g, '')
    form.value.harga = Number(clean)
  },
});

// menghitung jumlah total
const calculateTotal = computed(() => {
  return formatRupiah(form.value.pax * form.value.harga);
})

// menghitung sisa
const calculateSisa = computed(() => {
  const total = form.value.pax * form.value.harga;
  const hasilAkhir = total - ( form.value.sudah_bayar  + form.value.dibayar );
  return form.value.pax == 0 ? 0 :  (hasilAkhir < 0 ? 'Pembayaran Berlebih' : formatRupiah(hasilAkhir))
})


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

watch(() => props.formStatus, async () => { await fetchData(); });

</script>

<template>
  <Form :formStatus="props.formStatus" :label="'Form Edit Tiket'" :width="'md:w-1/2 lg:w-1/4'" :submitLabel="'EDIT TIKET'" @submit="handleSubmit" @cancel="handleCancel">
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-0 pr-3">
      <div class="mt-0 md:col-span-2">
        <label for="nomor_registrasi" class="text-sm font-medium text-gray-700 mb-1">Nomor Registrasi</label>
        <div id="nomor_registrasi" class="bg-gray-100 text-gray-800 px-3 py-2 mt-1 rounded border border-gray-300">
          {{ form.id }}
          {{ form.nomor_registrasi }}
        </div>
      </div>
      <InputText class="mt-0 md:col-span-2" label="Kode Booking" id="kode_booking" placeholder="Kode Booking" v-model="form.kode_booking" :error="errors.kode_booking"/>
      <SelectField v-model="form.maskapai_id" label="Maskapai" placeholder="Pilih Maskapai" :options="list_maskapai" class="mt-0 md:col-span-2" />
      <InputDate class="mt-0 md:col-span-2" label="Tanggal Keberangkatan" id="tanggal_keberangkatan" placeholder="Tanggal Keberangkatan" v-model="form.tanggal_keberangkatan" :error="errors.tanggal_keberangkatan"/>
      <InputText class="mt-0 md:col-span-2" label="Harga Travel" id="harga_travel" placeholder="Harga Travel" v-model="hargaTravel" :error="errors.harga_travel"/>
      <InputText class="mt-0 md:col-span-2" label="Harga Kostumer" id="harga_kostumer" placeholder="Harga Kostumer" v-model="hargaKostumer" :error="errors.harga"/>
      <InputText type="number" class="mt-0 md:col-span-1" label="Pax" id="pax" placeholder="Pax" v-model="form.pax" :error="errors.pax"/>
      <div class="md:col-span-1 mt-0 md:col-span-3">
        <label for="total" class="text-sm font-medium text-gray-700 mb-1">Total Harga</label>
        <div id="total" class="bg-gray-100 text-gray-800 px-3 py-2 mt-1 rounded border border-gray-300">
          {{ calculateTotal }}
        </div>
      </div>
      <div class="md:col-span-1 mt-0 md:col-span-2">
        <label for="sudah_bayar" class="text-sm font-medium text-gray-700 mb-1">Sudah Bayar</label>
        <div id="sudah_bayar" class="bg-gray-100 text-gray-800 px-3 py-2 mt-1 rounded border border-gray-300">
          {{ formatRupiah(form.sudah_bayar) }}
        </div>
      </div>
      <div class="md:col-span-1 mt-0 md:col-span-2">
        <label for="sisa" class="text-sm font-medium text-gray-700 mb-1">Sisa Bayar</label>
        <div id="sisa" class="bg-gray-100 text-gray-800 px-3 py-2 mt-1 rounded border border-gray-300">
          {{ calculateSisa }}
        </div>
      </div>
    </div>
  </Form>
</template>
