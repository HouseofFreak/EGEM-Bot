exports.run = (client, message, args) => {
    message.channel.send("Current EGEM blockchain height is: " + getBlock()).catch(console.error);
}
