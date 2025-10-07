<script setup lang="ts">
import { defineProps, defineEmits, computed, watch } from 'vue'
import PrimaryButton from '@/components/Button/PrimaryButton.vue'
import { paramCabang } from '@/service/param_cabang'
import { addTransaksiPassport, getCityList, daftar_kostumer, daftar_paket } from '@/service/transaksi_passport'
import { getSumberDanaPaket } from '@/service/transaksi_visa'
import { onMounted, ref } from 'vue'
import Form from '@/components/Modal/Form.vue'
import InputText from '@/components/Form/InputText.vue'
import InputDate from '@/components/Form/InputDate.vue'
import SelectField from '@/components/Form/SelectField.vue'
import TextArea from '@/components/Form/TextArea.vue'
import LightButton from '@/components/Button/LightButton.vue'
import DangerButton from '@/components/Button/DangerButton.vue'
import DeleteIcon from '@/components/Icons/DeleteIcon.vue'

const props = defineProps<{ isFormOpen: boolean }>()
const emit = defineEmits<{
  (e: 'cancel'): void
  (e: 'save-success', message: string): void
  (e: 'error', message: string): void
}>()

const reset = () => {
  errors.value = {}
  formList.value = [{
     name: '',
    identity: '',
    kkNumber: '',
    birthPlace: '',
    birthDate: '',
    cityId: '',
    address: '',
    price: '',
    priceCostumer: '',
  }]
  SelectedCabang.value = 0;
  SelectedSumberDana.value = 0;
  SelectedCustomer.value = 0;
  SelectedPaket.value = 0
  customerOption.value = [{ id: 0, name: ' -- Pilih Kostumer -- '}];
  cabangOption.value = [{ id: 0, name: ' -- Pilih Cabang -- '}];
  list_paket.value = [{ id: 0, name: ' -- Pilih Paket -- '}];
  list_sumber_dana.value = [{ id: 0, name: ' -- Pilih Sumber Dana -- '}];
}

const handleCancel = () => {
  reset();
  emit('cancel')
}

const cityList = ref<city[]>([])

interface city {
  id: string
  name: string
  kode: string
}

const formList = ref([
  {
    name: '',
    identity: '',
    kkNumber: '',
    birthPlace: '',
    birthDate: '',
    cityId: '',
    address: '',
    price: '',
    priceCostumer: '',
  },
])

const addRow = () => {
  formList.value.push({
    name: '',
    identity: '',
    kkNumber: '',
    birthPlace: '',
    birthDate: '',
    cityId: '',
    address: '',
    price: '',
    priceCostumer: '',
  })
}

const fetchKota = async () => {
  try {
    const res = await getCityList()
    cityList.value = res
  } catch (error) {
    console.error('error getCityList:', error)
  }
}

const cityOptions = computed(() => [
  { id: '', name: 'Pilih Kota' }, // ini buat default/null
  ...cityList.value.map((item) => ({
    id: item.id,
    name: `${item.name} - ${item.kode}`,
  })),
])

const payerIndex = ref<number | null>(0) // default ke index pertama, bisa null juga

const handleSubmit = async () => {
  if (!validateForm()) return

  const payload = {
    cabang: SelectedCabang.value,
    sumber_dana: SelectedSumberDana.value,
    kostumer: SelectedCustomer.value,
    paket: SelectedPaket.value,

    passport_details: formList.value.map((item) => ({
      name: item.name,
      identity_number: item.identity,
      birth_place: item.birthPlace,
      birth_date: item.birthDate,
      kk_number: item.kkNumber,
      address: item.address,
      city: parseInt(item.cityId),
      price: item.price,
      priceCostumer: item.priceCostumer,
    })),
  }

  try {
    const res = await addTransaksiPassport(payload)
    emit('save-success', 'Berhasil tambah transaksi passport!')
  } catch (err: any) {
    console.error('Gagal kirim transaksi:', err)

    // Ambil pesan error dari response kalau ada
    const message =
      err?.response?.data?.message || err?.message || 'Terjadi kesalahan saat kirim data'

    emit('error', message)
  }
}

const formatRupiah = (value: string | number): string => {
  let num = typeof value === 'string' ? parseInt(value.replace(/\D/g, '')) : value
  if (isNaN(num)) return ''
  return 'Rp ' + num.toLocaleString('id-ID')
}

const parseRupiah = (formatted: string): number => {
  const clean = formatted.replace(/[^0-9]/g, '')
  return parseInt(clean || '0')
}

// const errors = ref<Record<number | string, Record<string, string>>>({})
const errors = ref<Record<number | string, Record<string, string>>>({})
const validateForm = (): boolean => {
  let isValid = true
  errors.value = {}

  if( SelectedCabang.value == 0) {
      errors.value.cabang = { cabang: 'Cabang wajib dipilih.' };
      isValid = false
  }

  formList.value.forEach((form, index) => {
    const rowErrors: Record<string, string> = {}

    if (!form.name) {
      rowErrors.name = 'Nama wajib diisi.'
      isValid = false
    }
    if (!form.identity) {
      rowErrors.identity = 'Identitas wajib diisi.'
      isValid = false
    }
    if (!form.kkNumber) {
      rowErrors.kkNumber = 'Nomor KK wajib diisi.'
      isValid = false
    }
    if (!form.birthPlace) {
      rowErrors.birthPlace = 'Tempat lahir wajib diisi.'
      isValid = false
    }
    if (!form.birthDate) {
      rowErrors.birthDate = 'Tanggal lahir wajib diisi.'
      isValid = false
    }
    if (!form.cityId) {
      rowErrors.cityId = 'Kota wajib dipilih.'
      isValid = false
    }
    if (!form.address) {
      rowErrors.address = 'Alamat wajib diisi.'
      isValid = false
    }
    if (!form.price || parseInt(form.price.toString()) <= 0) {
      rowErrors.price = 'Harga wajib diisi dan lebih dari 0.'
      isValid = false
    }
    if (!form.priceCostumer || parseInt(form.priceCostumer.toString()) <= 0) {
      rowErrors.priceCostumer = 'Harga kostumer wajib diisi dan lebih dari 0.'
      isValid = false
    }

    if (Object.keys(rowErrors).length > 0) {
      errors.value[index] = rowErrors
    }
  })

  return isValid
}

