require('dotenv').config();
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');


async function getStats(platformUserIdentifier) {
    const result = {};
    const platform = 'steam';
    const url = `${process.env.CSGO_API_URL}/${platform}/${platformUserIdentifier}`;
    const response = await fetch(url, {
        headers: {
            'TRN-Api-Key': process.env.CSGO_API_KEY,
            'Accept': 'application/json',
            'Accept-Encoding': 'gzip',
        },
    });

    const obj = await response.json();
    result.name = obj.data.platformInfo.platformUserHandle;
    result.avatarUrl = obj.data.platformInfo.avatarUrl;

    ['timePlayed', 'matchesPlayed', 'wins', 'ties', 'losses', 'mvp']
        .forEach(value => {
            const stat = obj.data.segments[0].stats[value];
            result[value] = { name: stat.displayName, value: stat.value, displayValue: stat.displayValue };
        });

    return result;
}

let lastApiAccess = new Date(-8640000000000000);

module.exports = {
    cooldown: 1200000,
    data: new SlashCommandBuilder()
        .setName('cs')
        .setDescription('Displays Counter-Strike stats!'),
    async execute(interaction) {
        try {
            const now = new Date();
            if (now - lastApiAccess < this.cooldown) {
                return interaction.reply({ content: 'Too many recent calls!', ephemeral: true });
            }
            lastApiAccess = now;

            await interaction.deferReply();

            const requests = interaction.client.steamIds
                .map(value => getStats(value));
            Promise.allSettled(requests)
                .then(results => {

                    const ok = results
                        .filter(result => result.status === 'fulfilled')
                        .map(result => result.value)
                        .sort((a, b) => b.timePlayed.value - a.timePlayed.value);

                    const failed = results
                        .filter(result => result.status === 'rejected');
                    console.log(failed);

                    if (ok.length < 1) {
                        return;
                    }

                    const luckyNumber = Math.floor(Math.random() * ok.length);
                    const oks = ok.slice(0, Math.min(ok.length, 8));
                    console.log(`${luckyNumber} vs ${ok.length} vs ${oks.length} vs ${results.length}`);
                    const names = { name: 'Hrac', value: oks.map(value => value.name).join('\n'), inline: true };
                    const time = { name: 'Bojoval', value: oks.map(value => value.timePlayed.displayValue).join('\n'), inline: true };
                    const wins = { name: 'Vyhral', value: oks.map(value => value.wins.displayValue).join('\n'), inline: true };
                    // const losses = { name: 'Prejebal', value: ok.map(value => value.losses.displayValue).join('\n'), inline: true };
                    // const mvps = { name: 'MVP', value: ok.map(value => value.mvp.displayValue).join('\n'), inline: true };

                    const embed = new EmbedBuilder()
                        .setTitle('Counter-Strike: Global Statistics')
                        .setURL('https://www.youtube.com/watch?v=dQw4w9WgXcQ')
                        .setColor(0x990000)
                        .setDescription(`Dnes ma stastny den a potaha ${ok[luckyNumber].name} 🤡`)
                        .setThumbnail(ok[luckyNumber].avatarUrl)
                        .addFields(names)
                        .addFields(time)
                        .addFields(wins)
                        // .addFields(losses)
                        // .addFields(mvps)
                        .setTimestamp()
                        .setFooter({ text: 'kokles industries ©️ all rights reserved', iconURL: 'https://cdn.discordapp.com/avatars/1028334262656700506/82a584fbe99ad2a23bf53b7dd9d933ae' });

                    return interaction.editReply({ embeds: [embed] });
                });
        } catch (error) {
            console.error(error);
            return interaction.reply({ content: 'Command failed. :cry:', ephemeral: true });
        }
    },
};

