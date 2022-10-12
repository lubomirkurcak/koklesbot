module.exports = {
    name: 'interactionCreate',
    execute(interaction) {
        if (interaction.isChatInputCommand()) {
            const command = interaction.client.commands.get(interaction.commandName);
            if (!command) return;
            command.execute(interaction);
        } else if (interaction.isButton()) {
            const buttonCallback = interaction.client.registeredButtons.get(interaction.customId);
            if (buttonCallback) {
                buttonCallback(interaction);
            } else {
                console.warn(`Recieved unknown button interaction. customId: ${interaction.customId}`);
            }
        } else {
            console.warn(`Unknown interaction: ${interaction}`);
        }
    },
};
