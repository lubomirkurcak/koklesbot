const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { getRandomElement } = require('../misc/shared');

module.exports = {
    execute(message) {
        const id = '235839231014993921';
        const msg = message.content.toLowerCase();
        if (msg.includes('cs') && (msg.includes('radim') || msg.includes(id))) {
            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('cube').setLabel('🎲').setStyle(ButtonStyle.Primary),
            );

            const baseMessage = 'musím si hodiť kockou';
            message.reply({ content: baseMessage, components: [row] });

            const guildResources = message.client.getOrCreateGuildResources(message.guildId);

            guildResources.registeredButtons.set('cube', interaction => {
                if (interaction.user.id === id) {
                    const roll = getRandomElement(['1', '2', '3', '4', '5', '6']);
                    const rolledButton = new ActionRowBuilder().addComponents(
                        new ButtonBuilder().setCustomId('cubeRolled').setLabel(roll).setStyle(ButtonStyle.Secondary).setDisabled(),
                    );
                    interaction.update({ content: baseMessage, components: [rolledButton] });
                } else {
                    interaction.reply({ content: `Only <@${id}> can roll the die!`, ephemeral: true });
                }
            });

            guildResources.registeredButtons.set('cubeRolled', interaction => interaction.reply({ content: 'You can\'t reroll 🙂', ephemeral: true }));
        }
    },
};
