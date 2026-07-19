const { DatabaseSync } = require("node:sqlite");

const database = new DatabaseSync("sentinel.db");

database.exec(`
  CREATE TABLE IF NOT EXISTS warnings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    server_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    moderator_id TEXT NOT NULL,
    reason TEXT NOT NULL,
    created_at TEXT NOT NULL
  )
`);

function addWarning(serverId, userId, moderatorId, reason) {
  const statement = database.prepare(`
    INSERT INTO warnings (
      server_id,
      user_id,
      moderator_id,
      reason,
      created_at
    )
    VALUES (?, ?, ?, ?, ?)
  `);

  statement.run(
    serverId,
    userId,
    moderatorId,
    reason,
    new Date().toISOString()
  );
}

function getWarnings(serverId, userId) {
  const statement = database.prepare(`
    SELECT *
    FROM warnings
    WHERE server_id = ? AND user_id = ?
    ORDER BY id DESC
  `);

  return statement.all(serverId, userId);
}

module.exports = {
  addWarning,
  getWarnings,
};

console.log("Sentinel-Datenbank ist bereit.");