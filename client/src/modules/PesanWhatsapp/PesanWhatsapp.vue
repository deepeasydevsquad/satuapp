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
import EditIcon from '@/modules/Airlines/Icon/EditIcon.vue';
import DeleteIcon from '@/components/Icons/DeleteIcon.vue';
import Pagination from '@/components/Pagination/Pagination.vue';
import { ref, watch, computed, onMounted } from 'vue';

const currentPage = ref(1);
const totalPages = ref(1);
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

import {
  get_nomor_company,
  get_initial_data,
  get_message,
  daftar_pesan,
  add_pesan,
  delete_pesan,
} from '@/service/pesan_whatsapp';
import { get } from 'http';

const showModal = ref(false);

const showNotification = ref(false);
const notificationMessage = ref('');
const notificationType = ref('');

const showConfirmDialog = ref(false);
const confirmMessage = ref('');
const confirmTitle = ref('');
const confirmAction = ref<(() => void) | null>(null);
const templateOptions = ref<{ id: number | string; name: string }[]>([]);
const timeoutId = ref<number | null>(null);

const data = ref({
  id: '',
  nomor_asal: '',
  jenis: '',
  status: '',
  pesan: '',
});

const data_pesan = ref({
  nomor_asal: '',
  nomor_tujuan: '',
  type: '',
  pesan: '',
  whatsapp_template_id: '',
  jumlah_nomor: '',
});

const fetch_data = async () => {
  try {
    const response = await daftar_pesan();
    data.value = response;
    console.log(data.value);
  } catch (error) {
    console.error('Error fetching data:', error);
  }
};

const ambil_nomor_company = async () => {
  const response = await get_nomor_company();
  data_pesan.value.nomor_asal = response.whatsapp_device_number;
  console.log('response', response);
};

watch(
  () => data_pesan.value.type,
  (newVal) => {
    if (newVal && newVal !== 'pesan_biasa') {
      const fetchJumlahNomor = async () => {
        try {
          const response = await get_initial_data({ type: newVal });
          data_pesan.value.jumlah_nomor = response.jumlah_nomor;

          // isi dropdown template
          templateOptions.value = response.templates || [];
        } catch (error) {
          data_pesan.value.jumlah_nomor = '';
          templateOptions.value = [];
        }
      };
      fetchJumlahNomor();
    } else {
      data_pesan.value.jumlah_nomor = '';
      // reset ke template default
      templateOptions.value = [{ id: '', name: 'Pesan Biasa' }];
    }
  },
);

watch(
  () => data_pesan.value.whatsapp_template_id,
  async (newVal) => {
    // Cek dulu jangan kosong dan bukan 'pesan_biasa'
    if (newVal && data_pesan.value.type !== 'pesan_biasa') {
      try {
        const response = await get_message({ template_id: newVal }); // pastiin sesuai parameternya
        data_pesan.value.pesan = response.message || '';
      } catch (error) {
        console.error('Gagal ambil isi pesan:', error);
        data_pesan.value.pesan = '';
      }
    } else {
      // kalau ga ada template atau tipe-nya 'pesan_biasa', kosongin aja
      data_pesan.value.pesan = '';
    }
  },
);

onMounted(() => {
  ambil_nomor_company();
  fetch_data();
});

