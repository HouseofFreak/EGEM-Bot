
var _ = require('lodash');
const Discord = require("discord.js");
const randomWord = require('random-word');
const miscSettings = require("../cfgs/settings.json");
let rollcooldown = new Set();

exports.run = (client, message, args) => {
  if(rollcooldown.has(message.author.id)) {
    const embed = new Discord.RichEmbed()
      .setTitle("EGEM Discord Bot.")
      .setAuthor("TheEGEMBot", miscSettings.egemspin)
      /*
       * Alternatively, use "#00AE86", [0, 174, 134] or an integer number.
       */
      .setColor(miscSettings.warningcolor)
      .setDescription("EGEM Dice Game:")
      .setFooter("© EGEM.io", miscSettings.img32x32)
      .setThumbnail(miscSettings.dice32)
      /*
       * Takes a Date object, defaults to current date.
       */
      .setTimestamp()
      .setURL("https://github.com/TeamEGEM/EGEM-Bot")
      .addField("You need to wait to roll again", "Thank you.")

      message.channel.send({embed})
  } else {
    let array = ['1','2','3','4','5','6','7','8','9','10','11','12'];
    let number = _.sample(array);
    let word = randomWord();
    if(number == 6) {
      var prize = "Try again later."
      var amount = "0";
    } else {
      var prize = "Try again later."
      var amount = "0";
    }
    const embed = new Discord.RichEmbed()
      .setTitle("EGEM Discord Bot.")
      .setAuthor("TheEGEMBot", miscSettings.egemspin)
      /*
       * Alternatively, use "#00AE86", [0, 174, 134] or an integer number.
       */
      .setColor(miscSettings.okcolor)
      .setDescription("EGEM Dice Game:")
      .setFooter("© EGEM.io", miscSettings.img32x32)
      .setThumbnail(miscSettings.dice32)
      /*
       * Takes a Date object, defaults to current date.
       */
      .setTimestamp()
      .setURL("https://github.com/TeamEGEM/EGEM-Bot")
      .addField("The dice hit the table and you get:", number)
      .addField("Roll Prize:", prize + " EGEM: " + amount)
      .addField("And the random word for this roll is:", word + ".", true);

      message.channel.send({embed})
      // Adds the user to the set so that they can't talk for x
      rollcooldown.add(message.author.id);
      setTimeout(() => {
        // Removes the user from the set after a minute
        rollcooldown.delete(message.author.id);
      }, miscSettings.cdroll);
  }
}
