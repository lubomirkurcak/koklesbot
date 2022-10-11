const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

function getBag() {
    return [
        Array(3).fill(':red_circle:'),
        Array(3).fill(':o:'),
        Array(1).fill(':trophy:'),
        Array(1).fill(':cloud_rain:'),
    ].flat();
}

function listContents() {
    return getBag().join(' ');
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('draw')
        .setDescription('Draw balls from a bag. Who knows what could be inside!'),
    async execute(interaction) {
        if (!interaction.isChatInputCommand()) return;

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('draw1')
                    .setLabel('1')
                    .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                    .setCustomId('draw2')
                    .setLabel('2')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('draw3')
                    .setLabel('3')
                    .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setCustomId('draw4')
                    .setLabel('4')
                    .setStyle(ButtonStyle.Danger),
            );

        await interaction.reply({ content: `Bag contains:\n${listContents()}\nHow many do you want to draw?`, components: [row] });
    },
}