<script setup lang="ts">
import { ref, watch } from 'vue'
import { getSkema, updateSkema } from '@/service/daftar_pinjaman'
import Form from '@/components/Modal/Form.vue'
import InputText from '@/components/Form/InputText.vue'
import InputDate from '@/components/Form/InputDate.vue'
import Notification from '@/components/User/Modules/DaftarPeminjaman/Particle/Notification.vue'

const props = defineProps<{ peminjamanId: number }>()
const emit = defineEmits(['close', 'update'])

const skema = ref<Array<{ id: number; term: string; nominal: number; duedate: string }>>([])

// Notification
const showNotification = ref(false)
const notificationMessage = ref('')
const notificationType = ref<'success' | 'error'>('success')

const fetchSkema = async () => {
  try {
    const res = await getSkema(props.peminjamanId)
    skema.value = res.data
  } catch (err) {
    console.error('Failed to fetch skema:', err)
  }
}

const handleSave = async () => {
  try {
    const payload = {
      peminjaman_id: props.peminjamanId,
      updatedSkema: skema.value,
    }

    await updateSkema(payload)
    skema.value = []
    emit('update')
  } catch (error) {
    showNotification.value = true
    notificationMessage.value = error.response?.data?.error_msg || 'Terjadi kesalahan'
    notificationType.value = 'error'
  }
}

const formatIDR = (val: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(val || 0)
}

// Parsing ulang saat input nominal berubah
const onInputNominal = (value: string, index: number) => {
  const raw = value.replace(/[^0-9]/g, '')
  const numeric = parseInt(raw, 10) || 0
  skema.value[index].nominal = numeric
}

const handleClose = () => {
  skema.value = []
  emit('close')
}

// Re-fetch setiap peminjamanId berubah
watch(
  () => props.peminjamanId,
  () => {
    fetchSkema()
  },
  { immediate: true },
)
</script>

<template>
  <div class="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
    <Form
      :formStatus="true"
      :label="'Update Skema Pembayaran'"
      :width="'w-full max-w-xl'"
      :submitLabel="'Simpan Skema'"
      @submit="handleSave"
      @cancel="handleClose"
    >
      <div class="max-h-[50vh] overflow-y-auto">
        <table class="w-full border-collapse bg-white text-left text-sm text-gray-500">
          <thead class="bg-white sticky top-0 z-10">
            <tr>
              <th class="w-[15%] px-6 py-2 font-bold text-gray-900 text-center border">Term</th>
              <th class="w-[45%] px-6 py-2 font-bold text-gray-900 text-center border">Amount</th>
              <th class="w-[40%] px-6 py-2 font-bold text-gray-900 text-center border">
                Tanggal Jatuh tempo
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in skema" :key="item.id">
              <td class="py-2 border-b text-center">{{ item.term }}</td>
              <td class="py-2 border-b text-center">
                <InputText
                  :modelValue="formatIDR(item.nominal)"
                  @update:modelValue="(val) => onInputNominal(val, index)"
                />
              </td>
              <td class="py-2 border-b text-center">
                <InputDate v-model="skema[index].duedate" placeholder="Pilih tanggal" />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </Form>

    <Notification
      :showNotification="showNotification"
      :notificationType="notificationType"
      :notificationMessage="notificationMessage"
      @close="showNotification = false"
    />
  </div>
</template>
