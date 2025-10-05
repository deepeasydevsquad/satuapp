<script setup lang="ts">
import Form from '@/components/Modal/Form.vue';
import { ref, onMounted } from 'vue';

import { addHeadline, fetchHeadline, updateHeadline } from '@/service/headline';

const props = defineProps<{
  isFormOpen: boolean
  headlineId: number | undefined
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'status', payload: { error: boolean, err_msg?: string }): void
}>()

interface FormData {
  headline: string
  tampilkan: string
}

const formData = ref<FormData>({
  headline: '',
  tampilkan: 'Ya',
})

const handleSubmit = async () => {
  try {
    let response: any = {}
    if (props.headlineId) {
      response = await updateHeadline({ ...formData.value, id: props.headlineId })
    } else {
      response = await addHeadline(formData.value)
    }
    emit('status', { error: false, err_msg: response?.error_msg || 'Data berhasil disimpan' })
    emit('close')
  } catch (error: any) {
    emit('status', { error: true, err_msg:
      (
        error?.response?.data?.error_msg ||
        error?.response?.data?.message
      ) ||
      'Terjadi kesalahan saat menyimpan data.' })
  }
}

onMounted(async () => {
  if (props.headlineId) {
    const response = await fetchHeadline(props.headlineId)
    formData.value = response.data
    console.log(response)
  }
})
</script>

<template>
  <div class="flex items-center justify-center">
    <Form
      :formStatus="props.isFormOpen"
      :label="props.headlineId ? 'Edit Headline' : 'Tambah Headline'"
      width="sm:w-full sm:max-w-xl"
      submitLabel="Simpan"
      @close="emit('close')"
      @cancel="emit('close')"
      @submit="handleSubmit()"
    >
      <div class="text-gray-800">
        <div class="mb-4">
          <label class="block text-md font-medium">Headline</label>
          <textarea
            v-model="formData.headline"
            class="mt-1 block w-full px-3 py-2 border placeholder:text-gray-400 border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            rows="8"
            placeholder="Silahkan isi headline disini"
          ></textarea>
        </div>
        <div>
          <label class="block text-md font-medium">Status Tampil</label>
          <select
            v-model="formData.tampilkan"
            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="Ya">Ya</option>
            <option value="Tidak">Tidak</option>
          </select>
        </div>
      </div>
    </Form>
  </div>
</template>

