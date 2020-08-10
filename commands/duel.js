const { MessageEmbed, MessageCollector, MessageAttachment } = require("discord.js");
const Canvas = require('canvas');

module.exports = {
    name: 'duel',
    description: 'Start a duel between 2 users.',
    async execute(message, opponent) {
        let done = false;
        const embed = new MessageEmbed()
        .setTitle('Duel Challenge ⚔️')
        .setColor('#dc322f')
        .setTimestamp()
        .setDescription(`${message.author} has challenged ${opponent} to a duel! 🔫\nType \`y\` to accept.`)
        
        const duelCanvas = Canvas.createCanvas(700, 400);
        const ctx = duelCanvas.getContext('2d');
        const background = await Canvas.loadImage('./duel.jpg');
        ctx.drawImage(background, 0, 0, duelCanvas.width, duelCanvas.height);

        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.font = '60px arial black';
        ctx.fillStyle = '#000000';
        ctx.fillText('VS', 350, 200);
        ctx.fillStyle = "#dc322f";
        ctx.font = '72px arial black';
        ctx.fillText("DUEL", 350, 50);
        
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
        
        message.channel.send({ files: [attachment], embed: embed });

        
        //Wait for accept
        const collector = new MessageCollector(message.channel, m => m.author.id === opponent.id && m.content.toLowerCase() == "y", { time: 60000 });
        collector.on('collect', accept => {
            collector.stop('Duel accepted');
            const readyEmbed = new MessageEmbed()
            .setTitle('DUEL! 🔫')
            .setColor('#dc322f')
            accept.channel.send(readyEmbed.setDescription(`${message.author}🆚${opponent}\nSend a message when you see \`FIRE!🔫\``));

            const fireEmbed = new MessageEmbed()
            .setTitle('FIRE! 🔫')
            .setColor('#dc322f')
            //Wait for early fire
            const winnerCanvas = Canvas.createCanvas(700, 400);
            const endCtx = winnerCanvas.getContext('2d');
            endCtx.drawImage(background, 0, 0, winnerCanvas.width, winnerCanvas.height);

            endCtx.textAlign = "center";
            endCtx.textBaseline = "middle";
            endCtx.fillStyle = "#dc322f";

            const earlyCollector = new MessageCollector(message.channel, m => m.author.id === message.author.id || m.author.id === opponent.id, { time: 10000 });
            earlyCollector.on('collect', fire => {
                embed
                .setTitle('🏆 VICTORY!')
                .setTimestamp()
                if(fire.author.id === message.author.id) {
                    //set opponent image
                    endCtx.font = applyText(winnerCanvas, `${opponent.username} WINS!`, 72, winnerCanvas.width - 100);
                    endCtx.fillText(`${opponent.username} WINS!`, 350, 62.5);
                    endCtx.beginPath();
                    endCtx.arc(350, 237, 125, 0, Math.PI * 2, true);
                    endCtx.closePath();
                    endCtx.clip();
                    endCtx.drawImage(player2, 225, 112, 250, 250);
                    const winnerAttachment = new MessageAttachment(winnerCanvas.toBuffer(), 'winnerImage.png');
                    
                    embed
                    .setImage("attachment://winnerImage.png")
                    .setDescription(`${opponent} WINS!\n${fire.author} fired too early.`)

                    message.channel.send({ files: [winnerAttachment], embed: embed });
                    earlyCollector.stop('Duel finished');
                    done = true;
                }
                else {
                    //set message.author image
                    endCtx.font = applyText(winnerCanvas, `${message.author.username} WINS!`, 72, winnerCanvas.width - 100);
                    endCtx.fillText(`${message.author.username} WINS!`, 350, 62.5);
                    endCtx.beginPath();
                    endCtx.arc(350, 237, 125, 0, Math.PI * 2, true);
                    endCtx.closePath();
                    endCtx.clip();
                    endCtx.drawImage(player1, 225, 112, 250, 250);
                    const winnerAttachment = new MessageAttachment(winnerCanvas.toBuffer(), 'winnerImage.png');
                    
                    embed
                    .setImage("attachment://winnerImage.png")
                    .setDescription(`${message.author} WINS!\n${fire.author} fired too early.`)

                    message.channel.send({ files: [winnerAttachment], embed: embed });
                    earlyCollector.stop('Duel finished');
                    done = true;
                }
            })
            setTimeout(() => {
                if(!done) {
                    earlyCollector.stop('Fire sent');
                    message.channel.send(fireEmbed);
                    const fireCollector = new MessageCollector(message.channel, m => m.author.id === message.author.id || m.author.id === opponent.id, { time: 10000 });
                    fireCollector.on('collect', fire => {
                        embed
                        .setTitle('🏆 VICTORY!')
                        .setTimestamp()
                        .setDescription(`${fire.author} WINS!`)
                        //set winner image
                        endCtx.font = applyText(winnerCanvas, `${fire.author.username} WINS!`, 72, winnerCanvas.width - 100);
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

                        embed.setImage("attachment://winnerImage.png");
                        fire.channel.send({ files: [winnerAttachment], embed: embed });
                        fireCollector.stop('Duel finished');
                    })
                }
            }, getRandomInt(1000, 8000));
            return;
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