<script setup lang="ts">
  import { ref, watch, computed } from 'vue'
  import { get_info_add_deposit, add_deposit_maskapai } from '@/service/riwayat_deposit_maskapai'
  import { paramCabang } from '@/service/param_cabang'
  import InputText from "@/components/Form/InputText.vue"
  import SelectField from "@/components/Form/SelectField.vue"
  import Form from "@/components/Modal/Form.vue"
  import Notification from '@/components/Modal/Notification.vue'
  import alertify from 'alertifyjs'

  const props = defineProps<{ showForm: boolean  }>()
  const emit = defineEmits<{
    (e: 'cancel'): void
  }>()
  const errors = ref<Record<string, string>>({})

  interface Options {
    id: number
    name: string
  }

  const optionSumberDana = ref<Options[]>([{ id: 0, name: '-- Pilih Sumber Dana --' }])
  const optionMaskapai = ref<Options[]>([{id: 0, name: '-- Pilih Maskapai --' }])
  const showNotification = ref(false)
  const notificationMessage = ref('')
  const notificationType = ref<'success' | 'error'>('success')
  const timeoutId = ref<number | null>(null)
  const searchTimeout = ref<number | null>(null)

  interface FormData {
    cabang:number,
    sumber_dana:number,
    mst_airline_id: number,
    deposit: number,
  }

  const form = ref<FormData>({
    cabang: 0,
    sumber_dana: 0,
    mst_airline_id: 0,
    deposit: 0,
  })

  const validateForm = (): boolean => {
    let isValid = true;
    errors.value = {};

    if (form.value.cabang === 0) {
      errors.value.cabang = 'Cabang harus dipilih';
      isValid = false;
    }

    if (form.value.mst_airline_id === 0) {
      errors.value.maskapai = 'Maskapai harus dipilih';
      isValid = false;
    }

    if (form.value.deposit <= 0) {
      errors.value.deposit = 'Deposit harus lebih dari 0';
      isValid = false;
    }
    return isValid;
  }

  const handleSubmit = async (): Promise<void> => {
    if (!validateForm()) {
      for( let x in form.value) { alertify.error(errors.value[x]) }
      return
    }

    try {
      const payload = {
        cabang: form.value.cabang,
        sumber_dana: form.value.sumber_dana,
        mst_airline_id: form.value.mst_airline_id,
        deposit: form.value.deposit,
      }
      await add_deposit_maskapai(payload)
      displayNotification('Deposit berhasil dilakukan.', 'success');
      resetForm();
      emit('cancel')
    } catch (error: any) {
      displayNotification(error.response.data.message, 'error');
    }
  }

  const resetForm = async () => {
    form.value = { cabang: 0, sumber_dana: 0, mst_airline_id: 0, deposit: 0, };
  }

  const handleCancel = (): void => {
    form.value = { cabang: 0, sumber_dana: 0, mst_airline_id: 0, deposit: 0};
    optionSumberDana.value = [{ id: 0, name: '-- Pilih Sumber Dana --' }];
    optionMaskapai.value = [{ id: 0, name: '-- Pilih Maskapai --' }];
    emit('cancel')
    errors.value = {};
  }

  interface cabang {
    id: number
    name: string
  }

  const cabangOption = ref<cabang[]>([{ id: 0, name: '-- Pilih Cabang --' }])
  const fetchCabang = async () => {
    try {
      const response = await paramCabang()
      cabangOption.value = [{ id: 0, name: '-- Pilih Cabang --' }, ...response.data]
    } catch (error) {
      console.error(error)
    }
  }

  const fetchData = async () => {
    try {
      if( form.value.cabang != 0 ) {
        const response = await get_info_add_deposit({ cabang:form.value.cabang });
        optionSumberDana.value = response.data.sumber_dana;
        optionMaskapai.value = [
          { id: 0, name: '-- Pilih Maskapai --' },
          ...response.data.list_maskapai,
        ] ;
      }else{
        optionSumberDana.value = [{ id: 0, name: '-- Pilih Sumber Dana --' },];
        optionMaskapai.value = [{ id: 0, name: '-- Pilih Maskapai --' },] ;
        form.value.sumber_dana = 0;
        form.value.mst_airline_id = 0;
      }
    } catch (error) {
      displayNotification('Terjadi kesalahan saat mengambil data.', 'error');
    }
  }

  const displayNotification = (message: string, type: 'success' | 'error' = 'success') => {
    notificationMessage.value = message
    notificationType.value = type
    showNotification.value = true

    if (timeoutId.value) clearTimeout(timeoutId.value)

    timeoutId.value = window.setTimeout(() => {
      showNotification.value = false
    }, 3000)
  }

  const computedNominal = computed({
    get() {
      return form.value.deposit
        ? 'Rp ' + form.value.deposit.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
        : ''
    },
    set(value: string) {
      const clean = value.replace(/[^\d]/g, '')
      form.value.deposit = Number(clean)
    },
  })

  watch(() => props.showForm,
    (e) => {
      if (e) {
        fetchCabang()
      }
    },
    { immediate: true }
  );

</script>
<template>
  <Form :form-status="showForm" :label="'Tambah Deposit Maskapai'" @close="handleCancel" @cancel="handleCancel" @submit="handleSubmit" width="sm:w-full sm:max-w-lg" :submitLabel="'TAMBAH DEPOSIT'">
    <div class="grid grid-cols-1 md:grid-cols-1 gap-2 mb-3 ">
      <SelectField v-model="form.cabang" id="cabang" label="Cabang" placeholder="Pilih Cabang" :error="errors.cabang" :options="cabangOption" @change="fetchData"/>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-1 gap-2 mb-3 ">
      <SelectField v-model="form.sumber_dana" id="sumber_dana" label="Sumber  Dana" placeholder="Pilih Sumber Dana" :error="errors.sumber_dana" :options="optionSumberDana" />
    </div>
    <div class="grid grid-cols-1 md:grid-cols-1 gap-2 mb-3 ">
      <SelectField v-model="form.mst_airline_id" id="maskapai" label="Daftar Maskapai" placeholder="Pilih Maskapai" :error="errors.maskapai" :options="optionMaskapai" />
    </div>
    <div class="grid grid-cols-1 md:grid-cols-1 gap-2 mb- ">
      <InputText v-model="computedNominal" label="Biaya Deposit (Rp)" placeholder="Masukkan nominal" :error="errors['deposit']" :note="'Minimal deposit Rp1.000'" required />
    </div>
  </Form>
  <!-- Notification Popup -->
  <Notification :showNotification="showNotification" :notificationType="notificationType" :notificationMessage="notificationMessage" @closeNotification="showNotification = false" />
</template>
