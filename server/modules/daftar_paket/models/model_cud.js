const { Op, sequelize, Paket, Paket_price } = require("../../../models");
const Model_r = require("../models/model_r");
const { writeLog } = require("../../../helper/writeLogHelper");
const { getCompanyIdByCode, getCabang, tipe } = require("../../../helper/companyHelper");
const moment = require("moment");
const fs = require('fs');
const path = require('path');

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

  async getDivisionId() {
    const userType = await tipe(this.req);
    if (userType === "administrator") {
      return this.req.body.division_id;
    } else if (userType === "staff") {
      const decoded = jwt.decode(
        this.req.headers["authorization"]?.split(" ")[1]
      );
      return decoded?.division_id;
    } else {
      throw new Error("Role pengguna tidak valid.");
    }
  }
  async generateKodePaket() {
    // generate kode number, kode number format : 6 random alphanumeric characters
    const possibleAbjad = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const possibleAngka = "0123456789";
    
    let kodePaket;
    let sama;
  
    do {
      kodePaket = Array.from({ length: 3 }, () =>
        possibleAbjad.charAt(Math.floor(Math.random() * possibleAbjad.length))
      ).join("") +
      Array.from({ length: 3 }, () =>
        possibleAngka.charAt(Math.floor(Math.random() * possibleAngka.length))
      ).join("");

      const [inKodepaket] = await Promise.all([
        Paket.findOne({ where: { kode: kodePaket } }),
      ]);
  
      sama = inKodepaket;
  
    } while (sama);
  
    return kodePaket;
  }
  async generateSlug(name) {
    return name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
  }
  
  // Tambah paket
  async add() {
    await this.initialize();
    const myDate = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
    const body = this.req.body;

    const kodePaket = await this.generateKodePaket();
    const division_id = await this.getDivisionId();
    const slug = await this.generateSlug(body.name);
    try {
      console.log("Data Body:", body);
      console.log("Company ID:", this.company_id);
      console.log("Division ID:", division_id);
      console.log("Generated Kode Paket:", kodePaket);
      console.log("Generated Slug:", slug);
      console.log("Generated Photo:", this.req.body.photoPath || null);
      console.log("Current Date:", myDate);

      const parseArray = (val) => {
        try {
          return Array.isArray(val) ? val : JSON.parse(val);
        } catch {
          return [];
        }
      };
      
      const formattedAirlines = parseArray(body.airlines).map(id => ({ id: String(id) }));
      const formattedCityVisited = parseArray(body.city_visited).map(id => ({ id: String(id) }));
      const formattedHotel = parseArray(body.hotel).map(id => ({ id: String(id) }));
      const formattedFacilities = parseArray(body.facilities).map(id => ({ id: String(id) }));

      console.log("Formatted Airlines:", formattedAirlines);
      console.log("Formatted City Visited:", formattedCityVisited);
      console.log("Formatted Hotel:", formattedHotel);
      console.log("Formatted Facilities:", formattedFacilities);
      
      const insert = await Paket.create({
        division_id: division_id,
        jenis_kegiatan: body.jenis_kegiatan,
        kode: kodePaket,
        photo: this.req.body.photoPath || null, // <-- SIMPAN NAMA FILENYA SAJA
        slug: slug,
        name: body.name,
        description: body.description,
        departure_date: body.departure_date,
        return_date: body.return_date,
        departure_from: body.departure_from,
        duration_trip: body.duration_trip || 7,
        mahram_fee: body.mahram_fee,
        quota_jamaah: body.quota_jamaah,
        city_visited: JSON.stringify(formattedCityVisited),
        airlines: JSON.stringify(formattedAirlines),
        hotel: JSON.stringify(formattedHotel),
        facilities: JSON.stringify(formattedFacilities),
        show_homepage: body.show_homepage === 'true' ? 'tampilkan' : 'sembunyikan',
        airport_destination: body.airport_destination,
        airport_departure: body.airport_departure,
        departure_time: body.departure_time,
        arrival_time: body.arrival_time,
        tutup_paket: body.tutup_paket || 'buka',
        provider_visa_id: body.provider_visa_id,
        asuransi_id: body.asuransi_id,
        no_polis: body.no_polis,
        tgl_input_polis: body.tgl_input_polis,
        tgl_awal_polis: body.tgl_awal_polis,
        tgl_akhir_polis: body.tgl_akhir_polis,
        createdAt: myDate,
        updatedAt: myDate,
      }, {
        transaction: this.t,
      });

      const paketTypes = JSON.parse(body.paket_types || '[]').map(Number);
      const paketPrices = JSON.parse(body.paket_prices || '[]');

      console.log("Paket Types:", paketTypes);
      console.log("Paket Prices:", paketPrices);

      for (const priceItem of paketPrices) {
        if (paketTypes.includes(priceItem.id)) {
          await Paket_price.create({
            paket_id: insert.id,
            mst_paket_type_id: priceItem.id,
            price: priceItem.price,
            createdAt: myDate,
            updatedAt: myDate,
          }, {
            transaction: this.t,
          });
        }
      }
      
      this.message = `Menambahkan paket baru dengan kode: ${kodePaket}, ID paket: ${insert.id} dan ${body.paket_prices.length} harga paket baru.`;
    } catch (error) {
      console.error(error);
      this.state = false;
    }
  }
  
  // Edit paket
  async update() {
    // initialize general property
    await this.initialize();
    const myDate = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
    const body = this.req.body;
  
    const division_id = await this.getDivisionId();

    const model_r = new Model_r(this.req);
  
    // get info paket
    const infoPaket = await model_r.infoPaket(body.id);
    const slug = await this.generateSlug(body.name);
  
    try {
      // --- HANDLE PHOTO LAMA JIKA ADA PERGANTIAN ---
      let newPhotoPath = infoPaket.photo;
      if (body.photoPath && body.photoPath !== infoPaket.photo) {
        newPhotoPath = body.photoPath;

        // Ambil nama file saja dan buat path lengkap
        console.log("Info Paket Photo:", infoPaket.photo);
        const fileName = path.basename(infoPaket.photo); // Ambil nama file
        const filePath = path.resolve(__dirname, '../../../uploads/daftar_paket', fileName);

        // Cek dan hapus file
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          console.log(`Deleted file: ${filePath}`);
        } else {
          console.log(`File not found: ${filePath}`);
        }
      }

      const parseArray = (val) => {
        try {
          return Array.isArray(val) ? val : JSON.parse(val);
        } catch {
          return [];
        }
      };
      
      // Format ke bentuk objek { id: '...' }
      const formattedAirlines = parseArray(body.airlines).map(id => ({ id: String(id) }));
      const formattedCityVisited = parseArray(body.city_visited).map(id => ({ id: String(id) }));
      const formattedHotel = parseArray(body.hotel).map(id => ({ id: String(id) }));
      const formattedFacilities = parseArray(body.facilities).map(id => ({ id: String(id) }));

      console.log("Body: ", body);
      console.log("Body ID: ", body.id);
      console.log("Body Show Homepage: ", body.show_homepage);
      console.log("Formatted Airlines:", formattedAirlines);
      console.log("Formatted City Visited:", formattedCityVisited);
      console.log("Formatted Hotel:", formattedHotel);
      console.log("Formatted Facilities:", formattedFacilities);
      
      // --- UPDATE DATA PAKET ---
      await Paket.update(
        {
          division_id: division_id,
          jenis_kegiatan: body.jenis_kegiatan,
          photo: newPhotoPath,
          slug: slug,
          name: body.name,
          description: body.description,
          departure_date: body.departure_date,
          return_date: body.return_date,
          departure_from: body.departure_from,
          duration_trip: body.duration_trip || '7 hari',
          mahram_fee: body.mahram_fee,
          quota_jamaah: body.quota_jamaah,
          city_visited: JSON.stringify(formattedCityVisited),
          airlines: JSON.stringify(formattedAirlines),
          hotel: JSON.stringify(formattedHotel),
          facilities: JSON.stringify(formattedFacilities),
          show_homepage: body.show_homepage === 'true' ? 'tampilkan' : 'sembunyikan',
          airport_destination: body.airport_destination,
          airport_departure: body.airport_departure,
          departure_time: body.departure_time,
          arrival_time: body.arrival_time,
          tutup_paket: body.tutup_paket || 'buka',
          provider_visa_id: body.provider_visa_id,
          asuransi_id: body.asuransi_id,
          no_polis: body.no_polis,
          tgl_input_polis: body.tgl_input_polis,
          tgl_awal_polis: body.tgl_awal_polis,
          tgl_akhir_polis: body.tgl_akhir_polis,
          updatedAt: myDate,
        },
        {
          where: { id: body.id },
          transaction: this.t,
        }
      );


      console.log(typeof body.paket_types, body.paket_types);

      // --- UPDATE PAKET PRICE ---
      const paketTypes = JSON.parse(body.paket_types || '[]');
      const allowedTypeIds = paketTypes.map(p => p.id);
      
      // Filter paket_prices agar hanya menyertakan yang ID-nya ada di paket_types
      const paketPricesRaw = JSON.parse(body.paket_prices || '[]');
      const paketPrices = paketPricesRaw.filter(p => allowedTypeIds.includes(p.id));
      
      const newTypeIds = paketPrices.map(p => p.id);
      
      // Hapus semua yang tidak termasuk dalam `paket_types`
      await Paket_price.destroy({
        where: {
          paket_id: body.id,
          mst_paket_type_id: { [Op.notIn]: newTypeIds },
        },
        transaction: this.t,
      });
      
      // Tambah atau update sesuai `paket_types` yang valid
      for (const priceItem of paketPrices) {
        const [record, created] = await Paket_price.findOrCreate({
          where: {
            paket_id: body.id,
            mst_paket_type_id: priceItem.id,
          },
          defaults: {
            price: priceItem.price,
            createdAt: myDate,
            updatedAt: myDate,
          },
          transaction: this.t,
        });
      
        if (!created) {
          await record.update({
            price: priceItem.price,
            updatedAt: myDate,
          }, { transaction: this.t });
        }
      }
      
      // Log pesan
      this.message = `Memperbaharui paket dengan kode: ${infoPaket.kode}, dari nama: ${infoPaket.name} menjadi: ${body.name}`;
  
    } catch (error) {
      console.error("Error updating paket:", error);
      this.state = false;
    }
  }  

  // Hapus paket
  async delete() {
    // initialize dependensi properties
    await this.initialize();
    const body = this.req.body;
    const division_id = await this.getDivisionId();
    try {
      // call object
      const model_r = new Model_r(this.req);
      // get info paket
      console.log("Body ID:", body.id);
      console.log("Division ID:", division_id);
      const paketInfo = await model_r.infoPaket(body.id, division_id);

      // delete process
      // get paket price info
      const paketPriceInfo = await Paket_price.findAll({
        where: {
          paket_id: paketInfo.id,
        },
        transaction: this.t,
      });

      console.log("Paket Price Info:", paketPriceInfo);
      // delete paket price
      if (paketPriceInfo.length > 0) {
        await Paket_price.destroy({
          where: {
            paket_id: paketInfo.id,
          },
          transaction: this.t,
        });
      }

      // Ambil nama file saja dan buat path lengkap
      const fileName = path.basename(paketInfo.photo); // Ambil nama file
      const filePath = path.resolve(__dirname, '../../../uploads/daftar_paket', fileName);

      // Cek dan hapus file 
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`Deleted file: ${filePath}`);
      } else {
        console.log(`File not found: ${filePath}`);
      }

      // delete paket
      await Paket.destroy(
        {
          where: {
            id: body.id,
            division_id: division_id,
          },
          transaction: this.t,
        }
      );

      this.state = true;
      // write log message
      this.message = `Menghapus paket dengan Kode: ${paketInfo.kode}, Nama : ${paketInfo.name} dan ID : ${paketInfo.id}`;
    } catch (error) {
      console.error("Error deleting paket:", error);
      this.state = false;
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
