// Settings and Requires
var _ = require('lodash');
const Web3 = require("web3");
const Discord = require("discord.js");
const BigNumber = require('bignumber.js');
const Tx = require("ethereumjs-tx");
const ContractFactory = require("ethereum-contracts");
const solc = require("solc");
const fs = require("fs");
const randomWord = require('random-word');

const botSettings = require("./config.json");
const miscSettings = require("./cfgs/settings.json");

function sendCoins(address,value,message,name){

	web3.eth.sendTransaction({
	    from: botSettings.address,
	    to: address,
	    gas: web3.utils.toHex(miscSettings.txgas),
	    value: value
	})
	.on('transactionHash', function(hash){
		// sent pm with their tx
		// recive latest array
		if(name != 1){
			let fValue = value/Math.pow(10,18).toFixed(8);
			let author = bot.users.find('id',name);
			author.send("Hi "+name+" , you are a lucky human. You just got " + fValue + " EGEM \n Check the following for your prize:\n  https://explorer.egem.io/tx/"+ hash);
		} else {
			const embed = new Discord.RichEmbed()
				.setTitle("EGEM Discord Bot.")
				.setAuthor("TheEGEMBot", miscSettings.egemspin)
				/*
				 * Alternatively, use "#00AE86", [0, 174, 134] or an integer number.
				 */
				.setColor(miscSettings.okcolor)
				.setDescription("User Tip:")
				.setFooter("© EGEM.io", miscSettings.img32x32)
				.setThumbnail(miscSettings.img32shard)
				/*
				 * Takes a Date object, defaults to current date.
				 */
				.setTimestamp()
				.setURL("https://github.com/TeamEGEM/EGEM-Bot")
				.addField("Tip was sent. \n Check hash: https://explorer.egem.io/tx/"+ hash, "Please wait 2 hours to TIP again.")

				message.channel.send({embed})
		}

	})
	.on('error', console.error);
}

function raining(amount,message){
	// registered users
	var data = getJson();
	// online users
	var onlineUsers = getOnline();
	// create online and register array
	var onlineAndRegister = Object.keys(data).filter(id => {return onlineUsers.indexOf(id)!=-1});
	// create object with name - address and name - values
	var latest = {};
	for (let user of onlineAndRegister) {
	  if (data[user]) {
	    latest[data[user]] = user;
	  }
	}
	// if use wrong amount (string or something)
	var camount = amount/Object.keys(latest).length;
	var weiAmount = camount*Math.pow(10,18);

	const embed = new Discord.RichEmbed()
		.setTitle("EGEM Discord Bot.")
		.setAuthor("TheEGEMBot", miscSettings.egemspin)
		/*
		 * Alternatively, use "#00AE86", [0, 174, 134] or an integer number.
		 */
		.setColor(miscSettings.okcolor)
		.setDescription("Raindrops:")
		.setFooter("© EGEM.io", miscSettings.img32x32)
		.setThumbnail(miscSettings.img32shard)
		/*
		 * Takes a Date object, defaults to current date.
		 */
		.setTimestamp()
		.setURL("https://github.com/TeamEGEM/EGEM-Bot")
		.addField("It just rained on " + Object.keys(latest).length + " users. Check pm's.", "Enjoy the weather everyone!");

		message.channel.send({embed});

	function rainSend(addresses){
		for(const address of Object.keys(addresses)){

			let name = addresses[address];
			sendCoins(address,weiAmount,message,name);
		}
	}
	// main function
	rainSend(latest);
}


exports.run = (client, message, args) => {
  if(!message.member.hasPermission('ADMINISTRATOR')){
    return message.channel.send("You cannot use '/sprinkle' command");
  }
  var amount = Math.floor((Math.random() * 10) + 1);
  raining(amount,message);
}
