<template>
  <Form
    :formStatus="formtambahsurat"
    :label="'Buat Surat'"
    :width="'w-1/4'"
    :submitLabel="'BUAT SURAT'"
    @submit="submitForm"
    @cancel="
      () => {
        resetForm()
        emit('close')
      }
    "
  >
    <InputText
      v-model="form.nomor_surat"
      label="Nomor Surat"
      placeholder="Contoh: 001/SRT/2025"
      required
    class="mb-3"
    />

    <InputDate v-model="form.tanggal_surat" label="Tanggal" required class="mb-3"/>

    <InputText
      v-model="form.tujuan"
      label="Tujuan"
      placeholder="Contoh: Kemenag, Imigrasi"
      required
      class="mb-3"
    />

    <SelectField v-model="form.tipe_surat" label="Jenis Surat" :options="suratOptions" class="mb-3" />

    <!-- Surat Cuti -->
    <div v-if="form.tipe_surat === 'surat_cuti'">
      <SelectField class="mb-3"
        v-model="form.jamaah_id"
        label="Jamaah"
        :options="[
          { id: '', name: '-- Pilih Jamaah --' },
          ...jamaahList.map((j) => ({ id: j.id, name: j.nama })),
        ]"
      />

      <InputText v-model="form.jabatan" label="Jabatan" placeholder="Contoh: Ketua Rombongan" class="mb-3" />
      <div class="grid grid-cols-2 gap-4">
        <InputDate v-model="form.keberangkatan" label="Keberangkatan" class="mb-3" />
        <InputDate v-model="form.kepulangan" label="Kepulangan" class="mb-3" />
      </div>
    </div>

    <!-- Rekom Paspor -->
    <div v-if="form.tipe_surat === 'rekom_paspor'">
      <SelectField class="mb-3"
        v-model="form.jamaah_id"
        label="Jamaah"
        :options="[
          { id: '', name: '-- Pilih Jamaah --' },
          ...jamaahList.map((j) => ({ id: j.id, name: j.nama })),
        ]"
      />
      <InputText class="mb-3"
        v-model="form.bulan_tahun_berangkat"
        label="Bulan dan Tahun Keberangkatan"
        placeholder="Contoh: Januari"
      />
    </div>
  </Form>
</template>

<script lang="ts" setup>
import { ref, watch, onMounted } from 'vue'
import { get_jamaah, add_surat } from '@/service/daftar_konfigurasi_surat'

const convertToSelectOptions = (arr: { value: string; label: string }[]) =>
  arr.map((item) => ({ id: item.value, name: item.label }))

const props = defineProps<{
  agen_id: number
  formStatus: boolean
  formtambahsurat: boolean
}>()

const emit = defineEmits<{
  (e: 'cancel'): void
  (e: 'submitted'): void
  (e: 'close'): void
  (e: 'handletambahsurat'): void
}>()

import Form from '@/components/Modal/Form.vue'
import InputText from '@/components/Form/InputText.vue'
import InputDate from '@/components/Form/InputDate.vue'
import SelectField from '@/components/Form/SelectField.vue'

const jamaahList = ref<{ id: string; nama: string }[]>([])

const form = ref({
  nomor_surat: '',
  tanggal_surat: '',
  tujuan: '',
  tipe_surat: '',
  jamaah_id: '',
  jabatan: '',
  keberangkatan: '',
  kepulangan: '',
  bulan_tahun_berangkat: '',
})

const suratOptions = convertToSelectOptions([
  { value: '', label: '-- Pilih --' },
  { value: 'surat_cuti', label: 'Surat Cuti' },
  { value: 'rekom_paspor', label: 'Surat Rekom Paspor' },
])

const alreadyFetched = ref(false)

const fetchJamaahIfNeeded = async () => {
  if (
    (form.value.tipe_surat === 'surat_cuti' || form.value.tipe_surat === 'rekom_paspor') &&
    !alreadyFetched.value
  ) {
    try {
      const data = await get_jamaah()
      jamaahList.value = data.map((item: any) => ({
        id: item.jamaah_id,
        nama: item.nama_jamaah,
      }))
      alreadyFetched.value = true
    } catch (err) {
      console.error('❌ Gagal ambil data jamaah:', err)
    }
  }
}

onMounted(fetchJamaahIfNeeded)

watch(
  () => form.value.tipe_surat,
  async () => {
    await fetchJamaahIfNeeded()
  },
)

const resetForm = () => {
  form.value = {
    nomor_surat: '',
    tanggal_surat: '',
    tujuan: '',
    tipe_surat: '',
    jamaah_id: '',
    jabatan: '',
    keberangkatan: '',
    kepulangan: '',
    bulan_tahun_berangkat: '',
  }
}

const submitForm = async () => {
  try {
    await add_surat({ ...form.value })
    emit('handletambahsurat')

    const url = `${window.location.origin}/cetak_surat/${form.value.tipe_surat}?jamaah_id=${form.value.jamaah_id}`
    window.open(url, '_blank')

    resetForm()
  } catch (error) {
    console.error('❌ Gagal submit surat:', error)
  }
}
</script>
