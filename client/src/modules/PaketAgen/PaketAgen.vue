<script setup lang="ts">
import Confirmation from '@/components/Modal/Confirmation.vue';
import PrimaryButton from '@/components/Button/PrimaryButton.vue';
import Form from '@/components/Modal/Form.vue';
import InputText from '@/components/Form/InputText.vue';
import SelectField from '@/components/Form/SelectField.vue';
import TextArea from '@/components/Form/TextArea.vue';
import Notification from '@/components/Modal/Notification.vue';
import InputReadonly from '@/components/Form/InputReadonly.vue';
import LightButton from '@/components/Button/LightButton.vue';
import DangerButton from '@/components/Button/DangerButton.vue';
import IconDetail from '@/components/Icons/IconDetail.vue';
import CetakIcon from '@/components/Icons/CetakIcon.vue';
import Pagination from '@/components/Pagination/Pagination.vue';
import NabungIcon from '@/modules/TabunganUmrah/Icon/NabungIcon.vue';
import { ref, watch, computed, onMounted } from 'vue';
import { on } from 'events';

import { get_paket_agen } from '@/service/paket_agen';
import FormPembayaran from '../TransPaket/Particle/FormPembayaran.vue';

const showModalDetail = ref(false);
const showModal = ref(false);
const status = ref<string>('tutup');
const totalRow = ref(0);
const currentPage = ref(1);
const totalPages = ref(1);
const showNotification = ref(false);
const notificationMessage = ref('');
const notificationType = ref('');
const showConfirmDialog = ref(false);
const confirmMessage = ref('');
const confirmTitle = ref('');
const confirmAction = ref<(() => void) | null>(null);
const timeoutId = ref<number | null>(null);

const PembayaranSuccess = () => {
  modalPembayaran.value = false;
  displayNotification('Pembayaran berhasil', 'success');
};

const displayNotification = (message: string, type: 'success' | 'error' = 'success') => {
  notificationMessage.value = message;
  notificationType.value = type;
  showNotification.value = true;
  resetNotificationTimeout();
};

const resetNotificationTimeout = () => {
  if (timeoutId.value) clearTimeout(timeoutId.value);
  timeoutId.value = window.setTimeout(() => {
    showNotification.value = false;
  }, 3000);
};

const showConfirmation = (title: string, message: string, action: () => void) => {
  confirmTitle.value = title;
  confirmMessage.value = message;
  confirmAction.value = action;
  showConfirmDialog.value = true;
};

const formatRupiah = (angka: any, prefix = 'Rp ') => {
  let numberString = angka.toString().replace(/\D/g, ''),
    split = numberString.split(','),
    sisa = split[0].length % 3,
    rupiah = split[0].substr(0, sisa),
    ribuan = split[0].substr(sisa).match(/\d{3}/g);

  if (ribuan) {
    let separator = sisa ? '.' : '';
    rupiah += separator + ribuan.join('.');
  }

  return prefix + (rupiah || '0').trim() + ',-';
};

const pages = computed<number[]>(() => {
  return Array.from({ length: totalPages.value }, (_, i) => i + 1);
});
const totalColumns = 5; // karena table punya 5 kolom

const searchQuery = ref('');

const handlePrev = () => {
  if (currentPage.value > 1) currentPage.value--;
};
const handleNext = () => {
  if (currentPage.value < totalPages.value) currentPage.value++;
};
const handlePageNow = (page: number) => {
  currentPage.value = page;
};

const filteredData = computed(() => {
  console.log('Search:', searchQuery.value);
  console.log('Data:', data.value);

  if (!searchQuery.value) return data.value;

  const keyword = searchQuery.value.toLowerCase();

  const result = data.value.filter(
    (item) =>
      item.nama_agen?.toLowerCase().includes(keyword) ||
      item.agen_id?.toString().includes(keyword) ||
      item.whatsapp_number?.includes(keyword) ||
      item.rekrutans?.some(
        (jamaah: any) =>
          jamaah.fullname?.toLowerCase().includes(keyword) ||
          jamaah.identity_number?.includes(keyword),
      ),
  );

  console.log('Filtered Result:', result);
  return result;
});

const props = defineProps<{
  paketId: number;
}>();
const data = ref<any[]>([]); // array kosong

const fetchData = async () => {
  try {
    const response = await get_paket_agen({ paket_id: props.paketId });
    data.value = response.data;
    status.value = response.status_tutup;
    totalRow.value = response.total;
    console.log('-----response');
    console.log(response);
    console.log(totalRow.value);
    console.log('-----response');
  } catch (error) {
    console.error(error);
  }
};

onMounted(() => {
  fetchData();
  searchQuery.value = '';
});

const modalPembayaran = ref(false);
const agen_id = ref(0);

