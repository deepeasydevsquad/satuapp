<script setup lang="ts">
import { ref } from 'vue';
import axios from 'axios';
import Notification from '@/components/Modal/Notification.vue';
import InputText from '@/components/Form/InputText.vue';
import InputPassword from '@/components/Form/InputPassword.vue';
import PrimaryButton from '@/components/Button/PrimaryButton.vue';
import Header from './Header.vue';

interface Login {
  username?: string;
  password: string;
}

const inputLogin = ref<Partial<Login>>({
  username: '',
  password: '',
});
const isLoading = ref(true);
const errors = ref<Record<string, string>>({});
const timeoutId = ref<number | null>(null);
const showNotification = ref<boolean>(false);
const notificationMessage = ref<string>('');
const notificationType = ref<'success' | 'error'>('success');
const displayNotification = (message: string, type: 'success' | 'error' = 'success') => {
  notificationMessage.value = message;
  notificationType.value = type;
  showNotification.value = true;

  if (timeoutId.value) clearTimeout(timeoutId.value);

  timeoutId.value = window.setTimeout(() => {
    showNotification.value = false;
  }, 3000);
};

const validateForm = (): boolean => {
  let isValid = true;
  errors.value = {};

  if (!inputLogin.value.username || inputLogin.value.username.trim() === '') {
    errors.value.username = 'Username tidak boleh kosong';
    isValid = false;
  }

  if (!inputLogin.value.password || inputLogin.value.password.trim() === '') {
    errors.value.password = 'Password tidak boleh kosong';
    isValid = false;
  }

  return isValid;
};

const handleLogin = async () => {
  if (!validateForm()) {
    return;
  }

  try {
    const baseUrl =
      window.location.protocol + '//' + window.location.hostname + `:${import.meta.env.VITE_PORT}`;
    const response = await axios.post(baseUrl + '/auth-backbone/login', {
      username: inputLogin.value.username,
      password: inputLogin.value.password,
    });

    // filter
    if (response.status === 200) {
      localStorage.setItem('access_token_backbone', response.data.access_token);
      localStorage.setItem('refresh_token_backbone', response.data.refresh_token);

      window.location.href = '/backbone';
      displayNotification('Login berhasil dilakukan', 'success');
    } else {
      displayNotification('Login gagal dilakukan', 'error');
    }
  } catch (error) {
    displayNotification(error.response.data.message || 'An error occurred during login', 'error');
  }
};

setTimeout(() => {
  if (isLoading.value) {
    isLoading.value = false;
  }
}, 1000);
</script>
<template>
  <section class="bg-gray-50 dark:bg-gray-900">
    <div class="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
      <Header></Header>
      <div
        class="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700"
      >
        <div class="p-6 space-y-4 md:space-y-6 sm:p-8">
          <form class="space-y-4 md:space-y-6" @submit.prevent="handleLogin">
            <InputText
              v-model="inputLogin.username"
              label="Username"
              placeholder="name@company.com"
              class="mt-4"
              required
              :error="errors.username"
            />
            <InputPassword
              v-model="inputLogin.password"
              label="Password"
              placeholder="••••••••"
              class="mt-4"
              required
              :error="errors.password"
            />
            <PrimaryButton type="submit" class="w-full" :auto="false">
              <IconPlus /> Sign in
            </PrimaryButton>
            <p class="text-sm text-center font-light text-gray-500 dark:text-gray-400">
              Area ini hanya untuk administrator aplikasi
            </p>
          </form>
        </div>
      </div>
    </div>
  </section>
  <Notification
    :showNotification="showNotification"
    :notificationType="notificationType"
    :notificationMessage="notificationMessage"
    @close="showNotification = false"
  ></Notification>
</template>
