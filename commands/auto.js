const fs = require('node:fs');
const path = require('node:path');
const { SlashCommandBuilder, userMention, EmbedBuilder, channelMention } = require('discord.js');
const { timezones } = require('../config');
const CronJob = require('cron').CronJob;
const { getRandomElement } = require('../misc/shared');

const autoEvents = new Map();
const autoEventsPath = path.join(__dirname, '../auto_events');
const autoEventFiles = fs.readdirSync(autoEventsPath).filter(file => file.endsWith('.js'));

for (const file of autoEventFiles) {
    const filePath = path.join(autoEventsPath, file);
    const autoEvent = require(filePath);
    const name = path.parse(filePath).name;
    autoEvents.set(name, autoEvent);
}

function americanize(hour) {
    if (hour === 0) {
        return '12 midnight';
    } else if (hour < 12) {
        return `${hour} am`;
    } else if (hour === 12) {
        return '12 noon';
    } else {
        return `${hour - 12} pm`;
    }
}

function getTimeOptions() {
    return [...Array(24).keys()].map((_, i) => { return { name: `${i}:00  (${americanize(i)})`, value: i } });
}

function getEventOptions() {
    return [
        { name: 'All', value: 'all' },
        { name: 'Necyklopedia Fakty (🇸🇰/🇨🇿)', value: 'necyklopedia' },
        { name: 'Counterstrike Stats', value: 'cs-stats' },
        // { name: 'Piggy Leaderboards', value: 'piggy' },
    ];
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('auto')
        .setDescription('Setup automated events.')
        .addSubcommand(subcommand => subcommand
            .setName('info')
            .setDescription('Show automated events information.')
        )
        .addSubcommand(subcommand => subcommand
            .setName('time')
            .setDescription('Setup automated events schedule.')
            .addIntegerOption(option => option.setName('hour')
                .setDescription('Choose hour of day to trigger events at.')
                .setRequired(true)
                .addChoices(...getTimeOptions())
            )
            .addStringOption(option => option.setName('timezone')
                .setDescription('Choose your timezone.')
                .setRequired(true)
                .setAutocomplete(true)
            )
        )
        .addSubcommand(subcommand => subcommand
            .setName('cron')
            .setDescription('[ADMIN] Setup automated events schedule with a cron string.')
            .addStringOption(option => option.setName('cron')
                .setDescription('Specify a cron string to trigger events at.')
                .setRequired(true)
            )
            .addStringOption(option => option.setName('timezone')
                .setDescription('Choose your timezone.')
                .setRequired(true)
                .setAutocomplete(true)
            )
        )
        .addSubcommand(subcommand => subcommand
            .setName('trigger')
            .setDescription('[ADMIN] Trigger automated events now.')
        )
        .addSubcommand(subcommand => subcommand
            .setName('enable')
            .setDescription('Enable automated events.')
            .addStringOption(option => option.setName('event')
                .setDescription('Enable automated event.')
                .addChoices(...getEventOptions())
            )
        )
        .addSubcommand(subcommand => subcommand
            .setName('disable')
            .setDescription('Disable automated events.')
            .addStringOption(option => option.setName('event')
                .setDescription('Disable automated event.')
                .addChoices(...getEventOptions())
            )
        )
    ,

    jobTick: async function jobTick(client, guildId, interaction = null) {
        const job = await client.db.getJob(guildId, 'auto');

        const enabledEvents = [];
        for (const k in job.data) {
            if (job.data[k]) {
                enabledEvents.push(k);
            }
        }

        if (enabledEvents.length === 0) return;

        const selectedEvent = getRandomElement(enabledEvents);

        const event = autoEvents.get(selectedEvent);
        if (event) {
            event.execute(client, guildId, job, interaction);
        } else {
            console.log(`Unknown event: '${selectedEvent}'`);
        }
    },

    async autocomplete(interaction) {
        const focusedOption = interaction.options.getFocused(true);
        //const options = Intl.supportedValuesOf('timeZone')
        const options = timezones
            .filter(value => value.toLowerCase().includes(focusedOption.value.toLowerCase()))
            .map(value => {
                return { name: value.replaceAll('/', ', ').replaceAll('_', ' '), value: value }
            });
        options.length = Math.min(options.length, 25);
        return interaction.respond(options).catch(console.error);
    },

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();

        if (subcommand === 'info') {
            const job = await interaction.client.db.getJob(interaction.guildId, 'auto');

            const fields = getEventOptions().filter(value => value.value !== 'all').map(value => {
                return { name: value.name, value: job.data[value.value] ? '☑️ Enabled' : '🛑 Disabled' };
            })

            const descriptionData = [
                `Target channel ${channelMention(job.channelId)}`,
                `Last change by ${userMention(job.lastChange.by)}`,
            ];

            const embed = new EmbedBuilder()
                .setTitle('Automated Events Info')
                .setColor(0x000099)
                .setDescription(descriptionData.join('\n'))
                .addFields(...fields)
                .setFooter({ text: 'Last change' })
                .setTimestamp(job.lastChange.at);

            return interaction.reply({ embeds: [embed], ephemeral: true });
        } else if (subcommand === 'trigger') {
            if (interaction.member.id === process.env.ADMIN_ID) {
                return this.jobTick(interaction.client, interaction.guildId, interaction);
            } else {
                return interaction.reply({ content: 'Insufficient permissions.', ephemeral: true });
            }
        } else if (subcommand === 'time' || subcommand === 'cron') {
            if (subcommand === 'cron' && interaction.member.id !== process.env.ADMIN_ID) {
                return interaction.reply({ content: 'Insufficient permissions.', ephemeral: true });
            }

            const hour = interaction.options.getInteger('hour');
            const cron = interaction.options.getString('cron');
            const cronSchedule = cron ? `0 ${cron}` : `0 0 ${hour} * * *`;
            const timezone = interaction.options.getString('timezone');

            const resources = interaction.client.getOrCreateGuildResources(interaction.guildId);
            if (resources.scheduledJobs.has('auto')) {
                resources.scheduledJobs.get('auto').stop();
            }

            const client = interaction.client;
            const guildId = interaction.guildId;

            const autoJob = new CronJob(cronSchedule, () => this.jobTick(client, guildId), null, true, timezone);

            resources.scheduledJobs.set('auto', autoJob);

            interaction.client.db.setJobChannel(interaction.guildId, 'auto', interaction.channelId);
            interaction.client.db.setJobSchedule(interaction.guildId, 'auto', { cron: cronSchedule, timezone: timezone, });
            interaction.client.db.setJobLastChange(interaction.guildId, 'auto', interaction.user.id);

            return interaction.reply({ content: 'Job created.', ephemeral: true });
        } else if (subcommand === 'enable' || subcommand === 'disable') {
            const event = interaction.options.getString('event');
            const state = subcommand === 'enable';

            if (event === 'all') {
                getEventOptions()
                    .map(value => value.value)
                    .filter(value => value !== 'all')
                    .forEach(value => interaction.client.db.setJobData(interaction.guildId, 'auto', value, state));
            } else {
                interaction.client.db.setJobData(interaction.guildId, 'auto', event, state);
            }
            interaction.client.db.setJobLastChange(interaction.guildId, 'auto', interaction.user.id);

            return interaction.reply({ content: 'Operation executed.', ephemeral: true });
        }

        console.warn(`Unsupported subcommand: ${subcommand}`);
    },
};
