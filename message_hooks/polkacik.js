module.exports = {
    execute(message) {
        if (message.author.id == "689388928608108588" && Math.random() < .2) {
            message.react("🤡");
        }
    }
}