const jsdom = require('jsdom');

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

module.exports = {
    async execute(client, guildId, job, interaction = null) {
        const guild = await client.guilds.fetch(guildId);
        const channel = await guild.channels.fetch(job.channelId);
        const fact = await getNecyklopediaFact();

        const message = { content: `:bulb: ${fact}`, ephemeral: true };

        if (interaction) {
            interaction.reply(message)
        } else {
            channel.send(message);
        }
    },
};