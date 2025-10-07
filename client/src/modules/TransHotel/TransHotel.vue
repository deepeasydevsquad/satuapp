<script setup lang="ts">
import Confirmation from '@/components/Modal/Confirmation.vue'
import PrimaryButton from '@/components/Button/PrimaryButton.vue'
import Notification from '@/components/Modal/Notification.vue'
import LightButton from '@/components/Button/LightButton.vue'
import DangerButton from '@/components/Button/DangerButton.vue'
import DeleteIcon from '@/components/Icons/DeleteIcon.vue'
import IconMoney from '@/components/Icons/IconMoney.vue'
import CetakIcon from '@/components/Icons/CetakIcon.vue'
import Pagination from '@/components/Pagination/Pagination.vue'
import { ref, computed, onMounted } from 'vue'
import { paramCabang } from '@/service/param_cabang'
import { daftar_transaksi, hapus_transaksi } from '@/service/transaksi_hotel'
import FormAdd from './Widget/FormAdd.vue'

const showAddForm = ref(false);
const currentPage = ref(1)
const totalPages = ref(1)
const itemsPerPage = 100
const showNotification = ref(false)
const notificationMessage = ref('')
const notificationType = ref('')
const showConfirmDialog = ref(false)
const confirmMessage = ref('')
const confirmTitle = ref('')
const confirmAction = ref<(() => void) | null>(null)
const timeoutId = ref<number | null>(null)
const kotaOptions = ref<{ id: number | string; name: string; kota: string }[]>([])
const hotelOptions = ref<{ id: number | string; name: string }[]>([])
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

const showConfirmation = (title: string, message: string, action: () => void) => {
  confirmTitle.value = title
  confirmMessage.value = message
  confirmAction.value = action
  showConfirmDialog.value = true
}

const pages = computed<number[]>(() => {
  return Array.from({ length: totalPages.value }, (_, i) => i + 1)
})

const totalColumns = 5
const totalRow = ref(1)

const searchQuery = ref('')

const handlePrev = () => {
  if (currentPage.value > 1) currentPage.value--
}
const handleNext = () => {
  if (currentPage.value < totalPages.value) currentPage.value++
}
const handlePageNow = (page: number) => {
  currentPage.value = page
}

interface option {
  id: number
  name: string
}

const optionFilterCabang = ref<option[]>([])
const selectedOptionCabang = ref(0)
const fetchCabang = async () => {
  try {
    const response = await paramCabang()
    optionFilterCabang.value = response.data;
    selectedOptionCabang.value = response.data[0].id
    await fetchData();
  } catch (error) {
    console.error(error)
  }
}





// const fetchKotaOptions = async () => {
//   try {
//     const data = await daftar_kota()
//     kotaOptions.value = [
//       { id: 0, name: 'Pilih Kota' },
//       ...data.map((item: any) => ({
//         id: item.id,
//         name: `${item.name} - ${item.kode}`,
//       })),
//     ]
//     console.log('data kota', data)
//   } catch (error) {
//     displayNotification('Gagal ambil data kota', 'error')
//   }
// }

// const fetchHotelOptions = async () => {
//   try {
//     const data = await daftar_hotel()
//     hotelOptions.value = [
//       { id: 0, name: 'Pilih Hotel' },
//       ...data.map((item: any) => ({
//         id: item.id,
//         name: `${item.name} - ${item.kota}`,
//       })),
//     ]
//   } catch (error) {
//     displayNotification('Gagal ambil data hotel', 'error')
//   }
// }

// id: e.id,
//             invoice: e.invoice,
//             petugas: e.petugas,
//             kostumer: e.Kostumer?.name || "-",
//             paket: e.Paket?.name || "-",
//             hotel: e.Mst_hotel.name,
//             jumlah_hari: e.jumlah_hari,
//             jumlah_kamar: e.jumlah_kamar,
//             harga_kamar_per_hari: e.harga_kamar_per_hari,
//             tipe_kamar: e.tipe_kamar

interface TransaksiHotel {
  id: number
  invoice: string
  petugas: string
  kostumer: string
  paket: string
  hotel: string
  jumlah_hari: number
  jumlah_kamar: number
  harga_travel_kamar_per_hari: number
  harga_kostumer_kamar_per_hari: number
  tipe_kamar: number
  tanggal_transaksi: string
}

            // harga_travel_kamar_per_hari: e.harga_travel_kamar_per_hari,
            // harga_kostumer_kamar_per_hari: e.harga_kostumer_kamar_per_hari,

const data = ref<TransaksiHotel[]>([]);

