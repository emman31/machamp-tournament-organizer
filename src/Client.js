const Discord = require('discord.js');
const fs = require('fs');
const path = require('path');

const configs = require('../configs.js');

process.on('unhandledRejection', (reason, p) => {
    console.log('Unhandled Rejection at:', p, 'reason:', reason);
    console.log('Exiting bot with status code 1.');
    process.exit(1);
});

class Client extends Discord.Client {
    constructor(options) {
        super(options.clientOptions);
        this.configs = configs;
        this.configs.appDirName = options.appDirName;
        this.configs.moduleDirNames = ['commands', 'events', 'monitors'];
        this.configs.runIn = options.runIn;
        this.name = options.name;

        this.on('ready', this.ready); // Runs dynamic import of module files inside folders in `rootDirName`
        this.on('message', this.message); // Runs the on message event listener
        this.on('error', (e) => { this.error(e); });
    }

    async ready() {
        try {
            const getDirPaths = (appDirName) => {
                const dirContents = fs.readdirSync(path.join(appDirName));
                const paths = dirContents.map(content => path.join(appDirName, content));
                const that = {};

                const dirPaths = paths.filter(p => fs.statSync(p).isDirectory() && this.configs.moduleDirNames.includes(path.basename(p)));

                dirPaths.forEach((dirPath) => {
                    const dirName = path.basename(dirPath);
                    const fileNames = fs.readdirSync(dirPath)
                        .filter(dirContent => fs.statSync(path.join(dirPath, dirContent)).isFile() && path.extname(path.join(dirPath, dirContent)) === '.js')
                        .map(jsFile => path.join(dirPath, jsFile));
                    that[dirName] = fileNames;
                });

                return that;
            };

            const getModuleConstructors = (appDirName) => {
                const thos = {};
                const dirPaths = getDirPaths(appDirName);

                Object.keys(dirPaths).forEach((key) => {
                    thos[key] = {};
                    dirPaths[key].forEach((filePath) => {
                        thos[key][path.basename(filePath).replace('.js', '')] = require(filePath);
                    });
                });

                return thos;
            };

            const generateClassInstances = (appDirName) => {
                const thos = {};
                const moduleConstructors = getModuleConstructors(appDirName);

                Object.keys(moduleConstructors).forEach((key) => {
                    thos[key] = {};
                    Object.keys(moduleConstructors[key]).forEach((keyy) => {
                        thos[key][keyy] = new moduleConstructors[key][keyy]();
                    });
                });

                return thos;
            };

            const classInstances = generateClassInstances(this.configs.appDirName);
            this.configs.moduleDirNames.forEach((moduleDirName) => {
                this[moduleDirName] = classInstances[moduleDirName];
            });

            console.info('\n-----------------------------------------------------------------\n'
                + `${this.user.tag}, Ready to serve ${this.guilds.size} guilds and ${this.users.size} users\n`
                + '-----------------------------------------------------------------');
        } catch (err) {
            console.error(err);
        }
    }

    async message(msg) {
        try {
            // Check
            const { prefix } = this.parseMessageForCommand(msg);
            const commandPredicate = this.configs.cmdPrefix === prefix;
            if (commandPredicate) { await this.commandMessage(msg); }

            // Check monitor runIn values if not empty
            if (this.monitors) {
                const monitorPredicate = Object.keys(this.monitors).some(key => this.monitors[key].runIn.includes(msg.channel.name));
                if (monitorPredicate) { await this.monitorMessage(msg); }
            }
        } catch (err) { console.error(err); }
    }

    async commandMessage(msg) {
        try {
            const { prefix, cmd, args } = this.parseMessageForCommand(msg);

            // COMMMANDS LOOP CHECK
            Object.keys(this.commands).forEach(async (command) => {
                // Check `cmd` is a valid `command.name` or `command.aliases`
                if (this.commands[command].name === cmd
                || this.commands[command].aliases.includes(cmd)) {
                    // Check `command.enabled` is `true`
                    if (!this.commands[command].enabled) { return; }
                    // Check if `command.runIn` is empty (else use `client.runIn`)
                    if (this.commands[command].runIn.length !== 0) { // `command.runIn = []`?
                        if (!this.commands[command].runIn.includes(msg.channel.name)
                        && !this.commands[command].runIn.includes(msg.channel.type)
                        && !this.commands[command].runIn.includes(msg.channel.id)
                        && !this.commands[command].runIn.includes('all') // `command.runIn[i] == 'all'`
                        ) { return; }
                    } else { // Check `client.runIn` values to make sure bot can run in these channels
                        // eslint-disable-next-line
                        if (!this.configs.runIn.includes(msg.channel.name) // `client.runIn[i] == msg.channel.name`
                        && !this.configs.runIn.includes(msg.channel.type) // `client.runIn[i] == 'dm'`
                        && !this.configs.runIn.includes('all') // `client.runIn[i] == 'all'`
                        ) { return; }
                    }
                    // Pass `client` into `command` instance as property
                    this.commands[command].client = this;
                    // Call `command.run()` method
                    await this.commands[command].run(msg, { prefix, cmd, args });
                }
            });
        } catch (err) { console.error(err); }
    }

    async monitorMessage(msg) {
        try {
            // NON-COMMAND BASED EVENT (MONITOR) (discord-income/raid-income) LOOP CHECK
            Object.keys(this.monitors).forEach(async (monitor) => {
                // Check `monitor.enabled` is `true`
                if (!this.monitors[monitor].enabled) { return; }
                // Check if `monitor.runIn` is empty
                if (this.monitors[monitor].runIn.length !== 0) {
                    if (this.monitors[monitor].runIn.includes(msg.channel.name)
                    || this.monitors[monitor].runIn.includes(msg.channel.type)
                    || this.monitors[monitor].runIn.includes(msg.channel.id)
                    || this.monitors[monitor].runIn.includes('all')) {
                        // Pass `client` into `monitor` instance as property
                        this.monitors[monitor].client = this;
                        // Call `monitor.run()` method
                        await this.monitors[monitor].run(msg, {});
                    }
                }
            });
        } catch (err) { console.error(err); }
    }

    async login() {
        return super.login(`${this.configs[this.name].botToken}`);
    }

    async error(err) {
        console.error(err);
    }

    static parseMessageForCommand(msg) {
        const prefix = msg.content.charAt(0);
        const cmd = msg.content.slice(1).split(' ')[0].toLowerCase();
        let args = msg.content.slice(1).split(' ').slice(1);

        return { prefix, cmd, args };
    }
}

module.exports = { Client };