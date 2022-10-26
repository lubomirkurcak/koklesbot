module.exports = {
    zip: (a, b) => a.map((k, i) => [k, b[i]]),

    unique: array => [...new Set(array)],

    uniqueAndCounts(array, counts = {}) {
        array.forEach(element => {
            counts[element] = 1 + (counts[element] ?? 0);
        });
        return counts;
    },

    arraySum: array => array.reduce((acc, elem) => acc + elem, 0),

    getRandomElement: array => array[Math.floor(array.length * Math.random())],

    resizeArray(array, size, defaultValue) {
        let delta = array.length - size;
        if (delta > 0) {
            array.length = size;
        } else {
            while (delta++ < 0) { array.push(defaultValue); }
        }
    },

    shuffleInplace(array) {
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

    collapseDuplicateCharacters: string => string.replaceAll(/(\w)\1+/g, '$1'),

    simplifyString: string => string
        .replaceAll(/\s+/g, '')
        .normalize('NFD').replaceAll(/\p{Diacritic}/gu, '')
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
        .replaceAll('y', 'i'),

    onlyKeepAsciiAlphabetic: string => string.replaceAll(/[^a-zA-Z]/g, ''),

    removeSpecialCharacters: string => string.replaceAll(/[&\/\\#,+()$~%.'":*?<>{}]/g, ''),
};
