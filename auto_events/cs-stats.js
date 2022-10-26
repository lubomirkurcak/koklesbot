const { userMention } = require('discord.js');
const { EmbedBuilder } = require("@discordjs/builders");
const { zip, resizeArray } = require("../misc/shared");

// @note:
// {
//     "response": {
//         "game_count": 1,
//         "games": [
//             {
//                 "appid": 252950,
//                 "name": "Rocket League",
//                 "playtime_2weeks": 343,
//                 "playtime_forever": 56274,
//                 "img_icon_url": "9ad6dd3d173523354385955b5fb2af87639c4163",
//                 "has_community_visible_stats": true,
//                 "playtime_windows_forever": 52511,
//                 "playtime_mac_forever": 0,
//                 "playtime_linux_forever": 0,
//                 "rtime_last_played": 1666324573
//             }
//         ]
//     }
// }
async function getGamesData(steamId, steamAppIds = [730, 252950]) {
    const inputJson = {
        steamid: steamId,
        include_appinfo: true,
        include_played_free_games: true,
        appids_filter: steamAppIds,
    };
    const encoded = encodeURIComponent(JSON.stringify(inputJson));
    const response = await fetch(`https://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=${process.env.STEAM_WEBAPI_KEY}&format=json&input_json=${encoded}`);
    return await response.json();
}
async function getGameData(steamId, appId) {
    return (await getGamesData(steamId, [appId])).response.games[0];
}
async function getCSGOData(steamId) {
    return await getGameData(steamId, 730);
}
async function getRocketLeagueData(steamId) {
    return await getGameData(steamId, 252950);
}

async function getMapStats(steamId) {
    const response = await fetch(`${process.env.CSGO_API_URL}/profile/steam/${steamId}/segments/map`, {
        headers: {
            'TRN-Api-Key': process.env.CSGO_API_KEY,
            'Accept': 'application/json',
            'Accept-Encoding': 'gzip',
        },
    });
}

async function getWeaponStats(steamId) {
    const response = await fetch(`${process.env.CSGO_API_URL}/profile/steam/${steamId}/segments/weapon`, {
        headers: {
            'TRN-Api-Key': process.env.CSGO_API_KEY,
            'Accept': 'application/json',
            'Accept-Encoding': 'gzip',
        },
    });
}


const csgoPlayTime = {
    get: async function (steamId) {
        return await getCSGOData(steamId);
    },

    process: function (guild, channel, fulfilled, interaction = null) {
        const ok = fulfilled
            .filter(value => value.playtime_2weeks > 0)
            .sort((a, b) => b.playtime_2weeks - a.playtime_2weeks);

        if (ok.length < 1) return;

        if (!interaction) {
            channel.client.db.awardGuildDiscipline(guild.id, 'medal-1st', ok[0].userId, 1);
            if (ok.length >= 2) channel.client.db.awardGuildDiscipline(guild.id, 'medal-2nd', ok[1].userId, 1);
            if (ok.length >= 3) channel.client.db.awardGuildDiscipline(guild.id, 'medal-3rd', ok[2].userId, 1);
        }

        const game = ok[0];
        const gameIconUrl = `http://media.steampowered.com/steamcommunity/public/images/apps/${game.appid}/${game.img_icon_url}.jpg`;
        const oks = ok.slice(0, Math.min(ok.length, 8));
        const names = { name: 'Player', value: oks.map(value => userMention(value.userId)).join('\n'), inline: true };
        const time = { name: '2-Week Playtime', value: oks.map(value => `${(value.playtime_2weeks / 60).toFixed(1)}h`).join('\n'), inline: true };

        const rewardArray = ['🥇', '🥈', '🥉'];
        resizeArray(rewardArray, oks.length, '');
        const rewards = { name: 'Reward', value: rewardArray.join('\n'), inline: true };
        // const rocketLeagueColor = 0x009dff;
        const embed = new EmbedBuilder()
            .setTitle(game.name)
            .setDescription('To participate use \`/set user steam\`')
            .setURL('https://www.youtube.com/watch?v=dQw4w9WgXcQ')
            .setColor(0xff9100)
            .setThumbnail(gameIconUrl)
            .addFields(names)
            .addFields(time)
            .addFields(rewards)
            .setTimestamp()
            .setFooter({ text: '©️ kokles GmbH', iconURL: process.env.BOT_ICON_URL });

        const message = { embeds: [embed], ephemeral: true };

        if (interaction) {
            interaction.reply(message)
        } else {
            channel.send(message);
        }
    },
}

const generalStats = {
    get: async function (steamId) {
        const response = await fetch(`${process.env.CSGO_API_URL}/profile/steam/${steamId}`, {
            headers: {
                'TRN-Api-Key': process.env.CSGO_API_KEY,
                'Accept': 'application/json',
                'Accept-Encoding': 'gzip',
            },
        });

        const obj = await response.json();
        const result = {
            name: obj.data.platformInfo.platformUserHandle,
            avatarUrl: obj.data.platformInfo.avatarUrl,
        };

        ['timePlayed', 'matchesPlayed', 'wins', 'ties', 'losses', 'mvp']
            .forEach(value => {
                const stat = obj.data.segments[0].stats[value];
                result[value] = { name: stat.displayName, value: stat.value, displayValue: stat.displayValue };
            });

        return result;
    },

    process: function (guild, channel, fulfilled, interaction = null) {
        const ok = fulfilled.sort((a, b) => b.timePlayed.value - a.timePlayed.value);
        if (ok.length < 1) return;

        const luckyNumber = Math.floor(Math.random() * ok.length);
        const oks = ok.slice(0, Math.min(ok.length, 8));
        const names = { name: 'Hrac', value: oks.map(value => userMention(value.userId)).join('\n'), inline: true };
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
            .setFooter({ text: '©️ kokles LLC', iconURL: process.env.BOT_ICON_URL });

        const message = { embeds: [embed], ephemeral: true };

        if (interaction) {
            interaction.reply(message)
        } else {
            channel.send(message);
        }
    },
}

module.exports = {
    async execute(client, guildId, job, interaction = null) {
        const guild = await client.guilds.fetch(guildId);
        const channel = await guild.channels.fetch(job.channelId);

        const userIds = [];
        const requests = [];
        const steamIds = await client.db.getUserSteamIds(guildId);

        // const action = generalStats;
        const action = csgoPlayTime;

        for (const userId in steamIds) {
            userIds.push(userId);
            requests.push(action.get(steamIds[userId]));
        }

        const results = await Promise.allSettled(requests);

        // const fulfilled = results.filter(result => result.status === 'fulfilled').map(result => result.value);
        const fulfilled = zip(results, userIds)
            .filter(value => value[0].status === 'fulfilled')
            .map(value => {
                const result = value[0].value;
                result.userId = value[1];
                return result;
            });

        action.process(guild, channel, fulfilled, interaction);
    },
}