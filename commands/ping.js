const { SlashCommandBuilder } = require('discord.js');
const wait = require('node:timers/promises').setTimeout;

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Replies with Pong!'),
    async execute(interaction) {
        await interaction.reply('Pong!');
        await wait(2000);
        await interaction.editReply('Pong 2.0!');
        await interaction.followUp({ content: '[Hoi](https://youtube.com)', ephemeral: true });
        await interaction.deleteReply();
    },
};
