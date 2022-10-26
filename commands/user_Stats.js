const { ContextMenuCommandBuilder, ApplicationCommandType, userMention } = require('discord.js');

module.exports = {
    data: new ContextMenuCommandBuilder()
        .setName('Stats')
        .setType(ApplicationCommandType.User),
    async execute(interaction) {
        const userId = interaction.targetId;
        interaction.client.db.addFollower(userId, interaction.user.id);

        const promises = [
            interaction.client.db.getUserFlagWins(userId),
            interaction.client.db.getUserCoins(userId),
            interaction.client.db.getGlobalDiscipline('curses', userId),
            interaction.client.db.getFollowerCount(userId),
            interaction.client.db.getGuildDiscipline(interaction.guildId, 'medal-1st', userId),
            interaction.client.db.getGuildDiscipline(interaction.guildId, 'medal-2nd', userId),
            interaction.client.db.getGuildDiscipline(interaction.guildId, 'medal-3rd', userId),
        ];

        Promise.all(promises).then(results => {
            const flagWins = results[0];
            const coins = results[1];
            const curses = results[2];
            const followers = results[3];
            const medals1 = results[4];
            const medals2 = results[5];
            const medals3 = results[6];

            const stats = [];
            stats.push(`:coin: ${coins}`);
            if (flagWins > 0) stats.push(`:trophy: ${flagWins}`);
            if (curses > 0) stats.push(`:pig: ${curses}`);
            // stats.push(`:eyes: ${followers}`);
            if (medals1 > 0) stats.push(`🥇 ${medals1}`);
            if (medals2 > 0) stats.push(`🥈 ${medals2}`);
            if (medals3 > 0) stats.push(`🥉 ${medals3}`);

            interaction.reply({ content: `${userMention(userId)}'s stats:\n${stats.join('    ')}`, ephemeral: true });
        }).catch(error => {
            console.error(error);
            interaction.reply({ content: 'Operation failed. :cry:', ephemeral: true });
        });
    },
};

