const {
  Op,
  Provinsi,
  Kabupaten_kota,
  Kecamatan,
  Kelurahan,
  Mst_mahram_type,
  Mst_pekerjaan,
  Mst_pendidikan,
  Mst_kota,
  Mst_provider,
  Mst_paket_type,
  Mst_asuransi,
  Mst_airline,
  Mst_airport,
  Mst_hotel,
  Mst_fasilitas,
  Pengalaman_haji_umrah,
} = require("../../../models");
const { getCompanyIdByCode } = require("../../../helper/companyHelper");
const { dbList } = require("../../../helper/dbHelper");

class Model_r {
  constructor(req) {
    this.req = req;
    this.company_id;
  }

  async initialize() {
    this.company_id = await getCompanyIdByCode(this.req);
  }

  async daftar_provinsi() {
    const sql = {
      order: [["name", "ASC"]],
      attributes: ["id", "name"],
    };

    try {
      const query = await dbList(sql);
      console.log(query);

      const result = await Provinsi.findAndCountAll(query.sql);
      const total = result.count;

      const data = result.rows.map((e) => ({
        id: e.id,
        name: e.name,
      }));

      return { data, total };
    } catch (error) {
      console.error(error);
      return {};
    }
  }

  async daftar_kabupaten() {
    const body = this.req.body

    const sql = {
      where: { provinsi_id: body.provinsi_id },
      order: [["name", "ASC"]],
      attributes: ["id", "provinsi_id", "name"],
    };

    try {
      const query = await dbList(sql);
      console.log(query);
      const result = await Kabupaten_kota.findAndCountAll(query.sql);
      const total = result.count;

      const data = result.rows.map((e) => ({
        id: e.id,
        provinsi_id: e.provinsi_id,
        name: e.name,
      }));

      return { data, total };
    } catch (error) {
      console.error(error);
      return {};
    }
  }

  async daftar_kecamatan() {
    const body = this.req.body;

    const sql = {
      where: { kabupaten_kota_id: body.kabupaten_id },
      order: [["name", "ASC"]],
      attributes: ["id", "kabupaten_kota_id", "name"],
    };

    try {
      const query = await dbList(sql);
      console.log(query);
      const result = await Kecamatan.findAndCountAll(query.sql);
      const total = result.count;

      const data = result.rows.map((e) => ({
        id: e.id,
        kabupaten_kota_id: e.kabupaten_kota_id,
        name: e.name,
      }));

      return { data, total };
    } catch (error) {
      console.error(error);
      return {};
    }
  }

  async daftar_kelurahan() {
    const body = this.req.body;

    const sql = {
      where: { kecamatan_id: body.kecamatan_id},
      order: [["name", "ASC"]],
      attributes: ["id", "kecamatan_id", "name"],
    };

    try {
      const query = await dbList(sql);
      console.log(query);
      const result = await Kelurahan.findAndCountAll(query.sql);
      const total = result.count;

      const data = result.rows.map((e) => ({
        id: e.id,
        kecamatan_id: e.kecamatan_id,
        name: e.name,
      }));

      return { data, total };
    } catch (error) {
      console.error(error);
      return {};
    }
  }

  async daftar_mahram() {
    const sql = {
      order: [["id", "ASC"]],
      attributes: ["id", "name"],
    };

    try {
      const query = await dbList(sql);
      console.log(query);
      const result = await Mst_mahram_type.findAndCountAll(query.sql);
      const total = result.count;

      const data = result.rows.map((e) => ({
        id: e.id,
        name: e.name,
      }));

      return { data, total };
    } catch (error) {
      console.error(error);
      return {};
    }
  }

  async daftar_pekerjaan() {
    const sql = {
      order: [["id", "ASC"]],
      attributes: ["id", "name"],
    };

    try {
      const query = await dbList(sql);
      console.log(query);
      const result = await Mst_pekerjaan.findAndCountAll(query.sql);
      const total = result.count;

      const data = result.rows.map((e) => ({
        id: e.id,
        name: e.name,
      }));

      return { data, total };
    } catch (error) {
      console.error(error);
      return {};
    }
  }
  async daftar_pendidikan() {
    const sql = {
      order: [["id", "ASC"]],
      attributes: ["id", "name"],
    };

    try {
      const query = await dbList(sql);
      console.log(query);
      const result = await Mst_pendidikan.findAndCountAll(query.sql);
      const total = result.count;

      const data = result.rows.map((e) => ({
        id: e.id,
        name: e.name,
      }));

      return { data, total };
    } catch (error) {
      console.error(error);
      return {};
    }
  }
  async daftar_haji_umrah() {
    const sql = {
      order: [["id", "ASC"]],
      attributes: ["id", "name"],
    };

    try {
      const query = await dbList(sql);
      console.log(query);
      const result = await Pengalaman_haji_umrah.findAndCountAll(query.sql);
      const total = result.count;

      const data = result.rows.map((e) => ({
        id: e.id,
        name: e.name,
      }));

      return { data, total };
    } catch (error) {
      console.error(error);
      return {};
    }
  }

