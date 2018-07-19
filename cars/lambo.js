
const Web3 = require("web3")
const Discord = require("discord.js");
const botSettings = require("../config.json");
const miscSettings = require("../cfgs/settings.json");
var getJSON = require('get-json');
var web3 = new Web3();
web3.setProvider(new web3.providers.HttpProvider(miscSettings.web3provider));

var carPrice = Number(335167);

exports.run = (client, message, args) => {
  let block = args[0];
  web3.eth.getBalance(args[0], (error,result)=>{
    if(!error){
      if(result !== null){
        var balanceResult = result;
        getJSON('https://api.egem.io/api/v1/egem_prices', function(error, response){
          if(!error) {
            var priceAverage = response["AVERAGEUSD"];
            let balance = (balanceResult/Math.pow(10,18)).toFixed(2);
            let balanceCompare = Number(balance)*Number(priceAverage);
            let balanceRequired = carPrice-balanceCompare;
            let balanceRequiredEGEM = balanceRequired/priceAverage;

            const embed = new Discord.RichEmbed()
              .setTitle("EGEM Discord Bot.")
              .setAuthor("TheEGEMBot", miscSettings.egemspin)

              .setColor(miscSettings.okcolor)
              .setDescription("Car Results:")
              .setFooter(miscSettings.footerBranding, miscSettings.img32x32)
              .setThumbnail(miscSettings.img32shard)

              .setTimestamp()
              .setURL("https://github.com/TeamEGEM/EGEM-Bot")
              .addField("Name:", "2016 Lamborghini Aventador")
              .addField("Car Price:", "$ "+ carPrice +" USD")
              .addField("Owned:", balance + " EGEM" + " | " + "$ "+Number(balanceCompare).toFixed(2) + " USD." )
              .addField("Required:", Number(balanceRequiredEGEM).toFixed(2) + " EGEM" + " | " + "$ "+ Number(balanceRequired).toFixed(2) + " USD")

              message.channel.send({embed})
          } else {
            return console.log('**EGEM BOT** GRAVIEX MARKET API ISSUE!');
          }
        })

      } else {
        message.channel.send("Result was null, might be a malformed attempt, please double check and retry.");
      }
    } else {
      message.channel.send("Oops, a error occurred with your lookup try again, its /carname <address>.");
    }
  })
}
