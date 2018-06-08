
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
    .setDescription("Official EGEM Pool List:")
    .setFooter(miscSettings.footerBranding, miscSettings.img32x32)
    .setThumbnail(miscSettings.img32shard)
    /*
     * Takes a Date object, defaults to current date.
     */
    .setTimestamp()
    .setURL("https://github.com/TeamEGEM/EGEM-Bot")
    .addField("EGEM DEV Pool", "https://pool.egem.io/")
    .addField("Minerpool.net (US/EU/ASIA)", "http://egem.minerpool.net/")
    .addField("CoMining.io (US/EU/ASIA)", "https://comining.io/")
    .addField("Protonmine", "http://egem.protonmine.io/")
    .addField("Coins.Farm", "https://coins.farm/pools/egem/")
    .addField("Dopeblocks", "https://dopeblocks.com/")
    .addField("Clona.ru SOLO POOL", "http://clona.ru/")
    .addField("UPOOL.IN", "http://egem.upool.in/")
    .addField("ETHASH.FARM", "http://egem.ethash.farm/")
    .addField("p00l.org", "https://egem.p00l.org/")
    .addField("BYLT.GQ", "https://egem.bylt.gq/")
    .addField("XMINER.CF", "http://egem.xminer.cf/")

    message.channel.send({embed})
}
