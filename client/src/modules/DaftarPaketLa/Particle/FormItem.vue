<script lang="ts">
import { addFasilitasPaketLA } from '@/service/fasilitas_paket_la';
import DeleteIconX from '@/modules/DaftarPaketLa/Icon/DeleteIconX.vue';
import Notification from '@/modules/DaftarPaketLa/Particle/Notification.vue';
import { ref } from 'vue';

const showNotification = ref<boolean>(false);
const notificationMessage = ref<string>('');
const notificationType = ref<'success' | 'error'>('success');

export default {
  components: { Notification, DeleteIconX },
  props: {
    isFormItemOpen: {
      type: Boolean,
      required: true,
    },
    paketlaId: {
      type: Number,
      required: true,
    },
  },
  setup(props, { emit }) {
    const items = ref([{ deskripsi: '', checkIn: '', checkOut: '', day: '', pax: '', price: '' }]);
    const errors = ref([]);
    const timeoutId = ref<number | null>(null);

    const addItem = () => {
      items.value.push({ deskripsi: '', checkIn: '', checkOut: '', day: '', pax: '', price: '' });
      errors.value.push({ deskripsi: '', checkIn: '', checkOut: '', day: '', pax: '', price: '' });
    };

    const removeItem = (index) => {
      items.value.splice(index, 1);
      errors.value.splice(index, 1);
    };

    // Notification function
    const displayNotification = (message: string, type: 'success' | 'error' = 'success') => {
      notificationMessage.value = message;
      notificationType.value = type;
      showNotification.value = true;

      if (timeoutId.value) clearTimeout(timeoutId.value);

      timeoutId.value = window.setTimeout(() => {
        showNotification.value = false;
      }, 3000);
    };

    const validate = () => {
      let isValid = true;
      items.value.forEach((item, index) => {
        errors.value[index] = {
          deskripsi: item.deskripsi ? '' : 'Deskripsi harus diisi',
          checkIn: item.checkIn ? '' : 'Tanggal check-in harus diisi',
          checkOut: item.checkOut ? '' : 'Tanggal check-out harus diisi',
          day: item.day
            ? Number(item.day) <= 0
              ? 'Jumlah hari harus lebih dari 0'
              : ''
            : 'Jumlah hari harus diisi',
          pax: item.pax
            ? Number(item.pax) <= 0
              ? 'Jumlah pax harus lebih dari 0'
              : ''
            : 'Jumlah pax harus diisi',
          price: item.price.replace(/[^\d]/g, '')
            ? Number(item.price.replace(/[^\d]/g, '')) <= 0
              ? 'Harga harus lebih dari 0'
              : ''
            : 'Harga harus diisi',
        };

        if (Object.values(errors.value[index]).some((err) => err !== '')) {
          isValid = false;
        }
      });
      return isValid;
    };

    const formatPrice = (index: number) => {
      const value =
        parseFloat(
          items.value[index].price
            .replace(/[^\d]/g, '') // Remove all characters except digits and dot
            .replace(/\./g, ''), // Remove all dots
        ) || 0;
      items.value[index].price = new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(value);
    };

    const saveData = async () => {
      if (!validate()) return;
      try {
        items.value.forEach((item, index) => {
          items.value[index].price = item.price.replace(/[^\d]/g, '');
        });
        await addFasilitasPaketLA({
          paketlaId: props.paketlaId,
          items: items.value.map((item) => ({
            description: item.deskripsi,
            check_in: item.checkIn,
            check_out: item.checkOut,
            day: item.day,
            pax: item.pax,
            price: item.price,
          })),
        });

        displayNotification('Data berhasil disimpan', 'success');
        setTimeout(() => emit('close'), 3000);
      } catch (error) {
        displayNotification(
          error.response?.data?.error_msg || 'Terjadi kesalahan saat menyimpan data.',
          'error',
        );
      }
    };

    return {
      items,
      errors,
      addItem,
      removeItem,
      saveData,
      showNotification,
      notificationMessage,
      notificationType,
      timeoutId,
      displayNotification,
      DeleteIconX,
      formatPrice,
    };
  },
};
</script>

