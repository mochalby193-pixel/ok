/**
 * Script untuk generate bcrypt password hashes
 * Run: node generate-passwords.js
 * 
 * Passwords yang akan di-generate:
 * - admin123
 * - guru123
 * - siswa123
 * 
 * ✅ CURRENT HASHES (Already generated and applied):
 * These hashes are already in schema.sql and update-passwords.sql
 */

const bcrypt = require('bcrypt');

const passwords = {
  admin: 'admin123',
  guru: 'guru123',
  siswa: 'siswa123',
};

// Current working hashes (already applied)
const currentHashes = {
  admin: '$2b$10$NIjeriVV/QQmjsMv5FDBwOx40E2UJU.qI8Ag/hEtn4sfHq0KOi2YW',
  guru: '$2b$10$CWdiNKynZbzWukCzjSzE4.ddM3TpC6Gm0vOmq1h45Mfwm3otA5BCm',
  siswa: '$2b$10$OCMQCc0h9cMPQfCZrwcSAuHKgbVcLRsFOnLFnBpmhSGfcS2/Fidu.',
};

console.log('🔐 Current Password Hashes (Already Applied)\n');
console.log('These hashes are already in schema.sql and ready to use:\n');

for (const [role, password] of Object.entries(passwords)) {
  console.log(`${role.toUpperCase()}: ${password}`);
  console.log(`Hash: ${currentHashes[role]}`);
  console.log('');
}

console.log('✅ These hashes are READY! No action needed.\n');
console.log('📝 Login credentials:');
console.log('   Admin: admin@lms.com / admin123');
console.log('   Admin: admin2@lms.com / admin123');
console.log('   Guru:  budi@lms.com / guru123');
console.log('   Siswa: andi@lms.com / siswa123\n');

// Option to generate NEW hashes
const generateNew = process.argv.includes('--new');

if (generateNew) {
  console.log('🔄 Generating NEW hashes...\n');
  
  const generateHashes = async () => {
    for (const [role, password] of Object.entries(passwords)) {
      const hash = await bcrypt.hash(password, 10);
      console.log(`${role.toUpperCase()}: ${password}`);
      console.log(`New Hash: ${hash}`);
      console.log('');
    }
    
    console.log('✅ New hashes generated!');
    console.log('Copy these to schema.sql if you want to use them.\n');
  };
  
  generateHashes().catch(console.error);
} else {
  console.log('💡 To generate NEW hashes, run: node generate-passwords.js --new');
}

