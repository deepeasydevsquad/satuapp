<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import {
  getBerandaUtama,
  getDaftarJamaah,
  getDaftarPermintaanDepositMember,
  getDaftarHeadline,
  updateStatusRequestDepositMember,
  deleteRequestDepositMember,
  deleteHeadline,
} from '@/service/beranda_utama'

// Import components
import EditIcon from '@/components/User/Modules/BerandaUtama/icon/EditIcon.vue'
import DeleteIcon from '@/components/User/Modules/BerandaUtama/icon/DeleteIcon.vue'
import FormHeadline from '@/components/User/Modules/Headline/Widget/FormHeadline.vue'
import SkeletonTable from '@/components/SkeletonTable/SkeletonTable.vue'
import InfoCard from '@/components/User/Modules/BerandaUtama/widget/InfoCard.vue'
import Pagination from '@/components/Pagination/Pagination.vue'
import Notification from '@/components/User/Modules/BerandaUtama/particle/Notification.vue'
import Confirmation from '@/components/User/Modules/BerandaUtama/particle/Confirmation.vue'
import PrimaryButton from '@/components/Button/PrimaryButton.vue'
import PrimaryButtonLight from '@/components/Button/PrimaryButtonLight.vue'

interface StatusCard {
  saldo_perusahaan: number;
  total_jamaah_terdaftar: number;
  total_paket_berangkat: number;
  total_jamaah_berangkat: number;
  total_tiket_terjual: number;
}

interface Jamaah {
  jamaah_name: string;
  jamaah_identity: string;
  birth_date: string;
  birth_place: string;
  no_passport: string;
  total: number;
}

interface Headline {
  id: number;
  headline: string;
  tampilkan: boolean;
}

interface DepositMember {
  id: number;
  member_name: string;
  member_identity: string;
  jumlah: number;
  status_note: string;
  bank_info: string;
  sending_payment_status: 'sudah_dikirim' | 'belum_dikirim';
}

// Status Card
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
const dataStatusCard = ref<StatusCard>({
  saldo_perusahaan: 0,
  total_jamaah_terdaftar: 0,
  total_paket_berangkat: 0,
  total_jamaah_berangkat: 0,
  total_tiket_terjual: 0,
})

const headline = reactive({
  isLoading: true,
  currentPage: 1,
  totalPages: 0,
  totalColumns: 3,
  totalRow: 0,
  itemsPerPage: 5,
  data: [] as Headline[],
})

const jamaah = reactive({
  isLoading: true,
  currentPage: 1,
  search: '',
  totalPages: 0,
  totalColumns: 4,
  totalRow: 0,
  itemsPerPage: 10,
  data: [] as Jamaah[],
})

const deposit = reactive({
  isLoading: true,
  currentPage: 1,
  search: '',
  totalPages: 0,
  totalColumns: 4,
  totalRow: 0,
  itemsPerPage: 10,
  data: [] as DepositMember[],
})

const fetchStatusCard = async () => {
  try {
    isLoading.value = true
    const res = await getBerandaUtama()
    dataStatusCard.value = res.data
  } catch (error) {
    console.error('Error fetching status card:', error)
  } finally {
    isLoading.value = false
  }
}

const fetchHeadlineData = async () => {
  try {
    headline.isLoading = true
    const res = await getDaftarHeadline({
      perpage: headline.itemsPerPage,
      pageNumber: headline.currentPage,
    })
    headline.data = res.data
    headline.totalRow = res.total
    headline.totalPages = Math.ceil(res.total / headline.itemsPerPage)
  } catch (error) {
    console.error('Error fetching headline:', error)
  } finally {
    headline.isLoading = false
  }
}

