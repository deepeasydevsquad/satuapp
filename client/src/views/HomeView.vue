<script setup lang="ts">
import Navbar from '@/modules/Landing/widgets/Navbar.vue';
import HeroSection from '@/modules/Landing/widgets/HeroSection.vue';
import AboutSection from '@/modules/Landing/widgets/AboutSection.vue';
import TestimonialSection from '@/modules/Landing/widgets/TestimonialSection.vue';
import Footers from '@/modules/Landing/widgets/LandingFooter.vue';
import Contacts from '@/modules/Landing/widgets/Contacts.vue';
import FiturDanLayanan from '@/modules/Landing/widgets/FiturDanLayanan.vue';
</script>
<template>
  <div>
    <Navbar />
    <HeroSection />
    <AboutSection />
    <FiturDanLayanan />
    <TestimonialSection />
    <Footers />
    <Contacts />
  </div>
</template>
