
const Discord = require("discord.js");
const miscSettings = require("../cfgs/settings.json");
var getJSON = require('get-json');

exports.run = (client, message, args) => {
  var btcPrice = getJSON('https://bitebtc.com/api/v1/ticker?market=egem_btc', function(error, response){
		if(!error) {
      var volume = response["result"]["volume"];
      var high = response["result"]["high"];
      var low = response["result"]["low"];
      var open = response["result"]["open"];
      var price = response["result"]["price"];
      var average = response["result"]["average"];
      var percent = response["result"]["percent"];
      var timestamp = response["result"]["timestamp"];
      var dt = new Date(timestamp*1000);
      const embed = new Discord.RichEmbed()
        .setTitle("EGEM Discord Bot.")
        .setAuthor("TheEGEMBot", miscSettings.egemspin)
        /*
         * Alternatively, use "#00AE86", [0, 174, 134] or an integer number.
         */
        .setColor(miscSettings.okcolor)
        .setDescription(":ledger: BiteBTC Market Data:")
        .setFooter("© EGEM.io", miscSettings.img32x32)
        .setThumbnail(miscSettings.img32shard)
        /*
         * Takes a Date object, defaults to current date.
         */
        .setTimestamp()
        .setURL("https://github.com/TeamEGEM/EGEM-Bot")
        .addField("Volume", volume+" EGEM", true)
        .addField("High", high+" BTC", true)
        .addField("Low", low+" BTC", true)
        .addField("Open", open+" BTC", true)
        .addField("Price", price+" BTC", true)
        .addField("Average", average+" BTC", true)
        .addField("Percent", percent+" %", true)
        .addField("Bitcoin Pair", "[EGEM/BTC :scales:](https://bitebtc.com/trade/egem_btc)", true)
        .addField("Timestamp", dt+".", true)

        message.channel.send({embed})
		} else {
			console.log('**EGEM BOT** GRAVIEX MARKET API ISSUE!');
		}
	})
}
