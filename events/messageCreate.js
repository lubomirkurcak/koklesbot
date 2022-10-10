function hasCurseWords(message, badWords) {
    const test1 = message
        .replaceAll(/\s+/g, '')
        .normalize("NFD").replace(/\p{Diacritic}/gu, "")
        .replaceAll('0', 'o')
        .replaceAll('1', 'i')
        .replaceAll('2', 'z')
        .replaceAll('3', 'e')
        .replaceAll('4', 'a')
        .replaceAll('5', 's')
        .replaceAll('7', 't')
        .replaceAll('8', 'b')
        .toLowerCase();
    
    const test2 = test1.replaceAll(/(\w)\1+/g, '$1');

    if (badWords.some(value => test1.includes(value) || test2.includes(value))) {
        return true;
    }

    return false;
}

module.exports = {
    name: 'messageCreate',
    execute(interaction, client) {
        if (interaction.author.bot) return;

        if (interaction.author.id == "689388928608108588" && Math.random() < .2) {
            interaction.react("🤡");
        }

        if (hasCurseWords(interaction.content, client.badWords)) {
            interaction.reply("We don't use curse words here! :slight_smile:");
            // TODO: Strike author and mute them upon 3 violations!
        }
    },
};
