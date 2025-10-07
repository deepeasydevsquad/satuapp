<template>
  <Form :form-status="showForm" :label="id === 0 ? 'Tambah Kas Keluar Masuk' : 'Edit Kas Keluar Masuk'" @close="handleCancel" @cancel="handleCancel" @submit="handleSubmit" width="sm:w-1/2 sm:max-w-1/2" :submitLabel="id === 0 ? 'TAMBAH KAS KELUAR MASUK' : 'PERBAHARUI KAS KELUAR MASUK'">
    <div class="grid grid-cols-1 md:grid-cols-1 gap-2 mb-6 ">
      <SelectField v-model="form.cabang" label="Cabang" placeholder="Pilih Salah Satu Cabang" :options="cabangList" class="mx-2" :error="errors.cabang"/>
    </div>
    <div class="grid grid-cols-2 md:grid-cols-2 gap-2 mb-6 ">
      <InputDateTimes v-model="form.tanggal_transaksi"  label="Tanggal Transaksi" id="tanggal_transaksi" placeholder="Tanggal Transaksi" class="mx-2" :error="errors.tanggal_transaksi"/>
      <InputText v-model="form.diterima_dibayar" label="Diterima Dari / Dibayar Kepada" id="diterima_dibayar" placeholder="Diterima Dari / Dibayar Kepada" class="mx-2" :error="errors.diterima_dibayar"/>
    </div>
    <div class="grid grid-cols-2 md:grid-cols-2 gap-2 mb-6 ">
      <TextArea v-model="form.ref" label="Ref" id="ref" placeholder="Ref" class="mx-2" :error="errors.ref"/>
      <TextArea v-model="form.keterangan" label="Keterangan" id="keterangan" placeholder="Keterangan" class="mx-2" :error="errors.keterangan"/>
    </div>
    <div class="space-y-4">
      <table class="w-full border-collapse bg-white text-left text-sm text-gray-500">
        <thead class="bg-gray-50">
          <tr>
            <th class="w-[33%] px-6 py-1 font-medium text-gray-900 text-center border">Akun Debet</th>
            <th class="w-[33%] px-6 py-1 font-medium text-gray-900 text-center border">Akun Kredit</th>
            <th class="w-[24%] px-6 py-1 font-medium text-gray-900 text-center border">Saldo</th>
            <th class="w-[10%] px-6 py-1 font-medium text-gray-900 text-center border">Aksi</th>
          </tr>
        </thead>
        <tbody>
          <template v-if="form.kasKeluarMasuk.length > 0 ">
            <tr v-for="(kk, index) in form.kasKeluarMasuk" :key="index">
              <td class="pt-3">
                <SelectField
                  label_status="false"
                  v-model="kk.akun_debet"
                  label="Akun Debet"
                  placeholder="Pilih Akun Debet"
                  :options="akunList"
                  class="mx-2"
                   :error="errors.kasKeluarMasuk?.[index]?.akun_debet"
                />
              </td>
              <td class="pt-3">
                 <SelectField
                  label_status="false"
                  v-model="kk.akun_kredit"
                  label="Akun Debet"
                  placeholder="Pilih Akun Debet"
                  :options="akunList"
                  class="mx-2"
                  :error="errors.kasKeluarMasuk?.[index]?.akun_kredit"
                />
              </td>
              <td class="pt-3">
                <InputText label="Tanggal Transaksi" id="tanggal_transaksi" placeholder="Tanggal Transaksi" class="mx-2" label_status="false" v-model="kk.saldo_display"  @input="(e) => updateHargaTravel(e, index)"
                  :error="errors.kasKeluarMasuk?.[index]?.saldo"
                  />
              </td>
              <td class="pt-3 text-center">
                <div class="flex justify-center">
                  <DangerButton @click="removeKasKeluarMasuk(index)" class="p-2 float-center"><DeleteIcon /></DangerButton>
                </div>

              </td>
            </tr>
          </template>
          <template v-else>
            <tr>
              <td colspan="4" class="text-center py-4">Daftar Akun Tidak Ditemukan.</td>
            </tr>
          </template>
        </tbody>
        <tfoot>
          <tr>
            <td colspan="4" class="text-right">
              <div class="flex justify-end pt-10">
                <PrimaryButtonLight @click="addRow()"><IconPlus /> Tambah Row</PrimaryButtonLight>
              </div>
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  </Form>
</template>
<script setup lang="ts">
  import { ref, watch } from 'vue'
  import { getAkun, addUpdateKasKeluarMasuk } from '@/service/kas_keluar_masuk'
  import { paramCabang  } from '@/service/param_cabang';
  import Form from "@/components/Modal/Form.vue"
  import InputText from "@/components/Form/InputText.vue"
  import InputDateTimes from "@/components/Form/InputDateTimes.vue"
  import SelectField from "@/components/Form/SelectField.vue"
  import TextArea from "@/components/Form/TextArea.vue"
  import IconPlus from '@/components/Icons/IconPlus.vue'
  import PrimaryButton from "@/components/Button/PrimaryButton.vue"
  import PrimaryButtonLight from "@/components/Button/PrimaryButtonLight.vue"
  import DangerButton from "@/components/Button/DangerButton.vue"
  import DeleteIcon from '@/components/Icons/DeleteIcon.vue'

  interface ErrorFields {
    cabang: string;
    tanggal_transaksi: string;
    diterima_dibayar: string
    ref: string
    keterangan: string,
    kasKeluarMasuk?: {
      akun_debet?: string
      akun_kredit?: string
      saldo?: string
    }[]
  }

  interface KasKeluarMasuk {
    akun_debet: string
    akun_kredit: string
    saldo: number
    saldo_display: string
  }

  interface FormData {
    id: number;
    cabang: string;
    tanggal_transaksi: string;
    diterima_dibayar: string
    ref: string
    keterangan: string
    kasKeluarMasuk: KasKeluarMasuk[]
  }

  const emit = defineEmits<{
    (e: 'save'): void
    (e: 'cancel'): void
  }>()

  const props = defineProps<{ showForm: boolean, id?: number }>()

  const errors = ref<ErrorFields>({
    cabang: '',
    tanggal_transaksi: '',
    diterima_dibayar: '',
    ref: '',
    keterangan: '',
    kasKeluarMasuk: []
  })

  const handleCancel = (): void => {

    createEmptyForm()
    createEmptyError()

    emit('cancel')
  }

  const validateForm = (): boolean => {
    let isValid = true

    // mengkosongkan error message
    createEmptyError()

    // Validate customer fields
    if (form.value.cabang == '0') {
      errors.value.cabang = 'Anda wajib memilih salah satu cabang'
      isValid = false
    }

    if (!form.value.tanggal_transaksi.trim()) {
      errors.value.tanggal_transaksi = 'Tanggal Transaksi wajib diisi'
      isValid = false
    }

    if (!form.value.diterima_dibayar.trim()) {
      errors.value.diterima_dibayar = 'Penerima / Pemberi wajib diisi'
      isValid = false
    }

    if (!form.value.ref.trim()) {
      errors.value.ref = 'Kolom Ref wajib diisi'
      isValid = false
    }

    if (!form.value.keterangan.trim()) {
      errors.value.keterangan = 'Kolom Keterangan wajib diisi'
      isValid = false
    }

    // // Validate each ticket row
    form.value.kasKeluarMasuk.forEach((kasKasKeluar, index) => {
      const kasKeluarMasukErrors: ErrorFields['kasKeluarMasuk'][0] = {}

      if( kasKasKeluar.akun_debet != '0' && kasKasKeluar.akun_kredit != '0' && kasKasKeluar.akun_debet == kasKasKeluar.akun_kredit) {
        kasKeluarMasukErrors.akun_debet = 'Akun Debet tidak boleh sama dengan Akun Kredit.'
        kasKeluarMasukErrors.akun_kredit = 'Akun Kredit tidak boleh sama dengan Akun Debet.'
      }

      if (!kasKasKeluar.akun_debet || kasKasKeluar.akun_debet == '0') {
        kasKeluarMasukErrors.akun_debet = 'Anda wajib memilih salah satu Akun Debet.'
        isValid = false
      }

      if (!kasKasKeluar.akun_kredit || kasKasKeluar.akun_kredit == '0') {
        kasKeluarMasukErrors.akun_kredit = 'Anda wajib memilih salah satu Akun Kredit.'
        isValid = false
      }

      if (!kasKasKeluar.saldo || kasKasKeluar.saldo == 0) {
        kasKeluarMasukErrors.saldo = 'Saldo wajib diinput.'
        isValid = false
      }

      errors.value.kasKeluarMasuk![index] = kasKeluarMasukErrors
    })

  return isValid
}

  const handleSubmit = async (): Promise<void> => {
    if (!validateForm()) {
      return
    }

    try {
      const formData = new FormData()
      if (form.value.id) {
        formData.append('id', form.value.id)
      }
      formData.append('cabang', form.value.cabang)
      formData.append('tanggal_transaksi', form.value.tanggal_transaksi)
      formData.append('diterima_dibayar', form.value.diterima_dibayar)
      formData.append('ref', form.value.ref)
      formData.append('keterangan', form.value.keterangan)
      formData.append('kaskeluarmasuk',  JSON.stringify(form.value.kasKeluarMasuk))

      for (let pair of formData.entries()) {
        console.log(pair[0] + ': ' + pair[1])
      }

      const response = await addUpdateKasKeluarMasuk(formData);

      const printUrl = `/invoice-kas-keluar-masuk/${response.data}`
      window.open(printUrl, '_blank')

      emit('save')
    } catch (error) {
      emit('cancel')
      console.error('Gagal menyimpan data member:', error)
    }

    createEmptyForm()
    createEmptyError()
  }

  const form = ref<FormData>({
    id: 0,
    cabang: '0',
    tanggal_transaksi: '',
    diterima_dibayar: '',
    ref: '',
    keterangan: '',
    kasKeluarMasuk: [
      {
        akun_debet: "0",
        akun_kredit: "0",
        saldo: 0,
        saldo_display: 'Rp 0'
      }
    ]
  })

  interface Akuns {
    id: number
    name: string
  }

  interface AkunsBE {
    id: number
    name: string
    akun_primary_id: string
  }

  interface Cabang {
  id: number;
  name: string;
}

  const akunList = ref<Akuns[]>([])
  const akunBEList = ref<AkunsBE[]>([])
  const cabangList = ref<Cabang[]>([])

  const addRow = () => {
    form.value.kasKeluarMasuk.push(createEmptyKasKeluarMasuk())
  }

  function updateHargaTravel(e: any, index: any) {
    const raw = e.target.value.replace(/[^\d]/g, '')
    const formatted = dinamicformatRupiah(raw)
    form.value.kasKeluarMasuk[index].saldo = parseInt(raw) || 0
    form.value.kasKeluarMasuk[index].saldo_display = formatted
  }

  function dinamicformatRupiah(value: any) {
    const angka = parseInt(value || '0')
    const currency = new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(angka)
    return currency
  }


  function createEmptyKasKeluarMasuk(): KasKeluarMasuk {
    return {
        akun_debet: "0",
        akun_kredit: "0",
        saldo: 0,
        saldo_display: 'Rp 0'
      }
  }

  function createEmptyForm() {
    form.value = {
      id: 0,
      cabang: '0',
      tanggal_transaksi: '',
      diterima_dibayar: '',
      ref: '',
      keterangan: '',
      kasKeluarMasuk: [
        {
          akun_debet: "0",
          akun_kredit: "0",
          saldo: 0,
          saldo_display: 'Rp 0'
        }
      ]
    }
  }

  function createEmptyError() {
     errors.value = {
      cabang: '',
      tanggal_transaksi: '',
      diterima_dibayar: '',
      ref: '',
      keterangan: '',
      kasKeluarMasuk: []
    }
  }

  function removeKasKeluarMasuk(index: number) {
    form.value.kasKeluarMasuk.splice(index, 1)
  }

  const fetchData = async () => {
    try {
      const responseA = await getAkun()
      const responseC = await paramCabang();
      akunList.value = responseA.data;
      akunBEList.value = responseA.data;
      // cabangList.value = responseC.data;

      cabangList.value = [
        { id: '0', name: 'Pilih Salah Satu Cabang' },
        ...responseC.data.map((item: any) => ({
          id: item.id,
          name: `${item.name}`,
        }))
      ];
    } catch (error) {
      console.error('Gagal fetch data ticket transactions:', error)
    }
  }

  watch(
    () => props.showForm,
    async (val) => {
      if (val) {
        fetchData();
      }
    },
  )
</script>
