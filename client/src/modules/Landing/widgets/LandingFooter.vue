<template>
  <footer class="bg-green-800 text-white text-center py-8 md:py-10 px-4">
    <h1 class="text-2xl md:text-3xl font-bold">Our Partner</h1>
    <div class="max-w-2xl mx-auto">
      <p class="text-sm md:text-base mt-2">Satu Apps bekerja sama dengan berbagai perusahaan</p>
      <p class="text-sm md:text-base">
        untuk mengembangkan sistem digital yang inovatif dan terintegrasi.
      </p>
    </div>

    <div class="flex flex-wrap justify-center items-center gap-6 md:gap-8 mt-8 md:mt-10">
      <img
        src="/Landing/abusiraj-logo.png"
        alt="Abu Siraj"
        class="w-32 md:w-48 h-auto object-contain"
      />
      <img
        src="/Landing/pertamina.png"
        alt="Pertamina"
        class="w-48 md:w-[309px] h-auto object-contain"
      />
      <img src="/Landing/bulog.png" alt="Bulog" class="w-40 md:w-[249px] h-auto object-contain" />
    </div>

    <div class="flex flex-wrap justify-center items-center gap-6 md:gap-8 mt-6 md:mt-8">
      <img src="/Landing/bum.png" alt="BUM" class="w-32 md:w-[169px] h-auto object-contain" />
      <img src="/Landing/telkom.png" alt="Telkom" class="w-32 md:w-[169px] h-auto object-contain" />
      <img
        src="/Landing/mandiri.png"
        alt="Mandiri"
        class="w-36 md:w-[196px] h-auto object-contain"
      />
      <img src="/Landing/bca.png" alt="BCA" class="w-28 md:w-[143px] h-auto object-contain" />
    </div>
  </footer>
</template>

<script setup lang="ts">
defineOptions({
  name: 'LandingFooter',
});
</script>
