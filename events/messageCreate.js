module.exports = {
    name: 'messageCreate',
    execute(interaction, client) {
        if(interaction.author.bot) return;

        if(client.badWords.some(value => interaction.content.toLowerCase().includes(value))) {
            interaction.reply("We don't use curse words here. This is a christian channel! :slight_smile:");

            // TODO: Strike author and mute them upon 3 violations!
        }
    },
};
