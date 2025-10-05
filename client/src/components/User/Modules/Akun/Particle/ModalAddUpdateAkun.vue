<script setup lang="ts">
  import Notification from "@/components/Modal/Notification.vue"
  import Confirmation from "@/components/Modal/Confirmation.vue"
  import Form from "@/components/Modal/Form.vue"
  import { defineProps, defineEmits } from 'vue'
  import { ref, watchEffect } from 'vue';
  import { checkAkun, addAkun, editAkun } from "@/service/akun"; // Import function POST

  interface ErrorsAdd {
    nomor_add_akun: string;
    nama_add_akun: string;
  }

  interface addUpdateAkunInterface {
    primary_id: number;
    prefix: string,
    nomor: string;
    nama: string;
  }

  interface Props {
    showStatus: boolean;
    selectedAkun?: number,
    data: Partial<addUpdateAkunInterface>;
  }

  const props = defineProps<Props>();
  const emit = defineEmits(["close", "update-statusShow"]);
  const selectedAkun = ref<number>();
  const showNotification = ref<boolean>(false);
  const showConfirmDialog = ref<boolean>(false);
  const confirmMessage = ref<string>('');
  const confirmTitle = ref<string>('');
  const confirmAction = ref<(() => void) | null>(null);
  const notificationMessage = ref<string>('');
  const notificationType = ref<'success' | 'error'>('success');
  const errors_message = ref<ErrorsAdd>({
    nomor_add_akun: '',
    nama_add_akun: '',
  });
  const dataAddUpdateAkun = ref<Partial<addUpdateAkunInterface>>({
    primary_id : 0,
    prefix : '',
    nomor: '',
    nama : '',
  });

  const validateFormAddAkun = async (): Promise<boolean> => {

    errors_message.value = { nomor_add_akun: '', nama_add_akun: '' };

    let isValid = true;

    if (!dataAddUpdateAkun.value.nomor?.trim()) {
      errors_message.value.nomor_add_akun = 'Nomor Akun tidak boleh kosong';
      isValid = false;
    }

    if (dataAddUpdateAkun.value.nomor?.trim().length != 4) {
      errors_message.value.nomor_add_akun = 'Panjang Nomor Akun Hanya 4 Digit, Tidak Boleh Lebih atau Kurang.';
      isValid = false;
    }

    if (!dataAddUpdateAkun.value.nama?.trim()) {
      errors_message.value.nama_add_akun = 'Nama Akun tidak boleh kosong';
      isValid = false;
    }

    if( isValid  === true ) {
      const response = await checkAkun({id: selectedAkun.value, nomor_akun: dataAddUpdateAkun.value.nomor, prefix: props.data.prefix, primary_id: props.data.primary_id });
      if( response.error == true) {
        var detailError = response.detail;
        for ( let x in detailError ) {
          if( detailError[x].path === 'nomor_akun') {
            errors_message.value.nomor_add_akun = errors_message.value.nomor_add_akun + detailError[x].msg;
          } else if( detailError[x].path === 'prefix' ) {
            errors_message.value.nomor_add_akun = errors_message.value.nomor_add_akun + detailError[x].msg;
          } else if( detailError[x].path === 'primary_id' ) {
            errors_message.value.nomor_add_akun = errors_message.value.nomor_add_akun + detailError[x].msg;
          }
        }
      }
    }

    return isValid;
  };

  const save = async () => {
    if (! await validateFormAddAkun()) return;
    const isEdit = !!props.selectedAkun;
    const action = async () => {
      try {
        if (isEdit) {
          var editData = dataAddUpdateAkun.value;
          editData = {...editData,...{id: selectedAkun.value }}
          const response = await editAkun(editData );
          dataAddUpdateAkun.value = {};
          showConfirmDialog.value = false;
          emit('update-statusShow', false);
          displayNotification(response.error_msg);
        } else {
          dataAddUpdateAkun.value.primary_id = props.data.primary_id;
          dataAddUpdateAkun.value.prefix = props.data.prefix;
          const response = await addAkun(dataAddUpdateAkun.value);
          showConfirmDialog.value = false;
          emit('update-statusShow', false);
          displayNotification(response.error_msg);
          dataAddUpdateAkun.value = {};
        }
      } catch (error) {
        showConfirmDialog.value = false;
      }
    };

    isEdit ? showConfirmation('Konfirmasi Perubahan', 'Apakah Anda yakin ingin mengubah data ini?', action) : action();
  };

  const displayNotification = (message: string, type: 'success' | 'error' = 'success') => {
    notificationMessage.value = message;
    notificationType.value = type;
    showNotification.value = true;
  };

  const showConfirmation = (title: string, message: string, action: () => void) => {
    confirmTitle.value = title;
    confirmMessage.value = message;
    confirmAction.value = action;
    showConfirmDialog.value = true;
  };

  const closeModal = () => {
    emit('close')
    dataAddUpdateAkun.value = {};
  };

  watchEffect(async () => {
    selectedAkun.value = props.selectedAkun;
    dataAddUpdateAkun.value.primary_id = props.data.primary_id;
    dataAddUpdateAkun.value.prefix = props.data.prefix;
    dataAddUpdateAkun.value.nomor = props.data.nomor;
    dataAddUpdateAkun.value.nama = props.data.nama;
  });

</script>

<template>
  <Form :form-status="showStatus" :label="selectedAkun ? 'Perbaharui Akun' : 'Tambah Akun Baru'" @close="closeModal()" @cancel="closeModal()" @submit="save"
    width="sm:w-full sm:max-w-md" :submitLabel="selectedAkun ? 'PERBAHARUI AKUN' : 'TAMBAH AKUN BARU'">
    <div class="space-y-4">
      <div>
        <label for="website-admin" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Nomor Akun</label>
        <div class="flex">
          <span class="inline-flex items-center px-3 text-sm text-gray-900 bg-gray-200 border rounded-e-0 border-gray-300 border-e-0 rounded-s-md dark:bg-gray-600 dark:text-gray-400 dark:border-gray-600">
            {{ data.prefix }}
          </span>
          <input type="text" id="website-admin" v-model="dataAddUpdateAkun.nomor" class="rounded-none bg-gray-50 border-t border-b border-e text-gray-900 focus:ring-blue-500 focus:border-blue-500 block flex-1 min-w-0 w-full text-sm border-gray-300 p-2.5 rounded-e dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Nomor Akun">
        </div>
        <p v-if="errors_message.nomor_add_akun" class="mt-1 text-sm text-red-600 italic">{{ errors_message.nomor_add_akun }}</p>
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Nama Akun</label>
        <input type="text" v-model="dataAddUpdateAkun.nama" class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-600 font-normal" placeholder="Nama Akun" />
        <p v-if="errors_message.nama_add_akun" class="mt-1 text-sm text-red-600">{{ errors_message.nama_add_akun }}</p>
      </div>
    </div>
  </Form>

  <!-- Confirmation Dialog -->
  <Confirmation  :showConfirmDialog="showConfirmDialog"  :confirmTitle="confirmTitle" :confirmMessage="confirmMessage" >
    <button @click="confirmAction && confirmAction()"
      class="inline-flex w-full justify-center rounded-md border border-transparent bg-yellow-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm" >
      Ya
    </button>
    <button
      @click="showConfirmDialog = false"
      class="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm" >
      Tidak
    </button>
  </Confirmation>

  <!-- Notification -->
  <Notification  :showNotification="showNotification"  :notificationType="notificationType" :notificationMessage="notificationMessage" @close="showNotification = false"  ></Notification>

</template>
