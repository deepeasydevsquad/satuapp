<script setup lang="ts">
import PaginationCustom from '@/components/Pagination/PaginationCustom.vue'
import Form from '@/components/Modal/Form.vue'
import InputText from '@/components/Form/InputText.vue'
import LightButton from '@/components/Button/LightButton.vue'
import DangerButton from '@/components/Button/DangerButton.vue'
import EditIcon from '@/components/Icons/EditIcon.vue'
import DeleteIcon from '@/components/Icons/DeleteIcon.vue'
import { daftar_produk, add, hapus } from '@/service/produk_ppob'
import { computed, onMounted, ref, watch } from 'vue'
import Confirmation from '@/components/Modal/Confirmation.vue'
import Notification from '@/components/Modal/Notification.vue'

interface ProdukPpob {
  id: number
  kode: string
  name: string
  price: number
  markup: number
  tipe: string
}
const totalPages = ref(1)
const itemsPerPage = ref(100)
const currentPage = ref(1)
const totalRow = ref(0)
const searchQuery = ref('')
const showDeleteConfirmDialog = ref(false)
const timeoutId = ref<number | null>(null)
const searchTimeout = ref<number | null>(null)
const selectedStatus = ref('') // '' = semua
const selectedTipe = ref<string>('prabayar')

const totalColumns = ref(6)

const pages = computed(() => {
  return Array.from({ length: totalPages.value }, (_, i) => i + 1)
})

const data = ref<ProdukPpob[]>([])
const fetchData = async () => {
  try {
    const response = await daftar_produk({
      search: searchQuery.value,
      perpage: itemsPerPage.value,
      pageNumber: currentPage.value,
      tipe: selectedTipe.value,
    })
    data.value = response.data
    totalRow.value = response.total
    totalPages.value = Math.ceil(totalRow.value / itemsPerPage.value)
  } catch (error) {
    console.error('Error fetching data:', error)
  }
}

watch(selectedTipe, () => {
  currentPage.value = 1
  fetchData()
})

onMounted(fetchData)

const handlePrev = () => {
  if (currentPage.value > 1) currentPage.value--
  fetchData()
}
const handleNext = () => {
  if (currentPage.value < totalPages.value) currentPage.value++
  fetchData()
}
const handlePageNow = (page: number) => {
  currentPage.value = page
  fetchData()
}

const handleSearch = () => {
  currentPage.value = 1
  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value)
  }

  searchTimeout.value = window.setTimeout(() => {
    fetchData()
  }, 500)
}

const confirmMessage = ref<string>('')
const confirmTitle = ref<string>('')
const confirmAction = ref<(() => void) | null>(null)
const showNotification = ref<boolean>(false)
const showConfirmDialog = ref<boolean>(false)
const notificationMessage = ref<string>('')
const notificationType = ref<'success' | 'error'>('success')

const showConfirmation = (title: string, message: string, action: () => void) => {
  confirmTitle.value = title
  confirmMessage.value = message
  confirmAction.value = action
  showConfirmDialog.value = true
}

const displayNotification = (message: string, type: 'success' | 'error' = 'success') => {
  notificationMessage.value = message
  notificationType.value = type
  showNotification.value = true

  if (timeoutId.value) clearTimeout(timeoutId.value)

  timeoutId.value = window.setTimeout(() => {
    showNotification.value = false
  }, 3000)
}

const formatRupiah = (value: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(value)
}

const ModalMarkup = ref(false)
const SelectedId = ref(0)
const openModal = (id: number) => {
  const selectedProduk = data.value.find((d) => d.id === id)
  formData.value.markup = selectedProduk?.markup || 0
  SelectedId.value = id
  ModalMarkup.value = true
  console.log('selectedProduk', SelectedId.value)
}

const formData = ref({
  id: 0,
  markup: 0,
})

const resetForm = () => {
  formData.value = {
    id: 0,
    markup: 0,
  }
}

const closeModal = () => {
  ModalMarkup.value = false
  resetForm()
}

const deleteData = async (id: number) => {
  showConfirmation('Konfirmasi Hapus', 'Apakah Anda yakin ingin menghapus data ini?', async () => {
    try {
      const response = await hapus({ id: id, tipe: selectedTipe.value })
      showConfirmDialog.value = false
      displayNotification('markup berhasil di hapus', 'success')
      fetchData()
    } catch (error) {
      displayNotification('Terjadi kesalahan saat menghapus data.', 'error')
    }
  })
}

const handleSubmit = async () => {
  try {
    const response = await add({
      id: SelectedId.value,
      tipe: selectedTipe.value,
      markup: formData.value.markup,
    })

    displayNotification('markup berhasil di tambhakan', 'success')
    fetchData()
    ModalMarkup.value = false
  } catch (error) {
    console.error('Gagal menyimpan data member:', error)
  }
}

