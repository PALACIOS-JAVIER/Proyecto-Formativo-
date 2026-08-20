const { Client } = require('pg');
const client = new Client({
  connectionString: 'postgresql://admin:secretpassword@localhost:5433/proyecto_formativo'
});
client.connect()
  .then(() => client.query('SELECT "id_Usuario", correo FROM usuarios WHERE "id_Usuario" = 4'))
  .then(res => {
    console.log("Results:", res.rows);
    if(res.rows.length > 0) {
      console.log('Length of correo:', res.rows[0].correo.length);
      console.log('Exact string:', JSON.stringify(res.rows[0].correo));
    }
    client.end();
  })
  .catch(console.error);
