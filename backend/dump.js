const { Client } = require('pg');
const fs = require('fs');
const client = new Client({ user: 'admin', password: 'secretpassword', host: 'localhost', port: 5432, database: 'proyecto_formativo' });

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
    sql += res.rows.map(r => '(' + cols.map(c => escapeString(r[c])).join(', ') + ')').join(',\n') + ';\n';
    const pk = cols[0];
    sql += `SELECT setval('${table}_${pk}_seq', (SELECT MAX(${pk}) FROM ${table}));\n\n`;
  }
  
  fs.writeFileSync('dump.sql', sql);
  await client.end();
}

run().catch(console.error);
