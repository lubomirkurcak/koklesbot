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
                console.warn(`Recieved unknown button interaction. customId: ${interaction.customId}`);
            }
        } else if (interaction.isAutocomplete()) {
            const command = interaction.client.commands.get(interaction.commandName);
            if (!command) return;
            command.autocomplete(interaction);
        } else {
            console.warn(`Unknown interaction: ${interaction}`);
        }
    },
};
