<template>
  <div class="bg-white max-w-[210mm] mx-auto p-[15mm] font-serif print:p-[10mm] print:m-0 print:shadow-none"
    style="color: black; font-size: 10pt; text-align: justify; line-height: 1.3">
    <div class="text-center mb-6">
      <div class="text-lg underline font-bold">SURAT REKOMENDASI</div>
      <div class="mt-4">
        <div class="text-right mb-2">
          {{
            new Date(data_surat?.tanggal_surat).toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })
          }}
        </div>

        <div class="grid grid-cols-[150px_1fr] gap-y-1 gap-x-4">
          <div>No</div>
          <div>: {{ data_surat?.nomor_surat }}</div>

          <div>Lampiran</div>
          <div>: 1 Lembar</div>

          <div>Perihal</div>
          <div class="underline font-semibold">: Rekomendasi Pembuatan Paspor</div>
        </div>
      </div>
    </div>

    <div class="mb-6">
      <p>Kepada, YTH</p>
      <strong>
        <p>{{ data_surat?.tujuan }}</p>
      </strong>
      <p>di</p>
      <p>Tempat</p>
    </div>

    <div class="mb-4">
      <p>Dengan hormat,</p>
      <p>Saya yang bertanda tangan di bawah ini :</p>
      <div class="flex flex-col gap-1">
        <div class="flex">
          <div class="w-[200px]">Nama</div>
          <div class="font-semibold">: {{ data_pimpinan?.nama_tanda_tangan }}</div>
        </div>
        <div class="flex">
          <div class="w-[200px]">Jabatan</div>
          <div>: {{ data_pimpinan?.jabatan_tanda_tangan }}</div>
        </div>
        <div class="flex">
          <div class="w-[200px]">Alamat</div>
          <div>: {{ data_pimpinan?.alamat_tanda_tangan }}</div>
        </div>
      </div>
    </div>

    <div class="mb-4">
      <p>Dengan ini menyatakan bahwa :</p>
      <div class="flex flex-col gap-1">
        <div class="flex">
          <div class="w-[200px]">Nama</div>
          <div>: {{ data_jamaah?.fullname }}</div>
        </div>
        <div class="flex font-semibold">
          <div class="w-[200px]">Nama di Paspor</div>
          <div>: {{ data_jamaah?.fullname }}</div>
        </div>
        <div class="flex">
          <div class="w-[200px]">NIK</div>
          <div>: {{ data_jamaah?.identity_number }}</div>
        </div>
        <div class="flex">
          <div class="w-[200px]">Tempat / Tanggal Lahir</div>
          <div>
            : {{ data_jamaah?.birth_place.toUpperCase() }},
            {{
              new Date(data_jamaah?.birth_date).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })
            }}
          </div>
        </div>
        <div class="flex">
          <div class="w-[200px]">Alamat</div>
          <div>: {{ data_jamaah?.alamat }}</div>
        </div>
      </div>
    </div>

    <div class="mb-6">
      <p>
        Adalah calon jamaah Umrah {{ data_pimpinan?.nama_perusahaan }} Izin PPIU No :
        {{ data_pimpinan?.izin_perusahaan }} yang akan berangkat pada Bulan
        {{
          typeof data_surat?.info?.text === 'string' && data_surat.info.text.includes('Berangkat: ')
            ? data_surat.info.text.split('Berangkat: ')[1]
            : '-'
        }}, Kami bertanggung jawab dan menjamin sepenuhnya terhadap calon jamaah kami dengan
        memperhatikan hal-hal sebagai berikut:
      </p>

      <ol class="list-decimal ml-8 mt-4 space-y-2">
        <li>
          Permohonan paspor yang kami urus adalah WNI yang akan melakukan perjalanan ke Arab Saudi
          untuk ibadah Umrah. Tidak akan overstay, memalsukan dokumen, atau bekerja ilegal.
        </li>
        <li>
          Apabila terjadi pelanggaran, maka izin usaha kami sebagai penyelenggara ibadah umrah
          bersedia dicabut.
        </li>
      </ol>
    </div>

    <p class="mb-6">
      Demikian surat rekomendasi ini kami perbuat dengan sebenar-benarnya. Atas perhatian dan
      kerjasama yang baik kami ucapkan terima kasih.
    </p>

    <div class="flex justify-between mt-12">
      <div class="text-sm w-1/2 text-left">
        <p>{{ data_pimpinan?.alamat_perusahaan }}</p>
        <p>{{ data_pimpinan?.kota_perusahaan }}, {{ data_pimpinan?.provinsi_perusahaan }}</p>
        <p>Telp: {{ data_pimpinan?.no_kontak_perusahaan }}</p>
        <p>Email: {{ data_pimpinan?.email_perusahaan }}</p>
      </div>
      <div class="w-1/2 text-center">
        <p>Hormat Saya</p>
        <div class="h-16 my-2 border-b border-black w-1/2 mx-auto"></div>
        <p class="font-semibold">{{ data_pimpinan?.nama_tanda_tangan }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'

onMounted(() => {
  setTimeout(() => {
    window.print()
  }, 200)
})

defineProps<{
  data_pimpinan: {
    nama_tanda_tangan: string
    jabatan_tanda_tangan: string
    alamat_tanda_tangan: string
    nama_perusahaan: string
    izin_perusahaan: string
    kota_perusahaan: string
    provinsi_perusahaan: string
    alamat_perusahaan: string
    no_kontak_perusahaan: string
    website_perusahaan: string
    email_perusahaan: string
  }
  data_surat: {
    nomor_surat: string
    tipe_surat: string
    tanggal_surat: string
    info: {
      text: string
      jamaah_id: number
    }
    tujuan: string
    nama_petugas: string
  }
  data_perusahaan: {
    logo: string
    company_name: string
    city: string
  }
  data_jamaah: {
    fullname: string
    identity_number: string
    birth_date: string
    birth_place: string
    alamat: string
  }
}>()
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
