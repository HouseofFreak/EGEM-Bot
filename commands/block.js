
const fs = require("fs");
const Discord = require("discord.js");
const botSettings = require("../config.json");
const miscSettings = require("../cfgs/settings.json");
function getBlock(){ return JSON.parse(fs.readFileSync('./data/block.txt'));}

exports.run = (client, message, args) => {
  var getblock = getBlock();
  const embed = new Discord.RichEmbed()
    .setTitle("EGEM Discord Bot.")
    .setAuthor("TheEGEMBot", miscSettings.egemspin)

    .setColor(miscSettings.okcolor)
    .setDescription("Current Blockchain Height:")
    .setFooter(miscSettings.footerBranding, miscSettings.img32x32)
    .setThumbnail(miscSettings.img32shard)

    .setTimestamp()
    .setURL("https://github.com/TeamEGEM/EGEM-Bot")
    .addField("The the most recent block is:", "["+getblock+"](https://explorer.egem.io/block/" +getblock+ ")")

    message.channel.send({embed})
}
