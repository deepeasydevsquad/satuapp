<script lang="ts">
import { getItemTransaksi, addPembayaranPaketLa } from '@/service/pembayaran_paket_la';
import { watch, ref, computed, onMounted } from 'vue';
import Notification from '@/modules/DaftarPaketLa/Particle/Notification.vue';
import CetakIcon from '@/modules/DaftarPaketLa/Icon/CetakIcon.vue';

interface ItemTransaksi {
  id: number;
  invoice: string;
  paid: number;
  status: string;
  date: string;
  receiver: string;
  price?: string;
}

interface DataTransaksi {
  id: number;
  total_price: number;
  total_paid: number;
  item_transaksi: ItemTransaksi[];
}

interface itemsPembayaran {
  paid: number;
  deposit_name: string;
  deposit_hp_number: string;
  deposit_address: string;
}

export default {
  components: { Notification, CetakIcon },
  props: {
    isFormPembayaranOpen: Boolean,
    paketlaId: Number,
    registerNumber: String,
  },
  setup(props, { emit }) {
    const showNotification = ref(false);
    const notificationMessage = ref('');
    const notificationType = ref<'success' | 'error'>('success');
    const transaksi = ref<DataTransaksi | null>(null);
    const itemsPembayaran = ref<itemsPembayaran>({
      paid: 0,
      deposit_name: '',
      deposit_hp_number: '',
      deposit_address: '',
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
      const total = transaksi.value ? transaksi?.value.total_price : 0;
      const paid = totalPaid.value + item.paid;
      errors.value = {};

      if (item.paid <= 0) errors.value.paid = 'Jumlah bayar harus lebih dari 0';
      if (paid > total) errors.value.paid = 'Jumlah bayar tidak boleh lebih besar dari total harga';
      if (paid > total) {
        displayNotification('Jumlah bayar tidak boleh lebih besar dari total harga', 'error');
      }
      if (!item.deposit_name) errors.value.deposit_name = 'Nama deposit harus diisi';
      if (!item.deposit_hp_number) errors.value.deposit_hp_number = 'Nomor HP deposit harus diisi';
      if (!item.deposit_address) errors.value.deposit_address = 'Alamat deposit harus diisi';

      return Object.keys(errors.value).length === 0;
    };

    const sisa = computed(() => {
      const paid = totalPaid.value + itemsPembayaran.value.paid;
      const total = transaksi.value ? transaksi?.value.total_price : 0;
      const sisa = total - paid;
      return sisa < 0 ? 0 : sisa;
    });

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
      const numericString = String(formatted).replace(/[^\d]/g, '').replace(/\./g, '');
      return parseInt(numericString, 10) || 0;
    };

    const saveData = async () => {
      if (!validate()) return;
      try {
        const response = await addPembayaranPaketLa({
          paketlaId: props.paketlaId,
          ...itemsPembayaran.value,
        });

        displayNotification(response?.error_msg || 'Paket berhasil disimpan!', 'success');

        // Reset form
        itemsPembayaran.value = {
          paid: 0,
          deposit_name: '',
          deposit_hp_number: '',
          deposit_address: '',
        };
        formattedData.value = '';

        emit('close');
      } catch (error: any) {
        displayNotification(
          error.response?.data?.error_msg || 'Terjadi kesalahan saat menyimpan data.',
          'error',
        );
      }
    };

    const cetakKwitansiTerakhir = async () => {
      try {
        if (!props.registerNumber) {
          displayNotification('Nomor register tidak tersedia', 'error');
          return;
        }

        const url = `/kwitansi-terakhir/${props.registerNumber}`;
        window.open(url, '_blank', 'noopener,noreferrer,width=800,height=600,scrollbars=yes');
      } catch (error) {
        console.error('Error printing register number:', error);
        displayNotification('Terjadi kesalahan saat membuka register number.', 'error');
      }
    };

    const fetchData = async () => {
      console.groupCollapsed(`Fetching data for paketlaId ${props.paketlaId}`);
      try {
        const response = await getItemTransaksi({ paketlaId: props.paketlaId });
        console.log('Response:', response); // Debugging
        transaksi.value = response.data;
        console.table(transaksi?.value.item_transaksi);
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
        itemsPembayaran.value.paid = unformatPrice(newVal);
      },
      { deep: true },
    );

    onMounted(() => {
      fetchData();
    });

    return {
      transaksi,
      CetakIcon,
      cetakKwitansiTerakhir,
      itemsPembayaran,
      errors,
      showNotification,
      notificationMessage,
      notificationType,
      displayNotification,
      saveData,
      formatPrice,
      formattedData,
      sisa,
      totalPaid,
    };
  },
};
</script>

