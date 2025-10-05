const Model_r = require("../models/model_r");
const Model_cud = require("../models/model_cud");
const { handleValidationErrors, handleServerError } = require("../../../helper/handleError");

const controllers = {};

// Mendapatkan daftar tabungan
controllers.getDaftarTabunganUmrah = async (req, res) => {
  if (!(await handleValidationErrors(req, res))) return;

  try {
    const model_r = new Model_r(req);
    const feedBack = await model_r.daftar_tabungan_umrah(); 
    res.status(200).json({ error: false, data : feedBack.data, total : feedBack.total });
  } catch (error) {
    handleServerError(res, error.message);
  }
};

// Menambahkan tabungan baru
controllers.add = async (req, res) => {
  if (!(await handleValidationErrors(req, res))) return;

  try {
    const model_cud = new Model_cud(req);
    const invoice = await model_cud.add();
    // get response
    if (await model_cud.response()) {
      res.status(200).json({
        error: false,
        error_msg: 'Tabungan Umrah berhasil ditambahkan.',
        data: { invoice: invoice },
      });
    } else {
      res.status(400).json({
        error: true,
        error_msg: 'Tabungan Umrah gagal ditambahkan.',
      });
    }
  } catch (error) {
    handleServerError(res, error.message);
  }
};

controllers.addHandoverBarang = async (req, res) => {
  if (!(await handleValidationErrors(req, res))) return;

  try {
    const model_cud = new Model_cud(req);
    const invoice = await model_cud.addHandoverBarang();
    // get response
    if (await model_cud.response()) {
      res.status(200).json({
        error: false,
        error_msg: 'Handover Barang berhasil ditambahkan.',
        data: { invoice: invoice },
      });
    } else {
      res.status(400).json({
        error: true,
        error_msg: 'Handover Barang gagal ditambahkan.',
      });
    }
  } catch (error) {
    handleServerError(res, error.message);
  }
};

controllers.pengembalianHandoverBarang = async (req, res) => {
  if (!(await handleValidationErrors(req, res))) return;

  try {
    const model_cud = new Model_cud(req);
    const invoice = await model_cud.pengembalianHandoverBarang();
    // get response
    if (await model_cud.response()) {
      res.status(200).json({
        error: false,
        error_msg: 'Pengembalian Handover Barang berhasil ditambahkan.',
        data: { invoice: invoice },
      });
    } else {
      res.status(400).json({
        error: true,
        error_msg: 'Pengembalian Handover Barang gagal ditambahkan.',
      });
    }
  } catch (error) {
    handleServerError(res, error.message);
  }
}

controllers.Menabung = async (req, res) => {
  if (!(await handleValidationErrors(req, res))) return;

  try {
    const model_cud = new Model_cud(req);
    await model_cud.Menabung();

    // get response
    if (await model_cud.response()) {
      res.status(200).json({
        error: false,
        error_msg: 'Menabung Tabungan Umrah berhasil ditambahkan.',
      });
    } else {
      res.status(400).json({
        error: true,
        error_msg: 'Menabung Tabungan Umrah gagal ditambahkan.',
      });
    }
  } catch (error) {
    handleServerError(res, error.message);
  }
}
controllers.getInfoMenabungTabunganUmrah = async (req, res) => {
  if (!(await handleValidationErrors(req, res))) return;

  try {
    const model_r = new Model_r(req);
    const feedBack = await model_r.getInfoMenabungTabunganUmrah();
    res.status(200).json({ error: false, data : feedBack.data, total : feedBack.total });
  } catch (error) {
    handleServerError(res, error.message);
  }
};

controllers.getInfoPengembalianHandoverBarang = async (req, res) => {
  if (!(await handleValidationErrors(req, res))) return;

  try {
    const model_r = new Model_r(req);
    const feedBack = await model_r.getInfoPengembalianHandoverBarang();
    res.status(200).json({ error: false, data : feedBack.data, total : feedBack.total });
  } catch (error) {
    handleServerError(res, error.message);
  }
}

controllers.Refund = async (req, res) => {
  if (!(await handleValidationErrors(req, res))) return;

  try {
    const model_cud = new Model_cud(req);
    await model_cud.Refund();

    // get response
    if (await model_cud.response()) {
      res.status(200).json({
        error: false,
        error_msg: 'Refund Tabungan Umrah berhasil ditambahkan.',
      });
    } else {
      res.status(400).json({
        error: true,
        error_msg: 'Refund Tabungan Umrah gagal ditambahkan.',
      });
    }
  } catch (error) {
    handleServerError(res, error.message);
  }
}

controllers.getInfoRefundTabunganUmrah = async (req, res) => {
  if (!(await handleValidationErrors(req, res))) return;

  try {
    const model_r = new Model_r(req);
    const feedBack = await model_r.getInfoRefundTabunganUmrah();
    res.status(200).json({ error: false, data : feedBack.data, total : feedBack.total });
  } catch (error) {
    handleServerError(res, error.message);
  }
};

// Update tabungan
controllers.updateTargetPaket = async (req, res) => {
  if (!(await handleValidationErrors(req, res))) return;

  try {
    const model_cud = new Model_cud(req);
    await model_cud.updateTargetPaket();

    // get response
    if (await model_cud.response()) {
      res.status(200).json({
        error: false,
        error_msg: 'Target Paket Tabungan Umrah berhasil diupdate',
      });
    } else {
      res.status(400).json({
        error: true,
        error_msg: 'Target Paket Tabungan Umrah gagal diupdate',
      });
    }
  } catch (error) {
    handleServerError(res, error.message);
  }
}

