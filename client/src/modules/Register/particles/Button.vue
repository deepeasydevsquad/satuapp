<template>
  <button
    class="w-full bg-sky-700 text-white py-2 rounded-lg hover:bg-blue-700 transition font-semibold"
  >
    {{ label }}
  </button>
</template>

<script>
export default {
  props: {
    label: {
      type: String,
      default: 'Button',
    },
  },
}
</script>
