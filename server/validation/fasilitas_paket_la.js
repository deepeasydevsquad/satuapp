const { Detail_fasilitas_paket_la, Fasilitas_paket_la, Paket_la } = require("../models");

const validation = {};

validation.check_id_paket_la = async (value, { req }) => {
  try {
    const data = await Paket_la.findOne({
      where: { id: value },
    });
    if (!data) {
      return Promise.reject("ID Paket LA tidak ditemukan.");
    }
    return true;
  } catch (error) {
    return Promise.reject("Terjadi kesalahan saat validasi ID Paket LA.");
  }
};

validation.check_id_detail_fasilitas_paket_la = async (value, { req }) => {
  try {
    const data = await Detail_fasilitas_paket_la.findOne({
      where: { id: value },
    });
    if (!data) {
      return Promise.reject("ID Detail Fasilitas Paket LA tidak ditemukan.");
    }
    return true;
  } catch (error) {
    return Promise.reject("Terjadi kesalahan saat validasi ID Detail Fasilitas Paket LA.");
  }
};

validation.check_id_fasilitas_paket_la = async (value, { req }) => {
  try {
    const data = await Fasilitas_paket_la.findOne({
      where: { id: value },
    });
    if (!data) {
      return Promise.reject("ID Fasilitas Paket LA tidak ditemukan.");
    }
    return true;
  } catch (error) {
    return Promise.reject("Terjadi kesalahan saat validasi ID Fasilitas Paket LA.");
  }
};

module.exports = validation;
