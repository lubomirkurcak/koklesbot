const { joinVoiceChannel, VoiceConnectionStatus, entersState, createAudioResource, getVoiceConnection, StreamType } = require('@discordjs/voice');
const { SlashCommandBuilder, ChannelType } = require('discord.js');
const { createReadStream } = require('node:fs');
const { join } = require('node:path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('radio')
        .setDescription('Tune in to the radio!')
        .addStringOption(option => option.setName('channel')
            .setDescription('Choose the radio frequency!')
            .setRequired(true)
            .addChoices(
                { name: process.env.RADIO1, value: 'radio1' },
            ),
        ),

    async execute(interaction) {
        try {
            const channel = interaction.member.voice.channel;
            if (!channel) {
                return interaction.reply({ content: 'Join a voice channel to play radio in! :musical_note:', ephemeral: true });
            }
            const audioPlayer = interaction.client.radioPlayer;

            let connection = getVoiceConnection(channel.guildId);
            if (false && connection && connection.joinConfig.channelId == channel.id) {
                // reuse
            } else {
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
                            console.log(error2);
                        }
                    }
                });
            }

            connection.subscribe(audioPlayer);

            return interaction.reply({ content: `:sound: ${process.env.RADIO1}`, ephemeral: false });
        } catch (error) {
            console.error(error);
            return interaction.reply({ content: 'Command failed. :cry:', ephemeral: true });
        }
    },
};
