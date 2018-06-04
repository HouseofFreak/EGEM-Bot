
const Discord = require("discord.js");
const botSettings = require("../config.json");
const miscSettings = require("../cfgs/settings.json");
const prefix = botSettings.prefix;
exports.run = (client, message, args) => {
  if(!message.member.hasPermission('ADMINISTRATOR')){
    return message.channel.send("You cannot use '/adminhelp' command");
  }
  const embed = new Discord.RichEmbed()
    .setTitle("EGEM Discord Bot.")
    .setAuthor("TheEGEMBot", miscSettings.egemspin)
    /*
     * Alternatively, use "#00AE86", [0, 174, 134] or an integer number.
     */
    .setColor(miscSettings.okcolor)
    .setDescription("Admin Command List:")
    .setFooter("© EGEM.io", miscSettings.img32x32)
    .setThumbnail(miscSettings.img32shard)
    /*
     * Takes a Date object, defaults to current date.
     */
    .setTimestamp()
    .setURL("https://github.com/TeamEGEM/EGEM-Bot")
    .addField(prefix+"sendToAddress <address> <amount>", "send EGEM to the following address.")
    .addField(prefix+"tip <name> <amount>", "send EGEM to the following user.")
    .addField(prefix+"rain <amount>", "send EGEM to all registered and online address's.")
    .addField(prefix+"sprinkle", "send 1-10 EGEM to all registered and online address's")
    .addField(prefix+"downpour", "send 10-100 EGEM to all registered and online address's")
    .addField(prefix+"online", "see list of all online and registered users for raindrops.")
    .addField(prefix+"onlinetotal", "see the list of every online user.")
    .addField(prefix+"forecast <amount> <numOfHrs>", "rain will be after N hours.")

    message.channel.send({embed})
}
