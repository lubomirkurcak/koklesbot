module.exports = {
    execute(message) {
        if (message.author.id == '296680258403434501' && message.content.length > 500) {
            message.reply('Beware of misinformation! This user has been known to share content from unverified sources.');
        }
    },
};
