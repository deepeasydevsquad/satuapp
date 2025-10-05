<template>
  <div class="container mx-auto p-4">
    <div class="flex flex-col md:flex-row justify-between mb-6 gap-4">
      <PrimaryButton @click="openModal('add')">
        <IconPlus/>
        Tambah Cabang
      </PrimaryButton>
      <div class="flex flex-col md:flex-row items-center w-full md:w-1/3 gap-3">
        <label for="search" class="block text-sm font-medium text-gray-700 mr-2">Search</label>
        <input v-model="search" type="text" placeholder="Cari cabang..."
          class="block w-full px-3 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
        />
      </div>
    </div>
    <div class="overflow-hidden rounded-lg -gray-200 shadow-md">
      <div class="overflow-x-auto">
        <table class="w-full border-collapse bg-white text-left text-sm text-gray-500">
          <thead class="bg-gray-100">
            <tr>
              <th class="w-[20%] px-6 py-3 font-medium text-gray-900 text-center">Nama Cabang</th>
              <th class="w-[20%] px-6 py-3 font-medium text-gray-900 text-center">Info Kota</th>
              <th class="w-[20%] px-6 py-3 font-medium text-gray-900 text-center">Alamat</th>
              <th class="w-[30%] px-6 py-3 font-medium text-gray-900 text-center">Catatan</th>
              <th class="w-[10%] px-6 py-3 font-medium text-gray-900 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100 -t -gray-100" v-if="paginatedCabang.length > 0">
            <tr v-for="(cabang, index) in paginatedCabang" :key="cabang.id" class="hover:bg-gray-50">
              <td class="px-4 py-3 text-center -gray-200">{{ cabang.name }}</td>
              <td class="px-4 py-3 text-center -gray-200">{{ cabang.city }}<br>{{ cabang.pos_code }}</td>
              <td class="px-4 py-3 text-center -gray-200">{{ cabang.address }}</td>
              <td class="w-[30%]  px-4 py-3 text-left -gray-200">{{ cabang.note }}</td>
              <td class="px-4 py-3 text-center -gray-200 flex justify-center gap-2">
                <LightButton @click="openModal('edit', cabang)">
                  <EditIcon></EditIcon>
                </LightButton>
                <DangerButton @click="hapusData(cabang)">
                  <DeleteIcon></DeleteIcon>
                </DangerButton>
              </td>
            </tr>
          </tbody>
          <tbody v-else>
            <tr>
              <td colspan="5" class="px-4 py-3 text-center -gray-200">Data tidak ditemukan</td>
            </tr>
          </tbody>
          <tfoot class="bg-gray-100 font-bold border">
            <Pagination :current-page="currentPage" :total-pages="totalPages" :pages="pages" :total-columns="totalColumns" @prev-page="prevPage" @next-page="nextPage" @page-now="pageNow" />
          </tfoot>
        </table>
      </div>
    </div>
    <!-- Modal Tambah & Update -->
    <Modal v-if="modalOpen && modalType === 'add'" @close="modalOpen = false" :form="formData"  @save="saveData" />
    <ModalUpdate v-if="modalOpen && modalType === 'edit'" :cabang="formData" @update="updateData" @close="modalOpen = false" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import Modal from './Particle/Modal.vue'
import ModalUpdate from './Particle/ModalUpdate.vue'
import { daftarCabang, addCabang, editCabang, hapusCabang } from '../../../../service/cabang'
import DeleteIcon from './Icon/DeleteIcon.vue'
import EditIcon from './Icon/EditIcon.vue'

// import element
// icon
import IconPlus from '@/components/Icons/IconPlus.vue'

import Pagination from '@/components/Pagination/Pagination.vue'
import LightButton from "@/components/Button/LightButton.vue"
import DangerButton from "@/components/Button/DangerButton.vue"
import PrimaryButton from "@/components/Button/PrimaryButton.vue"

interface Cabang {
  id: number;
  city: string;
  city_id?:number;
  pos_code: string;
  address: string;
  note: string;
}

