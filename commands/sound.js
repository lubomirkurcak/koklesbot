const { joinVoiceChannel, VoiceConnectionStatus, entersState, createAudioResource, getVoiceConnection, StreamType, AudioPlayerStatus, createAudioPlayer } = require('@discordjs/voice');
const { SlashCommandBuilder, ChannelType } = require('discord.js');
const { createReadStream } = require('node:fs');
const { join } = require('node:path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('sound')
        .setDescription('Plays a sound!')
        .addStringOption(option => option.setName('sound')
            .setDescription('The sound to play.')
            .setRequired(true)
            .setAutocomplete(true),
        )
        .addChannelOption(option => option
            .setName('channel')
            .setDescription('The channel to play the sound in.')
            .addChannelTypes(ChannelType.GuildVoice)),

    async autocomplete(interaction) {
        function dictionarize(value) {
            return { name: value, value: value };
        }

        const focusedOption = interaction.options.getFocused(true);
        const options = (await interaction.client.db.getUserSounds(interaction.member.id))
            .filter(value => value.startsWith(focusedOption.value))
            .map(value => dictionarize(value));
        return interaction.respond(options).catch(console.error);
    },

    async execute(interaction) {
        try {
            const sound = interaction.options.getString('sound');
            const hasSound = (await interaction.client.db.getUserSounds(interaction.member.id)).includes(sound);
            if (!hasSound) {
                return interaction.reply({ content: 'You don\'t own that sound. :cry:', ephemeral: true });
            }

            const channel = interaction.options.getChannel('channel') ?? interaction.member.voice.channel;
            if (!channel) {
                return interaction.reply({ content: 'Join a voice channel or specify target channel to play a sound! :musical_note:', ephemeral: true });
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

            const audioPlayer = createAudioPlayer();
            audioPlayer.on(AudioPlayerStatus.Idle, () => {
                audioPlayer.stop();
            });
            connection.subscribe(audioPlayer);

            // const inputType = sound.endsWith('.ogg') ? StreamType.OggOpus : sound.endsWith('.webm') ? StreamType.WebmOpus : undefined;
            const inputType = StreamType.OggOpus;
            const resource = createAudioResource(createReadStream(join(__dirname, `../assets/sounds/${sound}.ogg`)), inputType);
            audioPlayer.play(resource);

            return interaction.reply({ content: `:sound: ${sound}`, ephemeral: false });
        } catch (error) {
            console.error(error);
            return interaction.reply({ content: 'Command failed. :cry:', ephemeral: true });
        }
    },
};
