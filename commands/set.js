const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, userMention } = require('discord.js');

async function searchSteamId(query) {
    const response = await fetch(`${process.env.CSGO_API_URL}/search?platform=steam&query=${query}`, {
        headers: {
            'TRN-Api-Key': process.env.CSGO_API_KEY,
            'Accept': 'application/json',
            'Accept-Encoding': 'gzip',
        },
    });

    const obj = await response.json();
    if (obj.data.length > 0) {
        return obj.data[0].platformUserId;
    }

    return null;
}

async function getSteamPlayerSummary(steamId) {
    const response = await fetch(`https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${process.env.STEAM_WEBAPI_KEY}&steamids=${steamId}`);
    const obj = await response.json();
    if (obj.response.players.length > 0) {
        return obj.response.players[0];
    }
    return null;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('set')
        .setDescription('Set settings!')
        .addSubcommandGroup(group => group
            .setName('user')
            .setDescription('Manage user settings!')
            .addSubcommand(subcommand => subcommand
                .setName('steam')
                .setDescription('Set user\'s Steam ID')
                .addUserOption(option => option.setName('member')
                    .setDescription('Choose member.')
                    .setRequired(true)
                )
                .addStringOption(option => option.setName('id')
                    .setDescription('Set member\'s Steam ID.')
                    .setRequired(true)
                )
            )
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        const subcommandGroup = interaction.options.getSubcommandGroup();
        const subcommand = interaction.options.getSubcommand();

        if (subcommandGroup === 'user') {
            if (subcommand === 'steam') {
                const member = interaction.options.getUser('member');
                const id = interaction.options.getString('id');

                const steamId = await searchSteamId(id);
                if (!steamId) {
                    return interaction.reply({ content: `Steam ID was not found for '${id}'.`, ephemeral: true });
                }

                interaction.client.db.setUserSteamId(interaction.guildId, member.id, steamId);

                const player = await getSteamPlayerSummary(steamId);
                if (!player) {
                    return interaction.reply({ content: `Couldn't retrieve data from Steam WebAPI for Steam ID '${steamId}'.`, ephemeral: true });
                }

                const embed = new EmbedBuilder()
                    .setTitle(`${player.personaname} :flag_${player.loccountrycode.toLowerCase()}:`)
                    .setDescription(`Linked for ${userMention(member.id)}`)
                    .setURL(player.profileurl)
                    //.addFields({ name: 'Steam ID', value: player.steamid })
                    .setThumbnail(player.avatarfull)

                return interaction.reply({ embeds: [embed], ephemeral: false });
            }
        }
    },
};

