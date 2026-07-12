const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres:postgres@localhost:5432/assetflow?schema=public'
});

client.connect()
  .then(() => {
    console.log("Successfully connected to the database!");
    return client.query('SELECT NOW()');
  })
  .then(res => {
    console.log("Current DB time:", res.rows[0].now);
  })
  .catch(err => {
    console.error("Database connection error:", err.message);
  })
  .finally(() => {
    client.end();
  });
