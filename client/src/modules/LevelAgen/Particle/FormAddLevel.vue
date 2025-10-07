<template>
  <Form :form-status="isModalOpen" :label="'Tambah Level Keagenan'" @close="closeModal" @cancel="closeModal" @submit="handleSubmit" width="sm:w-full sm:max-w-xl" :submitLabel="'TAMBAH LEVEL KEAGENAN'">
    <div class="mb-4">
      <label for="namaLevel" class="block text-sm font-medium text-gray-700 mb-2">
        Nama Level Keagenan
      </label>
      <input id="namaLevel" v-model="namaLevel" type="text"
        class="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
        placeholder="Nama Level Keagenan"
      />
    </div>
    <div class="flex gap-4">
      <div class="flex-1">
        <label for="level" class="block text-sm font-medium text-gray-700 mb-2">Level</label>
        <input id="level" v-model="level" type="number"
          class="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-gray-100" readonly />
      </div>
      <div class="flex-1">
        <label for="defaultFee" class="block text-sm font-medium text-gray-700 mb-2">
          Default Fee Keagenan
        </label>
        <input id="defaultFee" v-model="computedNominal" type="text"
          class="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
          placeholder="Default Fee Keagenan" />
      </div>
    </div>
  </Form>
</template>

<script setup lang="ts">
import { ref, defineEmits, onMounted, computed } from 'vue'
import { daftarAgen, addAgen } from '@/service/level_agen'
import Form from "@/components/Modal/Form.vue"

// Modal State
const isModalOpen = ref(true)
const namaLevel = ref('')
const level = ref('')
const defaultFee = ref(0)

// Data agen
const agenData = ref([])

// Fungsi untuk cari level kosong atau level terakhir
const getNextLevel = (levels) => {
  // Ambil semua angka level yang ada
  const sortedLevels = levels.map((l) => l.level).sort((a, b) => a - b)

  // Cek apakah ada level kosong
  for (let i = 1; i <= sortedLevels.length; i++) {
    if (!sortedLevels.includes(i)) {
      return i // Kembalikan level kosong pertama
    }
  }

  // Kalau tidak ada yang kosong, ambil level terakhir + 1
  return sortedLevels.length + 1
}

const computedNominal = computed({
  get() {
    return defaultFee.value
      ? 'Rp ' + defaultFee.value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
      : ''
  },
  set(value) {
    const clean = value.replace(/[^\d]/g, '')
    defaultFee.value = Number(clean)
  },
})

const fetchAgen = async () => {
  try {
    const response = await daftarAgen()
    agenData.value = response.data
    level.value = getNextLevel(agenData.value)
  } catch (error) {
    console.log('Error fetch agen:', error)
  }
}

onMounted(() => {
  fetchAgen()
})

const emit = defineEmits(['update:isModalOpen'])

const closeModal = () => {
  emit('update:isModalOpen', false)
}

const handleSubmit = async () => {
  if (!namaLevel.value.trim()) {
    alert('Nama level tidak boleh kosong')
    return
  }

  try {
    const response = await addAgen({
      nama: namaLevel.value.trim(),
      level: Number(level.value),
      default_fee: defaultFee.value,
    })

    console.log('Response:', response.data)
    emit('level-added')
    closeModal()
  } catch (error) {
    console.error('Error detail:', {
      message: error.message,
      response: error.response?.data,
      config: error.config,
    })
    alert('Gagal menyimpan: ' + (error.response?.data?.message || error.message))
  }
}
</script>
