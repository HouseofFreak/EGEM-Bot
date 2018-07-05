
const Discord = require("discord.js");
const botSettings = require("../config.json");
const miscSettings = require("../cfgs/settings.json");
const prefix = botSettings.prefix;
exports.run = (client, message, args) => {
  const embed = new Discord.RichEmbed()
    .setTitle("EGEM Discord Bot.")
    .setAuthor("TheEGEMBot", miscSettings.egemspin)

    .setColor(miscSettings.okcolor)
    .setDescription("Game Command List:")
    .setFooter(miscSettings.footerBranding, miscSettings.img32x32)
    .setThumbnail(miscSettings.img32shard)

    .setTimestamp()
    .setURL("https://github.com/TeamEGEM/EGEM-Bot")
    .addField(prefix+"roll", "The EGEM Dice game. :game_die:")
    .addField(prefix+"timetrial", "Get the correct number in timelimit. :question:")
    .addField(prefix+"onehandbj 1-5", "You can win 1-5 EGEM every 5 minutes.")

    message.channel.send({embed})
}