const fetchData = async () => {
  try {
    const result = await daftar_transaksi({
      cabang: selectedOptionCabang.value,
      search: searchQuery.value,
      perpage: itemsPerPage,
      pageNumber: currentPage.value,
    })
    data.value = result.data
    totalRow.value = result.total
    totalPages.value = Math.ceil(result.total / itemsPerPage)
    console.log('data transaksi', data)
    console.log('data value', data.value)
  } catch (error) {
    displayNotification('Gagal ambil data transaksi', 'error')
  }
}

const formatHarga = (angka: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(angka)
}

const deleteData = async (id: number) => {
  showConfirmation('Konfirmasi Hapus', 'Apakah Anda yakin ingin menghapus data ini?', async () => {
    try {
      await hapus_transaksi({ id: id })
      showConfirmDialog.value = false
      displayNotification('Operasi berhasil!', 'success')
      fetchData()
    } catch (error) {
      console.error('Error deleting data:', error)
    }
  })
}

// const formatHargaInput = (value: number | string) => {
//   const angka =
//     typeof value === 'number' ? value : parseInt(value.toString().replace(/\D/g, '')) || 0
//   return new Intl.NumberFormat('id-ID', {
//     style: 'currency',
//     currency: 'IDR',
//     minimumFractionDigits: 0,
//   }).format(angka)
// }

// const parseHarga = (val: unknown): number => {
//   return parseInt(String(val).replace(/\D/g, '')) || 0
// }

// const errors = ref<Record<string, string>>({})

// const validateForm = (): boolean => {
//   let isValid = true

//   errors.value = {}

//   rows.value.forEach((row, index) => {
//     if (SelectedCustomer.value === 0) {
//       displayNotification('Anda harus memilih kostumer', 'error')
//       isValid = false
//     }

//     if (!row.name) {
//       errors.value[`name_${index}`] = 'Nama tidak boleh kosong'
//       isValid = false
//     }
//     if (!row.identity_number) {
//       errors.value[`identity_number_${index}`] = 'Nomor identitas tidak boleh kosong'
//       isValid = false
//     }
//     if (row.birth_date === '') {
//       errors.value[`birth_date_${index}`] = 'Tanggal Lahir Tidak Boleh Kosong'
//       isValid = false
//     }
//     if (row.birth_place === '') {
//       errors.value[`birth_place_${index}`] = 'Tempat Lahir Tidak Boleh Kosong'
//       isValid = false
//     }
//     if (row.check_in === '') {
//       errors.value[`check_in_${index}`] = 'Tanggal Checkin Tidak Boleh Kosong'
//       isValid = false
//     }
//     if (row.check_out === '') {
//       errors.value[`check_out_${index}`] = 'Tanggal Checkout Tidak Boleh Kosong'
//       isValid = false
//     }
//     if (row.hotel_id === '0' || row.hotel_id == '') {
//       errors.value[`hotel_id_${index}`] = 'Anda Wajib Memilih Salah Satu Hotel'
//       isValid = false
//     }

//     if (row.kota_id === '0' || row.kota_id == '') {
//       errors.value[`kota_id_${index}`] = 'Anda Wajib Memilih Salah Satu Kota'
//       isValid = false
//     }

//     if (row.price === '') {
//       errors.value[`price_${index}`] = 'Harga Paket Wajib Diisi'
//       isValid = false
//     }
//   })

//   return isValid
// }

// const submitTransaksi = async () => {
//   if (!validateForm()) {
//     return
//   }

//   try {
//     const payload = {
//       kostumer_id: SelectedCustomer.value,
//       paket_id: SelectedPaket.value,
//       details: rows.value.map((row) => ({
//         name: row.name,
//         identity_number: row.identity_number,
//         birth_place: row.birth_place,
//         birth_date: row.birth_date,
//         check_in: row.check_in,
//         check_out: row.check_out,
//         price: parseHarga(row.price),
//         mst_kota_id: row.kota_id,
//         mst_hotel_id: row.hotel_id,
//       })),
//     }

//     console.log('payload', payload)

//     // ⬇️ ambil response dari add_transaksi
//     const response = await add_transaksi(payload)
//     const invoice = response?.invoice

//     if (!invoice) throw new Error('Invoice tidak ditemukan di response')

//     showModal.value = false
//     resetForm()

//     displayNotification(`Transaksi berhasil! Invoice: ${invoice}`, 'success')

//     // 🧾 Open tab baru buat print kwitansi
//     const printUrl = `/kwitansi-trans-hotel/${invoice}`
//     window.open(printUrl, '_blank')

//     await fetchDataTransaksi()
//   } catch (error: any) {
//     console.error(error)
//     displayNotification(
//       error?.response?.data?.error_msg || error.message || 'Gagal simpan transaksi',
//       'error',
//     )
//   }
// }

