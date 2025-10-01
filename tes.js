const pool = require("./pg");

async function testConnection() {
  try {
    const res = await pool.query("SELECT NOW()");
    console.log("✅ Database connected! Current time:", res.rows[0].now);
  } catch (err) {
    console.error("❌ Connection failed:", err.stack);
  }
}

testConnection();
