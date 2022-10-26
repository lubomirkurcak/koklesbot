const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('rename')
        .setDescription('Select a member and change their name!')
        .addUserOption(option => option.setName('member').setDescription('The member to rename').setRequired(true))
        .addStringOption(option => option.setName('name').setDescription('Their new server nickname').setRequired(true)),

    async execute(interaction) {
        try {
            const member = interaction.options.getMember('member');
            const name = interaction.options.getString('name');
            await member.setNickname(name);
            return interaction.reply({ content: `You renamed ${member.displayName}`, ephemeral: true });
        } catch (error) {
            console.error(error);
            return interaction.reply({ content: 'Rename failed, likely due to insufficient permissions.', ephemeral: true });
        }
    },
};
