
const Discord = require("discord.js");
const botSettings = require("../config.json");
const miscSettings = require("../cfgs/settings.json");
const prefix = botSettings.prefix;
exports.run = (client, message, args) => {
  const embed = new Discord.RichEmbed()
    .setTitle("EGEM Discord Bot.")
    .setAuthor("TheEGEMBot", miscSettings.egemspin)

    .setColor(miscSettings.okcolor)
    .setDescription("Coin Command List:")
    .setFooter(miscSettings.footerBranding, miscSettings.img32x32)
    .setThumbnail(miscSettings.img32shard)

    .setTimestamp()
    .setURL("https://github.com/TeamEGEM/EGEM-Bot")
    .addField(prefix+"bal", "Show EGEM balance, if registered.")
    .addField(prefix+"getid", "This number is needed to use /usertip.")
    .addField(prefix+"register <address> ", "Saves user address and name to db.")
    .addField(prefix+"changereg <address>", "Change your registered address.")
    .addField(prefix+"checkreg", "Returns whether you're registered or not.")
    .addField(prefix+"usertip <userid>", "Tip a user or yourself every 2 hours.")
    .addField(prefix+"block", "Shows the semi current block number (15sec updates).")
    .addField(prefix+"getblock <number>", "Lookup the info of the block.")
    .addField(prefix+"tx <txhash>", "Lookup the info of the transaction.")
    .addField(prefix+"coin", "Show the price/cap/supply.")

    message.channel.send({embed})
}
