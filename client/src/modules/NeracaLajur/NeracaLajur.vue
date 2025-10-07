<script setup lang="ts">

  import { paramCabang, paramAkun, paramPeriode  } from '@/service/param_cabang'; // Import function POST
  import { dataNeracaLajurAPI, downloadNeracaLajurAPI  } from '@/service/neraca_lajur'; // Import function POST
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

  interface NeracaLajur {
    id: number;
    akun: string;
    nama_akun: string;
    debet_saldo_awal: string;
    kredit_saldo_awal: string;
    debet_penyesuaian: string;
    kredit_penyesuaian: string;
    debet_saldo_disesuaikan: string;
    kredit_saldo_disesuaikan: string;
    debet_neraca: string;
    kredit_neraca: string;
    debet_laba_rugi: string;
    kredit_laba_rugi: string;
  }

  interface TotalNeracaLajur {
    saldo_awal_debet: string;
    saldo_awal_kredit: string;
    penyesuaian_akun_debet: string;
    penyesuaian_akun_kredit: string;
    saldo_disesuaikan_debet: string;
    saldo_disesuaikan_kredit: string;
    neraca_debet: string;
    neraca_kredit: string;
    laba_debet: string;
    laba_kredit: string;
    a_debet : string;
    a_kredit : string;
    status: string;
    nrc_debet: string;
    nrc_kredit: string;
  }

  const optionFilterCabang = ref<filterCabang[]>([]);
  const selectedOptionCabang = ref(0);
  const optionFilterPeriode = ref<filterPeriode[]>([]);
  const selectedOptionPeriode = ref(0);
  const dataNeracaLajur = ref<NeracaLajur[]>([]);
  const dataTotalNeracaLajur = ref<Partial<TotalNeracaLajur>>({});

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
    const response = await dataNeracaLajurAPI({periode:selectedOptionPeriode.value,cabang:selectedOptionCabang.value});
    dataNeracaLajur.value = response.data;
    dataTotalNeracaLajur.value = response.total;
  }

  const download_neraca_lajur = async () => {
    try {
      const response = await downloadNeracaLajurAPI({ periode:selectedOptionPeriode.value, cabang:selectedOptionCabang.value })
      console.log('Downloaded data:', response)
    } catch (error) {
      console.error('Error fetching Jamaah:', error)
    }
  }

  onMounted(async () => {
    await fetchFilterData();
    // totalColumns.value = 5
  });
