"use strcit";

// Settings and Requires
var getJSON = require('get-json');
var _ = require('lodash');
const Web3 = require("web3");
const Discord = require("discord.js");
const BigNumber = require('bignumber.js');
const Tx = require("ethereumjs-tx");
const ContractFactory = require("ethereum-contracts");
const fs = require("fs");
const randomWord = require('random-word');
//const BN = require('bn.js');

const botSettings = require("../config.json");
const miscSettings = require("../cfgs/settings.json");
const botChans = require("../cfgs/botchans.json");
const block = require("../functions/getblock.js");
const supply = require("../functions/getsup.js");

// Update Data
//setInterval(block,miscSettings.blockDelay);
//setInterval(supply,miscSettings.supplyDelay);

let cooldown = new Set();
let rollcooldown = new Set();
let trialcooldown = new Set();
let blackjackcooldown = new Set();

// EtherGem web3
var web3 = new Web3();
web3.setProvider(new web3.providers.HttpProvider(miscSettings.web3provider));

const prefix = botSettings.prefix;
const bot = new Discord.Client({disableEveryone:true});

bot.on('ready', ()=>{
	console.log("**GAME THREAD** is now Online.");
	bot.channels.get(botChans.botChannelId).send("**GAME THREAD** is now **Online.**");
});

// Thread console heartbeat
const threadHB = function sendHB(){
	console.log("**GAME THREAD** is ACTIVE");
};
setInterval(threadHB,miscSettings.HBDelay);

// Main sending function.
function sendCoins(address,value,message,name){
	web3.eth.sendTransaction({
	    from: botSettings.address,
	    to: address,
	    gas: web3.utils.toHex(miscSettings.txgas),
	    value: numberToString(value)
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

				.setColor(miscSettings.okcolor)
				.setDescription("Bot Transaction")
				.setFooter(miscSettings.footerBranding, miscSettings.img32x32)
				.setThumbnail(miscSettings.img32shard)

				.setTimestamp()
				.setURL("https://github.com/TeamEGEM/EGEM-Bot")
				.addField("EGEM Sent:", "["+hash+"](https://explorer.egem.io/tx/" +hash+ ")")
				message.channel.send({embed})
		}

	})
	.on('error', console.error);
}

// Number to string work around for bignumber and scientific-notation.
function numberToString(num){
    let numStr = String(num);

    if (Math.abs(num) < 1.0)
    {
        let e = parseInt(num.toString().split('e-')[1]);
        if (e)
        {
            let negative = num < 0;
            if (negative) num *= -1
            num *= Math.pow(10, e - 1);
            numStr = '0.' + (new Array(e)).join('0') + num.toString().substring(2);
            if (negative) numStr = "-" + numStr;
        }
    }
    else
    {
        let e = parseInt(num.toString().split('+')[1]);
        if (e > 20)
        {
            e -= 20;
            num /= Math.pow(10, e);
            numStr = num.toString() + (new Array(e + 1)).join('0');
        }
    }

    return numStr;
}

// Raining command to send users coin.
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

		.setColor(miscSettings.okcolor)
		.setDescription("Raindrops:")
		.setFooter(miscSettings.footerBranding, miscSettings.img32x32)
		.setThumbnail(miscSettings.img32shard)

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

// return array with names of online users
function getOnline(){
	var foo = [];
	var users = bot.users;
	users.keyArray().forEach((val) => {
		var userName = users.get(val).id;
		var status = users.get(val).presence.status;
		if(status == "online"){
			foo.push(userName);
		}
	});
	return foo;
}

// Get data from files.
function getJson(){ return JSON.parse(fs.readFileSync('data/users.json'));}
function getTXJson(){ return JSON.parse(fs.readFileSync('data/txlist.json'));}

