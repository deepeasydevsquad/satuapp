const express = require("express");
const { body, param, query } = require("express-validator");
const controllers = require("../modules/tabungan_umrah/controllers/index");
const { authenticateToken } = require("../middleware/authenticateToken");
const validation = require("../validation/tabungan_umrah");

const router = express.Router();

router.post(
  "/daftar-tabungan-umrah/get-jamaah-tabungan-umrah/list",
  [
    body("division_id")
      .trim()
      .notEmpty().withMessage("Cabang tidak boleh kosong.")
      .isInt().withMessage("Cabang harus berupa angka.")
      .custom(validation.check_id_cabang),
  ],
  authenticateToken,
  controllers.getJamaahTabunganUmrah
);

router.post(
  "/daftar-tabungan-umrah/get-paket-tabungan-umrah/list",
  [
    body("division_id")
      .trim()
      .notEmpty().withMessage("Cabang tidak boleh kosong.")
      .isInt().withMessage("Cabang harus berupa angka.")
      .custom(validation.check_id_cabang),
  ],
  authenticateToken,
  controllers.getPaketTabunganUmrah
);

router.post(
  "/daftar-tabungan-umrah/get-mst-fasilitas/list",
  authenticateToken,
  [
    body("id")
      .trim()
      .notEmpty().withMessage("ID Tabungan Umrah tidak boleh kosong.")
      .isInt().withMessage("ID Tabungan Umrah harus berupa angka.")
      .custom(validation.check_id_tabungan),
  ],
  controllers.getMstFasilitas
);

router.post(
  "/daftar-tabungan-umrah/get-agen-tabungan-umrah",
  authenticateToken,
  [
    body("id")
      .trim()
      .notEmpty().withMessage("ID tidak boleh kosong.")
      .isInt().withMessage("ID harus berupa angka."),
  ],
  controllers.getAgenById
);

router.post(
  "/daftar-tabungan-umrah/get-handover-fasilitas",
  authenticateToken,
  [
    body("id")
      .trim()
      .notEmpty().withMessage("ID Tabungan Umrah tidak boleh kosong.")
      .isInt().withMessage("ID Tabungan Umrah harus berupa angka.")
      .custom(validation.check_id_tabungan),
  ],
  controllers.getHandoverFasilitasById
);

router.post(
  "/daftar-tabungan-umrah/get-tabungan-umrah/list",
  authenticateToken,
  [
    body("pageNumber").trim(),
    body("perpage").trim().notEmpty().withMessage("Jumlah Per Page tidak boleh kosong."),
    body("search").trim(),
    body("filter").trim(),
    body("filterCabang").trim().notEmpty().withMessage("Filter Cabang tidak boleh kosong."),
  ],
  controllers.getDaftarTabunganUmrah
);

router.post(
  "/daftar-tabungan-umrah/get-info-paket-pembelian",
  authenticateToken,
  [
    body("id")
      .trim()
      .notEmpty().withMessage("ID Tabungan Umrah tidak boleh kosong.")
      .isInt().withMessage("ID Tabungan Umrah harus berupa angka.")
      .custom(validation.check_id_tabungan)
  ],
  controllers.getInfoPaketPembelian
);

router.post(
  "/daftar-tabungan-umrah/pembelian-paket-tabungan-umrah",
  authenticateToken,
  [
    body("id")
      .trim()
      .notEmpty().withMessage("ID Tabungan Umrah tidak boleh kosong.")
      .isInt().withMessage("ID Tabungan Umrah harus berupa angka.")
      .custom(validation.check_id_tabungan),
    body("target_paket_id")
      .trim()
      .notEmpty().withMessage("Target Paket tidak boleh kosong.")
      .isInt().withMessage("Target Paket harus berupa angka.")
      .custom(validation.check_id_target_paket),
    body("tipe_paket_id")
      .trim()
      .notEmpty().withMessage("Tipe Paket tidak boleh kosong.")
      .isInt().withMessage("Tipe Paket harus berupa angka.")
      .custom(validation.check_id_tipe_paket),
    body("division_id")
      .trim()
      .notEmpty().withMessage("Cabang tidak boleh kosong.")
      .isInt().withMessage("Cabang harus berupa angka.")
      .custom(validation.check_id_cabang),
  ],
  controllers.pembelianPaketTabunganUmrah
);

