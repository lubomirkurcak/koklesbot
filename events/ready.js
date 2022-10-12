module.exports = {
    name: 'ready',
    once: true,
    execute(client) {
        client.user.setActivity('🤡');
        console.log(`Ready! Logged in as ${client.user.tag}`);
    },
};