controllers.getInfoUpdateTabunganUmrah = async (req, res) => {
  if (!(await handleValidationErrors(req, res))) return;

  try {
    const model_r = new Model_r(req);
    const feedBack = await model_r.getInfoUpdateTabunganUmrah();
    res.status(200).json({ error: false, data : feedBack.data, total : feedBack.total });
  } catch (error) {
    handleServerError(res, error.message);
  }
}

controllers.addHandoverFasilitas = async (req, res) => {
  if (!(await handleValidationErrors(req, res))) return;

  try {
    const model_cud = new Model_cud(req);
    const invoice = await model_cud.addHandoverFasilitas();

    // get response
    if (await model_cud.response()) {
      res.status(200).json({
        error: false,
        error_msg: 'Handover Fasilitas Tabungan Umrah berhasil ditambahkan.',
        data: { invoice: invoice },
      });
    } else {
      res.status(400).json({
        error: true,
        error_msg: 'Handover Fasilitas Tabungan Umrah gagal ditambahkan.',
      });
    }
  } catch (error) {
    handleServerError(res, error.message);
  }
}

// Hapus tabungan
controllers.delete = async (req, res) => {
  if (!(await handleValidationErrors(req, res))) return;

  try {
    const model_cud = new Model_cud(req);
    await model_cud.delete();

    // get response
    if (await model_cud.response()) {
      res.status(200).json({
        error: false,
        error_msg: 'Tabungan Umrah berhasil dihapus.',
      });
    } else {
      res.status(400).json({
        error: true,
        error_msg: 'Tabungan Umrah gagal dihapus.',
      });
    }
  } catch (error) {
    handleServerError(res, error.message);
  }
};

// Mengambil daftar Jamaah Tabungan Umrah
controllers.getJamaahTabunganUmrah = async (req, res) => {
  if (!(await handleValidationErrors(req, res))) return;

  try {
    const model_r = new Model_r(req);
    const feedBack = await model_r.getJamaahTabunganUmrah();
    res.status(200).json({ error: false, data : feedBack.data, total : feedBack.total });
  } catch (error) {
    handleServerError(res, error.message);
  }
};

controllers.getMstFasilitas = async (req, res) => {
  if (!(await handleValidationErrors(req, res))) return;

  try {
    const model_r = new Model_r(req);
    const feedBack = await model_r.getMstFasilitas();
    res.status(200).json({ error: false, data : feedBack.data, total : feedBack.total });
  } catch (error) {
    handleServerError(res, error.message);
  }
};

controllers.getHandoverFasilitasById = async (req, res) => {
  if (!(await handleValidationErrors(req, res))) return;

  try {
    const model_r = new Model_r(req);
    const feedBack = await model_r.getHandoverFasilitasById();
    res.status(200).json({ error: false, data : feedBack.data, total : feedBack.total });
  } catch (error) {
    handleServerError(res, error.message);
  }
}

// Mengambil daftar Paket Tabungan Umrah
controllers.getPaketTabunganUmrah = async (req, res) => {
  if (!(await handleValidationErrors(req, res))) return;

  try {
    const model_r = new Model_r(req);
    const feedBack = await model_r.getPaketTabunganUmrah();
    res.status(200).json({ error: false, data : feedBack.data, total : feedBack.total });
  } catch (error) {
    handleServerError(res, error.message);
  }
};

// Mengambil daftar Agen berdasarkan ID*/
controllers.getAgenById = async (req, res) => {
  if (!(await handleValidationErrors(req, res))) return;

  try {
    const model_r = new Model_r(req);
    const feedBack = await model_r.getAgenById();
    res.status(200).json({ error: false, data : feedBack.data, total : feedBack.total });
  } catch (error) {
    handleServerError(res, error.message);
  }
};

// Mengambil daftar Petugas Tabungan Umrah
controllers.getPetugasTabunganUmrah = async (req, res) => {
  if (!(await handleValidationErrors(req, res))) return;

  try {
    const model_r = new Model_r(req);
    const feedBack = await model_r.getPetugasTabunganUmrah();
    res.status(200).json({ error: false, data : feedBack.data, total : feedBack.total });
  } catch (error) {
    handleServerError(res, error.message);
  }
};

// Mengambil cetak data jamaah berdasarkan ID Tabungan Umrah
controllers.getCetakDataJamaahTabunganUmrah = async (req, res) => {
  if (!(await handleValidationErrors(req, res))) return;

  try {
    const model_r = new Model_r(req);
    const feedBack = await model_r.getCetakDataJamaahTabunganUmrah();
    res.status(200).json({ error: false, data : feedBack.data, total : feedBack.total });
  } catch (error) {
    handleServerError(res, error.message);
  }
};

// Mengambil daftar Tipe Paket Pembelian
controllers.getInfoPaketPembelian = async (req, res) => {
  if (!(await handleValidationErrors(req, res))) return;

  try {
    const model_r = new Model_r(req);
    const feedBack = await model_r.getInfoPaketPembelian();
    res.status(200).json({ error: false, data : feedBack.data, total : feedBack.total });
  } catch (error) {
    handleServerError(res, error.message);
  }
}

// Pembelian Paket Tabungan Umrah
controllers.pembelianPaketTabunganUmrah = async (req, res) => {
  if (!(await handleValidationErrors(req, res))) return;

  try {
    const model_cud = new Model_cud(req);
    await model_cud.pembelianPaketTabunganUmrah();

    // get response
    if (await model_cud.response()) {
      res.status(200).json({
        error: false,
        error_msg: 'Pembelian Paket Tabungan Umrah berhasil dibeli',
      });
    } else {
      res.status(400).json({
        error: true,
        error_msg: 'Pembelian Paket Tabungan Umrah gagal dibeli',
      });
    }
  } catch (error) {
    handleServerError(res, error.message);
  }
}

module.exports = controllers;

