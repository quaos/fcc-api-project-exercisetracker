function appConfig() {
    return {
        port: process.env.PORT || 3000,
        dbUrl: process.env.DB_URL || './data/exercisetracker.db',
    }
}

module.exports = appConfig;
