const { getRandomElement, recursiveCollectLeafValues, unique, simplifyString, collapseDuplicateCharacters } = require('../misc/shared.js');
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

function simplifyCountryName(value) {
    return collapseDuplicateCharacters(simplifyString(value))
}

async function getRandomCountry() {
    const codesUrl = "https://restcountries.com/v3/all?fields=cca2";
    const codesResp = await fetch(codesUrl);
    const codes = await codesResp.json();
    const code = getRandomElement(codes).cca2;
    const countriesUrl = `https://restcountries.com/v3.1/alpha/${code}`;
    const country = (await (await fetch(countriesUrl)).json())[0];

    const emoji = country.flag;
    const flag = country.flags.png;
    const commonNames = unique(
        recursiveCollectLeafValues(country, 'common')
            .map(value => simplifyCountryName(value))
    );

    return { emoji, flag, commonNames };
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('guess')
        .setDescription('Guess quicker than others!')
        .addStringOption(option => option.setName('style')
            .setDescription('Choose display style.')
            .addChoices(
                { name: 'Small', value: 'Small' },
                { name: 'Big', value: 'Big' },
            ))
    ,
    async execute(interaction) {
        getRandomCountry()
            .then(result => {
                const embed = new EmbedBuilder()
                    .setTitle(`${result.emoji} Guess the country! ${result.emoji}`)
                    .setDescription('Guess the name of the country before others!')
                    .setTimestamp()
                    .setFooter({ text: 'kokles industries ©️ all rights reserved', iconURL: 'https://cdn.discordapp.com/avatars/1028334262656700506/82a584fbe99ad2a23bf53b7dd9d933ae' })

                const style = interaction.options.getString('style');
                if (style === 'Small') {
                    embed.setThumbnail(result.flag)
                } else {
                    embed.setImage(result.flag)
                }

                interaction.reply({ embeds: [embed] });

                const token = new Date();
                interaction.client.messageCreateHooks.set(token, message => {
                    const simplified = simplifyCountryName(message.content);
                    if (result.commonNames.includes(simplified)) {
                        message.react("🏆");
                        message.reply('Congratulations! You were the first to guess!');
                        interaction.client.messageCreateHooks.delete(token);
                    }
                });
            })
            .catch(error => console.log(error));
    },
};
