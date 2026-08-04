const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  user: process.env.DB_USERNAME || 'admin',
  password: String(process.env.DB_PASSWORD || 'secretpassword'),
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  database: process.env.DB_NAME || 'proyecto_formativo',
});

async function cleanDatabase() {
  try {
    await client.connect();
    console.log('🔗 Conectado a la base de datos:', process.env.DB_NAME || 'proyecto_formativo');

    const args = process.argv.slice(2);
    const todo = args.includes('--all');

    if (todo) {
      console.log('⚠️ ADVERTENCIA: Limpiando TODAS las tablas de la base de datos (incluyendo usuarios)...');
      const res = await client.query(`
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public';
      `);

      for (const row of res.rows) {
        await client.query(`TRUNCATE TABLE "${row.tablename}" RESTART IDENTITY CASCADE;`);
      }
      console.log('✅ ¡Todas las tablas fueron vaciadas al 100%!');
      console.log('💡 Nota: Al reiniciar tu backend con NestJS y TypeORM se sincronizará de nuevo la estructura. Puedes correr tu script SQL o importar dump.sql para reabastecer catálogos.');
    } else {
      console.log('🧹 Limpiando solo informes, observaciones y notificaciones de prueba...');
      const tablesToClean = [
        'observaciones_gc',
        'observaciones_gf',
        'informes_gc',
        'informes_gf',
        'notificaciones',
        'historial_conversacion'
      ];

      for (const table of tablesToClean) {
        await client.query(`TRUNCATE TABLE "${table}" RESTART IDENTITY CASCADE;`).catch(() => {
          // Si una tabla de bitácora tiene otro nombre se omite silente
        });
      }
      console.log('✅ ¡Limpieza exitosa! Todos los informes y notificaciones de prueba fueron eliminados.');
      console.log('🛡️ Tus usuarios, sedes, roles y áreas del SENA se mantuvieron intactos.');
      console.log('💡 Tip: Si quieres borrar ABSOLUTAMENTE TODO (incluyendo usuarios y catálogos), ejecuta: node clean-db.js --all');
    }
  } catch (error) {
    console.error('❌ Error al limpiar la base de datos:', error.message);
  } finally {
    await client.end();
  }
}

cleanDatabase();
