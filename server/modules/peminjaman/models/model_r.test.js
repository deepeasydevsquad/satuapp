// Mock class Model_r biar nggak pake versi aslinya waktu test
jest.mock("../models/model_r"); // sesuaikan path sesuai struktur proyek kamu

const Model_r = require("../models/model_r");
const { downloadDataPeminjaman } = require("../controllers/index"); // path controller kamu

describe("Controller downloadDataPeminjaman", () => {
  let req, res;

  beforeEach(() => {
    // Setup objek request palsu
    req = {
      body: {
        perpage: 10,
        pageNumber: 1,
        search: "",
      },
      user: {
        company_id: 1,
        company_code: "TEST123",
      },
    };

    // Setup objek response palsu dengan fungsi-fungsi mock
    res = {
      setHeader: jest.fn(),
      send: jest.fn(),
      status: jest.fn(() => res), // biar bisa chaining status().json()
      json: jest.fn(),
    };

    // Reset mock Model_r supaya tiap test fresh
    Model_r.mockClear();
  });

  it("harus memanggil method downloadDataPeminjaman dari Model_r", async () => {
    // Buat fungsi mock untuk method downloadDataPeminjaman
    const mockDownloadFn = jest.fn();
    // Atur supaya setiap instance Model_r punya method downloadDataPeminjaman versi mock
    Model_r.mockImplementation(() => ({
      downloadDataPeminjaman: mockDownloadFn,
    }));

    // Panggil controller dengan request dan response palsu
    await downloadDataPeminjaman(req, res);

    // Pastikan constructor Model_r dipanggil dengan req
    expect(Model_r).toHaveBeenCalledWith(req);
    // Pastikan method downloadDataPeminjaman dipanggil dengan req dan res
    expect(mockDownloadFn).toHaveBeenCalledWith(req, res);
  });

  it("harus menangani error yang dilempar di controller", async () => {
    // Atur mock supaya method downloadDataPeminjaman melempar error saat dipanggil
    Model_r.mockImplementation(() => ({
      downloadDataPeminjaman: jest
        .fn()
        .mockRejectedValue(new Error("DB gagal")),
    }));

    // Panggil controller
    await downloadDataPeminjaman(req, res);

    // Pastikan response status 500 dipanggil
    expect(res.status).toHaveBeenCalledWith(500);
    // Pastikan response json error juga dipanggil dengan pesan error yang benar
    expect(res.json).toHaveBeenCalledWith({
      error: true,
      error_msg: "DB gagal",
    });
  });
});
