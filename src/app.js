process.on('uncaughtException', async (e) => {
    console.error(e);
    await this.client.logger.logError(`${process.env.name}: ${e.message}`);
});

const { Client } = require('./Client');

const client = new Client({
    name: 'Machamp',
    appDirName: __dirname,
    runIn: ['all'], // = ['all'] for any channel
}).login();
