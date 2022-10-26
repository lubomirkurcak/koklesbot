module.exports = {
    async execute(client, guildId, job) {
        const guild = await client.guilds.fetch(guildId);
        const channel = await guild.channels.fetch(job.channelId);
        channel.send('hi');
    },
}
