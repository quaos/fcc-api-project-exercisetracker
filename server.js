const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const bodyParser = require('body-parser');
const Database = require('sqlite-async');

const appConfig = require('./app-config');
const initDB = require('./initdb');
const usersService = require('./services/users');
const exerciseLogsService = require('./services/exercise-logs');
const usersController = require('./controllers/users');
const apiRoute = require('./routes/api');

app.use(cors());
app.use(bodyParser.urlencoded());

app.use(express.static('public'));
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
});

(async function () {
  let db;

  process.on('beforeExit', (code) => {
    console.log('Exiting: ', code);
    if (db) {
      db.close().catch((err) => {
        console.error('Error closing DB connection:', err);
      });
    }
  });

  try {
    const config = appConfig();

    db = await Database.open(config.dbUrl, Database.OPEN_READWRITE | Database.OPEN_CREATE);
    // await new Promise((resolve, reject) => {
    //   const _db = new sqlite3.Database(
    //     config.dbUrl,
    //     sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
    //     (err) => {
    //       if (err) {
    //         return reject(err);
    //       }
    //       console.info(`Connected to SQlite database at: ${config.dbUrl}`);
    //       resolve(_db);
    //     }
    //   );
    // });
    console.log("DB:", db);

    await initDB(db);

    const usersSvc = usersService(db, { config });
    const exerciseLogsSvc = exerciseLogsService(db, { config });
    const usersCont = usersController(usersSvc, exerciseLogsSvc, { config });

    app.use('/api', apiRoute(usersCont, { config }));

    const listener = app.listen(config.port, () => {
      console.log('Your app is listening on port ' + listener.address().port);
    })
  } catch (err) {
    console.error(err);
    process.exit(-1);
  }
}());
