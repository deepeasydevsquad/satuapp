<template>
  <button
    class="flex items-center gap-2 px-3 py-2 text-sm font-medium transition"
    :class="[
      active ? 'bg-gray-200 text-black font-semibold' : 'text-gray-700 hover:bg-gray-100'
    ]"
    @click="$emit('click')"
  >
    <span v-html="iconSvg" class="w-4 h-4 inline-block" />
    <span>{{ label }}</span>
  </button>
</template>

<script lang="ts" setup>
const props = defineProps<{
  label: string
  icon: 'transaksi' | 'jamaah' | 'manifes' | 'syarat' | 'kamar' | 'bus' | 'agen' | 'k&t'
  active?: boolean
}>()

const icons: Record<string, string> = {
  transaksi: `
    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <!-- Atas: panah kanan -->
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
        d="M6 7h12m0 0l-4-4m4 4l-4 4" />
      <!-- Bawah: panah kiri -->
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
        d="M18 17H6m0 0l4 4m-4-4l4-4" />
    </svg>
  `,
  jamaah: `
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor"
      viewBox="0 0 24 24" class="w-4 h-4" stroke-width="2">
      <path stroke-linecap="round" stroke-linejoin="round"
        d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87M12 12a4 4 0 100-8 4 4 0 000 8zm6 8v-1a2 2 0 00-2-2H8a2 2 0 00-2 2v1h12z" />
    </svg>
  `,
  manifes: `
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor"
      viewBox="0 0 24 24" class="w-4 h-4" stroke-width="2">
      <path stroke-linecap="round" stroke-linejoin="round"
        d="M9 17v-6h13M5 7h14M5 11h14M5 15h14" />
    </svg>
  `,
  syarat: `
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor"
      viewBox="0 0 24 24" class="w-4 h-4" stroke-width="2">
      <path stroke-linecap="round" stroke-linejoin="round"
        d="M4 6h16M4 10h16M4 14h16M4 18h16" />
    </svg>
  `,
  kamar: `
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor"
      viewBox="0 0 24 24" class="w-4 h-4" stroke-width="2">
      <path stroke-linecap="round" stroke-linejoin="round"
        d="M3 12l9-9 9 9M4 10v10h5v-6h6v6h5V10" />
    </svg>
  `,
  bus: `
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor"
      viewBox="0 0 24 24" class="w-4 h-4" stroke-width="2">
      <path stroke-linecap="round" stroke-linejoin="round"
        d="M4 16V5a2 2 0 012-2h12a2 2 0 012 2v11M4 16h16M6 20h.01M18 20h.01" />
    </svg>
  `,
  agen: `
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor"
      viewBox="0 0 24 24" class="w-4 h-4" stroke-width="2">
      <path stroke-linecap="round" stroke-linejoin="round"
        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  `,
  'k&t': `
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor"
      viewBox="0 0 24 24" class="w-4 h-4" stroke-width="2">
      <path stroke-linecap="round" stroke-linejoin="round"
        d="M3 4a1 1 0 011-1h16a1 1 0 011 1v16a1 1 0 01-1 1H4a1 1 0 01-1-1V4z" />
      <path stroke-linecap="round" stroke-linejoin="round"
        d="M8 9h8M8 13h6M8 17h4" />
    </svg>
  `,
}

const iconSvg = icons[props.icon] ?? ''
</script>
