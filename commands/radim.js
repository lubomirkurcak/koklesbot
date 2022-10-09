const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('radim')
        .setDescription('Decision making assistant'),
    async execute(interaction) {
        if (!interaction.isChatInputCommand()) return;

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('radim1')
                    .setLabel('1')
                    .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                    .setCustomId('radim3')
                    .setLabel('3')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('radim5')
                    .setLabel('5')
                    .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setCustomId('radim10')
                    .setLabel('10')
                    .setStyle(ButtonStyle.Danger),
            );

        await interaction.reply({ content: 'How many balls do you want to draw?', components: [row] });
    },
}