<template>
  <div class="shadow-lg pb-4 m-2 w-80 rounded-lg">
    <div class="py-5 bg-yellow-500 text-white rounded-t-lg">
      <h3 class="font-bold text-xl">{{ title }}</h3>
    </div>
    <div class="py-4 bg-green-800 text-white mb-4">
      <h2>
        <sup style="vertical-align: top" class="font-semibold text-lg">Rp</sup>
        <span class="text-4xl font-semibold">{{ price }}</span>
        <sub style="vertical-align: baseline" class="font-semibold text-lg">/Bulan</sub>
      </h2>
      <p class="text-sm mt-3">{{ description }}</p>
    </div>
    <img :src="image" :alt="title" width="441" />
  </div>
</template>

<script>
export default {
  props: {
    title: String,
    price: String,
    description: String,
    image: String,
  },
}
</script>

<style scoped>
/* Styling specific to PaketLangganan component */
</style>
