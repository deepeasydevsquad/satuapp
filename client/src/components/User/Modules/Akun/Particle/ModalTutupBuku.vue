<script setup lang="ts">
  import Notification from "../../../../Modal/Notification.vue"
  import Confirmation from "../../../../Modal/Confirmation.vue"
  import { defineProps, defineEmits } from 'vue'
  import { ref } from 'vue';
  import { tutupBuku } from "../../../../../service/akun"; // Import function POST

  interface ErrorsAdd {
    nama_periode: string;
  }

  interface dataTutupBuku {
    nama_periode: string;
  }

  interface Props {
    showStatus: boolean;
  }

  const props = defineProps<Props>();

  const emit = defineEmits(["close", "update-statusShow"]);
  const showNotification = ref<boolean>(false);
  const showConfirmDialog = ref<boolean>(false);
  const confirmMessage = ref<string>('');
  const confirmTitle = ref<string>('');
  const confirmAction = ref<(() => void) | null>(null);
  const notificationMessage = ref<string>('');
  const notificationType = ref<'success' | 'error'>('success');
  const errors_message = ref<ErrorsAdd>({
    nama_periode :'',
  });
  const dataTutupBuku = ref<Partial<dataTutupBuku>>({
    nama_periode : ''
  });

  const validateFormAddAkun = async (): Promise<boolean> => {
    errors_message.value = { nama_periode : '' };
    let isValid = true;
    if (!dataTutupBuku.value.nama_periode?.trim()) {
      errors_message.value.nama_periode = 'Nama Periode tidak boleh kosong';
      isValid = false;
    }
    return isValid;
  };

  const tutupBukuFN = async () => {
    if (! await validateFormAddAkun()) return;
    try {
      const response = await tutupBuku(dataTutupBuku.value);
      dataTutupBuku.value = {};
      emit('update-statusShow', false);
      displayNotification(response.error_msg);
    } catch (error) {
      displayNotification(error.response.error_msg);
    }
  };

  const displayNotification = (message: string, type: 'success' | 'error' = 'success') => {
    notificationMessage.value = message;
    notificationType.value = type;
    showNotification.value = true;
  };

  const closeModal = () => {
    emit('close')
  };

</script>

<template>
  <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="transform scale-95 opacity-0"
        enter-to-class="transform scale-100 opacity-100"
        leave-active-class="transition duration-200 ease-in"
        leave-from-class="transform scale-100 opacity-100"
        leave-to-class="transform scale-95 opacity-0"
      >
    <div v-if="showStatus" class="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div class="flex min-h-screen items-end justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" @click="emit('close')"></div>
        <span class="hidden sm:inline-block sm:h-screen sm:align-middle" aria-hidden="true">&#8203;</span>
        <div class="relative inline-block transform overflow-hidden rounded-lg bg-white text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:align-middle">
          <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <h3 class="text-2xl flex justify-center font-bold leading-6 text-gray-900 mb-4">Tutup Buku</h3>
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Nama Periode Sekarang</label>
                <input class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-600 font-normal" placeholder="Nama Periode Sekarang" type="text" id="rupiah" v-model="dataTutupBuku.nama_periode"/>
                <p v-if="errors_message.nama_periode" class="mt-1 text-sm text-red-600">{{ errors_message.nama_periode }}</p>
              </div>
            </div>
          </div>
          <div class="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
            <footer>
              <button @click="closeModal"
                class="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm" >
                Batal
              </button>
              <button @click="tutupBukuFN"
                class="inline-flex w-full justify-center rounded-md border border-transparent bg-[#333a48] px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm" >
                  Simpan dan Tutup Buku
              </button>
            </footer>
          </div>
        </div>
      </div>
    </div>
  </Transition>

  <!-- Confirmation Dialog -->
  <Confirmation  :showConfirmDialog="showConfirmDialog"  :confirmTitle="confirmTitle" :confirmMessage="confirmMessage" >
    <button @click="confirmAction && confirmAction()"
      class="inline-flex w-full justify-center rounded-md border border-transparent bg-yellow-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
    >
      Ya
    </button>
    <button
      @click="showConfirmDialog = false"
      class="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
    >
      Tidak
    </button>
  </Confirmation>

  <!-- Notification -->
  <Notification  :showNotification="showNotification"  :notificationType="notificationType" :notificationMessage="notificationMessage" @close="showNotification = false"  ></Notification>

</template>
