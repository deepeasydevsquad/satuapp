<script setup lang="ts">
  import { ref, computed, onMounted } from 'vue'
  import { list, setujuiRequestMemberUrl, rejectRequestMemberUrl } from '@/service/request_member'
  import { paramCabang  } from '@/service/param_cabang';
  import Pagination from '@/components/Pagination/Pagination.vue'
  import Notification from '@/components/Modal/Notification.vue'
  import Confirmation from '@/components/Modal/Confirmation.vue'
  import DangerButton from "@/components/Button/DangerButton.vue"
  import LightButton from "@/components/Button/LightButton.vue"

  interface filterCabang {
    id: number;
    name: string;
  }

  interface RequestMember {
    id: number;
    fullname: string;
    identity_number:string;
    identity_type:string;
    gender: string;
    birth_date: string;
    birth_place: string;
    whatsapp_number: string;
    address: string;
    cabangName: string;
    nama_agen: string;
    status: string;
    updatedAt: string
  }

  const data = ref<Partial<RequestMember[]>>([])
  const loading = ref(true)
  const error = ref<string | null>(null)
  const selectedOptionCabang = ref(0);
  const selectedOptionStatus = ref('process');
  const optionFilterCabang = ref<filterCabang[]>([]);
  const search = ref('');
  const currentPage = ref(1)
  const itemsPerPage = 100
  const totalColumns = ref(5);
  const totalPages = ref(0);
  const totalRow = ref(0);
  const timeoutId = ref<number | null>(null);
  const showConfirmDialog = ref<boolean>(false);
  const confirmMessage = ref<string>('');
  const confirmTitle = ref<string>('');
  const confirmAction = ref<(() => void) | null>(null);
  const showNotification = ref<boolean>(false);
  const notificationType = ref<'success' | 'error'>('success');
  const notificationMessage = ref<string>('');

  const showConfirmation = (title: string, message: string, action: () => void) => {
    confirmTitle.value = title;
    confirmMessage.value = message;
    confirmAction.value = action;
    showConfirmDialog.value = true;
  };

  const displayNotification = (message: string, type: 'success' | 'error' = 'success') => {
    notificationMessage.value = message;
    notificationType.value = type;
    showNotification.value = true;

    if (timeoutId.value) clearTimeout(timeoutId.value);

    timeoutId.value = window.setTimeout(() => {
      showNotification.value = false;
    }, 3000);
  };

  // Fungsi untuk mengambil data log
  const fetchData = async () => {
    try {
      loading.value = true
      error.value = null
      const response = await list({
        search: search.value,
        perpage: itemsPerPage,
        pageNumber: currentPage.value,
        cabang: selectedOptionCabang.value,
        status: selectedOptionStatus.value
      });
      data.value = response.data
      totalRow.value = response.total;
      totalPages.value = Math.ceil(response.total / itemsPerPage);
      console.log();
    } catch (err) {
      error.value = 'Gagal mengambil data. Silakan coba lagi.'
    } finally {
      loading.value = false
    }
  }

  const fetchFilterData = async() => {
    const response = await paramCabang();
    optionFilterCabang.value = response.data;
    selectedOptionCabang.value = response.data[0].id;
    await fetchData();
  }

  const pages = computed(() => {
    return Array.from({ length: totalPages.value }, (_, i) => i + 1);
  });

  const pageNow = (page : number) => {
    currentPage.value = page
    fetchData()
  }

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

  const approveRequestMember = async ( id: number )  => {
     showConfirmation(
      'Konfirmasi Persetujuan',
      'Apakah Anda yakin ingin menyetujui permohonan member ini?',
      async () => {
        try {
          const response = await setujuiRequestMemberUrl(id);
          showConfirmDialog.value = false;
          displayNotification(response.error_msg);
          fetchData();
        } catch (error) {
          displayNotification(error.response.data.error_msg, 'error');
        }
      }
    );
  }

  const rejectRequestMember = async ( id: number )  => {
    showConfirmation(
      'Konfirmasi Penolakan',
      'Apakah Anda yakin ingin menolak permohonan member ini?',
      async () => {
        try {
          const response = await rejectRequestMemberUrl(id);
          showConfirmDialog.value = false;
          displayNotification(response.error_msg);
          fetchData();
        } catch (error) {
          console.log("-----error");
          console.log(error);
          console.log("-----error");
          displayNotification(error.response.data.error_msg, 'error');
        }
      }
    );
  }

  onMounted(() => {
    fetchFilterData()
  })
