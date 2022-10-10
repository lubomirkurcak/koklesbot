const { SlashCommandBuilder, ChannelType } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('move')
        .setDescription('Move members from your current voice channel to another.')
        .addChannelOption(option => option
            .setName('channel')
            .setDescription('The channel to move users to')
            .setRequired(true)
            .addChannelTypes(ChannelType.GuildVoice))
        .addStringOption(option => option
            .setName('users')
            .setDescription('Move only specific @mentioned users'))
    ,
    async execute(interaction) {
        try {
            const targetChannel = interaction.options.getChannel('channel');
            const specificUsers = interaction.options.getString('users');

            if (specificUsers) {
                const matches = specificUsers.match(/<@(\w*)>/g);
                matches.forEach(match => {
                    match = match.slice(2, -1);
                    interaction.guild.members.fetch(match)
                        .then(member => member.voice.setChannel(targetChannel))
                        .catch(error => console.error(error));
                });
                return interaction.reply({ content: `Moved ${matches.length} members.`, ephemeral: true });
            } else {
                const members = interaction.member.voice.channel.members;
                members.forEach(member => {
                    member.voice.setChannel(targetChannel);
                });
                return interaction.reply({ content: `Moved ${members.size} members.`, ephemeral: true });
            }

        } catch (error) {
            console.error(error);
            return interaction.reply({ content: 'Command failed. :cry:', ephemeral: true });
        }
    },
};

