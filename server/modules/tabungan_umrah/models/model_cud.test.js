const request = require('supertest');
const app = require('../../../app'); // Path ke app Express kamu
const { sequelize, Tabungan, Jamaah, Member, Deposit, Riwayat_tabungan } = require('../../../models');

// Buat token yang valid (atau mock middleware `authenticateToken`)
const token = 'Bearer your-valid-jwt-token'; // Ganti dengan token beneran / dummy

describe('POST /daftar_tabungan_umrah/addMenabung', () => {
  let tabunganId, memberId;

  // Pastikan DB bersih sebelum dan sesudah test
  beforeAll(async () => {
    await sequelize.authenticate();
    // Tambah dummy data langsung ke database
    const member = await Member.create({ nama: 'Test Member', total_tabungan: 1000, total_deposit: 1000 });
    const jamaah = await Jamaah.create({ nama: 'Test Jamaah', member_id: member.id });
    const tabungan = await Tabungan.create({
      jamaah_id: jamaah.id,
      division_id: 2,
      total_tabungan: 1000,
    });

    memberId = member.id;
    tabunganId = tabungan.id;
  });

  afterAll(async () => {
    await Riwayat_tabungan.destroy({ where: {} });
    await Deposit.destroy({ where: {} });
    await Tabungan.destroy({ where: {} });
    await Jamaah.destroy({ where: {} });
    await Member.destroy({ where: {} });
    await sequelize.close(); // penting untuk mencegah leak
  });

  it('should add menabung with sumber_dana "cash"', async () => {
    const res = await request(app)
      .post('/daftar_tabungan_umrah/addMenabung')
      .set('Authorization', token)
      .send({
        user: {
          company_id: 1,
          company_code: "TEST123",
        },
        id: tabunganId,
        sumber_dana: 'cash',
        biaya_deposit: 500,
        info_deposit: 'Setoran test cash'
      });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('error_msg', 'Menabung Tabungan Umrah berhasil ditambahkan.');

    // Optional: Query ulang tabungan dan cek saldo bertambah
    const tabunganAfter = await Tabungan.findByPk(tabunganId);
    expect(tabunganAfter.total_tabungan).toBe(1500);
  });
});
