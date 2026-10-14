require("dotenv").config({
  path: require("path").resolve(__dirname, "../.env"),
});

const pool = require("../src/config/database");

async function main() {
  try {
    await pool.query(`
      ALTER TABLE recording_transcripts
        ADD COLUMN IF NOT EXISTS summary_text TEXT,
        ADD COLUMN IF NOT EXISTS summary_model VARCHAR(100),
        ADD COLUMN IF NOT EXISTS summary_updated_at TIMESTAMPTZ;
    `);

    console.log("AI summary columns are ready.");
  } catch (error) {
    console.error("Failed to prepare AI summary columns:", error.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

main();
