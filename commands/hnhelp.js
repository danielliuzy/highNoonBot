const { MessageEmbed } = require("discord.js");

module.exports = {
    name: 'hnhelp',
    description: 'Help command.',
    execute(message, args) {
        const embed = new MessageEmbed()
        .setTitle('ℹ️ High Noon Bot Help')
        .setColor('#dc322f')
        message.channel.send(embed.setDescription(
            `\`-duel <@user>\` - Challenge another person to a duel. Type anything when you are asked to \`FIRE!🔫\`.\n\`-fuel <@user>\` - Challenge another person to a fake duel. There will be \`FAKE!🔫\` messages.\n\`-shoot <@user> [opt: # of characters]\` - Challenge another person to a CASE INSENSITIVE shoot 'em up. Type the characters in the exact order shown.\n\`-Shoot <@user> [opt: # of characters]\` - Challenge another person to a CASE SENSITIVE shoot 'em up. Type the characters in the exact order shown.\n\`-ffa\` - Start a free for all. Max 10 players.`
        ));
    }
}