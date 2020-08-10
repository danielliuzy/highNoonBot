const Discord = require('discord.js');

const client = new Discord.Client();

const config = require("./config.json");

const fs = require('fs');

client.commands = new Discord.Collection();

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for(const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.name, command);
}

client.once('ready', () => {
    console.log('bot is online');
});

client.on('ready', () => {
    client.user.setActivity('-hnhelp', {type: 'LISTENING'});
});

client.on('message', message => {
    if(!message.content.toLowerCase().startsWith(config.prefix) || message.author.bot) return;
    const args = message.content.slice(config.prefix.length).trim().split(/ +/);
    const command = args.shift();
    if(message.guild) {
        if(command.toLowerCase() === 'hnhelp') {
            client.commands.get('hnhelp').execute(message, args);
        }
        else if(command.toLowerCase() === 'duel') {
            let opponent = getUserFromMention(args[0]);
            if(args.length != 1 || !opponent) {
                message.channel.send(`${message.author}, to challenge someone to a duel, use \`-duel <@user>\`!`);
                return;
            }
            else if(message.author.id === opponent.id) {
                message.channel.send(`You cannot challenge yourself, ${message.author}!`);
                return;
            }
            else if(opponent.bot === true) {
                message.channel.send(`You cannot challenge a bot, ${message.author}!`);
                return;
            }
            client.commands.get('duel').execute(message, opponent);
        }
        else if(command.toLowerCase() === 'fuel') {
            let opponent = getUserFromMention(args[0]);
            if((args.length != 1) || !opponent) {
                message.channel.send(`${message.author}, to challenge someone to a fake duel, use \`-fuel <@user>\`!`);
                return;
            }
            else if(message.author.id === opponent.id) {
                message.channel.send(`You cannot challenge yourself, ${message.author}!`);
                return;
            }
            else if(opponent.bot === true) {
                message.channel.send(`You cannot challenge a bot, ${message.author}!`);
                return;
            }
            client.commands.get('fuel').execute(message, opponent);
        }
        else if(command.toLowerCase() === 'ffa') {
            client.commands.get('ffa').execute(message);
        }
        else if(command === 'shoot') {
            let opponent = getUserFromMention(args[0]);
            if((args.length != 1 && args.length != 2) || !opponent) {
                message.channel.send(`${message.author}, to challenge someone to a CASE INSENSITIVE shoot 'em up, use \`-shoot <@user> [opt: # of characters]\`!`);
                return;
            }
            else if(message.author.id === opponent.id) {
                message.channel.send(`You cannot challenge yourself, ${message.author}!`);
                return;
            }
            else if(opponent.bot === true) {
                message.channel.send(`You cannot challenge a bot, ${message.author}!`);
                return;
            }
            if(args.length == 2) {
                if(isNaN(args[1])) {
                    message.channel.send(`${message.author}, to challenge someone to a CASE INSENSITIVE shoot 'em up, use \`-shoot <@user> [opt: # of characters]\`!`);
                    return;
                }
                else if(args[1] < 1) {
                    message.channel.send(`${message.author}, the minimum number of characters is 1.`);
                    return;
                }
                else if(args[1] > 20) {
                    message.channel.send(`${message.author}, the maximum number of characters is 20.`);
                    return;
                }
                client.commands.get('shoot').execute(message, opponent, false, Math.floor(args[1]));
            }
            else {
                client.commands.get('shoot').execute(message, opponent, false);
            }
        }
        else if(command === 'Shoot') {
            let opponent = getUserFromMention(args[0]);
            if((args.length != 1 && args.length != 2) || !opponent) {
                message.channel.send(`${message.author}, to challenge someone to a CASE SENSITIVE shoot 'em up, use \`-Shoot <@user> [opt: # of characters]\`!`);
                return;
            }
            else if(message.author.id === opponent.id) {
                message.channel.send(`You cannot challenge yourself, ${message.author}!`);
                return;
            }
            else if(opponent.bot === true) {
                message.channel.send(`You cannot challenge a bot, ${message.author}!`);
                return;
            }
            if(args.length == 2) {
                if(isNaN(args[1])) {
                    message.channel.send(`${message.author}, to challenge someone to a CASE SENSITIVE shoot 'em up, use \`-Shoot <@user> [opt: # of characters]\`!`);
                    return;
                }
                else if(args[1] < 1) {
                    message.channel.send(`${message.author}, the minimum number of characters is 1.`);
                    return;
                }
                else if(args[1] > 20) {
                    message.channel.send(`${message.author}, the maximum number of characters is 20.`);
                    return;
                }
                client.commands.get('shoot').execute(message, opponent, true, Math.floor(args[1]));
            }
            else {
                client.commands.get('shoot').execute(message, opponent, true);
            }
        }
    }
});

function getUserFromMention(mention) {
    if (!mention) return;
    if (mention.startsWith('<@') && mention.endsWith('>')) {
        mention = mention.slice(2, -1);

        if (mention.startsWith('!')) {
            mention = mention.slice(1);
        }

        return client.users.cache.get(mention);
    }
}

client.login(config.token);