const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { getRandomElement } = require("../misc/shared");

module.exports = {
    execute(message) {
        const emojiVariant = false;

        if (message.content.includes('cs') && message.content.includes('radim')) {
            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder().setCustomId('cube').setLabel('🎲').setStyle(ButtonStyle.Primary),
                );

            const baseMessage = 'musím si hodiť kockou';
            message.reply({ content: baseMessage, components: [row] });

            message.client.registeredButtons.set('cube', interaction => {
                const id = '235839231014993921';
                if (interaction.user.id === id) {
                    if (emojiVariant) {
                        const roll = getRandomElement([':one:', ':two:', ':three:', ':four:', ':five:', ':six:']);
                        interaction.update({ content: baseMessage + '\n' + roll, components: [] });
                    } else {
                        const roll = getRandomElement(['1', '2', '3', '4', '5', '6']);
                        const rolledButton = new ActionRowBuilder()
                            .addComponents(
                                new ButtonBuilder().setCustomId('cubeRolled').setLabel(roll).setStyle(ButtonStyle.Secondary).setDisabled(),
                            );
                        interaction.update({ content: baseMessage, components: [rolledButton] });
                    }
                } else {
                    interaction.reply({ content: `Only <@${id}> can roll the die!`, ephemeral: true });
                }
            });

            message.client.registeredButtons.set('cubeRolled', interaction => interaction.reply({ content: 'You can\'t reroll 🙂', ephemeral: true }));
        }
    }
}