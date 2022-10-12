const { onlyKeepAsciiAlphabetic, collapseDuplicateCharacters, simplifyString } = require("../misc/shared");

function hasCurseWords(message, badWords) {
    const test1 = onlyKeepAsciiAlphabetic(simplifyString(message));
    const test2 = collapseDuplicateCharacters(test1);

    if (badWords.some(value => test1.includes(value) || test2.includes(value))) {
        return true;
    }

    return false;
}

module.exports = {
    execute(message) {
        if (hasCurseWords(message.content, message.client.badWords)) {
            message.reply("We don't use curse words here! :slight_smile:");
        }
    }
}
