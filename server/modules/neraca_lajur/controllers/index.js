const Model_r = require("../models/model_r");
const { handleValidationErrors, handleServerError } = require("../../../helper/handleError");
const{ convertToRP } = require("../../../helper/currencyHelper");
const ExcelJS = require("exceljs");

const controllers = {};

// **Mendapatkan daftar investor**
controllers.list = async (req, res) => {
  if (!(await handleValidationErrors(req, res))) return;

  try {
    const model_r = new Model_r(req);
    const feedBack = await model_r.list(); // Ambil daftar investor dari model

    var total = { 
      saldo_awal_debet : await convertToRP(feedBack.total.saldo_awal_debet),
      saldo_awal_kredit : await convertToRP(feedBack.total.saldo_awal_kredit),
      penyesuaian_akun_debet : await convertToRP(feedBack.total.penyesuaian_akun_debet),
      penyesuaian_akun_kredit : await convertToRP(feedBack.total.penyesuaian_akun_kredit),
      saldo_disesuaikan_debet : await convertToRP(feedBack.total.saldo_disesuaikan_debet),
      saldo_disesuaikan_kredit : await convertToRP(feedBack.total.saldo_disesuaikan_kredit),
      neraca_debet : await convertToRP(feedBack.total.neraca_debet),
      neraca_kredit : await convertToRP(feedBack.total.neraca_kredit),
      laba_debet : await convertToRP(feedBack.total.laba_debet),
      laba_kredit : await convertToRP(feedBack.total.laba_kredit),
      a_debet: await convertToRP(( feedBack.total.laba_kredit - feedBack.total.laba_debet ) > 0 ? 0 : (feedBack.total.laba_kredit - feedBack.total.laba_debet)),
      a_kredit : await convertToRP( ( feedBack.total.laba_kredit - feedBack.total.laba_debet ) > 0 ? (feedBack.total.laba_kredit - feedBack.total.laba_debet) : 0),
      a_debet_nc: ( feedBack.total.laba_kredit - feedBack.total.laba_debet ) > 0 ? 0 : (feedBack.total.laba_kredit - feedBack.total.laba_debet),
      a_kredit_nc : ( feedBack.total.laba_kredit - feedBack.total.laba_debet ) > 0 ? (feedBack.total.laba_kredit - feedBack.total.laba_debet) : 0,
      status: ( ( feedBack.total.laba_kredit - feedBack.total.laba_debet ) > 0 ? (feedBack.total.laba_kredit - feedBack.total.laba_debet) : 0 ) ? 'laba' : 'rugi',
    }

    total['nrc_debet'] = await convertToRP(feedBack.total.neraca_debet + total.a_debet_nc)
    total['nrc_kredit'] = await convertToRP(feedBack.total.neraca_kredit + total.a_kredit_nc)

    res.status(200).json({ error: false, data : feedBack.list, total: total  });
  } catch (error) {
    handleServerError(res, error.message);
  }
};


