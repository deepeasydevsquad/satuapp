import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '@/views/HomeView.vue';
import UserView from '@/views/UserView.vue';
import LoginView from '@/views/LoginView.vue';
import RegisterView from '@/views/RegisterView.vue';
import KwitansiView from '@/views/KwitansiView.vue';
import InvoicePaketLa from '@/modules/Invoice/InvoicePaketLa.vue';
import InvoiceDeposit from '@/modules/Invoice/InvoiceDeposit.vue';
import InvoiceKwitansiTerakhir from '@/modules/Invoice/InvoiceKwitansiTerakhir.vue';
import InvoicePembayranPerbulan from '@/modules/Invoice/InvoicePembayranPerbulan.vue';
import KwitansiTabunganUmrah from '@/modules/Invoice/KwitansiTabunganUmrah.vue';
import CetakSurat from '@/modules/DaftarSuratMenyurat/widgets/CetakSurat.vue';
import KwitansiHandoverFasilitas from '@/modules/Invoice/KwitansiHandoverFasilitas.vue';
import CetakDataJamaah from '@/modules/TabunganUmrah/Widget/CetakDataJamaah.vue';
import KwitansiHandoverBarang from '@/modules/Invoice/KwitansiHandoverBarang.vue';
import KwitansiPengembalianBarang from '@/modules/Invoice/KwitansiPengembalianBarang.vue';
import TransaksiVisa from '@/modules/TransaksiVisa/TransaksiVisa.vue';
import CetakKwitansiVisa from '@/modules/Invoice/InvoiceTransaksiVisa.vue';
import InvoicePembayaranFeeAgen from '@/modules/Invoice/InvoicePembayaranFeeAgen.vue';
import KwitansiPembayaranTransaksiPaket from '@/modules/Invoice/KwitansiPembayaranTransaksiPaket.vue';
import InvoiceTransHotel from '@/modules/Invoice/InvoiceTransHotel.vue';
import InvoiceKasKeluarMasuk from '@/modules/Invoice/InvoiceKasKeluarMasuk.vue';
import TransaksiPassport from '@/modules/TransaksiPassport/TransaksiPassport.vue';
import CetakKwitansiPassport from '@/modules/Invoice/InvoiceTransaksiPassport.vue';
import CetakDataJamaahPaket from '@/modules/DaftarJamaahPaket/Widgets/CetakDataJamaah.vue';
import KwitansiHandoverFasilitasPaket from '@/modules/Invoice/KwitansiHandoverFasilitasPaket.vue';
import KwitansiHandoverBarangPaket from '@/modules/Invoice/KwitansiHandoverBarangPaket.vue';
import KwitansiPengembalianBarangPaket from '@/modules/Invoice/KwitansiPengembalianBarangPaket.vue';
import CetakDataAbsensiJamaah from '@/modules/DaftarJamaahPaket/Widgets/CetakDataAbsensiJamaah.vue';
import DownloadDaftarKamar from '@/modules/KamarPaket/Widget/DownloadDaftarKamar.vue';
import InvoiceTransTransport from '@/modules/Invoice/InvoiceTransTransport.vue';
import InvoiceTransFasilitas from '@/modules/Invoice/InvoiceTransFasilitas.vue';
import CetakRekapitulasi from '@/modules/RekapitulasiTicket/Widget/CetakRekapitulasi.vue';
import Profile from '@/modules/Profile/Profile.vue';
import CabangPertama from '@/modules/CabangPertama/CabangPertama.vue';
import InvoiceTransTiket from '@/modules/Invoice/InvoiceTransTiket.vue';
import InvoiceRefundTiket from '@/modules/Invoice/InvoiceRefundTiket.vue';
import InvoicePembayaranTiket from '@/modules/Invoice/InvoicePembayaranTiket.vue';
import BackboneLogin from '@/modules/BackboneLogin/BackboneLogin.vue';
import Backbone from '@/modules/Backbone/Backbone.vue';
import { APP_NAME } from '@/config/config';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: {
        title: APP_NAME + ' :: Aplikasi Manajemen Travel Haji dan Umrah',
        description: 'Ini adalah deskripsi halaman Home',
      },
    },
    {
      path: '/Login',
      name: 'login',
      component: LoginView,
      meta: {
        title: `Login || ${APP_NAME} :: Aplikasi Manajemen Travel Haji dan Umrah`,
        description: 'Ini adalah deskripsi halaman Home',
      },
    },
    {
      path: '/Register',
      name: 'register',
      component: RegisterView,
      meta: {
        title: `Registrasi || ${APP_NAME} :: Aplikasi Manajemen Travel Haji dan Umrah`,
        description: 'Ini adalah deskripsi halaman Home',
      },
    },
    {
      path: '/kwitansi',
      name: 'kwitansi',
      component: KwitansiView,
    },
    {
      path: '/tab-tes',
      name: 'tab-tes',
      component: () => import('../views/MemberAreaView.vue'),
    },
    {
      path: '/User',
      name: 'user',
      meta: {
        title: `User Area || ${APP_NAME} :: Aplikasi Manajemen Travel Haji dan Umrah`,
        description: 'Ini adalah deskripsi halaman Home',
      },
      component: UserView,
    },
    {
      path: '/invoice-paket-la/:id',
      name: 'invoice-paket-la',
      component: InvoicePaketLa,
    },
    {
      path: '/invoice-kas-keluar-masuk/:invoice',
      name: 'invoice-kas-keluar-masuk',
      component: InvoiceKasKeluarMasuk,
    },
    {
      path: '/invoice-deposit/:id',
      name: 'invoice-deposit',
      component: InvoiceDeposit,
    },
    {
      path: '/kwitansi-terakhir/:invoice',
      name: 'kwitansi-terakhir',
      component: InvoiceKwitansiTerakhir,
    },
    {
      path: '/kwitansi-tabungan-umrah/:invoice',
      name: 'kwitansi-tabungan-umrah',
      component: KwitansiTabunganUmrah,
    },
    {
      path: '/invoice-pembayaran/:invoice',
      name: 'invoice-pembayaran',
      component: InvoicePembayranPerbulan,
    },
    {
      path: '/kwitansi-handover-fasilitas/:invoice',
      name: 'kwitansi-handover-fasilitas',
      component: KwitansiHandoverFasilitas,
    },
    {
      path: '/cetak_surat/:jenis_surat',
      name: 'invoice-pembayran',
      component: CetakSurat,
    },
    {
      path: '/daftar-tabungan-umrah/cetak-data-jamaah/:id/cetak',
      name: 'cetak-jamaah',
      component: CetakDataJamaah,
    },
    {
      path: '/kwitansi-handover-barang/:invoice',
      name: 'kwitansi-handover-barang',
      component: KwitansiHandoverBarang,
    },
    {
      path: '/kwitansi-pengembalian-handover-barang/:invoice',
      name: 'kwitansi-pengembalian-handover-barang',
      component: KwitansiPengembalianBarang,
    },
    {
      path: '/transaksi-visa',
      name: 'transaksi-visa',
      component: TransaksiVisa,
    },
    {
      path: '/cetak-kwitansi-visa/:invoice',
      name: 'cetak-kwitansi-visa',
      component: CetakKwitansiVisa,
    },
    {
      path: '/kwitansi-pembayaran-fee-agen/:invoice',
      name: 'kwitansi-pembayaran-fee-agen',
      component: InvoicePembayaranFeeAgen,
    },
    {
      path: '/kwitansi-pembayaran-transaksi-paket/:invoice',
      name: 'kwitansi-pembayaran-transaksi-paket',
      component: KwitansiPembayaranTransaksiPaket,
    },
    {
      path: '/kwitansi-trans-hotel/:invoice',
      name: 'kwitansi-trans-hotel',
      component: InvoiceTransHotel,
    },
    {
      path: '/transaksi-passport',
      name: 'transaksi-passport',
      component: TransaksiPassport,
    },

    {
      path: '/cetak-kwitansi-passport/:invoice',
      name: 'cetak-kwitansi-passport',
      component: CetakKwitansiPassport,
    },
    {
      path: '/daftar-jamaah-paket/absensi-jamaah-paket/:paketId/cetak',
      name: 'absensi-jamaah-paket',
      component: CetakDataAbsensiJamaah,
    },
    {
      path: '/daftar-jamaah-paket/cetak-data-jamaah/:id/cetak',
      name: 'cetak-jamaah-paket',
      component: CetakDataJamaahPaket,
    },
    {
      path: '/kwitansi-handover-fasilitas-paket/:invoice',
      name: 'kwitansi-handover-fasilitas-paket',
      component: KwitansiHandoverFasilitasPaket,
    },
    {
      path: '/kwitansi-handover-barang-paket/:invoice',
      name: 'kwitansi-handover-barang-paket',
      component: KwitansiHandoverBarangPaket,
    },
    {
      path: '/kwitansi-pengembalian-handover-barang-paket/:invoice',
      name: 'kwitansi-pengembalian-handover-barang-paket',
      component: KwitansiPengembalianBarangPaket,
    },
    {
      path: '/download-daftar-kamar',
      name: 'download-daftar-kamar',
      component: DownloadDaftarKamar,
    },
    {
      path: '/kwitansi-trans-transport/:invoice',
      name: 'kwitansi-trans-transport',
      component: InvoiceTransTransport,
    },
    {
      path: '/kwitansi-trans-fasilitas/:invoice',
      name: 'kwitansi-trans-fasilitas',
      component: InvoiceTransFasilitas,
    },
    {
      path: '/rekapitulasi-ticket/cetak/:regnumb',
      name: 'rekapitulasi-ticket',
      component: CetakRekapitulasi,
    },
    {
      path: '/profile',
      name: 'profile',
      component: Profile,
    },
    {
      path: '/tambah-cabang',
      name: 'tambah-cabang',
      component: CabangPertama,
    },
    {
      path: '/invoice-trans-tiket/:regnum',
      name: 'trans-tiket',
      component: InvoiceTransTiket,
    },
    {
      path: '/invoice-refund-tiket/:invoice',
      name: 'refund-tiket',
      component: InvoiceRefundTiket,
    },
    {
      path: '/invoice-pembayaran-tiket/:invoice',
      name: 'pembayaran-tiket',
      component: InvoicePembayaranTiket,
    },
    {
      path: '/backbone-login',
      name: 'backbone-login',
      component: BackboneLogin,
    },
    {
      path: '/backbone',
      name: 'backbone',
      component: Backbone,
    },
  ],
});

export default router;
