module.exports = {
    unique: function (array) {
        return [...new Set(array)];
    },

    uniqueAndCounts: function (array, counts = {}) {
        array.forEach(element => {
            counts[element] = 1 + (counts[element] ?? 0);
        });
        return counts;
    },

    arraySum: function (array) {
        return array.reduce((acc, elem) => acc + elem, 0);
    },

    getRandomElement: function (array) {
        const index = Math.floor(array.length * Math.random());
        return array[index];
    },

    shuffleInplace: function (array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    },

    recursiveCollectLeafValues: function recursiveCollectLeafValues(data, key) {
        const results = [];
        for (const k in data) {
            if (typeof data[k] === 'object' && data[k] !== null) {
                results.push(...recursiveCollectLeafValues(data[k], key));
            } else if (k === key) {
                results.push(data[k]);
            }
        }
        return results;
    },

    collapseDuplicateCharacters: function (string) {
        return string.replaceAll(/(\w)\1+/g, '$1');
    },

    simplifyString: function (string) {
        return string
            .replaceAll(/\s+/g, '')
            .normalize('NFD').replace(/\p{Diacritic}/gu, '')
            .toLowerCase()
            .replaceAll('0', 'o')
            .replaceAll('1', 'i')
            .replaceAll('2', 'z')
            .replaceAll('3', 'e')
            .replaceAll('4', 'a')
            .replaceAll('5', 's')
            .replaceAll('7', 't')
            .replaceAll('8', 'b')
            .replaceAll('w', 'v')
            .replaceAll('j', 'i')
            .replaceAll('y', 'i');
    },

    onlyKeepAsciiAlphabetic: function (string) {
        return string.replace(/[^a-zA-Z]/g, '');
    },

    humanReadableTimeDuration(milliseconds) {
        const second = 1000;
        const minute = 60 * second;
        const hour = 60 * minute;
        const day = 24 * hour;

        let days = 0
        let hours = 0
        let minutes = 0
        let seconds = 0

        while (milliseconds > day) {
            days += 1;
            milliseconds -= day;
        }
        while (milliseconds > hour) {
            hours += 1;
            milliseconds -= hour;
        }
        while (milliseconds > minute) {
            minutes += 1;
            milliseconds -= minute;
        }
        while (milliseconds > second) {
            seconds += 1;
            milliseconds -= second;
        }

        if (days > 0) {
            return `${days} days`;
        } else if (hours > 0) {
            return `${hours} hours`;
        } else if (minutes > 0) {
            return `${minutes} minutes`;
        } else if (seconds > 0) {
            return `${seconds} seconds`;
        }

        return 'just now';
    },
};
