<template>
  <Form
    :form-status="showForm"
    :label="form.id === 0 ? 'Tambah Member' : 'Edit Member'"
    @close="handleCancel"
    @cancel="handleCancel"
    @submit="handleSubmit"
    width="sm:w-full sm:max-w-xl"
    :submitLabel="form.id === 0 ? 'TAMBAH MEMBER' : 'PERBAHARUI MEMBER'"
  >
    <div class="grid grid-cols-1 md:grid-cols-1 gap-2 mb-6">
      <SelectField
        v-model="form.cabang_id"
        id="cabang"
        label="Cabang"
        placeholder="Pilih Cabang"
        :error="errors.cabang_id"
        :options="cabangs"
      />
    </div>
    <div class="grid grid-cols-1 md:grid-cols-1 gap-2 mb-6">
      <InputFile
        label="Upload Photo Member"
        id="photo-upload"
        :error="errors.photo"
        @file-selected="handleFileUpload"
        accept=".jpg,.jpeg,.png"
      />
    </div>
    <div class="grid grid-cols-1 md:grid-cols-1 gap-2 mb-6">
      <InputText
        v-model="form.name"
        label="Name Member"
        id="name"
        :error="errors.name"
        placeholder="Name Member"
      />
    </div>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
      <!-- Nomor Identitas -->
      <InputText
        v-model="form.identityNumber"
        label="Nomor Identitas"
        id="identity-number"
        :error="errors.identityNumber"
        placeholder="Nomor Identitas"
      />
      <!-- Gender -->
      <SelectField
        v-model="form.gender"
        id="gender"
        label="Jenis Kelamin"
        placeholder="Pilih Jenis Kelamin"
        :error="errors.gender"
        :options="[
          { id: '0', name: 'Pilih Gender' },
          { id: 'laki_laki', name: 'Laki-laki' },
          { id: 'perempuan', name: 'Perempuan' },
        ]"
      />
      <!-- Tempat Lahir -->
      <InputText
        v-model="form.birthplace"
        label="Tempat Lahir"
        id="birthplace"
        :error="errors.birthplace"
        placeholder="Tempat Lahir"
      />
      <!-- Tanggal Lahir -->
      <InputDate
        v-model="form.birthdate"
        id="birthdate"
        label="Tanggal Lahir"
        :error="errors.birthdate"
      />
    </div>
    <!-- Email and WhatsApp -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
      <!-- Jenis Identitas -->
      <SelectField
        v-model="form.identityType"
        id="tipe-identitas"
        label="Jenis Identitas"
        placeholder="Pilih Jenis Identitas"
        :error="errors.identityType"
        :options="[
          { id: '0', name: 'Identitas' },
          { id: 'ktp', name: 'KTP' },
          { id: 'passport', name: 'PASSPORT' },
        ]"
      />
      <!-- Nomor Whatsapp -->
      <InputText
        v-model="form.whatsapp"
        label="Nomor Whatsapp"
        id="whatsapp"
        :error="errors.whatsapp"
        placeholder="Nomor Whatsapp"
        note="Pastikan nomor yang terdaftar adalah nomor Whatsapp yang aktif. Nomor ini akan digunakan untuk menerima OTP."
      />
    </div>
    <!-- Password dan Konfirmasi -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
      <!-- Password -->
      <InputPassword
        v-model="form.password"
        id="password"
        label="Password"
        placeholder="Password"
        :error="errors.password"
        note="Password hanya terdiri dari alpha numeric"
      />
      <!-- Password Konfirmasi -->
      <InputPassword
        v-model="form.confirmPassword"
        id="confirm-password"
        label="Password Konfirmasi"
        placeholder="Password Konfirmasi"
        :error="errors.confirmPassword"
        note="Pastikan Password Konfirmasi sama dengan Password."
      />
    </div>
  </Form>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { addMember, editMember } from '@/service/member';
import InputText from '@/components/Form/InputText.vue';
import SelectField from '@/components/Form/SelectField.vue';
import InputDate from '@/components/Form/InputDate.vue';
import Form from '@/components/Modal/Form.vue';
import InputFile from '@/components/Form/InputFile.vue';
import InputPassword from '@/components/Form/InputPassword.vue';

