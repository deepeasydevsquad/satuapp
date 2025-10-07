<!-- <template>
  <main class="text-xs">
    <NavbarCard />
    <HeroCard1 />
    <AboutCard />
    <WhyCard />
    <FeatureCard />
    <PriceCard />
    <HeroCard2 />
    <FooterCard />
  </main>
</template>

<script setup>
import NavbarCard from '@/components/Landing/widgets/NavbarCard.vue'
import HeroCard1 from '@/components/Landing/widgets/HeroCard1.vue'
import AboutCard from '@/components/Landing/widgets/AboutCard.vue'
import WhyCard from '@/components/Landing/widgets/WhyCard.vue'
import FeatureCard from '@/components/Landing/widgets/FeatureServiceCard.vue'
import HeroCard2 from '@/components/Landing/widgets/HeroCard2.vue'
import PriceCard from '@/components/Landing/widgets/PriceCard.vue'
import FooterCard from '@/components/Landing/widgets/FooterCard.vue'
</script>

<style scoped>
</style> -->

<script setup lang="ts">
import Navbar from '@/components/Landing/widgets/Navbar.vue';
import HeroSection from '@/components/Landing/widgets/HeroSection.vue';
import AboutSection from '@/components/Landing/widgets/AboutSection.vue';
import TestimonialSection from '@/components/Landing/widgets/TestimonialSection.vue';
import Footers from '@/components/Landing/widgets/LandingFooter.vue';
import Contacts from '@/components/Landing/widgets/Contacts.vue';
import FiturDanLayanan from '@/components/Landing/widgets/FiturDanLayanan.vue';
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
