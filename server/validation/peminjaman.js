const { Division, Jamaah, Peminjaman, Mst_bank } = require("../models");
const { getCabang, getCompanyIdByCode, tipe } = require("../helper/companyHelper");
const { convertToRP } = require("../helper/currencyHelper");
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
      const nominal = req.body.nominal;
      // check saldo
      if (saldo < nominal) {
        throw new Error(`Saldo sumber dana tidak mencukupi untuk melakukan transaksi ini.`);
      }
      return true
  } catch (error) {
    console.log("********************");
    console.log(error);
    console.log("********************");
    throw new Error(error);
  }
}

validation.check_id_jamaah = async (value, { req }) => {
  const company_id = await getCompanyIdByCode(req);
  const tipes = await tipe(req);
  if (tipes === "administrator") {
    var check = await Jamaah.findOne({
      include: {
        required: true,
        model: Division,
        where: {
          company_id: company_id,
        },
      },
    });
    if (!check) {
      throw new Error("ID Jamaah tidak terdaftar dipangkalan data");
    }
  } else if (tipes != "administrator") {
    const division_id = await getCabang(req);
    var check = await Jamaah.findOne({
      where: {
        division_id: division_id,
      },
    });
    if (!check) {
      throw new Error("ID Jamaah tidak terdaftar dipangkalan data");
    }
  }
  return true;
};

validation.check_id_peminjaman = async (value, { req }) => {

  console.log("########");
  console.log(value);
  console.log("########");
  var check = await Peminjaman.findOne({
    where: { id: value },
  });
  if (!check) {
    throw new Error("ID Peminjaman tidak terdaftar dipangkalan data");
  }
  return true;
};

validation.check_skema = async (value, { req }) => {
  const division_id = await getCabang(req);
  const qPeminjaman = await Peminjaman.findOne({
    where: { id: req.body.peminjaman_id, division_id: division_id },
  });
  const utang = qPeminjaman.nominal - qPeminjaman.dp;
  var error = false;
  // updatedSkema
  var totalNominal = 0;
  var tanggal_jatuh_tempo = [];
  for (let x in value) {
    totalNominal = totalNominal + value[x].nominal;
    if (!tanggal_jatuh_tempo.includes(value[x].duedate)) {
      tanggal_jatuh_tempo.push(value[x].duedate);
    } else {
      error = true;
    }
  }
  // check total nominal angsuran
  if (utang != totalNominal) {
    throw new Error(
      "Total Jumlah Nominal Angsuran Perbulan Tidak Sesuai Dengan Total Utang Yaitu: " +
        (await convertToRP(utang))
    );
  }
  // check duplikasi tanggal jatuh tempo.
  if (error) {
    throw new Error("Terdapat tanggal jatuh tempo yang duplikat.");
  }

  return true;
};

module.exports = validation;
