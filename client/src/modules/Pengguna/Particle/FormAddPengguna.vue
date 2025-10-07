<template>
  <Form :form-status="isModalOpen" :label="'Tambah Pengguna Baru'" width="sm:w-full sm:max-w-md" @close="closeModal" @cancel="closeModal"  @submit="handleSubmit" :submitLabel="'TAMBAH PENGGUNA'">
    <div>
      <div class="mb-4">
        <label for="member" class="block text-sm font-medium text-gray-700 mb-2">Member</label>
        <select id="member" v-model="selectedMember" @change="updateCabangId"
          class="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none" >
          <option value="0">Pilih Member</option>
          <option v-for="member in members" :key="member.id" :value="member.id">
            {{ member.name }}
          </option>
        </select>
        <p v-if="errors.member" class="text-red-500 text-sm mt-1">{{ errors.member }}</p>
      </div>
      <div class="mb-0">
        <label for="grup" class="block text-sm font-medium text-gray-700 mb-2">Grup</label>
        <select id="grup" v-model="selectedGrup"
          class="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none" >
          <option value="0">Pilih Grup</option>
          <option v-for="grup in grups" :key="grup.id" :value="grup.id">{{ grup.name }}</option>
        </select>
        <p v-if="errors.grup" class="text-red-500 text-sm mt-1">{{ errors.grup }}</p>
      </div>
    </div>
  </Form>
</template>

<script setup lang="ts">
import { ref, defineProps, defineEmits, onMounted } from 'vue'
import { addPengguna, getMember, getGrup } from '@/service/pengguna'
import Form from "@/components/Modal/Form.vue"

// Props untuk kontrol modal dari parent
defineProps({
  isModalOpen: Boolean,
})

interface Grup {
  id: number
  name: string
}

interface Member {
  id: number
  name: string
  cabang_id: number
}

 interface ErrorFields {
    member?: string
    grup?: string
  }

const errors = ref<ErrorFields>({
  member: '',
  grup: '',
})

const grups = ref<Grup[]>([])
const members = ref<Member[]>([])
// Notification State
const showNotification = ref(false)
const notificationMessage = ref('')
const notificationType = ref<'success' | 'error'>('success')
const timeoutId = ref<number | null>(null)
const searchTimeout = ref<number | null>(null)

// Fetch data grup dari API
const fetchGrup = async () => {
  try {
    const response = await getGrup()
    if (response.error == false) {
      grups.value = response.data
    }
  } catch (error) {
    console.error('Gagal mengambil data grup:', error)
  }
}

// Fetch data member dari API
const fetchMember = async () => {
  try {
    const response = await getMember()
    if (response && Array.isArray(response.data)) {
      members.value = response.data
    }
  } catch (error) {
    console.error('❌ Gagal fetch data member:', error)
  }
}

// Emit event untuk menutup modal
const emit = defineEmits(['update:isModalOpen'])

// State untuk select member, grup, dan cabang_id
const selectedMember = ref<number | null>(0)
const selectedGrup = ref<number | null>(0)
const selectedCabangId = ref<number | null>(null) // Tambahkan ref untuk cabang_id

// Fungsi untuk mengambil cabang_id dari member yang dipilih
const updateCabangId = (): void => {
  const selectedMemberData = members.value.find((member) => member.id === selectedMember.value)
  if (selectedMemberData) {
    selectedCabangId.value = selectedMemberData.cabang_id
  } else {
    selectedCabangId.value = null
  }
}

// Fungsi untuk menutup modal
const closeModal = (): void => {
  // fetchPengguna()
  emit('update:isModalOpen', false) // Emit perubahan ke parent
}

// Validasi form
const validateForm = (): boolean => {
  errors.value = {
    member: '',
    grup: '',
  }

  let isValid = true

  // Validasi member
  if (selectedMember.value == 0) {
    errors.value.member = 'Anda wajib memilih salah satu member.'
    isValid = false
  }

  // Validasi member
  if (selectedGrup.value == 0) {
    errors.value.member = 'Anda wajib memilih salah satu grup.'
    isValid = false
  }

  return isValid
}

// Fungsi untuk handle submit dengan FormData
const handleSubmit = async (): Promise<void> => {
  if (!validateForm()) {
    return
  }

  try {
    // Buat objek FormData
    const formData = new FormData()

    // Tambahkan data ke FormData
    formData.append('member_id', selectedMember.value!.toString())
    formData.append('grup_id', selectedGrup.value!.toString())

    // Debugging: Tampilkan isi FormData
    for (const [key, value] of formData.entries()) {
      console.log(key, value)
    }

    // Panggil fungsi addPengguna dengan FormData
    const response = await addPengguna(formData)

    if (response.error == false) {
      emit('pengguna-added')
      closeModal()
    } else {
      alert('Gagal menyimpan data: ' + response.message)
    }
  } catch (error) {
    console.error('❌ Gagal menyimpan data:', error)
    alert('Terjadi kesalahan saat menyimpan data.')
  }
}

const displayNotification = (message: string, type: 'success' | 'error' = 'success') => {
  notificationMessage.value = message
  notificationType.value = type
  showNotification.value = true
  resetNotificationTimeout()
}

const resetNotificationTimeout = () => {
  if (timeoutId.value) clearTimeout(timeoutId.value)
  timeoutId.value = window.setTimeout(() => {
    showNotification.value = false
  }, 3000)
}

// Fetch data ketika komponen dimount
onMounted(() => {
  fetchMember()
  fetchGrup()
})
</script>
