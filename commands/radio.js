const { joinVoiceChannel, VoiceConnectionStatus, entersState, getVoiceConnection } = require('@discordjs/voice');
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('radio')
        .setDescription('Tune in to the radio!')
        .addStringOption(option => option.setName('frequency')
            .setDescription('Choose the radio frequency!')
            .setRequired(true)
            .addChoices(
                { name: process.env.RADIO1, value: 'radio1' },
                // { name: process.env.RADIO2, value: 'radio2' },
            ),
        ),

    async execute(interaction) {
        try {
            const channel = interaction.member.voice.channel;
            if (!channel) {
                return interaction.reply({ content: 'Join a voice channel to play radio in! :musical_note:', ephemeral: true });
            }

            let connection = getVoiceConnection(interaction.guildId);
            if (connection && connection.joinConfig.channelId != channel.id) {
                connection.destroy();
                connection = null;
            }
            if (!connection) {
                connection = joinVoiceChannel({
                    channelId: channel.id,
                    guildId: channel.guildId,
                    adapterCreator: channel.guild.voiceAdapterCreator,
                });
                connection.on(VoiceConnectionStatus.Disconnected, async () => {
                    try {
                        await Promise.race([
                            entersState(connection, VoiceConnectionStatus.Signalling, 5_000),
                            entersState(connection, VoiceConnectionStatus.Connecting, 5_000),
                        ]);
                    } catch (error) {
                        try {
                            connection.destroy();
                        } catch (error2) {
                            (error2);
                        }
                    }
                });
            }

            const frequency = interaction.options.getString('frequency');
            connection.subscribe(interaction.client.radios.get(frequency));

            if (frequency === 'radio1') {
                return interaction.reply({ content: `:sound: ${process.env.RADIO1}`, ephemeral: false });
            } else {
                return interaction.reply({ content: `:sound: ${process.env.RADIO2}`, ephemeral: false });
            }
        } catch (error) {
            console.error(error);
            return interaction.reply({ content: 'Command failed. :cry:', ephemeral: true });
        }
    },
};
