require("dotenv").config({
  path: require("path").resolve(__dirname, "../.env"),
});

const pool = require("../src/config/database");

async function main() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS recording_audio_sentiment (
        recording_id INTEGER PRIMARY KEY
          REFERENCES recordings(id) ON DELETE CASCADE,
        sentiment_analysis JSONB NOT NULL,
        sentiment_model VARCHAR(150) NOT NULL,
        analysis_version INTEGER NOT NULL DEFAULT 1,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    console.log(
      "recording_audio_sentiment table created or already exists."
    );

    const result = await pool.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'recording_audio_sentiment'
      ORDER BY ordinal_position;
    `);

    console.table(result.rows);
  } catch (error) {
    console.error(
      "Failed to create audio sentiment table:",
      error.message
    );
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

main();
