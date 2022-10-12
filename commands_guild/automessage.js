const jsdom = require('jsdom');
const { SlashCommandBuilder } = require('discord.js');
const wait = require('node:timers/promises').setTimeout;

async function getNecyklopediaFact() {
    const url = 'https://necyklopedia.org/wiki/Viete_%C5%BEe%3F';
    const response = await fetch(url);
    const obj = await response.text();
    const dom = new jsdom.JSDOM(obj);
    const matches = [...dom.window.document.querySelectorAll('ol li')]
        .map(match => match.textContent)
        .filter(match => match.includes('Vedeli ste, že'));

    const random = Math.floor(matches.length * Math.random());
    return matches[random];
}

function clampOrDefault(value, min, max, defaultValue) {
    if (typeof value === 'number') {
        return Math.min(max, Math.max(min, value));
    }
    return defaultValue;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('automessage')
        .setDescription('Manage automated messages.')
        .addIntegerOption(option => option
            .setName('interval')
            .setDescription('Time interval in minutes to wait between each message')),

    async execute(interaction) {
        const runToken = new Date();
        const timeInterval = clampOrDefault(interaction.options.getInteger('interval'), 1, 43200, 1440);

        if (!interaction.client.automessageGuilds.has(interaction.guildId)) {
            interaction.client.automessageGuilds.set(interaction.guildId, new Map([['activeRunToken', undefined]]));
        }
        const guildSettings = interaction.client.automessageGuilds.get(interaction.guildId);
        guildSettings.set('activeRunToken', runToken);

        const channel = interaction.channel;
        await interaction.reply({ content: 'k', ephemeral: true });

        while (guildSettings.get('activeRunToken') === runToken) {
            getNecyklopediaFact()
                .then(result => channel.send(result))
                .catch(error => console.log(error));
            await wait(timeInterval * 60 * 1000);
        }

        console.log(`Automessage loop cancelled. Run token no longer valid. Token: ${runToken} Active Token: ${guildSettings.get('activeRunToken')}`);
    },
};
