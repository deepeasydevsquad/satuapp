<script setup lang="ts">
import { ref, getCurrentInstance } from 'vue';
import axios from 'axios';
import LoginButton from '@/modules/Login/particles/LoginButton.vue';
import ForgotPasswordButton from '@/modules/Login/particles/ForgotPasswordButton.vue';
import GuideButton from '@/modules/Login/particles/GuideButton.vue';
import RegisterButton from '@/modules/Login/particles/RegisterButton.vue';
import { paramCabang } from '@/service/param_cabang';
import alertify from 'alertifyjs';
import { API_URL } from '@/config/config';
import api from '@/service/api'; // Import service API

interface Login {
  type: string;
  company_code?: string;
  username?: string;
  nomorWhatsapp?: string;
  password: string;
}

const inputLogin = ref<Partial<Login>>({
  type: 'administrator',
  company_code: '',
  username: '',
  nomorWhatsapp: '',
  password: '',
});

const isLoading = ref(true);

const errors = ref<Record<string, string>>({});

const validateForm = (): boolean => {
  const type = ['administrator', 'staff'];
  let isValid = false;
  errors.value = {};

  if (!inputLogin.value.type || !type.includes(inputLogin.value.type)) {
    errors.value.type = 'Tipe akun tidak valid';
    isValid = false;
  }

  if (inputLogin.value.type == 'staff' && !inputLogin.value.company_code) {
    errors.value.company_code = 'Kode Perusahaan wajib diisi';
    isValid = false;
  } else {
    isValid = true;
  }

  if (
    inputLogin.value.type == 'administrator' &&
    (!inputLogin.value.username || inputLogin.value.username.trim() === '')
  ) {
    errors.value.username = 'Username tidak boleh kosong jika anda masuk sebagai Administrator';
    isValid = false;
  }

  if (
    inputLogin.value.type == 'staff' &&
    (!inputLogin.value.nomorWhatsapp || inputLogin.value.nomorWhatsapp.trim() === '')
  ) {
    errors.value.username = 'Nomor Whatsapp tidak boleh kosong jika anda masuk sebagai Staff';
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
    for (const key in errors.value) {
      if (errors.value[key]) {
        alertify.error(errors.value[key]);
      }
    }
    return;
  }

  try {
    const baseUrl = API_URL;

    let data = {
      type: inputLogin.value.type,
      password: inputLogin.value.password,
    };

    console.log('DATA');
    console.log(data);
    console.log('DATA');
    if (inputLogin.value.type === 'staff') {
      data = {
        ...data,
        ...{
          ['company_code']: inputLogin.value.company_code,
          ['nomor_whatsapp']: inputLogin.value.nomorWhatsapp,
        },
      };
    } else if (inputLogin.value.type === 'administrator') {
      data = {
        ...data,
        ...{
          ['username']: inputLogin.value.username,
        },
      };
    }

    console.log('DATA TO');
    console.log(data);
    console.log('DATA TO');

    // Kirim data login ke server Express.js menggunakan axios
    const response = await axios.post(baseUrl + '/auth/login', data);

    // filter
    if (response.status === 200) {
      console.log('Login successful', response.data);

      localStorage.setItem('access_token', response.data.access_token);
      localStorage.setItem('refresh_token', response.data.refresh_token);

      // ambil semua cabang setelah login berhasil
      const cabangResponse = await paramCabang();
      const cabang = cabangResponse.data;

      console.log('ini data cabang login', cabang);

      if (!cabang || cabang.length === 0) {
        window.location.href = '/tambah-cabang';
      } else {
        window.location.href = '/User';
      }
    } else {
      alertify.error(response.data);
      console.log('Login failed', response.data);
      // Tindakan setelah login gagal
    }
  } catch (error) {
    console.error('An error occurred during login:', error);
    // alertify.error(error.response.data.message || 'An error occurred during login');
  }
};

setTimeout(() => {
  if (isLoading.value) {
    isLoading.value = false;
  }
}, 1000);
</script>

<template>
  <div class="loading-container" :style="{ display: isLoading ? 'block' : 'none' }">
    <div class="loading-spinner"></div>
  </div>
  <div class="bg-gray-100 flex items-center justify-center h-screen">
    <div class="bg-white shadow-lg rounded-lg w-full flex">
      <!-- Bagian Kiri -->
      <div class="w-1/2 rounded-l-lg">
        <img src="/bg.png" alt="Haji Image" class="object-cover w-full h-full" />
      </div>
      <!-- Bagian Kanan -->
      <div class="ml-6 p-8 flex flex-col justify-center items-center max-w-2lg">
        <div class="flex flex-col justify-center w-full mb-0">
          <h2 class="text-3xl font-bold text-center mb-10 text-[#175690]">Selamat Datang</h2>
          <div class="space-y-3">
            <select
              v-model="inputLogin.type"
              class="w-full border rounded-md px-3 py-2 text-gray-700 bg-white"
            >
              <option class="text-gray-700" value="administrator">Administrator</option>
              <option class="text-gray-700" value="staff">Staff</option>
            </select>
            <p class="text-gray-500 text-xs mt-0 mb-10 italic">Pilih Salah Satu Tipe Akun Anda</p>
            <template v-if="inputLogin.type === 'staff'">
              <input
                v-model="inputLogin.company_code"
                type="text"
                placeholder="Kode Perusahaan"
                class="w-full p-2 border border-gray-300 rounded-lg input-field"
              />
              <p class="text-gray-500 text-xs mt-0 mb-10 italic">
                Kode Perusahaan wajib diisi jika anda masuk sebagai Staff.
              </p>
            </template>
            <input
              v-if="inputLogin.type === 'administrator'"
              v-model="inputLogin.username"
              type="text"
              placeholder="Username"
              class="w-full p-2 border border-gray-300 rounded-lg input-field"
            />
            <input
              v-if="inputLogin.type === 'staff'"
              v-model="inputLogin.nomorWhatsapp"
              type="text"
              placeholder="Nomor Whatsapp"
              class="w-full p-2 border border-gray-300 rounded-lg input-field"
            />
            <input
              v-model="inputLogin.password"
              type="password"
              placeholder="Password"
              class="w-full p-2 border border-gray-300 rounded-lg input-field"
            />
            <LoginButton
              @click="handleLogin()"
              icon="lock.svg"
              label="Masuk Akun Sekarang"
              color="bg-green-900 text-white"
            />
          </div>
        </div>
        <p class="text-center mb-4 mt-6 text-green-900 font-semibold">Atau</p>
        <RegisterButton />
        <a href="#" class="text-xs text-center mt-5 mb-16 text-green-900">
          Dengan masuk, Anda menyetujui
          <span class="font-semibold">Syarat dan Ketentuan & Kebijakan Privasi kami</span>
        </a>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Additional styles if needed */
</style>
