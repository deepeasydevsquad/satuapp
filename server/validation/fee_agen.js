const { Fee_agen, Pembayaran_fee_agen } = require("../models"); // <- pastikan path-nya bener
const { Op } = require("sequelize");

// ✅ Cek apakah fee yang dipilih sudah dibayar
async function validateFeeAgenBelumDibayar(fee_agen_ids = [], company_id) {
  const data = await Fee_agen.findAll({
    where: {
      id: { [Op.in]: fee_agen_ids },
      company_id,
    },
  });

  const sudahDibayar = data.filter((item) => item.status_bayar === "lunas");
  if (sudahDibayar.length > 0) {
    const ids = sudahDibayar.map((d) => d.id).join(", ");
    throw new Error(`Fee dengan ID berikut sudah dibayar: ${ids}`);
  }

  return data;
}

// ✅ Validasi invoice agar tidak duplikat
async function isInvoiceUnique(invoice) {
  const existing = await Pembayaran_fee_agen.findOne({
    where: { invoice },
  });
  return !existing;
}

module.exports = {
  validateFeeAgenBelumDibayar,
  isInvoiceUnique,
};
