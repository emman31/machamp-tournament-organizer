module.exports = {
    rootDirPath: process.cwd(),
    cmdPrefix: '!',
    dbMongo: {
        dbPath: process.env.MONGO_DB_PATH,
    },
    Machamp: {
        clientId: process.env.CLIENT_ID,
        botToken: process.env.BOT_TOKEN,
    }
};
