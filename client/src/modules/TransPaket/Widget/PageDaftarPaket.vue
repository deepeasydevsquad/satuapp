<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { VueperSlides, VueperSlide } from 'vueperslides';
import 'vueperslides/dist/vueperslides.css';
import { getDaftarPaket } from '@/service/trans_paket';
import Notification from '@/modules/TransPaket/Particle/Notification.vue';
import PrimaryButton from '@/components/Button/PrimaryButton.vue';
const BASE_URL = import.meta.env.VITE_APP_API_BASE_URL;

interface Paket {
  id: number;
  division_name: string;
  division_id: number;
  name: string;
  kode: string;
  photo: string;
  durasi: number;
  departure_date: string;
  prices: {
    min: number;
    max: number;
  };
  total_jamaah: number;
}

const isLoading = ref(false);
const daftarPaket = ref<Paket[]>([]);
const notificationMessage = ref<string>('');
const notificationType = ref<'success' | 'error'>('success');
const showNotification = ref<boolean>(false);
const timeoutId = ref<number | null>(null);

const displayNotification = (message: string, type: 'success' | 'error' = 'success') => {
  notificationMessage.value = message;
  notificationType.value = type;
  showNotification.value = true;

  if (timeoutId.value) clearTimeout(timeoutId.value);

  timeoutId.value = window.setTimeout(() => {
    showNotification.value = false;
  }, 3000);
};

const fetchDaftarPaket = async () => {
  isLoading.value = true;
  try {
    const response = await getDaftarPaket();
    daftarPaket.value = response.data;
  } catch (error) {
    console.error('Error fetching daftar paket:', error);
    displayNotification(error?.response?.data?.error_msg || 'Gagal memuat daftar paket', 'error');
  } finally {
    isLoading.value = false;
  }
};

const emit = defineEmits<{
  (e: 'showDetailPaket', paketId: number, division_id: number): void;
}>();

const handleBeliPaket = (
  id: number,
  division_id: number,
  division_name: string,
  paket_name: string,
) => {
  emit('showDetailPaket', id, division_id, division_name, paket_name);
};

const formatPrice = (price: number) => {
  if (price === 0) return 'Rp 0';
  const priceInMillions = price / 1_000_000;
  return `Rp ${priceInMillions.toFixed(1)}jt`;
};

onMounted(() => {
  fetchDaftarPaket();
});
</script>

<template>
  <div class="py-4 px-0 bg-white rounded-b-lg text-gray-800">
    <div
      v-if="isLoading"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
    >
      <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-400"></div>
    </div>
    <div v-else>
      <template v-if="daftarPaket.length">
        <vueper-slides
          class="no-shadow w-full"
          :visible-slides="4.5"
          slide-multiple
          :arrows="false"
          :bullets="false"
          :gap="2"
          :slide-ratio="1 / 6"
          :dragging-distance="70"
          :breakpoints="{ 800: { visibleSlides: 2, slideMultiple: 2 } }"
          fixed-height="750px"
        >
          <vueper-slide
            v-for="paket in daftarPaket"
            :key="paket.id"
            class="flex items-center justify-center"
            content-visible
            fixed-height="750px"
          >
            <template #content>
              <div class="bg-white border rounded-lg shadow-sm hover:shadow-md transition">
                <div
                  class="relative w-full h-96 rounded-t-lg bg-gray-200"
                  :class="{ 'bg-gray-300': !paket.photo || paket.photo === '-' }"
                >
                  <img
                    v-if="paket.photo && paket.photo !== '-'"
                    :src="BASE_URL + paket.photo"
                    :alt="`Foto Paket ${paket.name}`"
                    class="w-full h-full object-cover"
                    @error="paket.photo = '-'"
                  />
                  <div
                    v-else
                    class="absolute inset-0 flex items-center justify-center text-gray-500 border-2 border-dashed border-gray-400"
                  >
                    <p class="text-xl font-semibold">Gambar tidak ditemukan</p>
                  </div>
                </div>
                <h3
                  class="p-2 mt-3 text-lg font-bold text-center min-h-[4.5rem] leading-snug line-clamp-2"
                >
                  {{ paket.name }}
                </h3>
                <div class="pr-4 pl-4 space-y-8 pb-8 pt-4">
                  <div class="grid grid-cols-2 gap-y-2 text-sm px-0">
                    <div class="flex items-center gap-1">
                      <font-awesome-icon
                        :icon="['fas', 'code-branch']"
                        class="w-4 h-4 text-gray-600 pr-2"
                      /><span>Cabang</span>
                    </div>
                    <div class="ml-6 font-semibold text-right">{{ paket.division_name }}</div>
                    <div class="flex items-center gap-1">
                      <font-awesome-icon
                        :icon="['fas', 'qrcode']"
                        class="w-4 h-4 text-gray-600 pr-2"
                      /><span>Kode Paket</span>
                    </div>
                    <div class="ml-6 font-semibold text-right">{{ paket.kode }}</div>
                    <div class="flex items-center gap-1">
                      <font-awesome-icon
                        :icon="['fas', 'calendar']"
                        class="w-4 h-4 text-gray-600 pr-2"
                      /><span>Jdwl. Berangkat</span>
                    </div>
                    <div class="ml-6 font-semibold text-right">{{ paket.departure_date }}</div>
                    <div class="flex items-center gap-1">
                      <font-awesome-icon
                        :icon="['far', 'clock']"
                        class="w-4 h-4 text-gray-600 pr-2"
                      /><span>Durasi Perjalanan</span>
                    </div>
                    <div class="ml-6 font-semibold text-right">{{ paket.durasi }} Hari</div>
                    <div class="flex items-center gap-1">
                      <font-awesome-icon
                        :icon="['far', 'user']"
                        class="w-4 h-4 text-gray-600 pr-2"
                      /><span>Total Jamaah</span>
                    </div>
                    <div class="ml-6 font-semibold text-right">{{ paket.total_jamaah }} Orang</div>
                    <div class="flex items-start gap-1">
                      <font-awesome-icon
                        :icon="['fas', 'money-bill']"
                        class="w-4 h-4 text-gray-600 pr-2"
                      /><span>Harga</span>
                    </div>
                    <div class="flex flex-col justify-start min-h-[2.5rem]">
                      <span class="ml-6 font-semibold text-blue-600 text-right">{{
                        formatPrice(paket.prices.min)
                      }}</span>
                      <span
                        v-if="paket.prices.min !== paket.prices.max"
                        class="ml-6 font-semibold text-blue-600 text-right"
                      >
                        {{ formatPrice(paket.prices.max) }}
                      </span>
                    </div>
                  </div>
                  <PrimaryButton
                    @click="
                      handleBeliPaket(paket.id, paket.division_id, paket.division_name, paket.name)
                    "
                    :auto="false"
                    >BELI PAKET</PrimaryButton
                  >
                </div>
              </div>
            </template>
          </vueper-slide>
        </vueper-slides>
      </template>
      <template v-else>
        <div class="flex flex-col items-center justify-center h-64">
          <font-awesome-icon :icon="['fas', 'box-open']" class="w-12 h-12 text-gray-400 mb-4" />
          <p class="text-gray-600 text-lg">Tidak ada paket tersedia saat ini.</p>
        </div>
      </template>
    </div>
  </div>
  <Notification
    :showNotification="showNotification"
    :notificationType="notificationType"
    :notificationMessage="notificationMessage"
    @close="showNotification = false"
  />
</template>
