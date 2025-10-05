const Model_r = require("../models/model_r");
const { handleValidationErrors, handleServerError } = require("../../../helper/handleError");
const ExcelJS = require("exceljs");
const{ convertToRP } = require("../../../helper/currencyHelper");

const controllers = {};

// **Mendapatkan daftar investor**
controllers.list = async (req, res) => {
  if (!(await handleValidationErrors(req, res))) return;

  try {
    const model_r = new Model_r(req);
    const feedBack = await model_r.list(); // Ambil daftar investor dari model

    console.log("CCCCCCCCCCCCCC");
    console.log(feedBack);
    console.log("CCCCCCCCCCCCCC");

    res.status(200).json({ error: false, data : feedBack.list });
  } catch (error) {
    handleServerError(res, error.message);
  }
};

controllers.downloadDataLabaRugi = async (req, res) => {
  if (!(await handleValidationErrors(req, res))) return;

  try {
    const model_r = new Model_r(req);
    const feedBack = await model_r.list(); // Ambil daftar investor dari model
    const workbook = new ExcelJS.Workbook();
    const list = feedBack.list;

    const worksheet = workbook.addWorksheet("Data Laba Rugi");

    worksheet.getColumn(1).width = 15; // Kolom A
    worksheet.getColumn(2).width = 30; // Kolom B
    worksheet.getColumn(3).width = 20;

    for( let x in list ) {
      var footerRow = worksheet.addRow([ x.toLocaleUpperCase() ,'', '']);
      worksheet.mergeCells(`A${footerRow.number}:C${footerRow.number}`);
      footerRow.height = 25; 

      footerRow.eachCell((cell, colNumber) => {
        cell.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true, indent: 1 };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'D9DDDC' }, // Biru donker
        };
        cell.font = {
          bold: true,
          color: { argb: '6b7280' },
        };
        cell.border = {
          top:    { style: 'thin', color: { argb: '6b7280' } },
          left:   { style: 'thin', color: { argb: '6b7280' } },
          bottom: { style: 'thin', color: { argb: '6b7280' } },
          right:  { style: 'thin', color: { argb: '6b7280' } },
        };
      });

      var listx = list[x];
      for( let y in listx ){
        var footerRow2 = worksheet.addRow([ listx[y].nomor_akun , listx[y].nama_akun , listx[y].saldo]);
        footerRow2.height = 25; // ✅ Set tinggi baris
        footerRow2.eachCell((cell, colNumber) => {
          
          cell.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true, indent: 1 };
          cell.font = {
            color: { argb: '6b7280' },
          };
          cell.border = {
            top:    { style: 'thin', color: { argb: '6b7280' } },
            left:   { style: 'thin', color: { argb: '6b7280' } },
            bottom: { style: 'thin', color: { argb: '6b7280' } },
            right:  { style: 'thin', color: { argb: '6b7280' } },
          };
        });
      }
      var totalTemp = await convertToRP(listx.reduce((total, akun) => total + akun.real_saldo, 0))
      var footerRow3 = worksheet.addRow([ 'SUBTOTAL ' + x.toLocaleUpperCase() ,'', totalTemp]);
      worksheet.mergeCells(`A${footerRow3.number}:B${footerRow3.number}`);
      footerRow3.height = 25; // ✅ Set tinggi baris
      footerRow3.eachCell((cell, colNumber) => {
        cell.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true, indent: 1 };
        cell.font = {
          bold: true,
          color: { argb: '6b7280' },
        };
        cell.border = {
          top:    { style: 'thin', color: { argb: '6b7280' } },
          left:   { style: 'thin', color: { argb: '6b7280' } },
          bottom: { style: 'thin', color: { argb: '6b7280' } },
          right:  { style: 'thin', color: { argb: '6b7280' } },
        };
      });


    }

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
