<script setup lang="ts">
import { ref, watch, defineProps, defineEmits } from 'vue'
import { getAllHotels, getAllJamaah, createKamar, getKamarById, updateKamar } from '@/service/kamar_paket'
import Form from "@/components/Modal/Form.vue"
import alertify from 'alertifyjs'

const props = defineProps<{
  id:number
  isFormOpen: boolean
  cabangId: number
  paketId: number
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'save-success', message: string): void
  (e: 'show-notification', message: string, type: 'success' | 'error'): void
}>()

interface Hotel {
  id: number;
  name: string
}

interface Jamaah {
  id: number;
  fullname: string;
  identity_number: string
}

interface JamaahId {
  id: number
}

interface Form {
  id:number
  hotel_id: number | null;
  tipe_kamar: string
  kapasitas_kamar: number
  jamaah_ids: JamaahId[]
}

const hotelList = ref<Hotel[]>([])
const jamaahList = ref<Jamaah[]>([])
const isLoading = ref(false)
const ErrorsMessage = ref<Record<string, string>>({})
const formData = ref<Form>({
  id: 0,
  hotel_id: null,
  tipe_kamar: 'laki_laki',
  kapasitas_kamar: 0,
  jamaah_ids: [{ id: 0 }]
});

const fetchData = async () => {
  try {
    var payload = {};
    if(props.id != 0) {
      const resp = await getKamarById(props.id);
      formData.value = resp.data
      payload = { id: props.id, division_id: props.cabangId, paket_id: props.paketId }
    }else{
      formData.value = {
        id: 0,
        hotel_id: null,
        tipe_kamar: 'laki_laki',
        kapasitas_kamar: 0,
        jamaah_ids: [{
          id: 0,
        }]
      }
      payload = { division_id: props.cabangId, paket_id: props.paketId }
    }
    const responseHotel = await getAllHotels({ division_id: props.cabangId });
    const responseJamaah = await getAllJamaah(payload);
    hotelList.value = responseHotel.data;
    jamaahList.value = [{ id: 0, fullname: 'Pilih Jamaah', identity_number: '' }, ...responseJamaah?.data];
  } catch (error) {
    console.error('Gagal fetch data ticket transactions:', error)
  }
}

const addRow = () => {
  formData.value.jamaah_ids.push(createEmptyJamaah())
}

function removeJamaah(index: number) {
  if( formData.value.jamaah_ids.length == 1) {
    alertify.error('Anda wajib memilih salah satu jamaah.')
  }else{
    formData.value.jamaah_ids.splice(index, 1)
  }
}

function createEmptyJamaah(): Jamaah {
  return  {
    id: 0,
    fullname: '',
    identity_number : ''
  }
}

const handleCancel = (): void => {
  formData.value = {
    id: 0,
    hotel_id: null,
    tipe_kamar: 'laki_laki',
    kapasitas_kamar: 0,
    jamaah_ids: [{
      id: 0,
    }]
  };
  emit('close')
  ErrorsMessage.value = {}
}

const validateForm = (): boolean => {
  const tipeKamar = ['laki_laki', 'perempuan'];
  let isValid = true
  ErrorsMessage.value = {};

  if( formData.value.hotel_id == null ) {
    ErrorsMessage.value.name = 'Anda wajib memilih salah satu hotel.'
    isValid = false
  }
  if( !tipeKamar.includes(formData.value.tipe_kamar) ) {
    ErrorsMessage.value.name = 'Tipe kamar tidak ditemukan.'
    isValid = false
  }
  if( formData.value.kapasitas_kamar == 0 ) {
    ErrorsMessage.value.name = 'Kapasitas kamar tidak boleh 0.'
    isValid = false
  }
  if( formData.value.jamaah_ids.length == 0 ) {
    ErrorsMessage.value.name = 'Anda wajib memilih salah satu jamaah.'
    isValid = false
  }
  var listJ = [];
  for( let x in  formData.value.jamaah_ids ) {
    if( formData.value.jamaah_ids[x].id != 0 ) {
      if(listJ.includes(formData.value.jamaah_ids[x].id) ) {
        ErrorsMessage.value[formData.value.jamaah_ids[x].id]= 'Anda tidak boleh memilih nama yang sama dalam satu kamar.'
        isValid = false
      }else{
        listJ.push(formData.value.jamaah_ids[x].id)
      }
    }else{
      ErrorsMessage.value.name = 'Anda wajib memilih salah satu nama jamaah.'
      isValid = false
    }
  }
  return isValid
}

