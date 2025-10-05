const { Op, Company, Member, Request_deposit_member, Akun_bank_perusahaan, Mst_bank, sequelize } = require("../../../models");
const { getCompanyIdByCode, getCabang } = require("../../../helper/companyHelper");

const moment = require("moment");

class Model_r {
  constructor(req) {
    this.req = req;
    this.company_id = null;
    this.division_id = null;
  }

  async initialize() {
    // Avoid re-initializing if already done
    if (this.company_id && this.division_id) {
      return;
    }
    this.company_id = await getCompanyIdByCode(this.req);
    this.division_id = await getCabang(this.req);
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

  async daftarPermintaanDepositMember() {
    await this.initialize();
    const body = this.req.body;

    const { perpage = 10, pageNumber = 1, search } = this.req.body || {};
    const limit = parseInt(perpage, 10);
    const page = parseInt(pageNumber, 10) > 0 ? parseInt(pageNumber, 10) : 1;
    const offset = (page - 1) * limit;

    const where = { company_id: this.company_id };

    if (search && search.trim() !== "") {
      const searchTerm = `%${search.trim()}%`;
      where[Op.or] = [
        { '$Member.fullname$': { [Op.like]: searchTerm } },
        { '$Member.identity_number$': { [Op.like]: searchTerm } },
      ];
    }


    try {
      const { count, rows } = await Request_deposit_member.findAndCountAll({
        where,
        include: [
          {
            model: Member,
            attributes: ['fullname', 'identity_number'],
          },
          {
            model: Akun_bank_perusahaan,
            include: [{
              model: Mst_bank,
              attributes: ['name'],
            }],
            attributes: ['id', 'nomor_akun', 'nama_akun'],
          },
        ],
        attributes: ['id', 'nominal', 'code', 'status', 'status_note', 'sending_payment_status', 'petugas'],
        order: [['id', 'ASC']],
        limit,
        offset,
      });

      const data = rows.map((item) => {
        const bank = item.Akun_bank_perusahaan;
        const bankInfo = bank && bank.Mst_bank
            ? `${bank.Mst_bank.name} - ${bank.nama_akun} (${bank.nomor_akun})`
            : 'Bank tidak ditemukan';

        return {
          id: item.id,
          member_name: item.Member?.fullname || '',
          member_identity: item.Member?.identity_number || '',
          jumlah: item.nominal,
          code: item.code,
          status: item.status,
          status_note: item.status_note,
          petugas: item.petugas || '-',
          bank_info: bankInfo,
          sending_payment_status: item.sending_payment_status || 'belum_dikirim',
        };
      });

      return { 
        data: data, 
        total: count
      };
    } catch (error) {
      console.error("Error in daftarPermintaanDepositMember:", error);
      return { data: [], total: 0 };
    }
  }

  async infoRequestDepositMember(id) {
    await this.initialize();

    try {
      const dataRequest = await Request_deposit_member.findOne({
        where: { id, company_id: this.company_id },
        include: [
          {
            model: Member,
            attributes: ['id', 'division_id', 'fullname', 'identity_number', 'total_deposit'],
          },
          {
            model: Akun_bank_perusahaan,
            include: [{
              model: Mst_bank,
              attributes: ['name'],
            }],
            attributes: ['id', 'nomor_akun', 'nama_akun'],
          },
        ],
        attributes: ['id', 'member_id', 'nominal', 'code', 'status', 'status_note', 'sending_payment_status'],
      });

      if (!dataRequest) {
        return { data: [], total: 0 };
      }

      const data = {
        id: dataRequest.id,
        member_id: dataRequest.member_id,
        member_division_id: dataRequest.Member?.division_id || null,
        member_name: dataRequest.Member?.fullname || '',
        member_identity: dataRequest.Member?.identity_number || '',
        total_deposit: dataRequest.Member?.total_deposit || 0,
        nominal: dataRequest.nominal,
        keperluan: dataRequest.status_note,
        code: dataRequest.code,
        status: dataRequest.status,
        bank_info: dataRequest.sending_payment_status || '',
        bank_name: dataRequest.Akun_bank_perusahaan?.Mst_bank?.name || '',
        bank_nomor: dataRequest.Akun_bank_perusahaan?.nomor_akun || '',
      };

      console.log("Data Request Deposit Member: ", data);

      return data 
    } catch (error) {
      console.error("Error in infoRequestDepositMember:", error);
      return { data: [], total: 0 };
    }
  }
}

module.exports = Model_r;
