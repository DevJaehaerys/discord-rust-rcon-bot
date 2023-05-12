const {Client} = require('rustrcon');
const {Client: DiscordClient, Events, GatewayIntentBits, ActivityType} = require('discord.js');
const {token, guildId, channelId, ip, port, pwd, nameStatus} = require('./config.json');

const rcon = new Client({
    ip: ip,
    port: port,
    password: pwd
});

const client = new DiscordClient({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

rcon.login();


client.once(Events.ClientReady, async (c) => {
    console.log(`Ready! Logged in as ${c.user.tag}`);
    client.user.setActivity(nameStatus, {type: ActivityType.Game}); // Также можно: Game, Watching, Competing, Listening, Streaming 

    function sendMessage(channel, message) {
        console.log(typeof message);
        if (!message) {
            channel.send('Server returned empty message');
        } else {
            let jsonString;
            if (typeof message === 'object') {
                jsonString = JSON.stringify(message);
            } else {
                jsonString = message;
            }
            try {
                const json = JSON.parse(jsonString);
                channel.send(jsonString);
            } catch (e) {
                channel.send(jsonString);
            }
        }
    }

    rcon.on('message', async (message) => {
        const channel = client.channels.cache.get(channelId);
        sendMessage(channel, message.content);
    });
    client.on('messageCreate', async (message) => {
        if (message.channelId !== channelId || message.guildId !== guildId) {
            return;
        }
        try {
            await rcon.send(message.content);
        } catch (error) {
            console.error(`${error}`);
        }
    });
});

client.login(token);


