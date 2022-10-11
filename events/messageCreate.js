const { collapseDuplicateCharacters, simplifyString, onlyKeepAlphabetic } = require("../misc/shared");

function hasCurseWords(message, badWords) {
    const test1 = onlyKeepAlphabetic(simplifyString(message));
    const test2 = collapseDuplicateCharacters(test1);

    if (badWords.some(value => test1.includes(value) || test2.includes(value))) {
        return true;
    }

    return false;
}

module.exports = {
    name: 'messageCreate',
    execute(message) {
        if (message.author.bot) return;

        if (message.author.id == "689388928608108588" && Math.random() < .2) {
            message.react("🤡");
        }

        if (hasCurseWords(message.content, message.client.badWords)) {
            message.reply("We don't use curse words here! :slight_smile:");
            // TODO: Strike author and mute them upon 3 violations!
        }

        message.client.messageCreateHooks.forEach(callback => callback(message));
    },
};
