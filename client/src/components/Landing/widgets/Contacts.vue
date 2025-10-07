<template>
  <div
    class="relative w-full bg-white"
    style="border-top: 5px solid orange; border-radius: 40px 40px 0 0; margin-top: -40px"
  >
    <!-- Header Section -->
    <div
      class="pt-8 pb-5 md:pb-0 md:pt-16 px-4 md:px-[100px] flex flex-col md:flex-row md:justify-between gap-8"
    >
      <!-- Logo and Contact Info -->
      <div>
        <img src="/Landing/logo.png" class="mb-3 w-[100px] md:w-[120px]" alt="Logo" />
        <div class="mt-4 md:mt-8 space-y-2">
          <p class="flex gap-2 text-sm md:text-base font-medium text-gray-500">
            Telp : 08123-45-67
          </p>
          <p class="flex gap-2 text-sm md:text-base font-medium text-gray-500">
            Email : admin@satuapps.com
          </p>
        </div>
      </div>

      <!-- CTA Section -->
      <div class="mt-3">
        <h3 class="text-lg md:text-xl font-bold text-green-900">Coba gratis untuk optimasi</h3>
        <h3 class="text-lg md:text-xl font-bold text-green-900">bisnis travelmu.</h3>
        <div class="mt-4 flex flex-wrap gap-3">
          <button
            class="bg-green-800 text-white rounded-full font-bold px-4 md:px-5 py-1 text-sm md:text-base"
          >
            Coba Sekarang
          </button>
          <button
            class="bg-yellow-500 rounded-full font-bold px-4 md:px-5 py-1 text-sm md:text-base"
          >
            Lihat Paket
          </button>
        </div>
      </div>
    </div>

    <!-- Footer Section -->
    <footer class="px-4 md:px-[100px]">
      <div
        class="flex flex-col md:flex-row justify-between items-center p-2 mt-6 border-t-2 pb-6 pt-2"
      >
        <!-- Navigation Links -->
        <ul
          class="flex flex-wrap justify-center md:justify-start gap-4 md:gap-6 mb-6 md:mb-0 text-sm md:text-base"
        >
          <li class="text-gray-400 hover:text-green-800 cursor-pointer">Tentang Kami</li>
          <li class="text-gray-400 hover:text-green-800 cursor-pointer">Paket</li>
          <li class="text-gray-400 hover:text-green-800 cursor-pointer">Fitur & Layanan</li>
          <li class="text-gray-400 hover:text-green-800 cursor-pointer">Hubungi Kami</li>
        </ul>

        <!-- Social Media Icons -->
        <img src="/Landing/media.png" class="w-[200px] md:w-[281px] h-auto" alt="Media Sosial" />
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: 'WidgetComponent',
});
</script>

<style scoped>
@media (max-width: 768px) {
  ul li {
    position: relative;
  }

  ul li::before {
    display: none;
  }
}
</style>