// Main file bot commands
bot.on('message',async message => {

	// Not admins cannot use bot in general channel
	if(message.channel.name === '🌐🗣-general' && !message.member.hasPermission('ADMINISTRATOR')) return;
	if(message.channel.name === 'coincheckbot') return;
	if(message.author.bot) return;
	if(message.channel.type === "dm") return;

	var message = message;
	let args = message.content.split(' ');

// Start of the games section.

/*
* Risk it All
*/

if(message.content.startsWith(prefix + "riskit ")){
	if(message.channel.name != '🎰-risk-it-all') return;
	let botBalance = await web3.eth.getBalance(botSettings.address)/Math.pow(10,18);
	var author = message.author.id;
	var tx = args[1];
	let txdata = getTXJson();
		if(Object.keys(txdata).includes(tx)){
			const embed = new Discord.RichEmbed()
				.setTitle("EGEM Discord Bot.")
				.setAuthor("TheEGEMBot", miscSettings.egemspin)

				.setColor(miscSettings.warningcolor)
				.setDescription("EGEM Risk It All Game:")
				.setFooter(miscSettings.footerBranding, miscSettings.img32x32)
				.setThumbnail(miscSettings.dice32)

				.setTimestamp()
				.setURL("https://github.com/TeamEGEM/EGEM-Bot")
				.addField("This TX has been claimed, and is no longer valid. Please send a new TX to the bot.", "Please try again.")

			return message.channel.send({embed});
		} else {
		web3.eth.getTransaction(args[1], (error,result)=>{
	    if(!error){
	      if(result !== null){
						let to = result["to"];
						let from = result["from"];
		        let valueRaw = result["value"];
						let minedBlock = result["blockNumber"];
		        let value = (valueRaw/Math.pow(10,18)).toFixed(8);
						txdata[tx] = author;
						var winAmount = value*2;
						var lossAmount = value/4;

						var winWeiAmount = winAmount*Math.pow(10,18);
						var lossWeiAmount = lossAmount*Math.pow(10,18);
						let roll = Math.floor((Math.random() * 10) + 1);
						let bot = web3.utils.toChecksumAddress(botSettings.address);

						let safeBet = winAmount*1.01;
						let safeBet2 = Number(safeBet);
						let botBalance2 = Number(botBalance);

						if (args[2] !== "") {
							var address = web3.utils.toChecksumAddress(args[2]);
						} else {
							var address = args[2];
						}

						if (minedBlock == null) {
							const embed = new Discord.RichEmbed()
								.setTitle("EGEM Discord Bot.")
								.setAuthor("TheEGEMBot", miscSettings.egemspin)

								.setColor(miscSettings.warningcolor)
								.setDescription("EGEM Risk It All Game:")
								.setFooter(miscSettings.footerBranding, miscSettings.img32x32)
								.setThumbnail(miscSettings.dice32)

								.setTimestamp()
								.setURL("https://github.com/TeamEGEM/EGEM-Bot")
								.addField("Transaction not mined yet please wait.", "Please try again.")

							return message.channel.send({embed});
						}

						if (botBalance2 < safeBet2) {
							console.log(safeBet2);
							const embed = new Discord.RichEmbed()
								.setTitle("EGEM Discord Bot.")
								.setAuthor("TheEGEMBot", miscSettings.egemspin)

								.setColor(miscSettings.warningcolor)
								.setDescription("EGEM Risk It All Game:")
								.setFooter(miscSettings.footerBranding, miscSettings.img32x32)
								.setThumbnail(miscSettings.dice32)

								.setTimestamp()
								.setURL("https://github.com/TeamEGEM/EGEM-Bot")
								.addField("Bot cant cover the bet, try when it has more funds.", "Thank you for playing.")
								.addField("Player's Bet: ", Number(value).toFixed(4))
								.addField("Safe Bet Limit: ", safeBet2)
								.addField("Bot Balance: ", botBalance2)

							return message.channel.send({embed});
						}

						if(!web3.utils.isAddress(args[2])){
							const embed = new Discord.RichEmbed()
								.setTitle("EGEM Discord Bot.")
								.setAuthor("TheEGEMBot", miscSettings.egemspin)

								.setColor(miscSettings.warningcolor)
								.setDescription("EGEM Risk It All Game:")
								.setFooter(miscSettings.footerBranding, miscSettings.img32x32)
								.setThumbnail(miscSettings.dice32)

								.setTimestamp()
								.setURL("https://github.com/TeamEGEM/EGEM-Bot")
								.addField("Address didn't pass checksum, or is empty, or has an extra space.", "Please try again.")

							return message.channel.send({embed});
						}

						if (to !== bot) {
							const embed = new Discord.RichEmbed()
								.setTitle("EGEM Discord Bot.")
								.setAuthor("TheEGEMBot", miscSettings.egemspin)

								.setColor(miscSettings.warningcolor)
								.setDescription("EGEM Risk It All Game:")
								.setFooter(miscSettings.footerBranding, miscSettings.img32x32)
								.setThumbnail(miscSettings.dice32)

								.setTimestamp()
								.setURL("https://github.com/TeamEGEM/EGEM-Bot")
								.addField("You can't claim this TX, please send a new TX to the bot.", "Please try again.")

							return message.channel.send({embed});
						}

						if (from !== address) {
							const embed = new Discord.RichEmbed()
								.setTitle("EGEM Discord Bot.")
								.setAuthor("TheEGEMBot", miscSettings.egemspin)

								.setColor(miscSettings.warningcolor)
								.setDescription("EGEM Risk It All Game:")
								.setFooter(miscSettings.footerBranding, miscSettings.img32x32)
								.setThumbnail(miscSettings.dice32)

								.setTimestamp()
								.setURL("https://github.com/TeamEGEM/EGEM-Bot")
								.addField("The return address must match the TX address, prevents others from claiming.", "Please try again.")

							return message.channel.send({embed});
						}

						if (roll >= 9) {
								const embed = new Discord.RichEmbed()
									.setTitle("EGEM Discord Bot.")
									.setAuthor("TheEGEMBot", miscSettings.egemspin)

									.setColor(miscSettings.okcolor)
									.setDescription("EGEM Risk It All Game:")
									.setFooter(miscSettings.footerBranding, miscSettings.img32x32)
									.setThumbnail(miscSettings.dice32)

									.setTimestamp()
									.setURL("https://github.com/TeamEGEM/EGEM-Bot")
									.addField("You Won!", "You doubled your wager.")
									.addField("Roll Results:", "You rolled a " + roll + ".")
									.addField("Amount Won:", winAmount + " EGEM.")

								message.channel.send({embed})
								let address = web3.utils.toChecksumAddress(args[2]);
								sendCoins(address,winWeiAmount,message,1); // main function
						} else {
								const embed = new Discord.RichEmbed()
									.setTitle("EGEM Discord Bot.")
									.setAuthor("TheEGEMBot", miscSettings.egemspin)

									.setColor(miscSettings.warningcolor)
									.setDescription("EGEM Risk It All Game:")
									.setFooter(miscSettings.footerBranding, miscSettings.img32x32)
									.setThumbnail(miscSettings.dice32)

									.setTimestamp()
									.setURL("https://github.com/TeamEGEM/EGEM-Bot")
									.addField("Sorry you didnt win, better luck next time.", "Thank you for playing.")
									.addField("Roll Results:", "You rolled a " + roll + ".")
									.addField("Amount Returned:", lossAmount + " EGEM.")

								message.channel.send({embed})
								sendCoins(address,lossWeiAmount,message,1); // main function
						}
						//console.log(value);
						//console.log(txdata);
						//console.log(to);
						//console.log(roll);


						fs.writeFile(miscSettings.txlistpath, JSON.stringify(txdata), (err) => {
							if (err) throw err;
						});
				}
			}})
		}
}

/*
* One hand of blackjack
*/

if(message.content.startsWith(prefix + "onehandbj")){

	// get the cards for the hands
	let dealerhand1 = Math.floor((Math.random() * 13) + 1);
	let playerhand1 = Math.floor((Math.random() * 13) + 1);
	let dealerhand2 = Math.floor((Math.random() * 13) + 1);
	let playerhand2 = Math.floor((Math.random() * 13) + 1);

	var dealerhand = dealerhand1+dealerhand2;
	var playerhand = playerhand1+playerhand2;

	// set and check amount
	let amount = args[1];
	// if no amount exit
	if (!amount) return;
  // if amount more than 10 exit
	if(amount > 1) {
		const embed = new Discord.RichEmbed()
			.setTitle("EGEM Discord Bot.")
			.setAuthor("TheEGEMBot", miscSettings.egemspin)

			.setColor(miscSettings.warningcolor)
			.setDescription("EGEM One Hand Of BlackJack Game:")
			.setFooter(miscSettings.footerBranding, miscSettings.img32x32)
			.setThumbnail(miscSettings.blackjack)

			.setTimestamp()
			.setURL("https://github.com/TeamEGEM/EGEM-Bot")
			.addField("Only noobs try to cheat, MAX 1 EGEM.", "Thank you.")

			message.channel.send({embed})
			return;
	}
	//convert amount to wei
	let weiAmount = amount*Math.pow(10,18);

	if(message.channel.name != '🃏-blackjack') return;
		if(blackjackcooldown.has(message.author.id)) {
		const embed = new Discord.RichEmbed()
			.setTitle("EGEM Discord Bot.")
			.setAuthor("TheEGEMBot", miscSettings.egemspin)

			.setColor(miscSettings.warningcolor)
			.setDescription("EGEM One Hand Of BlackJack Game:")
			.setFooter(miscSettings.footerBranding, miscSettings.img32x32)
			.setThumbnail(miscSettings.blackjack)

			.setTimestamp()
			.setURL("https://github.com/TeamEGEM/EGEM-Bot")
			.addField("You need to wait 6 mins to play again.", "Thank you.")

			message.channel.send({embed})
			return;
		}

		var user = message.author.id;
		let data = getJson();
		if(Object.keys(data).includes(user)){
		let address = data[user];

		// never less than two.
		if (dealerhand < 2) { let dealerhand = 2; }
		if (playerhand < 2) { let playerhand = 2; }

		if (playerhand <= dealerhand) {
			if (dealerhand <= 21) {
				var dealresults = "You lost, the dealer had the higher or equal hand. ❌";
				var winamount = 0;
			} else {
				var dealresults = "You Won, the dealer has busted. 🏆";
				var winamount = amount;
				sendCoins(address,weiAmount,message,1); // main function
			}
		} else {
			if (playerhand <= 21) {
				var dealresults = "You beat the dealer this hand. 🏆";
				var winamount = amount;
				sendCoins(address,weiAmount,message,1); // main function
			} else {
				var dealresults = "You lost, you have busted. ❌";
				var winamount = 0;
			}
		}

		const embed = new Discord.RichEmbed()
			.setTitle("EGEM Discord Bot.")
			.setAuthor("TheEGEMBot", miscSettings.egemspin)

			.setColor(miscSettings.okcolor)
			.setDescription("EGEM One Hand Of BlackJack Game:")
			.setFooter(miscSettings.footerBranding, miscSettings.img32x32)
			.setThumbnail(miscSettings.blackjack)

			.setTimestamp()
			.setURL("https://github.com/TeamEGEM/EGEM-Bot")
			.addField("Dealer shuffles the deck.", "Here are your cards for this round.")
			.addField("🧙 Dealer Hand:", "🃏 " + dealerhand1 + " 🃏 " + dealerhand2 + " = " + "( " + dealerhand + " )")
			.addField("🧟 Player Hand:", "🃏 " + playerhand1 + " 🃏 " + playerhand2 + " = " + "( " + playerhand + " )")
			.addField("Results:", dealresults)
			.addField("Winnings:", winamount + " EGEM")

		message.channel.send({embed})
		//sendCoins(address,weiAmount,message,1); // main function
		// Adds the user to the set so that they can't talk for x
		blackjackcooldown.add(message.author.id);
		setTimeout(() => {
			// Removes the user from the set after a minute
			blackjackcooldown.delete(message.author.id);
		}, miscSettings.cdblackjack);

	} else {
		const embed = new Discord.RichEmbed()
			.setTitle("EGEM Discord Bot.")
			.setAuthor("TheEGEMBot", miscSettings.egemspin)

			.setColor(miscSettings.warningcolor)
			.setDescription("EGEM One Hand Of BlackJack Game:")
			.setFooter(miscSettings.footerBranding, miscSettings.img32x32)
			.setThumbnail(miscSettings.blackjack)

			.setTimestamp()
			.setURL("https://github.com/TeamEGEM/EGEM-Bot")
			.addField("User Not Registered", user)

			message.channel.send({embed});
	}
}

/*
* Time Trial Game.
*/

if(message.content == prefix + "timetrial"){
	if(message.channel.name != '🏁-timetrial') return;
		if(trialcooldown.has(message.author.id)) {
		const embed = new Discord.RichEmbed()
			.setTitle("EGEM Discord Bot.")
			.setAuthor("TheEGEMBot", miscSettings.egemspin)

			.setColor(miscSettings.warningcolor)
			.setDescription("EGEM Time Trial Game:")
			.setFooter(miscSettings.footerBranding, miscSettings.img32x32)
			.setThumbnail(miscSettings.stopwatch)

			.setTimestamp()
			.setURL("https://github.com/TeamEGEM/EGEM-Bot")
			.addField("You need to wait 60s to play again.", "Thank you.")

			message.channel.send({embed})
			return;
		}

		var user = message.author.id;
		let data = getJson();
		if(Object.keys(data).includes(user)){
		let address = data[user];
		const embed = new Discord.RichEmbed()
			.setTitle("EGEM Discord Bot.")
			.setAuthor("TheEGEMBot", miscSettings.egemspin)

			.setColor(miscSettings.okcolor)
			.setDescription("EGEM Time Trial:")
			.setFooter(miscSettings.footerBranding, miscSettings.img32x32)
			.setThumbnail(miscSettings.stopwatch)

			.setTimestamp()
			.setURL("https://github.com/TeamEGEM/EGEM-Bot")
			.addField("START!", "You have 15 Seconds to get the correct number between 1 - 30")

		message.channel.send({embed})
		.then(() => {
			var number = Math.floor((Math.random() * 30) + 1)
			console.log(number)
	  	message.channel.awaitMessages(response => response.content == Number(number), {
	    max: 1,
	    time: 15000,
	    errors: ['time'],
		})
	  .then((collected) => {
			let amount = (Math.random() * (0.100 - 0.0050) + 0.0050).toFixed(8);
			let weiAmount = amount*Math.pow(10,18);
			const embed = new Discord.RichEmbed()
				.setTitle("EGEM Discord Bot.")
				.setAuthor("TheEGEMBot", miscSettings.egemspin)

				.setColor(miscSettings.okcolor)
				.setDescription("EGEM Time Trial Game:")
				.setFooter(miscSettings.footerBranding, miscSettings.img32x32)
				.setThumbnail(miscSettings.stopwatch)

				.setTimestamp()
				.setURL("https://github.com/TeamEGEM/EGEM-Bot")
				.addField("WINNER! :first_place: "+ Number(amount)+" EGEM", "@" + message.author.username + " The correct number is: " +number)

			message.channel.send({embed})
			sendCoins(address,weiAmount,message,1); // main function
			// Adds the user to the set so that they can't talk for x
			trialcooldown.add(message.author.id);
			setTimeout(() => {
				// Removes the user from the set after a minute
				trialcooldown.delete(message.author.id);
			}, miscSettings.cdtimetrial);
		})
    .catch(() => {
			const embed = new Discord.RichEmbed()
				.setTitle("EGEM Discord Bot.")
				.setAuthor("TheEGEMBot", miscSettings.egemspin)

				.setColor(miscSettings.warningcolor)
				.setDescription("EGEM Time Trial Game:")
				.setFooter(miscSettings.footerBranding, miscSettings.img32x32)
				.setThumbnail(miscSettings.stopwatch)

				.setTimestamp()
				.setURL("https://github.com/TeamEGEM/EGEM-Bot")
				.addField("NO WINNER!", "There was no correct answer within the time limit!")

			message.channel.send({embed})
    });
	});
	} else {
		const embed = new Discord.RichEmbed()
			.setTitle("EGEM Discord Bot.")
			.setAuthor("TheEGEMBot", miscSettings.egemspin)

			.setColor(miscSettings.warningcolor)
			.setDescription("EGEM Dice Game:")
			.setFooter(miscSettings.footerBranding, miscSettings.img32x32)
			.setThumbnail(miscSettings.stopwatch)

			.setTimestamp()
			.setURL("https://github.com/TeamEGEM/EGEM-Bot")
			.addField("User Not Registered", user)

			message.channel.send({embed});
	}
	}

/*
* Dice Game.
*/

if(message.content.startsWith(prefix + "roll")){
	if(message.channel.name != '🎲-roll') return;
		if(rollcooldown.has(message.author.id)) {
		const embed = new Discord.RichEmbed()
      .setTitle("EGEM Discord Bot.")
      .setAuthor("TheEGEMBot", miscSettings.egemspin)

      .setColor(miscSettings.warningcolor)
      .setDescription("EGEM Dice Game:")
      .setFooter(miscSettings.footerBranding, miscSettings.img32x32)
      .setThumbnail(miscSettings.dice32)

      .setTimestamp()
      .setURL("https://github.com/TeamEGEM/EGEM-Bot")
      .addField("You need to wait 2 mins to roll again", "Thank you.")

      message.channel.send({embed})
		} else {
	    let number = Math.floor((Math.random() * 16) + 1)
	    let word = randomWord();

			var user = message.author.id;

			let data = getJson();
			if(Object.keys(data).includes(user)){
				let address = data[user];
				if(number >= 12) {
					let prize = "You won some coins! Congrats! :trophy:";
					let score = "High roll! :game_die:"
					let amount = (Math.random() * (0.020 - 0.0050) + 0.0050).toFixed(8);
					let weiAmount = amount*Math.pow(10,18);
					const embed = new Discord.RichEmbed()
						.setTitle("EGEM Discord Bot.")
						.setAuthor("TheEGEMBot", miscSettings.egemspin)

						.setColor(miscSettings.okcolor)
						.setDescription("EGEM Dice Game:")
						.setFooter(miscSettings.footerBranding, miscSettings.img32x32)
						.setThumbnail(miscSettings.dice32)

						.setTimestamp()
						.setURL("https://github.com/TeamEGEM/EGEM-Bot")
						.addField("The dice hit the table and you get:", "**"+number+"**", true)
						.addField("Winner:", message.author.username, true)
						.addField("Reward Score:", score)
						.addField("Roll Prize:", prize)
						.addField("EGEM:", amount)
						.addField("And the random word for this roll is:", ":satellite: " +"["+word+"](https://www.google.ca/search?q=" +word+ ")")

						message.channel.send({embed})

						sendCoins(address,weiAmount,message,1); // main function
						// Adds the user to the set so that they can't talk for x
						rollcooldown.add(message.author.id);
						setTimeout(() => {
							// Removes the user from the set after a minute
							rollcooldown.delete(message.author.id);
						}, miscSettings.cdroll);
				} else if (number >= 8) {
					let prize = "You won some coins! Congrats! :trophy:";
					let score = "Medium roll! :game_die:"
					let amount = (Math.random() * (0.010 - 0.0050) + 0.0100).toFixed(8);
					let weiAmount = amount*Math.pow(10,18);
					const embed = new Discord.RichEmbed()
						.setTitle("EGEM Discord Bot.")
						.setAuthor("TheEGEMBot", miscSettings.egemspin)

						.setColor(miscSettings.okcolor)
						.setDescription("EGEM Dice Game:")
						.setFooter(miscSettings.footerBranding, miscSettings.img32x32)
						.setThumbnail(miscSettings.dice32)

						.setTimestamp()
						.setURL("https://github.com/TeamEGEM/EGEM-Bot")
						.addField("The dice hit the table and you get:", "**"+number+"**", true)
						.addField("Winner:", message.author.username, true)
						.addField("Reward Score:", score)
						.addField("Roll Prize:", prize)
						.addField("EGEM:", amount)
						.addField("And the random word for this roll is:", ":satellite: " +"["+word+"](https://www.google.ca/search?q=" +word+ ")")

						message.channel.send({embed})

						sendCoins(address,weiAmount,message,1); // main function
						// Adds the user to the set so that they can't talk for x
						rollcooldown.add(message.author.id);
						setTimeout(() => {
							// Removes the user from the set after a minute
							rollcooldown.delete(message.author.id);
						}, miscSettings.cdroll);
				} else {
					let prize = "Nothing, you need to roll a 8 or higher. :point_left:";
					let amount = "Zero";
					let score = "Low roll! :game_die:"
					const embed = new Discord.RichEmbed()
						.setTitle("EGEM Discord Bot.")
						.setAuthor("TheEGEMBot", miscSettings.egemspin)

						.setColor(miscSettings.warningcolor)
						.setDescription("EGEM Dice Game:")
						.setFooter(miscSettings.footerBranding, miscSettings.img32x32)
						.setThumbnail(miscSettings.dice32)

						.setTimestamp()
						.setURL("https://github.com/TeamEGEM/EGEM-Bot")
						.addField("The dice hit the table and you get:", "**"+number+"**", true)
						.addField("You Lost:", message.author.username, true)
						.addField("Reward Score:", score)
						.addField("Roll Prize:", prize)
						.addField("EGEM:", amount)
						.addField("And the random word for this roll is:", ":satellite: " +"["+word+"](https://www.google.ca/search?q=" +word+ ")")

						message.channel.send({embed})

						// Adds the user to the set so that they can't talk for x
						rollcooldown.add(message.author.id);
						setTimeout(() => {
							// Removes the user from the set after a minute
							rollcooldown.delete(message.author.id);
						}, miscSettings.cdroll);
				}

			} else {
				const embed = new Discord.RichEmbed()
					.setTitle("EGEM Discord Bot.")
					.setAuthor("TheEGEMBot", miscSettings.egemspin)

					.setColor(miscSettings.warningcolor)
					.setDescription("EGEM Dice Game:")
					.setFooter(miscSettings.footerBranding, miscSettings.img32x32)
					.setThumbnail(miscSettings.dice32)

					.setTimestamp()
					.setURL("https://github.com/TeamEGEM/EGEM-Bot")
					.addField("User Not Registered", user)

					message.channel.send({embed});
			}
   }
}

})

bot.on('error', console.error);
// Login the bot.
bot.login(botSettings.token);
