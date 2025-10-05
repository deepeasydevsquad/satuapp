<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useSelectedTab, useGlobalTab, useGlobalActiveTab, useTabTerpilih } from '@/stores/sidebar';
import 'flowbite';

import BerandaUtama from '@/components/User/Modules/BerandaUtama/BerandaUtama.vue';
import TransPaket from '@/components/User/Modules/TransPaket/TransPaket.vue';
import DaftarKota from '@/components/User/Modules/DaftarKota/DaftarKota.vue';
import DaftarFasilitas from '@/components/User/Modules/DaftarFasilitas/DaftarFasilitas.vue';
import DaftarHotel from '@/components/User/Modules/DaftarHotel/DaftarHotel.vue';
import JenisMobil from '@/components/User/Modules/JenisMobil/JenisMobil.vue';
import Cabang from '@/components/User/Modules/Cabang/Cabang.vue';
import Airlines from '@/components/User/Modules/Airlines/Airlines.vue';
import Pengaturan from '@/components/User/Modules/Pengaturan/Pengaturan.vue';
import SistemLog from '@/components/User/Modules/SistemLog/SistemLog.vue';
import DaftarBandara from '@/components/User/Modules/DaftarBandara/DaftarBandara.vue';
import DaftarAsuransi from '@/components/User/Modules/DaftarAsuransi/DaftarAsuransi.vue';
import DaftarProviderVisa from '@/components/User/Modules/DaftarProviderVisa/DaftarProviderVisa.vue';
import DaftarBank from '@/components/User/Modules/DaftarBank/DaftarBank.vue';
import DaftarTipePaket from '@/components/User/Modules/DaftarTipePaket/DaftarTipePaket.vue';
import Grup from '@/components/User/Modules/Grup/Grup.vue';
import Supplier from '@/components/User/Modules/Supplier/Supplier.vue';
import Akun from '@/components/User/Modules/Akun/Akun.vue';
import DaftarMember from '@/components/User/Modules/Member/DaftarMember.vue';
import Pengguna from '@/components/User/Modules/Pengguna/Pengguna.vue';
import Kostumer from '@/components/User/Modules/Kostumer/Kostumer.vue';
import DaftarPaketLa from '@/components/User/Modules/DaftarPaketLa/DaftarPaketLa.vue';
import LevelAgen from '@/components/User/Modules/LevelAgen/LevelAgen.vue';
import DaftarAgen from '@/components/User/Modules/DaftarAgen/DaftarAgen.vue';
import DepositSaldo from '@/components/User/Modules/DepositSaldo/DepositSaldo.vue';
import DaftarJamaah from '@/components/User/Modules/DaftarJamaah/DaftarJamaah.vue';
import DaftarPeminjaman from '@/components/User/Modules/DaftarPeminjaman/DaftarPeminjaman.vue';
import Jurnal from '@/components/User/Modules/Jurnal/Jurnal.vue';
import Investor from '@/components/User/Modules/Investor/Investor.vue';
import DaftarPaket from '@/components/User/Modules/DaftarPaket/DaftarPaket.vue';
import TabunganUmrah from '@/components/User/Modules/TabunganUmrah/TabunganUmrah.vue';
import RiwayatPeminjaman from '@/components/User/Modules/RiwayatPeminjaman/RiwayatPeminjaman.vue';
import TransTiket from '@/components/User/Modules/TransTiket/TransTiket.vue';
import DaftarSuratMenyurat from '@/components/User/Modules/DaftarSuratMenyurat/DaftarSuratMenyurat.vue';
import BukuBesar from '@/components/User/Modules/BukuBesar/BukuBesar.vue';
import NeracaLajur from '@/components/User/Modules/NeracaLajur/NeracaLajur.vue';
import LabaRugi from '@/components/User/Modules/LabaRugi/LabaRugi.vue';
import Neraca from '@/components/User/Modules/Neraca/Neraca.vue';
import PengaturanPerangkanWhatsap from '@/components/User/Modules/PengaturanPerangkatWhatsapp/PengaturanPerangkanWhatsap.vue';
import TemplatePesanWhatsapp from '@/components/User/Modules/TemplatePesanWhatsapp/TemplatePesanWhatsapp.vue';
import TransaksiVisa from '@/components/User/Modules/TransaksiVisa/TransaksiVisa.vue';
import PesanWhatsapp from '@/components/User/Modules/PesanWhatsapp/PesanWhatsapp.vue';
import PembayaranFeeAgen from '@/components/User/Modules/PembayaranFeeAgen/PembayaranFeeAgen.vue';
import TransaksiPassport from '@/components/User/Modules/TransaksiPassport/TransaksiPassport.vue';
import TransHotel from '@/components/User/Modules/TransHotel/TransHotel.vue';
import Modal from '@/components/User/Modules/Modal/Modal.vue';
import TransTransport from '@/components/User/Modules/TransTransport/TransTransport.vue';
import RekapitulasiTicket from '@/components/User/Modules/RekapitulasiTicket/RekapitulasiTicket.vue';
import KasKeluarMasuk from '@/components/User/Modules/KasKeluarMasuk/KasKeluarMasuk.vue';
import DaftarPembayaran from '@/components/User/Modules/PembayaranGaji/DaftarPembayaran.vue';
import DaftarStokFasilitas from '@/components/User/Modules/DaftarStokFasilitas/DaftarStokFasilitas.vue';
import Headline from '@/components/User/Modules/Headline/Headline.vue';
import ItemFasilitas from '@/components/User/Modules/ItemFasilitas/ItemFasilitas.vue';
import AkunBank from '@/components/User/Modules/AkunBank/AkunBank.vue';
import DaftarProdukPpob from '@/components/User/Modules/DaftarProdukPpob/DaftarProdukPpob.vue';
import TransFasilitas from '@/components/User/Modules/TransFasilitas/TransFasilitas.vue';
import RiwayatTransaksiPpob from '@/components/User/Modules/RiwayatTransaksiPpob/RiwayatTransaksiPpob.vue';
import PermintaanDepositMember from '@/components/User/Modules/PermintaanDepositMember/PermintaanDepositMember.vue';
import RiwayatDepositMaskapai from '@/components/User/Modules/RiwayatDepositMaskapai/RiwayatDepositMaskapai.vue';
import RequestMember from '@/components/User/Modules/RequestMember/RequestMember.vue';
import RiwayatTambahSaldoPerusahaan from '@/components/User/Modules/RiwayatTambahSaldoPerusahaan/RiwayatTambahSaldoPerusahaan.vue';
import RiwayatMutasiSaldoPerusahaan from '@/components/User/Modules/RiwayatMutasiSaldoPerusahaan/RiwayatMutasiSaldoPerusahaan.vue';

