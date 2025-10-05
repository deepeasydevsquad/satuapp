<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center px-4">
    <div class="bg-white shadow-lg rounded-2xl p-8 w-full max-w-2xl">
      <h1 class="text-3xl font-bold text-gray-800 mb-2">Tambah Cabang Pertama Anda</h1>
      <p class="text-gray-500 mb-6">Lengkapi informasi cabang utama untuk memulai menggunakan sistem.</p>
      <div class="mb-4">
        <label class="block text-gray-700 font-medium mb-1">Nama Cabang</label>
        <input v-model="form.name" placeholder="Nama Cabang" type="text" class="input-style" />
      </div>
      <div class="mb-4 grid grid-cols-2 gap-4">
        <div>
          <label class="block text-gray-700 font-medium mb-1">Nama Kota</label>
          <select v-model="form.city" class="input-style">
            <option value="" disabled>Pilih Kota</option>
            <option v-for="kota in kotaList" :key="kota.id" :value="kota.id">
              {{ kota.name }}
            </option>
          </select>
        </div>
        <div>
          <label class="block text-gray-700 font-medium mb-1">Kode Pos</label>
          <input v-model="form.pos_code" placeholder="Kode Pos" type="text" class="input-style" />
        </div>
      </div>
      <div class="mb-4 grid grid-cols-2 gap-4">
        <div>
          <label class="block text-gray-700 font-medium mb-1">Tanda Tangan</label>
          <input type="file" @change="handleFileUpload" accept="image/png" class="input-style pt-2" />
          <p class="text-xs text-gray-500 mt-1">Gambar .png, max 1 MB, ukuran 110x80px.</p>
        </div>
        <div>
          <label class="block text-gray-700 font-medium mb-1">Alamat</label>
          <textarea v-model="form.address" placeholder="Alamat lengkap" rows="4" class="input-style resize-none" ></textarea>
        </div>
      </div>
      <div class="mb-4">
        <label class="block text-gray-700 font-medium mb-1">Catatan</label>
        <textarea v-model="form.note" placeholder="Catatan tambahan" rows="4" class="input-style resize-none"></textarea>
      </div>
      <div class="flex justify-center w-full">
         <PrimaryButton class="w-full"  @click="saveForm"> Tambah Cabang </PrimaryButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { daftarKota, addCabang } from '@/service/cabang'
import PrimaryButton from '@/components/Button/PrimaryButton.vue'

interface Kota {
  id: number
  name: string
}

const router = useRouter()
const kotaList = ref<Kota[]>([])

const form = ref({
  name: '',
  city: '',
  pos_code: '',
  address: '',
  note: '',
  tanda_tangan: null as File | null,
})

onMounted(async () => {
  try {
    const res = await daftarKota()
    kotaList.value = res.data
  } catch (err) {
    console.error('Gagal load kota:', err)
  }
})

const handleFileUpload = (event: Event) => {
  const file = (event.target as HTMLInputElement)?.files?.[0]
  if (file) {
    form.value.tanda_tangan = file
  }
}

const saveForm = async () => {
  if (!form.value.city || !form.value.pos_code || !form.value.address) {
    alert('Harap isi semua field yang wajib!')
    return
  }

  const fd = new FormData()
  fd.append('name', form.value.name)
  fd.append('city', form.value.city)
  fd.append('pos_code', form.value.pos_code)
  fd.append('address', form.value.address)
  fd.append('note', form.value.note)
  if (form.value.tanda_tangan) {
    fd.append('tanda_tangan', form.value.tanda_tangan)
  }

  try {
    const res = await addCabang(fd)
    if (res.success || res.data?.success) {
      router.push('/user')
    } else {
      alert('Gagal menyimpan cabang')
    }
  } catch (err) {
    console.error(err)
    alert('Terjadi kesalahan saat menyimpan')
  }
}
</script>

<style scoped>
.input-style {
  @apply text-gray-700 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500;
}
</style>