// const resetForm = () => {
//   rows.value = [
//     {
//       id: '',
//       name: '',
//       identity_number: '',
//       // kostumer_id: '0',
//       // paket_id: '0',
//       kota_id: '0',
//       birth_place: '',
//       birth_date: '',
//       hotel_id: '0',
//       check_in: '',
//       check_out: '',
//       price: '',
//       payer: false,
//     },
//   ]
//   errors.value = {}
// }

const cetak_invoice = (invoice: string) => {
  const printUrl = `/kwitansi-trans-hotel/${invoice}`
  window.open(printUrl, '_blank')
}

const formatRupiah = (angka :any, prefix = "Rp ") => {
  let numberString = angka.toString().replace(/\D/g, ""),
    split = numberString.split(","),
    sisa = split[0].length % 3,
    rupiah = split[0].substr(0, sisa),
    ribuan = split[0].substr(sisa).match(/\d{3}/g);

  if (ribuan) {
    let separator = sisa ? "." : "";
    rupiah += separator + ribuan.join(".");
  }

  return prefix + (rupiah || "0");
};

// interface costumer {
//   id: number
//   name: string
// }

// const customerOption = ref<option[]>([])
// const SelectedCustomer = ref(0)
// const fetchCustomer = async () => {
//   try {
//     const response = await daftar_customer()
//     customerOption.value = [{ id: 0, name: 'Pilih Kostumer' }, ...response]
//   } catch (error) {
//     console.error(error)
//   }
// }



  // interface filterCabang {
  //   id: number
  //   name: string
  // }

  // const selectedOptionCabang = ref(0)
  // const optionFilterCabang = ref<filterCabang[]>([])
  // const fetchFilterData = async () => {
  //   const response = await paramCabang()
  //   optionFilterCabang.value = response.data
  //   selectedOptionCabang.value = response.data[0].id
  //   await fetchData()
  // }

// interface paket {
//   id: number
//   name: string
// }
// const paketOption = ref<paket[]>([{ id: 0, name: 'Pilih Paket' }]) // Tambahkan opsi default
// const SelectedPaket = ref(0)
// const fetchPaket = async () => {
//   try {
//     const response = await daftar_paket({
//       division_id: SelectedCabang.value,
//     })
//     paketOption.value = [{ id: 0, name: 'Pilih Paket' }, ...response]
//   } catch (error) {
//     console.error(error)
//   }
// }

// watch(SelectedCabang, async (newCabang) => {
//   if (newCabang) {
//     await fetchPaket()
//   }
// })

onMounted(async () => {
  await fetchCabang()
})
</script>

