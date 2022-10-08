module.exports = {
	name: 'interactionCreate',
	execute(interaction, client) {
        console.log(`${interaction.user.tag} in #${interaction.channel.name} triggered an interaction.`);

        if (interaction.isChatInputCommand()) {
            const command = client.commands.get(interaction.commandName);

            if (!command) return;

            command.execute(interaction);
        }
	},
};
