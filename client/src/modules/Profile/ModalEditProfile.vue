<script setup lang="ts">
import { ref, onMounted, reactive, watch } from 'vue'
import FormEditProfile from '@/components/Modal/FormEditProfile.vue'
import InputText from '@/components/Form/InputText.vue'
import { getProfile } from '@/service/profile'
import { updateProfile, changePassword } from '@/service/profile'

const profileData = ref<any>(null)
const loading = ref(true)
const error = ref('')
const activeMenu = ref<'informasi' | 'password'>('informasi')

const formData = reactive({
  nama: '',
  username: '',
  email: '',
  whatsapp: '',
})

const passwordData = reactive({
  old_password: '',
  new_password: '',
  confirm_password: '',
})

const fetchProfile = async () => {
  loading.value = true
  try {
    const response = await getProfile()
    profileData.value = response.data

    // ✅ Cek apakah ini administrator atau staff
    if (response.data.company_name) {
      // ADMINISTRATOR
      formData.nama = response.data.company_name || ''
      formData.username = response.data.username || ''
      formData.email = response.data.email || ''
      formData.whatsapp = response.data.whatsapp_company_number || ''
    } else {
      // STAFF
      formData.nama = response.data.fullname || ''
      formData.username = response.data.username || ''
      formData.email = response.data.email || ''
      formData.whatsapp = response.data.whatsapp_number || ''
    }
  } catch (err) {
    error.value = 'Gagal memuat profil.'
    console.error(err)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  console.log("AAAAAA");
  fetchProfile()
})

const props = defineProps<{
  formStatus: boolean
}>()

const emit = defineEmits<{
  (e: 'cancel'): void
  (e: 'submitted'): void
  (e: 'notify', payload: { type: 'success' | 'error'; message: string }): void
}>()

// FIXED versi akhir recommended
function submit() {
  if (activeMenu.value === 'informasi') {
    const payload = profileData.value?.company_name
      ? {
          company_name: formData.nama,
          username: formData.username,
          email: formData.email,
          whatsapp_company_number: formData.whatsapp,
        }
      : {
          fullname: formData.nama,
          username: formData.username,
          email: formData.email,
          whatsapp_number: formData.whatsapp,
        }

    updateProfile(payload)
      .then(() => {
        emit('notify', { type: 'success', message: 'Profil berhasil diperbarui.' })
        emit('submitted')
      })
      .catch(() => {
        emit('notify', { type: 'error', message: 'Gagal memperbarui profil.' })
      })
  } else {
    const payload = {
      currentPassword: passwordData.old_password,
      newPassword: passwordData.new_password,
      confirmPassword: passwordData.confirm_password,
    }

    changePassword(payload)
      .then(() => {
        emit('notify', { type: 'success', message: 'Password berhasil diganti.' })
        emit('submitted')
      })
      .catch(() => {
        emit('notify', { type: 'error', message: 'Gagal mengganti password.' })
      })
  }
}
</script>
<template>
  <FormEditProfile
    :formStatus="props.formStatus"
    label="Edit Profile"
    submitLabel="Simpan"
    width="w-3/5"
    @cancel="emit('cancel')"
    @submit="submit"
  >
    <div class="flex gap-6">
      <!-- Sidebar -->
      <div class="w-1/3 border-r pr-4">
        <ul class="flex flex-col gap-2 text-sm font-medium text-gray-700">
          <li
            :class="[
              'cursor-pointer px-4 py-2 rounded-lg hover:bg-gray-100',
              activeMenu === 'informasi' ? 'bg-gray-100 font-semibold text-primary' : '',
            ]"
            @click="activeMenu = 'informasi'"
          >
            <i class="pi pi-user"></i> Edit Informasi
          </li>
          <li
            :class="[
              'cursor-pointer px-4 py-2 rounded-lg hover:bg-gray-100',
              activeMenu === 'password' ? 'bg-gray-100 font-semibold text-primary' : '',
            ]"
            @click="activeMenu = 'password'"
          >
            <i class="pi pi-lock"></i> Ganti Password
          </li>
        </ul>
      </div>

      <!-- Isi Form -->
      <div class="w-2/3">
        <div v-if="activeMenu === 'informasi'" class="flex flex-col gap-4">
          <InputText label="Nama" id="nama" v-model="formData.nama" placeholder="Nama" />
          <InputText label="Username" id="username" v-model="formData.username" placeholder="Username"/>
          <InputText label="Email" id="email" v-model="formData.email" placeholder="Email"/>
          <InputText label="Whatsapp" id="whatsapp" v-model="formData.whatsapp" placeholder="Whatsapp"/>
        </div>

        <div v-else class="flex flex-col gap-4">
          <InputText
            label="Password Lama"
            placeholder="Password Lama"
            id="old_password"
            type="password"
            v-model="passwordData.old_password"
          />
          <InputText
            label="Password Baru"
            placeholder="Password Baru"
            id="new_password"
            type="password"
            v-model="passwordData.new_password"
          />
          <InputText
            label="Konfirmasi Password"
            placeholder="Konfirmasi Password"
            id="confirm_password"
            type="password"
            v-model="passwordData.confirm_password"
          />
        </div>
      </div>
    </div>
  </FormEditProfile>
</template>
