
<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import ModalAdd from '@/components/User/Modules/Grup/Particle/ModalAdd.vue'
import ModalUpdate from '@/components/User/Modules/Grup/Particle/ModalUpdate.vue'
import { daftarGrup, addGrup, editGrup, hapusGrup } from '@/service/grup'
import DeleteIcon from '@/components/User/Modules/Grup/Icon/DeleteIcon.vue'
import EditIcon from '@/components/User/Modules/Grup/Icon/EditIcon.vue'
import Notification from '@/components/User/Modules/Grup/Particle/Notification.vue'
import Confirm from '@/components/User/Modules/Grup/Particle/ModalConfirmDelete.vue'
import Pagination from '@/components/Pagination/Pagination.vue'
import LightButton from "@/components/Button/LightButton.vue"
import DangerButton from "@/components/Button/DangerButton.vue"
import PrimaryButton from "@/components/Button/PrimaryButton.vue"

const isAddModalOpen = ref(false)
const isUpdateModalOpen = ref(false)
const grupToUpdate = ref<any>(null)

const showNotification = ref(false)
const notificationType = ref<'success' | 'error'>('success')
const notificationMessage = ref('')

interface SubmenuAccess {
  id: number;
  name: string;
}

interface GroupAccess {
  id: number;
  name: string;
  submenu: SubmenuAccess[];
}

interface SystemLogs {
  id: number;
  name: string;
  division:string;
  group_access: GroupAccess[];
  updatedAt: string;
}

const data = ref<SystemLogs[]>([])
const search = ref('');
const currentPage = ref(1)
const itemsPerPage = 100
const totalColumns = ref(5);
const totalPages = ref(0);

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

const showConfirmDialog = ref(false)
const confirmTitle = ref('')
const confirmMessage = ref('')
const confirmAction = ref<() => void>(() => {})

const fetchData = async () => {
  try {
    const response = await daftarGrup({
      search: search.value,
      perpage: itemsPerPage,
      pageNumber: currentPage.value,
    })

    if (response.error == false ) {
      data.value = response.data
      totalPages.value = Math.ceil(response.total / itemsPerPage)
    }
  } catch (error) {
    console.error('Gagal mengambil data grup:', error)
  }
}

const handleSaveGroup = async (grup: any) => {
  try {
    console.log('Mengirim data ke API:', grup)

    if (grup.id) {
      const response = await editGrup(grup)
      console.log('Response dari API update:', response)
      showNotificationMessage('success', 'Data grup berhasil diupdate!')
    } else {
      const response = await addGrup(grup)
      console.log('Response dari API tambah:', response)
      showNotificationMessage('success', 'Data grup berhasil ditambahkan!')
    }

    await fetchData()
  } catch (error) {
    console.error('Error menyimpan grup:', error)
    showNotificationMessage('error', 'Gagal menyimpan data grup.')
  }
}

const openUpdateModal = (grup : any) => {
  grupToUpdate.value = grup
  isUpdateModalOpen.value = true
}

const handleDeleteGroup = (grupId : any) => {
  confirmTitle.value = 'Konfirmasi Hapus'
  confirmMessage.value = 'Apakah Anda yakin ingin menghapus grup ini?'
  confirmAction.value = () => deleteGroup(grupId)
  showConfirmDialog.value = true
}

const deleteGroup = async (grupId : any) => {
  try {
    await hapusGrup(grupId)
    showNotificationMessage('success', 'Data grup berhasil dihapus!')
    await fetchData()
  } catch (error) {
    showNotificationMessage('error', 'Gagal menghapus grup.')
  } finally {
    showConfirmDialog.value = false
  }
}

const confirmDelete = () => {
  confirmAction.value()
}

const showNotificationMessage = (type :any, message: any) => {
  notificationType.value = type
  notificationMessage.value = message
  showNotification.value = true
  setTimeout(() => (showNotification.value = false), 3000)
}

