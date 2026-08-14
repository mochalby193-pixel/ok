/**
 * Script untuk membuat/memperbarui akun demo LMS
 * Run: node create-demo-accounts.js
 */

require('dotenv').config();
const { Client } = require('pg');
const bcrypt = require('bcrypt');

const DEMO_ACCOUNTS = [
  { nama: 'Admin Utama',   email: 'admin@lms.com',  password: 'admin123', role: 'admin' },
  { nama: 'Admin 2',       email: 'admin2@lms.com', password: 'admin123', role: 'admin' },
  { nama: 'Budi Santoso',  email: 'budi@lms.com',   password: 'guru123',  role: 'guru'  },
  { nama: 'Siti Nurhaliza',email: 'siti@lms.com',   password: 'guru123',  role: 'guru'  },
  { nama: 'Andi Wijaya',   email: 'andi@lms.com',   password: 'siswa123', role: 'siswa' },
  { nama: 'Rina Putri',    email: 'rina@lms.com',   password: 'siswa123', role: 'siswa' },
];

async function run() {
  const client = new Client({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  await client.connect();
  console.log('\n✅ Terhubung ke database\n');

  for (const acc of DEMO_ACCOUNTS) {
    const hash = await bcrypt.hash(acc.password, 10);

    // Upsert: update password jika email sudah ada, insert jika belum
    const res = await client.query(
      `INSERT INTO users (nama, email, password, role, is_active)
       VALUES ($1, $2, $3, $4, true)
       ON CONFLICT (email) DO UPDATE
         SET password = EXCLUDED.password,
             nama     = EXCLUDED.nama,
             is_active = true
       RETURNING id, nama, email, role`,
      [acc.nama, acc.email, hash, acc.role]
    );

    const u = res.rows[0];
    console.log(`[${u.role.toUpperCase().padEnd(5)}] ${u.email.padEnd(22)} → password: ${acc.password}  (id: ${u.id})`);
  }

  // Pastikan siswa punya record di tabel students
  const siswaResult = await client.query(
    `SELECT u.id FROM users u
     LEFT JOIN students s ON s.user_id = u.id
     WHERE u.role = 'siswa' AND s.id IS NULL`
  );

  for (const row of siswaResult.rows) {
    // Ambil class_id pertama yang ada
    const cls = await client.query('SELECT id FROM classes LIMIT 1');
    const classId = cls.rows.length > 0 ? cls.rows[0].id : null;
    await client.query(
      `INSERT INTO students (user_id, class_id) VALUES ($1, $2) ON CONFLICT (user_id) DO NOTHING`,
      [row.id, classId]
    );
    console.log(`  → siswa user_id=${row.id} ditambahkan ke tabel students`);
  }

  console.log('\n--- Verifikasi hash password ---');
  for (const acc of DEMO_ACCOUNTS) {
    const dbUser = await client.query('SELECT password FROM users WHERE email = $1', [acc.email]);
    const ok = await bcrypt.compare(acc.password, dbUser.rows[0].password);
    console.log(`  ${acc.email.padEnd(22)}: ${ok ? '✅ VALID' : '❌ INVALID'}`);
  }

  await client.end();

  console.log('\n============================================');
  console.log('  AKUN DEMO SIAP DIGUNAKAN');
  console.log('============================================');
  console.log('  Admin : admin@lms.com   / admin123');
  console.log('  Admin : admin2@lms.com  / admin123');
  console.log('  Guru  : budi@lms.com    / guru123');
  console.log('  Guru  : siti@lms.com    / guru123');
  console.log('  Siswa : andi@lms.com    / siswa123');
  console.log('  Siswa : rina@lms.com    / siswa123');
  console.log('============================================\n');
}

run().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