interface Member {
  id: number;
  cabang_id: number;
  fullname: string;
  identity_number: string;
  identity_type: string;
  gender: string;
  whatsapp_number: string;
  birth_date: string;
  birth_place: string;
  tipe: string;
}

// Definisikan tipe untuk cabang
interface Cabang {
  id: number;
  name: string;
}

// Definisikan tipe untuk form yang sesuai dengan semua field di template
interface FormData {
  id: number;
  name: string;
  identityNumber: string;
  identityType: string;
  gender: string;
  birthplace: string;
  birthdate: string;
  whatsapp: string;
  password: string;
  confirmPassword: string;
  cabang_id?: number; // Menggunakan ID cabang, bukan nama cabang
  photo?: File;
}

// Definisikan tipe untuk error validasi
interface ErrorFields {
  name?: string;
  identityNumber?: string;
  identityType: string;
  gender?: string;
  birthplace?: string;
  birthdate?: string;
  whatsapp?: string;
  password?: string;
  confirmPassword?: string;
  cabang_id?: string;
  photo?: string;
  bank: string;
}

const props = defineProps<{
  showForm: boolean;
  cabangs: Cabang[];
  formData: Member;
  types: string;
}>();

const emit = defineEmits<{
  (e: 'save', data: FormData): void;
  (e: 'cancel'): void;
}>();

const fileName = ref<string>('');
const errors = ref<ErrorFields>({
  name: '',
  identityNumber: '',
  identityType: '',
  gender: '',
  birthplace: '',
  birthdate: '',
  whatsapp: '',
  password: '',
  confirmPassword: '',
  cabang_id: '',
  photo: '',
  bank: '',
});

// Data form dengan semua field yang digunakan di template
const form = ref<FormData>({
  id: 0,
  name: '',
  identityNumber: '',
  identityType: '0',
  gender: '0',
  birthplace: '',
  birthdate: '',
  whatsapp: '',
  password: '',
  confirmPassword: '',
  cabang_id: 0,
});

// Handle file upload
const handleFileUpload = (event: Event): void => {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files.length > 0) {
    const file = input.files[0];

    // Validasi jenis file
    if (!['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) {
      errors.value.photo = 'File harus berupa JPG, JPEG, atau PNG';
      fileName.value = '';
      return;
    }

    // Validasi ukuran file (600KB = 614400 bytes)
    if (file.size > 614400) {
      errors.value.photo = 'Ukuran file maksimum 600KB';
      fileName.value = '';
      return;
    }

    fileName.value = file.name;
    form.value.photo = file;
    errors.value.photo = undefined;
  }
};