router.post(
  "/daftar-tabungan-umrah/get-petugas-tabungan-umrah",
  authenticateToken,
  [
    body("division_id")
      .trim()
      .notEmpty().withMessage("Cabang tidak boleh kosong.")
      .isInt().withMessage("Cabang harus berupa angka.")
      .custom(validation.check_id_cabang),
  ],
  controllers.getPetugasTabunganUmrah
);

router.get(
  "/daftar-tabungan-umrah/cetak-data-jamaah/:id/cetak",
  authenticateToken,
  [
    param("id")
      .trim()
      .notEmpty().withMessage("ID Tabungan umrah tidak boleh kosong.")
      .isInt().withMessage("ID Tabungan umrah harus berupa angka.")
      .custom(validation.check_id_tabungan),
    query("petugasId")
      .trim()
      .notEmpty().withMessage("ID Petugas tidak boleh kosong."),
    ],
  controllers.getCetakDataJamaahTabunganUmrah
);

router.post(
  "/daftar-tabungan-umrah/add-tabungan-umrah",
  authenticateToken,
  [
    body("jamaah_id")
      .trim()
      .notEmpty().withMessage("ID Jamaah tidak boleh kosong.")
      .isInt().withMessage("ID Jamaah harus berupa angka.")
      .custom(validation.check_id_jamaah),
    body("target_id")
      .trim()
      .optional({ checkFalsy: true })
      .isInt().withMessage("Target ID harus berupa angka.")
      .custom(validation.check_id_paket),
    body("division_id")
      .trim()
      .notEmpty().withMessage("Cabang tidak boleh kosong.")
      .isInt().withMessage("Cabang harus berupa angka.")
      .custom(validation.check_id_cabang),
    body("sumber_dana")
      .trim()
      .notEmpty().withMessage("Sumber Dana tidak boleh kosong.")
      .custom(validation.check_sumber_dana),
    body("biaya_deposit")
      .trim()
      .notEmpty().withMessage("Biaya Deposit tidak boleh kosong.")
      .isNumeric().withMessage("Biaya Deposit harus berupa angka.")
      .custom(validation.check_saldo_deposit_dan_biaya),
    body("info_deposit")
      .trim(),
  ],
  controllers.add
);

router.post(
  "/daftar-tabungan-umrah/update-target-paket-tabungan-umrah",
  authenticateToken,
  [
    body("id")
      .trim()
      .notEmpty()
      .withMessage("ID Tabungan Umrah tidak boleh kosong.")
      .isInt()
      .withMessage("ID Tabungan Umrah harus berupa angka.")
      .custom(validation.check_id_tabungan),
    body("target_id")
      .trim()
      .custom(validation.check_id_paket),
    body("division_id")
      .trim()
      .notEmpty().withMessage("Cabang tidak boleh kosong.")
      .isInt().withMessage("Cabang harus berupa angka.")
      .custom(validation.check_id_cabang),
  ],
  controllers.updateTargetPaket
)

router.post(
  "/daftar-tabungan-umrah/get-info-update-tabungan-umrah",
  authenticateToken,
  [
    body("id")
      .trim()
      .notEmpty().withMessage("ID Tabungan Umrah tidak boleh kosong.")
      .isInt().withMessage("ID Tabungan Umrah harus berupa angka.")
      .custom(validation.check_id_tabungan),
  ],
  controllers.getInfoUpdateTabunganUmrah
)

