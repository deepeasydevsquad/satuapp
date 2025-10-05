<script setup lang="ts">
  const props = defineProps<{ data : any,  }>()
  const BASE_URL = import.meta.env.VITE_APP_API_BASE_URL
</script>
<template>
  <div class="flex items-start justify-between text-xs text-center w-full">
    <div class="w-32 flex flex-col items-center">
      <template v-if="data.photo && data.photo !== '-'">
        <img
          :src="`${BASE_URL}/uploads/member/${data?.photo}`"
          alt="Foto Jamaah"
          class="h-28 object-cover border"
        />
      </template>
      <template v-else>
        <div class="w-[72px] h-[96px] border border-gray-600 flex items-center justify-center text-[10px] text-gray-600">
          FOTO <br />JAMAAH
        </div>
      </template>
    </div>
    <div class="flex-1">
      <p class="font-semibold text-gray-600">CALON JAMAAH</p>
      <p class="mt-12">({{ data.fullname_jamaah }})</p>
    </div>
    <div class="flex-1">
      <p class="font-semibold text-gray-600">PETUGAS</p>
      <p class="mt-10">
        ({{ data.petugas }}) <br />
        {{ data.jabatan }}
      </p>
    </div>
  </div>
</template>

