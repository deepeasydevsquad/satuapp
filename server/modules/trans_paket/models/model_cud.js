const { 
  sequelize,
  Company,
  Jamaah,
  File_pendukung,
  Member,
  } = require("../../../models");
const Model_r = require("../models/model_r");
const { writeLog } = require("../../../helper/writeLogHelper");
const { getCompanyIdByCode, getCabang, tipe } = require("../../../helper/companyHelper");
const moment = require("moment");

class Model_cud {
  constructor(req) {
    this.req = req;
    this.division_id;
    this.company_id;
  } 

  async initialize() {
    this.company_id = await getCompanyIdByCode(this.req);
    this.division_id = await getCabang(this.req);
    // initialize transaction
    this.t = await sequelize.transaction();
    this.state = true;
  }

  async addUploadFile() {
    await this.initialize();

    try {
      const body = this.req.body;
      const files = this.req.files; // hasil dari multer (upload.array)
      const payload = body.payload || [];

      if (!files || files.length === 0) {
        this.state = false;
        throw new Error("Tidak ada file yang diupload.");
      }
      console.log("Body:", body);
      console.log("Files:", files);

      const dataToInsert = files.map((file, index) => ({
        company_id: this.company_id,
        paket_transaction_id: body.id,
        title_file: payload[index]?.title || file.originalname, // fallback ke originalname kalau title tidak ada
        filename: file.filename,
      }));

      await File_pendukung.bulkCreate(dataToInsert, { transaction: this.t });

      this.message = `${files.length} file berhasil diupload.`;
    } catch (error) {
      console.error("Error in addUploadFile:", error);
      this.state = false;
      throw error;
    }
  }
  
  // response
  async response() {
    if (this.state) {
      await writeLog(this.req, this.t, {
        msg: this.message,
      });
      // commit
      await this.t.commit();
      return true;
    } else {
      // rollback
      await this.t.rollback();
      return false;
    }
  }
}

module.exports = Model_cud;
