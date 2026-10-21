require("dotenv").config({ path: "backend/.env" });

const pool = require("../src/config/database");

async function main() {
  try {
    const result = await pool.query(`
      CREATE TABLE IF NOT EXISTS recording_audio_analysis (
        recording_id INTEGER PRIMARY KEY
          REFERENCES recordings(id) ON DELETE CASCADE,
        emotion_analysis JSONB NOT NULL,
        tone_analysis JSONB NOT NULL,
        emotion_model TEXT NOT NULL,
        analysis_version INTEGER NOT NULL DEFAULT 1,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    console.log("recording_audio_analysis table is ready.");

    const columns = await pool.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'recording_audio_analysis'
      ORDER BY ordinal_position;
    `);

    console.table(columns.rows);
  } catch (error) {
    console.error("Audio analysis migration failed:", error.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

main();
