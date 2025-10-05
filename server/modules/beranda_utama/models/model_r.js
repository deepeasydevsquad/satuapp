const {
  Op,
  Paket,
  Company,
  Paket_transaction,
  Jamaah,
  Member,
  Ticket_transaction,
  Request_deposit_member,
  Akun_bank_perusahaan,
  Mst_bank,
  Headline,
  sequelize,
} = require("../../../models");
const { getCompanyIdByCode, getCabang, tipe } = require("../../../helper/companyHelper");
const moment = require("moment");

class Model_r {
  constructor(req) {
    this.req = req;
    this.company_id = null;
    this.division_id = null;
  }

  async initialize() {
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

  async statusCard() {
    await this.initialize();
    const myDate = moment();

    try {
      const where = { division_id: this.division_id };
      const startOfMonth = myDate.clone().startOf('month').format('YYYY-MM-DD');
      const endOfMonth = myDate.clone().endOf('month').format('YYYY-MM-DD');

      const [
        company,
        totalJamaah,
        paketBerangkat,
        totalTiketTerjual,
      ] = await Promise.all([
        Company.findOne({ where: { id: this.company_id }, attributes: ['saldo'] }),
        Jamaah.count({ where }),
        Paket.findAll({
          where: {
            ...where,
            departure_date: { [Op.gt]: myDate.format("YYYY-MM-DD") },
          },
          attributes: ['id'],
        }),
        Ticket_transaction.count({
          where: {
            createdAt: { [Op.between]: [startOfMonth, endOfMonth] },
          },
        }),
      ]);

      const paketIds = paketBerangkat.map(p => p.id);
      let totalJamaahBerangkat = 0;

      if (paketIds.length > 0) {
        const transaksi = await Paket_transaction.findAll({
          where: { 
            paket_id: { [Op.in]: paketIds },
            division_id: this.division_id, 
          },
          attributes: ['jamaah_id'],
          group: ['jamaah_id'],
        });
        totalJamaahBerangkat = transaksi.length;
      }

      return {
        saldo_perusahaan: company ? company.saldo : 0,
        total_jamaah_terdaftar: totalJamaah,
        total_paket_berangkat: paketIds.length,
        total_jamaah_berangkat: totalJamaahBerangkat,
        total_tiket_terjual: totalTiketTerjual,
      };
    } catch (error) {
      console.error("Error in statusCard:", error);
      return {
        saldo_perusahaan: 0,
        total_jamaah_terdaftar: 0,
        total_paket_berangkat: 0,
        total_jamaah_berangkat: 0,
        total_tiket_terjual: 0,
      };
    }
  }

  async daftarJamaah() {
    await this.initialize();

    const { perpage = 10, pageNumber = 1, search } = this.req.body || {};
    const limit = parseInt(perpage, 10);
    const page = parseInt(pageNumber, 10) > 0 ? parseInt(pageNumber, 10) : 1;
    const offset = (page - 1) * limit;

    const where = { division_id: this.division_id };

    if (search && search.trim() !== "") {
      const searchTerm = `%${search.trim()}%`;
      where[Op.or] = [
        { '$Member.fullname$': { [Op.like]: searchTerm } },
        { '$Member.identity_number$': { [Op.like]: searchTerm } },
      ];
    }

    try {
      const { count, rows } = await Jamaah.findAndCountAll({
        where,
        include: [{
          model: Member,
          attributes: ['fullname', 'identity_number', 'birth_date', 'birth_place'],
        }],
        attributes: ['id', 'nomor_passport'],
        order: [['id', 'ASC']],
        limit,
        offset,
      });

      if (rows.length === 0) {
        return { data: [], total: 0 };
      }

      const jamaahIds = rows.map(item => item.id);

      const totalPembelian = await Paket_transaction.findAll({
        where: { jamaah_id: { [Op.in]: jamaahIds } },
        attributes: [
          'jamaah_id',
          [sequelize.fn('COUNT', sequelize.col('id')), 'total_pembelian'],
        ],
        group: ['jamaah_id'],
        raw: true,
      });

      const pembelianMap = totalPembelian.reduce((map, item) => {
        map[item.jamaah_id] = item.total_pembelian;
        return map;
      }, {});

      const data = rows.map(item => ({
        jamaah_name: item.Member?.fullname || '',
        jamaah_identity: item.Member?.identity_number || '',
        birth_date: item.Member?.birth_date ? moment(item.Member.birth_date).format('DD-MM-YYYY') : '',
        birth_place: item.Member?.birth_place || '',
        no_passport: item.nomor_passport || '',
        total: parseInt(pembelianMap[item.id] || 0, 10),
      }));

      return { data, total: count };
    } catch (error) {
      console.error("Error in daftarJamaah:", error);
      return { data: [], total: 0 };
    }
  }

  async daftarPermintaanDepositMember() {
    await this.initialize();
    
    const { perpage = 5, pageNumber = 1, search } = this.req.body || {};
    const limit = parseInt(perpage, 10);
    const page = parseInt(pageNumber, 10) > 0 ? parseInt(pageNumber, 10) : 1;
    const offset = (page - 1) * limit;

    const where = { company_id: this.company_id, status: 'diproses' };

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
        attributes: ['id', 'nominal', 'code', 'status', 'status_note', 'sending_payment_status'],
        order: [['id', 'DESC']],
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
            status_note: item.status_note,
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

  async daftarHeadline() {
    await this.initialize();

    try {
      const { count, rows } = await Headline.findAndCountAll({ 
        where: { company_id: this.company_id },
        order: [['id', 'ASC']]
      });

      const data = rows.map((item) => ({
        id: item.id,
        headline: item.headline,
        tampilkan: item.tampilkan,
      }));

      return { 
        data: data, 
        total: count
      };
    } catch (error) {
      console.error("Error in daftarHeadline:", error);
      return { data: [], total: 0 };
    }
  }

  async fetchHeadline() {
    await this.initialize();
    const { id } = this.req.body;
    
    try {
      const dataHeadline = await Headline.findOne({ where: { id: id, company_id: this.company_id } });

      if (!dataHeadline) {
        return { data: null, total: 0 };
      }

      const data = {
        id: dataHeadline.id,
        headline: dataHeadline.headline,
        tampilkan: dataHeadline.tampilkan,
      };

      return { 
        data: data, 
        total: 1
      };
    } catch (error) {
      console.error("Error in fetchHeadline:", error);
      return { data: null, total: 0 };
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
        return null;
      }

      const bank = dataRequest.Akun_bank_perusahaan;
      const bankInfo = bank && bank.Mst_bank
          ? `${bank.Mst_bank.name} - ${bank.nama_akun} (${bank.nomor_akun})`
          : 'Bank tidak ditemukan';

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
        bank_info: bankInfo,
        sending_payment_status: dataRequest.sending_payment_status,
      };

      return data;
    } catch (error) {
      console.error("Error in infoRequestDepositMember:", error);
      return null;
    }
  }
}

module.exports = Model_r;