</script>
<template>
 <div class="container mx-auto p-4">
    <div class="flex justify-end mb-4">
      <div class="inline-flex rounded-md shadow-xs" role="group">
        <input type="text" id="search" class="block w-64 px-3 py-2 text-gray-700 bg-white border border-gray-300 rounded-s-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200" v-model="search" @input="fetchData" placeholder="Cari data..."/>
        <select v-model="selectedOptionStatus" style="width: 300px" @change="fetchData()"
          class="border-t border-b  bg-gray-50 border-gray-300 text-gray-900 text-sm focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
          <option value="process">Proses</option>
          <option value="approved">Disetujui</option>
          <option value="rejected">Ditolak</option>
        </select>
        <select v-model="selectedOptionCabang" style="width: 300px" @change="fetchData()"
          class="border-t border-b border-e bg-gray-50 border-gray-300 text-gray-900 text-sm rounded-e-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
          <option v-for="optionC in optionFilterCabang" :key="optionC.id" :value="optionC.id">
            {{ optionC.name }}
          </option>
        </select>
      </div>
    </div>
    <div class="overflow-hidden rounded-lg border border-gray-200 shadow-md">
      <table class="w-full border-collapse bg-white text-left text-sm text-gray-500">
        <thead class="bg-gray-50">
          <tr>
            <th class="w-[35%] px-6 py-4 font-medium font-bold text-gray-900 text-center">Info Calon Member</th>
            <th class="w-[25%] px-6 py-4 font-medium font-bold text-gray-900 text-center">Info Keagenan</th>
            <th class="w-[15%] px-6 py-4 font-medium font-bold text-gray-900 text-center">Cabang</th>
            <th class="w-[15%] px-6 py-4 font-medium font-bold text-gray-900 text-center">Tanggal Request</th>
            <th class="w-[10%] px-6 py-4 font-medium font-bold text-gray-900 text-center">Aksi</th>
          </tr>
        </thead>
        <tbody>
          <template v-if="data.length > 0">
            <tr  v-for="x in data" :key="x.id">
              <td class="py-3 px-6  border-gray-300 align-top">
                <table class="w-full mb-5">
                  <tbody>
                    <tr>
                      <td class="w-[45%] border-b px-6 py-2">Nama Member</td>
                      <td class="text-center border-b py-2">:</td>
                      <td class="text-right space-y-2 text-sm border-b px-6 py-2">{{ x?.fullname.toLocaleString() }}</td>
                    </tr>
                    <tr>
                      <td class="border-b px-6 py-2">Jenis Kelamin</td>
                      <td class="text-center border-b py-2">:</td>
                      <td class="text-right space-y-2 text-sm border-b px-6 py-2">{{ x?.gender == 'laki_laki' ? 'Laki-laki' : 'Perempuan' }}</td>
                    </tr>
                    <tr>
                      <td class="border-b px-6 py-2">Nomor Identitas</td>
                      <td class="text-center border-b py-2">:</td>
                      <td class="text-right space-y-2 text-sm border-b px-6 py-2">{{ x?.identity_number }}</td>
                    </tr>
                    <tr>
                      <td class="border-b px-6 py-2">Jenis Identitas</td>
                      <td class="text-center border-b py-2">:</td>
                      <td class="text-right space-y-2 text-sm border-b px-6 py-2">{{ x?.identity_type }}</td>
                    </tr>
                    <tr>
                      <td class="border-b px-6 py-2">Tempat / Tanggal Lahir</td>
                      <td class="text-center border-b py-2">:</td>
                      <td class="text-right space-y-2 text-sm border-b px-6 py-2">{{ x?.birth_place + ', ' + x?.birth_date }}</td>
                    </tr>
                    <tr>
                      <td class="border-b px-6 py-2">Nomor Whatsapp</td>
                      <td class="text-center border-b py-2">:</td>
                      <td class="text-right space-y-2 text-sm border-b px-6 py-2">{{ x?.whatsapp_number }}</td>
                    </tr>
                    <tr>
                      <td class="border-b px-6 py-2">Alamat</td>
                      <td class="text-center border-b py-2">:</td>
                      <td class="text-right space-y-2 text-sm border-b px-6 py-2">{{ x?.address }}</td>
                    </tr>
                  </tbody>
                </table>
              </td>
              <td class="py-3 px-6  border-gray-300 align-top">
                <table class="w-full mb-5">
                  <tbody>
                    <tr>
                      <td class="w-[45%] border-b px-6 py-2">Nama Agen</td>
                      <td class="text-center border-b py-2">:</td>
                      <td class="text-right space-y-2 text-sm border-b px-6 py-2">{{ x?.agen.toLocaleString() }}</td>
                    </tr>
                  </tbody>
                </table>
              </td>
              <td class="py-3 px-6  border-gray-300 align-top text-center">{{ x?.cabangName }}</td>
              <td class="py-3 px-6  border-gray-300 align-top text-center">{{ x?.updatedAt }} <br>
                <b>
                  <span v-if="x?.status == 'approved'" style="color:green">DISETUJUI</span>
                  <span v-if="x?.status == 'process'" style="color:orange">PROSES</span>
                  <span v-if="x?.status == 'rejected'" style="color:red">DITOLAK</span>
                </b>
              </td>
              <td class="px-6 py-4 text-center align-top">
              <div class="flex flex-col items-center gap-2">
                <template v-if="x?.status == 'process'">
                  <LightButton @click="approveRequestMember(x?.id)">
                    <font-awesome-icon icon="fa-solid fa-check" />
                  </LightButton>
                  <DangerButton @click="rejectRequestMember(x?.id)">
                    <font-awesome-icon icon="fa-solid fa-xmark" />
                  </DangerButton>
                </template>
              </div>
              </td>
            </tr>
          </template>
          <template v-else>
            <tr>
              <td :colspan="totalColumns" class="px-6 py-4 text-center text-gray-500">
                Data tidak ditemukan
              </td>
            </tr>
          </template>
        </tbody>
        <tfoot class="bg-gray-100 font-bold">
          <Pagination :current-page="currentPage" :total-pages="totalPages" :pages="pages" :total-columns="totalColumns" @prev-page="prevPage" @next-page="nextPage" @page-now="pageNow" :totalRow="totalRow"/>
        </tfoot>
      </table>
    </div>
    <!-- Confirmation Dialog -->
    <Confirmation  :showConfirmDialog="showConfirmDialog"  :confirmTitle="confirmTitle" :confirmMessage="confirmMessage" >
      <button @click="confirmAction && confirmAction()"
        class="inline-flex w-full justify-center rounded-md border border-transparent bg-yellow-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm" >
        Ya
      </button>
      <button @click="showConfirmDialog = false"
        class="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm" >
        Tidak
      </button>
    </Confirmation>
    <!-- Notification Popup -->
    <Notification  :showNotification="showNotification"  :notificationType="notificationType" :notificationMessage="notificationMessage" @close="showNotification = false"  ></Notification>
  </div>
</template>
