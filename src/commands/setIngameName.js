module.exports = class {
    constructor(...params) {
        Object.assign(this, {
            name: 'set-ingame-name',
            enabled: true,
            runIn: [], // [] = uses app.js runIn property values
            aliases: ['set-ingame-name'],
            description: 'Associate your Pokémon Go ingame name with your discord account',
        });
    }

    async run(msg, { prefix, cmd, args }) {
        try {
            i
        } catch (e) {
            // await msg.channel.send(e.message);
            console.error(e);
        }
    }
};
