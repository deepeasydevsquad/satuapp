<template>
  <div class="max-w-md mx-auto p-4 bg-white rounded-lg">
    <p class="text-sky-700 font-bold mb-2">Pilih Paket Anda</p>
    <div class="grid grid-cols-1 gap-3">
      <RadioButton
        v-model="selectedPackage"
        name="paket"
        :value="subscriptionPrice"
        :label="`Paket Premium (12 Bulan) - Rp ${formattedPrice}`"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, defineEmits } from 'vue';
import axios from 'axios';
import RadioButton from '../particles/RadioButton.vue';

const emit = defineEmits(['update:modelValue']);

const subscriptionPrice = ref<number | null>(null);
const selectedPackage = ref<number | null>(null); // Default kosong

// ✅ Fungsi mengambil harga dari backend
const fetchSubscriptionPrice = async () => {
  try {
    const response = await axios.get(`http://localhost:${import.meta.env.VITE_PORT}/ambil_harga`);
    console.log('✅ Harga langganan dari API:', response.data.harga_langganan);

    subscriptionPrice.value = response.data.harga_langganan;
    selectedPackage.value = response.data.harga_langganan;
    emit('update:modelValue', response.data.harga_langganan); // ✅ Kirim ke parent
  } catch (error) {
    console.error('❌ Gagal mengambil harga langganan:', error);
    subscriptionPrice.value = null;
  }
};

// ✅ Format harga ke IDR (Rp 1.000.000)
const formattedPrice = computed(() => {
  if (subscriptionPrice.value === null) return 'N/A';
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' })
    .format(subscriptionPrice.value)
    .replace(',00', ''); // Hapus ,00 agar lebih clean
});

onMounted(() => {
  fetchSubscriptionPrice();
});
</script>
