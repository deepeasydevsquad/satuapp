<script setup>
import { ref, onMounted, reactive } from 'vue'
import { getProfile } from '@/service/profile'
import PrimaryButton from '@/components/Button/PrimaryButton.vue'
import EditProfile from '@/components/User/Modules/Profile/Widget/EditProfile.vue'
import Confirmation from '@/components/Modal/Confirmation.vue'
import Notification from '@/components/Modal/Notification.vue'
import { logoutAndRedirect } from '@/service/auth'

const profileData = ref(null)
const loading = ref(true)
const error = ref('')
const isModalOpen = ref(false)
const notification = reactive({ show: false, type: 'success', message: '' })
const confirmation = reactive({ show: false, title: '', message: '', onConfirm: () => {} })

const fetchProfile = async () => {
  loading.value = true
  error.value = ''
  try {
    const response = await getProfile()
    profileData.value = response.data
  } catch (err) {
    error.value = 'Gagal memuat profil. Silakan coba lagi nanti.'
    console.error(err)
  } finally {
    loading.value = false
  }
}

onMounted(() => {

  console.log("DDDD");
  fetchProfile()
})

const handleShowNotification = (payload) => {
  notification.type = payload.type
  notification.message = payload.message
  notification.show = true
  setTimeout(() => {
    notification.show = false
  }, 4000)
}

const handleRequestConfirmation = (payload) => {
  confirmation.title = payload.title
  confirmation.message = payload.message
  confirmation.onConfirm = payload.onConfirm
  confirmation.show = true
}

const runConfirmationAction = () => {
  if (typeof confirmation.onConfirm === 'function') {
    confirmation.onConfirm()
  }
  confirmation.show = false
}


async function handleLogoutRequest() {
  console.log('Menerima permintaan logout. Menjalankan logoutAndRedirect...')
  await logoutAndRedirect('/login')
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

const getUserRole = (profileData) => {
  if (profileData.company_name && profileData.fullname) {
    return 'Administrator'
  } else if (profileData.fullname && !profileData.company_name) {
    return 'Staff'
  } else if (profileData.company_name && !profileData.fullname) {
    return 'Administrator'
  } else {
    return 'User'
  }
}
</script>

<template>
  <div>
    <div class="max-w-2xl mx-auto p-4">
      <!-- Loading State -->
      <div v-if="loading" class="flex flex-col items-center justify-center py-12">
        <div
          class="w-8 h-8 border-3 border-gray-200 border-t-blue-500 rounded-full animate-spin mb-3"
        ></div>
        <p class="text-gray-600">Loading profile...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <div class="text-3xl mb-3">个</div>
        <p class="text-red-600 font-medium mb-4">{{ error }}</p>
        <button
          @click="fetchProfile"
          class="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:-translate-y-0.5"
        >
          Try Again
        </button>
      </div>

      <!-- Profile Content -->
      <div
        v-else-if="profileData"
        class="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100"
      >
        <div class="bg-[#455494] px-6 py-8 text-white relative overflow-hidden">
          <div class="relative flex items-center space-x-4">
            <!-- Avatar -->
            <div
              class="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center text-xl font-bold border-2 border-white/30"
            >
              {{ getInitials(profileData.fullname || profileData.company_name) }}
            </div>

            <!-- Title Info -->
            <div class="flex-1">
              <h1 class="text-2xl font-bold mb-1">
                {{ profileData.fullname || profileData.company_name || 'User Profile' }}
              </h1>
              <p class="text-white/90">
                {{ getUserRole(profileData) }}
              </p>
            </div>
          </div>
        </div>

        <div class="p-6">
          <div class="grid gap-4">
            <!-- Company Name -->
            <div
              v-if="profileData.company_name && profileData.fullname"
              class="flex items-center p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all duration-200 hover:-translate-y-0.5 border border-gray-100"
            >
              <div
                class="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center text-white mr-3"
              >
              🏢
              </div>
              <div class="flex-1">
                <div class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                  Company
                </div>
                <div class="text-gray-900 font-medium">{{ profileData.company_name }}</div>
              </div>
            </div>

            <!-- Full Name -->
            <div
              v-if="profileData.fullname"
              class="flex items-center p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all duration-200 hover:-translate-y-0.5 border border-gray-100"
            >
              <div
                class="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center text-white mr-3"
              >
              👤
              </div>
              <div class="flex-1">
                <div class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                  Full Name
                </div>
                <div class="text-gray-900 font-medium">{{ profileData.fullname }}</div>
              </div>
            </div>

            <!-- Username -->
            <div
              class="flex items-center p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all duration-200 hover:-translate-y-0.5 border border-gray-100"
            >
              <div
                class="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center text-white mr-3"
              >
                @
              </div>
              <div class="flex-1">
                <div class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                  Username
                </div>
                <div class="text-gray-900 font-medium">
                  {{ profileData.username || (profileData.User && profileData.User.username) }}
                </div>
              </div>
            </div>

            <!-- Email -->
            <div
              class="flex items-center p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all duration-200 hover:-translate-y-0.5 border border-gray-100"
            >
              <div
                class="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center text-white mr-3"
              >
              📧
              </div>
              <div class="flex-1">
                <div class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                  Email
                </div>
                <div class="text-gray-900 font-medium break-all">{{ profileData.email }}</div>
              </div>
            </div>

            <!-- WhatsApp -->
            <div
              class="flex items-center p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all duration-200 hover:-translate-y-0.5 border border-gray-100"
            >
              <div
                class="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center text-white mr-3"
              >
              ☎️
              </div>
              <div class="flex-1">
                <div class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                  WhatsApp
                </div>
                <div class="text-gray-900 font-medium">
                  {{ profileData.whatsapp_company_number || profileData.whatsapp_number }}
                </div>
              </div>
            </div>
          </div>
          <!-- Action Buttons -->
          <div class="flex gap-3 mt-6 pt-4 border-t border-gray-100 justify-end">
            <button
              @click="$router.push('/user')"
              class="inline-flex w-full justify-center rounded-lg bg-gray-100 px-6 py-3 text-base font-semibold text-gray-800 shadow-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm transition-all duration-300"
            >
              Kembali
            </button>
            <PrimaryButton @click="isModalOpen = true"> Edit Profile </PrimaryButton>
          </div>
        </div>
      </div>
    </div>
    <EditProfile
      v-model="isModalOpen"
      :currentUserData="profileData"
      @profile-updated="fetchProfile"
      @request-confirmation="handleRequestConfirmation"
      @show-notification="handleShowNotification"
      @request-logout="handleLogoutRequest"
    />


    <Confirmation
      :showConfirmDialog="confirmation.show"
      :confirmTitle="confirmation.title"
      :confirmMessage="confirmation.message"
    >
      <button
        type="button"
        @click="runConfirmationAction"
        class="inline-flex w-full justify-center rounded-md border border-transparent bg-yellow-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
      >
        Confirm
      </button>
      <button
        type="button"
        @click="confirmation.show = false"
        class="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
      >
        Cancel
      </button>
    </Confirmation>

    <Notification
      :showNotification="notification.show"
      :notificationType="notification.type"
      :notificationMessage="notification.message"
      @close="notification.show = false"
    />
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
</style>
