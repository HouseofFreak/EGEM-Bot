
const Discord = require("discord.js");
const botSettings = require("../config.json");
const miscSettings = require("../cfgs/settings.json");
const prefix = botSettings.prefix;
exports.run = (client, message, args) => {
  const embed = new Discord.RichEmbed()
    .setTitle("EGEM Discord Bot.")
    .setAuthor("TheEGEMBot", miscSettings.egemspin)
    /*
     * Alternatively, use "#00AE86", [0, 174, 134] or an integer number.
     */
    .setColor(miscSettings.okcolor)
    .setDescription("Car Command List:")
    .setFooter(miscSettings.footerBranding, miscSettings.img32x32)
    .setThumbnail(miscSettings.img32shard)
    /*
     * Takes a Date object, defaults to current date.
     */
    .setTimestamp()
    .setURL("https://github.com/TeamEGEM/EGEM-Bot")
    .addField(prefix+"lambo", "Lamborghini Aventador")
    .addField(prefix+"bugatti", "Bugatti Veyron")
    .addField(prefix+"bmw", "BMW M6 Coupé")
    .addField(prefix+"ferrari", "FERRARI 488 GTB")
    .addField(prefix+"mercedes", "Mercedes-AMG GT Roadster")
    .addField(prefix+"tesla", "Tesla Model X")
    .addField(prefix+"subaru", "Subaru WRX STI")
    .addField(prefix+"porsche", "Porsche 911")
    .addField(prefix+"prius", "Toyota Prius V")

    message.channel.send({embed})
}
