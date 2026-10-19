
require("dotenv").config({
  path: require("path").resolve(__dirname, "../.env"),
});

const pool = require("../src/config/database");

async function main() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS recording_meeting_insights (
        id SERIAL PRIMARY KEY,
        recording_id INTEGER NOT NULL UNIQUE
          REFERENCES recordings(id) ON DELETE CASCADE,
        key_points JSONB NOT NULL DEFAULT '[]'::jsonb,
        decisions JSONB NOT NULL DEFAULT '[]'::jsonb,
        action_items JSONB NOT NULL DEFAULT '[]'::jsonb,
        model VARCHAR(100) NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    console.log(
      "recording_meeting_insights table created or already exists."
    );
  } catch (error) {
    console.error(
      "Failed to create meeting insights table:",
      error.message
    );
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

main();
