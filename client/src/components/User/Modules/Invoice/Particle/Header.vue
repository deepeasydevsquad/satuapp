<script setup lang="ts">
  const props = defineProps<{ data : any,  }>()
  const BASE_URL = import.meta.env.VITE_APP_API_BASE_URL
</script>
<template>
    <div class="flex justify-between items-start border-b pb-4 mb-4">
      <div class="w-1/3">
        <img v-if="data.logo !== 'default.png'" :src="data.logo ? `${BASE_URL}/uploads/pengaturan/${data?.logo}` : 'default.png'" alt="Logo" class="h-14" />
        <div v-else class="relative w-40 h-17 rounded-t-lg bg-gray-200">
          <div  class="absolute inset-0 flex items-center justify-center text-gray-500 border-2 border-dashed border-gray-400 " >
            <p class="text-xl font-semibold">Logo</p>
          </div>
        </div>

      </div>
      <div class="text-right w-2/3">
        <h2 class="text-xl font-extrabold uppercase" style="font-size: 28px;">{{ data.company_name || '-' }}</h2>
        <p class="text-sm font-normal tracking-wide leading-snug">
          {{ data.address || '-' }}, {{ data.city || '-'
          }}<br />
          Kode Pos: {{ data.pos_code || '-' }}, Email:
          {{ data.email || '-' }} Telp: {{ data.whatsapp_company_number || '-' }}
        </p>
      </div>
    </div>
</template>