const openModalPembayaran = (id: number) => {
  modalPembayaran.value = true;
  agen_id.value = id;
};
</script>

<template>
  <div class="container mx-auto p-4 min-h-screen">
    <div class="flex justify-between items-center mb-4">
      <div class="flex justify-end items-center w-full">
        <label for="search" class="block text-sm font-medium text-gray-700 mr-2">Search</label>
        <input
          v-model="searchQuery"
          type="text"
          id="search"
          class="block w-64 px-3 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 placeholder:text-gray-400"
          placeholder="Cari Agen..."
        />
      </div>
    </div>
    <div class="overflow-hidden rounded-lg border border-gray-200 shadow-md">
      <table class="w-full border-collapse bg-white text-left text-sm text-gray-500">
        <thead class="bg-gray-100">
          <tr>
            <th class="text-center font-medium px-6 text-gray-900 py-3 text-sm w-[35%]">
              Info Agen
            </th>
            <th class="text-center font-medium px-6 text-gray-900 py-3 text-sm w-[30%]">
              Info Jamaah
            </th>
            <th class="text-center font-medium px-6 text-gray-900 py-3 text-sm w-[15%]">Fee</th>
            <th class="text-center font-medium px-6 text-gray-900 py-3 text-sm w-[15%]">
              Sudah Bayar
            </th>
            <th class="text-center font-medium px-6 text-gray-900 py-3 text-sm w-[5%]">Aksi</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200">
          <tr v-if="Object.keys(data).length === 0">
            <td colspan="5" class="text-center py-3 text-sm text-gray-500">
              Daftar Agen Tidak Ditemukan
            </td>
          </tr>
          <tr
            v-else
            v-for="item in filteredData"
            :key="item.agen_id"
            class="hover:bg-gray-50 transition-colors"
            :class="status == 'tutup' ? ' pointer-events-none opacity-50 ' : ''"
          >
            <!-- Info Agen -->
            <td class="px-6 py-4 border-b text-left align-top">
              <div class="py-1">
                <span class="inline-block w-20 font-bold">Nama Agen</span>:
                {{ item.nama_agen }}
              </div>
              <div class="py-1">
                <span class="inline-block w-20 font-bold">Level</span>:
                {{ item.level_keagenan }}
              </div>
              <div class="py-1">
                <span class="inline-block w-20 font-bold">No WA</span>:
                {{ item.whatsapp_number }}
              </div>
            </td>

            <!-- Info Jamaah -->
            <td class="px-4 py-2 border-b text-left align-top">
              <div
                v-for="jamaah in item.rekrutans"
                :key="jamaah.id"
                class="border-b border-gray-100 last:border-none py-2"
              >
                <div class="py-1">
                  <span class="inline-block w-30 font-bold">Nama Jamaah</span>:
                  {{ jamaah.fullname }}
                </div>
                <div class="py-1">
                  <span class="inline-block w-30 font-bold">No Identitas</span>:
                  {{ jamaah.identity_number }}
                </div>
              </div>
            </td>
            <!-- Fee -->
            <td class="px-6 py-4 border-b text-center align-top">
              <div class="py-1">
                {{ formatRupiah(item.total_belum_lunas ?? 0) }}
              </div>
            </td>
            <!-- Sudah Bayar -->
            <td class="px-6 py-4 border-b text-center align-top">
              <div class="py-1">
                {{ formatRupiah(item.total_lunas ?? 0) }}
              </div>
            </td>
            <!-- Aksi -->
            <td class="px-6 py-5 border-b text-center align-top">
              <template v-if="status == 'buka'">
                <LightButton @click="openModalPembayaran(item.agen_id)">
                  <i class="pi pi-money-bill"></i>
                </LightButton>
              </template>
              <template v-else>
                <span class="italic">Paket ini sudah ditutup</span>
              </template>
            </td>
          </tr>
        </tbody>
        <tfoot class="bg-gray-100 font-bold">
          <Pagination
            :currentPage="currentPage"
            :totalPages="totalPages"
            :pages="pages"
            :totalColumns="totalColumns"
            @prev-page="handlePrev"
            @next-page="handleNext"
            @page-now="handlePageNow"
            :totalRow="totalRow"
          />
        </tfoot>
      </table>
    </div>
  </div>

  <FormPembayaran
    :formStatus="modalPembayaran"
    :agen_id="agen_id"
    @cancel="modalPembayaran = false"
    @close="modalPembayaran = false"
    @submitted="
      () => {
        fetchData();
        PembayaranSuccess();
      }
    "
  />

  <Notification
    :showNotification="showNotification"
    :notificationType="notificationType"
    :notificationMessage="notificationMessage"
    @close="showNotification = false"
  />
</template>
