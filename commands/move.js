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
            .setDescription('Move only specific @mentioned users')),

    async execute(interaction) {
        try {
            const targetChannel = interaction.options.getChannel('channel');
            const specificUsers = interaction.options.getString('users');

            if (specificUsers) {
                specificUsers.match(/<@\w+>/g).forEach(match => {
                    interaction.guild.members.fetch(match.slice(2, -1))
                        .then(member => member.voice.setChannel(targetChannel))
                        .catch(error => console.error(error));
                });
            } else {
                Promise.allSettled(interaction.member.voice.channel.members.map(member => member.voice.setChannel(targetChannel)));
            }

            await interaction.reply(':heavy_check_mark:');
            return interaction.deleteReply();
        } catch (error) {
            console.error(error);
            return interaction.reply({ content: 'Command failed. :cry:', ephemeral: true });
        }
    },
};

