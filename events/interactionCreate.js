const { shuffleInplace } = require("../misc/shared");

function getBag() {
    return [
        Array(3).fill(':o:'),
        Array(3).fill(':red_circle:'),
        Array(1).fill(':cloud_rain:'),
        Array(1).fill(':trophy:'),
    ].flat();
}

function listContents() {
    return getBag().join(' ');
}

function drawBalls(count) {
    const bag = getBag();
    shuffleInplace(bag);
    return `Bag contains:\n${listContents()}\nYou drew:\n${bag.slice(0, count).join(' ')}`;
}

module.exports = {
    name: 'interactionCreate',
    execute(interaction) {
        console.log(`${interaction.user.tag} in #${interaction.channel.name} triggered an interaction.`);

        if (interaction.isChatInputCommand()) {
            const command = interaction.client.commands.get(interaction.commandName);

            if (!command) return;

            command.execute(interaction);
        } else if (interaction.isButton()) {
            if (interaction.customId == 'draw1') {
                interaction.update({ content: drawBalls(1), components: [] });
            } else if (interaction.customId == 'draw2') {
                interaction.update({ content: drawBalls(2), components: [] });
            } else if (interaction.customId == 'draw3') {
                interaction.update({ content: drawBalls(3), components: [] });
            } else if (interaction.customId == 'draw4') {
                interaction.update({ content: drawBalls(4), components: [] });
            }
        } else {
            console.log(`${interaction}`);
        }
    },
};
