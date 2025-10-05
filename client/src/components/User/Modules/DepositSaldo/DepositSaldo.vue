<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { daftarDeposit } from '../../../../service/deposit_saldo'
import Confirmation from './Particle/Confirmation.vue'
import Notification from './Particle/Notification.vue'
import DeleteIcon from './Icon/DeleteIcon.vue'
import FormAdd from './Particle/FormAdd.vue'
import LightButton from '@/components/Button/LightButton.vue'
import PrimaryButton from '@/components/Button/PrimaryButton.vue'
import Pagination from '@/components/Pagination/Pagination.vue'
import { paramCabang } from '@/service/param_cabang'

interface Deposit {
  id: string
  invoice: string
  fullname: string
  nominal: number
  saldo_sebelum: number
  saldo_sesudah: number
  penerima: string
  createdAt: string
}

// Reactive State
const deposits = ref<Deposit[]>([])
const searchQuery = ref('')
const currentPage = ref(1)
const totalPages = ref(1)
const totalItems = ref(0)
const totalColumns = ref(5)
const itemsPerPage = ref(10)
const maxVisiblePages = 5
const isLoading = ref(false)
const showDeleteConfirmDialog = ref(false)

// Notification State
const showNotification = ref(false)
const notificationMessage = ref('')
const notificationType = ref<'success' | 'error'>('success')
const timeoutId = ref<number | null>(null)
const searchTimeout = ref<number | null>(null)

const showFormAdd = ref(false)

const openModal = () => {
  showFormAdd.value = true
}

const cetakKitansi = (invoice: string) => {
  if (!invoice) {
    displayNotification('Nomor transaksi tidak tersedia', 'error')
    return
  }
  window.open(`/invoice-deposit/${invoice}`, '_blank')
}

// Generate array angka halaman
const pages = computed(() => {
  return Array.from({ length: totalPages.value }, (_, i) => i + 1)
})

const pageNow = (page: number) => {
  currentPage.value = page
  fetchDeposit()
}

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '-'

  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return '-' // handle invalid date

  const options: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Jakarta',
    hour12: false,
  }

  return new Intl.DateTimeFormat('id-ID', options).format(date)
}

const fetchDeposit = async () => {
  isLoading.value = true
  try {
    const response = await daftarDeposit({
      pageNumber: currentPage.value,
      search: searchQuery.value,
      perpage: itemsPerPage.value,
      cabang: selectedOptionCabang.value,
    })

    deposits.value = response.data || []
    console.log('Data deposit:', deposits.value)
    totalItems.value = response.total || 0
    totalPages.value = Math.ceil(totalItems.value / itemsPerPage.value) || 1

    // Adjust current page if it's out of bounds
    if (currentPage.value > totalPages.value && totalPages.value > 0) {
      currentPage.value = totalPages.value
      await fetchDeposit() // Refetch with corrected page
      return
    }
  } catch (error) {
    console.error('Gagal memuat data deposit:', error)
    displayNotification('Gagal memuat data deposit', 'error')
  } finally {
    isLoading.value = false
  }
}

const handleSearch = () => {
  // Reset to first page when searching
  currentPage.value = 1
  fetchDeposit()
}

const displayNotification = (message: string, type: 'success' | 'error' = 'success') => {
  notificationMessage.value = message
  notificationType.value = type
  showNotification.value = true
  resetNotificationTimeout()
}

const resetNotificationTimeout = () => {
  if (timeoutId.value) clearTimeout(timeoutId.value)
  timeoutId.value = window.setTimeout(() => {
    showNotification.value = false
  }, 3000)
}

// Pagination Methods
const goToPage = (page: number) => {
  if (page >= 1 && page <= totalPages.value && page !== currentPage.value) {
    currentPage.value = page
    fetchDeposit()
  }
}

const nextPage = () => goToPage(currentPage.value + 1)
const prevPage = () => goToPage(currentPage.value - 1)

const handleAdd = async (data: any) => {
  showFormAdd.value = false
  fetchDeposit()
  displayNotification('Deposit berhasil ditambahkan', 'success')
}

interface filterCabang {
  id: number
  name: string
}

//filter cabang
const selectedOptionCabang = ref(0)
const optionFilterCabang = ref<filterCabang[]>([])

const fetchFilterData = async () => {
  const response = await paramCabang()
  optionFilterCabang.value = response.data
  selectedOptionCabang.value = response.data[0].id
  await fetchDeposit()
}

// Lifecycle Hooks
onMounted(() => {
  fetchFilterData()
})

