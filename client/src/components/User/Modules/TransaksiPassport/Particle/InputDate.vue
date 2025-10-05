<template>
  <div>
    <label :for="id" class="block text-xs font-medium text-gray-700 mb-2">{{ label }}</label>
    <input type="date" :id="id" v-model="model" :class="['text-gray-700 w-full px-4 py-2 border rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500', error ? 'border-red-500' : 'border-gray-300']"/>
    <p v-if="error" class="text-red-500 text-xs mt-1">{{ error }}</p>
    <p class="text-xs text-gray-500 mt-2">{{ note }}</p>
  </div>
</template>

<script setup>
const model = defineModel()
defineProps({
  label: String,
  id: String,
  error: String,
  note: String
})
</script>
