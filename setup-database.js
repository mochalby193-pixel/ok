/**
 * 🗄️ DATABASE SETUP SCRIPT
 * 
 * Script untuk setup database secara otomatis
 * Run: node setup-database.js
 */

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Warna untuk console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

const log = {
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  step: (msg) => console.log(`${colors.cyan}▶${colors.reset} ${msg}`),
};

/**
 * Cek apakah database sudah ada
 */
async function checkDatabaseExists(dbName) {
  const client = new Client({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT || 5432,
    database: 'postgres', // Connect ke default database
  });

  try {
    await client.connect();
    const result = await client.query(
      "SELECT 1 FROM pg_database WHERE datname = $1",
      [dbName]
    );
    await client.end();
    return result.rows.length > 0;
  } catch (error) {
    await client.end();
    throw error;
  }
}

/**
 * Buat database baru
 */
async function createDatabase(dbName) {
  const client = new Client({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT || 5432,
    database: 'postgres',
  });

  try {
    await client.connect();
    await client.query(`CREATE DATABASE ${dbName}`);
    await client.end();
  } catch (error) {
    await client.end();
    throw error;
  }
}

/**
 * Import schema SQL
 */
async function importSchema(dbName, schemaPath) {
  const client = new Client({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT || 5432,
    database: dbName,
  });

  try {
    await client.connect();
    
    // Baca file schema.sql
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    
    // Execute schema
    await client.query(schemaSql);
    
    await client.end();
  } catch (error) {
    await client.end();
    throw error;
  }
}

/**
 * Verifikasi data users
 */
async function verifyUsers(dbName) {
  const client = new Client({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT || 5432,
    database: dbName,
  });

  try {
    await client.connect();
    const result = await client.query('SELECT id, nama, email, role FROM users ORDER BY id');
    await client.end();
    return result.rows;
  } catch (error) {
    await client.end();
    throw error;
  }
}

/**
 * Main setup function
 */
async function setupDatabase() {
  console.log('\n' + '='.repeat(60));
  console.log('  🗄️  DATABASE SETUP - LMS APPLICATION');
  console.log('='.repeat(60) + '\n');

  const dbName = process.env.DB_NAME || 'lms_db';
  const schemaPath = path.join(__dirname, 'schema.sql');

  // Validasi file schema.sql
  if (!fs.existsSync(schemaPath)) {
    log.error('File schema.sql tidak ditemukan!');
    process.exit(1);
  }

  try {
    // Step 1: Cek koneksi PostgreSQL
    log.step('Mengecek koneksi PostgreSQL...');
    const dbExists = await checkDatabaseExists(dbName);
    log.success('Koneksi PostgreSQL berhasil!');

    // Step 2: Buat database jika belum ada
    if (dbExists) {
      log.warning(`Database "${dbName}" sudah ada.`);
      console.log('');
      const readline = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
      });

      const answer = await new Promise((resolve) => {
        readline.question('Apakah ingin DROP dan RECREATE database? (y/N): ', resolve);
      });
      readline.close();

      if (answer.toLowerCase() === 'y') {
        log.step('Menghapus database lama...');
        const client = new Client({
          user: process.env.DB_USER || 'postgres',
          host: process.env.DB_HOST || 'localhost',
          password: process.env.DB_PASSWORD,
          port: process.env.DB_PORT || 5432,
          database: 'postgres',
        });
        await client.connect();
        await client.query(`DROP DATABASE ${dbName}`);
        await client.end();
        log.success('Database lama dihapus.');

        log.step('Membuat database baru...');
        await createDatabase(dbName);
        log.success(`Database "${dbName}" berhasil dibuat!`);
      } else {
        log.info('Database tidak diubah. Import dibatalkan.');
        process.exit(0);
      }
    } else {
      log.step('Membuat database baru...');
      await createDatabase(dbName);
      log.success(`Database "${dbName}" berhasil dibuat!`);
    }

    // Step 3: Import schema
    log.step('Mengimport schema.sql...');
    await importSchema(dbName, schemaPath);
    log.success('Schema berhasil diimport!');

    // Step 4: Verifikasi data
    log.step('Memverifikasi data users...');
    const users = await verifyUsers(dbName);
    
    if (users.length === 0) {
      log.error('Data users tidak ditemukan!');
      process.exit(1);
    }

    log.success(`${users.length} users berhasil dibuat:`);
    console.log('');
    console.log('  ID | Nama              | Email              | Role');
    console.log('  ' + '-'.repeat(56));
    users.forEach((user) => {
      const id = String(user.id).padEnd(3);
      const nama = user.nama.padEnd(18);
      const email = user.email.padEnd(19);
      const role = user.role;
      console.log(`  ${id}| ${nama}| ${email}| ${role}`);
    });

    // Success message
    console.log('\n' + '='.repeat(60));
    log.success('DATABASE SETUP BERHASIL!');
    console.log('='.repeat(60) + '\n');

    console.log('📋 Login Credentials:');
    console.log('');
    console.log('  Admin:  admin@lms.com  / admin123');
    console.log('  Admin:  admin2@lms.com / admin123');
    console.log('  Guru:   budi@lms.com   / guru123');
    console.log('  Siswa:  andi@lms.com   / siswa123');
    console.log('');
    console.log('▶️  Jalankan server: npm start');
    console.log('▶️  Jalankan client: cd client && npm run dev');
    console.log('');

  } catch (error) {
    console.log('');
    log.error('SETUP GAGAL!');
    console.log('');
    
    if (error.code === 'ECONNREFUSED') {
      log.error('PostgreSQL tidak berjalan atau tidak dapat diakses.');
      console.log('');
      console.log('  Solusi:');
      console.log('  1. Pastikan PostgreSQL service berjalan');
      console.log('  2. Cek konfigurasi di file .env');
      console.log('');
    } else if (error.code === '28P01') {
      log.error('Password PostgreSQL salah!');
      console.log('');
      console.log('  Solusi:');
      console.log('  1. Cek DB_PASSWORD di file .env');
      console.log('  2. Pastikan password sesuai dengan PostgreSQL Anda');
      console.log('');
    } else {
      log.error(error.message);
      if (error.stack) {
        console.log('');
        console.log(colors.red + error.stack + colors.reset);
      }
    }
    
    process.exit(1);
  }
}

// Run setup
setupDatabase();
