const { ContextMenuCommandBuilder, ApplicationCommandType, ModalBuilder, TextInputBuilder, ActionRowBuilder, TextInputStyle } = require('discord.js');

module.exports = {
    data: new ContextMenuCommandBuilder()
        .setName('Rename')
        .setType(ApplicationCommandType.User),

    async modalCallback(interaction) {
        try {
            const userId = interaction.customId.split('-')[1];
            const member = await interaction.guild.members.fetch(userId);
            const name = interaction.fields.getTextInputValue('renameName');
            await member.setNickname(name);
            return interaction.reply({ content: `You renamed ${member.displayName}`, ephemeral: true });
        } catch (error) {
            console.error(error);
            return interaction.reply({ content: 'Rename failed, likely due to insufficient permissions.', ephemeral: true });
        }
    },

    async execute(interaction) {
        const modalCustomId = `rename-${interaction.targetId}`;

        const modal = new ModalBuilder()
            .setCustomId(modalCustomId)
            .setTitle(`Rename ${interaction.targetMember.displayName}`);

        const name = new TextInputBuilder()
            .setCustomId('renameName')
            .setLabel('Name')
            .setPlaceholder(`${interaction.targetMember.displayName}`)
            .setStyle(TextInputStyle.Short);

        const row = new ActionRowBuilder().addComponents(name);

        modal.addComponents(row);

        await interaction.showModal(modal);
    },
};

