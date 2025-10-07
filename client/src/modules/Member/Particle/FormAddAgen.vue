<template>
  <Form :form-status="showForm" :label="'Ubah Status Agen'" width="sm:w-full sm:max-w-md" @close="handleCancel" @cancel="handleCancel"  @submit="handleSubmit" :submitLabel="'JADIKAN AGEN'">
    <div class="grid grid-cols-1 md:grid-cols-1 gap-2 mb-0 ">
      <div class="mb-3">
        <label class="block text-sm font-medium text-gray-700">Nama Member</label>
        <input placeholder="Nama member" type="text" :value="form.name" disabled class="w-full mt-1 px-3 py-2 border rounded-lg bg-gray-100 text-gray-400" />
      </div>
      <div class="mb-3">
        <label class="block text-sm font-medium text-gray-700">Nomor Identitas</label>
        <input placeholder="Nama member" type="text" :value="form.identityNumber" disabled class="w-full mt-1 px-3 py-2 border rounded-lg bg-gray-100 text-gray-400" />
      </div>
        <SelectField v-model="form.upline_id" id="upline_id" label="Upline" placeholder="Pilih Upline" :error="errors.upline_id" :options="upline" />

        <SelectField v-model="form.level_id" id="level_id" label="Level Keagenan" placeholder="Pilih Level Cabang" :error="errors.level_id" :options="levelAgen" />
    </div>
  </Form>
  <!-- Notification Popup -->
  <Notification  :showNotification="showNotification"  :notificationType="notificationType" :notificationMessage="notificationMessage" @close="showNotification = false"  ></Notification>
</template>

<script setup lang="ts">
  import { defineProps, defineEmits, ref, watch } from 'vue'
  import { daftarLevelAgen, daftarUpline, makeAnAgen } from "@/service/member"
  import Form from "@/components/Modal/Form.vue"
  import Notification from "@/components/Modal/Notification.vue"
  import SelectField from "@/components/Form/SelectField.vue"
  // import Form from "@/components/Modal/Form.vue"

  interface Option {
    id: number
    name: string
  }

  interface ErrorFields {
    id: string;
    cabang_id: string;
    fullname: string;
    identity_number: string;
    identity_type: string;
    level_id: string;
    upline_id: string;
  }

  interface Option {
    id: number
    name: string
  }

  const levelAgen = ref<Option[]>([]);
  const upline = ref<Option[]>([]);

  // notification
  const showNotification = ref<boolean>(false);
  const notificationMessage = ref<string>('');
  const notificationType = ref<'success' | 'error'>('success');

  // ✅ Props dari parent
  const props = defineProps<{ showForm: boolean }>()

  const emit = defineEmits<{
    (e: 'save', data: FormData): void;
    (e: 'cancel'): void;
  }>();

  // ✅ Data form yang akan ditampilkan
  const form = ref({
    id: 0,
    name: '',
    identityNumber: '',
    level_id: 0,
    upline_id: 0
  })

  const errors = ref<ErrorFields>({
    id: '',
    cabang_id: '',
    fullname: '',
    identity_number: '',
    identity_type: '',
    level_id: '',
    upline_id: ''
  })

  const handleCancel = (): void => {
    emit('cancel')
    errors.value = {
      id: '',
      cabang_id: '',
      fullname: '',
      identity_number: '',
      identity_type: '',
      level_id: '',
      upline_id: ''
    };
  }

  const fetchLevelAgen = async () => {
    try {
      const response = await daftarLevelAgen()
      levelAgen.value = response.data
      form.value.id = props.memberId
      form.value.level_id= 0
      form.value.name= props.memberName
      form.value.identityNumber = props.memberIdentitas
    } catch (error) {
      console.error('Gagal fetch data level agen:', error)
    }
  }

  const fetchUpline = async ( id:number ) => {
    try {
      const response = await daftarUpline({ id: id})
      upline.value = response.data
    } catch (error) {
      console.error('Gagal fetch data level agen:', error)
    }
  }

  const displayNotification = (message: string, type: 'success' | 'error' = 'success') => {
    notificationMessage.value = message;
    notificationType.value = type;
    showNotification.value = true;

    window.setTimeout(() => {
      showNotification.value = false;
    }, 3000);
  };

  const validateForm = (): boolean => {

    errors.value = {
      id: '',
      cabang_id: '',
      fullname: '',
      identity_number: '',
      identity_type: '',
      level_id: '',
      upline_id: ''
    }

    let isValid = true

    if (form.value.level_id == 0) {
      errors.value.level_id = 'Silahkan pilih salah satu level agen'
      isValid = false
    }

    return isValid
  }

  const handleSubmit = async (): Promise<void> => {
    if (!validateForm()) {
      return
    }


    try {
      const response = await makeAnAgen({ id : form.value.id, level: form.value.level_id, upline: form.value.upline_id } );
      if(response.error) {
        displayNotification(response.error_msg, 'error');
      }else{
        displayNotification(response.error_msg, 'success');
      }
      emit('cancel')
    } catch (error) {
      console.error('Gagal menyimpan data member:', error)
    }
  }

  watch(
    () => props.showForm,
    (e) => {
      if(e == true ) {
        fetchLevelAgen();
        fetchUpline(props.memberId);
      }
    },
    { immediate: false },
  )
</script>
