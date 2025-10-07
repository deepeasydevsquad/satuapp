<!-- InputText.vue -->
<template>
  <div>
    <label :for="id" class="block text-xs font-medium text-gray-700 mb-2">{{ label }}</label>
    <input
      :id="id"
      :type="type"
      :placeholder="placeholder"
      v-model="model"
      :class="[
        'text-black w-full px-4 py-2 text-xs border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder:text-xs',
        error ? 'border-red-500' : 'border-gray-300',
      ]"
    />
    <p v-if="error" class="text-red-500 text-xs mt-1">{{ error }}</p>
    <p class="text-xs text-gray-500 mt-2">{{ note }}</p>
  </div>
</template>

<script setup>
const model = defineModel()
defineProps({
  label: String,
  id: String,
  placeholder: String,
  type: { type: String, default: 'text' },
  error: String,
  note: String,
})
</script>