<template>
  <div
    v-if="isFormPembayaranOpen"
    class="fixed inset-0 z-50 overflow-y-auto"
    aria-labelledby="modal-title"
    role="dialog"
    aria-modal="true"
  >
    <div class="flex min-h-screen justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
      <div
        class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
        aria-hidden="true"
        @click="$emit('close')"
      ></div>
      <span class="hidden sm:inline-block sm:h-screen sm:align-middle" aria-hidden="true"
        >&#8203;</span
      >
      <div
        class="relative inline-block transform overflow-hidden rounded-lg bg-white text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-5xl sm:align-middle"
      >
        <div class="p-6 mx-auto bg-white">
          <h3 class="text-2xl flex justify-center font-bold leading-6 text-gray-900 mb-4">
            Form Pembayaran Transaksi Paket LA
          </h3>
          <div class="space-y-4 text-gray-600">
            <!-- Tabel Dummy -->
            <div
              class="overflow-x-auto rounded-lg overflow-y-auto scroll-smooth shadow-md max-h-[33vh] border mb-4"
            >
              <table class="w-full mt-2 border text-center text-xs mb-3">
                <thead>
                  <tr class="bg-gray-100">
                    <th class="w-[15%] p-2 border">Nomor Invoice</th>
                    <th class="w-[20%] p-2 border">Biaya</th>
                    <th class="w-[10%] p-2 border">Status</th>
                    <th class="w-[15%] p-2 border">Tanggal Transaksi</th>
                    <th class="w-[25%] p-2 border">Penerima</th>
                    <th class="w-[5%] p-2 border">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-if="transaksi?.item_transaksi.length > 0"
                    v-for="(item, index) in transaksi?.item_transaksi"
                    :key="index"
                    class="text-center"
                  >
                    <td class="p-2 border">{{ item.invoice }}</td>
                    <td class="p-2 border">Rp {{ item.paid.toLocaleString() }}</td>
                    <td class="p-2 border capitalize">{{ item.status }}</td>
                    <td class="p-2 border">{{ item.date }}</td>
                    <td class="p-2 border">{{ item.receiver }}</td>
                    <td class="p-2 border">
                      <button class="px-1 py-1 bg-blue-500 text-white rounded flex items-center">
                        <CetakIcon class="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                  <tr v-else>
                    <td colspan="6" class="text-center text-sm p-4 text-gray-600">
                      Daftar riwayat transaksi paket la tidak ditemukan
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div>
                <label class="block text-sm font-medium mb-1">Total Harga</label>
                <p class="w-full border rounded p-2 bg-gray-100">
                  Rp {{ transaksi?.total_price.toLocaleString() }}
                </p>
              </div>
              <div>
                <label class="block text-sm font-medium mb-1">Bayar</label>
                <input
                  type="string"
                  class="w-full border rounded p-2"
                  v-model="formattedData"
                  @input="formattedData = formatPrice(formattedData)"
                  placeholder="Bayar"
                />
                <p v-if="errors.paid" class="text-sm text-red-600">{{ errors.paid }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium mb-1">Sudah Dibayar</label>
                <p class="w-full border rounded p-2 bg-gray-100">
                  Rp {{ totalPaid.toLocaleString() }}
                </p>
              </div>
              <div>
                <label class="block text-sm font-medium mb-1">Sisa</label>
                <p class="w-full border rounded p-2 bg-gray-100">Rp {{ sisa.toLocaleString() }}</p>
                <p v-if="errors.sisa" class="text-sm text-red-600">{{ errors.sisa }}</p>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div>
                <label class="block text-sm font-medium mb-1">Nama Penyetor</label>
                <input
                  type="text"
                  class="w-full border rounded p-2"
                  v-model="itemsPembayaran.deposit_name"
                  placeholder="Nama Penyetor"
                />
                <p v-if="errors.deposit_name" class="text-sm text-red-600">
                  {{ errors.deposit_name }}
                </p>
              </div>
              <div>
                <label class="block text-sm font-medium mb-1">Nomor HP Penyetor</label>
                <input
                  type="text"
                  class="w-full border rounded p-2"
                  v-model="itemsPembayaran.deposit_hp_number"
                  placeholder="Nomor HP Penyetor"
                />
                <p v-if="errors.deposit_hp_number" class="text-sm text-red-600">
                  {{ errors.deposit_hp_number }}
                </p>
              </div>
              <div>
                <label class="block text-sm font-medium mb-1">Alamat Penyetor</label>
                <textarea
                  class="w-full border rounded p-2"
                  v-model="itemsPembayaran.deposit_address"
                  placeholder="Alamat Penyetor"
                  rows="3"
                ></textarea>
                <p v-if="errors.deposit_address" class="text-sm text-red-600">
                  {{ errors.deposit_address }}
                </p>
              </div>
            </div>
          </div>
        </div>
        <div class="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
          <button
            @click="saveData"
            class="inline-flex w-full justify-center rounded-md border bg-blue-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
          >
            Bayar
          </button>
          <button
            @click="cetakKwitansiTerakhir()"
            class="mt-3 inline-flex w-full justify-center rounded-md border bg-blue-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
          >
            Cetak Kwitansi Terakhir
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

  <Notification
    :showNotification="showNotification"
    :notificationType="notificationType"
    :notificationMessage="notificationMessage"
    @close="showNotification = false"
  />
</template>

<style scoped>
input,
textarea {
  border: 1px solid #ccc;
  padding: 8px;
  border-radius: 5px;
  text-align: start;
}
</style>
