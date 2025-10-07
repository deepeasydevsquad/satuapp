<template>
  <section class="py-16 bg-white text-center">
    <h2 class="text-3xl font-bold text-green-700">Mari Berlangganan</h2>
    <p class="mt-4">
      Berikut harga berlangganan SATU APPS, termasuk biaya pengembangan dan pembaruan otomatis untuk
      semua pengguna!
    </p>
    <div class="flex flex-wrap justify-center mt-6 gap-4">
      <PaketLangganan
        v-for="(packageItem, index) in subscriptionPackages"
        :key="index"
        :title="packageItem.title"
        :price="packageItem.price"
        :description="packageItem.description"
        :image="packageItem.image"
      />
    </div>
  </section>
</template>

<script>
import PaketLangganan from '@/components/Landing/widgets/PakeLangganan.vue';

export default {
  components: {
    PaketLangganan,
  },
  data() {
    return {
      subscriptionPackages: [
        {
          title: 'PAKET EKONOMI',
          price: '100.000',
          description: 'Solusi tepat untuk pengembangan travelmu.',
          image: '/Landing/paket1.png',
        },
        {
          title: 'PAKET BASIC',
          price: '100.000',
          description: 'Solusi tepat untuk pengembangan travelmu.',
          image: '/Landing/paket1.png',
        },
        {
          title: 'PAKET BISNIS',
          price: '100.000',
          description: 'Solusi tepat untuk pengembangan travelmu.',
          image: '/Landing/paket1.png',
        },
      ],
    };
  },
};
</script>

<style scoped>
/* Styling untuk bagian Fitur dan Layanan */
</style>
