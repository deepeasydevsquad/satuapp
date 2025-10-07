<script setup lang="ts">
import Form from '@/components/Modal/Form.vue'
import { ref, watch, onMounted } from 'vue'
import { getDetailUrl } from '@/service/trans_tiket'

const props = defineProps<{ formStatus: boolean, id: number }>()
const emit = defineEmits<{ (e: 'cancel'): void , (e: 'submitted'): void }>()

// nomor_registrasi: sql.nomor_registrasi,
//           pax: sql.pax,
//           code_booking: sql.code_booking,
//           travel_price: sql.travel_price,
//           costumer_price: sql.costumer_price,
//           departure_date: sql.departure_date

interface DetailInfoTransaksi {
  status: string
  nomor_registrasi: string
  maskapai: string
  kostumer: string
  paket: string
  pax: number
  code_booking: string
  travel_price: number
  costumer_price: number
  departure_date: string
}

interface RiwayatPembayaran {
  invoice: string
  nominal: string
  petugas: string
  tanggal_transaksi: string
  status: string
}

interface Data {
  detail_info_transaksi: DetailInfoTransaksi
  riwayat_pembayaran: RiwayatPembayaran[]
}



const data = ref<Partial<Data>>({});

const formatRupiah = (angka :any, prefix = "Rp ") => {
  let numberString = angka.toString().replace(/\D/g, ""),
    split = numberString.split(","),
    sisa = split[0].length % 3,
    rupiah = split[0].substr(0, sisa),
    ribuan = split[0].substr(sisa).match(/\d{3}/g);

  if (ribuan) {
    let separator = sisa ? "." : "";
    rupiah += separator + ribuan.join(".");
  }

  return prefix + (rupiah || "0");
};

const fetchData = async () => {
  try {
    const response = await getDetailUrl({ id: props.id });

    console.log("XXXXXX");
    console.log(response.data.data);
    console.log("XXXXXX");
    data.value = response.data.data;
  } catch (error) {
    console.error(error)
  }
}

watch( () => props.formStatus, async () => { fetchData(); });

</script>

<template>
  <Form :form-status="formStatus" :label="'Detail Pembayaran Tiket'" :width="'w-1/2'" @cancel="emit('cancel')">
    <div class="text-base font-semibold text-gray-800 mb-4">
      Informasi Transaksi
    </div>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-0 pr-3 text-sm" :class="data.detail_info_transaksi?.status != 'active' ? ' pointer-events-none opacity-50 ' : '' ">
      <div class="md:col-span-1 ">
        <table class="w-full mb-5 text-gray-500">
          <tbody>
            <tr>
              <td class="w-[50%] border-b border-l border-t px-6 py-2">Nomor Registrasi</td>
              <td class="text-center border-b border-t py-2">:</td>
              <td class="text-right space-y-2 text-sm border-b border-t border-r px-6 py-2">
                <span v-if="data.detail_info_transaksi?.status === 'refund'" class="text-red font-bold float-start">
                  (REFUND)
                </span>
                {{ data.detail_info_transaksi?.nomor_registrasi }}
              </td>
            </tr>
            <tr>
              <td class="border-b border-l border-t px-6 py-2">Kode Booking</td>
              <td class="text-center border-b border-t py-2">:</td>
              <td class="text-right space-y-2 text-sm border-b border-t border-r px-6 py-2">{{ data.detail_info_transaksi?.code_booking }}</td>
            </tr>
            <tr v-if="data.detail_info_transaksi?.kostumer != '-'">
              <td class="border-b border-l border-t px-6 py-2">Nama Kostumer</td>
              <td class="text-center border-b border-t py-2">:</td>
              <td class="text-right space-y-2 text-sm border-b border-t border-r px-6 py-2">{{ data.detail_info_transaksi?.kostumer }}</td>
            </tr>
            <tr v-if="data.detail_info_transaksi?.kostumer == '-'">
              <td class="border-b border-l border-t px-6 py-2">Nama Paket</td>
              <td class="text-center border-b border-t py-2">:</td>
              <td class="text-right space-y-2 text-sm border-b border-t border-r px-6 py-2">{{ data.detail_info_transaksi?.paket }}</td>
            </tr>
            <tr>
              <td class="border-b border-l border-t px-6 py-2">Tanggal Keberangkatan</td>
              <td class="text-center border-b border-t py-2">:</td>
              <td class="text-right space-y-2 text-sm border-b border-t border-r px-6 py-2">{{ data.detail_info_transaksi?.departure_date }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="md:col-span-1 ">
        <table class="w-full mb-5 text-gray-500">
          <tbody>
            <tr>
              <td class="w-[50%] border-b border-l border-t px-6 py-2">Maskapai</td>
              <td class="text-center border-b border-t py-2">:</td>
              <td class="text-right space-y-2 text-sm border-b border-t border-r px-6 py-2">{{ data.detail_info_transaksi?.maskapai }}</td>
            </tr>
            <tr>
              <td class="border-b border-l border-t px-6 py-2">Pax</td>
              <td class="text-center border-b border-t py-2">:</td>
              <td class="text-right space-y-2 text-sm border-b border-t border-r px-6 py-2">{{ data.detail_info_transaksi?.pax }} Pax</td>
            </tr>
            <tr>
              <td class="border-b border-l border-t px-6 py-2">Harga Travel</td>
              <td class="text-center border-b border-t py-2">:</td>
              <td class="text-right space-y-2 text-sm border-b border-t border-r px-6 py-2">{{ formatRupiah(data.detail_info_transaksi?.travel_price) }}</td>
            </tr>
            <tr>
              <td class="border-b border-l border-t px-6 py-2">Harga Kostumer</td>
              <td class="text-center border-b border-t py-2">:</td>
              <td class="text-right space-y-2 text-sm border-b border-t border-r px-6 py-2">{{ formatRupiah(data.detail_info_transaksi?.costumer_price) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <div class="text-base font-semibold text-gray-800 mb-4">
      Detail Pembayaran
    </div>
    <table v-if="data && data.riwayat_pembayaran" class="w-full border-collapse bg-white text-center text-sm text-gray-500" :class="data.detail_info_transaksi?.status != 'active' ? ' pointer-events-none opacity-50 ' : '' " >
      <thead class="bg-gray-100 text-gray-800">
        <tr>
          <th class="w-[25%] px-4 py-2 border font-medium">Invoice</th>
          <th class="w-[25%] px-4 py-2 border font-medium">Petugas</th>
          <th class="w-[25%] px-4 py-2 border font-medium">Nominal</th>
          <th class="w-[25%] px-4 py-2 border font-medium">Status</th>
        </tr>
      </thead>
      <tbody v-if="data.riwayat_pembayaran.length > 0">
        <tr v-for="(item, index) in data.riwayat_pembayaran" :key="index" class="hover:bg-gray-50">
          <td class="px-4 py-2 border-b text-center">
            <div class="font-medium text-gray-800">
              {{ item.invoice }}
            </div>
            <div class="text-xs text-gray-500">
              {{ item.tanggal_transaksi }}
            </div>
          </td>
          <td class="px-4 py-2 border-b">{{ item.petugas }}</td>
          <td class="px-4 py-2 border-b">{{ formatRupiah(item.nominal) }}</td>
          <td class="px-4 py-2 border-b capitalize">{{ item.status }}</td>
        </tr>
      </tbody>
      <tbody v-else>
        <tr>
          <td colspan="5" class="text-center py-4 text-gray-500">Belum ada riwayat pembayaran.</td>
        </tr>
      </tbody>
    </table>
  </Form>
</template>
