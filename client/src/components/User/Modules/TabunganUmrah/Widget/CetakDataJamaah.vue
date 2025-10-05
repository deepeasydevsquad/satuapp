<script setup lang="ts">
import Header from '@/components/User/Modules/TabunganUmrah/Particle/Header.vue';
import Footer from '@/components/User/Modules/TabunganUmrah/Particle/Footer.vue';
import { ref, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { cetakDataJamaahTabunganUmrah } from '@/service/tabungan_umrah';

const isLoading = ref(true);
const data = ref<any>(null)
const route = useRoute();

const params = route.params;
const query = route.query;

const fetchData = async () => {
  isLoading.value = true;
  try {
    const response = await cetakDataJamaahTabunganUmrah(params.id, query.petugasId);
    data.value = response.data;
    console.log('Petugas data:', data.value);
  } catch (error) {
    console.error('Error fetching petugas:', error);
  } finally {
    isLoading.value = false;
  }
};

watch(data, () => {
  if (data.value) {
    setTimeout(() => {
      window.scrollTo(0, 0);
      window.print();
      setTimeout(() => {
        if (window.opener) {
          window.opener.postMessage({ event: 'sukses', message: 'Data jamaah berhasil dicetak' }, '*');
        }
        window.close();
      }, 500);
    }, 500);
  }
});

onMounted(async () => {
  await fetchData();
  if (!data.value || data.value.length === 0) {
    if (window.opener) {
      window.opener.postMessage({ event: 'gagal', message: 'Data jamaah tidak ditemukan' }, '*');
      window.close();
    } else {
      window.close();
    }
  }
});

const groupTanggalKotak = (tanggal: string) => {
  const parts = tanggal.split('-');
  if (parts.length !== 3 || parts.some(part => part.length === 0)) {
    return ['-', '-', '-', '-', '|', '-', '-', '|', '-', '-'];
  }

  const [tahun, bulan, hari] = parts;
  return [
    ...tahun.split(''),
    '|',
    ...bulan.split(''),
    '|',
    ...hari.split('')
  ];
};

function formatDateToBoxes(dateStr: string): string[] {
  if (!dateStr || dateStr.trim().length !== 10) {
    return Array(10).fill('-');
  }
  return dateStr.split('');
}
</script>


<template>
  <div v-if="isLoading" class="flex justify-center items-center h-screen">
    <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900"></div>
  </div>
  <div v-if="!isLoading && data">
    <div class="bg-white text-gray-800 max-w-[216mm] mx-auto min-h-[356mm] p-8 font-serif text-sm print:text-xs print:shadow-none space-y-[10px] print:bg-white print:text-black print:max-w-full">
      <!-- Header Kwitansi -->
      <Header :data="data"></Header>

      <!-- Judul -->
      <h2 class="text-center text-lg font-bold pb-2 mb-4">
        FORMULIR PENDAFTARAN UMRAH
      </h2>

      <div class="flex justify-center">
        <p class="font-medium mr-10">Nama Paket : {{ data.nama_paket }}</p>
        <p class="font-medium">Nomor Register : {{ data.nomor_register }}</p>
      </div>

      <div class="flex items-center">
        <p class="w-50 font-medium">Nama Jamaah</p>
        <div class="border border-gray-900 px-3 flex-grow">
          {{ data.fullname_jamaah }}
        </div>
      </div>

      <div class="flex items-center">
        <p class="w-50 font-medium">Nama Ayah Kandung</p>
        <div class="border border-gray-900 px-3 flex-grow">
          {{ data.nama_ayah }}
        </div>
      </div>

      <div class="flex items-center">
        <p class="w-50 font-medium">Tempat Lahir</p>
        <div class="border border-gray-900 px-3 flex-grow">
          {{ data.birth_place }}
        </div>
        <div class="flex items-center gap-1 ml-4">
          <label class="w-20">Tanggal</label>
          <div class="flex items-center mr-10">
            <template v-for="(char, index) in groupTanggalKotak(data.birth_date)" :key="index">
              <div
                v-if="char !== '|'"
                class="w-7 h-7 border border-gray-900 flex items-center justify-center "
              >
                {{ char }}
              </div>
              <div v-else class="w-3"></div>
            </template>
          </div>
        </div>
      </div>

      <div class="flex items-center flex-wrap gap-4">
        <div class="flex items-center gap-2 min-w-[250px]">
          <p class="w-48 font-medium">Jenis Kelamin</p>
          <div class="w-6 h-6 border border-gray-900 flex items-center justify-center ">
            {{ data.gender }}
          </div>
          <p class="ml-2">1. Laki-laki</p>
          <p class="ml-2">2. Perempuan</p>
        </div>

        <div class="flex items-center gap-2 min-w-[100px]">
          <p class="w-12 font-medium">Umur</p>
          <div class="w-6 h-6 border border-gray-900 flex items-center justify-center ">
            {{ data.umur }}
          </div>
        </div>

        <div class="flex items-center gap-2 min-w-[100px]">
          <p class="w-8 font-medium">GD</p>
          <div class="w-6 h-6 border border-gray-900 flex items-center justify-center ">
            {{ data.blood_type }}
          </div>
        </div>
      </div>

      <div class="flex">
        <p class="w-50 font-medium">Data Passport</p>
        <div class="flex gap-10">

          <!-- Kiri: Nomor Passport dan Tempat -->
          <div>
            <div class="border border-gray-900">
              <p class=" font-semibold text-center border-b border-gray-900">NOMOR PASSPORT</p>
              <div class="flex justify-center">
                <template v-for="(char, index) in Array(9).fill('-').map((_, i) => data.nomor_passport?.[i] || '-')" :key="index">
                  <div class="w-6 h-8 border border-gray-900 flex items-center justify-center ">{{ char }}</div>
                </template>
              </div>
            </div>
            <div class="border border-gray-900 mt-2">
              <p class="font-semibold text-center border-b border-gray-900">TEMPAT DIKELUARKAN</p>
              <p class="h-8 border border-gray-900 font-semibold pt-1 text-center justify-center">{{ data.tempat_di_keluarkan_passport }}</p>
            </div>
          </div>

          <!-- Kanan: Tanggal Dikeluarkan dan Masa Berlaku -->
          <div class="flex flex-col gap-2">
            <div class="border border-gray-900">
              <p class=" font-semibold text-center border-b border-gray-900">TANGGAL DIKELUARKAN</p>
              <div class="flex">
                <template v-for="(char, index) in formatDateToBoxes(data.tanggal_di_keluarkan_passport)" :key="'issued' + index">
                  <div class="w-6 h-8 border border-gray-900 flex items-center justify-center ">{{ char }}</div>
                </template>
              </div>
            </div>
            <div class="border border-gray-900">
              <p class=" font-semibold text-center border-b border-gray-900">MASA BERLAKU</p>
              <div class="flex">
                <template v-for="(char, index) in formatDateToBoxes(data.masa_berlaku_passport)" :key="'valid' + index">
                  <div class="w-6 h-8 border border-gray-900 flex items-center justify-center ">{{ char }}</div>
                </template>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="flex items-center">
        <p class="w-50 font-medium">Alamat</p>
        <div class="border border-gray-900 px-3 flex-grow">
          {{ data.alamat }}
        </div>
      </div>


      <div class="flex items-center">
        <p class="w-50 font-medium">Desa/Kelurahan</p>
        <div class="border border-gray-900 px-3 flex-grow">
          {{ data.kelurahan }}
        </div>
      </div>

      <div class="flex items-center">
        <p class="w-50 font-medium">Kecamatan</p>
        <div class="border border-gray-900 px-3 flex-grow">
          {{ data.kecamatan }}
        </div>
      </div>

      <div class="flex items-center">
        <p class="w-50 font-medium">Kabupaten Kota</p>
        <div class="border border-gray-900 px-3 flex-grow">
          {{ data.kabupaten }}
        </div>
      </div>

      <div class="flex items-center">
        <p class="w-50 font-medium">Provinsi</p>
        <div class="border border-gray-900 px-3 flex-grow">
          {{ data.provinsi }}
        </div>
        <div class="flex items-center gap-1 ml-4">
          <label class="w-20 font-medium">Kode Pos</label>
          <div class="flex items-center mr-10">
            <template v-for="(char, index) in data.kode_pos.split('')" :key="index">
              <div class="w-6 h-8 border border-gray-900 flex items-center justify-center ">{{ char }}</div>
            </template>
          </div>
        </div>
      </div>

      <div class="flex items-center">
        <p class="w-50 font-medium">Telepon</p>
        <div class="border border-gray-900 px-3 flex-grow">
          {{ data.nomor_telephone }}
        </div>
        <div class="flex items-center gap-1 ml-4">
          <p class="w-20 font-medium">Hp</p>
          <div class="border border-gray-900 px-4 mr-10 flex-grow">
            {{ data.whatsapp_number }}
          </div>
        </div>
      </div>

      <div class="flex items-center">
        <p class="w-50 font-medium">Email</p>
        <div class="border border-gray-900 px-3 flex-grow">
          {{ data.email_jamaah }}
        </div>
      </div>

      <div class="flex gap-6">
        <div class="flex items-center w-3/4">
          <p class="w-50 font-medium">Pengalaman Haji</p>
          <div class="w-6 h-6 border border-gray-900 flex items-center justify-center  font-medium">
            {{ data.pengalaman_haji }}
          </div>
          <p class="ml-2">A. Belum Pernah B. Sudah - Kali</p>
        </div>

        <div class="flex items-center w-1/4">
          <p class="w-28">Tahun Terakhir</p>
          <div class="border border-gray-900 px-3 min-w-[120px]">
            {{ data.tahun_haji }}
          </div>
        </div>
      </div>
      <div class="flex gap-6 mt-2">
        <div class="flex items-center w-3/4">
          <p class="w-50 font-medium">Pengalaman Umrah</p>
          <div class="w-6 h-6 border border-gray-900 flex items-center justify-center  font-medium">
            {{ data.pengalaman_umrah }}
          </div>
          <p class="ml-2">A. Belum Pernah B. Sudah - Kali</p>
        </div>

        <div class="flex items-center w-1/4">
          <p class="w-28">Tahun Terakhir</p>
          <div class="border border-gray-900 px-3 min-w-[120px]">
            {{ data.tahun_umrah }}
          </div>
        </div>
      </div>

      <div class="flex items-center">
        <p class="w-50 font-medium">Program yang Dipilih</p>
        <template v-for="(char, index) in groupTanggalKotak(data.departure_date)" :key="index">
          <div
            v-if="char !== '|'"
            class="w-7 h-7 border border-gray-900 flex items-center justify-center "
          >
            {{ char }}
          </div>
          <div v-else class="w-3"></div>
        </template>
      </div>

      <div class="flex items-center">
        <p class="w-50 font-medium">Berangkat Dari</p>
        <div class="border border-gray-900 px-3 flex-grow">
          {{ data.departure_from }}
        </div>
      </div>

      <div class="flex items-center">
        <p class="w-50 font-medium">Penyakit</p>
        <div class="border border-gray-900 px-3 flex-grow">
          {{ data.desease }}
        </div>
      </div>

      <div class="flex items-center">
        <p class="w-50 font-medium">Pendidikan Terakhir</p>
        <div class="w-6 h-6 border border-gray-900 flex items-center justify-center ">
          {{ data.pendidikan }}
        </div>
        <p class="text-[10px] ml-2">1. Belum Sekolah</p>
        <p class="text-[10px] ml-2">2. MI/SD</p>
        <p class="text-[10px] ml-2">3. SLTP/Sederajat</p>
        <p class="text-[10px] ml-2">4. SLTA/Sederajat</p>
        <p class="text-[10px] ml-2">5. D1/D2/D3/D4</p>
        <p class="text-[10px] ml-2">6. S1</p>
        <p class="text-[10px] ml-2">7. S2</p>
        <p class="text-[10px] ml-2">8. S3</p>
      </div>

      <div class="flex items-center">
        <p class="w-50 font-medium">Pekerjaan</p>
        <div class="border border-gray-900 px-3 flex-grow">
          {{ data.pekerjaan }}
        </div>
      </div>

      <div class="flex items-center">
        <p class="w-50 font-medium">Nama Instansi Pekerjaan</p>
        <div class="border border-gray-900 px-3 flex-grow">
          {{ data.profession_instantion_name}}
        </div>
      </div>

      <div class="flex items-center">
        <p class="w-50 font-medium">Alamat dan Telepon Pekerjaan</p>
        <div class="border border-gray-900 px-3 flex-grow">
          {{ data.profession_instantion_address}} {{ data.profession_instantion_telephone}}
        </div>
      </div>

      <div class="flex items-center">
        <div class="flex items-center w-3/4">
          <p class="w-50 font-medium">Status</p>
          <div class="w-6 h-6 border border-gray-900 flex items-center justify-center  font-medium">
            {{ data.status_nikah }}
          </div>
          <p class="ml-2">1. Menikah</p>
          <p class="ml-2">2. Belum Menikah</p>
          <p class="ml-2">3. Janda Duda</p>
        </div>
        <p class="w-28 font-medium">Tahun Nikah</p>
        <div class="min-w-[120px] border border-gray-900 px-3 flex-grow">
          {{ data.tanggal_nikah }}
        </div>
      </div>

      <div class="flex items-center">
        <p class="w-50 font-medium">Keluarga yang ikut bersama</p>
        <table class="ml-1 w-3/4">
          <thead>
            <tr>
              <th class="border border-gray-900 px-3">NAMA</th>
              <th class="border border-gray-900 px-3">HUBUNGAN</th>
              <th class="border border-gray-900 px-3">TELPON/HP</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="mahram in data.mahram" :key="mahram.id" class="text-center">
              <td class="border border-gray-900 px-3">{{ mahram.fullname }}</td>
            <td class="border border-gray-900 px-3">{{ mahram.mahram_type }}</td>
            <td class="border border-gray-900 px-3">{{ mahram.nomor_telephone }}</td>
          </tr>
        </tbody>
      </table>
    </div>

      <p class="pt-2 font-medium">Keluarga yang dapat dihubungi</p>

      <div class="flex items-center">
        <p class="w-50 font-medium">Nama</p>
        <div class="border border-gray-900 px-3 flex-grow">
          {{ data.nama_keluarga }}
        </div>
      </div>

      <div class="flex items-center">
        <p class="w-50 font-medium">Alamat dan Telepon</p>
        <div class="border border-gray-900 px-3 flex-grow">
          {{ data.alamat_keluarga }} {{ data.telephone_keluarga }}
        </div>
      </div>

        <div class="flex items-center pt-10" style="page-break-inside: avoid;">
          <Footer :data="data"></Footer>
        </div>

    </div>
  </div>
</template>

<style scoped>
@media print {
  @page {
    size: 8.5in 14in; /* Legal Size */
    margin: 0;
    -webkit-print-color-adjust: exact;
  }
}
</style>
