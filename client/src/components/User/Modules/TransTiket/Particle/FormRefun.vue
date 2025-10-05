<script setup lang="ts">
import Form from '@/components/Modal/FormEditProfile.vue'
import { ref, watch } from 'vue'
import { refundUrl, getInfoPembayaranTicketUrl } from '@/service/trans_tiket'
import InputCurrency from '@/components/Form/InputCurrency.vue'

const props = defineProps<{ id: number; formStatus: boolean }>()
const emit = defineEmits<{ (e: 'cancel'): void; (e: 'submitted'): void }>()
const errors = ref<Record<string, string>>({})

interface FormData {
  id: number
  nomor_registrasi: string
  kode_booking: string
  maskapai: string
  pax: number
  refund: number
  fee: number
  sudah_bayar: number
  nominal_sisa: number
  harga: number
  total: number
}

const form = ref<FormData>({
  id: props.id,
  nomor_registrasi: '',
  kode_booking: '',
  maskapai: '',
  pax: 0,
  harga: 0,
  total: 0,
  refund: 0,
  fee: 0,
  sudah_bayar: 0,
  nominal_sisa: 0,
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

const validateForm = (): boolean => {
  let isValid = true
  errors.value = {}

  const total_dikembalikan = form.value.refund + form.value.fee

  console.log('----ZZZZ')
  console.log(form.value.refund)
  console.log(form.value.fee)
  console.log(form.value.sudah_bayar)
  console.log(total_dikembalikan)
  console.log('----ZZZZ')

  if (form.value.refund == 0) {
    console.log('----ZZZZ----1')
    errors.value.refund = 'Nominal refund tidak boleh 0'
    isValid = false
  }

  if (form.value.total < form.value.refund) {
    console.log('----ZZZZ----2')
    errors.value.refund = 'Nominal refund tidak boleh lebih besar dari total'
    isValid = false
  }

  if (form.value.total > form.value.refund + form.value.fee) {
    console.log('----ZZZZ----3')
    errors.value.refund = 'Nominal refund plus Fee tidak boleh lebih besar dari total'
    isValid = false
  }

  if (form.value.sudah_bayar < form.value.refund) {
    console.log('----ZZZZ----4')
    errors.value.refund = 'Nominal refund tidak boleh lebih besar dari yang sudah dibayarkan'
    isValid = false
  }

  if (form.value.sudah_bayar > form.value.refund + form.value.fee) {
    console.log('----ZZZZ----5')
    errors.value.refund =
      'Nominal refund plus Fee tidak boleh lebih besar dari yang sudah dibayarkan'
    isValid = false
  }

  if (total_dikembalikan != form.value.sudah_bayar) {
    console.log('----ZZZZ----6')
    errors.value.refund = 'Nominal refund ditambah Fee harus sama dengan nominal sudah bayar'
    isValid = false
  }

  return isValid
}

const handleSubmit = async () => {
  if (!validateForm()) {
    return
  }
  try {
    const payload = {
      id: form.value.id,
      refund: form.value.refund,
      fee: form.value.fee,
    }
    const response = await refundUrl(payload)
    displayNotification('Pembayaran berhasil dilakukan', 'success')
    emit('submitted')
    const printUrl = `/invoice-refund-tiket/${response.invoice}`
    window.open(printUrl, '_blank')
    reset()
  } catch (error: any) {
    displayNotification(error.response.data.message, 'error')
  }
}

const reset = () => {
  errors.value = {}
  form.value = {
    id: props.id,
    nomor_registrasi: '',
    kode_booking: '',
    maskapai: '',
    pax: 0,
    harga: 0,
    total: 0,
    refund: 0,
    fee: 0,
    sudah_bayar: 0,
    nominal_sisa: 0,
  }
}

const handleCancle = async () => {
  reset()
  emit('cancel')
}

const fetchData = async () => {
  try {
    const response = await getInfoPembayaranTicketUrl({ id: props.id })
    form.value.id = props.id
    form.value.nomor_registrasi = response.data.nomor_registrasi
    form.value.kode_booking = response.data.kode_booking
    form.value.maskapai = response.data.maskapai
    form.value.pax = response.data.pax
    form.value.harga = response.data.harga
    form.value.total = response.data.total
    form.value.sudah_bayar = response.data.sudah_bayar
    form.value.nominal_sisa = response.data.total - response.data.sudah_bayar
  } catch (error) {
    console.error(error)
  }
}

const formatRupiah = (angka: any, prefix = 'Rp ') => {
  let numberString = angka.toString().replace(/\D/g, ''),
    split = numberString.split(','),
    sisa = split[0].length % 3,
    rupiah = split[0].substr(0, sisa),
    ribuan = split[0].substr(sisa).match(/\d{3}/g)
  if (ribuan) {
    let separator = sisa ? '.' : ''
    rupiah += separator + ribuan.join('.')
  }
  return prefix + (rupiah || '0')
}

watch(
  () => props.formStatus,
  () => {
    fetchData()
  },
)
</script>
<template>
  <Form
    :formStatus="props.formStatus"
    :label="'Form Refund Tiket'"
    :width="'w-1/4'"
    :submitLabel="'REFUND'"
    @submit="handleSubmit"
    @cancel="handleCancle"
  >
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-0 pr-3">
      <div class="mt-0 md:col-span-2">
        <label for="nomor_registrasi" class="text-sm font-medium text-gray-700 mb-1"
          >Nomor Registrasi</label
        >
        <div
          id="nomor_registrasi"
          class="bg-gray-100 text-gray-800 px-3 py-2 mt-1 rounded border border-gray-300"
        >
          {{ form.id }}
          {{ form.nomor_registrasi }}
        </div>
      </div>
      <div class="mt-0 md:col-span-2">
        <label for="kode_booking" class="text-sm font-medium text-gray-700 mb-1"
          >Kode Booking</label
        >
        <div
          id="kode_booking"
          class="bg-gray-100 text-gray-800 px-3 py-2 mt-1 rounded border border-gray-300"
        >
          {{ form.kode_booking }}
        </div>
      </div>
      <div class="md:col-span-4 mt-0 md:col-span-1">
        <label for="maskapai" class="text-sm font-medium text-gray-700 mb-1">Maskapai</label>
        <div
          id="maskapai"
          class="bg-gray-100 text-gray-800 px-3 py-2 mt-1 rounded border border-gray-300"
        >
          {{ form.maskapai }}
        </div>
      </div>
      <div class="md:col-span-1 mt-0 md:col-span-1">
        <label for="pax" class="text-sm font-medium text-gray-700 mb-1">Pax</label>
        <div
          id="pax"
          class="bg-gray-100 text-gray-800 px-3 py-2 mt-1 rounded border border-gray-300"
        >
          {{ form.pax }}
        </div>
      </div>
      <div class="md:col-span-3 mt-0 md:col-span-1">
        <label for="harga" class="text-sm font-medium text-gray-700 mb-1">Harga</label>
        <div
          id="harga"
          class="bg-gray-100 text-gray-800 px-3 py-2 mt-1 rounded border border-gray-300"
        >
          {{ formatRupiah(form.harga) }}
        </div>
      </div>
      <div class="md:col-span-2 mt-0">
        <label for="total" class="text-sm font-medium text-gray-700 mb-1">Total</label>
        <div
          id="total"
          class="bg-gray-100 text-gray-800 px-3 py-2 mt-1 rounded border border-gray-300"
        >
          {{ formatRupiah(form.total) }}
        </div>
      </div>
      <div class="md:col-span-2 mt-0">
        <label for="sudah_bayar" class="text-sm font-medium text-gray-700 mb-1">Sudah Bayar</label>
        <div
          id="sudah_bayar"
          class="bg-gray-100 text-gray-800 px-3 py-2 mt-1 rounded border border-gray-300"
        >
          {{ formatRupiah(form.sudah_bayar) }}
        </div>
      </div>
      <InputCurrency
        class="mt-0 md:col-span-2"
        label="Nominal Refund"
        id="refund"
        placeholder="Nominal Refund"
        v-model="form.refund"
        :error="errors.refund"
      />
      <InputCurrency
        class="mt-0 md:col-span-2"
        label="Nominal Fee"
        id="fee"
        placeholder="Nominal fee"
        v-model="form.fee"
        :error="errors.fee"
      />
    </div>
  </Form>
  <Notification
    :showNotification="showNotification"
    :notificationType="notificationType"
    :notificationMessage="notificationMessage"
    @close="showNotification = false"
  />
</template>
