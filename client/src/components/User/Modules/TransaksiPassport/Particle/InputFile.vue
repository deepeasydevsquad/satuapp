<template>
  <div>
    <label :for="id" class="block text-sm font-medium text-gray-700 mb-2">{{ label }}</label>
    <div class="flex items-center">
      <input
        type="file"
        class="hidden"
        :id="id"
        :accept="accept"
        @change="onFileChange"
      />
      <label
        :for="id"
        class="px-4 py-2 bg-gray-100 border text-gray-700 border-gray-300 rounded-lg cursor-pointer hover:bg-gray-200"
      >
        {{ buttonText }}
      </label>
      <span class="ml-4 text-gray-500">{{ fileName || 'No file chosen' }}</span>
    </div>
    <p v-if="error" class="text-red-500 text-sm mt-1">{{ error }}</p>
    <p class="text-xs text-gray-500 mt-2">
      Ukuran maksimum: 600 KB. Tipe file: JPG, JPEG, PNG.
    </p>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  id: {
    type: String,
    default: 'photo-upload'
  },
  label: {
    type: String,
    default: 'Upload Photo'
  },
  buttonText: {
    type: String,
    default: 'Choose File'
  },
  accept: {
    type: String,
    default: '.jpg,.jpeg,.png'
  },
  error: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['file-selected'])

const fileName = ref('')

function onFileChange(e) {
  const file = e.target.files[0]
  if (file) {
    fileName.value = file.name
    emit('file-selected', file)
  }
}
</script>