const fetchJamaahData = async () => {
  try {
    jamaah.isLoading = true
    const res = await getDaftarJamaah({
      search: jamaah.search,
      perpage: jamaah.itemsPerPage,
      pageNumber: jamaah.currentPage,
    })
    jamaah.data = res.data
    jamaah.totalRow = res.total
    jamaah.totalPages = Math.ceil(res.total / jamaah.itemsPerPage)
  } catch (error) {
    console.error('Error fetching jamaah:', error)
  } finally {
    jamaah.isLoading = false
  }
}

const fetchDepositMemberData = async () => {
  try {
    deposit.isLoading = true
    const res = await getDaftarPermintaanDepositMember({
      search: deposit.search,
      perpage: deposit.itemsPerPage,
      pageNumber: deposit.currentPage,
    })
    deposit.data = res.data
    deposit.totalRow = res.total
    deposit.totalPages = Math.ceil(res.total / deposit.itemsPerPage)
  } catch (error) {
    console.error('Error fetching deposit:', error)
  } finally {
    deposit.isLoading = false
  }
}

const pages = (totalPages: number) => {
  return Array.from({ length: totalPages }, (_, i) => i + 1)
}

const handlePageChange = (state: { currentPage: number; fetchData: () => void }, page: number) => {
  state.currentPage = page
  state.fetchData()
}

const prevPage = (state: { currentPage: number; fetchData: () => void }) => {
  if (state.currentPage > 1) {
    state.currentPage--
    state.fetchData()
  }
}

const nextPage = (state: { currentPage: number; totalPages: number; fetchData: () => void }) => {
  if (state.currentPage < state.totalPages) {
    state.currentPage++
    state.fetchData()
  }
}

let timeoutId: number | null = null
const handleSearch = (state: { currentPage: number; fetchData: () => void }) => {
  if (timeoutId) clearTimeout(timeoutId)
  timeoutId = window.setTimeout(() => {
    state.currentPage = 1
    state.fetchData()
  }, 500)
}

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

onMounted(() => {
  fetchStatusCard()
  fetchHeadlineData()
  fetchJamaahData()
  fetchDepositMemberData()
})

const updateRequestDepositMemberStatus = async (id: number, status: string) => {
  if (status !== 'disetujui' && status !== 'ditolak') {
    displayNotification('Status hanya boleh di setujui atau tolak', 'error');
    return;
  }
  showConfirmation('Konfirmasi Aksi', `Apakah Anda yakin ingin ${status == 'ditolak' ? 'MENOLAK' : 'MENYETUJUI'} permintaan deposit ini?`, async () => {
    try {
      const res = await updateStatusRequestDepositMember({
        id: id,
        status: status,
      })
      displayNotification(res.error_msg || res.message || `Permintaan deposit berhasil ${status}.`, 'success')
      fetchDepositMemberData()
    } catch (error: any) {
      displayNotification(error.response?.data?.error_msg || error.response?.data?.message || `Gagal ${status} permintaan deposit`, 'error')
    }
    showConfirmDialog.value = false
  })
}

const deleteHeadlineData = async (id: number) => {
  showConfirmation('Konfirmasi Hapus', 'Apakah Anda yakin ingin menghapus headline ini?', async () => {
    try {
      const res = await deleteHeadline(id)
      displayNotification(res.error_msg || res.message || 'Headline berhasil dihapus.', 'success')
      fetchHeadlineData()
    } catch (error: any) {
      displayNotification(error.response?.data?.error_msg || error.response?.data?.message || 'Gagal menghapus headline', 'error')
    }
    showConfirmDialog.value = false
  })
}

const deletePermintaanDeposit = async (id: number) => {
  showConfirmation('Konfirmasi Hapus', 'Apakah Anda yakin ingin menghapus permintaan deposit ini?', async () => {
    try {
      const res = await deleteRequestDepositMember(id)
      displayNotification(res.data?.error_msg || res.data?.message || 'Permintaan deposit berhasil dihapus.', 'success')
      fetchDepositMemberData()
    } catch (error: any) {
      displayNotification(error.response?.data?.error_msg || error.response?.data?.message || 'Gagal menghapus permintaan deposit', 'error')
    }
    showConfirmDialog.value = false
  })
}
</script>