const tabComponents = {
  beranda_utama: BerandaUtama,
  trans_paket: TransPaket,
  trans_tiket: TransTiket,
  daftar_kota: DaftarKota,
  daftar_fasilitas: DaftarFasilitas,
  daftar_mobil: JenisMobil,
  daftar_cabang: Cabang,
  pengaturan: Pengaturan,
  daftar_hotel: DaftarHotel,
  airlines: Airlines,
  daftar_bandara: DaftarBandara,
  daftar_asuransi: DaftarAsuransi,
  daftar_provider_visa: DaftarProviderVisa,
  daftar_bank: DaftarBank,
  system_log: SistemLog,
  daftar_grup: Grup,
  daftar_tipe_paket: DaftarTipePaket,
  supplier: Supplier,
  akun: Akun,
  daftar_member: DaftarMember,
  kostumer: Kostumer,
  daftar_paket_la: DaftarPaketLa,
  pengguna: Pengguna,
  level_agen: LevelAgen,
  daftar_agen: DaftarAgen,
  deposit_saldo: DepositSaldo,
  daftar_jamaah: DaftarJamaah,
  daftar_peminjaman: DaftarPeminjaman,
  jurnal: Jurnal,
  investor: Investor,
  daftar_paket: DaftarPaket,
  tabungan_umrah: TabunganUmrah,
  riwayat_transaksi_peminjaman: RiwayatPeminjaman,
  buku_besar: BukuBesar,
  daftar_surat_menyurat: DaftarSuratMenyurat,
  neraca_lajur: NeracaLajur,
  laba_rugi: LabaRugi,
  neraca: Neraca,
  pengaturan_perangkat_whatsapp: PengaturanPerangkanWhatsap,
  template_pesan_whatsapp: TemplatePesanWhatsapp,
  trans_visa: TransaksiVisa,
  pesan_whatsapp: PesanWhatsapp,
  pembayaran_fee_agen: PembayaranFeeAgen,
  trans_passport: TransaksiPassport,
  trans_hotel: TransHotel,
  modal: Modal,
  trans_transport: TransTransport,
  rekapitulasi_tiket: RekapitulasiTicket,
  kas_keluar_masuk: KasKeluarMasuk,
  riwayat_pembayaran_gaji_staff: DaftarPembayaran,
  daftar_stok_fasilitas: DaftarStokFasilitas,
  daftar_item_fasilitas: ItemFasilitas,
  headline: Headline,
  daftar_akun_bank_perusahaan: AkunBank,
  daftar_produk_ppob: DaftarProdukPpob,
  riwayat_transaksi_ppob: RiwayatTransaksiPpob,
  permintaan_deposit_member: PermintaanDepositMember,
  trans_fasilitas: TransFasilitas,
  riwayat_deposit_maskapai: RiwayatDepositMaskapai,
  request_member: RequestMember,
  riwayat_tambah_saldo_perusahaan: RiwayatTambahSaldoPerusahaan,
  riwayat_mutasi_saldo_perusahaan: RiwayatMutasiSaldoPerusahaan,
};

