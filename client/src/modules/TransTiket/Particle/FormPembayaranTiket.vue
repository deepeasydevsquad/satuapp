<script setup lang="ts">
import Form from '@/components/Modal/Form.vue'
import Notification from '@/components/Modal/Notification.vue'
import InputCurrency from '@/components/Form/InputCurrency.vue'
import { ref, watch, computed } from 'vue'
import { getInfoPembayaranTicketUrl, addPembayaran } from '@/service/trans_tiket'

const props = defineProps<{ formStatus: boolean; id: number }>()

const emit = defineEmits<{
  (e: 'cancel'): void
  (e: 'submitted'): void
}>()

interface FormData {
  id: number
  nomor_registrasi: string
  kode_booking: string
  maskapai: string
  pax: number
  dibayar: number
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
  dibayar: 0,
  sudah_bayar: 0,
  nominal_sisa: 0,
})

const errors = ref<Record<string, string>>({})

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
    dibayar: 0,
    sudah_bayar: 0,
    nominal_sisa: 0,
  }
}

function handleCancel() {
  emit('cancel')
  reset()
}

const validateForm = (): boolean => {
  let isValid = true
  errors.value = {}
  if (form.value.dibayar == 0) {
    errors.value.dibayar = 'Nominal yang akan dibayar tidak boleh 0'
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
      dibayar: form.value.dibayar,
    }

    const response = await addPembayaran(payload)
    displayNotification('Pembayaran berhasil dilakukan', 'success')
    emit('submitted')
    const printUrl = `/invoice-pembayaran-tiket/${response.invoice}`
    window.open(printUrl, '_blank')
  } catch (error) {
    displayNotification(error.response.data.message, 'error')
  }
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

const calculateSisa = computed(() => {
  const total = form.value.pax * form.value.harga
  const hasilAkhir = total - (form.value.sudah_bayar + form.value.dibayar)
  return hasilAkhir < 0 ? 'Pembayaran Berlebih' : hasilAkhir
})

watch(
  () => props.formStatus,
  () => {
    fetchData()
  },
)
</script>
<template>
  <Form
    :form-status="formStatus"
    :label="'Pembayaran Tiket'"
    :submitLabel="'BAYAR'"
    :width="'w-1/4'"
    @close="handleCancel"
    @cancel="handleCancel"
    @submit="handleSubmit"
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
      <InputCurrency
        class="mt-0 md:col-span-2"
        label="Nominal Bayar"
        id="nominal"
        placeholder="Nominal Bayar"
        v-model="form.dibayar"
        :error="errors.dibayar"
      />
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
      <div class="md:col-span-2 mt-0">
        <label for="sisa" class="text-sm font-medium text-gray-700 mb-1">Sisa</label>
        <div
          id="sisa"
          class="text-gray-800 px-3 py-2 mt-1 rounded border"
          :class="
            typeof calculateSisa != 'number'
              ? 'text-red italic bg-red-100 border-red-300'
              : ' bg-gray-100 border-gray-300'
          "
        >
          {{ typeof calculateSisa == 'number' ? formatRupiah(calculateSisa) : calculateSisa }}
        </div>
      </div>
    </div>
  </Form>
  <Notification
    :showNotification="showNotification"
    :notificationType="notificationType"
    :notificationMessage="notificationMessage"
    @close="showNotification = false"
  />
</template>
