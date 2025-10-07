<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { check_koneksi, get_key, update_pengaturan } from '@/service/pengaturan_whatsapp'
import PrimaryButton from '@/components/Button/PrimaryButton.vue'
import LightButton from '@/components/Button/LightButton.vue'
import Form from '@/components/Modal/Form.vue'
import InputText from '@/components/Form/InputText.vue'
import Loading from '@/components/Modal/Loading.vue'
import Notification from '@/components/Modal/Notification.vue'

const data_whatsapp = ref({
  api_key: '',
  device_key: '',
  whatsapp_number: '',
})

const wapisender_key = ref({
  api_key: '',
  device_key: '',
  whatsapp_device_number: '',
})

const handleSave = async () => {
  isLoading.value = true
  try {
    await update_pengaturan({
      api_key: wapisender_key.value.api_key,
      device_key: wapisender_key.value.device_key,
      whatsapp_number: wapisender_key.value.whatsapp_device_number,
    })

    displayNotification('Berhasil update pengaturan!', 'success')
    showModalKonfgurasi.value = false
    fetchData() // refresh data setelah update
  } catch (err) {
    console.error(err)
    displayNotification('Gagal update pengaturan', 'error')
  } finally {
    isLoading.value = false
  }
}

const ambil_data_key = async () => {
  try {
    const data = await get_key()
    wapisender_key.value.api_key = data.whatsapp_api_key
    wapisender_key.value.device_key = data.whatsapp_device_key
    wapisender_key.value.whatsapp_device_number = data.whatsapp_device_number
    console.log(wapisender_key.value)
  } catch (error) {
    console.error('Error fetching data:', error)
  }
}

const showNotification = ref(false)
const notificationMessage = ref('')
const notificationType = ref<'success' | 'error'>('success')
const timeoutId = ref<number | null>(null)
const searchTimeout = ref<number | null>(null)
const isLoading = ref(false)

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const handle_restart = async () => {
  isLoading.value = true
  try {
    await fetchData()
    await delay(1000) // delay 1 detik sebelum notifikasi
    displayNotification('Berhasil Restart Koneksi', 'success')
  } catch (err) {
    console.error('Gagal restart koneksi:', err)
  } finally {
    isLoading.value = false
  }
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

const fetchData = async () => {
  try {
    const data = await check_koneksi()
    data_whatsapp.value = data
    console.log(data_whatsapp.value)
  } catch (error) {}
}

onMounted(() => {
  fetchData()
  ambil_data_key()
})

const showModalKonfgurasi = ref(false)
const handleCancel = () => {
  showModalKonfgurasi.value = false
}
</script>

<template>
  <div class="flex gap-4 mt-10 ml-4">
    <PrimaryButton @click="showModalKonfgurasi = true">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="w-5 h-5 mr-2"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M11.25 2.25c.414 0 .75.336.75.75v1.086a7.5 7.5 0 012.95 1.27l.769-.77a.75.75 0 011.06 0l1.06 1.06a.75.75 0 010 1.061l-.77.77a7.5 7.5 0 011.27 2.949h1.086a.75.75 0 01.75.75v1.5a.75.75 0 01-.75.75h-1.086a7.5 7.5 0 01-1.27 2.949l.77.77a.75.75 0 010 1.06l-1.06 1.061a.75.75 0 01-1.061 0l-.77-.77a7.5 7.5 0 01-2.949 1.27v1.086a.75.75 0 01-.75.75h-1.5a.75.75 0 01-.75-.75v-1.086a7.5 7.5 0 01-2.949-1.27l-.77.77a.75.75 0 01-1.06 0l-1.061-1.06a.75.75 0 010-1.061l.77-.77a7.5 7.5 0 01-1.27-2.949H2.25a.75.75 0 01-.75-.75v-1.5c0-.414.336-.75.75-.75h1.086a7.5 7.5 0 011.27-2.949l-.77-.77a.75.75 0 010-1.061l1.061-1.06a.75.75 0 011.06 0l.77.77A7.5 7.5 0 0110.5 4.086V3c0-.414.336-.75.75-.75zM12 15a3 3 0 100-6 3 3 0 000 6z"
        />
      </svg>
      Konfigurasi Pengaturan
    </PrimaryButton>

    <PrimaryButton @click="handle_restart()">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="w-5 h-5 mr-2"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M4 4v5h.582M20 20v-5h-.581M4.582 9A7.5 7.5 0 0120 12.5m-.581 2.5A7.5 7.5 0 014 12.5"
        />
      </svg>
      Restart Perangkat
    </PrimaryButton>
  </div>

  <div class="flex gap-6 mt-6 px-4">
    <!-- KIRI: Info Perangkat -->
    <div class="w-full md:w-1/2 border border-gray-200 rounded-md overflow-hidden">
      <div class="bg-gray-200 text-center text-sm font-semibold py-2">INFO PERANGKAT</div>
      <table class="w-full text-sm text-gray-700">
        <tbody>
          <tr class="border-t">
            <td class="py-2 px-4 w-1/3 font-medium">Nomor WA Perangkat</td>
            <td class="py-2">:</td>
            <td class="py-2 px-4">{{ data_whatsapp.phone_number }}</td>
          </tr>
          <tr class="border-t">
            <td class="py-2 px-4 font-medium">Device Key</td>
            <td class="py-2">:</td>
            <td class="py-2 px-4">{{ data_whatsapp.device_key }}</td>
          </tr>
          <tr class="border-t">
            <td class="py-2 px-4 font-medium">Tanggal Berlangganan</td>
            <td class="py-2">:</td>
            <td class="py-2 px-4">{{ data_whatsapp.tanggal_berlangganan }}</td>
          </tr>
          <tr class="border-t">
            <td class="py-2 px-4 font-medium">Tanggal Berakhir</td>
            <td class="py-2">:</td>
            <td class="py-2 px-4">{{ data_whatsapp.tanggal_expired }}</td>
          </tr>
          <tr class="border-t">
            <td class="py-2 px-4 font-medium">Status Berlangganan</td>
            <td class="py-2">:</td>
            <td class="py-2 px-4 capitalize">{{ data_whatsapp.status_langganan }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- KANAN: QR Code -->
    <div
      class="w-full md:w-1/2 flex items-center justify-center border border-dashed border-gray-300 rounded-md p-4"
    >
      <iframe :src="data_whatsapp.qr_url" class="w-48 h-48 md:w-64 md:h-64"></iframe>
    </div>
  </div>

  <Form
    :formStatus="showModalKonfgurasi"
    @cancel="handleCancel()"
    @submit="handleSave()"
    :submitLabel="'Simpan'"
    :width="'w-1/4'"
    :label="'Konfigurasi Perangkat'"
  >
    <InputText
      v-model="wapisender_key.api_key"
      label="API KEY"
      placeholder="Masukan Api Key"
      id="api_key"
      class="mb-4"
    />
    <InputText
      v-model="wapisender_key.device_key"
      label="DEVICE KEY"
      placeholder="Masukan Device Key"
      id="device_key"
      class="mb-4"
    />
    <InputText
      v-model="wapisender_key.whatsapp_device_number"
      label="NOMOR WHATSAPP"
      placeholder="Masukan Nomor Whatsapp"
      id="whatsapp_number"
      class="mb-4"
    />
  </Form>

  <!-- Loading Spinner -->
  <Loading :loading="isLoading" label="Sedang merestart koneksi..." />
  <Notification
    :showNotification="showNotification"
    :notificationType="notificationType"
    :notificationMessage="notificationMessage"
    @close="showNotification = false"
  />
</template>
