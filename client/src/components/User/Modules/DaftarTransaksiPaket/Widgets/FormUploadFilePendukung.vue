<script setup lang="ts">
import { defineProps, defineEmits, ref, watch } from 'vue'
import Form from '@/components/Modal/Form.vue'
import InputText from '@/components/Form/InputText.vue'
import InputFile from '@/components/Form/InputFile.vue'
import PrimaryButton from '@/components/Button/PrimaryButton.vue'
import DangerButton from '@/components/Button/DangerButton.vue'
import DeleteIcon from '@/components/Icons/DeleteIcon.vue'
import alertify from 'alertifyjs'
import { uploadFilePendukung } from '@/service/trans_paket'

interface FilePendukung {
  title: string
  file?: File
}

const props = defineProps<{
  showForm: boolean
  transpaketId: number
  cabangId: number
}>()

const emit = defineEmits<{
  (e: 'cancel'): void
  (e: 'status', payload: { error: boolean; err_msg?: string }): void
}>()

const errors = ref<Record<string, string>>({})
const formData = ref<Partial<FilePendukung>[]>([])
const isLoading = ref(false)

const handleCancel = (): void => {
  emit('cancel')
  errors.value = {}
  formData.value = []
}

function createEmptyForm(): Partial<FilePendukung> {
  return {
    title: '',
    file: undefined,
  }
}

const addRow = (): void => {
  formData.value.push(createEmptyForm())
}

const deleteRow = (index: number): void => {
  formData.value.splice(index, 1)
}

const handleFileUpload = (event: Event, index: number): void => {
  const file = event as HTMLInputElement

  // Jika tidak ada file yang dipilih atau file tidak valid, reset state
  if (!file) {
    formData.value[index].file = undefined
    return
  }

  const allowedTypes = ['application/pdf']
  const maxSize = 614400 // 600KB

  if (!allowedTypes.includes(file.type)) {
    alertify.error(`Format file '${file.name}' tidak didukung. Gunakan format PDF.`)
    file.value = ''
    formData.value[index].file = undefined
    formData.value[index].title = undefined
    return
  }
  if (file.size > maxSize) {
    alertify.error(`Ukuran file '${file.name}' maksimum 600KB`)
    file.value = ''
    formData.value[index].file = undefined
    formData.value[index].title = undefined
    return
  }

  // Jika file valid, simpan ke state
  formData.value[index].file = file
  if (!formData.value[index].title) {
    formData.value[index].title = file.name.replace(/\.[^/.]+$/, '')
  }
  // Hapus error jika ada
  if (errors.value[`file-${index}`]) {
    errors.value[`file-${index}`] = ''
  }
}

const validateForm = (): boolean => {
  errors.value = {}
  let isValid = true

  if (formData.value.length === 0) {
    errors.value.form = 'Minimal harus ada satu file pendukung yang diunggah'
    isValid = false
  }

  formData.value.forEach((form, index) => {
    if (!form.title || form.title.trim() === '') {
      errors.value[`title-${index}`] = 'Nama File harus diisi'
      isValid = false
    }
    if (!form.file) {
      errors.value[`file-${index}`] = 'File harus diunggah'
      isValid = false
    }
  })

  if (!isValid) {
    alertify.error('Form tidak valid. Silakan perbaiki semua kesalahan.')
  }

  return isValid
}

const handleSubmit = async (): Promise<void> => {
  if (!validateForm()) return

  isLoading.value = true

  const fd = new FormData()
  fd.append('id', props.transpaketId.toString())
  fd.append('division_id', props.cabangId.toString())

  formData.value.forEach((item, index) => {
    fd.append(`payload[${index}][title]`, item.title)
    fd.append(`payload[${index}][file]`, item.file)
  })

  console.log("fd", fd);

  try {
    const response = await uploadFilePendukung(fd)
    if (response?.error || response?.status) {
      emit('status', { error: false, err_msg: response.message })
      alertify.success(response.message || 'File berhasil diunggah.')
      emit('cancel')
    } else {
      emit('status', { error: true, err_msg: response.message })
      alertify.error(response?.message || 'Terjadi kesalahan saat upload.')
      emit('cancel')
    }
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || 'Gagal mengupload file.'
    alertify.error(errorMessage)
    console.error(error)
  } finally {
    isLoading.value = false
  }
}

watch(
  () => props.showForm,
  (val) => {
    if (val) {
      formData.value = [createEmptyForm()]
      errors.value = {}
    }
  },
)
</script>

<template>
  <Form
    :form-status="showForm"
    :label="'Form Upload File Pendukung'"
    class="text-sm"
    width="sm:w-1/2"
    @close="handleCancel"
    @cancel="handleCancel"
    @submit="handleSubmit"
    :submitLabel="isLoading ? 'MENGUNGGAH...' : 'UNGGAH FILE'"
    :is-loading="isLoading"
  >
    <div class="flex flex-col px-1">
      <!-- Header -->
      <div class="flex border-b border-t bg-gray-50">
        <div class="w-[55%] px-4 py-2 font-medium text-gray-900 text-center">Nama File</div>
        <div class="w-[35%] px-4 py-2 font-medium text-gray-900 text-center">Pilih File</div>
        <div class="w-[10%] px-4 py-2 font-medium text-gray-900 text-center">Aksi</div>
      </div>

      <!-- Body -->
      <div class="max-h-[40vh] overflow-y-auto">
        <div v-if="formData.length === 0" class="text-center py-4 text-gray-500">
          Klik "Tambah Row" untuk memulai.
        </div>
        <div
          v-for="(item, index) in formData"
          :key="index"
          class="flex items-start border-b py-3"
        >
          <div class="w-[55%] px-2">
            <InputText
              label_status="false"
              v-model="item.title"
              :id="`title-${index}`"
              placeholder="Contoh: Scan KTP"
              :error="errors[`title-${index}`]"
            />
          </div>
          <div class="w-[35%] px-2">
            <InputFile
              label_status="false"
              :id="`file-upload-${index}`"
              :error="errors[`file-${index}`]"
              @file-selected="handleFileUpload($event, index)"
              accept=".pdf"
            />
          </div>
          <div class="w-[10%] px-2 flex justify-center items-center h-full pt-1">
            <DangerButton @click="deleteRow(index)" title="Hapus Baris">
              <DeleteIcon />
            </DangerButton>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="flex justify-end mt-3">
        <PrimaryButton @click="addRow"> TAMBAH ROW </PrimaryButton>
      </div>
      <div v-if="errors.form" class="text-red-500 text-sm mt-2 text-center">{{ errors.form }}</div>
    </div>
  </Form>
</template>
