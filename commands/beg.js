const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('beg')
        .setDescription('Exchange your dignity for virtual currency!'),

    async execute(interaction) {
        interaction.client.db.awardUserCoins(interaction.member.id, 1);
        interaction.reply('Here, have this. :coin:');
    },
};

