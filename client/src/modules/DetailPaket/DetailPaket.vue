<script setup lang="ts">
import { ref, computed } from 'vue';
import NavSubmenu from '@/modules/DetailPaket/Widget/NavSubmenu.vue';

// Import komponen tab
import PageTransaksi from '@/modules/DaftarTransaksiPaket/DaftarTransaksiPaket.vue';
import PageJamaah from '@/modules/DaftarJamaahPaket/DaftarJamaahPaket.vue';
import PageKamar from '@/modules/KamarPaket/KamarPaket.vue';
import PaketAgen from '@/modules/PaketAgen/PaketAgen.vue';
import PageBus from '@/modules/BusPaket/BusPaket.vue';
import PageManifest from '@/modules/ManifestPaket/ManifestPaket.vue';
import pageSyarat from '@/modules/SyaratPaket/SyaratPaket.vue';
import K_t from '@/modules/K_t/K_t.vue';

const props = defineProps<{
  paketId: number;
  cabangId: number;
  divisionName: string;
  paketName: string;
}>();

const emit = defineEmits<{
  (e: 'closeDetailPaket'): void;
}>();

const current = ref('transaksi');

const componentMap: Record<string, any> = {
  transaksi: PageTransaksi,
  jamaah: PageJamaah,
  agen: PaketAgen,
  kamar: PageKamar,
  bus: PageBus,
  manifes: PageManifest,
  syarat: pageSyarat,
  k_t: K_t,
};

console.log('Props:---------');
console.log('Props:', props);
console.log('Props:---------');

const currentComponent = computed(() => componentMap[current.value]);
</script>

<template>
  <div>
    <NavSubmenu
      @close="emit('closeDetailPaket')"
      @update:current="(val: any) => (current = val)"
      :divisionName="divisionName"
      :paketName="paketName"
    />
    <!-- render component berdasarkan current -->
    <component
      :is="currentComponent"
      :paket-id="props.paketId"
      :cabang-id="props.cabangId"
      :show-back-button="false"
      :show-add-transaction-button="true"
    />
  </div>
</template>
