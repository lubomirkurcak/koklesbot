const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { arraySum } = require('../misc/shared');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stats')
        .setDescription('Show stats!')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction) {
        try {
            const promises = [
                interaction.client.shard.fetchClientValues('guilds.cache.size'),
                interaction.client.shard.broadcastEval(client => client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0)),
            ];

            Promise.all(promises)
                .then(results => {
                    const guilds = arraySum(results[0]);
                    const members = arraySum(results[1]);
                    interaction.reply(`Serving ${guilds} guilds, ${members} members. :nerd:`);
                })
                .catch(console.error);

        } catch (error) {
            console.error(error);
            interaction.reply('Command failed. :cry:');
        }
    },
};
