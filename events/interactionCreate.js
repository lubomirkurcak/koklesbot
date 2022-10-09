function getProphecy() {
    const map = new Map();
    map.set(":green_circle:", 50);
    map.set(":red_circle:", 50);
    map.set(":clown:", 1);

    var total = 0;
    map.forEach(value => total += value);
    var roll = total * Math.random();

    for (const key of map.keys()) {
        console.log(`key ${key} roll ${roll} < ${map.get(key)} is ${roll < map.get(key)}`);
        if (roll < map.get(key)) {
            return key;
        }
        roll -= map.get(key);
    }

    return map.keys().next().value;
}

function getBigProphecy(count) {
    const elements = [];
    for (var i = 0; i < count; i++) {
        elements.push(getProphecy());
    }

    return elements.join(' ');
}

module.exports = {
    name: 'interactionCreate',
    execute(interaction, client) {
        console.log(`${interaction.user.tag} in #${interaction.channel.name} triggered an interaction.`);

        if (interaction.isChatInputCommand()) {
            const command = client.commands.get(interaction.commandName);

            if (!command) return;

            command.execute(interaction);
        } else if (interaction.isButton()) {
            if (interaction.customId == 'radim1') {
                interaction.update({ content: getBigProphecy(1), components: [] });
            } else if (interaction.customId == 'radim3') {
                interaction.update({ content: getBigProphecy(3), components: [] });
            } else if (interaction.customId == 'radim5') {
                interaction.update({ content: getBigProphecy(5), components: [] });
            } else if (interaction.customId == 'radim10') {
                interaction.update({ content: getBigProphecy(10), components: [] });
            }
        } else {
            console.log(`${interaction}`);
        }
    },
};
