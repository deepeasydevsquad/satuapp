<script setup lang="ts">
import Form from '@/components/Modal/FormEditProfile.vue'
import { ref, watch, computed, onMounted } from 'vue'
import { get_fee_by_agen, add_pembayaran } from '@/service/pembayaran_fee_agen_paket'
import alertify from 'alertifyjs'

const props = defineProps<{
  agen_id: number
  formStatus: boolean
  nama: string
  level: string
  whatsapp: string
}>()

const emit = defineEmits<{
  (e: 'cancel'): void
  (e: 'submitted'): void
}>()

const listFee = ref<any[]>([])
const loading = ref(false)
const selectedIds = ref<number[]>([])

watch(
  () => props.formStatus,
  async (val) => {
    if (val && props.agen_id) {
      loading.value = true
      try {
        const res = await get_fee_by_agen({ agen_id: props.agen_id })
        listFee.value = res
        selectedIds.value = []
      } catch (err) {
        console.error('Gagal ambil data fee:', err)
        listFee.value = []
      } finally {
        loading.value = false
      }
    }
  },
)

const toggleSelection = (id_fee_agen: number) => {
  if (selectedIds.value.includes(id_fee_agen)) {
    selectedIds.value = selectedIds.value.filter(item => item !== id_fee_agen);
  } else {
    selectedIds.value.push(id_fee_agen)
  }

  totalSelectedFee.value = 0;
  for( let x in listFee.value) {
    if(selectedIds.value.includes(listFee.value[x].id_fee_agen)) {
      totalSelectedFee.value = totalSelectedFee.value + listFee.value[x].nominal_fee
    }
  }
}

const selectedFees = ref<number[]>([])
const totalSelectedFee = ref<number>(0);
const submitPembayaran = async () => {

  if (selectedFees.value.length == 0 ) {
    alertify.error('Pilih minimal satu fee dulu.')
    return
  }

  // console.log("xxxx");
  // console.log(selectedFees.value);
  // console.log("xxxx");
  // const selectedFeeItems = listFee.value.filter((item) => selectedFeeIds.includes(item.id_fee_agen))
  // const total = selectedFeeItems.reduce((acc, item) => acc + item.nominal_fee, 0)

  const payload = {
    agen_id: props.agen_id,
    fee_agen_id: selectedFees.value,
    nominal: totalSelectedFee.value,
  }

  try {
    const res = await add_pembayaran(payload)
    console.log('✅ Sukses bayar:', res)
    const printUrl = `/kwitansi-pembayaran-fee-agen/${res.invoice}`
    window.open(printUrl, '_blank')
    emit('submitted')
  } catch (err) {
    console.error('❌ Gagal bayar:', err)
  }
}

onMounted(() => {
  console.log('🛠 ID Fee Agen yang akan diupdate:', selectedIds)
})
</script>

<template>
  <Form :formStatus="props.formStatus" :label="'Form Pembayaran Fee Agen'" :width="'w-1/4'" :submitLabel="'Bayar'" @submit="submitPembayaran()" @cancel="() => emit('cancel')" >
    <table class="w-full mb-5 text-gray-500 border">
      <tbody>
        <tr  class="border-gray-200 hover:bg-gray-200">
          <td class="w-[30%] border-b px-2 py-2">Nama Agen</td>
          <td class="text-center border-b py-2">:</td>
          <td class="border-b text-right space-y-2 text-sm px-2 py-2">{{ props.nama }}</td>
        </tr>
        <tr  class="border-gray-200 hover:bg-gray-200">
          <td class="border-b px-2 py-2">Level</td>
          <td class="text-center border-b py-2">:</td>
          <td class="border-b text-right space-y-2 text-sm px-2 py-2">{{ props.level }}</td>
        </tr>
        <tr  class="border-gray-200 hover:bg-gray-200">
          <td class="border-b px-2 py-2">Whatsapp</td>
          <td class="text-center border-b py-2">:</td>
          <td class="border-b text-right space-y-2 text-sm px-2 py-2">{{ props.whatsapp }}</td>
        </tr>
      </tbody>
    </table>

    <div class="space-y-2 mt-4">
      <p class="font-semibold text-gray-700">Rincian Fee Belum Dibayar:</p>
       <div v-for="(item, index) in listFee" :key="index" class="flex items-center justify-between p-2 border rounded" >
        <div>
          <p class="font-medium text-gray-700">{{ item.nama_jamaah }} ({{ item.no_identitas_jamaah }})</p>
          <p class="text-sm text-gray-500">Rp {{ item.nominal_fee.toLocaleString('id-ID') }}</p>
        </div>
        <input type="checkbox" class="w-5 h-5 border-gray-300 text-gray-600 rounded focus:ring-gray-500" v-model="selectedFees"
          @change="toggleSelection(item.id_fee_agen)" :checked="selectedIds.includes(item.id_fee_agen)" :value="item.id_fee_agen" />
      </div>
      <div class="mt-4 text-right font-bold text-lg text-gray-700">
        Total Bayar: Rp {{ totalSelectedFee.toLocaleString('id-ID') }}
      </div>
    </div>
  </Form>
</template>


<style scoped>
/* Override z-index alertify */
.alertify-notifier {
  z-index: 100000000 !important;
}
</style>
