<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { pembayaranPerbulan } from '@/service/daftar_pinjaman'
import Form from '@/components/Modal/Form.vue'
import InputText from '@/components/Form/InputText.vue'
import axios from 'axios'

interface Riwayat {
  status: string
  jumlah: number
  tanggal: string
}

interface PeminjamanData {
  id: number
  riwayat_pembayaran: Riwayat[]
}

const props = defineProps<{peminjaman: PeminjamanData,isOpen: boolean}>()
const emit = defineEmits(['close', 'success'])
const nominal = ref<number>(0)
const loading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const term = computed(() => {
  return props.peminjaman.riwayat_pembayaran?.filter((p) => p.status === 'cicilan').length + 1
})

// Format ke IDR
const formatToRupiah = (value: number) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value)
}

const formattedNominal = computed({
  get: () => formatToRupiah(nominal.value),
  set: (val: string) => onFormattedInput({ target: { value: val } } as any),
})

const onFormattedInput = (e: { target: { value: string } }) => {
  const numeric = parseInt(e.target.value.replace(/[^\d]/g, '')) || 0
  nominal.value = numeric
}

const emitClose = () => emit('close')
const emitSuccess = () => emit('success')

const handleSubmit = async () => {
  try {
    loading.value = true
    const formData = {
      peminjaman_id: props.peminjaman.id,
      nominal: nominal.value,
    }

    const result = await pembayaranPerbulan(formData)
    const invoiceUrl = `/invoice-pembayaran/${result.invoice}`
    window.open(invoiceUrl, '_blank')

    emitSuccess()
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      errorMessage.value = error.response.data.message || 'Terjadi kesalahan.'
    } else {
      errorMessage.value = (error as Error).message
    }
  } finally {
    loading.value = false
  }
}

watch(
  () => props.isOpen,
  (val) => {
    if (val) {
      nominal.value = 0
      errorMessage.value = ''
      successMessage.value = ''
    }
  },
)
</script>

<template>
  <Form :formStatus="isOpen" :label="'Pembayaran Bulanan'" :submitLabel="'Bayar'" :width="'w-full max-w-md'" @submit="handleSubmit" @cancel="emitClose" >
    <!-- Term sebagai readonly -->
    <InputText :modelValue="`Pembayaran ke-${term}`" label="Pembayaran ke" readonly />
    <!-- Nominal (Formatted) -->
    <InputText v-model="formattedNominal" label="Nominal" :disabled="loading" @update:modelValue="onFormattedInput" />
    <!-- Error & Success Message -->
    <p v-if="errorMessage" class="text-sm text-red-500 mt-2">{{ errorMessage }}</p>
    <p v-if="successMessage" class="text-sm text-green-600 mt-2">{{ successMessage }}</p>
  </Form>
</template>
