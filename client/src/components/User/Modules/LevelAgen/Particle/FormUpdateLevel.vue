<template>
  <Form :form-status="isModalOpen" :label="'Update Level Keagenan'" @close="closeModal" @cancel="closeModal" @submit="handleSubmit" width="sm:w-full sm:max-w-xl" :submitLabel="'UPDATE LEVEL KEAGENAN'">
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
        <input
          id="level"
          v-model="level"
          type="number"
          class="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-gray-100"
          readonly
        />
      </div>
      <div class="flex-1">
        <label for="defaultFee" class="block text-sm font-medium text-gray-700 mb-2"
          >Default Fee Keagenan</label
        >
        <input
          id="defaultFee"
          v-model="computedNominal"
          type="text"
          class="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
          placeholder="Default Fee Keagenan"
        />
      </div>
    </div>
  </Form>
  <!-- <div v-if="isModalOpen"
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
    <div class="bg-white rounded-lg shadow-lg w-full max-w-md">
      <div class="p-6 border-b border-gray-200">
        <h2 class="text-xl font-semibold text-gray-700">Update Level Keagenan</h2>
      </div>
      <div class="p-6">
      </div>
      <div class="p-6 border-t border-gray-200 flex justify-end gap-4">
        <button
          @click="closeModal"
          class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 focus:outline-none"
        >
          Cancel
        </button>
        <button
          @click="handleSubmit"
          class="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600 focus:outline-none"
        >
          {{ isUpdate ? 'Update' : 'Simpan' }}
        </button>
      </div>
    </div>
  </div> -->
</template>

<script setup lang="ts">
import { defineProps, defineEmits, watch, ref, computed } from 'vue'
import { editAgen } from '@/service/level_agen'
import Form from "@/components/Modal/Form.vue"

const props = defineProps({
  isModalOpen: Boolean,
  isUpdate: Boolean,
  levelToUpdate: Object,
})

const idLevel = ref(props.levelToUpdate?.id || 0)
const namaLevel = ref(props.levelToUpdate?.name || '')
const level = ref(props.levelToUpdate?.level || '')
const defaultFee = ref(props.levelToUpdate?.default_fee || '')

const emit = defineEmits(['update:isModalOpen', 'submit', 'level-updated'])

const closeModal = () => {
  emit('update:isModalOpen', false)
}

const handleSubmit = async () => {
  if (!namaLevel.value.trim()) {
    alert('Nama level tidak boleh kosong')
    return
  }

  const payload = {
    id: Number(idLevel.value),
    nama: namaLevel.value.trim(),
    level: Number(level.value),
    default_fee: defaultFee.value,
  }

  console.log('Payload yang dikirim:', payload) // Log sebelum request

  try {
    const response = await editAgen(payload)

    console.log('Response:', response) // Log response dari backend
    emit('level-updated')
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

watch(
  () => props.levelToUpdate,
  (newData) => {
    console.log('levelToUpdate berubah:', newData)
    if (newData) {
      idLevel.value = newData.id || 0
      namaLevel.value = newData.name || ''
      level.value = newData.level || ''
      defaultFee.value = newData.default_fee || ''
    }
  },
)
</script>