onUnmounted(() => {
  if (timeoutId.value) clearTimeout(timeoutId.value)
  if (searchTimeout.value) clearTimeout(searchTimeout.value)
})
</script>
<template>
  <div class="container mx-auto p-4">
    <div class="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-4">
      <PrimaryButton @click="openModal()">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 8c1.104 0 2 .672 2 1.5S13.104 11 12 11s-2 .672-2 1.5S10.896 14 12 14m0-6v1m0 6v1m9-5a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        Tambah Deposit
      </PrimaryButton>

      <!-- Search Input -->
      <div class="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
        <label for="search" class="text-sm font-medium text-gray-700">Search</label>

        <!-- Wrapper input + select -->
        <div class="flex w-full sm:w-auto">
          <input
            type="text"
            id="search"
            class="w-full sm:w-72 px-3 py-2 text-gray-700 bg-white border border-gray-300 rounded-l-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            v-model="searchQuery"
            @input="handleSearch"
            placeholder="Cari berdasarkan nama..."
          />
          <select
            v-model="selectedOptionCabang"
            @change="fetchDeposit"
            class="w-40 sm:w-60 px-3 py-2 text-sm bg-white border border-l-0 border-gray-300 text-gray-700 rounded-r-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
          >
            <option v-for="optionC in optionFilterCabang" :key="optionC.id" :value="optionC.id">
              {{ optionC.name }}
            </option>
          </select>
        </div>
      </div>
    </div>

    <!-- Deposit Table -->
    <div class="overflow-x-auto rounded-lg border border-gray-200 shadow-md">
      <table class="w-full border-collapse bg-white text-left text-sm text-gray-500">
        <thead class="bg-gray-100">
          <tr>
            <th class="w-[10%] px-0 py-3 font-medium text-gray-900 text-center">Nomor Transaksi</th>
            <th class="w-[30%] px-0 py-3 font-medium text-gray-900 text-center">Info Member</th>
            <th class="w-[30%] px-0 py-3 font-medium text-gray-900 text-center">Info</th>
            <th class="w-[20%] px-0 py-3 font-medium text-gray-900 text-center">Waktu Transaksi</th>
            <th class="w-[10%] px-0 py-3 font-medium text-gray-900 text-center">Aksi</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100 border-t border-gray-100">
          <!-- Loading State -->
          <tr v-if="isLoading">
            <td colspan="5" class="px-6 py-4 text-center">
              <div class="flex justify-center items-center py-8">
                <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-[#455494]"></div>
              </div>
            </td>
          </tr>
          <!-- Empty State -->
          <tr v-else-if="deposits.length === 0">
            <td colspan="5" class="px-6 py-4 text-center text-sm text-gray-600">
              {{
                searchQuery ? 'Hasil pencarian tidak ditemukan' : 'Daftar Deposit Tidak Ditemukan'
              }}
            </td>
          </tr>
          <!-- Deposit Data -->
          <tr
            v-for="deposit in deposits"
            :key="deposit.id"
            class="hover:bg-gray-50 transition-colors"
          >
            <td class="px-6 py-4 text-center">{{ deposit.invoice || '-' }}</td>
            <td class="px-6 py-4 text-center">{{ deposit.fullname || '-' }}</td>
            <td class="px-6 py-4 text-left">
              <table class="w-full">
                <tbody>
                  <tr>
                    <td class="w-[30%]">Nominal Deposit</td>
                    <td>:</td>
                    <td class="text-right space-y-2 text-sm py-1">
                      {{
                        deposit.nominal
                          ? 'Rp' + new Intl.NumberFormat('id-ID').format(deposit.nominal)
                          : '-'
                      }}
                    </td>
                  </tr>
                  <tr>
                    <td class="w-[30%]">Saldo Sebelum:</td>
                    <td>:</td>
                    <td class="text-right space-y-2 text-sm py-1">
                      {{
                        deposit.saldo_sebelum
                          ? 'Rp' + new Intl.NumberFormat('id-ID').format(deposit.saldo_sebelum)
                          : '-'
                      }}
                    </td>
                  </tr>
                  <tr>
                    <td class="w-[30%]">Saldo Sesudah:</td>
                    <td>:</td>
                    <td class="text-right space-y-2 text-sm py-1">
                      {{
                        deposit.saldo_sesudah
                          ? 'Rp' + new Intl.NumberFormat('id-ID').format(deposit.saldo_sesudah)
                          : '-'
                      }}
                    </td>
                  </tr>
                  <tr>
                    <td class="w-[30%]">Penerima:</td>
                    <td>:</td>
                    <td class="text-right space-y-2 text-sm py-1">{{ deposit.penerima || '-' }}</td>
                  </tr>
                </tbody>
              </table>
            </td>
            <td class="px-6 py-4 text-center">{{ formatDate(deposit.createdAt) || '-' }}</td>
            <td class="px-6 py-4 text-center">
              <div class="flex justify-center gap-2">
                <LightButton @click="cetakKitansi(deposit.invoice)" title="Print Invoice"
                  ><DeleteIcon
                /></LightButton>
              </div>
            </td>
          </tr>
        </tbody>

        <!-- Pagination Footer -->
        <tfoot class="bg-gray-100 font-bold">
          <Pagination
            :current-page="currentPage"
            :total-pages="totalPages"
            :pages="pages"
            :total-columns="totalColumns"
            :total-row="totalItems"
            @prev-page="prevPage"
            @next-page="nextPage"
            @page-now="pageNow"
          />
        </tfoot>
      </table>
    </div>
  </div>

  <FormAdd v-if="showFormAdd" @close="showFormAdd = false" @success="handleAdd" />

  <!-- Notification Component -->
  <Notification
    :showNotification="showNotification"
    :notificationType="notificationType"
    :notificationMessage="notificationMessage"
    @close="showNotification = false"
  />
</template>
