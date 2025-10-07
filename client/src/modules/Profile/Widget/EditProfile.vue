<script setup>
import { ref, watch } from 'vue'
import { updateProfile, changePassword } from '@/service/profile'
import PrimaryButton from '@/components/Button/PrimaryButton.vue'

const props = defineProps({
  modelValue: Boolean,
  currentUserData: Object,
})

const emit = defineEmits([
  'update:modelValue',
  'profile-updated',
  'show-notification',
  'request-confirmation',
  'request-logout',
])

const viewMode = ref('profile')
const profileForm = ref({})
const passwordForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
})
const isLoading = ref(false)

const showCurrentPassword = ref(false)
const showNewPassword = ref(false)
const showConfirmPassword = ref(false)

watch(
  () => props.currentUserData,
  (newData) => {
    if (newData) {
      profileForm.value = {
        fullname: newData.fullname,
        company_name: newData.company_name,
        username: newData.username || (newData.User && newData.User.username),
        email: newData.email,
        whatsapp_company_number: newData.whatsapp_company_number,
        whatsapp_number: newData.whatsapp_number,
      }
    }
  },
  { immediate: true, deep: true },
)

const closeModal = () => {
  emit('update:modelValue', false)
  setTimeout(() => {
    viewMode.value = 'profile'
    passwordForm.value = { currentPassword: '', newPassword: '', confirmPassword: '' }
    isLoading.value = false
  }, 300)
}

const handleUpdateProfile = () => {
  emit('request-confirmation', {
    title: 'Konfirmasi Perubahan',
    message: 'Apakah Anda yakin ingin menyimpan perubahan pada informasi profil Anda?',
    onConfirm: async () => {
      isLoading.value = true
      const oldUsername = props.currentUserData.username
      try {
        const response = await updateProfile(profileForm.value)

        if (oldUsername !== profileForm.value.username) {
          emit('show-notification', {
            type: 'success',
            message: 'Username berhasil diubah.',
          })
          setTimeout(() => emit('request-logout'), 2000)
        } else {
          emit('show-notification', { type: 'success', message: response.message })
          emit('profile-updated')
          closeModal()
        }
      } catch (error) {
        emit('show-notification', {
          type: 'error',
          message: error.response?.data?.message || 'Gagal memperbarui profil.',
        })
      } finally {
        isLoading.value = false
      }
    },
  })
}

const handleChangePassword = async () => {
  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    emit('show-notification', { type: 'error', message: 'Konfirmasi password tidak cocok.' })
    return
  }

  isLoading.value = true
  try {
    const response = await changePassword(passwordForm.value)

    emit('show-notification', {
      type: 'success',
      message: response.message + ' Anda akan logout demi keamanan.',
    })
    setTimeout(() => emit('request-logout'), 2000)
  } catch (error) {
    emit('show-notification', {
      type: 'error',
      message: error.response?.data?.message || 'Terjadi kesalahan tidak diketahui.',
    })
  } finally {
    isLoading.value = false
  }
}

const getInitials = (name) => {
  if (!name) return 'U'
  return name
    .split(' ')
    .map((word) => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2)
}
</script>

