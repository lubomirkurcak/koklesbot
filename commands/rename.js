const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('rename')
        .setDescription('Select a member and change their name!')
        .addUserOption(option => option.setName('target').setDescription('The member to rename').setRequired(true))
        .addStringOption(option => option.setName('name').setDescription('Their new name').setRequired(true))
    ,
    async execute(interaction) {
        const member = interaction.options.getMember('target');
        const name = interaction.options.getString('name');
        try {
            await member.setNickname(name);
            return interaction.reply({ content: `You renamed ${member.user.username}`, ephemeral: true });
        } catch (error) {
            console.error(error);
            return interaction.reply({ content: 'Rename failed. :x: I likely don\'t have sufficient permissions to do that. :cry:', ephemeral: true });
        }
    },
};
