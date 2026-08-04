const { Client } = require('pg');
const fs = require('fs');
require('dotenv').config();

const client = new Client({
  user: process.env.DB_USERNAME || 'admin',
  password: String(process.env.DB_PASSWORD || 'secretpassword'),
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5433', 10),
  database: process.env.DB_NAME || 'proyecto_formativo',
});

async function run() {
  await client.connect();
  console.log('Conectado a la base de datos. Importando registros desde dump.sql...');
  if (!fs.existsSync('dump.sql')) {
    console.error('Error: No se encontró el archivo dump.sql en el directorio backend.');
    process.exit(1);
  }
  const sql = fs.readFileSync('dump.sql', 'utf8');
  await client.query(sql);
  console.log('¡Datos importados exitosamente! Las sedes, roles, áreas, especialidades y objetos contractuales están sincronizados.');
  await client.end();
}

run().catch((error) => {
  console.error('Error durante la importación de dump.sql:', error.message);
  if (error.code === '23505') {
    console.warn('Aviso: Es posible que los datos ya hayan sido importados previamente.');
  }
  process.exit(1);
});
