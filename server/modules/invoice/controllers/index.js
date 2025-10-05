const Model_r = require("../models/model_r");
const {
  handleServerError,
  handleValidationErrors,
} = require("../../../helper/handleError");

exports.header = async (req, res) => {
  try {
    const model = new Model_r(req);
    const data = await model.header();
    if (Object.keys(data).length > 0) {
      res.status(200).json({ error: false, err_msg: "Data ditemukan", data });
    } else {
      res.status(400).json({ error: true, err_msg: "Data tidak ditemukan" });
    }
  } catch (error) {
    handleServerError(res, error.message);
  }
};

exports.invoice_kas_keluar_masuk = async (req, res) => {
  try {
    const model = new Model_r(req);
    const data = await model.dataInvoiceKasKeluarMasuk();
    if (Object.keys(data).length > 0) {
      res.status(200).json({ error: false, err_msg: "Data ditemukan", data });
    } else {
      res.status(400).json({ error: true, err_msg: "Data tidak ditemukan" });
    }
  } catch (error) {
    console.log("+++++++++++++++++");
    console.log(error);
    console.log("+++++++++++++++++");
    handleServerError(res, error.message);
  }
};

exports.invoice_deposit = async (req, res) => {
  if (!(await handleValidationErrors(req, res))) return;

  try {
    const model = new Model_r(req);
    const data = await model.dataInvoiceDeposit();
    if (Object.keys(data).length > 0) {
      res.status(200).json({ error: false, err_msg: "Data ditemukan", data });
    } else {
      res.status(400).json({ error: true, err_msg: "Data tidak ditemukan" });
    }
  } catch (error) {
    handleServerError(res, error.message);
  }
};

exports.invoice_paket_la = async (req, res) => {
  if (!(await handleValidationErrors(req, res))) return;

  try {
    const model = new Model_r(req);
    const data = await model.dataInvoicePaketLa();
    if (Object.keys(data).length > 0) {
      res.status(200).json({ error: false, err_msg: "Data ditemukan", data });
    } else {
      res.status(400).json({ error: true, err_msg: "Data tidak ditemukan" });
    }
  } catch (error) {
    handleServerError(res, error.message);
  }
};

exports.kwitansi_terakhir = async (req, res) => {
  if (!(await handleValidationErrors(req, res))) return;

  try {
    const model = new Model_r(req);
    const data = await model.dataKwitansiTerakhir();
    if (Object.keys(data).length > 0) {
      res.status(200).json({ error: false, err_msg: "Data ditemukan", data });
    } else {
      res.status(400).json({ error: true, err_msg: "Data tidak ditemukan" });
    }
  } catch (error) {
    handleServerError(res, error.message);
  }
};

exports.invoice_pembayaran_perbulan = async (req, res) => {
  console.log(">> Controller jalan, invoice:", req.params.invoice);
  if (!(await handleValidationErrors(req, res))) return;

  try {
    const model = new Model_r(req);
    const data = await model.kwitansiPembayaranPerbulan();
    if (Object.keys(data).length > 0) {
      res.status(200).json({ error: false, err_msg: "Data ditemukan", data });
    } else {
      res.status(400).json({ error: true, err_msg: "Data tidak ditemukan" });
    }
  } catch (error) {
    handleServerError(res, error.message);
  }
};

exports.kwitansi_tabungan_umrah = async (req, res) => {
  if (!(await handleValidationErrors(req, res))) return;

  try {
    const model = new Model_r(req);
    const data = await model.dataKwitansiTabunganUmrah();
    if (Object.keys(data).length > 0) {
      res.status(200).json({ error: false, err_msg: "Data ditemukan", data });
    } else {
      res.status(400).json({ error: true, err_msg: "Data tidak ditemukan" });
    }
  } catch (error) {
    handleServerError(res, error.message);
  }
};

exports.cek_kwitansi_tabungan_umrah = async (req, res) => {
  if (!(await handleValidationErrors(req, res))) return;

  try {
    const model = new Model_r(req);
    const data = await model.checkKwitansiTabunganUmrah();
    if (Object.keys(data).length > 0) {
      res.status(200).json({ error: false, err_msg: "Data ditemukan", data });
    } else {
      res.status(400).json({ error: true, err_msg: "Data tidak ditemukan" });
    }
  } catch (error) {
    handleServerError(res, error.message);
  }
};

