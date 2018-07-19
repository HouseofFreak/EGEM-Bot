
const Discord = require("discord.js");
const botSettings = require("../config.json");
const miscSettings = require("../cfgs/settings.json");
const prefix = botSettings.prefix;
exports.run = (client, message, args) => {
  const embed = new Discord.RichEmbed()
    .setTitle("EGEM Discord Bot.")
    .setAuthor("TheEGEMBot", miscSettings.egemspin)

    .setColor(miscSettings.okcolor)
    .setDescription("Help Command List:")
    .setFooter(miscSettings.footerBranding, miscSettings.img32x32)
    .setThumbnail(miscSettings.img32shard)

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
