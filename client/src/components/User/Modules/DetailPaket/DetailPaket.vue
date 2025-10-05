<script setup lang="ts">
  import { ref, computed } from 'vue'
  import NavSubmenu from '@/components/User/Modules/DetailPaket/Widget/NavSubmenu.vue'

  // Import komponen tab
  import PageTransaksi from '@/components/User/Modules/DaftarTransaksiPaket/DaftarTransaksiPaket.vue'
  import PageJamaah from '@/components/User/Modules/DaftarJamaahPaket/DaftarJamaahPaket.vue'
  import PageKamar from '@/components/User/Modules/KamarPaket/KamarPaket.vue'
  import PaketAgen from '@/components/User/Modules/PaketAgen/PaketAgen.vue'
  import PageBus from '@/components/User/Modules/BusPaket/BusPaket.vue'
  import PageManifest from '@/components/User/Modules/ManifestPaket/ManifestPaket.vue'
  import pageSyarat from '@/components/User/Modules/SyaratPaket/SyaratPaket.vue'
  import K_t from '@/components/User/Modules/K_t/K_t.vue'

  const props = defineProps<{
    paketId: number
    cabangId: number
    divisionName: string
    paketName:string
  }>()

  const emit = defineEmits<{
    (e: 'closeDetailPaket'): void
  }>()

  const current = ref('transaksi')

  const componentMap: Record<string, any> = {
    transaksi: PageTransaksi,
    jamaah: PageJamaah,
    agen: PaketAgen,
    kamar: PageKamar,
    bus: PageBus,
    manifes: PageManifest,
    syarat: pageSyarat,
    k_t: K_t
  }

  console.log('Props:---------');
  console.log('Props:', props);
  console.log('Props:---------');

  const currentComponent = computed(() => componentMap[current.value])

</script>

<template>
  <div>
    <NavSubmenu @close="emit('closeDetailPaket')"  @update:current="(val : any) => current = val" :divisionName="divisionName"
  :paketName="paketName"/>
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
