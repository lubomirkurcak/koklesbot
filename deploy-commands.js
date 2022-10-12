require('dotenv').config();
const fs = require('node:fs');
const path = require('node:path');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord.js');
const clientId = process.env.CLIENT_ID;
const guildId = process.env.GUILD_ID;

const disabledCommands = [
    'rank.js',
    'ping.js',
    'cs.js',
    'draw.js',
    'automessage.js',
];

const commands = [];
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath)
    .filter(file => !disabledCommands.includes(file))
    .filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    commands.push(command.data.toJSON());
}

const guildCommands = [];
const guildCommandsPath = path.join(__dirname, 'commands_guild');
const guildCommandFiles = fs.readdirSync(guildCommandsPath)
    .filter(file => !disabledCommands.includes(file))
    .filter(file => file.endsWith('.js'));

for (const file of guildCommandFiles) {
    const filePath = path.join(guildCommandsPath, file);
    const command = require(filePath);
    guildCommands.push(command.data.toJSON());
}

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

function registerCommands() {
    rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: guildCommands })
        .then(data => console.log(`Successfully registered ${data.length} guild commands.`))
        .catch(console.error);

    rest.put(Routes.applicationCommands(clientId), { body: commands })
        .then(data => console.log(`Successfully registered ${data.length} application commands.`))
        .catch(console.error);
}

function deleteCommand(commandId) {
    rest.delete(Routes.applicationGuildCommand(clientId, guildId, commandId))
        .then(() => console.log(`Deleted guild command: '${commandId}'.`))
        .catch(console.error);

    rest.delete(Routes.applicationCommand(clientId, commandId))
        .then(() => console.log(`Deleted application command: '${commandId}'.`))
        .catch(console.error);
}

function deleteAllCommands() {
    rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: [] })
        .then(() => console.log('Successfully deleted all guild commands.'))
        .catch(console.error);

    rest.put(Routes.applicationCommands(clientId), { body: [] })
        .then(() => console.log('Successfully deleted all application commands.'))
        .catch(console.error);
}

if (process.argv.includes('--deleteAll')) {
    deleteAllCommands();
} else if (process.argv.includes('--registerAll')) {
    registerCommands();
} else if (process.argv.includes('--delete')) {
    const index = process.argv.indexOf('--delete');
    deleteCommand(process.argv[index + 1]);
} else {
    console.log('  Usage: deploy-commands.js {--registerAll | --deleteAll | --delete <commandId>}');
}
