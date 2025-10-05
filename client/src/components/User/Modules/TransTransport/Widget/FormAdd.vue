<script setup lang="ts">
import { ref, watch, computed, onMounted } from 'vue'
  import Form from '@/components/Modal/Form.vue'
  import InputText from '@/components/Form/InputText.vue'
  import SelectField from '@/components/Form/SelectField.vue'
  import TextArea from '@/components/Form/TextArea.vue'
  import Notification from '@/components/Modal/Notification.vue'
  import Confirmation from '@/components/Modal/Confirmation.vue'
  import PrimaryButton from '@/components/Button/PrimaryButton.vue'

  import { add_transaksi, daftar_mobil, daftar_kostumer, daftar_paket } from '@/service/trans_transport'
  import { getSumberDanaPaket } from '@/service/transaksi_visa'
  import { paramCabang } from '@/service/param_cabang'

  const props = defineProps<{ showModal: boolean }>()
  const emit = defineEmits<{ (e: 'cancel'): void; (e: 'submit'): void; (e: 'error', message: string): void; }>()

  const handleCancel = () => {resetForm();emit('cancel');}

  interface option {
    id: number
    name: string
  }

  // Format ke IDR
  const formatToIDR = (value: number | string): string => {
    const num = typeof value === 'string' ? Number(value.replace(/[^\d]/g, '')) : value
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(num || 0)
  }

  // Ambil angka asli dari string IDR
  const parseIDR = (value: string): number => {
    return Number(value.replace(/[^\d]/g, ''))
  }

  const errors = ref<{
    cabang?: string
    kostumer_paket?: string
    address?: string
    details?: { mst_mobil_id?: number; car_number?: string; travelPrice?: string; costumerPrice?: string; general?: string }[]
  }>({})

  const formData = ref({
    kostumer_id: 0,
    paket_id: 0,
    address: '',
  })

  const formMobilList = ref([
    {
      mst_mobil_id: 0,
      car_number: '',
      travelPrice: 0,
      costumerPrice: 0,
    },
  ])

  const resetForm = () => {
    formData.value = {
      kostumer_id: 0,
      paket_id: 0,
      address: '',
    }
    formMobilList.value = [
      {
        mst_mobil_id: 0,
        car_number: '',
        travelPrice: 0,
        costumerPrice: 0,
      },
    ]
  }

  const validateForm = (): boolean => {
    let isValid = true
    errors.value = {}

  if (!SelectedCabang.value) {
      errors.value.cabang = 'Cabang harus dipilih.'
      isValid = false
    }

    // Validate customer fields
    if ((!SelectedCustomer.value || SelectedCustomer.value === 0 ) && ( !SelectedPaket.value || SelectedPaket.value === 0 ) ) {
      errors.value.kostumer_paket = 'Kostumer atau paket wajib dipilih'
      isValid = false
    }

    if (!formData.value.address?.trim()) {
      errors.value.address = 'Alamat wajib diisi.'
      isValid = false
    }

    // Validasi list mobil
    if (formMobilList.value.length === 0) {
      errors.value.details = [{ general: 'Minimal satu mobil harus ditambahkan.' }]
      isValid = false
    } else {
      errors.value.details = []

      formMobilList.value.forEach((mobil, index) => {
        const mobilErrors: Record<string, string> = {}

        if (!mobil.mst_mobil_id) {
          mobilErrors.mst_mobil_id = 'Mobil harus dipilih.'
          isValid = false
        }

        if (!mobil.car_number?.trim()) {
          mobilErrors.car_number = 'Nomor mobil wajib diisi.'
          isValid = false
        }

        if (!mobil.travelPrice || isNaN(Number(mobil.travelPrice))) {
          mobilErrors.travelPrice = 'Harga travel wajib diisi dan berupa angka.'
          isValid = false
        }

        if (!mobil.costumerPrice || isNaN(Number(mobil.costumerPrice))) {
          mobilErrors.costumerPrice = 'Harga kostumer wajib diisi dan berupa angka.'
          isValid = false
        }

        errors.value.details?.push(mobilErrors);
      })
    }

    return isValid
  }


  const handleSubmit = async () => {
    if (!validateForm()) {
      return
    }

    try {
      const payload = {
        cabang: SelectedCabang.value,
        sumber_dana: SelectedSumberDana.value,
        kostumer: SelectedCustomer.value,
        paket: SelectedPaket.value,
        address: formData.value.address,
        details: formMobilList.value.map((mobil) => ({
          mst_mobil_id: Number(mobil.mst_mobil_id),
          car_number: mobil.car_number,
          travelPrice: Number(mobil.travelPrice),
          costumerPrice: Number(mobil.costumerPrice),
        })),
      }
      const response = await add_transaksi(payload)

      const printUrl = `/kwitansi-trans-transport/${response?.invoice}`
      window.open(printUrl, '_blank')

      resetForm()
      emit('submit');
    } catch (error: any) {
      console.error('❌ Gagal submit:', error)
      displayNotification(error?.response?.data?.message || 'Gagal menambahkan transaksi', 'error')
    }
  }

  const notificationMessage = ref('')
  const notificationType = ref('')
  const showNotification = ref(false)
  const timeoutId = ref<number | null>(null)
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

  const SelectedPaket = ref(0);
  const SelectedSumberDana = ref(0);
  const list_paket = ref<option[]>([{ id: 0, name: ' -- Pilih Paket -- ' }])
  const list_sumber_dana = ref<option[]>([{ id: 0, name: ' -- Pilih Sumber Dana -- ' }])
  const fetchSumberDanaPaket = async () => {
    try {
      if(SelectedCabang.value != 0 ) {
        const response = await getSumberDanaPaket({ cabang: SelectedCabang.value })
        list_paket.value = [{ id: 0, name: ' -- Pilih Paket -- ' }, ...response.data.daftar_paket] ;
        list_sumber_dana.value = response.data.sumber_dana;
      }else{
        list_paket.value = [{ id: 0, name: ' -- Pilih Paket -- ' }];
        list_sumber_dana.value = [{ id: 0, name: ' -- Pilih Sumber Dana -- ' }];
        SelectedPaket.value = 0;
        SelectedSumberDana.value = 0;
      }

    } catch (error) {
      console.error(error)
    }
  }

  const cabangOption = ref<option[]>([])
  const SelectedCabang = ref(0)
  const fetchCabang = async () => {
    try {
      const response = await paramCabang()
      cabangOption.value = [{ id: 0, name: ' -- Pilih Cabang -- ' }, ...response.data]
    } catch (error) {
      console.error(error)
    }
  }

  const customerOption = ref<option[]>([])
  const SelectedCustomer = ref(0)
  const fetchCustomer = async () => {
    try {
      const response = await daftar_kostumer()
      customerOption.value = [{ id: 0, name: ' -- Pilih Kostumer -- ' }, ...response]
    } catch (error) {
      console.error(error)
    }
  }

  const MobilOptions = ref<{ id: number | string; name: string; kota: string }[]>([])
  const fetchMobil = async () => {
    try {
      const data = await daftar_mobil()
      MobilOptions.value = [
        { id: 0, name: ' -- Pilih Mobil -- ' },
        ...data.map((item: any) => ({id: item.id,name: `${item.name}`,})),
      ]
      console.log('data kota', data)
    } catch (error) {
      displayNotification('Gagal ambil data kota', 'error')
    }
  }

  const addMobil = () => {
    formMobilList.value.push({
      mst_mobil_id: 0,
      car_number: '',
      travelPrice: 0,
      costumerPrice: 0,
    })
  }

  const removeMobil = (index: number) => {
    if (formMobilList.value.length > 1) {
      formMobilList.value.splice(index, 1)
    }
  }

  watch(
    () => props.showModal,
    async (val) => {
      if (val) {
        fetchMobil()
        fetchCustomer()
        fetchCabang()
      }
    },
  )

