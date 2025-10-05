const validateVisaDetail = (req, res, next) => {
  const data = req.body.details;

  if (!Array.isArray(data) || data.length === 0) {
    return res
      .status(400)
      .json({ message: "Detail transaksi visa tidak boleh kosong" });
  }

  for (let i = 0; i < data.length; i++) {
    const d = data[i];

    const requiredFields = [
      "jenis_visa",
      "name",
      "identity_number",
      "gender",
      "birth_place",
      "birth_date",
      "origin_country",
      "passport_number",
      "passport_issued_date",
      "passport_expire_date",
      "passport_issued_place",
      "indonesia_job",
      "abroad_job",
      "work_address",
      "postal_code",
      "city",
      "origin_country",
      "phone",
      "price",
    ];

    for (const field of requiredFields) {
      if (d[field] === undefined || d[field] === null || d[field] === "") {
        return res.status(400).json({
          message: `Field '${field}' wajib diisi (baris ${i + 1})`,
        });
      }
    }

    if (isNaN(d.price) || Number(d.price) < 0) {
      return res.status(400).json({
        message: `Harga tidak valid di baris ${i + 1}`,
      });
    }

    if (!["laki_laki", "perempuan"].includes(d.gender)) {
      return res.status(400).json({
        message: `Gender tidak valid di baris ${i + 1}`,
      });
    }

    const dateFields = [
      "birth_date",
      "passport_issued_date",
      "passport_expire_date",
    ];

    for (const field of dateFields) {
      if (isNaN(Date.parse(d[field]))) {
        return res.status(400).json({
          message: `Tanggal '${field}' tidak valid di baris ${i + 1}`,
        });
      }
    }
  }

  next();
};

module.exports = validateVisaDetail;
