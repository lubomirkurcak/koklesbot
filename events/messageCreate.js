module.exports = {
    name: 'messageCreate',
    execute(message) {
        if (message.author.bot) return;
        message.client.messageHooks.forEach(hook => hook.execute(message));
        message.client.messageCreateHooks.forEach(callback => callback(message));
    },
};
