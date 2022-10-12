const { joinVoiceChannel, VoiceConnectionStatus, entersState, createAudioResource, getVoiceConnection, StreamType } = require('@discordjs/voice');
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
            .addChoices(
                { name: 'amongus', value: 'amongus.ogg' },
                { name: 'banned', value: 'banned.ogg' },
                { name: 'bruh', value: 'bruh.ogg' },
                { name: 'dog', value: 'dog.ogg' },
                //{ name: 'earrape', value: 'earrape.ogg' },
                { name: 'emotionaldamage', value: 'emotionaldamage.ogg' },
                { name: 'english', value: 'english.ogg' },
                { name: 'error', value: 'error.ogg' },
                { name: 'flute', value: 'flute.ogg' },
                { name: 'jam', value: 'jam.webm' },
                { name: 'jebaited', value: 'jebaited.ogg' },
                { name: 'minecraft', value: 'minecraft.ogg' },
                { name: 'okay', value: 'okay.ogg' },
                { name: 'oof', value: 'oof.ogg' },
                { name: 'risitas', value: 'risitas.ogg' },
                { name: 'running', value: 'running.ogg' },
                { name: 'sad', value: 'sad.ogg' },
                { name: 'shutup', value: 'shutup.ogg' },
                { name: 'sofunny', value: 'sofunny.ogg' },
                { name: 'to-be-continued', value: 'to-be-continued.ogg' },
                { name: 'triangle', value: 'triangle.webm' },
                { name: 'trumpet', value: 'trumpet.ogg' },
                { name: 'ty-kokot', value: 'ty-kokot.ogg' },
                { name: 'vpici', value: 'vpici.ogg' },
                { name: 'wideputin', value: 'wideputin.ogg' },
                { name: 'wow', value: 'wow.ogg' },
            )
        )
        .addChannelOption(option => option
            .setName('channel')
            .setDescription('The channel to play the sound in.')
            .addChannelTypes(ChannelType.GuildVoice))
    ,
    async execute(interaction) {
        try {
            const channel = interaction.options.getChannel('channel') ?? interaction.member.voice.channel;
            if (!channel) {
                return interaction.reply({ content: `Join a voice channel or specify target channel to play a sound! :musical_note:`, ephemeral: true });
            }
            const audioPlayer = interaction.client.getGuildAudioPlayer(interaction.guildId);

            let connection = getVoiceConnection(channel.guildId);
            if (connection && connection.joinConfig.channelId == channel.id) {
                // reuse
            } else {
                connection = joinVoiceChannel({
                    channelId: channel.id,
                    guildId: channel.guildId,
                    adapterCreator: channel.guild.voiceAdapterCreator,
                });

                connection.on(VoiceConnectionStatus.Disconnected, async (oldState, newState) => {
                    try {
                        await Promise.race([
                            entersState(connection, VoiceConnectionStatus.Signalling, 5_000),
                            entersState(connection, VoiceConnectionStatus.Connecting, 5_000),
                        ]);
                    } catch (error) {
                        connection.destroy();
                    }
                });

                connection.subscribe(audioPlayer);
            }

            const sound = interaction.options.getString('sound');
            const inputType = sound.endsWith('.ogg') ? StreamType.OggOpus : sound.endsWith('.webm') ? StreamType.WebmOpus : undefined;
            const resource = createAudioResource(createReadStream(join(__dirname, `../assets/${sound}`)), inputType);
            audioPlayer.play(resource);

            return interaction.reply({ content: `:sound: ${sound}`, ephemeral: true });
        } catch (error) {
            console.error(error);
            return interaction.reply({ content: 'Command failed. :cry:', ephemeral: true });
        }
    },
};
