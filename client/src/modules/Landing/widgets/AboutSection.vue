<template>
  <section
    class="px-4 md:px-[100px] py-8 md:py-16 text-center rounded-t-[40px] bg-center bg-contain"
    style="background: url('/Landing/bg3.png') no-repeat"
  >
    <div class="mb-8">
      <h1 class="text-green-800 text-2xl md:text-3xl font-bold">Kelola Travelmu Dalam</h1>
      <h1 class="text-yellow-500 text-2xl md:text-3xl font-bold">Satu Dashboard</h1>
    </div>

    <div class="flex flex-col md:flex-row gap-3 md:px-[150px]">
      <!-- Image Section -->
      <div class="w-full md:w-1/2">
        <img src="/Landing/bg2.png" alt="bg2" class="w-full max-w-[654px] mx-auto" />
      </div>
      <!-- Features Section -->
      <div class="w-full md:w-1/2 flex flex-col text-left">
        <!-- Feature 1 -->
        <div
          class="flex flex-col sm:flex-row gap-3 shadow-lg px-4 md:px-6 py-6 md:py-8 m-2 rounded"
        >
          <div class="flex-1">
            <h3 class="font-bold text-lg md:text-xl text-green-800">Biaya Terjangkau</h3>
            <p class="text-green-900 mt-3 text-sm md:text-base">
              Biaya bulanan yang terjangkau dan sudah termasuk dalam pengembangan dan pembaharuan
              otomatis.
            </p>
          </div>
          <img src="/Landing/hand.png" class="w-32 md:w-[155px] mx-auto sm:mx-0" alt="hand" />
        </div>

        <!-- Feature 2 -->
        <div
          class="flex flex-col sm:flex-row gap-3 shadow-lg px-4 md:px-6 py-6 md:py-8 m-2 rounded"
        >
          <div class="flex-1">
            <h3 class="font-bold text-lg md:text-xl text-green-800">Pelaporan Lengkap</h3>
            <p class="text-green-900 mt-3 text-sm md:text-base">
              Rekap pelaporan penjualan dari travelmu dalam satu tampilan menggunakan layanan
              dashboard SatuApps menghemat waktumu.
            </p>
          </div>
          <img src="/Landing/graph.png" class="w-32 md:w-[155px] mx-auto sm:mx-0" alt="graph" />
        </div>

        <!-- Feature 3 -->
        <div
          class="flex flex-col sm:flex-row gap-3 shadow-lg px-4 md:px-6 py-6 md:py-8 m-2 rounded"
        >
          <div class="flex-1">
            <h3 class="font-bold text-lg md:text-xl text-green-800">Mudah Digunakan</h3>
            <p class="text-green-900 mt-3 text-sm md:text-base">
              Antarmuka intuitif, fitur lengkap, dan panduan jelas membuat aplikasi ini mudah
              digunakan untuk semua kebutuhan perjalanan.
            </p>
          </div>
          <img src="/Landing/thumpup.png" class="w-32 md:w-[155px] mx-auto sm:mx-0" alt="thumbup" />
        </div>
      </div>
    </div>
  </section>
</template>

<!-- <script setup lang="ts">
// export default {
//   name: 'AboutSection',
// };

</script> -->
<script setup lang="ts">
defineOptions({
  name: 'AboutSection',
});
</script>
