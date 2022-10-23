const { SlashCommandBuilder } = require('discord.js');
const { setTimeout } = require('node:timers/promises');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Replies with Pong!'),
    async execute(interaction) {
        await interaction.reply('Pong!');
        await setTimeout(2000);
        await interaction.editReply('Pong 2.0!');
        await interaction.followUp({ content: '[Hoi](https://youtube.com)', ephemeral: true });
        await interaction.deleteReply();
    },
};
