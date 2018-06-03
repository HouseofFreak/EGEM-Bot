exports.run = (client, message, args) => {
  if(!message.member.hasPermission('ADMINISTRATOR')){
    return message.channel.send("You cannot use '/sprinkle' command");
  }
  var amount = Math.floor((Math.random() * 10) + 1);
  raining(amount,message);
}