controllers.downloadDataNeracaLajur = async (req, res) => {
  if (!(await handleValidationErrors(req, res))) return;

  try {
    const model_r = new Model_r(req);
    const feedBack = await model_r.list(); // Ambil daftar investor dari model
    
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Data Neraca Lajur");

     var total = { 
      saldo_awal_debet : await convertToRP(feedBack.total.saldo_awal_debet),
      saldo_awal_kredit : await convertToRP(feedBack.total.saldo_awal_kredit),
      penyesuaian_akun_debet : await convertToRP(feedBack.total.penyesuaian_akun_debet),
      penyesuaian_akun_kredit : await convertToRP(feedBack.total.penyesuaian_akun_kredit),
      saldo_disesuaikan_debet : await convertToRP(feedBack.total.saldo_disesuaikan_debet),
      saldo_disesuaikan_kredit : await convertToRP(feedBack.total.saldo_disesuaikan_kredit),
      neraca_debet : await convertToRP(feedBack.total.neraca_debet),
      neraca_kredit : await convertToRP(feedBack.total.neraca_kredit),
      laba_debet : await convertToRP(feedBack.total.laba_debet),
      laba_kredit : await convertToRP(feedBack.total.laba_kredit),
      a_debet: await convertToRP(( feedBack.total.laba_kredit - feedBack.total.laba_debet ) > 0 ? 0 : (feedBack.total.laba_kredit - feedBack.total.laba_debet)),
      a_kredit : await convertToRP( ( feedBack.total.laba_kredit - feedBack.total.laba_debet ) > 0 ? (feedBack.total.laba_kredit - feedBack.total.laba_debet) : 0),
      a_debet_nc: ( feedBack.total.laba_kredit - feedBack.total.laba_debet ) > 0 ? 0 : (feedBack.total.laba_kredit - feedBack.total.laba_debet),
      a_kredit_nc : ( feedBack.total.laba_kredit - feedBack.total.laba_debet ) > 0 ? (feedBack.total.laba_kredit - feedBack.total.laba_debet) : 0,
      status: ( ( feedBack.total.laba_kredit - feedBack.total.laba_debet ) > 0 ? (feedBack.total.laba_kredit - feedBack.total.laba_debet) : 0 ) ? 'laba' : 'rugi',
    }

    total['nrc_debet'] = await convertToRP(feedBack.total.neraca_debet + total.a_debet_nc)
    total['nrc_kredit'] = await convertToRP(feedBack.total.neraca_kredit + total.a_kredit_nc)

    // Baris pertama (judul grup kolom)
    worksheet.mergeCells('A1:A2'); // KODE AKUN rowspan
    worksheet.mergeCells('B1:B2'); // NAMA AKUN rowspan
    worksheet.mergeCells('C1:D1'); // SALDO AWAL colspan
    worksheet.mergeCells('E1:F1'); // PENYESUAIAN colspan
    worksheet.mergeCells('G1:H1'); // SALDO DISESUAIKAN colspan
    worksheet.mergeCells('I1:J1'); // NERACA colspan
    worksheet.mergeCells('K1:L1'); // LABA RUGI colspan

    worksheet.getCell('A1').value = 'KODE AKUN';
    worksheet.getCell('B1').value = 'NAMA AKUN';
    worksheet.getCell('C1').value = 'SALDO AWAL';
    worksheet.getCell('E1').value = 'PENYESUAIAN';
    worksheet.getCell('G1').value = 'SALDO DISESUAIKAN';
    worksheet.getCell('I1').value = 'NERACA';
    worksheet.getCell('K1').value = 'LABA RUGI';

    // Baris kedua (subkolom)
    worksheet.getCell('C2').value = 'DEBET';
    worksheet.getCell('D2').value = 'KREDIT';
    worksheet.getCell('E2').value = 'DEBET';
    worksheet.getCell('F2').value = 'KREDIT';
    worksheet.getCell('G2').value = 'DEBET';
    worksheet.getCell('H2').value = 'KREDIT';
    worksheet.getCell('I2').value = 'AKTIVA';
    worksheet.getCell('J2').value = 'PASIVA';
    worksheet.getCell('K2').value = 'DEBET';
    worksheet.getCell('L2').value = 'KREDIT';

    // Tambahkan data di bawahnya
    worksheet.columns = [
      { key: "kode_akun", width: 15 },
      { key: "nama_akun", width: 50 },
      { key: "saldo_awal_debet", width: 20 },
      { key: "saldo_awal_kredit", width: 20 },
      { key: "penyesuaian_debet", width: 20 },
      { key: "penyesuaian_kredit", width: 20 },
      { key: "disesuaikan_debet", width: 20 },
      { key: "disesuaikan_kredit", width: 20 },
      { key: "neraca_aktiva", width: 20 },
      { key: "neraca_pasiva", width: 20 },
      { key: "laba_debet", width: 20 },
      { key: "laba_kredit", width: 20 },
    ];

    let no = 1;

    const headerRow1 = worksheet.getRow(no);
    headerRow1.height = 25; // ✅ Set tinggi baris
    headerRow1.eachCell((cell) => {
      
      cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF1E3A8A' }, // Biru donker
      };
      cell.font = {
        bold: true,
        color: { argb: 'FFFFFFFF' },
      };
      cell.border = {
        top:    { style: 'thin', color: { argb: 'FFFFFFFF' } },
        left:   { style: 'thin', color: { argb: 'FFFFFFFF' } },
        bottom: { style: 'thin', color: { argb: 'FFFFFFFF' } },
        right:  { style: 'thin', color: { argb: 'FFFFFFFF' } },
      };
    });

    no++

    const headerRow2 = worksheet.getRow(no);
    headerRow2.height = 25; // ✅ Set tinggi baris
    headerRow2.eachCell((cell) => {
      cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF1E3A8A' }, // Biru donker
      };
      cell.font = {
        bold: true,
        color: { argb: 'FFFFFFFF' },
      };
      cell.border = {
        top:    { style: 'thin', color: { argb: 'FFFFFFFF' } },
        left:   { style: 'thin', color: { argb: 'FFFFFFFF' } },
        bottom: { style: 'thin', color: { argb: 'FFFFFFFF' } },
        right:  { style: 'thin', color: { argb: 'FFFFFFFF' } },
      };
    });

    for (const data of feedBack.list) {
      no++;

      worksheet.addRow({
        kode_akun: data.akun, 
        nama_akun: data.nama_akun,
        saldo_awal_debet: data.debet_saldo_awal,
        saldo_awal_kredit: data.kredit_saldo_awal, 
        penyesuaian_debet: data.debet_penyesuaian,
        penyesuaian_kredit: data.kredit_penyesuaian,
        disesuaikan_debet: data.debet_saldo_disesuaikan,
        disesuaikan_kredit: data.kredit_saldo_disesuaikan,
        neraca_aktiva: data.debet_neraca,
        neraca_pasiva: data.kredit_neraca,
        laba_debet: data.debet_laba_rugi,
        laba_kredit: data.kredit_laba_rugi
      });

      var headerColumn = worksheet.getRow(no);
      headerColumn.height = 25; 
      headerColumn.eachCell((cell, colNumber) => {
        // cell.alignment = { vertical: 'middle', horizontal: 'center' };
        if (colNumber === 2) {
          cell.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true, indent: 1 };
        } else {
          cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
        }
        cell.border = {
          top:    { style: 'thin', color: { argb: 'FF1E3A8A' } },
          left:   { style: 'thin', color: { argb: 'FF1E3A8A' } },
          bottom: { style: 'thin', color: { argb: 'FF1E3A8A' } },
          right:  { style: 'thin', color: { argb: 'FF1E3A8A' } },
        };
      });
    }

    // Tentukan baris footer setelah semua data ditambahkan
    const footerRow = worksheet.addRow([
      "TOTAL",'', // Kolom 1 dan 2 akan digabung
      await convertToRP(feedBack.total.saldo_awal_debet), await convertToRP(feedBack.total.saldo_awal_kredit),
      await convertToRP(feedBack.total.penyesuaian_akun_debet), await convertToRP(feedBack.total.penyesuaian_akun_kredit),
      await convertToRP(feedBack.total.saldo_disesuaikan_debet), await convertToRP(feedBack.total.saldo_disesuaikan_kredit),
      await convertToRP(feedBack.total.neraca_debet), await convertToRP(feedBack.total.neraca_kredit),
      await convertToRP(feedBack.total.laba_debet), await convertToRP(feedBack.total.laba_kredit)
    ]);

    // Gabungkan kolom A dan B (colspan="2")
    worksheet.mergeCells(`A${footerRow.number}:B${footerRow.number}`);
    
    const footerRowSetting = worksheet.getRow(footerRow.number);
    footerRowSetting.height = 25; // ✅ Set tinggi baris
    footerRowSetting.eachCell((cell, colNumber) => {
      if(colNumber == 2){
        cell.alignment = { vertical: 'middle', horizontal: 'right', wrapText: true, indent: 1 };
      }else{
        cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
      }
      
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'D9DDDC' }, // Biru donker
      };
      cell.font = {
        bold: true,
      };
      cell.border = {
        top:    { style: 'thin', color: { argb: 'FFFFFFFF' } },
        left:   { style: 'thin', color: { argb: 'FFFFFFFF' } },
        bottom: { style: 'thin', color: { argb: 'FFFFFFFF' } },
        right:  { style: 'thin', color: { argb: 'FFFFFFFF' } },
      };
    });

    const footerRow2 = worksheet.addRow([
      '', '', '', '', '', '', '',
      total.status.toUpperCase(), // Kolom 1 dan 2 akan digabung
      total.a_debet,
      total.a_kredit,
      total.a_debet,
      total.a_kredit,
    ]);

    worksheet.mergeCells(`A${footerRow2.number}:G${footerRow2.number}`);

    const footerRowSetting2 = worksheet.getRow(footerRow2.number);
    footerRowSetting2.height = 25; // ✅ Set tinggi baris
    footerRowSetting2.eachCell((cell, colNumber) => {
      cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'D9DDDC' }, // Biru donker
      };
      if( colNumber == 8) {
        cell.font = {
          bold: true,
          color: { argb: total.status == 'rugi' ? 'FF0000' : '00FF00' },
        };
      }else{
        cell.font = {
          bold: true,
        };
      }
      cell.border = {
        top:    { style: 'thin', color: { argb: 'FFFFFFFF' } },
        left:   { style: 'thin', color: { argb: 'FFFFFFFF' } },
        bottom: { style: 'thin', color: { argb: 'FFFFFFFF' } },
        right:  { style: 'thin', color: { argb: 'FFFFFFFF' } },
      };
    });

    const footerRow3 = worksheet.addRow([
      '', '', '', '', '', '', '',
      'NRC', 
      total.nrc_debet,
      total.nrc_kredit,
      '',
      '',
    ]);

    worksheet.mergeCells(`A${footerRow3.number}:G${footerRow3.number}`);
     const footerRowSetting3 = worksheet.getRow(footerRow3.number);
    footerRowSetting3.height = 25; // ✅ Set tinggi baris
    footerRowSetting3.eachCell((cell, colNumber) => {
      cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'D9DDDC' }, // Biru donker
      };
      cell.font = {
        bold: true,
      };
      cell.border = {
        top:    { style: 'thin', color: { argb: 'FFFFFFFF' } },
        left:   { style: 'thin', color: { argb: 'FFFFFFFF' } },
        bottom: { style: 'thin', color: { argb: 'FFFFFFFF' } },
        right:  { style: 'thin', color: { argb: 'FFFFFFFF' } },
      };
    });

    let buffer;
    try {
      buffer = await workbook.xlsx.writeBuffer();
    } catch (err) {
      console.error("Gagal generate file Excel:", err);
      return res.status(500).json({ message: "Gagal generate file Excel." });
    }
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=Data_Buku_Besar.xlsx"
    );
    res.send(buffer);
      
  } catch (error) {
    handleServerError(res, error.message);
  }
}

module.exports = controllers;
