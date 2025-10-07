<script setup lang="ts">
import Form from '@/components/Modal/Form.vue'
import InputText from '@/components/Form/InputText.vue'
import SelectField from '@/components/Form/SelectField.vue'
import { computed, onMounted, ref, watch } from 'vue'
import { mst_bank, update, by_id } from '@/service/akun_bank'

const emit = defineEmits(['close', 'success'])
const props = defineProps<{
  ModalUpdate: boolean
  id: number
}>()

interface bank {
  id: number
  kode: string
  nama: string
}

const fetch_akun = async () => {
  const response = await by_id({ id: props.id })
  form.value.mst_bank_id = response.data.mst_bank_id
  form.value.nomor_akun = response.data.nomor_akun
  form.value.nama_akun = response.data.nama_akun
}

const bank = ref<bank[]>([])

const daftar_bank = async () => {
  const response = await mst_bank()
  bank.value = [
    { id: -1, name: '-- Pilih bank --' }, // ini placeholder-nya
    ...response.data,
  ]
  console.log('bank value', bank.value)
}

const form = ref({
  id: props.id,
  mst_bank_id: -1,
  nomor_akun: '',
  nama_akun: '',
})

const handleSubmit = async () => {
  console.log('submit')
  try {
    const response = await update(form.value)
    emit('success')
  } catch (error) {
    console.error('Gagal menyimpan data member:', error)
  }
}

const reset_form = () => {
  form.value = {
    id: props.id,
    mst_bank_id: -1,
    nomor_akun: '',
    nama_akun: '',
  }
}

onMounted(() => {
  daftar_bank()
  fetch_akun()
})
</script>

<template>
  <Form
    :formStatus="ModalUpdate"
    :label="' Tambah Akun Bank'"
    :width="'w-full max-w-md'"
    :submitLabel="'Update Bank'"
    @cancel="(emit('close'), reset_form)"
    @submit="handleSubmit"
  >
    <SelectField
      v-model="form.mst_bank_id"
      label="Bank"
      placeholder="Pilih bank"
      class="mt-4"
      :options="bank"
      optionLabel="nama"
      optionValue="id"
    />

    <InputText
      v-model="form.nomor_akun"
      label="Nomor Akun"
      placeholder="Masukkan nomor akun"
      class="mt-4"
      required
    />
    <InputText
      v-model="form.nama_akun"
      label="Nama Akun"
      placeholder="Masukkan nama akun"
      class="mt-4"
      required
    />
  </Form>
</template>
