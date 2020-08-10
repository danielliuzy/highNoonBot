const { MessageEmbed } = require("discord.js");
const config = require("../config.json");

module.exports = {
    name: 'hnhelp',
    description: 'Help command.',
    execute(message, args) {
        const embed = new MessageEmbed()
        .setTitle('ℹ️ High Noon Bot Help')
        .setColor('#dc322f')
        message.channel.send(embed.setDescription(
            `\`${config.prefix}duel <@user>\` - Challenge another person to a duel. Type anything when you are asked to \`FIRE!🔫\`.\n\`${config.prefix}fuel <@user>\` - Challenge another person to a fake duel. There will be \`FAKE!🔫\` messages.\n\`${config.prefix}shoot <@user> [opt: # of characters]\` - Challenge another person to a CASE INSENSITIVE shoot 'em up. Type the characters in the exact order shown.\n\`${config.prefix}Shoot <@user> [opt: # of characters]\` - Challenge another person to a CASE SENSITIVE shoot 'em up. Type the characters in the exact order shown.\n\`${config.prefix}ffa\` - Start a free for all. Max 10 players.`
        ));
    }
}