<template>
  <div>
    <label :for="id" class="block text-xs font-medium text-gray-700 mb-2">
      {{ label }}
    </label>
    <textarea
      :id="id"
      v-model="model"
      @input="$emit('update:modelValue', $event.target.value)"
      :placeholder="placeholder"
      :rows="rows"
      :class="[
        'w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700 text-xs',
        error ? 'border-red-500' : 'border-gray-300',
      ]"
    ></textarea>
    <p v-if="error" class="text-red-500 text-xs mt-1">{{ error }}</p>
    <p v-if="note" class="text-xs text-gray-500 mt-2">{{ note }}</p>
  </div>
</template>

<script setup>
defineProps({
  modelValue: String,
  label: String,
  id: String,
  placeholder: {
    type: String,
    default: 'Tulis pesan di sini...',
  },
  error: String,
  rows: {
    type: Number,
    default: 5,
  },
  note: String,
})

const model = defineModel()
defineEmits(['update:modelValue'])
</script>
