const { MessageEmbed, MessageCollector, MessageAttachment } = require("discord.js");
const Canvas = require('canvas');

module.exports = {
    name: 'ffa',
    description: 'Start a free for all.',
    async execute(message) {
        let done = false;
        let players = [message.author];
        const embed = new MessageEmbed()
        .setTitle('Join Free For All ⚔️')
        .setColor('#dc322f')
        .setTimestamp()
        .setDescription(`${message.author} has started a free for all! Type \`join\` to join. To start the game, have ${message.author} type \`start\`.`)

        const ffaCanvas = Canvas.createCanvas(700, 400);
        const ctx = ffaCanvas.getContext('2d');
        const background = await Canvas.loadImage('./duel.jpg');
        ctx.drawImage(background, 0, 0, ffaCanvas.width, ffaCanvas.height);

        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = "#dc322f";
        ctx.font = '66px arial black';
        ctx.fillText("FREE FOR ALL", 350, 50);
        ctx.font = '60px arial black';
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 3;
        ctx.fillText("Type 'join'!", 350, 350);
        ctx.strokeText("Type 'join'!", 350, 350);

        ctx.beginPath();
        ctx.arc(350, 210, 100, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.clip();
        const host = await Canvas.loadImage(message.author.displayAvatarURL({ format: 'jpg' }));
        ctx.drawImage(host, 250, 110, 200, 200);

        const attachment = new MessageAttachment(ffaCanvas.toBuffer(), 'ffaImage.png');
        embed.setImage('attachment://ffaImage.png')

        message.channel.send({ files: [attachment], embed: embed });
        //changed for testing
        const joinCollector = new MessageCollector(message.channel, m => m.author.id !== message.author.id && m.content.toLowerCase() == 'join' && !players.includes(m.author) && !m.author.bot, { time: 60000 });
        const startCollector = new MessageCollector(message.channel, m => m.author.id === message.author.id && m.content.toLowerCase() == 'start', { time: 60000 });
        joinCollector.on('collect', msg => {
            //at most 10 players
            if(players.length >= 10) {
                message.channel.send(`Lobby maximum reached, ${msg.author}!(10/10)`);
                return;
            }
            players.push(msg.author);
        })
        startCollector.on('collect', msg => {
            //at least 2 players
            if(players.length <= 1) {
                message.channel.send(`There must be more than 1 player in the lobby to start a Free for All, ${message.author}!`);
                return;
            }
            startCollector.stop('game started');
            joinCollector.stop('game started');
            const startEmbed = new MessageEmbed()
            .setTitle('Start Free for All')
            .setColor('#dc322f')
            let playerList = `Host: ${message.author}\n\nPlayers:\n`;
            for(i = 0; i < players.length; i++) {
                playerList += `${players[i]}\n`;
            }
            message.channel.send(startEmbed.setDescription(playerList + `\nTo start the game, have the host type \`y\`.`));
            const yesCollector = new MessageCollector(message.channel, m => m.author.id === message.author.id && m.content.toLowerCase() == 'y', { time: 20000 });
            yesCollector.on('collect', yes => {
                yesCollector.stop('Game started');
                const readyEmbed = new MessageEmbed()
                .setTitle('Free for All! 🔫')
                .setColor('#dc322f')
                const fireEmbed = new MessageEmbed()
                .setTitle('FIRE! 🔫')
                .setColor('#dc322f')
                message.channel.send(readyEmbed.setDescription('Send a message when you see \`FIRE!🔫\`'));
                let dq = [];
                let ranks = [];
                //wait for early fires
                const earlyCollector = new MessageCollector(message.channel, m => players.includes(m.author) && !dq.includes(m.author), { time: 10000 });
                earlyCollector.on('collect', early => {
                    dq.push(early.author);
                    if(dq.length == players.length) {
                        done = true;
                        earlyCollector.stop('ffa finished');
                    }
                })
                earlyCollector.on('end', async early => {
                    if(done) {
                        let result = '';
                        const resultEmbed = new MessageEmbed()
                        .setTitle('🏆 Results')
                        .setColor('#dc322f')
                        .setTimestamp()
                        for(i = 0; i < dq.length; i++) {
                            if(dq.length - i == 1) {
                                result = `🥇 ${dq[i]}\n` + result;
                            }
                            else if(dq.length - i == 2) {
                                result = `🥈 ${dq[i]}\n` + result;
                            }
                            else if(dq.length - i == 3) {
                                result = `🥉 ${dq[i]}\n` + result;
                            }
                            else {
                                result = `${dq.length - i}. ${dq[i]}\n` + result;
                            }
                        }
                        result += `\nCongrats ${dq[dq.length-1]}!`;

                        const winnerCanvas = Canvas.createCanvas(700, 400);
                        const endCtx = winnerCanvas.getContext('2d');
                        endCtx.drawImage(background, 0, 0, winnerCanvas.width, winnerCanvas.height);

                        endCtx.textAlign = "center";
                        endCtx.textBaseline = "middle";
                        endCtx.font = applyText(winnerCanvas, `${dq[dq.length-1].username} WINS!`, 72, winnerCanvas.width - 100);
                        endCtx.fillStyle = "#dc322f";
                        endCtx.fillText(`${dq[dq.length-1].username} WINS!`, 350, 62.5);

                        endCtx.beginPath();
                        endCtx.arc(350, 237, 125, 0, Math.PI * 2, true);
                        endCtx.closePath();
                        endCtx.clip();
                        const winner = await Canvas.loadImage(dq[dq.length-1].displayAvatarURL({ format: 'jpg' }));
                        endCtx.drawImage(winner, 225, 112, 250, 250);

                        const winnerAttachment = new MessageAttachment(winnerCanvas.toBuffer(), 'winnerImage.png');
                        resultEmbed.setImage('attachment://winnerImage.png');
                        
                        message.channel.send({ files: [winnerAttachment], embed: resultEmbed.setDescription(result) });
                    }
                })
                setTimeout(() => {
                    if(!done) {
                        earlyCollector.stop('fire sent');
                        message.channel.send(fireEmbed);
                        const fireCollector = new MessageCollector(message.channel, m => players.includes(m.author) && !dq.includes(m.author) && !ranks.includes(m.author), { time: 2000 });
                        fireCollector.on('collect', fire => {
                            ranks.push(fire.author);
                            if(ranks.length + dq.length == players.length) {
                                fireCollector.stop('ffa finished');
                            }
                        })
                        fireCollector.on('end', async end => {
                            let result = '';
                            let temp = '';
                            const resultEmbed = new MessageEmbed()
                            .setTitle('🏆 Results')
                            .setColor('#dc322f')
                            .setTimestamp()
                            for(i = 0; i < dq.length; i++) {
                                if(ranks.length + dq.length - i == 1) {
                                    result = `🥇 ${dq[i]}\n` + result;
                                }
                                else if(ranks.length + dq.length - i == 2) {
                                    result = `🥈 ${dq[i]}\n` + result;
                                }
                                else if(ranks.length + dq.length - i == 3) {
                                    result = `🥉 ${dq[i]}\n` + result;
                                }
                                else {
                                    result = `${ranks.length + dq.length - i}. ${dq[i]}\n` + result;
                                }
                            }
                            for(i = 0; i < ranks.length; i++) {
                                if(i + 1 == 1) {
                                    temp += `🥇 ${ranks[i]}\n`;
                                }
                                else if(i + 1 == 2) {
                                    temp += `🥈 ${ranks[i]}\n`;
                                }
                                else if(i + 1 == 3) {
                                    temp += `🥉 ${ranks[i]}\n`;
                                }
                                else {
                                    temp += `${i + 1}. ${ranks[i]}\n`;
                                }
                            }
                            result = temp + result;
                            result += `Congrats ${ranks[0]}!`;
                            
                            const winnerCanvas = Canvas.createCanvas(700, 400);
                            const endCtx = winnerCanvas.getContext('2d');
                            endCtx.drawImage(background, 0, 0, winnerCanvas.width, winnerCanvas.height);

                            endCtx.textAlign = "center";
                            endCtx.textBaseline = "middle";
                            endCtx.font = applyText(winnerCanvas, `${ranks[0].username} WINS!`, 72, winnerCanvas - 100);
                            endCtx.fillStyle = "#dc322f";
                            endCtx.fillText(`${ranks[0].username} WINS!`, 350, 62.5);

                            endCtx.beginPath();
                            endCtx.arc(350, 237, 125, 0, Math.PI * 2, true);
                            endCtx.closePath();
                            endCtx.clip();
                            const winner = await Canvas.loadImage(ranks[0].displayAvatarURL({ format: 'jpg' }));
                            endCtx.drawImage(winner, 225, 112, 250, 250);

                            const winnerAttachment = new MessageAttachment(winnerCanvas.toBuffer(), 'winnerImage.png');
                            resultEmbed.setImage('attachment://winnerImage.png');
                            
                            message.channel.send({ files: [winnerAttachment], embed: resultEmbed.setDescription(result) });
                        })
                    }
                }, getRandomInt(2000, 10000));
            })
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
		ctx.font = `${fontSize -= 1}px arial black`;
		// Compare pixel width of the text to the canvas minus the approximate avatar size
	} while (ctx.measureText(text).width > width);

	// Return the result to use in the actual canvas
	return ctx.font;
};