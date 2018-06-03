const Web3 = require("web3");
const fs = require("fs");
const Discord = require("discord.js");
const BigNumber = require('bignumber.js');
var web3 = new Web3();
web3.setProvider(new web3.providers.HttpProvider('http://localhost:16661'));

function getJson(){
				return JSON.parse(fs.readFileSync('./data/users.json'));
}
function getPrice(){
				return JSON.parse(fs.readFileSync('./data/usdprice.txt'));
}
function getMPrice(){
				return JSON.parse(fs.readFileSync('./data/mprice.txt'));
}

exports.run = (client, message, args) => {
  let price = getPrice()*getMPrice();
  let author = message.author.id;
  let address = args[0];
  if(address == null){
    // show registered address balance
    let data = getJson();
    if(data[author]){
      web3.eth.getBalance(data[author], (error,result)=>{
        if(!error){
          var title = "null";
          var balance = (result/Math.pow(10,18)).toFixed(8);
          if(balance > 100000){
            var title = "EGEM Super Whale :egemflash: :whale:";
            var next = "You are at MAX rank.";
          } else if(balance > 15000){
            var title = "EGEM Humpback Whale :whale:";
            var next = "100000 EGEM";
          } else if(balance > 5000){
            var title = "EGEM Killer Whale :whale2:";
            var next = "15000 EGEM";
          } else if(balance > 1500){
            var title = "EGEM Shark :shark:";
            var next = "5000 EGEM";
          } else if(balance > 750){
            var title = "EGEM Dolphin :dolphin:";
            var next = "1500 EGEM";
          } else if(balance > 500){
            var title = "EGEM Puffer Fish :blowfish:";
            var next = "750 EGEM";
          } else if(balance > 250){
            var title = "EGEM Octopus :octopus: ";
            var next = "500 EGEM";
          } else if(balance > 100){
            var title = "EGEM Snow Crab :crab:";
            var next = "250 EGEM";
          } else if(balance > 50){
            var title = "EGEM Shrimp :shrimp:";
            var next = "100 EGEM";
          } else if(balance > 5){
            var title = "EGEM Plankton :seedling:";
            var next = "50 EGEM";
          } else if(balance == 0){
            var title = "This balance is empty. :x:";
          } else {
            var title = ":space_invader: You require more EGEM.";
            var next = "5 EGEM";
          }
          const embed = new Discord.RichEmbed()
            .setTitle("EGEM Discord Bot.")
            .setAuthor("TheEGEMBot", miscSettings.egemspin)
            /*
             * Alternatively, use "#00AE86", [0, 174, 134] or an integer number.
             */
            .setColor(miscSettings.okcolor)
            .setDescription("Account Balance:")
            .setFooter("© EGEM.io", miscSettings.img32x32)
            .setThumbnail(miscSettings.img32shard)
            /*
             * Takes a Date object, defaults to current date.
             */
            .setTimestamp()
            .setURL("https://github.com/TeamEGEM/EGEM-Bot")
            .addField("This balance has: ", balance + " EGEM")
            .addField("This users rank is:", title, true)
            .addField("Next rank level:", next, true);

            message.channel.send({embed})
        }
      })
      return
    }
  }
  if(web3.utils.isAddress(args[0])){
    web3.eth.getBalance(args[0], (error,result)=>{
      if(!error){
        var title = "null";
        var balance = (result/Math.pow(10,18)).toFixed(8);
        if(balance > 100000){
          var title = "EGEM Super Whale :egemflash: :whale:";
          var next = "You are at MAX rank.";
        } else if(balance > 15000){
          var title = "EGEM Humpback Whale :whale:";
          var next = "100000 EGEM";
        } else if(balance > 5000){
          var title = "EGEM Killer Whale :whale2:";
          var next = "15000 EGEM";
        } else if(balance > 1500){
          var title = "EGEM Shark :shark:";
          var next = "5000 EGEM";
        } else if(balance > 750){
          var title = "EGEM Dolphin :dolphin:";
          var next = "1500 EGEM";
        } else if(balance > 500){
          var title = "EGEM Puffer Fish :blowfish:";
          var next = "750 EGEM";
        } else if(balance > 250){
          var title = "EGEM Octopus :octopus: ";
          var next = "500 EGEM";
        } else if(balance > 100){
          var title = "EGEM Snow Crab :crab:";
          var next = "250 EGEM";
        } else if(balance > 50){
          var title = "EGEM Shrimp :shrimp:";
          var next = "100 EGEM";
        } else if(balance > 5){
          var title = "EGEM Plankton :seedling:";
          var next = "50 EGEM";
        } else if(balance == 0){
          var title = "This balance is empty. :x:";
        } else {
          var title = ":space_invader: You require more EGEM.";
          var next = "5 EGEM";
        }
        const embed = new Discord.RichEmbed()
          .setTitle("EGEM Discord Bot.")
          .setAuthor("TheEGEMBot", miscSettings.egemspin)
          /*
           * Alternatively, use "#00AE86", [0, 174, 134] or an integer number.
           */
          .setColor(miscSettings.okcolor)
          .setDescription("Account Balance:")
          .setFooter("© EGEM.io", miscSettings.img32x32)
          .setThumbnail(miscSettings.img32shard)
          /*
           * Takes a Date object, defaults to current date.
           */
          .setTimestamp()
          .setURL("https://github.com/TeamEGEM/EGEM-Bot")
          .addField("This balance has: ", balance + " EGEM")
          .addField("This users rank is:", title, true)
          .addField("Next rank level:", next, true);

          message.channel.send({embed})
      } else {
        const embed = new Discord.RichEmbed()
          .setTitle("EGEM Discord Bot.")
          .setAuthor("TheEGEMBot", miscSettings.egemspin)
          /*
           * Alternatively, use "#00AE86", [0, 174, 134] or an integer number.
           */
          .setColor(miscSettings.warningcolor)
          .setDescription("Account Balance:")
          .setFooter("© EGEM.io", miscSettings.img32x32)
          .setThumbnail(miscSettings.img32shard)
          /*
           * Takes a Date object, defaults to current date.
           */
          .setTimestamp()
          .setURL("https://github.com/TeamEGEM/EGEM-Bot")
          .addField("Oops, some problem occured with your address.", "Please try again.")

          message.channel.send({embed})
      }
    })
  } else {
    const embed = new Discord.RichEmbed()
      .setTitle("EGEM Discord Bot.")
      .setAuthor("TheEGEMBot", miscSettings.egemspin)
      /*
       * Alternatively, use "#00AE86", [0, 174, 134] or an integer number.
       */
      .setColor(miscSettings.warningcolor)
      .setDescription("Account Balance:")
      .setFooter("© EGEM.io", miscSettings.img32x32)
      .setThumbnail(miscSettings.img32shard)
      /*
       * Takes a Date object, defaults to current date.
       */
      .setTimestamp()
      .setURL("https://github.com/TeamEGEM/EGEM-Bot")
      .addField("Wrong address, or not registered.", "The command is /register <address> or to check a specific balance its /balance <address>.")

      message.channel.send({embed})
  }
}
