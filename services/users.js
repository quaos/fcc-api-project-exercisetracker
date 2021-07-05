// const util = require('util');

function usersService(db, opts = {}) {
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
        findAllUsers: async () => {
            return await db.all('SELECT _id, username FROM users')
        },

        getUser: async (_id) => {
            return await db.get('SELECT _id, username FROM users WHERE _id = ?', _id)
        },

        getUserByName: async (username) => {
            return await db.get('SELECT _id, username FROM users WHERE username = ?', username)
        },

        addUser: async (user) => {
            const result = await db.run('INSERT INTO users(username) VALUES ($username)', {
                $username: user.username
            });
            console.info(`Inserted user#${result.lastID}`);

            return {
                ...user,
                _id: result.lastID,
            }
        },
    }
}

module.exports = usersService;