  async getKota() {
    await this.initialize();
    const sql = {
      where: { company_id: this.company_id },
      attributes: ["id", "name"],
      order: [["name", "ASC"]],
    };

    try {
      const query = await dbList(sql);
      console.log(query);

      const result = await Mst_kota.findAndCountAll(query.sql);
      const total = result.count;

      const data = result.rows.map((e) => ({
        id: e.id,
        name: e.name,
      }));

      return { data, total };
    } catch (error) {
      console.error(error);
      return {};
    }
  }

  async getProviderVisa() {
    await this.initialize();
    const sql = {
      where: { company_id: this.company_id },
      attributes: ["id", "name"],
      order: [["name", "ASC"]],
    };
    try {
      const result = await Mst_provider.findAndCountAll(sql);
      const total = result.count;
      const data = result.rows.map((e) => ({
        id: e.id,
        name: e.name,
      }));
      console.log("getProviderVisa: ", data);
      return { 
        data: data, 
        total: total
      };
    } catch (error) {
      console.error(error);
      return {};
    }
  }

  async getTipePaket() {
    await this.initialize();
    const sql = {
      where: { company_id: this.company_id },
      attributes: ["id", "name"],
      order: [["name", "ASC"]],
    };
    try {
      const query = await dbList(sql);
      console.log(query);

      const result = await Mst_paket_type.findAndCountAll(query.sql);
      const total = result.count;
      const data = result.rows.map((e) => ({
        id: e.id,
        name: e.name,
      }));
      return { 
        data: data, 
        total: total
      };
    } catch (error) {
      console.error(error);
      return {};
    }
  }

  async getAsuransi() {
    await this.initialize();
    const sql = {
      where: { company_id: this.company_id },
      attributes: ["id", "name"],
      order: [["name", "ASC"]],
    };
    try {
      const query = await dbList(sql);
      console.log(query);

      // Mengambil data dari Asuransi tanpa filter pencarian
      const result = await Mst_asuransi.findAndCountAll(query.sql);
      const total = result.count;
      const data = result.rows.map((e) => ({
        id: e.id,
        name: e.name,
      }));
      return { 
        data: data, 
        total: total
      };
    } catch (error) {
      console.error(error);
      return {};
    }
  }

  async getAirlines() {
    await this.initialize();
    const sql = {
      where: { company_id: this.company_id },
      attributes: ["id", "name"],
      order: [["name", "ASC"]],
    };
    try {
      const query = await dbList(sql);
      console.log(query);

      const result = await Mst_airline.findAndCountAll(query.sql);
      const total = result.count;
      const data = result.rows.map((e) => ({
        id: e.id,
        name: e.name,
      }));
      return { 
        data: data, 
        total: total
      };
    } catch (error) {
      console.error(error);
      return {};
    }
  }

  async getBandara() {
    await this.initialize();
    const sql = {
      where: { company_id: this.company_id },
      attributes: ["id", "name"],
      order: [["name", "ASC"]],
    };
    try {
      const query = await dbList(sql);
      console.log(query);

      const result = await Mst_airport.findAndCountAll(query.sql);
      const total = result.count;
      const data = result.rows.map((e) => ({
        id: e.id,
        name: e.name,
      }));
      return { 
        data: data, 
        total: total
      };
    } catch (error) {
      console.error(error);
      return {};
    }
  }

  async getHotel() {
    await this.initialize();
    const sql = {
      where: { company_id: this.company_id },
      attributes: ["id", "name"],
      order: [["name", "ASC"]],
    };
    try {
      const query = await dbList(sql);
      console.log(query);

      const result = await Mst_hotel.findAndCountAll(query.sql);
      const total = result.count;
      const data = result.rows.map((e) => ({
        id: e.id,
        name: e.name,
      }));
      return { 
        data: data, 
        total: total
      };
    } catch (error) {
      console.error(error);
      return {};
    }
  }

  async getFasilitas() {
    await this.initialize();
    const sql = {
      where: { company_id: this.company_id },
      attributes: ["id", "name"],
      order: [["name", "ASC"]],
    };
    try {
      const query = await dbList(sql);
      console.log(query);

      const result = await Mst_fasilitas.findAndCountAll(query.sql);
      const total = result.count;
      const data = result.rows.map((e) => ({
        id: e.id,
        name: e.name,
      }));

      return { 
        data: data, 
        total: total
      };
    } catch (error) {
      console.error(error);
      return {};
    }
  }

}

module.exports = Model_r;