<template>
  <div class="container mx-auto px-4 mt-10">
    <div class="flex justify-between items-center mb-6">
      <PrimaryButton @click="showAddForm = true" class="flex items-center gap-2">
        <IconMoney />
        Tambah Transaksi Hotel
      </PrimaryButton>
      <div class="inline-flex rounded-md shadow-xs" role="group">
        <label for="search" class="block text-sm font-medium text-gray-700 mr-2 mt-3">Filter</label>
        <input type="text" id="search" class="block w-64 px-3 py-2 text-gray-700 bg-white border border-gray-300 rounded-s-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
          v-model="searchQuery" @change="fetchData()" placeholder="Cari data..." />
        <select v-model="selectedOptionCabang" style="width: 300px" @change="fetchData()"
          class="border-t border-b border-e bg-gray-50 border-gray-300 text-gray-900 text-sm rounded-e-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" >
          <option v-for="optionC in optionFilterCabang" :key="optionC.id" :value="optionC.id">
            {{ optionC.name }}
          </option>
        </select>
      </div>

    </div>
    <div class="overflow-hidden rounded-lg border border-gray-200 shadow-md">
      <table class="w-full border-collapse bg-white text-left text-sm text-gray-500">
        <thead class="bg-gray-100">
          <tr>
            <th class="w-[10%] px-6 py-3 font-medium text-gray-900 text-center">Nomor Invoice</th>
            <th class="w-[25%] px-6 py-3 font-medium text-gray-900 text-center">Info Kostumer/Paket</th>
            <th class="w-[40%] px-6 py-3 font-medium text-gray-900 text-center">Info Transaksi Hotel</th>
            <th class="w-[15%] px-6 py-3 font-medium text-gray-900 text-center">Tanggal Transaksi</th>
            <th class="w-[10%] px-6 py-3 font-medium text-gray-900 text-center">Aksi</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200">
          <tr v-if="data.length === 0">
            <td colspan="6" class="px-6 py-3 text-center text-gray-500">
              Daftar Transaksi Hotel Tidak Ditemukan
            </td>
          </tr>
          <tr v-else v-for="transaksi in data" :key="transaksi.id" class="hover:bg-gray-50 transition-colors">
            <td class="px-6 py-4 text-center align-top">{{ transaksi.invoice }}</td>
            <td class="px-6 py-4 text-center align-top">
              <span v-if="transaksi.kostumer != '-'">
                <b>Nama Kostumer</b> <br> ( {{ transaksi.kostumer }} )
              </span>
              <span v-if="transaksi.paket != '-'">
                <b>Nama Paket</b> <br> ( {{ transaksi.paket }} )
              </span>
            </td>
            <td class="px-0 py-4 text-center align-top">
              <table class="w-full mb-5">
                <tbody>
                  <tr>
                    <td class="w-[45%] border-b px-6 py-2 text-left">Hotel</td>
                    <td class="text-center border-b py-2">:</td>
                    <td class="text-right space-y-2 text-sm border-b px-6 py-2">{{ transaksi.hotel }}</td>
                  </tr>
                  <tr>
                    <td class="border-b px-6 py-2 text-left">Tipe Kamar</td>
                    <td class="text-center border-b py-2">:</td>
                    <td class="text-right space-y-2 text-sm border-b px-6 py-2">{{ transaksi.tipe_kamar }}</td>
                  </tr>
                  <tr>
                    <td class="border-b px-6 py-2 text-left">Jumlah Hari</td>
                    <td class="text-center border-b py-2">:</td>
                    <td class="text-right space-y-2 text-sm border-b px-6 py-2">{{ transaksi.jumlah_hari }} Hari</td>
                  </tr>
                  <tr>
                    <td class="border-b px-6 py-2 text-left">Jumlah Kamar</td>
                    <td class="text-center border-b py-2">:</td>
                    <td class="text-right space-y-2 text-sm border-b px-6 py-2">{{ transaksi.jumlah_kamar }} Kamar</td>
                  </tr>
                  <tr>
                    <td class="border-b px-6 py-2 text-left">Harga Travel Kamar Per Hari</td>
                    <td class="text-center border-b py-2">:</td>
                    <td class="text-right space-y-2 text-sm border-b px-6 py-2">{{ formatRupiah(transaksi.harga_travel_kamar_per_hari) }}</td>
                  </tr>
                  <tr>
                    <td class="border-b px-6 py-2 text-left">Harga Kostumer Kamar Per Hari</td>
                    <td class="text-center border-b py-2">:</td>
                    <td class="text-right space-y-2 text-sm border-b px-6 py-2">{{ formatRupiah(transaksi.harga_kostumer_kamar_per_hari) }}</td>
                  </tr>
                  <tr>
                    <td class="border-b px-6 py-2 text-left">Total Biaya</td>
                    <td class="text-center border-b py-2">:</td>
                    <td class="text-right space-y-2 text-sm border-b px-6 py-2">{{ formatRupiah(transaksi.harga_kostumer_kamar_per_hari * transaksi.jumlah_hari * transaksi.jumlah_kamar) }}</td>
                  </tr>
                </tbody>
              </table>
            </td>
            <td class="px-6 py-4 text-center align-top">{{ transaksi.tanggal_transaksi }}</td>
            <td class="px-6 py-4 text-center align-top">
              <div class="flex justify-end gap-2">
                <LightButton @click="cetak_invoice(transaksi.invoice)">
                  <CetakIcon />
                </LightButton>
                <DangerButton @click="deleteData(transaksi.id)">
                  <DeleteIcon />
                </DangerButton>
              </div>
            </td>
          </tr>
        </tbody>
        <tfoot class="bg-gray-100 font-bold">
          <Pagination :currentPage="currentPage" :totalPages="totalPages" :pages="pages" :totalColumns="totalColumns" @prev-page="handlePrev" @next-page="handleNext" @page-now="handlePageNow" :totalRow="totalRow"/>
        </tfoot>
      </table>
    </div>
  </div>
  <Confirmation :showConfirmDialog="showConfirmDialog" :confirmTitle="confirmTitle" :confirmMessage="confirmMessage" >
    <button @click="confirmAction && confirmAction()"
      class="inline-flex w-full justify-center rounded-md border border-transparent bg-yellow-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
    >
      Ya
    </button>
    <button @click="showConfirmDialog = false"
      class="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
    >
      Tidak
    </button>
  </Confirmation>
    <!-- Form Add Visa -->
  <FormAdd :formStatus="showAddForm" @cancel="showAddForm = false" @submitted="() => { showAddForm = false; fetchData(); }" />
  <!-- Notification -->
  <Notification :showNotification="showNotification" :notificationType="notificationType" :notificationMessageHtml="notificationMessage" @close="showNotification = false" />
</template>
