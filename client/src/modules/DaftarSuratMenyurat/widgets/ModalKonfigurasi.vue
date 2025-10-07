<template>
  <Form
    :formStatus="show"
    :label="'Konfigurasi Surat'"
    :width="'w-1/3'"
    :submitLabel="'SIMPAN KONFIGURASI'"
    @submit="submitForm"
    @cancel="closeModal"
  >
    <!-- Penanda Tangan -->
    <div class="space-y-4">
      <h3 class="text-lg font-semibold text-gray-700">Penanda Tangan</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputText
          v-model="form.nama_tanda_tangan"
          label="Nama"
          placeholder="Masukkan nama lengkap penanda tangan"
          required
        />
        <InputText
          v-model="form.jabatan_tanda_tangan"
          label="Jabatan"
          placeholder="Contoh: Direktur Utama"
          required
        />
        <InputText
          v-model="form.alamat_tanda_tangan"
          label="Alamat"
          placeholder="Masukkan alamat lengkap"
          class="md:col-span-2"
          required
        />
      </div>
    </div>

    <!-- Perusahaan -->
    <div class="space-y-4 mt-6">
      <h3 class="text-lg font-semibold text-gray-700">Informasi Perusahaan</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputText
          v-model="form.nama_perusahaan"
          label="Nama Perusahaan"
          placeholder="Contoh: PT. Contoh Sukses Bersama"
          class="md:col-span-2"
          required
        />
        <InputText
          v-model="form.izin_perusahaan"
          label="Izin Perusahaan"
          placeholder="Contoh: Izin No. 123/ABC/XYZ"
          class="md:col-span-2"
          required
        />
        <InputText
          v-model="form.kota_perusahaan"
          label="Kota"
          placeholder="Contoh: Jakarta"
          required
        />
        <InputText
          v-model="form.provinsi_perusahaan"
          label="Provinsi"
          placeholder="Contoh: DKI Jakarta"
          required
        />
        <InputText
          v-model="form.alamat_perusahaan"
          label="Alamat Perusahaan"
          placeholder="Masukkan alamat lengkap"
          class="md:col-span-2"
          required
        />
        <InputText
          v-model="form.no_kontak_perusahaan"
          label="No Kontak"
          placeholder="Contoh: 08123456789"
          required
        />
        <InputText
          v-model="form.website_perusahaan"
          label="Website"
          placeholder="Contoh: www.namadomain.com"
        />
        <InputText
          v-model="form.email_perusahaan"
          label="Email"
          placeholder="Contoh: info@namaperusahaan.com"
          class="md:col-span-2"
          required
        />
      </div>
    </div>
  </Form>
</template>

<script setup lang="ts">
import { reactive, defineProps, defineEmits, watch } from 'vue'
import { getKonfigurasi, addKonfigurasi } from '@/service/daftar_konfigurasi_surat'
import Form from '@/components/Modal/Form.vue'
import InputText from '@/components/Form/InputText.vue'

const props = defineProps<{ show: boolean }>()
const emit = defineEmits(['close', 'submit', 'konfigurasi_success'])

const form = reactive({
  id: '',
  nama_tanda_tangan: '',
  jabatan_tanda_tangan: '',
  alamat_tanda_tangan: '',
  nama_perusahaan: '',
  izin_perusahaan: '',
  kota_perusahaan: '',
  provinsi_perusahaan: '',
  alamat_perusahaan: '',
  no_kontak_perusahaan: '',
  website_perusahaan: '',
  email_perusahaan: '',
})

// Isi data ke form
async function fetchAndSetForm() {
  try {
    const data = await getKonfigurasi()

    // Safety check + fallback value kalau gak ada data
    Object.assign(form, {
      id: data?.id || '',
      nama_tanda_tangan: data?.nama_tanda_tangan || '',
      jabatan_tanda_tangan: data?.jabatan_tanda_tangan || '',
      alamat_tanda_tangan: data?.alamat_tanda_tangan || '',
      nama_perusahaan: data?.nama_perusahaan || '',
      izin_perusahaan: data?.izin_perusahaan || '',
      kota_perusahaan: data?.kota_perusahaan || '',
      provinsi_perusahaan: data?.provinsi_perusahaan || '',
      alamat_perusahaan: data?.alamat_perusahaan || '',
      no_kontak_perusahaan: data?.no_kontak_perusahaan || '',
      website_perusahaan: data?.website_perusahaan || '',
      email_perusahaan: data?.email_perusahaan || '',
    })
  } catch (err) {
    console.error('Gagal fetch data konfigurasi:', err)
    // fallback kalo error fetch, form direset kosong juga
    Object.assign(form, {
      id: '',
      nama_tanda_tangan: '',
      jabatan_tanda_tangan: '',
      alamat_tanda_tangan: '',
      nama_perusahaan: '',
      izin_perusahaan: '',
      kota_perusahaan: '',
      provinsi_perusahaan: '',
      alamat_perusahaan: '',
      no_kontak_perusahaan: '',
      website_perusahaan: '',
      email_perusahaan: '',
    })
  }
}

// Submit handler
async function submitForm() {
  try {
    console.log('data yang di kirim', form)
    await addKonfigurasi({ ...form })
    selesaiKonfigurasi()
  } catch (err) {
    console.error('Gagal submit konfigurasi:', err)
  }
}

function selesaiKonfigurasi() {
  emit('konfigurasi_success')
}

function closeModal() {
  emit('close')
}

// Pantau show prop: saat show=true, load data
watch(
  () => props.show,
  (val) => {
    if (val) {
      fetchAndSetForm()
    }
  },
)
</script>
