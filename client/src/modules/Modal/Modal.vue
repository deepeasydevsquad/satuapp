<script setup lang="ts">
  import { paramCabang, paramAkun, paramPeriode  } from '@/service/param_cabang';
  import { dataModalApi  } from '@/service/modal';
  import { ref, onMounted } from 'vue';

  interface filterCabang {
    id: number;
    name: string;
  }

  interface filterPeriode {
    id: number;
    name: string;
  }

  interface DataModal {
    modal_awal: number;
    penambahan_modal: number;
    iktisar_laba_rugi: number;
    pengurangan_modal: number;
    modal_akhir: number;
  }

  interface Modal {
    error: boolean;
    data: DataModal;
  }

  const optionFilterCabang = ref<filterCabang[]>([]);
  const selectedOptionCabang = ref(0);
  const optionFilterPeriode = ref<filterPeriode[]>([]);
  const selectedOptionPeriode = ref(0);
  const dataModal = ref<Modal>({
    error: false,
    data: {
      modal_awal: 0,
      penambahan_modal: 0,
      pengurangan_modal: 0,
      iktisar_laba_rugi: 0,
      modal_akhir: 0,
    },
  });

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
    const response = await dataModalApi({periode:selectedOptionPeriode.value,cabang:selectedOptionCabang.value});
    dataModal.value = response;
  }

  const formatRupiah = (value: number): string => {
    return 'Rp ' + value.toLocaleString('id-ID');
  };

  onMounted(async () => {
    await fetchFilterData();
  });
</script>
<template>
  <div class="container mx-auto p-4">
    <div class="flex justify-between mb-4">
      <div class="flex items-center ml-auto">
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
    <div class="overflow-hidden rounded-lg flex w-full">
      <div class="w-full py-4 ps-0 pe-4">
        <table class="w-full border-collapse bg-white text-left text-sm text-gray-500" >
          <thead>
            <tr>
              <th class="w-[25%] px-6 py-4 border-b border-t text-gray-500 text-center font-normal align-bottom">Modal Awal</th>
              <th class="w-[25%] px-6 py-4 border-b border-t text-gray-500 text-center align-bottom" ></th>
              <th class="w-[25%] px-6 py-4 border-b border-t text-gray-500 text-center align-bottom"></th>
              <th class="w-[25%] px-6 py-4 border-b border-t text-gray-500 text-center font-normal align-bottom">{{ formatRupiah(dataModal.data.modal_awal) }}</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="px-6 py-4 border-b text-gray-500 text-center align-bottom"></td>
              <td class="px-6 py-4 border-b text-gray-500 text-center align-bottom">Pembahan Modal</td>
              <td class="px-6 py-4 border-b text-gray-500 text-center align-bottom">{{ formatRupiah(dataModal.data.penambahan_modal) }}</td>
              <td class="px-6 py-4 border-b text-gray-500 text-center align-bottom"></td>
            </tr>
            <tr>
              <td class="px-6 py-4 border-b  text-gray-500 text-center align-bottom"></td>
              <td class="px-6 py-4 border-b  text-gray-500 text-center align-bottom">Ikhtisar Laba Rugi</td>
              <td class="px-6 py-4 border-b  text-gray-500 text-center align-bottom">{{ formatRupiah(dataModal.data.iktisar_laba_rugi) }}</td>
              <td class="px-6 py-4 border-b  text-gray-500 text-center align-bottom"></td>
            </tr>
            <tr>
              <td class="px-6 py-4 border-b  text-gray-500 text-center align-bottom"></td>
              <td class="px-6 py-4 border-b  text-gray-500 text-center align-bottom">Pengurangan Modal</td>
              <td class="px-6 py-4 border-b  text-gray-500 text-center align-bottom">{{ formatRupiah(dataModal.data.pengurangan_modal) }}</td>
              <td class="px-6 py-4 border-b  text-gray-500 text-center align-bottom"></td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <td class="px-6 py-4 border-b  text-gray-500 text-center align-bottom">Modal Akhir</td>
              <td class="px-6 py-4 border-b  text-gray-500 text-center align-bottom"></td>
              <td class="px-6 py-4 border-b  text-gray-500 text-center align-bottom"></td>
              <td class="px-6 py-4 border-b  text-gray-500 text-center align-bottom">{{ formatRupiah(dataModal.data.modal_akhir) }}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  </div>
</template>