const cabangs = ref<Cabang[]>([]);
const search = ref('')
const modalOpen = ref(false)
const modalType = ref('add')
const formData = ref({
  name: '',
  city: '',
  city_id: 0,
  pos_code: '',
  address: '',
  tanda_tangan: null,
  note: '',
})
const totalColumns = ref(5);
const itemsPerPage = 10
const currentPage = ref(1)
const showNotification = ref(false)
const notificationMessage = ref('')
const notificationType = ref<'success' | 'error'>('success')
const timeoutId = ref<number | null>(null)
const searchTimeout = ref<number | null>(null)

const fetchData = async () => {
  try {
    const response = await daftarCabang()
    if (response?.data) {
      cabangs.value = response.data
    }
  } catch (error) {
    console.error('Gagal mengambil data cabang:', error)
  }
}

const filteredCabang = computed(() => {
  return cabangs.value.filter((cabang) =>
    cabang.city.toLowerCase().includes(search.value.toLowerCase()),
  )
})

const openModal = (mode = 'add', cabang = null) => {
  if (mode === 'edit' && cabang) {
    formData.value = cabang
    //{ ...cabang, city: cabang.city_id || cabang.city }
  } else {
    console.log('Masuk ke mode add')
    formData.value = {
      name: '',
      city: '',
      pos_code: '',
      address: '',
      tanda_tangan: null,
      note: '',
    }
  }
  modalType.value = mode
  modalOpen.value = true
}

const saveData = async (formValue : any) => {
  try {
    const formData = new FormData()
    formData.append('name', formValue.name)
    formData.append('city', formValue.city)
    formData.append('pos_code', formValue.pos_code)
    formData.append('address', formValue.address)
    formData.append('note', formValue.note)
    if (formValue.tanda_tangan) {
      formData.append('tanda_tangan', formValue.tanda_tangan)
    } else {
       displayNotification('File tanda tangan wajib diunggah!', 'error')
      return
    }
    const response = await addCabang(formData)
    if (response.success || response.data?.success) {
      displayNotification('Cabang Berhasil Ditambahkan!', 'success')
      modalOpen.value = false
      fetchData()
    }
  } catch (error) {
    displayNotification('Terjadi kesalahan, coba lagi!', 'error')
  }
}

const updateData = async (formValue :any) => {
  try {
    const response = await editCabang(formValue.id, formValue)

    console.log('🔍 Full Response:', response)

    if (response.success || response.data?.success) {
      displayNotification('Cabang berhasil diperbarui!', 'success')
      modalOpen.value = false
      fetchData()
    } else {
      displayNotification('Response sukses = false, cek API', 'error')
    }
  } catch (error) {
    displayNotification('Terjadi kesalahan, coba lagi!', 'error')
  }
}

const hapusData = async (cabang : any) => {
  if (!confirm('Apakah kamu yakin ingin menghapus cabang ini?')) return

  try {
    const response = await hapusCabang(cabang.id) // Kirim hanya ID ke API
    console.log('Response:', response)

    if (response.success || response.data?.success) {
      displayNotification('Cabang berhasil dihapus!', 'success')
      fetchData()
    } else {
      displayNotification('Gagal menghapus cabang, coba lagi!', 'error')
    }
  } catch (error) {
    console.error('Error saat menghapus cabang:', error)
    displayNotification('Terjadi kesalahan, coba lagi!', 'error')
  }
}


const totalPages = computed(() => {
  return Math.max(1, Math.ceil((filteredCabang.value?.length || 0) / itemsPerPage))
})

const paginatedCabang = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  return filteredCabang.value.slice(start, start + itemsPerPage)
})

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

const pages = computed(() => {
  return Array.from({ length: totalPages.value }, (_, i) => i + 1);
});

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

// Reset ke page 1 saat filter berubah
watch(search, () => {
  currentPage.value = 1
})

// Pastikan currentPage tidak lebih besar dari totalPages setelah filter berubah
watch(filteredCabang, () => {
  if (currentPage.value > totalPages.value) {
    currentPage.value = totalPages.value
  }
})

onMounted(fetchData)
</script>
