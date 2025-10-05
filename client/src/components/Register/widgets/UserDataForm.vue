<template>
  <div class="max-w-md mx-auto p-4 bg-white rounded-lg">
    <p class="text-sky-700 font-bold mb-2">Data Pendaftar</p>
    <div class="space-y-3">
      <InputField v-model="userData.username" placeholder="Username" @input="updateModel" />
      <InputField v-model="userData.email" type="email" placeholder="Email" @input="updateModel" />
      <InputField
        v-model="userData.password"
        type="password"
        placeholder="Password"
        @input="updateModel"
      />
      <InputField
        v-model="userData.confirmPassword"
        type="password"
        placeholder="Konfirmasi Password"
        @input="updateModel"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, defineProps, defineEmits } from 'vue'
import InputField from '../particles/InputField.vue'

// Ambil data dari parent `RegisterView.vue`
const props = defineProps<{
  modelValue: {
    username: string
    email: string
    password: string
    confirmPassword: string
    token: string
  }
}>()
const emit = defineEmits(['update:modelValue'])

// Sinkronkan userData dengan parent
const userData = ref(props.modelValue)

// Fungsi untuk update parent saat input berubah
const updateModel = () => {
  emit('update:modelValue', userData.value)
}
</script>
