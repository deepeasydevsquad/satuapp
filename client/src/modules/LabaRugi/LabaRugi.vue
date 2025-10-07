<script setup lang="ts">

  import { paramCabang, paramAkun, paramPeriode  } from '@/service/param_cabang'; // Import function POST
  import { dataLabaRugiAPI, downloadLabaRugiAPI  } from '@/service/laba_rugi'; // Import function POST
  import IconDownload from '@/components/Icons/IconDownload.vue'
  import PrimaryButton from '@/components/Button/PrimaryButton.vue'
  import { ref, onMounted, computed } from 'vue';

  interface filterCabang {
    id: number;
    name: string;
  }

  interface filterPeriode {
    id: number;
    name: string;
  }

  interface AkunLabaRugi {
    nomor_akun: string;
    nama_akun: string;
    saldo: string;
    real_saldo: number;
  }

  interface LabaRugiData {
    [kategori: string]: AkunLabaRugi[];
  }

  const optionFilterCabang = ref<filterCabang[]>([]);
  const selectedOptionCabang = ref(0);
  const optionFilterPeriode = ref<filterPeriode[]>([]);
  const selectedOptionPeriode = ref(0);
  const dataLabaRugi = ref<LabaRugiData>({});
  // const dataTotalNeracaLajur = ref<Partial<TotalNeracaLajur>>({});

  const fetchFilterData = async() => {
    const responseCabang = await paramCabang();
    const responsePeriode = await paramPeriode();
    optionFilterCabang.value = responseCabang.data;
    selectedOptionCabang.value = responseCabang.data[0].id;
    optionFilterPeriode.value = responsePeriode.data;
    selectedOptionPeriode.value = responsePeriode.data[0].id;
    await fetchData();
  }

  const fetchData = async() => {
    const response = await dataLabaRugiAPI({periode:selectedOptionPeriode.value,cabang:selectedOptionCabang.value});
    dataLabaRugi.value = response.data;
    // dataTotalNeracaLajur.value = response.total;
  }

  const download_laba_rugi = async () => {
    try {
      const response = await downloadLabaRugiAPI({ periode:selectedOptionPeriode.value, cabang:selectedOptionCabang.value })
      // console.log('Downloaded data:', response)
    } catch (error) {
      console.error('Error fetching Jamaah:', error)
    }
  }

  const formatRupiah = (value: number): string => {
    return 'RP ' + value.toLocaleString('id-ID');
  };

  onMounted(async () => {
    await fetchFilterData();
    // totalColumns.value = 5
  });
</script>
<template>
  <div class="container mx-auto p-4">
    <!-- Tambah data dan Search -->
    <div class="flex justify-between mb-4">
      <PrimaryButton @click="download_laba_rugi()">
        <IconDownload /> Download Data Laba Rugi
      </PrimaryButton>
      <div class="flex items-center">
        <label for="search" class="block text-sm font-medium text-gray-700 mr-2">Filter</label>
        <div class="inline-flex rounded-md shadow-xs" role="group">
          <select  v-model="selectedOptionPeriode" style="width: 300px;" @change="fetchData()" class="border-t border-b border-e bg-gray-50 border-gray-300 text-gray-900 text-sm rounded-s-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
              <option v-for="optionA in optionFilterPeriode" :key="optionA.id" :value="optionA.id">
                {{ optionA.name }}
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
    <div class="overflow-hidden rounded-lg ">
      <template v-if="dataLabaRugi && Object.keys(dataLabaRugi).length  > 0">
        <table class="w-full border-collapse bg-white text-left text-sm text-gray-500 mb-10" v-for="(items, kategori) in dataLabaRugi" :key="kategori">
          <thead class="bg-gray-50">
            <tr>
              <th class="w-[100%] px-6 py-4 border font-bold text-gray-900 text-left align-bottom" colspan="3">{{ kategori.toUpperCase() }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100 border-t border-gray-100">
              <tr v-for="akun in items" :key="akun.nomor_akun">
                <td class="w-[10%] px-6 py-4 border text-left text-xs ">{{ akun.nomor_akun}}</td>
                <td class="w-[30%] px-6 py-4 border text-left text-xs ">{{ akun.nama_akun }}</td>
                <td class="px-6 py-4 border text-left text-xs ">{{ akun.saldo }}</td>
              </tr>
          </tbody>
          <tfoot>
            <tr class="bg-gray-50">
              <td class="px-6 py-4 border text-left text-xs font-bold" colspan="2">SUBTOTAL {{ kategori.toUpperCase() }}</td>
              <td class="px-6 py-4 border text-left text-xs font-bold">
                {{ formatRupiah(items.reduce((total, akun) => total + akun.real_saldo, 0)) }}
              </td>
            </tr>
          </tfoot>
        </table>
      </template>
    </div>
  </div>
</template>