onMounted(fetchData)
</script>
<template>
  <div class="container mx-auto p-4">
    <div class="flex justify-between mb-4">
      <PrimaryButton @click="isAddModalOpen = true">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Tambah Grup
      </PrimaryButton>
      <div class="flex items-center">
        <label for="search" class="block text-sm font-medium text-gray-700 mr-2">Search</label>
        <input
          type="text"
          id="search"
          v-model="search" @change="fetchData()"
          class="block w-64 px-3 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
          placeholder="Cari data..."
        />
      </div>
    </div>
    <div class="overflow-hidden rounded-lg border border-gray-200 shadow-md">
      <div class="overflow-x-auto">
        <table class="w-full border-collapse bg-white text-left text-sm text-gray-500">
          <thead class="bg-gray-100">
            <tr>
              <th class="w-[20%] px-4 py-3 font-medium text-gray-900 text-center">Nama Grup</th>
              <th class="w-[20%] px-4 py-3 font-medium text-gray-900 text-center">Cabang</th>
              <th class="w-[30%] px-4 py-3 font-medium text-gray-900 text-center">Akses Grup</th>
              <th class="w-[15%] px-4 py-3 font-medium text-gray-900 text-center">Last Update</th>
              <th class="w-[10%] px-4 py-3 font-medium text-gray-900 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100 border-t border-gray-100">
            <template v-if="data.length > 0">
              <tr v-for="(grup, index) in data" :key="grup?.id" class="hover:bg-gray-50">
                <td class="px-4 py-3 align-top text-center">{{ grup?.name }}</td>
                <td class="px-4 py-3 align-top text-center">{{ grup?.division }}</td>
                <td class="px-4 py-3 align-top">
                  <ol class="list-disc list-inside space-y-1">
                    <li v-for="access in grup?.group_access" :key="access.id">
                      <span class="font-medium">{{ access.name }}</span>
                      <ul v-if="grup?.group_access.length  > 0" class="list-none list-inside pl-5">
                        <li v-for="submenu in access.submenu" :key="submenu.id" class="flex items-center" >
                          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" >
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                          </svg>
                          {{ submenu.name }}
                        </li>
                      </ul>
                    </li>
                  </ol>
                </td>
                <td class="px-4 py-3 align-top text-center">
                  {{ new Date(grup.updatedAt).toLocaleDateString() }}
                </td>
                <td class="px-4 py-3 align-top text-center">
                  <div class="flex justify-center gap-2">
                    <LightButton @click="openUpdateModal(grup)">
                      <EditIcon></EditIcon>
                    </LightButton>
                    <DangerButton @click="handleDeleteGroup(grup.id)">
                      <DeleteIcon></DeleteIcon>
                    </DangerButton>
                  </div>
                </td>
              </tr>
            </template>
            <template v-else>
              <tr>
                <td colspan="6" class="px-4 py-3 text-center text-gray-700">
                  Tidak ada data grup.
                </td>
              </tr>
            </template>
          </tbody>
          <tfoot class="bg-gray-100 font-bold">
            <Pagination :current-page="currentPage" :total-pages="totalPages" :pages="pages" :total-columns="totalColumns" @prev-page="prevPage" @next-page="nextPage" @page-now="pageNow" />
          </tfoot>
        </table>
      </div>
    </div>

    <!-- Modal Tambah -->
    <ModalAdd :isOpen="isAddModalOpen" @close="isAddModalOpen = false" @save="handleSaveGroup" />

    <!-- Modal Update -->
    <ModalUpdate :isOpen="isUpdateModalOpen" :grupToUpdate="grupToUpdate"  @close="isUpdateModalOpen = false"  @save="handleSaveGroup" />

    <!-- Notifikasi -->
    <Notification :showNotification="showNotification"  :notificationType="notificationType" :notificationMessage="notificationMessage" @close="showNotification = false" />

    <Confirm :showConfirmDialog="showConfirmDialog" :confirmTitle="confirmTitle" :confirmMessage="confirmMessage"  >
      <button @click="confirmDelete"
        class="inline-flex w-full justify-center rounded-md border border-transparent bg-yellow-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm">
        Ya
      </button>
      <button @click="showConfirmDialog = false"
        class="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
        Tidak
      </button>
    </Confirm>
  </div>
</template>

