<script setup lang="ts">
  import { paramCabang, paramAkun, paramPeriode  } from '@/service/param_cabang'; // Import function POST
  import { daftarBukuBesar, downloadBukuBesar  } from '@/service/buku_besar'; // Import function POST
  import IconDownload from '@/components/Icons/IconDownload.vue'
  import PrimaryButton from '@/components/Button/PrimaryButton.vue'
  import { ref, onMounted, computed } from 'vue';

  const itemsPerPage = 100; // Jumlah airlines per halaman
  const currentPage = ref(1);
  const search = ref("");
  const totalPages = ref(0);

  const nextPage = () => {
    if (currentPage.value < totalPages.value) {
      currentPage.value++;
      fetchData()
    }
  };

  const prevPage = () => {
    if (currentPage.value > 1) {
      currentPage.value--;
      fetchData()
    }
  };

  const pageNow = (page : number) => {
    currentPage.value = page
    fetchData()
  }

  // Generate array angka halaman
  const pages = computed(() => {
    return Array.from({ length: totalPages.value }, (_, i) => i + 1);
  });

  interface filterCabang {
    id: number;
    name: string;
  }

  interface filterAkun {
    id: number;
    name: string;
  }

  interface filterPeriode {
    id: number;
    name: string;
  }

  interface BukuBesar {
    id: number;
    tanggal: string;
    ref: string;
    ket: string;
    debet: string;
    kredit: string;
    saldo: string;
  }

  const totalColumns = ref(6); // Default 3 kolom
  const dataBukuBesar = ref<BukuBesar[]>([]);
  const optionFilterCabang = ref<filterCabang[]>([]);
  const selectedOptionCabang = ref(0);
  const optionFilterAkun = ref<filterAkun[]>([]);
  const selectedOptionAkun = ref(0);
  const optionFilterPeriode = ref<filterPeriode[]>([]);
  const selectedOptionPeriode = ref(0);
  const total_debet = ref(0);
  const total_kredit = ref(0);
  const saldo_akhir = ref(0)

  const fetchFilterData = async() => {
    const responseCabang = await paramCabang();
    const responseAkun = await paramAkun();
    const responsePeriode = await paramPeriode();

    optionFilterCabang.value = responseCabang.data;
    selectedOptionCabang.value = responseCabang.data[0].id;
    optionFilterAkun.value = responseAkun.data;
    selectedOptionAkun.value = responseAkun.data[0].id;
    optionFilterPeriode.value = responsePeriode.data;
    selectedOptionPeriode.value = responsePeriode.data[0].id;

    await fetchData();
  }

  const fetchData = async() => {
    const response = await daftarBukuBesar({
      search: search.value,
      perpage: itemsPerPage,
      pageNumber: currentPage.value,
      periode:selectedOptionPeriode.value,
      akun:selectedOptionAkun.value,
      cabang:selectedOptionCabang.value});
      totalPages.value = Math.ceil(response.total / itemsPerPage)
    dataBukuBesar.value = response.data.list;
    total_debet.value = response.data.total_debet;
    total_kredit.value = response.data.total_kredit;
    saldo_akhir.value = response.data.saldo_akhir;
  }

  const download_buku_besar = async () => {
    try {
      const response = await downloadBukuBesar({ periode:selectedOptionPeriode.value, akun:selectedOptionAkun.value, cabang:selectedOptionCabang.value })
      console.log('Downloaded data:', response)
    } catch (error) {
      console.error('Error fetching Jamaah:', error)
    }
  }

  onMounted(async () => {
    await fetchFilterData();
    totalColumns.value = 5
  });
