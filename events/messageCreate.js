module.exports = {
    name: 'messageCreate',
    execute(message) {
        if (message.author.bot) return;
        message.client.messageHooks.forEach(hook => hook.execute(message));

        const guildResources = message.client.getOrCreateGuildResources(message.guildId);
        guildResources.messageCreateHooks.forEach(callback => callback(message));
    },
};
