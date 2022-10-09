require('dotenv').config()
const fs = require('node:fs');
const path = require('node:path');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord.js');
const clientId = process.env.CLIENT_ID;
const guildId = process.env.GUILD_ID;

const commands = [];
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    commands.push(command.data.toJSON());
}

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

function registerCommands() {
    rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands })
        .then(data => console.log(`Successfully registered ${data.length} application commands.`))
        .catch(console.error);
}

function deleteCommand(name) {
    rest.delete(Routes.applicationGuildCommand(clientId, guildId, name))
        .then(() => console.log(`Deleted guild command: '${name}'.`))
        .catch(console.error);

    rest.delete(Routes.applicationCommand(clientId, name))
        .then(() => console.log(`Deleted application command: '${name}'.`))
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

//deleteCommand('1028355321736986694');
//deleteCommand('1028363644225982485');
//deleteAllCommands();
registerCommands();
