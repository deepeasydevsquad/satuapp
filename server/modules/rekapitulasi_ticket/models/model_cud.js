const { 
  sequelize,
  Op,
  Company,
  Division,
  Member,
  Ticket_rekapitulasi,
  Ticket_rekapitulasi_detail,
  Ticket_transaction,
  } = require("../../../models");
const Model_r = require("../models/model_r");
const { writeLog } = require("../../../helper/writeLogHelper");
const { getCompanyIdByCode, getCabang, tipe } = require("../../../helper/companyHelper");
const moment = require("moment");
const { getJamaahInfo } = require("../../../helper/JamaahHelper");

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

  async penerima() {
    this.tipe = await tipe(this.req);

    if (this.tipe === "administrator") {
      const company = await Company.findOne({
        where: { id: this.company_id },
      });
      return company?.company_name ?? "Unknown Company";
    }

    if (this.tipe === "staff") {
      const member = await Member.findOne({
        where: { company_id: this.company_id },
        order: [["id", "DESC"]],
      });
      return member?.fullname ?? "Unknown Staff";
    }

    return "Tipe user tidak diketahui";
  }

  async generateRegistrationNumber() {
  // Generate a 6-character alphanumeric registration_number code
  const possibleLetters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const possibleNumbers = "0123456789";
  let registration_number;
  let exists;

  do {
    const lettersPart = Array.from({ length: 2 }, () =>
      possibleLetters.charAt(Math.floor(Math.random() * possibleLetters.length))
    ).join("");
    
    const numbersPart = Array.from({ length: 6 }, () =>
      possibleNumbers.charAt(Math.floor(Math.random() * possibleNumbers.length))
    ).join("");

    registration_number = lettersPart + numbersPart;

    const [inTicketRekapitulasi] = await Promise.all([
      Ticket_rekapitulasi.findOne({
        where: { registration_number },
        include: [{
          model: Division,
          where: { id: this.division_id },
        }],
      }),
      
    ]);

    exists = inTicketRekapitulasi ;
  } while (exists);
    return registration_number;
  }
  
  // ==== CREATE ====k
  async addRekapitulasiTicket() {
    await this.initialize();
    const body = this.req.body;
    const dateNow = moment().format("YYYY-MM-DD HH:mm:ss");

    try {
      console.log(body);
      const { costumer_name, costumer_whatsapp_number, ticket_transaction_ids } = body;

      const dataTotalTransaksi = await Ticket_transaction.sum('total_transaksi', {
        where: {
          id: {
            [Op.in]: ticket_transaction_ids
          },
          division_id: this.division_id,
        },
        transaction: this.t,
      });
      const total_rekapitulasi = dataTotalTransaksi ?? 0;

      const registration_number = await this.generateRegistrationNumber();

      const newRekapitulasi = await Ticket_rekapitulasi.create({
        division_id: this.division_id,
        registration_number: registration_number,
        costumer_name: costumer_name,
        costumer_whatsapp_number: costumer_whatsapp_number,
        petugas: await this.penerima(), 
        total_rekapitulasi: total_rekapitulasi,
        createdAt: dateNow,
        updatedAt: dateNow,
      }, { transaction: this.t });

      const rekapitulasiId = newRekapitulasi.id;

      const rekapitulasiDetails = ticket_transaction_ids.map(id => ({
        ticket_rekapitulasi_id: rekapitulasiId,
        ticket_transaction_id: id,
        createdAt: dateNow,
        updatedAt: dateNow,
      }));

      await Ticket_rekapitulasi_detail.bulkCreate(rekapitulasiDetails, { transaction: this.t });

      this.message = `Rekapitulasi Tiket ${registration_number} berhasil ditambahkan.`;
      return registration_number;
    } catch (error) {
      console.error("Error adding rekapitulasi ticket:", error);
      this.state = false;
      throw error; // Re-throw to be caught by controller
    }
  };
    

  // ==== DELETE ====
  async deleteRekapitulasiTicket() {
    await this.initialize();
    const { id } = this.req.body; // Ambil ID dari body

    try {
      const rekapitulasi = await Ticket_rekapitulasi.findByPk(id);
      if (!rekapitulasi) {
        this.state = false;
        this.message = "Rekapitulasi tidak ditemukan.";
        return;
      }

      await Ticket_rekapitulasi.destroy({
        where: {
          id: id,
          division_id: this.division_id
        },
        transaction: this.t
      });

      this.message = `Rekapitulasi Tiket ID: ${id} berhasil dihapus.`;
    } catch (error) {
      console.error("Error deleting rekapitulasi ticket:", error);
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
