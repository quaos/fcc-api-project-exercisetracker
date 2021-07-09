const util = require('util');

async function initDB(db, opts = {}) {
    console.info('Initializing Database');
    // const _dbRunAsync = util.promisify(db.run).bind(db);

    await db.run(
        'CREATE TABLE IF NOT EXISTS users('
        + '_id TEXT PRIMARY KEY'
        + ', username TEXT)'
    );

    await db.run(
        'CREATE TABLE IF NOT EXISTS exercise_logs('
        + '_id INTEGER PRIMARY KEY'
        + ', description TEXT'
        + ', duration INTEGER'
        + ', date INTEGER'
        + ', user_id INTEGER)'
    );
}

module.exports = initDB;
