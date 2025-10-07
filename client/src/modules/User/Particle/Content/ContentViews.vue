<script setup lang="ts">
import { ref, onMounted, watch, nextTick } from 'vue';
import { useSelectedTab, useGlobalTab, useGlobalActiveTab, useTabTerpilih } from '@/stores/sidebar';
import 'flowbite';
import { initTooltips } from 'flowbite';
import BerandaUtama from '@/modules/BerandaUtama/BerandaUtama.vue';
import TransPaket from '@/modules/TransPaket/TransPaket.vue';
import DaftarKota from '@/modules/DaftarKota/DaftarKota.vue';
import DaftarFasilitas from '@/modules/DaftarFasilitas/DaftarFasilitas.vue';
import DaftarHotel from '@/modules/DaftarHotel/DaftarHotel.vue';
import JenisMobil from '@/modules/JenisMobil/JenisMobil.vue';
import Cabang from '@/modules/Cabang/Cabang.vue';
import Airlines from '@/modules/Airlines/Airlines.vue';
import Pengaturan from '@/modules/Pengaturan/Pengaturan.vue';
import SistemLog from '@/modules/SistemLog/SistemLog.vue';
import DaftarBandara from '@/modules/DaftarBandara/DaftarBandara.vue';
import DaftarAsuransi from '@/modules/DaftarAsuransi/DaftarAsuransi.vue';
import DaftarProviderVisa from '@/modules/DaftarProviderVisa/DaftarProviderVisa.vue';
import DaftarBank from '@/modules/DaftarBank/DaftarBank.vue';
import DaftarTipePaket from '@/modules/DaftarTipePaket/DaftarTipePaket.vue';
import Grup from '@/modules/Grup/Grup.vue';
import Supplier from '@/modules/Supplier/Supplier.vue';
import Akun from '@/modules/Akun/Akun.vue';
import DaftarMember from '@/modules/Member/DaftarMember.vue';
import Pengguna from '@/modules/Pengguna/Pengguna.vue';
import Kostumer from '@/modules/Kostumer/Kostumer.vue';
import DaftarPaketLa from '@/modules/DaftarPaketLa/DaftarPaketLa.vue';
import LevelAgen from '@/modules/LevelAgen/LevelAgen.vue';
import DaftarAgen from '@/modules/DaftarAgen/DaftarAgen.vue';
import DepositSaldo from '@/modules/DepositSaldo/DepositSaldo.vue';
import DaftarJamaah from '@/modules/DaftarJamaah/DaftarJamaah.vue';
import DaftarPeminjaman from '@/modules/DaftarPeminjaman/DaftarPeminjaman.vue';
import Jurnal from '@/modules/Jurnal/Jurnal.vue';
import Investor from '@/modules/Investor/Investor.vue';
import DaftarPaket from '@/modules/DaftarPaket/DaftarPaket.vue';
import TabunganUmrah from '@/modules/TabunganUmrah/TabunganUmrah.vue';
import RiwayatPeminjaman from '@/modules/RiwayatPeminjaman/RiwayatPeminjaman.vue';
import TransTiket from '@/modules/TransTiket/TransTiket.vue';
import DaftarSuratMenyurat from '@/modules/DaftarSuratMenyurat/DaftarSuratMenyurat.vue';
import BukuBesar from '@/modules/BukuBesar/BukuBesar.vue';
import NeracaLajur from '@/modules/NeracaLajur/NeracaLajur.vue';
import LabaRugi from '@/modules/LabaRugi/LabaRugi.vue';
import Neraca from '@/modules/Neraca/Neraca.vue';
import PengaturanPerangkanWhatsap from '@/modules/PengaturanPerangkatWhatsapp/PengaturanPerangkanWhatsap.vue';
import TemplatePesanWhatsapp from '@/modules/TemplatePesanWhatsapp/TemplatePesanWhatsapp.vue';
import TransaksiVisa from '@/modules/TransaksiVisa/TransaksiVisa.vue';
import PesanWhatsapp from '@/modules/PesanWhatsapp/PesanWhatsapp.vue';
import PembayaranFeeAgen from '@/modules/PembayaranFeeAgen/PembayaranFeeAgen.vue';
import TransaksiPassport from '@/modules/TransaksiPassport/TransaksiPassport.vue';
import TransHotel from '@/modules/TransHotel/TransHotel.vue';
import Modal from '@/modules/Modal/Modal.vue';
import TransTransport from '@/modules/TransTransport/TransTransport.vue';
import RekapitulasiTicket from '@/modules/RekapitulasiTicket/RekapitulasiTicket.vue';
import KasKeluarMasuk from '@/modules/KasKeluarMasuk/KasKeluarMasuk.vue';
import DaftarPembayaran from '@/modules/PembayaranGaji/DaftarPembayaran.vue';
import DaftarStokFasilitas from '@/modules/DaftarStokFasilitas/DaftarStokFasilitas.vue';
import Headline from '@/modules/Headline/Headline.vue';
import ItemFasilitas from '@/modules/ItemFasilitas/ItemFasilitas.vue';
import AkunBank from '@/modules/AkunBank/AkunBank.vue';
import DaftarProdukPpob from '@/modules/DaftarProdukPpob/DaftarProdukPpob.vue';
import TransFasilitas from '@/modules/TransFasilitas/TransFasilitas.vue';
import RiwayatTransaksiPpob from '@/modules/RiwayatTransaksiPpob/RiwayatTransaksiPpob.vue';
import PermintaanDepositMember from '@/modules/PermintaanDepositMember/PermintaanDepositMember.vue';
import RiwayatDepositMaskapai from '@/modules/RiwayatDepositMaskapai/RiwayatDepositMaskapai.vue';
import RequestMember from '@/modules/RequestMember/RequestMember.vue';
import RiwayatTambahSaldoPerusahaan from '@/modules/RiwayatTambahSaldoPerusahaan/RiwayatTambahSaldoPerusahaan.vue';
import RiwayatMutasiSaldoPerusahaan from '@/modules/RiwayatMutasiSaldoPerusahaan/RiwayatMutasiSaldoPerusahaan.vue';

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

watch(
  () => selectedTab.sharedArray,
  async () => {
    await nextTick();
    initTooltips();
  },
  { deep: true },
);
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
        <div
          :id="`tooltip-default-${tab.sharedObject[item.id].path}`"
          role="tooltip"
          class="absolute invisible inline-block px-3 py-2 text-sm font-medium text-white transition-opacity duration-300 bg-graydark rounded-lg shadow-xs opacity-0 tooltip dark:bg-gray-700 z-999999"
        >
          {{ tab.sharedObject[item.id].name }}
          <div class="tooltip-arrow" data-popper-arrow></div>
        </div>
        <button
          :data-tooltip-target="`tooltip-default-${tab.sharedObject[item.id].path}`"
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
              ? 'AAA bg-white !text-green-900 font-bold hover:text-green-900 dark:text-green-900 dark:hover:text-green-900 border-green-900 dark:border-green-900'
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
