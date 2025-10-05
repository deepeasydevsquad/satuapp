const { Op, Passport_transaction, Passport_transaction_detail, Mst_kota, Mst_bank, Division } = require("../models");
const { getCompanyIdByCode, getCabang } = require("../helper/companyHelper");
const Akuntansi = require("../library/akuntansi");

const validation = {};

validation.check_jumlah_saldo = async (value, { req } ) => {
  try {
      const company_id = await getCompanyIdByCode(req);
      const akuntansi = new Akuntansi();
      var nomor_akun = '';
      if( req.body.sumber_dana == '0' ) {
          nomor_akun = '11010';
      }else{
          const qB = await Mst_bank.findOne({ where: { id: req.body.sumber_dana, company_id: company_id } });
          nomor_akun = qB.nomor_akun;
      }
      const saldo = await akuntansi.saldo_masing_masing_akun(nomor_akun, company_id, req.body.cabang, '0') ;

      const passportDetails = req.body.passport_details || [];

      const totalPrice = passportDetails.reduce((sum, item) => {
        return sum + (parseFloat(item.price) || 0);
      }, 0);


      console.log("CCCCCCC");
      console.log(totalPrice);
      console.log("CCCCCCC");

      // check saldo
      if (saldo < totalPrice) {
        throw new Error(`Saldo sumber dana tidak mencukupi untuk melakukan transaksi ini.`);
      }
      return true
  
  } catch (error) {
    throw new Error(error);
      console.log("********************");
      console.log(error);
      console.log("********************");
  }
  // return true
}

