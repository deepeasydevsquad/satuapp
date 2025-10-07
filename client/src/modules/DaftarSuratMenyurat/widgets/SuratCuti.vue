<template>
  <div class="bg-white max-w-[210mm] mx-auto p-[20mm] font-serif print:p-[10mm] print:m-0 print:shadow-none"
    style="color: black; font-size: 10pt; text-align: justify; line-height:  1.5">
    <!-- Header -->
    <div class="text-center mb-6">
      <h1 class="text-lg underline font-semibold">SURAT KETERANGAN UMROH</h1>
      <div class="text-lg">No: {{ data_surat.nomor_surat }}</div>
    </div>

    <!-- Tujuan -->
    <div class="mb-6">
      <p>Kepada, YTH</p>
      <p class="font-semibold">{{ data_surat.tujuan }}</p>
      <p>di -</p>
      <p>Tempat</p>
    </div>

    <!-- Pembuka -->
    <div class="mb-4">
      <p>Dengan hormat,</p>
      <p>Saya yang bertanda tangan di bawah ini :</p>
      <div class="flex flex-col gap-1 mt-2">
        <div class="flex">
          <div class="w-[180px]">Nama</div>
          <div class="font-semibold">: {{ data_pimpinan.nama_tanda_tangan }}</div>
        </div>
        <div class="flex">
          <div class="w-[180px]">Jabatan</div>
          <div class="font-semibold">: {{ data_pimpinan.jabatan_tanda_tangan }}</div>
        </div>
        <div class="flex">
          <div class="w-[180px]">Alamat</div>
          <div>: {{ data_pimpinan.alamat_tanda_tangan }}</div>
        </div>
      </div>
    </div>

    <!-- Data Jamaah -->
    <div class="mb-6">
      <p>Dengan ini menyatakan bahwa :</p>
      <div class="flex flex-col gap-1 mt-2">
        <div class="flex">
          <div class="w-[180px]">Nama</div>
          <div>: {{ data_jamaah.fullname }}</div>
        </div>
        <div class="flex">
          <div class="w-[180px]">NIK</div>
          <div>: {{ data_jamaah.identity_number }}</div>
        </div>
        <div class="flex">
          <div class="w-[180px]">Jabatan</div>
          <div>: {{ extractJabatan(data_surat.info) }}</div>
        </div>
        <div class="flex">
          <div class="w-[180px]">Alamat</div>
          <div>: {{ data_jamaah.alamat }}</div>
        </div>
      </div>
    </div>

    <!-- Isi -->
    <div class="mb-6">
      <p>
        Adalah calon Jamaah Umroh {{ data_surat.nama_petugas }} IZIN PPIU NO :
        {{ data_pimpinan.izin_perusahaan }} yang akan berangkat pada bulan
        {{ extractTanggal(data_surat.info).awal }} hingga kepulangan pada tanggal
        {{ extractTanggal(data_surat.info).akhir }}.
      </p>
    </div>

    <!-- Penutup -->
    <p>
      Demikian surat rekomendasi ini kami perbuat dengan sebenar-benarnya, atas perhatian dan
      kerjasama yang baik kami ucapkan terima kasih.
    </p>

    <!-- Footer -->
    <div class="text-right mt-16">
      <div class="mb-2">{{ formatTanggal(data_surat.tanggal_surat) }}</div>
      <div class="mb-2">{{ data_surat.nama_petugas }}</div>
      <div class="h-16"></div>
      <div class="font-semibold underline">{{ data_pimpinan.nama_tanda_tangan }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'

const props = defineProps<{
  data_pimpinan: any
  data_surat: any
  data_perusahaan: any
  data_jamaah: any
}>()

onMounted(() => {
  setTimeout(() => {
    window.print()
  }, 300)
})

function formatTanggal(tgl: string): string {
  const date = new Date(tgl)
  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function extractJabatan(info: { text: string }): string {
  const match = info?.text?.match(/Jabatan:\s*([^,]+)/i)
  return match ? match[1].trim() : '-'
}

function extractTanggal(info: { text: string }): { awal: string; akhir: string } {
  const match = info?.text?.match(/Cuti:\s*(\d{4}-\d{2}-\d{2})\s*s\/d\s*(\d{4}-\d{2}-\d{2})/)
  if (match) {
    const awal = new Date(match[1]).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
    const akhir = new Date(match[2]).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
    return { awal, akhir }
  }
  return { awal: '-', akhir: '-' }
}
</script>

<style>
@media print {
  body {
    margin: 0;
    background: white;
    color: black !important;
  }
}
</style>
