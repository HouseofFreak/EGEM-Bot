
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
    .setDescription("Markets List:")
    .setFooter("© EGEM.io", miscSettings.img32x32)
    .setThumbnail(miscSettings.img32shard)
    /*
     * Takes a Date object, defaults to current date.
     */
    .setTimestamp()
    .setURL("https://github.com/TeamEGEM/EGEM-Bot")
    .addField("/graviex - Graviex", "https://graviex.net/")
    .addField("/bitebtc - BiteBTC", "https://bitebtc.com/")

    message.channel.send({embed})
}
