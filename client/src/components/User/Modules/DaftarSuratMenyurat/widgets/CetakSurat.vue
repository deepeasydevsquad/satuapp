<template>
  <!-- Surat Rekomendasi Paspor -->
  <SuratRekom
    v-if="jenisSurat === 'rekom_paspor' && suratData"
    :data_pimpinan="suratData.data_pimpinan"
    :data_surat="suratData.data_surat"
    :data_perusahaan="suratData.data_perusahaan"
    :data_jamaah="suratData.data_jamaah"
  />

  <!-- Surat Cuti -->
  <SuratCuti
    v-else-if="jenisSurat === 'surat_cuti' && suratData"
    :data_pimpinan="suratData.data_pimpinan"
    :data_surat="suratData.data_surat"
    :data_perusahaan="suratData.data_perusahaan"
    :data_jamaah="suratData.data_jamaah"
  />

  <!-- Loading -->
  <div v-else-if="(jenisSurat === 'rekom_paspor' || jenisSurat === 'surat_cuti') && !suratData">
    Loading surat...
  </div>

  <!-- Jenis surat tidak dikenal -->
  <div v-else>Jenis surat tidak dikenali</div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import SuratRekom from '@/components/User/Modules/DaftarSuratMenyurat/widgets/SuratRekom.vue'
import SuratCuti from '@/components/User/Modules/DaftarSuratMenyurat/widgets/SuratCuti.vue'
import { cetak_surat } from '@/service/daftar_konfigurasi_surat'
import { useRoute } from 'vue-router'

const route = useRoute()
const jenisSurat = route.params.jenis_surat as string
const jamaahId = route.query.jamaah_id as string

const suratData = ref(null)

onMounted(async () => {
  if (jenisSurat && jamaahId) {
    try {
      suratData.value = await cetak_surat(jenisSurat, { jamaah_id: jamaahId })
      console.log('Surat data:', suratData.value)
    } catch (error) {
      console.error('Gagal fetch data surat:', error)
      suratData.value = null
    }
  }
})
</script>