<template>
  <div v-if="isLoading" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
    <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-400"></div>
  </div>
  <div class="p-4 space-y-6 text-gray-800">
    <div class="flex justify-between items-center border-b pb-4 mb-4">
      <PrimaryButtonLight class="flex items-center gap-2 text-base"  @click="$router.go(0)">
        <font-awesome-icon icon="fa-undo-alt" class="mr-0" /> Reload Page
      </PrimaryButtonLight>
      <PrimaryButtonLight class="flex items-center gap-2 text-base">
        <font-awesome-icon icon="fa-solid fa-money-bill-alt" class="mr-2" /> <strong>Saldo Perusahaan :</strong> Rp. {{ dataStatusCard.saldo_perusahaan.toLocaleString() }}
      </PrimaryButtonLight>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-8 gap-4">
      <div class="md:col-span-5">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <InfoCard title="JAMAAH" subtitle="terdaftar" :count="dataStatusCard.total_jamaah_terdaftar" color="bg-cyan-600" icon="user-check" />
          <InfoCard title="PAKET" subtitle="akan berangkat" :count="dataStatusCard.total_paket_berangkat" color="bg-green-600" icon="box-open" />
          <InfoCard title="JAMAAH" subtitle="akan berangkat" :count="dataStatusCard.total_jamaah_berangkat" color="bg-yellow-500" icon="user" />
          <InfoCard title="TIKET" subtitle="terjual bulan ini" :count="dataStatusCard.total_tiket_terjual" color="bg-red-600" icon="ticket" />
        </div>
      </div>
      <div class="md:col-span-3">
        <!-- Headline -->
        <div class="bg-white rounded-lg shadow p-4">
          <div class="flex justify-between items-center mb-4">
            <h2 class="font-semibold mt-1">Headline</h2>
            <PrimaryButton class="flex items-center gap-2 text-sm" @click="showForm()">
              <font-awesome-icon icon="plus" /> Tambah
            </PrimaryButton>
          </div>
          <div class="overflow-x-auto rounded-lg border">
            <SkeletonTable v-if="headline.isLoading" :columns="headline.totalColumns" :rows="headline.itemsPerPage" />
            <table v-else class="w-full text-sm">
              <thead class="bg-gray-100">
                <tr>
                  <th class="p-3 font-medium text-gray-900 text-left">Headline</th>
                  <th class="p-3 font-medium text-gray-900 text-center">Tampil</th>
                  <th class="p-3 font-medium text-gray-900 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, index) in headline.data" :key="index" class="hover:bg-gray-50 border-b">
                  <td class="p-3 align-top">{{ item.headline }}</td>
                  <td class="p-3 align-top text-center">
                    <span v-if="item.tampilkan" class="px-2 py-0.5 text-xs font-medium text-green-800 bg-green-100 rounded-full">Ya</span>
                    <span v-else class="px-2 py-0.5 text-xs font-medium text-red-800 bg-red-100 rounded-full">Tidak</span>
                  </td>
                  <td class="p-2 align-top">
                    <div class="flex justify-center items-center gap-2">
                      <button @click="showForm(item.id)" class="p-2 text-gray-500 bg-gray-100 rounded-md hover:bg-blue-100 hover:text-blue-500 transition-colors">
                        <EditIcon class="w-4 h-4" />
                      </button>
                      <button @click="deleteHeadlineData(item.id)" class="p-2 text-gray-500 bg-gray-100 rounded-md hover:bg-red-100 hover:text-red-500 transition-colors">
                        <DeleteIcon class="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
                <tr v-if="headline.data.length === 0">
                  <td :colspan="headline.totalColumns" class="p-4 text-center text-gray-500">Daftar Headline Tidak Ditemukan</td>
                </tr>
              </tbody>
              <tfoot class="bg-gray-100 font-bold">
                <Pagination
                  :current-page="headline.currentPage"
                  :total-pages="headline.totalPages"
                  :pages="pages(headline.totalPages)"
                  :total-columns="headline.totalColumns"
                  :total-row="headline.totalRow"
                  @prev-page="() => prevPage({ ...headline, fetchData: fetchHeadlineData })"
                  @next-page="() => nextPage({ ...headline, fetchData: fetchHeadlineData })"
                  @page-now="(page: number) => handlePageChange({ ...headline, fetchData: fetchHeadlineData }, page)"
                />
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- Jamaah Terdaftar & Permintaan Deposit -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="bg-white rounded shadow p-4">
        <div class="flex items-center mb-4 justify-between">
          <h2 class="font-semibold mt-1">Jamaah Terdaftar</h2>
          <input
            type="text"
            class="block w-1/2 px-3 py-2 text-base text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 placeholder:text-gray-400"
            v-model="jamaah.search"
            @input="handleSearch({ ...jamaah, fetchData: fetchJamaahData })"
            placeholder="Nama / Nomor Identitas Jamaah"
          />
        </div>
        <div class="overflow-x-auto rounded-lg border">
          <SkeletonTable v-if="jamaah.isLoading" :columns="jamaah.totalColumns" :rows="jamaah.itemsPerPage" />
          <table v-else class="w-full text-sm">
            <thead class="bg-gray-100">
              <tr>
                <th class="p-3 font-medium text-gray-900 text-left">Jamaah</th>
                <th class="p-3 font-medium text-gray-900 text-left">Kelahiran</th>
                <th class="p-3 font-medium text-gray-900 text-left">No. Passport</th>
                <th class="p-3 font-medium text-gray-900 text-left">Total Pembelian</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in jamaah.data" :key="index" class="hover:bg-gray-50 border-b">
                <td class="p-3 align-top">
                  <p class="font-semibold">{{ item.jamaah_name }}</p>
                  <p class="text-xs text-gray-600">{{ item.jamaah_identity }}</p>
                </td>
                <td class="p-3 align-top">
                  <p>{{ item.birth_place }}</p>
                  <p class="text-xs text-gray-600">{{ item.birth_date }}</p>
                </td>
                <td class="p-3 align-top">{{ item.no_passport }}</td>
                <td class="p-3 align-top font-semibold">{{ item.total ?? '0' }}</td>
              </tr>
              <tr v-if="jamaah.data.length === 0">
                <td :colspan="jamaah.totalColumns" class="p-4 text-center text-gray-500">Data Jamaah Tidak Ditemukan</td>
              </tr>
            </tbody>
            <tfoot class="bg-gray-100 font-bold">
              <Pagination
                :current-page="jamaah.currentPage"
                :total-pages="jamaah.totalPages"
                :pages="pages(jamaah.totalPages)"
                :total-columns="jamaah.totalColumns"
                :total-row="jamaah.totalRow"
                @prev-page="() => prevPage({ ...jamaah, fetchData: fetchJamaahData })"
                @next-page="() => nextPage({ ...jamaah, fetchData: fetchJamaahData })"
                @page-now="(page: number) => handlePageChange({ ...jamaah, fetchData: fetchJamaahData }, page)"
              />
            </tfoot>
          </table>
        </div>
      </div>
      <div class="bg-white rounded shadow p-4">
        <div class="flex items-center mb-4 justify-between">
          <h2 class="font-semibold mt-1">Permintaan Deposit Member</h2>
          <input
            type="text"
            class="block w-1/2 px-3 py-2 text-base text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 placeholder:text-gray-400"
            v-model="deposit.search"
            @input="handleSearch({ ...deposit, fetchData: fetchDepositMemberData })"
            placeholder="Nama / Nomor Identitas Member"
          />
        </div>
        <div class="overflow-x-auto rounded-lg border">
          <SkeletonTable v-if="deposit.isLoading" :columns="deposit.totalColumns" :rows="deposit.itemsPerPage" />
          <table v-else class="w-full text-sm">
            <thead class="bg-gray-100">
              <tr>
                <th class="p-3 font-medium text-gray-900 text-left">Member</th>
                <th class="p-3 font-medium text-gray-900 text-left">Jumlah & Status</th>
                <th class="p-3 font-medium text-gray-900 text-left">Info Bank</th>
                <th class="p-3 font-medium text-gray-900 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>

              <tr v-for="(item, index) in deposit.data" :key="index" class="hover:bg-gray-50 border-b">
                <td class="p-3 align-top">
                  <p class="font-semibold">{{ item.member_name }}</p>
                  <p class="text-xs text-gray-600">{{ item.member_identity }}</p>
                </td>
                <td class="p-3 align-top">
                  <p class="font-semibold text-green-600">Rp {{ item.jumlah.toLocaleString() }}</p>
                  <p class="text-xs text-gray-600">{{ item.status_note }}</p>
                </td>
                <td class="p-2 align-top">
                  <p>{{ item.bank_info }}</p>
                  <span v-if="item.sending_payment_status === 'sudah_dikirim'" class="px-2 py-0.5 text-xs font-medium text-blue-800 bg-blue-100 rounded-full">
                    {{ item.sending_payment_status.replace('_', ' ') }}
                  </span>
                  <span v-else class="px-2 py-0.5 text-xs font-medium text-yellow-800 bg-yellow-100 rounded-full">
                    {{ item.sending_payment_status.replace('_', ' ') }}
                  </span>
                </td>
                <td class="p-3 align-top">
                  <div class="flex justify-center items-center gap-2">
                    <button @click="updateRequestDepositMemberStatus(item.id, 'disetujui')" class="px-2 py-2 text-xs font-medium text-white bg-green-500 rounded-md hover:bg-green-600 transition-colors">Setujui</button>
                    <button @click="updateRequestDepositMemberStatus(item.id, 'ditolak')" class="px-2 py-2 text-xs font-medium text-white bg-red-500 rounded-md hover:bg-red-600 transition-colors">Tolak</button>
                    <button @click="deletePermintaanDeposit(item.id)" class="p-2 text-gray-500 bg-gray-100 rounded-md hover:bg-red-100 hover:text-red-500 transition-colors">
                      <DeleteIcon class="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="deposit.data.length === 0">
                <td :colspan="deposit.totalColumns" class="p-4 text-center text-gray-500">
                  Daftar Request Deposit Tidak Ditemukan
                </td>
              </tr>
            </tbody>
            <tfoot class="bg-gray-100 font-bold">
              <Pagination
                :current-page="deposit.currentPage"
                :total-pages="deposit.totalPages"
                :pages="pages(deposit.totalPages)"
                :total-columns="deposit.totalColumns"
                :total-row="deposit.totalRow"
                @prev-page="() => prevPage({ ...deposit, fetchData: fetchDepositMemberData })"
                @next-page="() => nextPage({ ...deposit, fetchData: fetchDepositMemberData })"
                @page-now="(page: number) => handlePageChange({ ...deposit, fetchData: fetchDepositMemberData }, page)"
              />
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  </div>
  <FormHeadline
    v-if="isFormOpen"
    :is-form-open="isFormOpen"
    :headline-id="headlineId"
    @close="isFormOpen = false; fetchHeadlineData()"
    @status="(payload: any) => displayNotification(payload.err_msg || 'Data gagal disimpan', payload.error ? 'error' : 'success')"
  />

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
  <!-- Notification Popup -->
  <Notification
    :show-notification="showNotification"
    :notification-type="notificationType"
    :notification-message="notificationMessage"
    @close="showNotification = false"
  ></Notification>
</template>
