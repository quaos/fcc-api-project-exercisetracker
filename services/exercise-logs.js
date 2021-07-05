// const util = require('util');

function exerciseLogsService(db, opts = {}) {
    // const _dbQueryAsync = util.promisify(db.get).bind(db);
    // const _dbInsertAsync = (sql, params) => new Promise((resolve, reject) => {
    //     db.run(sql, params, function (err) {
    //         if (err) {
    //             return reject(err);
    //         }
    //         resolve(this);
    //     });
    // });

    return {
        findLogs: async (findOpts = {}) => {
            const userId = findOpts.userId;
            const filters = findOpts.filters || {};
            const filterSqlParts = ['user_id = $userId'];
            const params = {
                $userId: userId,
            }
            if (filters.from) {
                filterSqlParts.push('date >= $from');
                params.$from = new Date(filters.from).getTime();
            }
            if (filters.to) {
                filterSqlParts.push('date <= $to');
                const t1 = new Date(filters.to);
                params.$to = new Date(t1.setDate(t1.getDate() + 1))
                    .setHours(0, 0, 0, 0);
            }
            if (filters.limit) {
                params.$limit = Number(filters.limit);
            }

            const sql = 'SELECT _id, description, duration, date, user_id'
                + ' FROM exercise_logs'
                + ' WHERE '
                + filterSqlParts.map(sql => `(${sql})`).join(' AND ')
                + ' ORDER BY date DESC'
                + ((filters.limit) ? ' LIMIT $limit' : '');
            console.log('SQL:', sql);
            console.log('Params:', params);

            const rows = await db.all(sql, params);

            return rows.map((row) => ({
                ...row,
                date: (row.date) ? new Date(row.date) : null,
            }))
        },

        addLog: async (log) => {
            const sql = 'INSERT INTO exercise_logs(description, duration, date, user_id)'
                + ' VALUES ($description, $duration, $date, $userId)';
            console.log('SQL:', sql);

            const duration = Number(log.duration);
            const date = (log.date) ? new Date(log.date) : new Date();
            const params = {
                $description: log.description,
                $duration: duration,
                $date: date.getTime(),
                $userId: log.userId,
            };
            console.log('Params:', params);

            const result = await db.run(sql, params);
            console.info(`Inserted exercise_log#${result.lastID}`);

            return {
                ...log,
                _id: result.lastID,
                duration,
                date,
            }
        },
    }
}

module.exports = exerciseLogsService;
