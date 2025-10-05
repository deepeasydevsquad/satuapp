<template>
  <div class="max-w-md mx-auto p-4 bg-white rounded-lg">
    <p class="text-sky-700 font-bold mb-2">Masukkan Data Perusahaan</p>

    <div class="space-y-3">
      <InputField
        v-model="companyData.company_name"
        placeholder="Nama Perusahaan"
        @input="updateModel"
      />
      <InputField
        v-model="companyData.whatsapp_company_number"
        placeholder="Nomor WhatsApp"
        @input="updateModel"
      />

      <div class="flex">
        <button
          class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-l-lg focus:outline-none focus:shadow-outline whitespace-nowrap flex-none"
          :class="{ 'bg-gray-400 cursor-not-allowed': countdown > 0 || isLoading }"
          :disabled="countdown > 0 || isLoading"
          type="button"
          @click="getOTP"
        >
          {{ isLoading ? 'Mengirim...' : countdown > 0 ? `Tunggu ${countdown}s` : 'Dapatkan OTP' }}
        </button>
        <input
          v-model="otp"
          class="w-full p-2 border text-black border-gray-300 rounded-r-lg rounded-l-none"
          id="otp"
          type="text"
          placeholder="Masukkan OTP"
          @input="updateOTP"
        />
      </div>

      <!-- Menampilkan error jika ada -->
      <p v-if="errorMessage" class="text-red-600 font-semibold text-sm">{{ errorMessage }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, defineProps, defineEmits } from 'vue';
import axios from 'axios';
import InputField from '../particles/InputField.vue';

// Props & Emit untuk update parent (RegisterView.vue)
const props = defineProps<{
  modelValue: { company_name: string; whatsapp_company_number: string };
}>();
const emit = defineEmits(['update:modelValue', 'update:otp']); // ✅ Tambahkan emit untuk OTP

// Data perusahaan
const companyData = ref(props.modelValue);

// OTP dan hitung mundur
const otp = ref('');
const countdown = ref(0);
const isLoading = ref(false); // ✅ Tambahkan state loading
const errorMessage = ref(''); // ✅ Tambahkan state error
let countdownTimer: NodeJS.Timeout | null = null;

// Update data perusahaan di RegisterView.vue
const updateModel = () => {
  emit('update:modelValue', companyData.value);
};

// Update OTP di RegisterView.vue
const updateOTP = () => {
  emit('update:otp', otp.value);
};

// Fungsi untuk mengirim permintaan OTP
const getOTP = async () => {
  if (!companyData.value.whatsapp_company_number) {
    errorMessage.value = '⚠️ Masukkan nomor WhatsApp!';
    return;
  }

  isLoading.value = true; // ⏳ Set loading ke true
  errorMessage.value = ''; // ❌ Reset error sebelumnya

  try {
    await axios.post(`http://localhost:${import.meta.env.VITE_PORT}/send-otp`, {
      whatsappNumber: companyData.value.whatsapp_company_number,
    });

    // ✅ Jika sukses
    alert('✅ OTP telah dikirim!');
    countdown.value = 60;

    if (countdownTimer) clearInterval(countdownTimer);
    countdownTimer = setInterval(() => {
      countdown.value--;
      if (countdown.value <= 0 && countdownTimer) {
        clearInterval(countdownTimer);
        countdownTimer = null;
      }
    }, 1000);
  } catch (error) {
    if (error.response) {
      const { error: errorMsg, code } = error.response.data;

      if (code === 'OTP_LIMIT_REACHED') {
        errorMessage.value = '❌ Anda telah mencapai batas OTP hari ini. Coba lagi besok.';
      } else {
        errorMessage.value = errorMsg || '❌ Gagal mengirim OTP.';
      }
    } else {
      errorMessage.value = '❌ Gagal terhubung ke server.';
    }
  } finally {
    isLoading.value = false; // ✅ Reset loading setelah request selesai
  }
};
</script>