exports.kwitansi_handover_fasilitas = async (req, res) => {
  if (!(await handleValidationErrors(req, res))) return;

  try {
    const model = new Model_r(req);
    const data = await model.dataKwitansiHandoverFasilitas();
    if (Object.keys(data).length > 0) {
      res.status(200).json({ error: false, err_msg: "Data ditemukan", data });
    } else {
      res.status(400).json({ error: true, err_msg: "Data tidak ditemukan" });
    }
  } catch (error) {
    handleServerError(res, error.message);
  }
};

exports.kwitansi_handover_barang = async (req, res) => {
  if (!(await handleValidationErrors(req, res))) return;

  try {
    const model = new Model_r(req);
    const data = await model.dataKwitansiHandoverBarang();
    if (Object.keys(data).length > 0) {
      res.status(200).json({ error: false, err_msg: "Data ditemukan", data });
    } else {
      res.status(400).json({ error: true, err_msg: "Data tidak ditemukan" });
    }
  } catch (error) {
    handleServerError(res, error.message);
  }
};

exports.kwitansi_pengembalian_handover_barang = async (req, res) => {
  if (!(await handleValidationErrors(req, res))) return;

  try {
    const model = new Model_r(req);
    const data = await model.dataKwitansiPengembalianHandoverBarang();
    if (Object.keys(data).length > 0) {
      res.status(200).json({ error: false, err_msg: "Data ditemukan", data });
    } else {
      res.status(400).json({ error: true, err_msg: "Data tidak ditemukan" });
    }
  } catch (error) {
    handleServerError(res, error.message);
  }
};

exports.kwitansi_visa = async (req, res) => {
  if (!(await handleValidationErrors(req, res))) return;

  try {
    const model = new Model_r(req);
    const data = await model.KwitansiVisa();
    if (Object.keys(data).length > 0) {
      res.status(200).json({ error: false, err_msg: "Data ditemukan", data });
    } else {
      res.status(400).json({ error: true, err_msg: "Data kwitansi visa tidak ditemukan" });
    }
  } catch (error) {
    handleServerError(res, error.message);
  }
};

exports.kwitansi_pembayaran_fee_agen = async (req, res) => {
  if (!(await handleValidationErrors(req, res))) return;

  try {
    const model = new Model_r(req);
    const data = await model.invoice_pembayaran_fee_agen();
    if (Object.keys(data).length > 0) {
      res.status(200).json({ error: false, err_msg: "Data ditemukan", data });
    } else {
      res.status(400).json({ error: true, err_msg: "Data tidak ditemukan" });
    }
  } catch (error) {
    handleServerError(res, error.message);
  }
};

exports.kwitansi_trans_hotel = async (req, res) => {
  if (!(await handleValidationErrors(req, res))) return;

  try {
    const model = new Model_r(req);
    const data = await model.invoice_trans_hotel();
    if (Object.keys(data).length > 0) {
      res.status(200).json({ error: false, err_msg: "Data ditemukan", data });
    } else {
      res.status(400).json({ error: true, err_msg: "Data tidak ditemukan" });
    }
  } catch (error) {
    handleServerError(res, error.message);
  }
};

exports.kwitansi_pembayaran_transaksi_paket_umrah = async (req, res) => {
  if (!(await handleValidationErrors(req, res))) return;

  try {
    const model = new Model_r(req);
    const data = await model.dataKwitansiPembayaranTransaksiPaketUmrah();
    if (Object.keys(data).length > 0) {
      res.status(200).json({ error: false, err_msg: "Data ditemukan", data });
    } else {
      res.status(400).json({ error: true, err_msg: "Data tidak ditemukan" });
    }
  } catch (error) {
    handleServerError(res, error.message);
  }
};

exports.kwitansi_passport = async (req, res) => {
  if (!req.params.invoice || req.params.invoice === "undefined") {
    return res
      .status(400)
      .json({ error: true, err_msg: "Parameter invoice tidak valid." });
  }

  try {
    const model = new Model_r(req);
    const data = await model.KwitansiPassport();
    if (Object.keys(data).length > 0) {
      res.status(200).json({ error: false, err_msg: "Data ditemukan", data });
    } else {
      res.status(400).json({
        error: true,
        err_msg: "Data kwitansi passport tidak ditemukan",
      });
    }
  } catch (error) {
    handleServerError(res, error.message);
  }
};

