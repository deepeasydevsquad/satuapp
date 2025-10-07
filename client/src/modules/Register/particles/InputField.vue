<template>
  <input
    :type="type"
    :placeholder="placeholder"
    :value="modelValue"
    @input="handleInput"
    class="w-full p-2 border border-gray-300 rounded-lg input-field"
  />
</template>

<script setup lang="ts">
defineProps({
  type: {
    type: String,
    default: 'text',
  },
  placeholder: {
    type: String,
    default: '',
  },
  modelValue: {
    type: [String, Number],
    default: '',
  },
})

const emit = defineEmits(['update:modelValue'])

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.value)
}
</script>
