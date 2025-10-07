<template>
  <section class="py-16 text-center">
    <h2 class="text-4xl font-bold text-green-900">Kata Mereka</h2>
    <p class="mt-4 max-w-3xl mx-auto text-gray-700 font-semibold text-sm md:text-base px-4 md:px-0">
      Beberapa testimoni dari mereka yang sudah memakai layanan SATUApps
    </p>
    <div class="testimonial-container flex gap-4 justify-center mt-6 text-left w-full px-[100px]">
      <TestimonialCard
        v-for="(testi, index) in testimonials"
        :key="index"
        :testimonial="testi"
        :index="index"
      />
    </div>
    <img src="/Landing/dot.png" class="mx-auto mt-5" width="58" alt="" />
  </section>
</template>

<script>
import TestimonialCard from '@/modules/Landing/widgets/TestimonialCard.vue';

export default {
  name: 'TestimonialSection',
  components: {
    TestimonialCard,
  },
  data() {
    return {
      testimonials: [
        {
          image: 'landing/abusiraj.png',
          name: 'Direktur Utama Travel Umrah Abu Siraj',
          feedback:
            'Aplikasi ini luar biasa! Saya sangat terkesan dengan antarmuka yang intuitif dan fitur-fiturnya yang sangat membantu. Sangat direkomendasikan',
        },
        {
          image: 'landing/abusiraj.png',
          name: 'Direktur Tes Travel Umrah Abu Siraj',
          feedback:
            'Aplikasi ini luar biasa! Saya sangat terkesan dengan antarmuka yang intuitif dan fitur-fiturnya yang sangat membantu. Sangat direkomendasikan',
        },
        {
          image: 'landing/abusiraj.png',
          name: 'Direktur Tes Travel Umrah Abu Siraj',
          feedback:
            'Aplikasi ini luar biasa! Saya sangat terkesan dengan antarmuka yang intuitif dan fitur-fiturnya yang sangat membantu. Sangat direkomendasikan',
        },
      ],
    };
  },
};
</script>
