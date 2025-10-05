<template>
  <div>
    <label :for="id" class="block text-xs font-medium text-gray-700 mb-2">{{ label }}</label>
    <select
      :id="id"
      v-model="model"
      @change="$emit('update:modelValue', $event.target.value)"
      :class="[
        'w-full text-gray-700 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs',
        error ? 'border-red-500' : 'border-gray-300',
      ]"
    >
      <option disabled value="">{{ placeholder }}</option>
      <option v-for="option in options" :key="option.id" :value="option.id" class="text-gray-700">
        {{ option.name }}
      </option>
    </select>
    <p v-if="error" class="text-red-500 text-xs mt-1">{{ error }}</p>
    <p class="text-xs text-gray-500 mt-2">{{ note }}</p>
  </div>
</template>

<script setup>
defineProps({
  modelValue: String,
  label: String,
  id: String,
  placeholder: {
    type: String,
    default: 'Pilih salah satu',
  },
  error: String,
  options: {
    type: Array,
    required: true, // harus diisi agar select-nya punya pilihan
  },
  note: String,
})
const model = defineModel()

defineEmits(['update:modelValue'])
</script>
