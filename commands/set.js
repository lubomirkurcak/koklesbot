const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, userMention } = require('discord.js');

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
                const steamId = interaction.options.getString('id');

                const player = await getSteamPlayerSummary(steamId);
                if (!player) {
                    return interaction.reply({ content: `Couldn't retrieve data from Steam Web API for Steam ID '${steamId}'.`, ephemeral: true });
                }

                interaction.client.db.setUserSteamId(interaction.guildId, member.id, steamId);

                const embed = new EmbedBuilder()
                    .setTitle(`${player.personaname} :flag_${player.loccountrycode.toLowerCase()}:`)
                    .setDescription(`Linked for ${userMention(member.id)}`)
                    .setURL(player.profileurl)
                    .setThumbnail(player.avatarfull)

                return interaction.reply({ embeds: [embed], ephemeral: false });
            }
        }
    },
};

