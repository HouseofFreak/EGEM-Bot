
const Discord = require("discord.js");
const miscSettings = require("../cfgs/settings.json");

exports.run = (client, message, args) => {
  const embed = new Discord.RichEmbed()
    .setTitle("EGEM Discord Bot.")
    .setAuthor("TheEGEMBot", miscSettings.egemspin)
    /*
     * Alternatively, use "#00AE86", [0, 174, 134] or an integer number.
     */
    .setColor(miscSettings.okcolor)
    .setDescription("Help Command List:")
    .setFooter("© EGEM.io", miscSettings.img32x32)
    .setThumbnail(miscSettings.img32shard)
    /*
     * Takes a Date object, defaults to current date.
     */
    .setTimestamp()
    .setURL("https://github.com/TeamEGEM/EGEM-Bot")
    .addField(prefix+"egem", "shows the what is EGEM info.")
    .addField(prefix+"faq", "common asked questions.")
    .addField(prefix+"gamelist", "list of games to play.")
    .addField(prefix+"pools", "show list of known EGEM pools.")
    .addField(prefix+"markets", "show list of known place to BUY/SELL EGEM.")
    .addField(prefix+"convert", "get a list of realtime conversions from EGEM to another coin.")
    .addField(prefix+"botinfo", "shows bot address so anyone can fund it, and its balance.")
    .addField(prefix+"coinhelp", "EGEM Blockchain and coin commands.")
    .addField(prefix+"carhelp", "List of cars and there EGEM required.")
    .addField(prefix+"list", "shows number of users registered for raindrops.")

    message.channel.send({embed})
}
