const express = require('express');
const { Client } = require('pg');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Fungsi pembantu untuk koneksi ke DB dinamis
// Kita membuat koneksi baru setiap kali request masuk berdasarkan data dari App
const executeQuery = async (dbConfig, queryText, params = []) => {
  const client = new Client({
    host: dbConfig.host, // IP komputer/localhost database
    port: 5432,
    user: dbConfig.user,
    password: dbConfig.password,
    database: dbConfig.database,
  });

  try {
    await client.connect();
    const res = await client.query(queryText, params);
    await client.end();
    return res.rows;
  } catch (err) {
    await client.end();
    throw err; // Lempar error agar bisa ditangkap di route
  }
};

// 1. Endpoint untuk Test Koneksi
app.post('/api/test-connection', async (req, res) => {
  const { host, user, password, database } = req.body;
  
  try {
    // Coba query sederhana 'SELECT NOW()' untuk cek koneksi
    const result = await executeQuery({ host, user, password, database }, 'SELECT NOW()');
    res.json({ status: 'success', message: 'Terhubung ke PostgreSQL!', time: result[0].now });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 'error', message: 'Gagal terhubung: ' + error.message });
  }
});

// 2. Endpoint untuk Cari Barang
app.post('/api/search', async (req, res) => {
  const { dbConfig, keyword } = req.body; // dbConfig berisi host, user, pass, dll

  try {
    // Cari berdasarkan Nama ATAU SKU (Case insensitive dengan ILIKE)
    const query = `
      SELECT name, sku, description, quantity 
      FROM products 
      WHERE name ILIKE $1 OR sku ILIKE $1
      ORDER BY quantity DESC
    `;
    const values = [`%${keyword}%`];

    const products = await executeQuery(dbConfig, query, values);
    res.json({ status: 'success', data: products });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server berjalan di port ${PORT}`);
});