const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('coins')
        .setDescription('Check how many coins you have!'),
    async execute(interaction) {
        const userId = interaction.member.id;
        const coins = await interaction.client.db.getUserCoins(userId);
        return interaction.reply({ content: `:coin: ${coins}`, ephemeral: false });
    },
};