router.post(
  "/daftar-tabungan-umrah/menabung-tabungan-umrah",
  authenticateToken,
  [
    body("id")
      .trim()
      .notEmpty().withMessage("ID Tabungan Umrah tidak boleh kosong.")
      .isInt().withMessage("ID Tabungan Umrah harus berupa angka.")
      .custom(validation.check_id_tabungan),
    body("sumber_dana")
      .trim()
      .notEmpty().withMessage("Sumber Dana tidak boleh kosong.")
      .custom(validation.check_sumber_dana),
    body("biaya_deposit")
      .trim()
      .notEmpty().withMessage("Biaya Deposit tidak boleh kosong.")
      .isNumeric().withMessage("Biaya Deposit harus berupa angka.")
      .custom(v => {
        if (Number(v) <= 0) throw new Error("Biaya deposit harus lebih dari 0.");
        return true;
      })
      .custom(validation.check_saldo_deposit_dan_biaya),
    body("division_id")
      .trim()
      .notEmpty().withMessage("Cabang tidak boleh kosong.")
      .isInt().withMessage("Cabang harus berupa angka.")
      .custom(validation.check_id_cabang),
    body("info_deposit")
      .trim()
  ],
  controllers.Menabung
)

router.post(
  "/daftar-tabungan-umrah/get-info-menabung-tabungan-umrah",
  authenticateToken,
  [
    body("id")
      .trim()
      .notEmpty().withMessage("ID Tabungan Umrah tidak boleh kosong.")
      .isInt().withMessage("ID Tabungan Umrah harus berupa angka.")
      .custom(validation.check_id_tabungan),
  ],
  controllers.getInfoMenabungTabunganUmrah
)

router.post(
  "/daftar-tabungan-umrah/refund-tabungan-umrah",
  authenticateToken,
  [
    body("id")
      .trim()
      .notEmpty().withMessage("ID Tabungan Umrah tidak boleh kosong.")
      .isInt().withMessage("ID Tabungan Umrah harus berupa angka.")
      .custom(validation.check_id_tabungan),
    body("refund_nominal")
      .trim()
      .notEmpty().withMessage("Refund tidak boleh kosong.")
      .isNumeric().withMessage("Refund harus berupa angka.")
      .custom(v => {
        if (Number(v) <= 0) throw new Error("Nominal refund harus lebih dari 0.");
        return true;
      })
      .custom(validation.check_refund_nominal),
    body("division_id")
      .trim()
      .notEmpty().withMessage("Cabang tidak boleh kosong.")
      .isInt().withMessage("Cabang harus berupa angka.")
      .custom(validation.check_id_cabang),
    body("batal_berangkat")
      .trim()
      .isBoolean().withMessage("Batal Berangkat harus berupa ya atau tidak."),
  ],
  controllers.Refund
)

router.post(
  "/daftar-tabungan-umrah/get-info-refund-tabungan-umrah",
  authenticateToken,
  [
    body("id")
      .trim()
      .notEmpty().withMessage("ID Tabungan Umrah tidak boleh kosong.")
      .isInt().withMessage("ID Tabungan Umrah harus berupa angka.")
      .custom(validation.check_id_tabungan),
  ],
  controllers.getInfoRefundTabunganUmrah
);

router.post(
  "/daftar-tabungan-umrah/add-handover-fasilitas",
  authenticateToken,
  [
    body("id")
      .trim()
      .notEmpty().withMessage("ID Tabungan Umrah tidak boleh kosong.")
      .isInt().withMessage("ID Tabungan Umrah harus berupa angka.")
      .custom(validation.check_id_tabungan),
    body("penerima")
      .trim()
      .notEmpty().withMessage("Nama Penerima tidak boleh kosong.")
      .toUpperCase(),
    body("nomor_identitas_penerima")
      .trim()
      .notEmpty().withMessage("Nomor Identitas Penerima tidak boleh kosong.")
      .isNumeric().withMessage("Nomor Identitas Penerima harus berupa angka."),
    body("detail_fasilitas")
      .isArray({ min: 1 })
      .withMessage("Fasilitas paket tidak boleh kosong.")
      .custom(validation.check_mst_paket)
  ],
  controllers.addHandoverFasilitas
);

