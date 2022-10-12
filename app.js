require('dotenv').config()
const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, GatewayIntentBits } = require('discord.js');
const { steamIds, badWords } = require(process.env.CONFIG);
const { generateDependencyReport, createAudioPlayer, NoSubscriberBehavior, AudioPlayerStatus } = require('@discordjs/voice');
console.log(generateDependencyReport());

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildBans,
        GatewayIntentBits.GuildEmojisAndStickers,
        GatewayIntentBits.GuildIntegrations,
        GatewayIntentBits.GuildWebhooks,
        GatewayIntentBits.GuildInvites,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildMessageTyping,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.DirectMessageReactions,
        GatewayIntentBits.DirectMessageTyping,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildScheduledEvents,
    ]
});

client.on("error", (e) => console.error(e));
client.on("warn", (e) => console.warn(e));
client.on("debug", (e) => console.info(e));

client.steamIds = steamIds; // todo per guild??
client.badWords = badWords; // todo per guild??
client.automessageGuilds = new Map(); // todo per channel per guild and time settings?
client.messageHooks = new Array(); // todo per guild??
client.messageCreateHooks = new Map(); // TODO PER GUILD!
client.registeredButtons = new Map(); // TODO PER GUILD!
client.audioPlayers = new Map(); // per guild

client.getGuildAudioPlayer = function (guildId) {
    if (client.audioPlayers.has(guildId)) {
        return client.audioPlayers.get(guildId);
    } else {
        const player = createAudioPlayer({ behaviors: { noSubscriber: NoSubscriberBehavior.Pause, } });
        //player.on(AudioPlayerStatus.Idle, () => { console.log('AudioPlayerStatus.Idle'); });
        player.on('error', error => {
            console.error(`Error: ${error.message} with resource ${error.resource.metadata} on ${guildId}.`);
            client.audioPlayers.delete(guildId);
        });
        client.audioPlayers.set(guildId, player);
        return player;
    }
}

const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const event = require(filePath);
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args));
    } else {
        client.on(event.name, (...args) => event.execute(...args));
    }
}

client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    client.commands.set(command.data.name, command);
}

const messageHooksPath = path.join(__dirname, 'message_hooks');
const messageHookFiles = fs.readdirSync(messageHooksPath).filter(file => file.endsWith('.js'));

for (const file of messageHookFiles) {
    const filePath = path.join(messageHooksPath, file);
    const messageHook = require(filePath);
    client.messageHooks.push(messageHook);
}


client.login(process.env.TOKEN);
