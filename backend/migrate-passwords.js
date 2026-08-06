/**
 * Script de migración: hashea todas las contraseñas en texto plano
 * existentes en la base de datos con bcrypt.
 * 
 * Uso: node migrate-passwords.js
 * 
 * Este script detecta contraseñas que NO comienzan con "$2b$" o "$2a$"
 * (prefijos de bcrypt) y las hashea automáticamente.
 */

const { Client } = require('pg');
const bcrypt = require('bcrypt');
require('dotenv').config();

const client = new Client({
  user: process.env.DB_USERNAME || 'admin',
  password: String(process.env.DB_PASSWORD || 'secretpassword'),
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  database: process.env.DB_NAME || 'proyecto_formativo',
});

async function migratePasswords() {
  try {
    await client.connect();
    console.log('🔗 Conectado a la base de datos');

    // Obtener todos los usuarios con contraseñas en texto plano
    const result = await client.query(
      `SELECT "id_Usuario", password FROM usuarios WHERE password IS NOT NULL`
    );

    let migrated = 0;
    let alreadyHashed = 0;
    let errors = 0;

    for (const row of result.rows) {
      const pwd = (row.password || '').trim();

      // Si ya está hasheada con bcrypt, saltar
      if (pwd.startsWith('$2b$') || pwd.startsWith('$2a$')) {
        alreadyHashed++;
        continue;
      }

      // Si está vacía, saltar
      if (!pwd) continue;

      try {
        const hashed = await bcrypt.hash(pwd, 10);
        await client.query(
          `UPDATE usuarios SET password = $1 WHERE "id_Usuario" = $2`,
          [hashed, row.id_Usuario]
        );
        migrated++;
        console.log(`  ✅ Usuario #${row.id_Usuario} migrado`);
      } catch (err) {
        errors++;
        console.error(`  ❌ Error migrando usuario #${row.id_Usuario}:`, err.message);
      }
    }

    console.log('\n==================================================');
    console.log(`📊 Resultado de la migración:`);
    console.log(`   Total usuarios: ${result.rows.length}`);
    console.log(`   ✅ Migrados: ${migrated}`);
    console.log(`   🔒 Ya hasheados: ${alreadyHashed}`);
    if (errors > 0) console.log(`   ❌ Errores: ${errors}`);
    console.log('==================================================');

  } catch (error) {
    console.error('❌ Error al conectar a la base de datos:', error.message);
  } finally {
    await client.end();
  }
}

migratePasswords();