const handleSubmit = async () => {
  if (!validateForm()) {
    for( let x in ErrorsMessage.value) { alertify.error(ErrorsMessage.value[x]) }
    return
  }

  try {
    const payload = {
      ...formData.value,
      division_id: props.cabangId,
      paketId: props.paketId,
      jamaah_ids: formData.value.jamaah_ids.map((j) => j.id).filter((id) => id !== null),
    }

    if( props.id != 0 ) {
      await updateKamar(props.id, payload)
      emit('save-success', 'Data kamar berhasil diperbaharui.')
    }else{
      await createKamar(payload)
      emit('save-success', 'Data kamar berhasil ditambahkan.')
    }
    emit('close')
  } catch (error: any) {
    if (error.response && error.response.status === 400) {
      alertify.error(error.response.data.message)
    } else {
      const errorMessage = error.response?.data?.message || 'Terjadi kesalahan saat menyimpan data.'
      emit('show-notification', errorMessage, 'error')
    }
  } finally {
    isLoading.value = false
  }
}

watch(
  () => props.isFormOpen,
  (e) => {
    fetchData();
  },
)

</script>
<template>
  <Form :form-status="isFormOpen" :label="formData.id === 0 ? 'Tambah Kamar' : 'Edit Kamar'" @close="handleCancel" @cancel="handleCancel" @submit="handleSubmit" width="sm:w-full sm:max-w-xl" :submitLabel="formData.id === 0 ? 'TAMBAH KAMAR' : 'PERBAHARUI KAMAR'">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label for="hotel" class="block text-sm font-medium text-black mb-1">Nama Hotel</label>
        <select id="hotel" v-model="formData.hotel_id" class="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-black" >
          <option :value="null" disabled>Pilih Hotel</option>
          <option v-for="hotel in hotelList" :key="hotel.id" :value="hotel.id">{{ hotel.name }}</option>
        </select>
      </div>
      <div>
        <label for="tipe-kamar" class="block text-sm font-medium text-black mb-1">Tipe Kamar</label>
        <select id="tipe-kamar" v-model="formData.tipe_kamar"
          class="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-black" >
          <option v-for="(v, index) in { 'laki_laki': 'Laki-laki', 'perempuan': 'Perempuan'}" :key="index" :value="index">{{ v }}</option>
        </select>
      </div>
      <div>
        <label for="kapasitas" class="block text-sm font-medium text-black mb-1" >Kapasitas Kamar</label >
        <input type="number" id="kapasitas" v-model="formData.kapasitas_kamar" min="1" class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-black" />
      </div>
      <div class="md:col-span-2">
        <label class="block text-sm font-medium text-black mb-1">Daftar Jamaah</label>
        <div v-for="(jamaah, index) in formData.jamaah_ids" :key="index" class="flex items-center gap-2 mb-2" >
          <select v-model="jamaah.id" class="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-black" >
            <option v-for="(j, index) in jamaahList" :key="j.id" :value="j.id">
              {{ j.fullname }}
              <template v-if="j.id != 0">
                ({{ j.identity_number }})
              </template>
            </option>
          </select>
          <button type="button" @click="removeJamaah(index)" class="p-2 text-red-500 hover:text-red-700 text-2xl" title="Hapus Jamaah" >
            &times;
          </button>
        </div>
        <button type="button" @click="addRow"
          class="w-full mt-2 px-4 py-2 border border-dashed border-gray-300 text-sm font-medium rounded-md text-black hover:bg-gray-50" >
          + Tambah Jamaah
        </button>
      </div>
    </div>
  </Form>
</template>
