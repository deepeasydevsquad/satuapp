<template>
  <Form
    :form-status="isModalOpen"
    :label="'Update Data Pengguna'"
    width="sm:w-full sm:max-w-md"
    @close="closeModal"
    @cancel="closeModal"
    @submit="handleSubmit"
    :submitLabel="'UPDATE PENGGUNA'"
  >
    <div class="p-0">
      <div class="mb-0">
        <label class="block text-sm font-medium text-gray-700">Grup</label>
        <select
          v-model="form.grup_id"
          class="text-gray-700 mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        >
          <option :value="null">Pilih Grup</option>
          <option v-for="grup in grups" :key="grup.id" :value="grup.id">
            {{ grup.name }}
          </option>
        </select>
      </div>
    </div>
  </Form>
</template>

<script setup lang="ts">
import { ref, defineProps, defineEmits, watch } from 'vue'
import { editPengguna, getInfoEditPengguna, getGrup } from '@/service/pengguna'
import Form from '@/components/Modal/Form.vue'

// Props dari parent
const props = defineProps({
  isModalOpen: Boolean,
  idPengguna: Number,
})

const emit = defineEmits<{
  (e: 'save'): void
  (e: 'cancel'): void
}>()

// Interfaces
interface Grup {
  id: number
  cabang_id: number
  name: string
}

interface Pengguna {
  id: number
  grup_id: number | null
}

// Data
const grups = ref<Grup[]>([])

// ✅ Inisialisasi form langsung dengan default value
const form = ref<Pengguna>({
  id: 0,
  grup_id: null,
})

// Fetch informasi pengguna
const fetchGetInfoEditPengguna = async (id: number) => {
  try {
    const response = await getInfoEditPengguna(id)
    if (response.error == false) {
      form.value.id = response.data.id
      form.value.grup_id = response.data.grup_id
    }
  } catch (error) {
    console.error('❌ Gagal mengambil data pengguna:', error)
  }
}

// Fetch daftar grup
const fetchGrup = async () => {
  try {
    const response = await getGrup()
    if (!response.error && response.data) {
      grups.value = response.data
    }
  } catch (error) {
    console.error('❌ Gagal mengambil data grup:', error)
  }
}

// Tutup modal
const closeModal = (): void => {
  emit('cancel')
}

// Submit form
const handleSubmit = async (): Promise<void> => {
  try {
    const formData = new FormData()
    formData.append('id', form.value.id.toString())
    formData.append('grup_id', String(form.value.grup_id ?? ''))

    const response = await editPengguna(formData)

    if (response.error === false) {
      emit('cancel')
    }
  } catch (error) {
    console.error('❌ Gagal mengupdate data:', error)
  }
}

// Watcher: fetch data saat modal dibuka
watch(
  () => props.isModalOpen,
  async (isOpen) => {
    if (isOpen) {
      await fetchGetInfoEditPengguna(props.idPengguna!)
      await fetchGrup()
    }
  }
)
</script>
