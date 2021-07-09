const ObjectID = require('mongodb').ObjectID;
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
            // Need this format to pass challenge's test
            user._id = new ObjectID();

            const result = await db.run('INSERT INTO users(_id, username) VALUES ($_id, $username)', {
                $_id: user._id,
                $username: user.username
            });
            console.info(`Inserted user#${user._id}:`, result); // ${result.lastID}

            return {
                ...user,
                // _id: result.lastID,
            }
        },
    }
}

module.exports = usersService;