router.post(
  "/daftar-tabungan-umrah/get-info-pengembalian-handover-barang",
  authenticateToken,
  [
    body("id")
      .trim()
      .notEmpty().withMessage("ID Tabungan Umrah tidak boleh kosong.")
      .isInt().withMessage("ID Tabungan Umrah harus berupa angka.")
      .custom(validation.check_id_tabungan),
  ],
  controllers.getInfoPengembalianHandoverBarang
)

router.post(
  "/daftar-tabungan-umrah/add-handover-barang",
  authenticateToken,
  [
    body("id")
      .trim()
      .notEmpty().withMessage("ID Tabungan Umrah tidak boleh kosong.")
      .isInt().withMessage("ID Tabungan Umrah harus berupa angka.")
      .custom(validation.check_id_tabungan),
    body("barangList")
      .isArray({ min: 1 }).withMessage("Barang tidak boleh kosong.")
      .customSanitizer((value) => {
        return value.map((v) => v.trim().toUpperCase());
      }),
    body("giver_handover")
      .trim()
      .notEmpty().withMessage("Pemberi Handover tidak boleh kosong.")
      .toUpperCase(),
    body("giver_handover_identity")
      .trim()
      .notEmpty().withMessage("Nomor Identitas Pemberi Handover tidak boleh kosong.")
      .isNumeric().withMessage("Nomor Identitas Pemberi Handover harus berupa angka."),
    body("giver_handover_hp")
      .trim()
      .notEmpty().withMessage("Nomor HP Pemberi Handover tidak boleh kosong.")
      .isNumeric().withMessage("Nomor HP Pemberi Handover harus berupa angka."),
    body("giver_handover_address")
      .trim()
      .notEmpty().withMessage("Alamat Pemberi Handover tidak boleh kosong.")
      .toUpperCase(),
  ],
  controllers.addHandoverBarang
)

router.post(
  "/daftar-tabungan-umrah/pengembalian-handover-barang",
  authenticateToken,
  [
    body("id")
      .trim()
      .notEmpty().withMessage("ID Tabungan Umrah tidak boleh kosong.")
      .isInt().withMessage("ID Tabungan Umrah harus berupa angka.")
      .custom(validation.check_id_tabungan),
    body("selectedItems")
      .isArray({ min: 1 }).withMessage("ID items tidak boleh kosong.")
      .custom(validation.check_id_handover_barang),
    body("receiver_returned")
      .trim()
      .notEmpty().withMessage("Nama Penerima Barang tidak boleh kosong.")
      .toUpperCase(),
    body("receiver_returned_identity")
      .trim()
      .notEmpty().withMessage("Nomor Identitas Penerima Barang tidak boleh kosong.")
      .isNumeric().withMessage("Nomor Identitas Penerima Barang harus berupa angka."),
    body("receiver_returned_hp")
      .trim()
      .notEmpty().withMessage("Nomor HP Penerima Barang tidak boleh kosong.")
      .isNumeric().withMessage("Nomor HP Penerima Barang harus berupa angka."),
    body("receiver_returned_address")
      .trim()
      .notEmpty().withMessage("Alamat Penerima Barang tidak boleh kosong.")
      .toUpperCase(),
  ],
  controllers.pengembalianHandoverBarang
)

router.post(
  "/daftar-tabungan-umrah/delete-tabungan-umrah",
  authenticateToken,
  [
    body("id")
      .trim()
      .notEmpty().withMessage("ID Tabungan Umrah tidak boleh kosong.")
      .isInt().withMessage("ID Tabungan Umrah harus berupa angka.")
      .custom(validation.check_id_tabungan),
    body("division_id")
      .trim()
      .notEmpty().withMessage("Cabang tidak boleh kosong.")
      .isInt().withMessage("Cabang harus berupa angka.")
      .custom(validation.check_id_cabang),
  ],
  controllers.delete
);

module.exports = router;
