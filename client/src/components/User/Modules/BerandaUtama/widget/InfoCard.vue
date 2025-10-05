<template>
  <div :class="['rounded shadow text-white flex flex-col justify-between min-h-[200px]', color]">
    <div>
      <div class="flex items-center justify-between p-4">
        <div class="flex gap-2 items-center">
          <div class="text-4xl font-bold">{{ count }}</div>
        </div>
        <font-awesome-icon :icon="['fas', icon]" class="text-5xl text-black opacity-35" />
      </div>
      <div class="mt-2 px-4">
        <div class="uppercase font-bold">{{ title }}</div>
        <div class="italic text-sm font-semibold">{{ subtitle }}</div>
      </div>
    </div>

    <div class="relative mt-4 rounded overflow-hidden">
      <div class="absolute inset-0 bg-gray-900 opacity-25"></div>
      <div class="relative p-2 flex justify-end items-center transition duration-300">
        <button class="text-sm font-bold text-white hover:text-gray-200 flex items-center">
          Detail info
          <font-awesome-icon :icon="['fas', 'circle-arrow-right']" class="ml-1" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps({
  color: String,
  title: String,
  subtitle: String,
  count: [String, Number],
  icon: String,
})
</script>