</script>
<template>
  <div class="container mx-auto p-4">
    <!-- Tambah data dan Search -->
    <div class="flex justify-between mb-4">
      <!-- <button class="bg-[#455494] text-white px-4 py-2 rounded-lg hover:bg-[#3a477d] transition-colors duration-200 ease-in-out flex items-center gap-2" @click="download_buku_besar()" >
        <IconDownload />
        Download Buku Besar
      </button> -->
      <PrimaryButton @click="download_buku_besar()">
          <IconDownload />
          Download Data
      </PrimaryButton>
      <div class="flex items-center">
        <label for="search" class="block text-sm font-medium text-gray-700 mr-2">Filter</label>
        <div class="inline-flex rounded-md shadow-xs" role="group">
          <!-- <input type="text" id="search" class="block w-64 px-3 py-2 text-gray-700 bg-white border border-gray-300 rounded-s-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            v-model="search" @change="fetchData()" placeholder="Cari data..." /> -->
          <select  v-model="selectedOptionPeriode" style="width: 300px;" @change="fetchData()" class="border-t border-b border-e bg-gray-50 border-gray-300 text-gray-900 text-sm rounded-s-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
              <option v-for="optionA in optionFilterPeriode" :key="optionA.id" :value="optionA.id">
                {{ optionA.name }}
              </option>
          </select>
          <select  v-model="selectedOptionAkun" style="width: 300px;" @change="fetchData()" class="border-t border-b border-e bg-gray-50 border-gray-300 text-gray-900 text-sm focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
              <option v-for="optionB in optionFilterAkun" :key="optionB.id" :value="optionB.id">
                {{ optionB.name }}
              </option>
          </select>
          <select  v-model="selectedOptionCabang" style="width: 300px;" @change="fetchData()" class="border-t border-b border-e bg-gray-50 border-gray-300 text-gray-900 text-sm rounded-e-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
              <option v-for="optionC in optionFilterCabang" :key="optionC.id" :value="optionC.id">
                {{ optionC.name }}
              </option>
          </select>
        </div>
      </div>
    </div>

    <!-- Table data -->
    <div class="overflow-hidden rounded-lg border border-gray-200 shadow-md">
      <table class="w-full border-collapse bg-white text-left text-sm text-gray-500">
        <thead class="bg-gray-100">
          <tr>
            <th class="w-[15%] px-6 py-3 font-medium font-bold text-gray-900 text-center">Tanggal Transaksi</th>
            <th class="w-[15%] px-6 py-3 font-medium font-bold text-gray-900 text-center">Ref</th>
            <th class="w-[25%] px-6 py-3 font-medium font-bold text-gray-900 text-center">Keterangan</th>
            <th class="w-[15%] px-6 py-3 font-medium font-bold text-gray-900 text-center">Debet</th>
            <th class="w-[15%] px-6 py-3 font-medium font-bold text-gray-900 text-center">Kredit</th>
            <th class="w-[15%] px-6 py-3 font-medium font-bold text-gray-900 text-center">Saldo</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100 border-t border-gray-100">
          <template v-if="dataBukuBesar && dataBukuBesar.length > 0">
            <tr v-for="bb in dataBukuBesar" :key="bb.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 text-center">{{ bb.tanggal }}</td>
              <td class="px-6 py-4 text-center">{{ bb.ref }}</td>
              <td class="px-6 py-4 text-center">{{ bb.ket }}</td>
              <td class="px-6 py-4 text-center">{{ bb.debet }}</td>
              <td class="px-6 py-4 text-center">{{ bb.kredit }}</td>
              <td class="px-6 py-4 text-center">{{ bb.saldo }}</td>
            </tr>
          </template>
          <tr v-else>
            <td colspan="6" class="px-6 py-4 text-center text-base text-gray-600">Data Buku Besar tidak ditemukan.</td>
          </tr>
        </tbody>
        <tfoot class="bg-gray-100 font-bold">
          <tr  v-if="dataBukuBesar && dataBukuBesar.length > 0">
            <td colspan="3" class="py-4 font-bold text-right">Total</td>
            <td class="text-center">{{ total_debet }}</td>
            <td class="text-center">{{ total_kredit }}</td>
            <td class="text-center">{{ saldo_akhir }}</td>
          </tr>
          <tr v-else>
            <td colspan="6" class="py-4 text-center text-base text-gray-600"></td>
          </tr>
        </tfoot>
      </table>
    </div>
    <!-- <FormAddUpdate :isModalOpen="isModalOpen" :formData="formData" @close="isModalOpen = false; removeFormData() ; fetchData()"></FormAddUpdate>
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
    </Confirmation> -->
  </div>
  <!-- Notification Popup -->
  <!-- <Notification  :showNotification="showNotification"  :notificationType="notificationType" :notificationMessage="notificationMessage" @close="showNotification = false"  ></Notification> -->
</template>