interface costumer {
  id: number
  name: string
}

const customerOption = ref<costumer[]>([])
const SelectedCustomer = ref(0)
const fetchCustomer = async () => {
  try {
    const response = await daftar_kostumer()
    customerOption.value = [{ id: 0, name: ' -- Pilih Kostumer -- ' }, ...response.data]
  } catch (error) {
    console.error(error)
  }
}

interface cabang {
  id: number
  name: string
}
const cabangOption = ref<cabang[]>([])
const SelectedCabang = ref(0)
const fetchCabang = async () => {
  try {
    const response = await paramCabang()
    cabangOption.value = [{ id: 0, name: ' -- Pilih Cabang -- ' }, ...response.data]


    console.log("______________");
    console.log(cabangOption);
    console.log("______________");
  } catch (error) {
    console.error(error)
  }
}


interface option {
  id: number
  name: string
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

watch(
  () => props.isFormOpen,
  async (val) => {
    if( val ) {
      console.log("***********");
      console.log("***********");
      console.log("***********");

      await fetchCustomer()
      await fetchCabang()
      await fetchKota()
    }
  },
)

</script>

<template>
  <Form label="Tambah Transaksi Passport" :form-status="props.isFormOpen" :submitLabel="'TAMBAH TRANSAKSI'" :width="'w-2/3'" @cancel="handleCancel" @submit="handleSubmit">
    <div class="flex flex-wrap gap-4 pb-3 mb-5">
      <SelectField label="Cabang" v-model="SelectedCabang" :options="cabangOption" class="flex-1 min-w-[200px]"  @change="fetchSumberDanaPaket"  :error="errors.cabang"/>
      <SelectField label="Sumber Dana" v-model="SelectedSumberDana" :options="list_sumber_dana" class="flex-1 min-w-[200px]" />
      <SelectField label="Kostumer" v-model="SelectedCustomer" :options="customerOption" class="flex-1 min-w-[200px]" />
      <SelectField label="Paket" v-model="SelectedPaket" :options="list_paket" class="flex-1 min-w-[200px]" />
    </div>
    <table class="table-auto w-full">
      <thead class="bg-gray-100 text-sm text-gray-700">
        <tr class="text-center">
          <th class="w-[30%] px-4 font-medium py-3">Info Pelanggan</th>
          <th class="w-[30%] px-4 font-medium py-3">Info Alamat pelanggan</th>
          <th class="w-[30%] px-4 font-medium py-3">Biaya</th>
          <th class="w-[10%] px-4 font-medium py-3">Aksi</th>
        </tr>
      </thead>
      <tbody class="text-sm">
        <tr class="bg-white border-b" v-for="(form, index) in formList" :key="index">
          <td class="w-[30%] px-4 py-3">
            <InputText
              note="Nama Pelanggan"
              placeholder="Masukkan Nama Pelanggan"
              v-model="form.name"
              :error="errors[index]?.name"
            />
            <InputText
              note="Identitas Pelanggan"
              placeholder="Masukkan Identitas"
              v-model="form.identity"
              :error="errors[index]?.identity"
            />
            <InputText
              note="Nomor KK"
              placeholder="Masukkan Nomor KK"
              v-model="form.kkNumber"
              :error="errors[index]?.kkNumber"
            />
            <InputText
              note="Tempat Lahir"
              placeholder="Masukkan Tempat Lahir"
              v-model="form.birthPlace"
              :error="errors[index]?.birthPlace"
            />
            <InputDate
              note="Tanggal Lahir"
              v-model="form.birthDate"
              :error="errors[index]?.birthDate"
            />
          </td>
          <td class="w-[30%] px-4 py-3 align-top">
            <SelectField
              note="Nama Kota"
              placeholder="Pilih Kota"
              :options="cityOptions"
              v-model="form.cityId"
              optionLabel="name"
              optionValue="id"
              :error="errors[index]?.cityId"
            />
            <TextArea
              note="Alamat Pelanggan"
              placeholder="Masukkan Alamat"
              v-model="form.address"
              :error="errors[index]?.address"
            />
          </td>
          <td class="w-[30%] px-4 py-3 align-top">
            <InputText
              note="Harga Travel"
              placeholder="Masukkan Harga Travel"
              :model-value="formatRupiah(form.price)"
              @update:model-value="(val) => (form.price = parseRupiah(val))"
              :error="errors[index]?.price"
            />
            <InputText
              note="Harga Kostumer"
              placeholder="Masukkan Harga Kostumer"
              :model-value="formatRupiah(form.priceCostumer)"
              @update:model-value="(val) => (form.priceCostumer = parseRupiah(val))"
              :error="errors[index]?.priceCostumer"
            />
          </td>
          <td class="w-[10%] px-4 py-5 align-top text-gray-800 items-center">
            <DangerButton @click="formList.splice(index, 1)">
              <DeleteIcon />
            </DangerButton>
          </td>
        </tr>
      </tbody>
    </table>
    <div class="flex justify-end mt-4 pr-6">
      <PrimaryButton @click="addRow">+ Tambah Pelanggan</PrimaryButton>
    </div>
  </Form>
</template>
