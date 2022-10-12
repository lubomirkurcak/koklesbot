const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { shuffleInplace } = require('../misc/shared');

function getBag() {
    return [
        Array(3).fill(':coin:'),
        Array(3).fill(':x:'),
        Array(1).fill(':trophy:'),
        Array(1).fill(':skull:'),
    ].flat();
}

function listContents() {
    return getBag().join(' ');
}

function drawBalls(count) {
    const bag = getBag();
    shuffleInplace(bag);
    return `Bag contains:\n${listContents()}\nYou drew:\n${bag.slice(0, count).join(' ')}`;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('draw')
        .setDescription('Draw balls from a bag. Who knows what could be inside!'),
    async execute(interaction) {
        if (!interaction.isChatInputCommand()) return;

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder().setCustomId('draw1').setLabel('1').setStyle(ButtonStyle.Primary),
                new ButtonBuilder().setCustomId('draw2').setLabel('2').setStyle(ButtonStyle.Success),
                new ButtonBuilder().setCustomId('draw3').setLabel('3').setStyle(ButtonStyle.Danger),
                new ButtonBuilder().setCustomId('draw4').setLabel('4').setStyle(ButtonStyle.Secondary),
            );

        await interaction.reply({ content: `Bag contains:\n${listContents()}\nHow many do you want to draw?`, components: [row] });

        interaction.client.registeredButtons.set('draw1', interaction => interaction.update({ content: drawBalls(1), components: [] }));
        interaction.client.registeredButtons.set('draw2', interaction => interaction.update({ content: drawBalls(2), components: [] }));
        interaction.client.registeredButtons.set('draw3', interaction => interaction.update({ content: drawBalls(3), components: [] }));
        interaction.client.registeredButtons.set('draw4', interaction => interaction.update({ content: drawBalls(4), components: [] }));
    },
}