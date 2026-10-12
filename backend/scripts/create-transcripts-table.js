
require("dotenv").config({
  path: require("path").resolve(__dirname, "../.env"),
});

const pool = require("../src/config/database");

async function main() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS recording_transcripts (
        id SERIAL PRIMARY KEY,
        recording_id INTEGER NOT NULL UNIQUE
          REFERENCES recordings(id) ON DELETE CASCADE,
        language VARCHAR(20),
        language_probability REAL,
        transcript_text TEXT NOT NULL,
        segments JSONB NOT NULL DEFAULT '[]'::jsonb,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    console.log("recording_transcripts table created or already exists.");
  } catch (error) {
    console.error("Failed to create transcripts table:", error.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

main();
