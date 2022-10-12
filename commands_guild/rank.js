// const fs = require('fs');
const { SlashCommandBuilder, Collection } = require('discord.js');

const rankings = new Collection();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('rank')
        .setDescription('Display or modify server member rankings.')
        .addUserOption(option => option.setName('member').setDescription('The member to display or modify'))
        .addStringOption(option => option.setName('discipline').setDescription('The discipline to display or modify'))
        .addStringOption(option => option.setName('id').setDescription('The member ID in given discipline')),
    async execute(interaction) {
        try {
            const member = interaction.options.getMember('member');
            const discipline = interaction.options.getString('discipline');
            const id = interaction.options.getString('id');

            if (discipline) {
                if (!rankings.has(discipline)) {
                    rankings.set(discipline, new Collection());
                }

                const ledger = rankings.get(discipline);

                if (member) {
                    if (id) {
                        ledger.set(member.id, id);
                    }
                }

                ledger.sort((a, b) => b - a);
                for (let i = 0; i < 5; ++i) {
                    console.log(ledger.at(i));
                }
            }

            interaction.reply({ content: ':white_check_mark:', ephemeral: true });
        } catch (error) {
            console.error(error);
            return interaction.reply({ content: 'Command failed. :cry:', ephemeral: true });
        }
    },
};
