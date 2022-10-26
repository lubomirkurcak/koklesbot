const { CronJob } = require("cron");
const { jobTick } = require("../commands/auto");

module.exports = {
    name: 'ready',
    once: true,
    execute(client) {
        client.user.setActivity('🤡');
        console.log(`Ready! Logged in as ${client.user.tag}`);

        client.guilds.fetch().then(guilds => {
            guilds.forEach(guild => {
                client.db.getJob(guild.id, 'auto').then(job => {
                    if (job) {
                        const resources = client.getOrCreateGuildResources(guild.id);
                        const autoJob = new CronJob(job.schedule.cron, () => jobTick(client, guild.id), null, true, job.schedule.timezone);
                        resources.scheduledJobs.set('auto', autoJob);
                        console.log(`Started auto job for ${guild.name}`);
                    }
                }).catch(console.error);
            });
        });
    },
};
