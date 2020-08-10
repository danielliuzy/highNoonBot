const { MessageEmbed, MessageCollector, MessageAttachment } = require("discord.js");
const Canvas = require('canvas');

module.exports = {
    name: 'shoot',
    description: 'Start a shooting game.',
    async execute(message, opponent, sensitive, charCount = 6) {
        const embed = new MessageEmbed()
        .setTitle("Shoot 'Em Up Challenge ⚔️")
        .setColor('#dc322f')
        .setTimestamp()

        const duelCanvas = Canvas.createCanvas(700, 400);
        const ctx = duelCanvas.getContext('2d');
        const background = await Canvas.loadImage('./duel.jpg');
        ctx.drawImage(background, 0, 0, duelCanvas.width, duelCanvas.height);

        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.font = '60px arial-black';
        ctx.fillStyle = '#000000';
        ctx.fillText('VS', 350, 200);
        ctx.fillStyle = "#dc322f";
        ctx.font = '66px arial-black';
        ctx.fillText("SHOOT 'EM UP", 350, 50);

        ctx.fillStyle = "#ffffff";
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;

        ctx.font = applyText(duelCanvas, message.author.username, 48, 200);
        ctx.fillText(message.author.username, 175, 330);
        ctx.strokeText(message.author.username, 175, 330);
        ctx.font = applyText(duelCanvas, opponent.username, 48, 200);
        ctx.fillText(opponent.username, 525, 330);
        ctx.strokeText(opponent.username, 525, 330);

        ctx.beginPath();
        ctx.arc(175, 200, 100, 0, Math.PI * 2, true);
        ctx.arc(525, 200, 100, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.clip();
        const player1 = await Canvas.loadImage(message.author.displayAvatarURL({ format: 'jpg' }));
        ctx.drawImage(player1, 75, 100, 200, 200);
        const player2 = await Canvas.loadImage(opponent.displayAvatarURL({ format: 'jpg' }));
        ctx.drawImage(player2, 425, 100, 200, 200);
        const attachment = new MessageAttachment(duelCanvas.toBuffer(), 'duelImage.png');
            
        embed.setImage('attachment://duelImage.png')
        
        
        if(!sensitive) {
            message.channel.send({ files: [attachment], embed: embed.setDescription(`${message.author} has challenged ${opponent} to a CASE INSENSITIVE shoot 'em up! 🔫\nType \`y\` to accept.`)});
        }
        else {
            message.channel.send({ files: [attachment], embed: embed.setDescription(`${message.author} has challenged ${opponent} to a CASE SENSITIVE shoot 'em up! 🔫\nType \`y\` to accept.`)});
        }
        //Wait for accept
        const collector = new MessageCollector(message.channel, m => m.author.id === opponent.id && m.content.toLowerCase() == "y", { time: 60000 });
        collector.on('collect', accept => {
            collector.stop('challenge accepted');
            const readyEmbed = new MessageEmbed()
            .setTitle("SHOOT 'EM UP! 🔫")
            .setColor('#dc322f')
            if(!sensitive) {
                accept.channel.send(readyEmbed.setDescription(`${message.author}🆚${opponent}\nType the characters in my next message in the exact same order. CASE INSENSITIVE.`));
            }
            else {
                accept.channel.send(readyEmbed.setDescription(`${message.author}🆚${opponent}\nType the characters in my next message in the exact same order. CASE SENSITIVE.`));
            }
            const chars = 'abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ0123456789';
            let temp = '';
            for(i = 0; i < charCount; i++) {
                temp += chars[getRandomInt(0, chars.length-1)];
            }
            let brackets = '';
            for(i = 0; i < temp.length; i++) {
                brackets += '' + temp[i] + ' ';
            }
            const targetEmbed = new MessageEmbed()
            .setColor('#dc322f')
            .setTitle(brackets + '🔫')
            setTimeout(() => {
                message.channel.send(targetEmbed);
                let fireCollector;
                if(!sensitive) {
                    fireCollector = new MessageCollector(message.channel, m => (m.author.id === message.author.id || m.author.id === opponent.id) && m.content.toLowerCase() == temp.toLowerCase(), { time: 60000 });
                }
                else {
                    fireCollector = new MessageCollector(message.channel, m => (m.author.id === message.author.id || m.author.id === opponent.id) && m.content == temp, { time: 60000 });
                }
                fireCollector.on('collect', fire => {
                    const winnerCanvas = Canvas.createCanvas(700, 400);
                    const endCtx = winnerCanvas.getContext('2d');
                    endCtx.drawImage(background, 0, 0, winnerCanvas.width, winnerCanvas.height);

                    endCtx.textAlign = "center";
                    endCtx.textBaseline = "middle";
                    endCtx.font = applyText(winnerCanvas, `${fire.author.username} WINS!`, 72, winnerCanvas - 100);
                    endCtx.fillStyle = "#dc322f";
                    endCtx.fillText(`${fire.author.username} WINS!`, 350, 62.5);

                    endCtx.beginPath();
                    endCtx.arc(350, 237, 125, 0, Math.PI * 2, true);
                    endCtx.closePath();
                    endCtx.clip();

                    if(fire.author.id === message.author.id) {
                        endCtx.drawImage(player1, 225, 112, 250, 250);
                    }
                    else {
                        endCtx.drawImage(player2, 225, 112, 250, 250);
                    }
                    const winnerAttachment = new MessageAttachment(winnerCanvas.toBuffer(), 'winnerImage.png');
                    embed
                    .setTitle('🏆 VICTORY!')
                    .setTimestamp()
                    .setImage("attachment://winnerImage.png")
                    .setDescription(`${fire.author} WINS!`)
                    fire.channel.send({ files: [winnerAttachment], embed: embed });
                    fireCollector.stop('game finished');
                })
            }, getRandomInt(1000, 8000))
        })
    }
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

const applyText = (canvas, text, size, width) => {
	const ctx = canvas.getContext('2d');

	// Declare a base size of the font
	let fontSize = size;

	do {
		// Assign the font to the context and decrement it so it can be measured again
		ctx.font = `${fontSize -= 1}px arial-black`;
		// Compare pixel width of the text to the canvas minus the approximate avatar size
	} while (ctx.measureText(text).width > width);

	// Return the result to use in the actual canvas
	return ctx.font;
};