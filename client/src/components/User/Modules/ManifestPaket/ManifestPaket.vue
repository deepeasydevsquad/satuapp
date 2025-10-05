<script setup lang="ts">

// Import icon
import EditIcon from '@/components/User/Modules/ManifestPaket/icon/EditIcon.vue'
import DownloadIcon from '@/components/User/Modules/ManifestPaket/icon/DownloadIcon.vue'

// import element
import LightButton from '@/components/Button/LightButton.vue'
import EditButton from '@/components/User/Modules/ManifestPaket/particle/EditButton.vue'
import Notification from '@/components/User/Modules/ManifestPaket/particle/Notification.vue'


// import
import FormUpdate from '@/components/User/Modules/DaftarJamaah/Particle/FormUpdate.vue'
import Pagination from '@/components/Pagination/Pagination.vue'

import { ref, onMounted, computed } from 'vue'
import { daftarManifestPaket, downloadAbsensi } from '@/service/manifest_paket'

const props = defineProps<{
  paketId: number
  cabangId: number
}>()

const isLoading = ref(false)
const itemsPerPage = 100 // Jumlah daftar transaksi per halaman
const currentPage = ref(1)
const search = ref('')
const totalPages = ref(0)
const timeoutId = ref<number | null>(null)

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
    fetchData()
  }
}

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
    fetchData()
  }
}

const pageNow = (page: number) => {
  currentPage.value = page
  fetchData()
}

// Generate array angka halaman
const pages = computed(() => {
  return Array.from({ length: totalPages.value }, (_, i) => i + 1)
})

interface ManifestPaket {
  id: number;
  jamaah_id: number;
  nama_jamaah: string;
  birth_place: string;
  birth_date: string;
  umur: number;
  whatsapp_number: string;
  status_kelengkapan: string;
  daftar_item_belum_lengkap: string[];
  nama_agen: string;
  nomor_identitas: string;
  tempat_tanggal_lahir: string;
  identity_type: string;
  gender: string;
  photo: string;
  nomor_passport: string;
  title: string;
  nama_ayah: string;
  nama_passport: string;
  tanggal_di_keluarkan_passport: string;
  tempat_di_keluarkan_passport: string;
  masa_berlaku_passport: string;
  kode_pos: string;
  nomor_telephone: string;
  pengalaman_haji: string;
  tahun_haji: string;
  pengalaman_umrah: string;
  tahun_umrah: string;
  desease: string;
  last_education: string;
  blood_type: string;
  photo_4_6: string;
  photo_3_4: string;
  fc_passport: string;
  mst_pekerjaan_id: string;
  profession_instantion_name: string;
  profession_instantion_address: string;
  profession_instantion_telephone: string;
  fc_kk: string;
  fc_ktp: string;
  buku_nikah: string;
  akte_lahir: string;
  buku_kuning: string;
  keterangan: string;
  nama_keluarga: string;
  alamat_keluarga: string;
  telephone_keluarga: string;
  status_nikah: string;
  tanggal_nikah: string;
  kewarganegaraan: string;
}

const dataManifestPaket = ref<ManifestPaket[]>([]);
const status = ref<string>('tutup');
const jamaahId = ref<number>(0);
const isFormEditMasnifestOpen = ref<boolean>(false)
const notificationMessage = ref<string>('');
const notificationType = ref<'success' | 'error'>('success');
const showNotification = ref<boolean>(false);
const totalColumns = ref(6);
const totalRow = ref(0);

const displayNotification = (message: string, type: 'success' | 'error' = 'success') => {
  notificationMessage.value = message
  notificationType.value = type
  showNotification.value = true

  if (timeoutId.value) clearTimeout(timeoutId.value)

  timeoutId.value = window.setTimeout(() => {
    showNotification.value = false
  }, 3000)
}

const openFormEditManifest = (daftarManidest: ManifestPaket) => {
  console.log(daftarManidest)
  jamaahId.value = daftarManidest.jamaah_id;
  console.log(jamaahId)
  isFormEditMasnifestOpen.value = true;
}

const fetchData = async () => {
  try {
    isLoading.value = true
    const response = await daftarManifestPaket({
      paketId: props.paketId,
      division_id: props.cabangId,
      search: search.value,
      perpage: itemsPerPage,
      pageNumber: currentPage.value,
    })
    dataManifestPaket.value = response.data;
    status.value = response.status;
    totalRow.value = response.total;
    console.log(dataManifestPaket)
    totalPages.value = Math.ceil(response.total / itemsPerPage)
  } catch (error) {
    console.error('Error fetching data:', error)
  } finally {
    isLoading.value = false
  }
}

const DownloadAbsensi = async () => {
  try {
    isLoading.value = true
    await downloadAbsensi(props.paketId, props.cabangId)
  } catch (error) {
    console.error('Error fetching data:', error)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchData()
})
</script>

