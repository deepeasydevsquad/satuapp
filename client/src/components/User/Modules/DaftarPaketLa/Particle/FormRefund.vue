<script lang="ts">
import { getItemTransaksi, addRefundPaketLa } from '@/service/refund_paket_la';
import { watch, ref, computed, onMounted } from 'vue';
import Notification from '@/components/User/Modules/DaftarPaketLa/Particle/Notification.vue';
import CetakIcon from '@/components/User/Modules/DaftarPaketLa/Icon/CetakIcon.vue';

interface dataTransaksi {
  id: number;
  total_paid: number;
}

interface itemsPembayaran {
  refund: number;
  deposit_name: string;
  deposit_hp_number: string;
  deposit_address: string;
}

export default {
  components: { Notification, CetakIcon },
  props: {
    isFormRefundOpen: Boolean,
    paketlaId: Number,
    registerNumber: String
  },
  setup(props, { emit }) {
    const showNotification = ref(false);
    const notificationMessage = ref('');
    const notificationType = ref<'success' | 'error'>('success');
    const transaksi = ref<dataTransaksi[]>([]);
    const itemsPembayaran = ref<itemsPembayaran>({
      refund: 0,
      deposit_name: '',
      deposit_hp_number: '',
      deposit_address: ''
    });
    const errors = ref<{ [key: string]: string }>({});
    const timeoutId = ref<number | null>(null);
    let formattedData = ref('');

    const displayNotification = (message: string, type: 'success' | 'error' = 'success') => {
      notificationMessage.value = message;
      notificationType.value = type;
      showNotification.value = true;

      if (timeoutId.value) clearTimeout(timeoutId.value);
      timeoutId.value = window.setTimeout(() => {
        showNotification.value = false;
      }, 3000);
    };

    const validate = (): boolean => {
      const item = itemsPembayaran.value;
      errors.value = {};

      if (item.refund <= 0) errors.value.refund = 'Jumlah bayar harus lebih dari 0';
      if (item.refund > totalPaid.value) errors.value.refund = 'Jumlah bayar tidak boleh lebih besar dari total bayar';
      if (item.refund > totalPaid.value) {
        displayNotification('Jumlah bayar tidak boleh lebih besar dari total bayar', 'error');
      }
      if (!item.deposit_name) errors.value.deposit_name = 'Nama deposit harus diisi';
      if (!item.deposit_hp_number) errors.value.deposit_hp_number = 'Nomor HP deposit harus diisi';
      if (!item.deposit_address) errors.value.deposit_address = 'Alamat deposit harus diisi';

      return Object.keys(errors.value).length === 0;
    };

    const totalPaid = computed(() => {
      return transaksi.value?.total_paid || 0;
    });

    const formatPrice = (value: number | string): string => {
      const numericString = String(value).replace(/[^\d]/g, '').replace(/\./g, '');
      const numericValue = parseInt(numericString, 10) || 0;

      return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(numericValue);
    };

    const unformatPrice = (formatted: string | number): number => {
      const numericString = String(formatted).replace(/[^\d]/g, "").replace(/\./g, "");
      return parseInt(numericString, 10) || 0;
    };

    const saveData = async () => {
      if (!validate()) return;
      try {
        const response = await addRefundPaketLa({
          paketlaId: props.paketlaId,
          ...itemsPembayaran.value
        });

        displayNotification(response?.error_msg || "Paket berhasil disimpan!", "success");

        // Reset form
        itemsPembayaran.value = {refund: 0, deposit_name: '', deposit_hp_number: '', deposit_address: ''};
        formattedData.value = '';

        emit('close');
      } catch (error: any) {
        displayNotification(error.response?.data?.error_msg || 'Terjadi kesalahan saat menyimpan data.', 'error');
      }
    };

    const fetchData = async () => {
      console.groupCollapsed(`Fetching data for paketlaId ${props.paketlaId}`);
      try {
        const response = await getItemTransaksi({paketlaId: props.paketlaId});
        console.log('Response:', response); // Debugging
        transaksi.value = response.data;
        console.groupEnd();


      } catch (error) {
        displayNotification('Gagal mengambil data transaksi', 'error');
        console.error('Error fetching data:', error);
        console.groupEnd();
      }
    };

    watch(
      () => formattedData.value,
      (newVal) => {
        itemsPembayaran.value.refund = unformatPrice(newVal);
      },
      { deep: true },
    );

    onMounted(() => {
      fetchData();
    });

    return {
      transaksi,
      CetakIcon,
      itemsPembayaran,
      errors,
      showNotification,
      notificationMessage,
      notificationType,
      displayNotification,
      saveData,
      formatPrice,
      formattedData,
      totalPaid
    };
  }
};
</script>

<template>
  <div v-if="isFormRefundOpen" class="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
    <div class="flex min-h-screen justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
      <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" @click="$emit('close')"></div>
      <span class="hidden sm:inline-block sm:h-screen sm:align-middle" aria-hidden="true">&#8203;</span>
      <div class="relative inline-block transform overflow-hidden rounded-lg bg-white text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-xl sm:align-middle">
        <div class="p-6 mx-auto bg-white">
          <h3 class="text-2xl flex justify-center font-bold leading-6 text-gray-900 mb-4">Refund Transaksi Paket LA</h3>
          <div class="space-y-4 text-gray-600">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label class="block text-sm font-medium mb-1">Sudah Dibayar</label>
                <p class="w-full border rounded p-2 bg-gray-100">Rp {{ totalPaid.toLocaleString() }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium mb-1">Refund</label>
                <input
                  type="string"
                  class="w-full border rounded p-2"
                  v-model="formattedData"
                  @input="formattedData = formatPrice(formattedData);"
                  placeholder="Refund"
                />
                <p v-if="errors.refund" class="text-sm text-red-600">{{ errors.refund }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium mb-1">Nama Penyetor</label>
                <input
                  type="text"
                  class="w-full border rounded p-2"
                  v-model="itemsPembayaran.deposit_name"
                  placeholder="Nama Penyetor"
                />
                <p v-if="errors.deposit_name" class="text-sm text-red-600">{{ errors.deposit_name }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium mb-1">Nomor HP Penyetor</label>
                <input
                  type="text"
                  class="w-full border rounded p-2"
                  v-model="itemsPembayaran.deposit_hp_number"
                  placeholder="Nomor HP Penyetor"
                />
                <p v-if="errors.deposit_hp_number" class="text-sm text-red-600">{{ errors.deposit_hp_number }}</p>
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">Alamat Penyetor</label>
              <textarea
                class="w-full border rounded p-2"
                v-model="itemsPembayaran.deposit_address"
                placeholder="Alamat Penyetor"
                rows="3"
              ></textarea>
              <p v-if="errors.deposit_address" class="text-sm text-red-600">{{ errors.deposit_address }}</p>
            </div>
          </div>
        </div>
        <div class="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
          <button
            @click="saveData"
            class="inline-flex w-full justify-center rounded-md border bg-blue-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
          >
            Simpan
          </button>
          <button
            @click="$emit('close')"
            class="mt-3 inline-flex w-full justify-center rounded-md border border-gray-400 bg-gray-200 px-4 py-2 text-base font-medium text-gray-800 shadow-sm hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  </div>

  <Notification :showNotification="showNotification" :notificationType="notificationType" :notificationMessage="notificationMessage" @close="showNotification = false" />
</template>

<style scoped>
  input, textarea {
    border: 1px solid #ccc;
    padding: 8px;
    border-radius: 5px;
    text-align: start;
  }
</style>
