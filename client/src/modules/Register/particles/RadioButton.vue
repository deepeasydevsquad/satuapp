<template>
  <label
    class="block p-4 rounded-lg border cursor-pointer transition-all duration-200"
    :class="{
      'bg-sky-100 text-sky-700 border-sky-500': isSelected,
      'bg-white text-gray-900 border-gray-300': !isSelected,
    }"
    @click="selectPackage"
  >
    <input type="radio" :name="name" :value="value" class="hidden" :checked="isSelected" />
    <div class="flex justify-between">
      <span class="font-semibold">{{ label }}</span>
      <span class="font-bold">{{ price }}</span>
    </div>
  </label>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps({
  modelValue: String,
  name: String,
  value: String,
  label: String,
  price: String,
})

const emit = defineEmits(['update:modelValue'])

const isSelected = computed(() => props.modelValue === props.value)

const selectPackage = () => {
  emit('update:modelValue', props.value)
}
</script>

<style scoped>
label {
  transition: all 0.2s ease-in-out;
}
label:hover {
  background-color: #f0f9ff; /* Warna biru muda saat hover */
}
</style>