<template>
  <div class="p-4 bg-white min-h-screen">
    <div v-if="isLoading" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" >
      <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-400"></div>
    </div>
    <!-- Tambah data dan Search -->
    <div class="flex justify-between mb-4">
      <button @click="DownloadAbsensi()" class="bg-[#455494] text-white px-4 py-2 rounded-lg hover:bg-[#3a477d] transition-colors duration-200 ease-in-out flex items-center gap-2" >
        <DownloadIcon />
        Download Manifest
      </button>
      <div class="flex items-center">
        <label for="search" class="block text-sm font-medium text-gray-700 mr-2">Search</label>
        <input
          type="text"
          id="search"
          class="block w-64 px-3 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
          v-model="search"
          @change="fetchData()"
          placeholder="Cari Jamaah..."
        />
      </div>
    </div>

    <!-- Table data -->
    <div class="overflow-hidden rounded-lg border border-gray-200 shadow-md">
      <table class="w-full border-collapse bg-white text-left text-sm text-gray-500">
        <thead class="bg-gray-100">
          <tr>
            <th class="w-[25%] px-6 py-3 font-medium text-gray-900 text-center">Jamaah</th>
            <th class="w-[15%] px-6 py-3 font-medium text-gray-900 text-center">Status</th>
            <th class="w-[15%] px-6 py-3 font-medium text-gray-900 text-center">Umur</th>
            <th class="w-[15%] px-6 py-3 font-medium text-gray-900 text-center">Nomor Whatsapp</th>
            <th class="w-[25%] px-6 py-3 font-medium text-gray-900 text-center">
              Daftar Item Yang Belum Lengkap
            </th>
            <th class="w-[5%] px-6 py-3 font-medium text-gray-900 text-center">Aksi</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100 border-t border-gray-100">
          <template v-if="dataManifestPaket && dataManifestPaket.length > 0">
            <tr v-for="dataManifest in dataManifestPaket" :key="dataManifest.id"
              class="hover:bg-gray-50" :class="status == 'tutup' ? ' pointer-events-none opacity-50 ' : '' " >
              <td class="px-6 py-4 text-center">
                <p>{{ dataManifest.nama_jamaah }}</p>
                <p>({{ dataManifest.nomor_identitas }})</p>
              </td>
              <td class="px-6 py-4 text-center">
                <p>{{ dataManifest.status_kelengkapan }}</p>
              </td>
              <td class="px-6 py-4 text-center">
                <p>{{ dataManifest.birth_date }}</p>
                <p class="font-bold">({{ dataManifest.umur }} Tahun)</p>
              </td>
              <td class="px-6 py-4 text-center">
                <p>{{ dataManifest.whatsapp_number }}</p>
              </td>
              <td
                class="px-6 py-4"
                :class="{
                  'text-center': dataManifest.daftar_item_belum_lengkap.length === 0,
                  'text-left': dataManifest.daftar_item_belum_lengkap.length > 0,
                }"
              >
                <template v-if="dataManifest.daftar_item_belum_lengkap.length === 0">
                  <p>Semua Item Lengkap</p>
                </template>
                <template v-else>
                  <ul>
                    <li
                      v-for="(item, index) in dataManifest.daftar_item_belum_lengkap"
                      :key="index"
                      class="list-disc list-inside pl-3 text-sm"
                    >
                      {{ item }}
                    </li>
                  </ul>
                </template>
              </td>
              <td class="px-6 py-4 items-center justify-center flex gap-2">
                <template v-if="status == 'buka'">
                  <LightButton title="Edit Data Jamaah" @click="openFormEditManifest(dataManifest)">
                    <EditIcon></EditIcon>
                  </LightButton>
                </template>
                <template v-else>
                  <span class="italic">Paket ini sudah ditutup</span>
                </template>
              </td>
            </tr>
          </template>
          <tr v-else>
            <td :colspan="totalColumns" class="px-6 py-3 text-center text-sm text-gray-600">
              Daftar Manifes Tidak Ditemukan.
            </td>
          </tr>
        </tbody>
        <tfoot class="bg-gray-100 font-bold">
          <Pagination
            :current-page="currentPage"
            :total-pages="totalPages"
            :pages="pages"
            :total-columns="totalColumns"
            @prev-page="prevPage"
            @next-page="nextPage"
            @page-now="pageNow"
            :totalRow = "totalRow"
          />
        </tfoot>
      </table>
    </div>
  </div>

  <!-- Form Edit Manifest -->
  <transition
    enter-active-class="transition duration-200 ease-out"
    enter-from-class="transform scale-95 opacity-0"
    enter-to-class="transform scale-100 opacity-100"
    leave-active-class="transition duration-200 ease-in"
    leave-from-class="transform scale-100 opacity-100"
    leave-to-class="transform scale-95 opacity-0"
  >
    <FormUpdate
      v-if="isFormEditMasnifestOpen"
      :is-form-update-open="isFormEditMasnifestOpen"
      :jamaah-id="jamaahId"
      :cabang-id="props.cabangId"
      @close="isFormEditMasnifestOpen = false; fetchData()"
      @status="(payload) => displayNotification(payload.err_msg || 'Data Jamaah gagal diperbarui', payload.error ? 'error' : 'success')"
      />

  </transition>

  <!-- Notification -->
  <Notification
    :showNotification="showNotification"
    :notificationType="notificationType"
    :notificationMessage="notificationMessage"
    @close="showNotification = false"
  />
</template>