<template>
  <div
    v-if="modelValue"
    class="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4"
  >
    <div
      class="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden transform transition-all duration-300"
    >
      <!-- Header -->
      <div class="relative bg-[#455494] p-6 text-white">
        <div class="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
        <div class="relative flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <div
              class="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-lg font-bold border border-white/30"
            >
              {{ getInitials(profileForm.fullname || profileForm.company_name) }}
            </div>
            <div>
              <h2 class="text-2xl font-bold">Edit Profile</h2>
            </div>
          </div>
          <button
            @click="closeModal"
            class="w-10 h-10 rounded-xl bg-white/20 hover:bg-white/30 flex items-center justify-center transition-all duration-200 hover:scale-105"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              ></path>
            </svg>
          </button>
        </div>
      </div>

      <div class="flex flex-col lg:flex-row">
        <!-- Sidebar Navigation -->
        <div class="lg:w-64 p-6 bg-gray-50 border-r border-gray-200">
          <nav class="space-y-2">
            <button
              @click="viewMode = 'profile'"
              :class="[
                'w-full flex items-center px-4 py-3 rounded-2xl text-left font-medium transition-all duration-200 hover:scale-105',
                viewMode === 'profile'
                  ? 'bg-[#455494] text-white shadow-lg'
                  : 'text-gray-600 hover:bg-white hover:shadow-md',
              ]"
            >
              <div
                class="w-8 h-8 rounded-xl bg-current bg-opacity-20 flex items-center justify-center mr-3"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  ></path>
                </svg>
              </div>
              Profile Info
            </button>
            <button
              @click="viewMode = 'password'"
              :class="[
                'w-full flex items-center px-4 py-3 rounded-2xl text-left font-medium transition-all duration-200 hover:scale-105',
                viewMode === 'password'
                  ? 'bg-[#455494] text-white shadow-lg'
                  : 'text-gray-600 hover:bg-white hover:shadow-md',
              ]"
            >
              <div
                class="w-8 h-8 rounded-xl bg-current bg-opacity-20 flex items-center justify-center mr-3"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  ></path>
                </svg>
              </div>
              Password
            </button>
          </nav>
        </div>

        <!-- Main Content Area -->
        <div class="flex-1 p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <!-- Profile Edit Form -->
          <div v-if="viewMode === 'profile'" class="space-y-6">
            <div class="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <h3 class="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                <div class="w-8 h-8 bg-blue-100 rounded-xl flex items-center justify-center mr-3">
                  <svg
                    class="w-4 h-4 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    ></path>
                  </svg>
                </div>
                Informasi Pribadi
              </h3>
              <form @submit.prevent="handleUpdateProfile" class="space-y-5">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div v-if="profileForm.fullname !== undefined" class="group">
                    <label class="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                    <div class="relative">
                      <input
                        type="text"
                        v-model="profileForm.fullname"
                        class="w-full pl-12 pr-4 py-3 border text-black border-gray-200 rounded-xl focus:ring-2 focus:ring-[#455494] focus:border-transparent transition-all duration-200 group-hover:border-gray-300"
                        placeholder="Enter your full name"
                      />
                      <div class="absolute left-4 top-3.5 w-4 h-4 text-gray-400">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          ></path>
                        </svg>
                      </div>
                    </div>
                  </div>
                  <div v-if="profileForm.company_name !== undefined" class="group">
                    <label class="block text-sm font-semibold text-gray-700 mb-2"
                      > Nama Perusahaan </label
                    >
                    <div class="relative">
                      <input
                        type="text"
                        v-model="profileForm.company_name"
                        class="w-full pl-12 pr-4 py-3 border text-black border-gray-200 rounded-xl focus:ring-2 focus:ring-[#455494] focus:border-transparent transition-all duration-200 group-hover:border-gray-300"
                        placeholder="Enter company name"
                      />
                      <div class="absolute left-4 top-3.5 w-4 h-4 text-gray-400">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                          ></path>
                        </svg>
                      </div>
                    </div>
                  </div>
                  <div class="group">
                    <label class="block text-sm font-semibold text-gray-700 mb-2">Username</label>
                    <div class="relative">
                      <input
                        type="text"
                        v-model="profileForm.username"
                        class="w-full pl-12 pr-4 py-3 border text-black border-gray-200 rounded-xl focus:ring-2 focus:ring-[#455494] focus:border-transparent transition-all duration-200 group-hover:border-gray-300"
                        placeholder="Enter username"
                      />
                      <div class="absolute left-4 top-3.5 w-4 h-4 text-gray-400">@</div>
                    </div>
                  </div>
                  <div class="group">
                    <label class="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                    <div class="relative">
                      <input
                        type="email"
                        v-model="profileForm.email"
                        class="w-full pl-12 pr-4 py-3 border text-black border-gray-200 rounded-xl focus:ring-2 focus:ring-[#455494] focus:border-transparent transition-all duration-200 group-hover:border-gray-300"
                        placeholder="Enter email address"
                      />
                      <div class="absolute left-4 top-3.5 w-4 h-4 text-gray-400">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                          ></path>
                        </svg>
                      </div>
                    </div>
                  </div>
                  <div v-if="profileForm.whatsapp_company_number !== undefined" class="group">
                    <label class="block text-sm font-semibold text-gray-700 mb-2"
                      >WhatsApp Perusahaan</label
                    >
                    <div class="relative">
                      <input
                        type="text"
                        v-model="profileForm.whatsapp_company_number"
                        class="w-full pl-12 pr-4 py-3 border text-black border-gray-200 rounded-xl focus:ring-2 focus:ring-[#455494] focus:border-transparent transition-all duration-200 group-hover:border-gray-300"
                        placeholder="Enter WhatsApp number"
                      />
                      <div class="absolute left-4 top-3.5 w-4 h-4 text-gray-400">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                          ></path>
                        </svg>
                      </div>
                    </div>
                  </div>
                  <div v-if="profileForm.whatsapp_number !== undefined" class="group">
                    <label class="block text-sm font-semibold text-gray-700 mb-2"
                      >WhatsApp Personal</label
                    >
                    <div class="relative">
                      <input
                        type="text"
                        v-model="profileForm.whatsapp_number"
                        class="w-full pl-12 pr-4 py-3 border text-black border-gray-200 rounded-xl focus:ring-2 focus:ring-[#455494] focus:border-transparent transition-all duration-200 group-hover:border-gray-300"
                        placeholder="Enter WhatsApp number"
                      />
                      <div class="absolute left-4 top-3.5 w-4 h-4 text-gray-400">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                          ></path>
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="flex justify-end pt-6 border-t border-gray-100">
                  <PrimaryButton
                    type="submit"
                    :disabled="isLoading"
                    class="px-8 py-3 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center"
                  >
                    <div
                      v-if="isLoading"
                      class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"
                    ></div>
                    {{ isLoading ? 'Saving...' : 'Save Changes' }}
                  </PrimaryButton>
                </div>
              </form>
            </div>
          </div>

          <!-- Password Change Form -->
          <div v-if="viewMode === 'password'" class="space-y-6">
            <div class="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <h3 class="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                <div class="w-8 h-8 bg-red-100 rounded-xl flex items-center justify-center mr-3">
                  <svg
                    class="w-4 h-4 text-red-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    ></path>
                  </svg>
                </div>
                Ubah Password
              </h3>
              <form @submit.prevent="handleChangePassword" class="space-y-5">
                <!-- Current Password -->
                <div class="group">
                  <label class="block text-sm font-semibold text-gray-700 mb-2"
                    >Password saat ini</label
                  >
                  <div class="relative">
                    <div class="absolute left-4 top-3.5 w-4 h-4 text-gray-400">
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                        ></path>
                      </svg>
                    </div>
                    <input
                      :type="showCurrentPassword ? 'text' : 'password'"
                      v-model="passwordForm.currentPassword"
                      required
                      class="w-full pl-12 pr-12 py-3 border text-black border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 group-hover:border-gray-300"
                      placeholder="Masukkan password saat ini"
                    />
                    <button
                      type="button"
                      @click="showCurrentPassword = !showCurrentPassword"
                      class="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-red-500"
                    >
                      <svg
                        v-if="!showCurrentPassword"
                        class="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        ></path>
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        ></path>
                      </svg>
                      <svg
                        v-else
                        class="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7C3.732 7.943 7.523 5 12 5c1.282 0 2.52.235 3.687.675M17.25 10.5A2.25 2.25 0 0015 8.25H9.75a2.25 2.25 0 00-2.25 2.25m1.5-3.375l-4.25-4.25m0 0l-1.5 1.5m1.5-1.5l1.5 1.5m-1.5-1.5l4.25 4.25m-1.5 6.375l4.25 4.25M12 12m-3 0a3 3 0 106 0a3 3 0 00-6 0z"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
                <!-- New Password -->
                <div class="group">
                  <label class="block text-sm font-semibold text-gray-700 mb-2">Password Baru</label>
                  <div class="relative">
                    <div class="absolute left-4 top-3.5 w-4 h-4 text-gray-400">
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        ></path>
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        ></path>
                      </svg>
                    </div>
                    <input
                      :type="showNewPassword ? 'text' : 'password'"
                      v-model="passwordForm.newPassword"
                      required
                      class="w-full pl-12 pr-12 py-3 border text-black border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 group-hover:border-gray-300"
                      placeholder="Masukkan password baru"
                    />
                    <button
                      type="button"
                      @click="showNewPassword = !showNewPassword"
                      class="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-red-500"
                    >
                      <svg
                        v-if="!showNewPassword"
                        class="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        ></path>
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        ></path>
                      </svg>
                      <svg
                        v-else
                        class="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7C3.732 7.943 7.523 5 12 5c1.282 0 2.52.235 3.687.675M17.25 10.5A2.25 2.25 0 0015 8.25H9.75a2.25 2.25 0 00-2.25 2.25m1.5-3.375l-4.25-4.25m0 0l-1.5 1.5m1.5-1.5l1.5 1.5m-1.5-1.5l4.25 4.25m-1.5 6.375l4.25 4.25M12 12m-3 0a3 3 0 106 0a3 3 0 00-6 0z"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
                <!-- Confirm New Password -->
                <div class="group">
                  <label class="block text-sm font-semibold text-gray-700 mb-2"
                    >Konfirmasi password baru</label
                  >
                  <div class="relative">
                    <div class="absolute left-4 top-3.5 w-4 h-4 text-gray-400">
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        ></path>
                      </svg>
                    </div>
                    <input
                      :type="showConfirmPassword ? 'text' : 'password'"
                      v-model="passwordForm.confirmPassword"
                      required
                      class="w-full pl-12 pr-12 py-3 border text-black border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 group-hover:border-gray-300"
                      placeholder="Konfirmasi password baru"
                    />
                    <button
                      type="button"
                      @click="showConfirmPassword = !showConfirmPassword"
                      class="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-red-500"
                    >
                      <svg
                        v-if="!showConfirmPassword"
                        class="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        ></path>
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        ></path>
                      </svg>
                      <svg
                        v-else
                        class="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7C3.732 7.943 7.523 5 12 5c1.282 0 2.52.235 3.687.675M17.25 10.5A2.25 2.25 0 0015 8.25H9.75a2.25 2.25 0 00-2.25 2.25m1.5-3.375l-4.25-4.25m0 0l-1.5 1.5m1.5-1.5l1.5 1.5m-1.5-1.5l4.25 4.25m-1.5 6.375l4.25 4.25M12 12m-3 0a3 3 0 106 0a3 3 0 00-6 0z"
                        />
                      </svg>
                    </button>
                  </div>
                </div>

                <!-- Submit Button -->
                <div class="flex justify-end pt-6 border-t border-gray-100">
                  <button
                    type="submit"
                    :disabled="isLoading"
                    class="px-8 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center"
                  >
                    <div
                      v-if="isLoading"
                      class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"
                    ></div>
                    {{ isLoading ? 'Mengubah...' : 'Ubah Password' }}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
.animate-spin {
  animation: spin 1s linear infinite;
}
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}
.overflow-y-auto::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 3px;
}
.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}
.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>
