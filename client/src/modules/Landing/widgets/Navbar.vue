<template>
  <nav class="text-white py-4 px-4 md:px-[100px]">
    <div class="max-w-7xl mx-auto">
      <div class="flex justify-between items-center">
        <!-- Logo -->
        <div class="text-lg font-bold">
          <img src="/Landing/logo.png" alt="logo" width="114" />
        </div>

        <!-- Desktop Menu -->
        <div class="hidden md:flex space-x-6 font-semibold">
          <a href="#" class="hover:underline text-green-700">Beranda</a>
          <a href="#" class="hover:underline text-gray-400">Tentang</a>
          <a href="#" class="hover:underline text-gray-400">Fitur & Layanan</a>
          <a href="#" class="hover:underline text-gray-400">Harga</a>
        </div>

        <!-- Desktop Buttons -->
        <div class="hidden md:flex space-x-4">
          <a href="/Register" class="bg-green-800 px-4 py-2 rounded text-white hover:bg-green-700"
            >Registrasi</a
          >
          <a href="/Login" class="text-green-800 px-4 py-2 rounded font-semibold hover:bg-gray-100"
            >Login</a
          >
        </div>

        <!-- Mobile Menu Button -->
        <div class="md:hidden">
          <button @click="isOpen = !isOpen" class="text-green-800">
            <svg
              v-if="!isOpen"
              xmlns="http://www.w3.org/2000/svg"
              class="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
            <svg
              v-else
              xmlns="http://www.w3.org/2000/svg"
              class="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>

      <!-- Mobile Menu -->
      <div v-if="isOpen" class="md:hidden mt-4">
        <div class="flex flex-col space-y-4 pt-4 border-t border-gray-200">
          <a href="#" class="text-gray-400 hover:text-green-700">Beranda</a>
          <a href="#" class="text-gray-400 hover:text-green-700">Tentang</a>
          <a href="#" class="text-gray-400 hover:text-green-700">Fitur & Layanan</a>
          <a href="#" class="text-gray-400 hover:text-green-700">Harga</a>
          <div class="flex flex-col space-y-2">
            <a
              href="#"
              class="bg-green-800 px-4 py-2 rounded text-white text-center hover:bg-green-700"
              >Registrasi</a
            >
            <a
              href="#"
              class="text-green-800 px-4 py-2 rounded font-semibold text-center hover:bg-gray-100"
              >Login</a
            >
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { ref } from 'vue';

defineOptions({
  name: 'Navbar',
});
const isOpen = ref(false);
</script>