</script>
<template>
  <Form :formStatus="props.showModal" @cancel="handleCancel" @submit="handleSubmit" :submitLabel="'Tambah Transaksi'" :width="'w-1/3'" :label="'Tambah Transaksi Transport'">
    <div class="flex flex-wrap gap-4">
      <div class="flex-1 min-w-[200px]">
        <SelectField label="Cabang" v-model="SelectedCabang" :options="cabangOption" @change="fetchSumberDanaPaket" :error="errors.cabang"/>
      </div>
      <div class="flex-1 min-w-[200px]">
        <SelectField label="Sumber Dana" v-model="SelectedSumberDana" :options="list_sumber_dana" />
      </div>
      <div class="flex-1 min-w-[200px]">
        <SelectField label="Kostumer" v-model="SelectedCustomer" :options="customerOption" :error="errors.kostumer_paket"/>
      </div>
      <div class="flex-1 min-w-[200px]">
        <SelectField label="Paket" v-model="SelectedPaket" :options="list_paket" :error="errors.kostumer_paket"/>
      </div>
    </div>
    <div class="mt-4">
      <TextArea v-model="formData.address" id="address" label="Alamat" placeholder="Tuliskan Alamat Anda..." note="Contoh: Jl. Raya Jakarta No. 123, Jakarta Selatan, DKI Jakarta" :error="errors.address" class="resize-none" />
    </div>
    <div class="mt-6">
      <h3 class="font-semibold text-sm mb-2">Detail Mobil</h3>
      <table class="table-auto w-full">
        <thead class="bg-gray-100 text-sm text-gray-700">
          <tr class="text-center">
            <th class="w-[90%] px-4 py-3">Info Mobil</th>
            <th class="w-[10%] px-4 py-3">Aksi</th>
          </tr>
        </thead>
        <tbody class="align-top border-t border-gray-200">
          <tr v-for="(mobil, index) in formMobilList" :key="index" class="hover:bg-gray-100 border-b border-dashed border-gray-700 pt-4" >
            <td class="px-4 py-2">
              <div class="flex gap-4 mt-2">
                <div class="w-1/2">
                  <SelectField note="Mobil" v-model="mobil.mst_mobil_id" placeholder="Pilih Mobil" :options="MobilOptions" :error="errors.details?.[index]?.mst_mobil_id" />
                </div>
                <div class="w-1/2">
                  <InputText v-model="mobil.car_number" note="Plat Mobil" placeholder="Masukkan Plat Mobil"   :error="errors.details?.[index]?.car_number" />
                </div>
              </div>
              <div class="flex gap-4 mt-2">
                <div class="w-1/2">
                  <InputText :modelValue="formatToIDR(mobil.travelPrice)" @update:modelValue="mobil.travelPrice = parseIDR($event)" note="Harga Travel Per Paket" placeholder="Masukkan harga travel per paket" :error="errors.details?.[index]?.travelPrice" />
                </div>
                <div class="w-1/2">
                  <InputText :modelValue="formatToIDR(mobil.costumerPrice)" @update:modelValue="mobil.costumerPrice = parseIDR($event)" note="Harga Kostumer Per Paket" placeholder="Masukkan harga kostumer per paket" :error="errors.details?.[index]?.costumerPrice"/>
                </div>
              </div>
            </td>
            <td class="px-4 py-2 text-center">
              <DangerButton class="mt-2.5" @click="removeMobil(index)">
                <DeleteIcon class="w-5 h-5" />
              </DangerButton>
            </td>
          </tr>
        </tbody>
      </table>
      <div class="mt-4 flex justify-end">
        <PrimaryButton @click="addMobil">+ Tambah Mobil</PrimaryButton>
      </div>
    </div>
  </Form>
  <!-- <Confirmation :showConfirmDialog="showConfirmDialog" :confirmTitle="confirmTitle" :confirmMessage="confirmMessage">
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
  </Confirmation> -->
  <Notification :showNotification="showNotification" :notificationType="notificationType" :notificationMessage="notificationMessage" @close="showNotification = false"/>
</template>
