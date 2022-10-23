const { SlashCommandBuilder, EmbedBuilder, ButtonStyle, ActionRowBuilder, ButtonBuilder, userMention, PermissionFlagsBits } = require('discord.js');
const { humanReadableTimeDuration } = require('../misc/shared');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('predictions')
        .setDescription('Show upcoming matches and let members make outcome predictions!')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction) {
        const admin = '179973930956619776';
        const clown = '689388928608108588';
        if (interaction.member.id != admin) {
            return interaction.reply({ content: `Only Authorized Personnel may use this command. Contact ${userMention(clown)} if you believe this to be in error.`, ephemeral: true, });
        }

        await interaction.deferReply();

        const response = await fetch(process.env.LOLSCHEDULE_API_URL, {
            headers: {
                'x-api-key': process.env.LOLSCHEDULE_API_KEY,
            }
        });

        const obj = await response.json();
        const unstarted = obj.data.schedule.events
            .filter(event => event.state === 'unstarted')
            .filter(event => (event.match.teams[0].name !== 'TBD' && event.match.teams[1].name !== 'TBD'));
        //console.log(unstarted);

        const guildResources = interaction.client.getOrCreateGuildResources(interaction.guildId);

        for (let i = 1; i < 6; ++i) {
            const event = unstarted[i];
            const id = event.match.id;
            const team1 = event.match.teams[0];
            const team2 = event.match.teams[1];
            const startsAt = Date.parse(event.startTime);
            const timeLeft = startsAt - Date.now();

            const team1Button = `lol-${id}-team1`;
            const team2Button = `lol-${id}-team2`;
            const infoButton = `lol-${id}-info`;
            //const optOutButton = 'lol-optout';

            guildResources.registeredButtons.set(infoButton, interaction => {
                const embed1 = new EmbedBuilder()
                    // .setColor(0xD8BF73)
                    .setColor(0xD81212)
                    .setTitle(team1.name)
                    .setThumbnail(team1.image)
                    .addFields({ name: 'Wins', value: `${team1.record.wins}` }, { name: 'Losses', value: `${team1.record.losses}` },)
                    ;
                const embed2 = new EmbedBuilder()
                    // .setColor(0xD8BF73)
                    .setColor(0xD81212)
                    .setTitle(team2.name)
                    .setThumbnail(team2.image)
                    .addFields({ name: 'Wins', value: `${team2.record.wins}` }, { name: 'Losses', value: `${team2.record.losses}` },)
                    ;
                interaction.reply({ embeds: [embed1, embed2], ephemeral: true });
            });

            guildResources.registeredButtons.set(team1Button, interaction => {
                if (Date.now() < startsAt) {
                    interaction.client.db.setPrediction(interaction.member.id, id, 1);
                    interaction.reply({ content: 'Prediction saved. ✅', ephemeral: true })
                } else {
                    interaction.reply({ content: 'Too late! The event has already begun.', ephemeral: true })
                }
            });
            guildResources.registeredButtons.set(team2Button, interaction => {
                if (Date.now() < startsAt) {
                    interaction.client.db.setPrediction(interaction.member.id, id, 2);
                    interaction.reply({ content: 'Prediction saved. ✅', ephemeral: true })
                } else {
                    interaction.reply({ content: 'Too late! The event has already begun.', ephemeral: true })
                }
            });

            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId(team1Button)
                        .setLabel(team1.name)
                        .setStyle(ButtonStyle.Primary),
                    new ButtonBuilder()
                        .setCustomId(team2Button)
                        .setLabel(team2.name)
                        .setStyle(ButtonStyle.Success),
                    new ButtonBuilder()
                        .setCustomId(infoButton)
                        .setLabel('Info')
                        .setStyle(ButtonStyle.Secondary),
                );

            const embed = new EmbedBuilder()
                // .setColor(0xD8BF73)
                .setColor(0xD81212)
                .setTitle(`${team1.name} vs ${team2.name}`)
                .setURL('https://lolesports.com/')
                .setDescription(`Upcoming ${event.league.name} ${event.blockName} match.\nPlace your winning team prediction.`)
                .setThumbnail('https://seeklogo.com/images/L/league-of-legends-logo-13AAC5B212-seeklogo.com.png')
                .setTimestamp(startsAt)
                ;

            const channel = interaction.channel;
            channel.send({ embeds: [embed], components: [row] });
        }

        const predictionUsers = interaction.client.db.getPredictionUsers();
        const array = [];
        for (const elem in predictionUsers) {
            if (predictionUsers[elem]) {
                array.push(`<@${elem}>`);
            }
        }
        interaction.editReply({ content: `New upcoming matches! ${array.join(' ')}`, ephemeral: false });
    },
};

