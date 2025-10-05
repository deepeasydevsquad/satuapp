<template>
  <div v-if="isModalOpen && selectedPaketLA" class="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
    <div class="flex min-h-screen items-end justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
      <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" @click="$emit('close')"></div>
      <span class="hidden sm:inline-block sm:h-screen sm:align-middle" aria-hidden="true">&#8203;</span>
      <div class="relative inline-block transform overflow-hidden rounded-lg bg-white text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:align-middle">
        <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
          <h3 class="text-2xl flex justify-center font-bold leading-6 text-gray-900 mb-4">
            {{ selectedPaketLA.id ? "Edit Data" : "Tambah Baru" }}
          </h3>
          <div class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Nama Kostumer</label>
                <p class="text-m text-gray-600">{{ selectedPaketLA.client_name }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Nomor HP Kostumer</label>
                <p class="text-m text-gray-600">{{ selectedPaketLA.client_hp_number }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Alamat Kostumer</label>
                <p class="text-m text-gray-600">{{ selectedPaketLA.client_address }}</p>
              </div>
            </div>
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700">Keterangan</label>
              <p class="text-sm font-normal text-gray-600">
                Anda hanya dapat membaca informasi kostumer, untuk mengubah informasi kostumer silahkan pergi ke halaman Kostumer.
              </p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Nama Kostumer</label>
              <select
                v-model="selectedPaketLA.kostumer_id"
                @change="updateClientInfo"
                class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-600 font-normal"
              >
                <option value="0">Pilih Kostumer</option>
                <option v-for="customer in dataKostumer" :key="customer.id" :value="customer.id">
                  {{ customer.name }}
                </option>
              </select>
              <p v-if="errors.client_name" class="text-sm text-red-600">{{ errors.client_name }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Diskon</label>
              <input
                v-model="selectedPaketLA.discount"
                type="number"
                class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-600 font-normal"
                placeholder="Diskon"
              />
              <p v-if="errors.discount" class="mt-1 text-sm text-red-600">{{ errors.discount }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Jumlah Jamaah</label>
              <input
                v-model="selectedPaketLA.total_jamaah"
                type="number"
                class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-600 font-normal"
                placeholder="Jumlah Jamaah"
              />
              <p v-if="errors.total_jamaah" class="mt-1 text-sm text-red-600">{{ errors.total_jamaah }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Tanggal Keberangkatan</label>
              <input
                v-model="selectedPaketLA.departure_date"
                type="date"
                class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-600 font-normal"
              />
              <p v-if="errors.departure_date" class="mt-1 text-sm text-red-600">{{ errors.departure_date }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Tanggal Kepulangan</label>
              <input
                v-model="selectedPaketLA.arrival_date"
                type="date"
                class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-600 font-normal"
              />
              <p v-if="errors.arrival_date" class="mt-1 text-sm text-red-600">{{ errors.arrival_date }}</p>
            </div>
          </div>
        </div>
        <div class="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
          <button
            @click="saveData"
            class="inline-flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
          >
            {{ selectedPaketLA.id ? "Simpan Perubahan" : "Tambah" }}
          </button>
          <button
            @click="$emit('close')"
            class="mt-3 inline-flex w-full justify-center rounded-md border border-gray-400 bg-gray-200 px-4 py-2 text-base font-medium text-gray-800 shadow-sm hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
          >
            Batal
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, watch, onMounted } from "vue";
import { daftarKostumer } from "@/service/daftar_paket_la";

export default {
  props: {
    selectedPaketLA: Object,
    errors: Object,
    isModalOpen: Boolean,
  },
  setup(props, { emit }) {
    const dataKostumer = ref([]);

    // Ambil data pelanggan dari API
    const fetchData = async () => {
      try {
        const responseKostumer = await daftarKostumer();
        dataKostumer.value = responseKostumer.data || [];

        // Jika data tidak ada alias undefined (buat data baru), maka data kostumer_id bernilai 0
        if (!props.selectedPaketLA.kostumer_id) {
          props.selectedPaketLA.kostumer_id = 0
        }

      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    onMounted(fetchData);

    // Fungsi untuk update info pelanggan berdasarkan kostumer_id
    const updateClientInfo = () => {
      console.log("Props Selected PaketLA:", props.selectedPaketLA);
      console.log("Data Kostumer (Array):", dataKostumer.value);

      const clientId = typeof props.selectedPaketLA.kostumer_id === "object"
        ? props.selectedPaketLA.kostumer_id.id
        : props.selectedPaketLA.kostumer_id;

      const selectedClient = dataKostumer.value.find(client => client.id === clientId);
      console.log("Client Ditemukan:", selectedClient || "Tidak ditemukan!");

      if (selectedClient) {
        props.selectedPaketLA.client_name = selectedClient.name;
        props.selectedPaketLA.client_hp_number = selectedClient.mobile_number;
        props.selectedPaketLA.client_address = selectedClient.address;
      } else {
        props.selectedPaketLA.client_name = "";
        props.selectedPaketLA.client_hp_number = "";
        props.selectedPaketLA.client_address = "";
      }
    };

    // Watch perubahan kostumer_id agar update client_name
    watch(
      () => props.selectedPaketLA.kostumer_id,
      () => updateClientInfo()
    );

    // Pastikan ketika modal dibuka, data customer langsung diperbarui
    watch(
      () => props.isModalOpen,
      (newVal) => {
        if (newVal && props.selectedPaketLA?.kostumer_id) {
          updateClientInfo();
        }
      }
    );

    const saveData = () => {
      emit("save", { ...props.selectedPaketLA });
    };

    return { dataKostumer, saveData };
  },
};
</script>
