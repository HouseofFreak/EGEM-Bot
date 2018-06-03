function getBlock(){
				return JSON.parse(fs.readFileSync('./data/block.txt'));
}
exports.run = (client, message, args) => {
    message.channel.send("Current EGEM blockchain height is: " + getBlock()).catch(console.error);
}
