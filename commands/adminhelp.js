
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

    .setColor(miscSettings.okcolor)
    .setDescription("Admin Command List:")
    .setFooter(miscSettings.footerBranding, miscSettings.img32x32)
    .setThumbnail(miscSettings.img32shard)

    .setTimestamp()
    .setURL("https://github.com/TeamEGEM/EGEM-Bot")
    .addField(prefix+"sendToAddress <address> <amount>", "send EGEM to the following address. MAX 100000/per TX")
    .addField(prefix+"tip <name> <amount>", "send EGEM to the following user. MAX 100/per TX")
    .addField(prefix+"rain <amount>", "send EGEM to all registered and online address's.")
    .addField(prefix+"sprinkle", "send 1-10 EGEM to all registered and online address's")
    .addField(prefix+"downpour", "send 10-100 EGEM to all registered and online address's")
    .addField(prefix+"online", "see list of all online and registered users for raindrops.")
    .addField(prefix+"onlinetotal", "see the list of every online user.")
    .addField(prefix+"forecast <amount> <numOfHrs>", "rain will be after N hours.")
    .addField(prefix+"purge <number>", "cleans last X posts from channel.")
    .addField(prefix+"motd <message>", "sets the MOTD message.")

    message.channel.send({embed})
}