const selectedTab = useSelectedTab(); // untuk menampung daftar tab yang menu / submenunya di click
const tab = useGlobalTab();
const activeTab = useGlobalActiveTab();
const tabTerpilih = useTabTerpilih();

//const props = defineProps<{ default: string; tabAwal: any }>()
const mulaiPilihTab = ref(false);

const selectTab = (tabPath: string, key: number) => {
  // tabTerpilih.value = key
  tabTerpilih.setNumber(key);
  activeTab.setString(tabPath); // Menandai tab yang dipilih
  mulaiPilihTab.value = true;
};
</script>

<template>
  <!--  -->
  <div class="mb-0 dark:border-gray-700">
    <ul
      class="flex flex-wrap -mb-px text-sm font-medium text-center text-graydark"
      id="default-tab"
      data-tabs-toggle="#default-tab-content"
      role="tablist"
    >
      <li
        class="me-2"
        role="presentation"
        v-for="(item, key) in selectedTab.sharedArray"
        :key="key"
      >
        <button
          class="inline-block p-4 rounded-t-lg rrr"
          :id="`${tab.sharedObject[item.id].path}-tab`"
          :data-tabs-target="`#${tab.sharedObject[item.id].path}`"
          type="button"
          role="tab"
          :aria-controls="`${tab.sharedObject[item.id].path}`"
          :aria-selected="
            activeTab.sharedString === tab.sharedObject[item.id].path ||
            (tabTerpilih.sharedNumber === 0 && key === 0)
              ? 'true'
              : 'false'
          "
          @click="selectTab(tab.sharedObject[item.id].path, key)"
          :class="
            activeTab.sharedString === tab.sharedObject[item.id].path ||
            (tabTerpilih.sharedNumber === 0 && key === 0)
              ? 'AAA bg-white !text-[#3a477d] font-bold hover:text-[#3a477d] dark:text-[#3a477d] dark:hover:text-[#3a477d] border-[#3a477d] dark:border-[#3a477d]'
              : 'BBB inline-block p-4 rounded-t-lg dark:border-transparent text-gray-500 hover:text-gray-600 dark:text-gray-400 border-gray-100 hover:border-gray-300 dark:border-gray-700 dark:hover:text-gray-300'
          "
        >
          <font-awesome-icon :icon="tab.sharedObject[item.id].icon" />
          {{ tab.sharedObject[item.id].name }}
        </button>
      </li>
    </ul>
  </div>

  <div id="default-tab-content ">
    <div
      v-for="(item, key) in selectedTab.sharedArray"
      :key="key"
      class="p-4 rounded-lg bg-gray-50 dark:bg-gray-800 min-h-[500px]"
      :class="
        (activeTab.sharedString === tab.sharedObject[item.id].path ||
        (tabTerpilih.sharedNumber === 0 && key === 0)
          ? ''
          : 'hidden') + (key === 0 ? ' rounded-tl-none' : '')
      "
      :id="tab.sharedObject[item.id].path"
      role="tabpanel"
      :aria-labelledby="`${tab.sharedObject[item.id].path}-tab`"
    >
      <p
        class="px-5 mb-5 text-sm text-gray-900 dark:text-white"
        v-html="tab.sharedObject[item.id].desc"
      ></p>
      <component :is="tabComponents[tab.sharedObject[item.id].path]" class="tab"></component>
    </div>
  </div>
</template>

<style scoped></style>
