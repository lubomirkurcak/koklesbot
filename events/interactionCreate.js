module.exports = {
    name: 'interactionCreate',
    execute(interaction) {
        if (interaction.isChatInputCommand()) {
            const command = interaction.client.commands.get(interaction.commandName);
            if (!command) return;
            command.execute(interaction);
        } else if (interaction.isButton()) {
            const guildResources = interaction.client.getOrCreateGuildResources(interaction.guildId);

            const buttonCallback = guildResources.registeredButtons.get(interaction.customId);
            if (buttonCallback) {
                buttonCallback(interaction);
            } else {
                if (interaction.customId.startsWith('lol-')) {
                    // const match = interaction.customId.split('-')[1];
                    // const prediction = interaction.customId.split('-')[2];
                    interaction.reply({ content: 'Prediction no longer valid.', ephemeral: true })
                } else {
                    console.warn(`Recieved unknown button interaction. customId: ${interaction.customId}`);
                }
            }
        } else if (interaction.isAutocomplete()) {
            const command = interaction.client.commands.get(interaction.commandName);
            if (!command) return;
            command.autocomplete(interaction);
        } else if (interaction.isUserContextMenuCommand()) {
            const { username } = interaction.targetUser;
            console.log(username);
        } else {
            console.warn(`Unknown interaction: ${interaction}`);
        }
    },
};
