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
  let sql = '';
  const escapeString = (str) => typeof str === 'string' ? "'" + str.replace(/'/g, "''") + "'" : (str === null ? 'NULL' : str);
  const tables = ['sedes', 'roles', 'areas', 'especialidades', 'objetos_contractuales'];
  
  for (const table of tables) {
    const res = await client.query('SELECT * FROM ' + table + ' ORDER BY 1');
    if (res.rows.length === 0) continue;
    const cols = Object.keys(res.rows[0]);
    sql += '-- ' + table + '\n';
    sql += 'INSERT INTO ' + table + ' (' + cols.join(', ') + ') VALUES\n';
    sql += res.rows.map(r => '(' + cols.map(c => escapeString(r[c])).join(', ') + ')').join(',\n') + ' ON CONFLICT DO NOTHING;\n';
    const pk = cols[0];
    sql += `SELECT setval('${table}_${pk}_seq', (SELECT MAX(${pk}) FROM ${table}));\n\n`;
  }
  
  fs.writeFileSync('dump.sql', sql);
  await client.end();
}

run().catch(console.error);
