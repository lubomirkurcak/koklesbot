module.exports = {
    name: 'interactionCreate',
    execute(interaction) {
        if (interaction.isChatInputCommand() || interaction.isUserContextMenuCommand()) {
            const command = interaction.client.commands.get(interaction.commandName);

            if (command) {
                command.execute(interaction);
            } else {
                console.log(`Unknown command/context menu: '${interaction.commandName}' (${interaction.commandId})`);
            }

        } else if (interaction.isButton()) {
            const guildResources = interaction.client.getOrCreateGuildResources(interaction.guildId);
            const buttonCallback = guildResources.registeredButtons.get(interaction.customId);

            if (buttonCallback) {
                buttonCallback(interaction);
            } else if (interaction.customId.startsWith('lol-')) {
                interaction.reply({ content: 'Prediction no longer valid.', ephemeral: true });
            } else {
                console.warn(`Recieved unknown button interaction. customId: ${interaction.customId}`);
            }

        } else if (interaction.isModalSubmit()) {
            const guildResources = interaction.client.getOrCreateGuildResources(interaction.guildId);
            const modalCallback = guildResources.registeredModals.get(interaction.customId);

            if (modalCallback) {
                modalCallback(interaction);
            } else if (interaction.customId.startsWith('rename-')) {
                interaction.client.commands.get('Rename').modalCallback(interaction);
            } else {
                console.warn(`Recieved unknown modal interaction. customId: ${interaction.customId}`);
            }

        } else if (interaction.isAutocomplete()) {
            const command = interaction.client.commands.get(interaction.commandName);
            if (command) {
                command.autocomplete(interaction);
            }
        } else {
            console.warn(`Unknown interaction: ${interaction}`);
        }
    },
};
