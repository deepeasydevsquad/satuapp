const Model_cud = require("./model_cud");
const moment = require("moment");

jest.mock("../../../models", () => ({
  Konfigurasi_surat_menyurat: {
    findOne: jest.fn(),
    update: jest.fn(),
    create: jest.fn(),
  },
  sequelize: {
    transaction: jest.fn(),
  },
}));

jest.mock("../../../helper/companyHelper", () => ({
  getCompanyIdByCode: jest.fn().mockResolvedValue(123),
}));

const { Konfigurasi_surat_menyurat } = require("../../../models");

describe("Model_cud - addKonfigurasiSuratMenyurat", () => {
  let model;
  const fakeTransaction = {};

  beforeEach(() => {
    jest.clearAllMocks();

    model = new Model_cud({ body: {} }, {});
    model.t = fakeTransaction;
    model.company_id = 123;
    model.state = true;

    // Mock initialize biar gak ganggu
    model.initialize = jest.fn(async () => {
      model.company_id = 123;
      model.t = fakeTransaction;
    });
  });

  test("update data jika ID ditemukan di database", async () => {
    model.req.body = {
      id: 5,
      nama_perusahaan: "PT Edit",
    };

    Konfigurasi_surat_menyurat.findOne.mockResolvedValue({ id: 5 });
    Konfigurasi_surat_menyurat.update.mockResolvedValue([1]);

    await model.addKonfigurasiSuratMenyurat();

    expect(model.initialize).toHaveBeenCalled();
    expect(Konfigurasi_surat_menyurat.findOne).toHaveBeenCalledWith({
      where: { id: 5 },
    });
    expect(Konfigurasi_surat_menyurat.update).toHaveBeenCalledWith(
      model.req.body,
      { where: { id: 5 }, transaction: fakeTransaction }
    );
    expect(model.message).toBe(
      "Berhasil update Konfigurasi Surat Menyurat dengan ID: 5"
    );
  });

  test("buat data baru jika tidak ada ID", async () => {
    model.req.body = {
      nama_tanda_tangan: "Ttd",
      nama_perusahaan: "PT Baru",
    };

    Konfigurasi_surat_menyurat.create.mockResolvedValue({ id: 88 });

    await model.addKonfigurasiSuratMenyurat();

    expect(model.initialize).toHaveBeenCalled();
    expect(Konfigurasi_surat_menyurat.create).toHaveBeenCalledWith(
      expect.objectContaining({
        company_id: 123,
        nama_tanda_tangan: "Ttd",
        nama_perusahaan: "PT Baru",
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      }),
      { transaction: fakeTransaction }
    );
    expect(model.message).toBe(
      "Menambahkan Konfigurasi Surat Menyurat Baru dengan ID: 88"
    );
  });

  test("buat data baru jika ID tidak ditemukan", async () => {
    model.req.body = {
      id: 99,
      nama_perusahaan: "PT Gak Ada",
    };

    Konfigurasi_surat_menyurat.findOne.mockResolvedValue(null);
    Konfigurasi_surat_menyurat.create.mockResolvedValue({ id: 100 });

    await model.addKonfigurasiSuratMenyurat();

    expect(Konfigurasi_surat_menyurat.findOne).toHaveBeenCalledWith({
      where: { id: 99 },
    });
    expect(Konfigurasi_surat_menyurat.create).toHaveBeenCalled();
    expect(model.message).toBe(
      "Menambahkan Konfigurasi Surat Menyurat Baru dengan ID: 100"
    );
  });

  test("handle error dengan set state false", async () => {
    model.req.body = { id: 7 };
    Konfigurasi_surat_menyurat.findOne.mockRejectedValue(new Error("fail"));

    await model.addKonfigurasiSuratMenyurat();

    expect(model.state).toBe(false);
  });
});