exports.kwitansi_handover_fasilitas_paket = async (req, res) => {
  if (!(await handleValidationErrors(req, res))) return;

  try {
    const model = new Model_r(req);
    const data = await model.dataKwitansiHandoverFasilitasPaket();
    if (Object.keys(data).length > 0) {
      res.status(200).json({ error: false, err_msg: "Data ditemukan", data });
    } else {
      res.status(400).json({ error: true, err_msg: "Data tidak ditemukan" });
    }
  } catch (error) {
    handleServerError(res, error.message);
  }
};

exports.kwitansi_handover_barang_paket = async (req, res) => {
  if (!(await handleValidationErrors(req, res))) return;

  try {
    const model = new Model_r(req);
    const data = await model.dataKwitansiHandoverBarangPaket();
    if (Object.keys(data).length > 0) {
      res.status(200).json({ error: false, err_msg: "Data ditemukan", data });
    } else {
      res.status(400).json({ error: true, err_msg: "Data tidak ditemukan" });
    }
  } catch (error) {
    handleServerError(res, error.message);
  }
};

exports.kwitansi_pengembalian_handover_barang_paket = async (req, res) => {
  if (!(await handleValidationErrors(req, res))) return;

  try {
    const model = new Model_r(req);
    const data = await model.dataKwitansiPengembalianHandoverBarangPaket();
    if (Object.keys(data).length > 0) {
      res.status(200).json({ error: false, err_msg: "Data ditemukan", data });
    } else {
      res.status(400).json({ error: true, err_msg: "Data tidak ditemukan" });
    }
  } catch (error) {
    handleServerError(res, error.message);
  }
};

exports.kwitansi_trans_transport = async (req, res) => {
  if (!(await handleValidationErrors(req, res))) return;

  try {
    const model = new Model_r(req);
    const data = await model.invoice_trans_transport();
    if (Object.keys(data).length > 0) {
      res.status(200).json({ error: false, err_msg: "Data ditemukan", data });
    } else {
      res.status(400).json({ error: true, err_msg: "Data tidak ditemukan" });
    }
  } catch (error) {
    handleServerError(res, error.message);
  }
};

exports.kwitansi_trans_fasilitas = async (req, res) => {
  if (!(await handleValidationErrors(req, res))) return;

  try {
    const model = new Model_r(req);
    const data = await model.invoice_trans_fasilitas();
    if (Object.keys(data).length > 0) {
      res.status(200).json({ error: false, err_msg: "Data ditemukan", data });
    } else {
      res.status(400).json({ error: true, err_msg: "Data tidak ditemukan" });
    }
  } catch (error) {
    console.log("--------------ddddddddddddddddd");
    console.log(error);
    console.log("--------------ddddddddddddddddd");

    handleServerError(res, error.message);
  }
};

exports.kwitansi_trans_ticket = async (req, res) => {
  if (!(await handleValidationErrors(req, res))) return;

  try {
    const model = new Model_r(req);
    const data = await model.invoice_trans_tiket();
    if (Object.keys(data).length > 0) {
      res.status(200).json({ error: false, err_msg: "Data ditemukan", data });
    } else {
      res.status(400).json({ error: true, err_msg: "Data tidak ditemukan" });
    }
  } catch (error) {
    console.log("--------------ddddddddddddddddd");
    console.log(error);
    console.log("--------------ddddddddddddddddd");

    handleServerError(res, error.message);
  }
};

exports.kwitansi_refund = async (req, res) => { 
   if (!(await handleValidationErrors(req, res))) return;

  try {
    const model = new Model_r(req);
    const data = await model.kwitansi_refund_tiket();
    if (Object.keys(data).length > 0) {
      res.status(200).json({ error: false, err_msg: "Data ditemukan", data });
    } else {
      res.status(400).json({ error: true, err_msg: "Data tidak ditemukan" });
    }
  } catch (error) {
    console.log("--------------ddddddddddddddddd");
    console.log(error);
    console.log("--------------ddddddddddddddddd");

    handleServerError(res, error.message);
  }
}; 
  
exports.kwitansi_pembayaran_tiket = async (req, res) => {
  if (!(await handleValidationErrors(req, res))) return;

  try {
    const model = new Model_r(req);
    const data = await model.invoice_pembayaran_tiket();
    if (Object.keys(data).length > 0) {
      res.status(200).json({ error: false, err_msg: "Data ditemukan", data });
    } else {
      res.status(400).json({ error: true, err_msg: "Data tidak ditemukan" });
    }
  } catch (error) {
    console.log("--------------ddddddddddddddddd");
    console.log(error);
    console.log("--------------ddddddddddddddddd");

    handleServerError(res, error.message);
  }
};
