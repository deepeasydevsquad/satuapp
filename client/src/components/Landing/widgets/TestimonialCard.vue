<template>
  <div
    :class="[
      'relative p-5 bg-white rounded-lg shadow-md border border-gray-300',
      isHighlighted ? 'opacity-100' : 'opacity-50',
    ]"
  >
    <img :src="testimonial.image" alt="" class="w-24 h-auto mb-2 self-start" />
    <div class="flex flex-col">
      <h3 class="font-bold flex gap-3 items-center mt-4 text-green-800">{{ testimonial.name }}</h3>
      <p class="text-green-800">{{ testimonial.feedback }}</p>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    testimonial: Object,
    index: Number,
  },
  computed: {
    isHighlighted() {
      return this.index === 1 // Memberikan kecerahan penuh pada card di tengah (index 1)
    },
  },
}
</script>
