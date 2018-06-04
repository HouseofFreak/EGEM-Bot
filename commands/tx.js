const Web3 = require("web3")
const Discord = require("discord.js");
const botSettings = require("../config.json");
const miscSettings = require("../cfgs/settings.json");
var web3 = new Web3();
web3.setProvider(new web3.providers.HttpProvider('http://localhost:16661'));

exports.run = (client, message, args) => {
  let block = args[0];
  web3.eth.getTransaction(args[0], (error,result)=>{
    if(!error){
      if(result !== null){
        let minedBlock = result["blockNumber"];
        let from = result["from"];
        let to = result["to"];
        let valueRaw = result["value"];
        let value = (valueRaw/Math.pow(10,18)).toFixed(8);
        let nonce = result["nonce"];
        const embed = new Discord.RichEmbed()
          .setTitle("EGEM Discord Bot.")
          .setAuthor("TheEGEMBot", miscSettings.egemspin)
          /*
           * Alternatively, use "#00AE86", [0, 174, 134] or an integer number.
           */
          .setColor(miscSettings.okcolor)
          .setDescription("Transaction Lookup Results:")
          .setFooter("© EGEM.io", miscSettings.img32x32)
          .setThumbnail(miscSettings.img32shard)
          /*
           * Takes a Date object, defaults to current date.
           */
          .setTimestamp()
          .setURL("https://github.com/TeamEGEM/EGEM-Bot")
          .addField("Mined in Block:", minedBlock)
          .addField("From:", "["+from+"](http://explorer.egem/addr/" +from + ")")
          .addField("To:", to)
          .addField("Value:", value)
          .addField("Nonce:", nonce)

          message.channel.send({embed})
      } else {
        message.channel.send("Transaction result was null, might be a malformed attempt, please double check and retry.");
      }
    } else {
      message.channel.send("Oops, a error occurred with your tx lookup try again, its /tx <txhash>.");
    }
  })
}
