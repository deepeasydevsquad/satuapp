<script setup lang="ts">
  import { paramCabang, paramAkun, paramPeriode  } from '@/service/param_cabang'; // Import function POST
  import { dataNeracaApi, downloadNeracaApi  } from '@/service/neraca'; // Import function POST
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

  interface AkunNeraca {
    nomor_akun: string;
    nama_akun: string;
    saldo: string;
  }

  interface Neraca {
    [kategori: string]: AkunNeraca[];
  }

  interface DetailAkun {
    nama_akun: string;
    nomor_akun: string;
    saldo: number;
  }

  interface Asset {
    [kategori: string]: DetailAkun[];
  }

  interface Kewajiban {
    [kategori: string]: DetailAkun[];
  }

  interface Ekuitas {
    [kategori: string]: DetailAkun[];
  }

  const optionFilterCabang = ref<filterCabang[]>([]);
  const selectedOptionCabang = ref(0);
  const optionFilterPeriode = ref<filterPeriode[]>([]);
  const selectedOptionPeriode = ref(0);
  const dataNeraca = ref<Neraca>({});
  const dataAsset =  ref<DetailAkun[]>([]);
  const dataKewajiban = ref<DetailAkun[]>([]);
  const dataEkuitas = ref<DetailAkun[]>([]);

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
    const response = await dataNeracaApi({periode:selectedOptionPeriode.value,cabang:selectedOptionCabang.value});
    dataAsset.value = response.data['1'];
    dataKewajiban.value = response.data['2'];
    dataEkuitas.value = response.data['3'];
  }

  const download_neraca = async () => {
    try {
      const response = await downloadNeracaApi({ periode:selectedOptionPeriode.value, cabang:selectedOptionCabang.value })
    } catch (error) {
      console.error('Error fetching Neraca:', error)
    }
  }

  const formatRupiah = (value: number): string => {
    return 'Rp ' + value.toLocaleString('id-ID');
  };

  onMounted(async () => {
    await fetchFilterData();
    // totalColumns.value = 5
  });
</script>
<template>
  <div class="container mx-auto p-4">
    <div class="flex justify-between mb-4">
      <PrimaryButton @click="download_neraca()">
        <IconDownload /> Download Data Neraca
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
    <div class="overflow-hidden rounded-lg gap-2 flex">
      <div class="w-1/2 py-4 ps-0 pe-4">
        <table class="w-full border-collapse bg-white text-left text-sm text-gray-500" >
          <thead>
            <tr>
              <th class="w-[100%] bg-blue-100 px-6 py-4 border text-gray-500 font-bold text-left align-bottom" colspan="3">AKTIVA</th>
            </tr>
            <tr>
              <th class="w-[100%] px-6 py-4 border font-bold text-gray-500 text-left align-bottom" colspan="3">Asset</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100 border-t border-gray-100">
              <tr v-for="akun in dataAsset" :key="akun.nomor_akun">
                <td class="w-[10%] px-6 py-4 border text-left text-xs ">{{ akun.nomor_akun }}</td>
                <td class="w-[50%] px-6 py-4 border text-left text-xs ">{{ akun.nama_akun }}</td>
                <td class="px-6 py-4 border text-left text-xs ">{{ formatRupiah(akun.saldo) }}</td>
              </tr>
          </tbody>
          <tfoot>
            <tr class="bg-red-50">
              <td class="px-6 py-4 border text-left text-xs font-bold" colspan="2">SUBTOTAL ASSET</td>
              <td class="px-6 py-4 border text-left text-xs font-bold">
                {{ formatRupiah(dataAsset.reduce((total, akun) => total + akun.saldo, 0)) }}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
      <div class="w-1/2 py-4 ps-4 pe-0">
        <table class="w-full border-collapse bg-white text-left text-sm text-gray-500 mb-3" >
          <thead>
            <tr>
              <th class="w-[100%] bg-blue-100 px-6 py-4 border text-gray-500 font-bold text-left align-bottom" colspan="3">PASSIVA</th>
            </tr>
            <tr>
              <th class="w-[100%] px-6 py-4 border font-bold text-gray-500 text-left align-bottom" colspan="3">Kewajiban</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100 border-t border-gray-100">
              <tr v-for="akun in dataKewajiban" :key="akun.nomor_akun">
                <td class="w-[10%] px-6 py-4 border text-left text-xs ">{{ akun.nomor_akun }}</td>
                <td class="w-[50%] px-6 py-4 border text-left text-xs ">{{ akun.nama_akun }}</td>
                <td class="px-6 py-4 border text-left text-xs ">{{ formatRupiah(akun.saldo) }}</td>
              </tr>
          </tbody>
          <tfoot>
            <tr class="bg-red-50">
              <td class="px-6 py-4 border text-left text-xs font-bold" colspan="2">SUBTOTAL KEWAJIBAN</td>
              <td class="px-6 py-4 border text-left text-xs font-bold">
                {{ formatRupiah(dataKewajiban.reduce((total, akun) => total + akun.saldo, 0)) }}
              </td>
            </tr>
          </tfoot>
        </table>
        <table class="w-full border-collapse bg-white text-left text-sm text-gray-500 my-3" >
          <thead>
            <tr>
              <th class="w-[100%] px-6 py-4 border font-bold text-gray-500 text-left align-bottom" colspan="3">Ekuitas</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100 border-t border-gray-100">
            <tr v-for="akun in dataEkuitas" :key="akun.nomor_akun">
                <td class="w-[10%] px-6 py-4 border text-left text-xs ">{{ akun.nomor_akun }}</td>
                <td class="w-[50%] px-6 py-4 border text-left text-xs ">{{ akun.nama_akun }}</td>
                <td class="px-6 py-4 border text-left text-xs ">{{ formatRupiah(akun.saldo) }}</td>
              </tr>
          </tbody>
          <tfoot>
            <tr class="bg-red-50">
              <td class="px-6 py-4 border text-left text-xs font-bold" colspan="2">SUBTOTAL EKUITAS</td>
              <td class="px-6 py-4 border text-left text-xs font-bold">
               {{ formatRupiah(dataEkuitas.reduce((total, akun) => total + akun.saldo, 0)) }}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
    <div class="overflow-hidden rounded-lg gap-2 flex">
      <div class="w-1/2 py-4 ps-0 pe-4">
        <table class="w-full border-collapse bg-red-100 text-left text-sm text-gray-500 my-3" >
          <tbody class="divide-y divide-gray-100 border-t border-gray-100">
            <tr>
              <td class="w-[60%] px-6 py-4 border text-left text-xs font-bold" colspan="2">TOTAL AKTIVA</td>
              <td class="px-6 py-4 border text-left text-xs font-bold">{{ formatRupiah(dataAsset.reduce((total, akun) => total + akun.saldo, 0)) }}</td>
            </tr>
          </tbody>
         </table>
      </div>
      <div class="w-1/2 py-4 ps-4 pe-0">
        <table class="w-full border-collapse bg-red-100 text-left text-sm text-gray-500 my-3" >
          <tbody class="divide-y divide-gray-100 border-t border-gray-100">
            <tr>
              <td class="w-[60%] px-6 py-4 border text-left text-xs font-bold" colspan="2">TOTAL PASSIVA</td>
              <td class="px-6 py-4 border text-left text-xs font-bold">{{ formatRupiah( dataKewajiban.reduce((total, akun) => total + akun.saldo, 0) + dataEkuitas.reduce((total, akun) => total + akun.saldo, 0)) }}</td>
            </tr>
          </tbody>
         </table>
      </div>
    </div>
  </div>
</template>