<template>
  <div
    v-if="isFormItemOpen"
    class="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center bg-gray-500 bg-opacity-75"
  >
    <div class="bg-white rounded-lg shadow-xl w-full max-w-6xl p-6">
      <h3 class="text-3xl font-bold text-center text-gray-900 mb-6">Tambah Item Paket LA</h3>
      <div class="overflow-x-auto bg-gray-400 rounded-lg overflow-y-auto shadow-md max-h-[60vh]">
        <table
          class="w-full border-collapse border border-gray-100 shadow-lg rounded-lg overflow-hidden"
        >
          <thead>
            <tr class="bg-gray-300 text-gray-700 text-center">
              <th class="border border-gray-300 p-2 w-[30%]">DESKRIPSI</th>
              <th class="border border-gray-300 p-2 w-[15%]">CHECK-IN</th>
              <th class="border border-gray-300 p-2 w-[15%]">CHECK-OUT</th>
              <th class="border border-gray-300 p-2 w-[10%]">DAY</th>
              <th class="border border-gray-300 p-2 w-[10%]">PAX</th>
              <th class="border border-gray-300 p-2 w-[20%]">PRICE</th>
              <th class="border border-gray-300 p-2 w-[10%]"></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in items" :key="index" class="bg-gray-200 text-gray-600">
              <td class="border border-gray-300 p-2">
                <textarea
                  v-model="item.deskripsi"
                  rows="2"
                  class="w-full p-2 border rounded resize-y"
                  placeholder="Deskripsi"
                ></textarea>
                <p v-if="errors[index]?.deskripsi" class="text-sm text-red-600">
                  {{ errors[index].deskripsi }}
                </p>
              </td>
              <td class="border border-gray-300 p-2">
                <input v-model="item.checkIn" type="date" class="w-full p-2 border rounded" />
                <p v-if="errors[index]?.checkIn" class="text-sm text-red-600">
                  {{ errors[index].checkIn }}
                </p>
              </td>
              <td class="border border-gray-300 p-2">
                <input v-model="item.checkOut" type="date" class="w-full p-2 border rounded" />
                <p v-if="errors[index]?.checkOut" class="text-sm text-red-600">
                  {{ errors[index].checkOut }}
                </p>
              </td>
              <td class="border border-gray-300 p-2">
                <input
                  v-model="item.day"
                  type="number"
                  class="w-full p-2 border rounded"
                  placeholder="Day"
                />
                <p v-if="errors[index]?.day" class="text-sm text-red-600">
                  {{ errors[index].day }}
                </p>
              </td>
              <td class="border border-gray-300 p-2">
                <input
                  v-model="item.pax"
                  type="number"
                  class="w-full p-2 border rounded"
                  placeholder="Pax"
                />
                <p v-if="errors[index]?.pax" class="text-sm text-red-600">
                  {{ errors[index].pax }}
                </p>
              </td>
              <td class="border border-gray-300 p-2">
                <input
                  v-model="item.price"
                  @input="formatPrice(index)"
                  type="text"
                  class="w-full p-2 border rounded"
                  placeholder="Price"
                />
                <p v-if="errors[index]?.price" class="text-sm text-red-600">
                  {{ errors[index].price }}
                </p>
              </td>
              <td class="border border-gray-300 p-2">
                <div @click="removeItem(index)" class="cursor-pointer flex justify-center">
                  <DeleteIconX />
                </div>
              </td>
            </tr>
          </tbody>
          <tfoot>
            <tr class="bg-gray-300 text-gray-600">
              <td colspan="7" class="text-end p-2">
                <button
                  @click="addItem"
                  class="mt-3 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded"
                >
                  + Tambah Row Baru
                </button>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
      <div class="bg-gray-50 p-5 sm:flex sm:flex-row-reverse sm:px-3">
        <button
          @click="saveData"
          class="inline-flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
        >
          Lanjutkan
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
