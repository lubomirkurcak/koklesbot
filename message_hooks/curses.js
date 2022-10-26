const { badWords } = require('../config');
const { onlyKeepAsciiAlphabetic, collapseDuplicateCharacters, simplifyString } = require('../misc/shared');

function hasCurseWords(message) {
    const test1 = onlyKeepAsciiAlphabetic(simplifyString(message));
    const test2 = collapseDuplicateCharacters(test1);

    if (badWords.some(value => test1.includes(value) || test2.includes(value))) {
        return true;
    }

    return false;
}

module.exports = {
    execute(message) {
        if (hasCurseWords(message.content)) {
            message.react('🐷');
            message.client.db.awardGlobalDiscipline('curses', message.author.id, 1);
        }
    },
};
