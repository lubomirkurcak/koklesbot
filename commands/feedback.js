const { SlashCommandBuilder, TextInputBuilder, ModalBuilder, ActionRowBuilder, TextInputStyle } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('feedback')
        .setDescription('Give feedback or share your ideas!'),
    async execute(interaction) {
        const modal = new ModalBuilder()
            .setCustomId('feedbackModal')
            .setTitle('Provide Feedback');

        const subjectInput = new TextInputBuilder()
            .setCustomId('feedbackSubject')
            .setLabel('Subject')
            .setPlaceholder('What would you like to give feedback on?')
            .setStyle(TextInputStyle.Short);

        const messageInput = new TextInputBuilder()
            .setCustomId('feedbackMessage')
            .setLabel('Message')
            .setPlaceholder('Please share any details and ideas!')
            .setStyle(TextInputStyle.Paragraph);

        const firstActionRow = new ActionRowBuilder().addComponents(subjectInput);
        const secondActionRow = new ActionRowBuilder().addComponents(messageInput);

        modal.addComponents(firstActionRow, secondActionRow);

        const guildResources = interaction.client.getOrCreateGuildResources(interaction.guildId);
        guildResources.registeredModals.set('feedbackModal', interaction => {
            const subject = interaction.fields.getTextInputValue('feedbackSubject');
            const message = interaction.fields.getTextInputValue('feedbackMessage');

            interaction.client.db.addFeedback(interaction.user.id, subject, message).then(feedbackId =>
            // interaction.reply({ content: `Thank you!  (Token: ||${feedbackId}||)`, ephemeral: true })
            { }
            ).catch(console.error);
            interaction.reply({ content: 'Thank you for your feedback!', ephemeral: true });
        });

        await interaction.showModal(modal);
    },
};