const formattedMarkup = computed(() => {
  if (!formData.value.markup) return ''
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(formData.value.markup)
})

const onMarkupInput = (val: string) => {
  const numericValue = parseInt(val.replace(/[^\d]/g, ''))
  formData.value.markup = isNaN(numericValue) ? 0 : numericValue
}
</script>
<template>
  <div class="container mx-auto p-4">
    <div class="flex justify-between items-center mb-4 flex-wrap gap-4">
      <div class="flex items-center gap-2"></div>
      <div class="flex items-center gap-2">
        <select v-model="selectedTipe" @change="fetchData"
          class="px-3 py-2 text-sm border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 transition-all text-black" >
          <option value="prabayar">Prabayar</option>
          <option value="pascabayar">Pascabayar</option>
        </select>
        <input type="text" id="search" v-model="searchQuery" @input="handleSearch" placeholder="Cari nama atau kode produk.."
          class="w-64 px-3 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
        />
      </div>
    </div>
    <div class="overflow-x-auto rounded-lg border border-gray-200 shadow-md">
      <table class="w-full border-collapse bg-white text-left text-sm text-gray-500">
        <thead class="bg-gray-100">
          <tr>
            <th class="w-[30%] px-6 py-4 font-medium text-gray-900 text-center">Nama Produk</th>
            <th class="w-[30%] px-6 py-4 font-medium text-gray-900 text-center">Kode</th>
            <th class="w-[30%] px-6 py-4 font-medium text-gray-900 text-center">Tipe</th>
            <th class="w-[10%] px-6 py-4 font-medium text-gray-900 text-center w-28">Harga Aplikasi</th>
            <th class="w-[10%] px-6 py-4 font-medium text-gray-900 text-center w-28">Markup Perusahaan</th>
            <th class="w-[10%] px-6 py-4 font-medium text-gray-900 text-center w-28">Aksi</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100 border-t border-gray-100">
          <template v-if="data.length > 0">
            <tr v-for="d in data" :key="d.id" class="hover:bg-gray-50 transition-colors">
              <td class="px-6 py-4 text-center align-top text-sm font-medium text-gray-700">{{ d.name }}</td>
              <td class="px-6 py-4 text-center align-top space-y-2 text-sm text-gray-600">{{ d.kode }}</td>
              <td class="px-6 py-4 text-center align-top space-y-2 text-sm text-gray-600">{{ d.tipe }}</td>
              <td class="px-6 py-4 text-center align-top space-y-2 text-sm text-gray-600">{{ formatRupiah(d.price) }}</td>
              <td class="px-6 py-4 text-center align-top space-y-2 text-sm text-gray-600">{{ formatRupiah(d.markup || 0) }}</td>
              <td class="px-6 py-4 text-center">
                <div class="flex justify-center gap-2">
                  <div class="flex justify-center items-center gap-2">
                    <LightButton @click="openModal(d.id)"><EditIcon /></LightButton>
                    <DangerButton @click="deleteData(d.id)"><DeleteIcon /></DangerButton>
                  </div>
                </div>
              </td>
            </tr>
          </template>
          <template v-else>
            <tr>
              <td colspan="6" class="px-2 py-2 text-center align-top">
                Daftar Produk PPOB Tidak Ditemukan
              </td>
            </tr>
          </template>
        </tbody>
        <tfoot class="bg-gray-100 font-bold">
          <PaginationCustom :currentPage="currentPage" :totalPages="totalPages" :pages="pages" :totalColumns="totalColumns" @prev-page="handlePrev" @next-page="handleNext" @page-now="handlePageNow" :totalRow="totalRow" />
        </tfoot>
      </table>
    </div>
  </div>

  <!-- Modal Konfirmasi Hapus -->
  <Confirmation
    :showConfirmDialog="showConfirmDialog"
    confirmTitle="Konfirmasi Hapus"
    confirmMessage="Apakah Anda yakin ingin menghapus pengguna ini?"
  >
    <button
      @click="confirmAction?.()"
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

  <Notification :showNotification="showNotification" :notificationType="notificationType" :notificationMessage="notificationMessage" @close="showNotification = false" ></Notification>

  <Form :formStatus="ModalMarkup" @cancel="closeModal" @submit="handleSubmit" :submitLabel="'Edit Markup'" :width="'w-1/3'" :label="'Simpan '" >
    <InputText :modelValue="formattedMarkup" @update:modelValue="onMarkupInput" placeholder="Masukkan Markup" class="pb-3" label="Markup Perusahaan" />
  </Form>
</template>
