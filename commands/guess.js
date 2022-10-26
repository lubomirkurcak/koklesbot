const { getRandomElement, recursiveCollectLeafValues, unique, simplifyString, collapseDuplicateCharacters, removeSpecialCharacters } = require('../misc/shared');
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

function simplifyCountryName(value) {
    return collapseDuplicateCharacters(simplifyString(removeSpecialCharacters(value)));
}

async function getRandomCountry() {
    const codesUrl = `${process.env.COUNTRIES_API}/all?fields=cca2`;
    const codesResp = await fetch(codesUrl);
    const codes = await codesResp.json();
    let code;
    do {
        code = getRandomElement(codes).cca2;
    } while (['um', 'hm', 'bv'].includes(code.toLowerCase()));
    const countriesUrl = `${process.env.COUNTRIES_API}/alpha/${code}`;
    const country = (await (await fetch(countriesUrl)).json())[0];

    const emoji = country.flag;
    const flag = country.flags.png;
    const commonNames = unique(recursiveCollectLeafValues(country, 'common').map(value => simplifyCountryName(value)));

    return { emoji, flag, commonNames };
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('guess')
        .setDescription('Guess country flag quicker than others!')
        .addStringOption(option => option.setName('action')
            .setDescription('The sound to play.')
            .addChoices(
                { name: 'flag', value: 'flag' },
                { name: 'rankings', value: 'rankings' },
            ),
        ),

    async execute(interaction) {
        const action = interaction.options.getString('action');
        if (action === 'rankings') {
            const [names, wins] = await interaction.client.db.getTopUserFlagWins(6, interaction.member.id);
            const embed = new EmbedBuilder()
                .setTitle(':trophy: Most correct guesses! :trophy:')
                .setURL('https://www.youtube.com/watch?v=dQw4w9WgXcQ')
                .addFields(names)
                .addFields(wins)
                .setTimestamp()
                .setFooter({ text: '©️ kokles Inc.', iconURL: process.env.BOT_ICON_URL });

            return interaction.reply({ embeds: [embed] });
        } else {
            getRandomCountry()
                .then(result => {
                    const embed = new EmbedBuilder()
                        .setTitle(`${result.emoji} Guess the country! ${result.emoji}`)
                        .setDescription('Guess the name of the country before others!')
                        .setTimestamp()
                        .setFooter({ text: '©️ kokles industries️', iconURL: process.env.BOT_ICON_URL })
                        .setImage(result.flag);

                    interaction.reply({ embeds: [embed] });

                    const guildResources = interaction.client.getOrCreateGuildResources(interaction.guildId);
                    guildResources.messageCreateHooks.set('guess', message => {
                        const simplified = simplifyCountryName(message.content);
                        if (result.commonNames.includes(simplified)) {
                            message.react('🏆');
                            message.reply('Congratulations! You were the first to guess!');
                            guildResources.messageCreateHooks.delete('guess');
                            interaction.client.db.awardUserFlagWin(interaction.member.id);
                        }
                    });
                })
                .catch(error => console.log(error));
        }
    },
};
