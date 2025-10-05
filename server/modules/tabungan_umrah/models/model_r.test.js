const Model_r = require('./model_r'); // Akan real DB

describe('Model_r (real DB)', () => {
  it('harus mengambil informasi tabungan dengan benar', async () => {
    const mockReq = {
      body: {
        id: 1, // Pastikan ID ini ada di database
      },
    };

    const model = new Model_r(mockReq);
    const result = await model.infoTabungan();
    console.log("Hasil infoTabungan:", result);
    expect(result).toHaveProperty('total_tabungan');
    expect(typeof result.total_tabungan).toBe('number');
    expect(result).toHaveProperty('jamaah');
    expect(result.jamaah).not.toBeNull();
  });
});
