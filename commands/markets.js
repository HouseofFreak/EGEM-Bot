
exports.run = (client, message, args) => {
  return message.channel.send("```"
  +	"List of Markets: \n"
  + "----------------------------------------------- \n"
  + "/btsx - shows the stats on https://bitshares.org/ \n"
  + "/graviex - shows the stats for https://graviex.net/ \n"
  + "/bitebtc - shows the stats for https://bitebtc/ \n"
  + "More coming in time! \n"
  + "-----------------------------------------------  \n"
  + "Having trouble contact a admin.```"
);
}
