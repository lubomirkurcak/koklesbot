require('dotenv').config();
const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, GatewayIntentBits } = require('discord.js');
const { generateDependencyReport, createAudioPlayer, NoSubscriberBehavior, AudioPlayerStatus, createAudioResource } = require('@discordjs/voice');
const { getRandomElement } = require('./misc/shared');
const { join } = require('node:path');
const { initDatabase } = require('./db.js');
console.log(generateDependencyReport());
const wait = require('node:timers/promises').setTimeout;

const client = new Client({
    shards: 'auto',
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

client.db = initDatabase();

client.guildResources = new Map();
client.getOrCreateGuildResources = function (guildId) {
    if (client.guildResources.has(guildId)) {
        return client.guildResources.get(guildId);
    } else {
        const resources = {
            messageCreateHooks: new Map(),
            registeredButtons: new Map(),
        };
        client.guildResources.set(guildId, resources);
        return resources;
    }
};

function radioPlayNextSong(player, radio) {
    const radioPath = path.join(__dirname, `assets/${radio}`);
    const radioFiles = fs.readdirSync(radioPath);
    const lastSongs = client.lastRadioSongs.get(radio);
    let sound;
    for (let maxTries = 10; maxTries > 0; maxTries -= 1) {
        sound = getRandomElement(radioFiles);
        if (!lastSongs.includes(sound)) {
            break;
        }
        console.log(`${radio} retrying new song pick :) ${maxTries} tries left :)`)
    }
    lastSongs.push(sound);
    if (lastSongs.length > 20) {
        lastSongs.shift();
    }

    const resource = createAudioResource(fs.createReadStream(join(__dirname, `assets/${radio}/${sound}`)));
    player.play(resource);

    console.log(`${radio}: ${sound}, ${player.checkPlayable()}`);

    wait(10000).then(() => {
        if (!player.checkPlayable()) {
            console.error(`${radio}: not playable. playing next song..`);
            radioPlayNextSong();
        }
    });
}
function createRadioPlayer(radio) {
    const player = createAudioPlayer({ behaviors: { noSubscriber: NoSubscriberBehavior.Play } });
    player.on(AudioPlayerStatus.Idle, () => {
        radioPlayNextSong(player, radio);
    });
    player.on('error', error => {
        console.error(`Error: ${error.message} with resource ${error.resource.metadata}.`);
    });
    if (!client.radios) {
        client.radios = new Map();
        client.lastRadioSongs = new Map();
    }
    client.radios.set(radio, player);
    client.lastRadioSongs.set(radio, new Array());
    radioPlayNextSong(player, radio);
}
createRadioPlayer('radio1');
createRadioPlayer('radio2');

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