const resetForm = () => {
  data_pesan.value = {
    nomor_asal: '',
    nomor_tujuan: '',
    type: '',
    pesan: '',
    whatsapp_template_id: '',
    jumlah_nomor: '',
  };
  templateOptions.value = [];
  ambil_nomor_company(); // biar nomor_asal keisi ulang
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

const handle_submit = async () => {
  try {
    // inject template ID kalau perlu (bisa juga dari select dropdown)
    if (data_pesan.value.type !== 'pesan_biasa') {
      data_pesan.value.whatsapp_template_id = data_pesan.value.whatsapp_template_id;
    }

    await add_pesan(data_pesan.value);
    resetForm();
    fetch_data();
    showModal.value = false;
    displayNotification('Pesan berhasil dikirim!', 'success');
  } catch (error) {
    console.error('Gagal mengirim pesan:', error);
    displayNotification('Gagal mengirim pesan!', 'error');
  }
};

const showConfirmation = (title: string, message: string, action: () => void) => {
  confirmTitle.value = title;
  confirmMessage.value = message;
  confirmAction.value = action;
  showConfirmDialog.value = true;
};

const deleteData = async (id: number) => {
  showConfirmation('Konfirmasi Hapus', 'Apakah Anda yakin ingin menghapus data ini?', async () => {
    try {
      await delete_pesan({ id: id });
      showConfirmDialog.value = false;
      displayNotification('Operasi berhasil!', 'success');
      fetch_data();
    } catch (error) {
      console.error('Error deleting data:', error);
      displayNotification(error?.response?.data?.error_msg, 'error');
    }
  });
};
</script>

<template>
  <div class="container mx-auto px-4 mt-10">
    <div class="flex justify-between items-center mb-6">
      <!-- Tombol Tambah di kiri -->
      <PrimaryButton @click="showModal = true" class="flex items-center gap-2">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="w-5 h-5"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M20 2H4a2 2 0 00-2 2v14l4-4h14a2 2 0 002-2V4a2 2 0 00-2-2z" />
        </svg>

        Tambah Pesan
      </PrimaryButton>

      <!-- Search di kanan -->
      <div class="flex items-center">
        <label for="search" class="block text-sm font-medium text-gray-700 mr-2">Search</label>
        <input
          v-model="searchQuery"
          type="text"
          id="search"
          class="block w-64 px-3 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 placeholder:text-gray-400"
          placeholder="Cari Template..."
        />
      </div>
    </div>

    <div class="overflow-hidden rounded-lg border border-gray-200 shadow-md">
      <table class="w-full border-collapse bg-white text-left text-sm text-gray-500">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-4 font-medium text-gray-900 text-center w-[20%]">Nomor Asal</th>
            <th class="px-6 py-4 font-medium text-gray-900 text-center w-[15%]">Jenis Pesan</th>
            <th class="px-6 py-4 font-medium text-gray-900 text-center w-[25%]">Template Pesan</th>
            <th class="px-6 py-4 font-medium text-gray-900 text-center w-[25%]">Status</th>
            <th class="px-6 py-4 font-medium text-gray-900 text-center w-[15%]">
              Tanggal Pengiriman
            </th>
            <th class="px-6 py-4 font-medium text-gray-900 text-center w-[15%]">Aksi</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200">
          <tr v-if="data.length === 0">
            <td colspan="5" class="px-6 py-4 text-center text-gray-500">Data tidak ada</td>
          </tr>
          <tr v-for="pesan in data" :key="pesan.id" class="hover:bg-gray-50 transition-colors">
            <td class="px-6 py-4 text-left">{{ pesan.nomor_asal }}</td>
            <td class="px-6 py-4 text-center">{{ pesan.jenis }}</td>
            <td class="px-6 py-4 text-center">{{ pesan.pesan }}</td>
            <td class="px-6 py-4 text-center">{{ pesan.status }}</td>
            <td class="px-6 py-4 text-center">{{ pesan.tanggal_pengiriman }}</td>
            <td class="px-6 py-4 text-center">
              <div class="flex justify-center gap-2">
                <DangerButton @click="deleteData(pesan.id)"><DeleteIcon /></DangerButton>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      <table class="w-full">
        <Pagination
          :currentPage="currentPage"
          :totalPages="totalPages"
          :pages="pages"
          :totalColumns="totalColumns"
          @prev-page="handlePrev"
          @next-page="handleNext"
          @page-now="handlePageNow"
        />
      </table>
    </div>
  </div>

  <Form
    :formStatus="showModal"
    @cancel="
      () => {
        showModal = false;
        resetForm();
      }
    "
    @submit="handle_submit()"
    :submitLabel="'Simpan'"
    :width="'w-1/3'"
    :label="'Tambah Pesan'"
  >
    <InputReadonly :value="data_pesan.nomor_asal" label="Nomor Asal" id="nomor_asal" class="mb-4" />

    <SelectField
      v-model="data_pesan.type"
      label="Jenis Pesan"
      placeholder="Pilih Jenis Pesan"
      id="type"
      :options="[
        { id: 'pesan_biasa', name: 'Pesan Biasa' },
        { id: 'semua_jamaah', name: 'Semua Jamaah' },
        { id: 'staff', name: 'Staff' },
        { id: 'agen', name: 'Agen' },
        { id: 'jamaah_paket', name: 'Jamaah Paket' },
        { id: 'jamaah_sudah_berangkat', name: 'Jamaah Sudah Berangkat' },
        { id: 'jamaah_tabungan_umrah', name: 'Jamaah Tabungan Umrah' },
        { id: 'jamaah_utang_koperasi', name: 'Jamaah Utang Koperasi' },
      ]"
      class="mb-4"
    />

    <!-- TAMPILKAN JUMLAH NOMOR jika type-nya bukan pesan_biasa -->
    <InputReadonly
      v-if="data_pesan.type && data_pesan.type !== 'pesan_biasa'"
      :value="data_pesan.jumlah_nomor"
      label="Jumlah Nomor Tujuan"
      id="jumlah_nomor"
      class="mb-4"
    />

    <!-- TAMPILKAN NOMOR TUJUAN jika type-nya adalah pesan_biasa -->
    <InputText
      v-if="data_pesan.type === 'pesan_biasa'"
      v-model="data_pesan.nomor_tujuan"
      label="Nomor Tujuan"
      placeholder="Masukan Nomor Tujuan"
      id="nomor_tujuan"
      note="pisahkan dengan koma jika terdapat lebih dari satu nomor tujuan"
      class="mb-4"
    />

    <SelectField
      v-model="data_pesan.whatsapp_template_id"
      label="Pilih Template"
      placeholder="Pilih Template"
      id="whatsapp_template_id"
      :options="templateOptions"
      class="mb-4"
    />

    <TextArea
      v-model="data_pesan.pesan"
      label="Isi Pesan"
      id="message"
      placeholder="Tulis isi pesan WhatsApp..."
      class="mb-4"
    />
  </Form>

  <Confirmation
    :showConfirmDialog="showConfirmDialog"
    :confirmTitle="confirmTitle"
    :confirmMessage="confirmMessage"
  >
    <button
      @click="confirmAction && confirmAction()"
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

  <Notification
    :showNotification="showNotification"
    :notificationType="notificationType"
    :notificationMessage="notificationMessage"
    @close="showNotification = false"
  />
</template>