// Validasi form
const validateForm = (): boolean => {
  errors.value = {
    name: '',
    identityNumber: '',
    identityType: '',
    gender: '',
    birthplace: '',
    birthdate: '',
    whatsapp: '',
    password: '',
    confirmPassword: '',
    cabang_id: '',
    photo: '',
    bank: '',
  };

  let isValid = true;

  // Validasi nama
  if (!form.value.name.trim()) {
    errors.value.name = 'Nama tidak boleh kosong';
    isValid = false;
  }

  // Validasi nomor identitas
  if (!form.value.identityNumber.trim()) {
    errors.value.identityNumber = 'Nomor identitas tidak boleh kosong';
    isValid = false;
  }

  console.log('+++++++++++++');
  console.log(form.value.identityType);
  console.log(typeof form.value.identityType);
  console.log('+++++++++++++');

  if (form.value.cabang_id == 0) {
    errors.value.cabang_id = 'Silahkan pilih salah satu cabang';
    isValid = false;
  }

  // Validasi tipe identitas
  if (form.value.identityType == '0') {
    errors.value.identityType = 'Silahkan pilih salah satu jenis identitas';
    isValid = false;
  }

  // Validasi jenis kelamin
  if (form.value.gender == '0') {
    errors.value.gender = 'Silakan pilih salah satu jenis kelamin';
    isValid = false;
  }

  // Validasi tempat lahir
  if (!form.value.birthplace.trim()) {
    errors.value.birthplace = 'Tempat lahir tidak boleh kosong';
    isValid = false;
  }

  // Validasi tanggal lahir
  if (!form.value.birthdate) {
    errors.value.birthdate = 'Tanggal lahir tidak boleh kosong';
    isValid = false;
  }

  // Validasi nomor WhatsApp
  if (!form.value.whatsapp.trim()) {
    errors.value.whatsapp = 'Nomor WhatsApp tidak boleh kosong';
    isValid = false;
  } else if (!/^\d+$/.test(form.value.whatsapp)) {
    errors.value.whatsapp = 'Nomor WhatsApp harus berupa angka';
    isValid = false;
  }

  if (!form.value.id) {
    // Validasi password
    if (!form.value.password) {
      errors.value.password = 'Password tidak boleh kosong';
      isValid = false;
    } else if (!/^[a-zA-Z0-9]+$/.test(form.value.password)) {
      errors.value.password = 'Password hanya boleh berisi alpha numeric';
      isValid = false;
    } else if (form.value.password.length < 6) {
      errors.value.password = 'Password minimal 6 karakter';
      isValid = false;
    }

    // Validasi konfirmasi password
    if (!form.value.confirmPassword) {
      errors.value.confirmPassword = 'Konfirmasi password tidak boleh kosong';
      isValid = false;
    } else if (form.value.password !== form.value.confirmPassword) {
      errors.value.confirmPassword = 'Konfirmasi password tidak cocok';
      isValid = false;
    }
  } else {
    if (form.value.password !== form.value.confirmPassword) {
      errors.value.confirmPassword = 'Konfirmasi password tidak cocok';
      isValid = false;
    }
  }

  return isValid;
};

const handleSubmit = async (): Promise<void> => {
  if (!validateForm()) {
    return;
  }

  try {
    const memberData = new FormData();
    if (form.value.id) {
      memberData.append('id', form.value.id.toString());
    }
    memberData.append('fullname', form.value.name);
    memberData.append('identity_number', form.value.identityNumber);
    memberData.append('identity_type', form.value.identityType);
    memberData.append('gender', form.value.gender);
    memberData.append('birth_place', form.value.birthplace);
    memberData.append('birth_date', form.value.birthdate);
    memberData.append('whatsapp_number', form.value.whatsapp);
    memberData.append('password', form.value.password);
    if (form.value.cabang_id) {
      memberData.append('division_id', form.value.cabang_id.toString());
    }
    if (form.value.photo) {
      memberData.append('photo', form.value.photo);
    }

    console.log('-----------------1');
    console.log(form.value.id);
    console.log('-----------------1');
    if (form.value.id) {
      await editMember(memberData);
    } else {
      await addMember(memberData);
    }

    emit('save', form.value);

    // Emit event biar form tertutup
    emit('cancel');
  } catch (error) {
    console.error('Gagal menyimpan data member:', error);
  }
};

// Fungsi untuk membatalkan dan menutup form
const handleCancel = (): void => {
  emit('cancel');
  errors.value = {
    name: '',
    identityNumber: '',
    identityType: '',
    gender: '',
    birthplace: '',
    birthdate: '',
    whatsapp: '',
    password: '',
    confirmPassword: '',
    cabang_id: '',
    photo: '',
    bank: '',
  };
};

watch(
  () => props.formData,
  (e) => {
    if (e) {
      // if( e.id != 0 ) {
      console.log('---e.cabang_id');
      console.log(e);
      console.log(props.formData);
      console.log('---e.cabang_id');
      form.value.id = e.id;
      form.value.name = e.fullname;
      form.value.cabang_id = e.cabang_id;
      form.value.identityNumber = e.identity_number;
      form.value.identityType = e.identity_type;
      form.value.gender = e.gender;
      form.value.whatsapp = e.whatsapp_number;
      form.value.birthdate = e.birth_date;
      form.value.birthplace = e.birth_place;
      // }else{
      //   form.value.cabang_id = 0
      // }
    }
  },
  { immediate: true },
);
</script>
