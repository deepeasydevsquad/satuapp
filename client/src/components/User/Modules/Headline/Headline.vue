<script setup lang="ts">
import Notification from '@/components/User/Modules/Headline/Particle/Notification.vue';
import Confirmation from '@/components/User/Modules/Headline/Particle/Confirmation.vue';
import DeleteIcon from '@/components/User/Modules/Headline/Icon/DeleteIcon.vue';
import EditIcon from '@/components/User/Modules/Headline/Icon/EditIcon.vue';
import FormHeadline from '@/components/User/Modules/Headline/Widget/FormHeadline.vue';
import Pagination from '@/components/Pagination/Pagination.vue';
import PrimaryButton from '@/components/Button/PrimaryButton.vue';
import LightButton from '@/components/Button/LightButton.vue';
import DangerButton from '@/components/Button/DangerButton.vue';
import IconPlus from '@/components/Icons/IconPlus.vue'

import { ref, onMounted, computed } from 'vue';

import { getDaftarHeadline, deleteHeadline } from '@/service/headline';

const itemsPerPage = 100; // Jumlah asuransi per halaman
const currentPage = ref(1);
const search = ref("");
const totalPages = ref(0);
const total = ref<number>(0);
const totalColumns = ref(3); // Default 3 kolom

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

interface Headline {
  id: number;
  headline: string;
  tampilkan: boolean;
}

const isLoading = ref(true)
const confirmMessage = ref<string>('');
const confirmTitle = ref<string>('');
const confirmAction = ref<(() => void) | null>(null);
const showConfirmDialog = ref<boolean>(false);
const showNotification = ref(false)
const notificationType = ref('')
const notificationMessage = ref('')
const isFormOpen = ref<boolean>(false)
const headlineId = ref<number | undefined>(undefined)
const dataHeadline = ref<Headline[]>([])

const fetchData = async () => {
  isLoading.value = true
  try {
    const response = await getDaftarHeadline({
      search: search.value,
      perpage: itemsPerPage,
      pageNumber: currentPage.value
    })
    dataHeadline.value = response.data
    total.value = response.total
    totalPages.value = Math.ceil(response.total / itemsPerPage)
  } catch (error) {
    displayNotification('Gagal mengambil data', 'error')
    isLoading.value = false
  } finally {
    isLoading.value = false
  }
}

let timeoutId: number | null = null

const displayNotification = (message: string, type: 'success' | 'error' = 'success') => {
  notificationMessage.value = message
  notificationType.value = type
  showNotification.value = true
  if (timeoutId) clearTimeout(timeoutId)
  timeoutId = window.setTimeout(() => {
    showNotification.value = false
  }, 3000)
}

const showConfirmation = (title: string, message: string, action: () => void) => {
  confirmTitle.value = title;
  confirmMessage.value = message;
  confirmAction.value = action;
  showConfirmDialog.value = true;
};

const showForm = async (id?: number) => {
  headlineId.value = id
  isFormOpen.value = true
}

const deleteData = async (id: number) => {
  showConfirmation('Konfirmasi Hapus', 'Apakah Anda yakin ingin menghapus headline ini?', async () => {
    try {
      const res = await deleteHeadline(id)
      displayNotification(res.error_msg ||
                          res.message ||
                          'Headline berhasil dihapus.', 'success')
      fetchData()
    } catch (error) {
      displayNotification('Gagal menghapus headline', 'error')
    }
    showConfirmDialog.value = false
  })
}

onMounted(() => {
  fetchData()
})
</script>

<template>
  <div v-if="isLoading" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
    <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-400"></div>
  </div>
  <div class="container mx-auto p-4">
    <!-- Tambah data dan Search -->
    <div class="flex justify-between items-center mb-4">
      <PrimaryButton @click="showForm()">
       <IconPlus />
        Tambah Headline
      </PrimaryButton>
      <div class="flex items-center">
        <label for="search" class="block text-sm font-medium text-gray-700 mr-2">Search</label>
        <input
          type="text"
          id="search"
          class="block w-64 px-3 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
          v-model="search"
          @change="fetchData()"
          placeholder="Cari data..."
        />
      </div>
    </div>

    <!-- Table data -->
    <div class="overflow-hidden rounded-lg border border-gray-200 shadow-md">
      <table class="w-full border-collapse bg-white text-left text-sm text-gray-700">
        <thead class="bg-gray-100">
          <tr>
            <th class="w-[80%] px-6 py-3 font-medium font-bold text-gray-900 text-center">Headline</th>
            <th class="w-[10%] px-6 py-3 font-medium font-bold text-gray-900 text-center">Tampilkan</th>
            <th class="w-[10%] px-6 py-3 font-medium font-bold text-gray-900 text-center">Aksi</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100 border-t border-gray-100">
          <template v-if="dataHeadline && dataHeadline.length > 0">
            <tr v-for="headline in dataHeadline" :key="headline.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 text-center">{{ headline.headline }}</td>
              <td class="px-6 py-4 text-center">{{ headline.tampilkan }}</td>
              <td class="px-6 py-4 text-center">
                <div class="flex justify-center gap-2">
                  <LightButton @click="showForm(headline.id)">
                    <EditIcon></EditIcon>
                  </LightButton>
                  <DangerButton @click="deleteData(headline.id)">
                    <DeleteIcon></DeleteIcon>
                  </DangerButton>
                </div>
              </td>
            </tr>
          </template>
          <tr v-else>
            <td :colspan="totalColumns" class="px-6 py-4 text-center text-base text-gray-600">Daftar Headline tidak ditemukan.</td>
          </tr>
        </tbody>
        <tfoot class="bg-gray-100 font-bold">
          <!-- <Pagination
              :current-page="currentPage"
              :total-pages="totalPages"
              :pages="pages"
              :total-columns="totalColumns"
              :total-row="total"
              @prev-page="prevPage"
              @next-page="nextPage"
              @page-now="pageNow"
            /> -->
             <Pagination
            :current-page="currentPage"
            :total-pages="totalPages"
            :pages="pages"
            :total-columns="totalColumns"
            @prev-page="prevPage"
            @next-page="nextPage"
            @page-now="pageNow"
            :totalRow="total"
          />
        </tfoot>
      </table>
    </div>
  </div>
  <!-- Modal Form -->
  <Transition
    enter-active-class="transition duration-200 ease-out"
    enter-from-class="transform scale-95 opacity-0"
    enter-to-class="transform scale-100 opacity-100"
    leave-active-class="transition duration-200 ease-in"
    leave-from-class="transform scale-100 opacity-100"
    leave-to-class="transform scale-95 opacity-0"
  >
    <FormHeadline
      v-if="isFormOpen"
      :is-form-open="isFormOpen"
      :headline-id="headlineId"
      @close="isFormOpen = false; fetchData()"
      @status="(payload: any) => displayNotification(payload.err_msg || 'Data gagal disimpan', payload.error ? 'error' : 'success')"
    />
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

  <!-- Notification Popup -->
  <Notification  :showNotification="showNotification"  :notificationType="notificationType" :notificationMessage="notificationMessage" @close="showNotification = false"  ></Notification>
</template>
