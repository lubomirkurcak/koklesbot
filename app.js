require('dotenv').config();
const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, GatewayIntentBits } = require('discord.js');
const { generateDependencyReport, createAudioPlayer, NoSubscriberBehavior, AudioPlayerStatus, createAudioResource, StreamType } = require('@discordjs/voice');
const { getRandomElement } = require('./misc/shared');
const { createReadStream } = require('node:fs');
const { join } = require('node:path');
console.log(generateDependencyReport());
const wait = require('node:timers/promises').setTimeout;

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
    ],
});

client.on('error', (e) => console.error(e));
client.on('warn', (e) => console.warn(e));
// client.on('debug', (e) => console.info(e));

const { initDatabase } = require('./db.js');
client.db = initDatabase();

client.guildResources = new Map();
client.getOrCreateGuildResources = function (guildId) {
    if (client.guildResources.has(guildId)) {
        return client.guildResources.get(guildId);
    } else {
        const resources = {
            messageCreateHooks: new Map(),
            registeredButtons: new Map(),
            audioPlayer: undefined,
        };
        client.guildResources.set(guildId, resources);
        return resources;
    }
};

client.getGuildAudioPlayer = function (guildId) {
    const resources = client.getOrCreateGuildResources(guildId);
    if (!resources.audioPlayer) {
        resources.audioPlayer = createAudioPlayer({ behaviors: { noSubscriber: NoSubscriberBehavior.Pause } });
        resources.audioPlayer.on('error', error => {
            console.error(`Error: ${error.message} with resource ${error.resource.metadata} on ${guildId}.`);
            resources.audioPlayer = undefined;
        });
    }
    return resources.audioPlayer;
};

// function radioPlayNextSong() {
//     const radioPath = path.join(__dirname, 'assets/radio1');
//     const radioFiles = fs.readdirSync(radioPath);
//     const sound = getRandomElement(radioFiles);
//     console.log(`radio1: ${sound}`);
//     const resource = createAudioResource(join(__dirname, `assets/radio1/${sound}`));
//     client.radioPlayer.play(resource);
// 
//     wait(2000).then(() => {
//         if (!client.radioPlayer.checkPlayable()) {
//             radioPlayNextSong();
//         }
//     });
// }
// client.radioPlayer = createAudioPlayer({ behaviors: { noSubscriber: NoSubscriberBehavior.Play } });
// client.radioPlayer.on(AudioPlayerStatus.Idle, () => {
//     radioPlayNextSong();
// });
// client.radioPlayer.on('error', error => {
//     console.error(`Error: ${error.message} with resource ${error.resource.metadata}.`);
// });
// radioPlayNextSong();

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

const guildCommandsPath = path.join(__dirname, 'commands_guild');
const guildCommandFiles = fs.readdirSync(guildCommandsPath).filter(file => file.endsWith('.js'));

for (const file of guildCommandFiles) {
    const filePath = path.join(guildCommandsPath, file);
    const command = require(filePath);
    client.commands.set(command.data.name, command);
}

client.messageHooks = new Array();
const messageHooksPath = path.join(__dirname, 'message_hooks');
const messageHookFiles = fs.readdirSync(messageHooksPath).filter(file => file.endsWith('.js'));

for (const file of messageHookFiles) {
    const filePath = path.join(messageHooksPath, file);
    const messageHook = require(filePath);
    client.messageHooks.push(messageHook);
}

client.login(process.env.TOKEN);