</script>
<template>
  <div class="container mx-auto p-4">
    <!-- Tambah data dan Search -->
    <div class="flex justify-between mb-4">
      <PrimaryButton @click="download_neraca_lajur()">
        <IconDownload /> Download Data Neraca Lajur
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
    <div class="overflow-hidden rounded-lg border border-gray-200 shadow-md">
      <table class="w-full border-collapse bg-white text-left text-sm text-gray-500">
        <thead class="bg-gray-100">
          <tr>
            <th class="w-[7%]  px-0 py-3  border font-medium text-gray-900 text-center align-bottom" rowspan="2">Kode Akun</th>
            <th class="w-[23%] px-6 py-3  border font-medium text-gray-900 text-center align-bottom" rowspan="2">Nama Akun</th>
            <th class="w-[14%] px-6 py-3  border font-medium text-gray-900 text-center align-bottom" colspan="2">Saldo Awal</th>
            <th class="w-[14%] px-6 py-3  border font-medium text-gray-900 text-center align-bottom" colspan="2">Penyesuaian</th>
            <th class="w-[14%] px-6 py-3  border font-medium text-gray-900 text-center align-bottom" colspan="2">Saldo Disesuaikan</th>
            <th class="w-[14%] px-6 py-3  border font-medium text-gray-900 text-center align-bottom" colspan="2">Neraca</th>
            <th class="w-[14%] px-6 py-3  border font-medium text-gray-900 text-center align-bottom" colspan="2">Laba Rugi</th>
          </tr>
          <tr>
            <th class="w-[7%] px-6 py-3  border font-medium text-gray-900 text-center" >
              Debet
            </th>
            <th class="w-[7%] px-6 py-3  border font-medium text-gray-900 text-center" >
              Kredit
            </th>
            <th class="w-[7%] px-6 py-3  border font-medium text-gray-900 text-center" >
              Debet
            </th>
            <th class="w-[7%] px-6 py-3  border font-medium text-gray-900 text-center" >
              Kredit
            </th>
            <th class="w-[7%] px-6 py-3  border font-medium text-gray-900 text-center" >
              Debet
            </th>
            <th class="w-[7%] px-6 py-3  border font-medium text-gray-900 text-center" >
              Kredit
            </th>
            <th class="w-[7%] px-6 py-3  border font-medium text-gray-900 text-center" >
              Debet
            </th>
            <th class="w-[7%] px-6 py-3  border font-medium text-gray-900 text-center" >
              Kredit
            </th>
            <th class="w-[7%] px-6 py-3 border font-medium text-gray-900 text-center" >
              Debet
            </th>
            <th class="w-[7%] px-6 py-3 border font-medium text-gray-900 text-center" >
              Kredit
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100 border-t border-gray-100">
          <template v-if="dataNeracaLajur && dataNeracaLajur.length > 0">
            <tr v-for="bb in dataNeracaLajur" :key="bb.id" class="hover:bg-gray-50">
              <td class="px-0 py-4 border text-center text-xs font-bold">{{ bb.akun }}</td>
              <td class="px-6 py-4 border text-left text-xs font-bold">{{ bb.nama_akun }}</td>
              <td class="px-0 py-4 border text-center text-xs">{{ bb.debet_saldo_awal }}</td>
              <td class="px-0 py-4 border text-center text-xs">{{ bb.kredit_saldo_awal }}</td>
              <td class="px-0 py-4 border text-center text-xs">{{ bb.debet_penyesuaian }}</td>
              <td class="px-0 py-4 border text-center text-xs">{{ bb.kredit_penyesuaian }}</td>
              <td class="px-0 py-4 border text-center text-xs">{{ bb.debet_saldo_disesuaikan }}</td>
              <td class="px-0 py-4 border text-center text-xs">{{ bb.kredit_saldo_disesuaikan }}</td>
              <td class="px-0 py-4 border text-center text-xs">{{ bb.debet_neraca }}</td>
              <td class="px-0 py-4 border text-center text-xs">{{ bb.kredit_neraca }}</td>
              <td class="px-0 py-4 border text-center text-xs">{{ bb.debet_laba_rugi }}</td>
              <td class="px-0 py-4 border text-center text-xs">{{ bb.kredit_laba_rugi }}</td>
            </tr>
          </template>
          <tr v-else>
            <td colspan="12" class="px-6 py-4 text-center text-base text-gray-600 text-xs">Data Neraca Lajur tidak ditemukan.</td>
          </tr>
        </tbody>
        <tfoot class="bg-gray-100 font-bold">
          <tr>
            <td colspan="2" class="px-6 py-4 text-right font-bold border text-xs">
              TOTAL
            </td>
            <td class="px-0 py-4 text-center border text-xs">
              {{ dataTotalNeracaLajur.saldo_awal_debet }}
            </td>
            <td class="px-0 py-4 text-center border text-xs">
              {{ dataTotalNeracaLajur.saldo_awal_kredit }}
            </td>
            <td class="px-0 py-4 text-center border text-xs">
              {{ dataTotalNeracaLajur.penyesuaian_akun_debet }}
            </td>
            <td class="px-0 py-4 text-center border text-xs">
              {{ dataTotalNeracaLajur.penyesuaian_akun_kredit }}
            </td>
            <td class="px-0 py-4 text-center border text-xs">
              {{ dataTotalNeracaLajur.saldo_disesuaikan_debet }}
            </td>
            <td class="px-0 py-4 text-center border text-xs">
              {{ dataTotalNeracaLajur.saldo_disesuaikan_kredit }}
            </td>
            <td class="px-0 py-4 text-center border text-xs">
              {{ dataTotalNeracaLajur.neraca_debet }}
            </td>
            <td class="px-0 py-4 text-center border text-xs">
              {{ dataTotalNeracaLajur.neraca_kredit }}
            </td>
            <td class="px-0 py-4 text-center border text-xs">
              {{ dataTotalNeracaLajur.laba_debet }}
            </td>
            <td class="px-0 py-4 text-center border text-xs">
              {{ dataTotalNeracaLajur.laba_kredit }}
            </td>
          </tr>
          <tr>
            <td colspan="8" class="px-6 py-4 text-right font-bold border text-xs" v-html="dataTotalNeracaLajur.status == 'laba' ? '<b style=color:green>LABA</b>' : '<b style=color:red>RUGI</b>'">
            </td>
            <td class="px-0 py-4 text-center border text-xs">
              {{ dataTotalNeracaLajur.a_debet }}
            </td>
            <td class="px-0 py-4 text-center border text-xs">
              {{ dataTotalNeracaLajur.a_kredit }}
            </td>
            <td class="px-0 py-4 text-center border text-xs">
              {{ dataTotalNeracaLajur.a_debet }}
            </td>
            <td class="px-0 py-4 text-center border text-xs">
              {{ dataTotalNeracaLajur.a_kredit }}
            </td>
          </tr>
           <tr>
            <td colspan="8" class="px-6 py-4 text-right font-bold border text-xs" >
              NRC
            </td>
            <td class="px-0 py-4 text-center border text-xs">
              {{ dataTotalNeracaLajur.nrc_debet }}
            </td>
            <td class="px-0 py-4 text-center border text-xs">
              {{ dataTotalNeracaLajur.nrc_kredit }}
            </td>
            <td class="px-0 py-4 text-center border text-xs"></td>
            <td class="px-0 py-4 text-center border text-xs"></td>
          </tr>
        </tfoot>
      </table>
    </div>
  </div>
</template>
