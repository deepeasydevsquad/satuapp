const Model_r = require("../models/model_r");
const { handleValidationErrors, handleServerError } = require("../../../helper/handleError");
const ExcelJS = require("exceljs");
const{ convertToRP } = require("../../../helper/currencyHelper");

const controllers = {};

controllers.list = async (req, res) => {
  if (!(await handleValidationErrors(req, res))) return;

  try {
    const model_r = new Model_r(req);
    const feedBack = await model_r.list();

    res.status(200).json({ error: false, data : feedBack.list });
  } catch (error) {
    handleServerError(res, error.message);
  }
};

controllers.downloadDataNeraca = async (req, res) => {
  if (!(await handleValidationErrors(req, res))) return;

  try {
    const model_r = new Model_r(req);
    const feedBack = await model_r.list();
    const workbook = new ExcelJS.Workbook();
    const list = feedBack.list;

    const worksheet = workbook.addWorksheet("Data Neraca");

    worksheet.getColumn(1).width = 15;
    worksheet.getColumn(2).width = 30;
    worksheet.getColumn(3).width = 20;

    for( let x in list ) {
      var footerRow = worksheet.addRow([ x.toLocaleUpperCase() == '1' ? 'AKTIFA' : 'PASSIVA' ,'', '']);
      worksheet.mergeCells(`A${footerRow.number}:C${footerRow.number}`);
      footerRow.height = 25; 

      footerRow.eachCell((cell, colNumber) => {
        cell.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true, indent: 1 };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'D9DDDC' },
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
      var subtotal = 0;
      for( let y in listx ){
        var footerRow2 = worksheet.addRow([ listx[y].nomor_akun , listx[y].nama_akun , listx[y].saldo]);
        footerRow2.height = 25;
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
        subtotal = subtotal + listx[y].saldo;
      }

      var totalTemp = await convertToRP(subtotal)
      var footerRow3 = worksheet.addRow([ 'SUBTOTAL ' + x.toLocaleUpperCase() ,'', totalTemp]);
      worksheet.mergeCells(`A${footerRow3.number}:B${footerRow3.number}`);
      footerRow3.height = 25;
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