// Validasi untuk memastikan kota yang dipilih valid
validation.check_city_id = async (value, { req }) => {
  try {
    const city = await Mst_kota.findOne({
      where: {
        id: value,
      },
    });

    if (!city) {
      console.debug(`ID Kota tidak terdaftar di pangkalan data`);
      throw new Error("ID Kota tidak terdaftar di pangkalan data");
    }

    return true;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

validation.check_birth_date = async (value, { req }) => {
  try {
    const birthDate = new Date(value);
    const today = new Date();

    if (birthDate > today) {
      console.debug(`Tanggal lahir tidak boleh di masa depan`);
      throw new Error("Tanggal lahir tidak boleh di masa depan");
    }

    // Validasi umur minimal (misalnya 17 tahun)
    const minAge = 17;
    const ageLimit = new Date();
    ageLimit.setFullYear(ageLimit.getFullYear() - minAge);

    if (birthDate > ageLimit) {
      console.debug(`Umur minimal adalah ${minAge} tahun`);
      throw new Error(`Umur minimal adalah ${minAge} tahun`);
    }

    return true;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

validation.check_identity_number_unique = async (value, { req }) => {
  try {
    const division_id = await getCabang(req);

    // Cek apakah nomor identitas sudah digunakan
    const existingPassport = await Passport_transaction.findOne({
      where: {
        payer_identity: value,
        ...(req.body.id && { id: { [Op.ne]: req.body.id } }),
      },
    });

    if (existingPassport) {
      console.debug(`Nomor identitas sudah terdaftar`);
      throw new Error("Nomor identitas sudah terdaftar di sistem");
    }

    return true;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

validation.check_invoice_unique = async (value, { req }) => {
  try {
    const division_id = await getCabang(req);

    // Cek apakah invoice sudah digunakan
    const existingPassport = await Passport_transaction.findOne({
      where: {
        invoice: value,
        ...(req.body.id && { id: { [Op.ne]: req.body.id } }),
      },
    });

    if (existingPassport) {
      console.debug(`Invoice code sudah terdaftar`);
      throw new Error("Invoice code sudah terdaftar di sistem");
    }

    return true;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

validation.check_price = async (value, { req }) => {
  try {
    const price = Number(value);

    if (price <= 0) {
      console.debug(`Harga harus lebih dari 0`);
      throw new Error("Harga harus lebih dari 0");
    }

    // Validasi harga maksimal (opsional)
    const maxPrice = 100000000; // 100 juta
    if (price > maxPrice) {
      console.debug(
        `Harga tidak boleh lebih dari ${maxPrice.toLocaleString("id-ID")}`
      );
      throw new Error(
        `Harga tidak boleh lebih dari Rp ${maxPrice.toLocaleString("id-ID")}`
      );
    }

    return true;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

validation.check_passport_transaction_exists = async (value, { req }) => {
  try {
    // Debugging: Log nilai yang diterima
    console.log(`[DEBUG] Checking passport transaction with ID: ${value}`);

    const company_id = await getCompanyIdByCode(req);
    console.log(`[DEBUG] Company ID: ${company_id}`);

    // Cari transaksi beserta detailnya
    const transaksi = await Passport_transaction.findOne({
      where: {
        id: value,
        
      },
      include: [
        {
          model: Division, 
          required: true, 
          where: { 
            company_id: company_id
          }
        },
        {
          model: Passport_transaction_detail,
          required: true,
        },
      ],
    });

    // Debugging: Log hasil query
    console.log(`[DEBUG] Transaction found:`, transaksi ? "Yes" : "No");

    if (!transaksi) {
      // Debugging lebih detail
      const anyTransaction = await Passport_transaction.findByPk(value);
      if (anyTransaction) {
        console.log(
          `[DEBUG] Transaction exists but company mismatch. DB company: ${anyTransaction.company_id}, Current company: ${company_id}`
        );
      } else {
        console.log(
          `[DEBUG] Transaction with ID ${value} not found in database at all`
        );
      }

      throw new Error(
        "Transaksi passport tidak ditemukan atau Anda tidak memiliki akses"
      );
    }

    // Simpan data transaksi di request untuk digunakan di controller
    req.passportTransaction = transaksi;
    return true;
  } catch (error) {
    console.error("[ERROR] in check_passport_transaction_exists:", error);
    throw error;
  }
};

validation.check_invoice_exists = async (value, { req }) => {
  try {
    // TAMBAHKAN DEBUG LOGGING
    console.log(`[DEBUG VALIDATION] Received value: "${value}"`);
    console.log(`[DEBUG VALIDATION] Value type:`, typeof value);
    console.log(`[DEBUG VALIDATION] Req params:`, req.params);
    console.log(`[DEBUG VALIDATION] Full URL:`, req.originalUrl);

    // Cek apakah value ada dan tidak undefined/null
    if (!value || value === "undefined" || value === "null") {
      console.error(`[DEBUG VALIDATION] Invalid invoice value: ${value}`);
      throw new Error("Invoice tidak valid atau kosong");
    }

    const company_id = await getCompanyIdByCode(req);
    console.log(`[DEBUG VALIDATION] Company ID: ${company_id}`);

    // Cari transaksi berdasarkan invoice
    const transaksi = await Passport_transaction.findOne({
      where: {
        invoice: value,
        company_id: company_id,
      },
      include: [
        {
          model: Passport_transaction_detail,
          required: true,
        },
      ],
    });

    console.log(
      `[DEBUG VALIDATION] Transaction found:`,
      transaksi ? "Yes" : "No"
    );

    if (!transaksi) {
      // Debug lebih detail
      const anyTransaction = await Passport_transaction.findOne({
        where: { invoice: value },
      });

      if (anyTransaction) {
        console.log(
          `[DEBUG VALIDATION] Transaction exists but company mismatch. DB company: ${anyTransaction.company_id}, Current company: ${company_id}`
        );
      } else {
        console.log(
          `[DEBUG VALIDATION] No transaction found with invoice: ${value}`
        );
      }

      throw new Error("Invoice tidak ditemukan atau Anda tidak memiliki akses");
    }

    // Simpan data transaksi di request untuk digunakan di controller
    req.passportTransaction = transaksi;
    return true;
  } catch (error) {
    console.error("[ERROR] in check_invoice_exists:", error);
    throw error;
  }
};

module.exports = validation;
