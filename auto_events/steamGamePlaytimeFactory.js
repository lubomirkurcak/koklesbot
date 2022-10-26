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
function steamGamePlayTimeFactory(appId, embedSideColor) {
    return {
        get: async function (steamId) {
            return await getGameData(steamId, appId);
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

            const embed = new EmbedBuilder()
                .setTitle(game.name)
                .setDescription('To participate use \`/set user steam\`')
                .setURL('https://www.youtube.com/watch?v=dQw4w9WgXcQ')
                .setColor(embedSideColor)
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
    };
}

module.exports = {
    factory(appId, embedSideColor) {
        return async function (client, guildId, job, interaction = null) {
            const guild = await client.guilds.fetch(guildId);
            const channel = await guild.channels.fetch(job.channelId);

            const userIds = [];
            const requests = [];
            const steamIds = await client.db.getUserSteamIds(guildId);

            const action = steamGamePlayTimeFactory(appId, embedSideColor);

            for (const userId in steamIds) {
                userIds.push(userId);
                requests.push(action.get(steamIds[userId]));
            }

            const results = await Promise.allSettled(requests);

            const fulfilled = zip(results, userIds)
                .filter(value => value[0].status === 'fulfilled')
                .map(value => {
                    const result = value[0].value;
                    result.userId = value[1];
                    return result;
                });

            action.process(guild, channel, fulfilled, interaction);
        };
    },
}
