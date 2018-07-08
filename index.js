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

const botSettings = require("./config.json");
const miscSettings = require("./cfgs/settings.json");
const botChans = require("./cfgs/botchans.json");
const block = require("./functions/getblock.js");
const supply = require("./functions/getsup.js");

// Update Data
setInterval(block,miscSettings.blockDelay);
setInterval(supply,miscSettings.supplyDelay);

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
	console.log("**EGEM BOT** is now Online.");
	bot.channels.get(botChans.botChannelId).send("is now **Online.**");
});

// Motd
const motd = function sendMotd(){
	fs.readFile('data/motd.txt', 'utf8', function (err,data) {
	  if (err) {
	    return console.log(err);
	  }
	  //console.log(data);
		const embed = new Discord.RichEmbed()
			.setTitle("EGEM Discord Bot.")
			.setAuthor("TheEGEMBot", miscSettings.egemspin)

			.setColor(miscSettings.okcolor)
			.setDescription("Message of the day.")
			.setFooter(miscSettings.footerBranding, miscSettings.img32x32)
			.setThumbnail(miscSettings.img32shard)

			.setTimestamp()
			.setURL("https://github.com/TeamEGEM/EGEM-Bot")
			.addField("News & Updates:", data)
			.addField("Website:", miscSettings.websiteLink + " :pushpin: ")
			.addField("Forums:", miscSettings.forumLink + " :pushpin: ")
		bot.channels.get(botChans.generalChannelId).send({embed});
	});
};
setInterval(motd,miscSettings.motdDelay);

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
function getSupply(){ return JSON.parse(fs.readFileSync('data/supply.txt'));}
function getBlock(){ return JSON.parse(fs.readFileSync('./data/block.txt'));}

// Function to turn files into commands.
bot.on("message", message => {
	if(message.channel.name === '🌐🗣-general') return;
	if(message.channel.name === 'coincheckbot') return;
	if(message.channel.type === "dm") return;
  if(message.author.bot) return;
  if(message.content.indexOf(botSettings.prefix) !== 0) return;

  // This is the best way to define args. Trust me.
  const args = message.content.slice(botSettings.prefix.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();

  // The list of if/else is replaced with those simple 2 lines:
  try {
    let commandFile = require(`./commands/${command}.js`);
    commandFile.run(bot, message, args);
  } catch (err) {
		console.log("**EGEM BOT** No file for that command, prolly other system in use.")
    //console.error(err);
  }
});

// Main file bot commands
bot.on('message',async message => {

	// Not admins cannot use bot in general channel
	if(message.channel.name === '🌐🗣-general' && !message.member.hasPermission('ADMINISTRATOR')) return;
	if(message.channel.name === 'coincheckbot') return;
	if(message.author.bot) return;
	if(message.channel.type === "dm") return;

	var message = message;
	let args = message.content.split(' ');

// Send to specific address
	if(message.content.startsWith(prefix + "sendToAddress ")){
		if(!message.member.hasPermission('ADMINISTRATOR')){
			return message.channel.send("You cannot use '/send' command.");
		}
		let address = args[1];
		let amount = Number(args[2]);
		// if use wrong amount (string or something)
		if (!amount) return message.channel.send("Error with wrong amount.");
		let weiAmount = amount*Math.pow(10,18);

		if(web3.utils.isAddress(args[1])){
			if(amount>100000){
				message.channel.send("You can't send more than 100000 EGEM.");
			} else {
				// main function
				message.channel.send("You try to send " + amount + " EGEM to " + address + " address.");
				sendCoins(address,weiAmount,message,1);
			}
		} else {
			message.channel.send("Wrong address to send.");
		}
	}

// Purge chat messages.
	if(message.content.startsWith(prefix + "purge ")){
		if(!message.member.hasPermission('ADMINISTRATOR')){
			return message.channel.send("You cannot use '/purge' command.");
		}
		const user = message.mentions.users.first();
		const amount = !!parseInt(message.content.split(' ')[1]) ? parseInt(message.content.split(' ')[1]) : parseInt(message.content.split(' ')[2])
		if (!amount) return message.reply('Must specify an amount to delete!');
		if (!amount && !user) return message.reply('Must specify a user and amount, or just an amount, of messages to purge!');
		message.channel.fetchMessages({
		 limit: amount,
		}).then((messages) => {
		 if (user) {
		 const filterBy = user ? user.id : Client.user.id;
		 messages = messages.filter(m => m.author.id === filterBy).array().slice(0, amount);
		 }
		 message.channel.bulkDelete(messages).catch(error => console.log(error.stack));
		});
	}

// Admin tip a user.
	if(message.content.startsWith(prefix + "tip ")){
		if(!message.member.hasPermission('ADMINISTRATOR')){
			return message.channel.send("You cannot use '/send' command.");
		}
		let user = args[1];
		let amount = Number(args[2]);
		// if use wrong amount (string or something)
		if (!amount) return message.channel.send("Error - you've entered wrong amount.");

		let weiAmount = amount*Math.pow(10,18);
		let data = getJson();
		if(Object.keys(data).includes(user)){
			let address = data[user];
			message.channel.send("A tip of " + amount+ " EGEM has been sent to @"+user  );
			sendCoins(address,weiAmount,message,1); // main function
		} else {
			message.channel.send("This user is not registered.");
		}

	}

// Rain on the online and registered users.
	if(message.content.startsWith(prefix + "rain")){
		if(!message.member.hasPermission('ADMINISTRATOR')){
			return message.channel.send("You cannot use '/rain' command");
		}
		var amount = Number(args[1]);
		if (!amount) return message.channel.send("Error - you've entered wrong amount");
		// main func
		raining(amount,message);
	}

// Sprinkle on some users.
	if(message.content.startsWith(prefix + "sprinkle")){
		if(!message.member.hasPermission('ADMINISTRATOR')){
			return message.channel.send("You cannot use '/rain' command");
		}
		var amount = Math.floor((Math.random() * 10) + 1);
		raining(amount,message);
	}

// Downpour on users
	if(message.content.startsWith(prefix + "downpour")){
		if(!message.member.hasPermission('ADMINISTRATOR')){
			return message.channel.send("You cannot use '/rain' command");
		}
		var amount = Math.floor((Math.random() * 100) + 10);
		raining(amount,message);
	}

// Users can tip each other every 2 hours.
	if(message.content.startsWith(prefix + "usertip ")){
		if(cooldown.has(message.author.id)) {
			const embed = new Discord.RichEmbed()
				.setTitle("EGEM Discord Bot.")
				.setAuthor("TheEGEMBot", miscSettings.egemspin)

				.setColor(miscSettings.okcolor)
				.setDescription("User Tip:")
				.setFooter(miscSettings.footerBranding, miscSettings.img32x32)
				.setThumbnail(miscSettings.img32shard)

				.setTimestamp()
				.setURL("https://github.com/TeamEGEM/EGEM-Bot")
				.addField("Wait 2 hours. - " + message.author.username, "There is a time limit.")

				message.channel.send({embed})
    } else {
			let user = args[1];
			let amount = (Math.random() * (0.120 - 0.0200) + 0.0200).toFixed(4);
			// if use wrong amount (string or something)
			if (!amount) return message.channel.send("Error - you've entered wrong amount.");

			let weiAmount = amount*Math.pow(10,18);
			let data = getJson();
			if(Object.keys(data).includes(user)){
				let address = data[user];
				const embed = new Discord.RichEmbed()
				.setTitle("EGEM Discord Bot.")
				.setAuthor("TheEGEMBot", miscSettings.egemspin)

				.setColor(miscSettings.okcolor)
				.setDescription("User Tip:")
				.setFooter(miscSettings.footerBranding, miscSettings.img32x32)
				.setThumbnail(miscSettings.img32shard)

				.setTimestamp()
				.setURL("https://github.com/TeamEGEM/EGEM-Bot")
				.addField(amount+ " EGEM :gift: has been sent to:",user )

				message.channel.send({embed})
				sendCoins(address,weiAmount,message,1); // main function
				// Adds the user to the set so that they can't talk for x
				cooldown.add(message.author.id);
				setTimeout(() => {
					// Removes the user from the set after a minute
					cooldown.delete(message.author.id);
				}, miscSettings.cdusertip);
			} else {
				message.channel.send("This user is not registered.");
			}

    }
	}

// Set it to rain after X amount of time.
	if(message.content.startsWith(prefix + "forecast ")){
		if(!message.member.hasPermission('ADMINISTRATOR')){
			return message.channel.send("You cannot use '/rain' command");
		}
		let amount = Number(args[1]);
		//if use wrong amount (string or something)
		if(!amount) return message.channel.send("Error - you've entered wrong amount");
		let time = Number(args[2])*3600000;
		if(!time) return message.channel.send("Please, set hours correctly");
		 // 1 hour = 3 600 000 milliseconds
		message.channel.send("Raining will be after **" + args[2] + "** hours.");

		// main func
		setTimeout(function(){
			raining(amount,message);
		},time);

	}

// Pulls info from blockchain and decodes then spits it were needed.
	if(message.content === prefix + "egem"){
		if(message.channel.name != '👾-the-egem-bot') return;
		let txlink = "0x0ee61199c26766809dc5146d30fa7f54876f36f958fc31350abf0d0d9f9dea5b";
		web3.eth.getTransaction(txlink, (error,result)=>{
			let data2decode = result["input"];
			let errorMsg = "Result was null..";
			 output = web3.utils.toAscii(data2decode);
			if(!error){
				message.channel.send("What is EtherGem? \n" + output);
			} else {
				message.channel.send(errorMsg);
			}
		})
	}

// Deploy Reward Spliting Contract
	if(message.content.startsWith(prefix + "split ")){
		var user1 = args[1];
		var user2 = args[2];
		let source = 'contract Split {address constant public user1 = ' + user1 + ';address constant public user2 = ' + user2 + ';function() payable public {if (msg.value > 0) {uint touser2 = msg.value / 2;uint touser1 = msg.value - touser2;user2.transfer(touser2);user1.transfer(touser1)}}}';

		let SplitCompiled = solc.compile(source, 1).contracts[':Split'];
		let Split = new web3.eth.Contract(JSON.parse(SplitCompiled.interface), null, {
    	data: '0x' + SplitCompiled.bytecode
		});
		Split.deploy().send({
    from: botSettings.address,
    gas: '4700000'
		}).then((instance) => {
		    console.log("User deployed a contract at: " + instance.options.address);
				message.author.send("Here is the contract address " + instance.options.address);
				return message.channel.send("User has been sent the address in a pm for privacy, thank you for using the EGEM split contract.");
		    SplitInstance = instance;
		});
	}

// Displays the bots info.
	if(message.content == prefix + "botinfo"){
		let txcount = await web3.eth.getTransactionCount(botSettings.address);
		let balance = await web3.eth.getBalance(botSettings.address)/Math.pow(10,18);
		const embed = new Discord.RichEmbed()
		  .setTitle("EGEM Discord Bot.")
		  .setAuthor("TheEGEMBot", miscSettings.egemspin)

		  .setColor(miscSettings.egemcolor)
		  .setDescription("Current Bot Status:")
		  .setFooter(miscSettings.footerBranding, miscSettings.img32x32)
		  .setThumbnail(miscSettings.img32shard)

		  .setTimestamp()
		  .setURL("https://github.com/TeamEGEM/EGEM-Bot")
		  .addField("Bot Address:", botSettings.address)

		  .addField("Balance:", Number(balance).toFixed(8), true)

		  .addBlankField(true)
		  .addField("Transactions:", Number(txcount), true);

		  message.channel.send({embed});
	}

// Change MOTD message.
	if(message.content.startsWith(prefix + "motd ")){
		if(!message.member.hasPermission('ADMINISTRATOR')){
			return message.channel.send("You cannot use '/motd' command");
		}
		var editedFile = args.slice(1).join(" ");
	  fs.writeFile("data/motd.txt",editedFile, 'ascii',(err)=>{
	    if(err) throw err;
	  });
		//console.log('Message saved!');
		message.channel.send("Message of the day has been saved!");
	}

// Get discord user id.
	if(message.content == prefix + "getid"){
		var user = message.author.username;
		let author = message.author.id;
		const embed = new Discord.RichEmbed()
			.setTitle("EGEM Discord Bot.")
			.setAuthor("TheEGEMBot", miscSettings.egemspin)

			.setColor(miscSettings.okcolor)
			.setDescription("User's Discord Id:")
			.setFooter(miscSettings.footerBranding, miscSettings.img32x32)
			.setThumbnail(miscSettings.img32shard)

			.setTimestamp()
			.setURL("https://github.com/TeamEGEM/EGEM-Bot")
			.addField("Username:", user)
			.addField("Discord Id:", author, true);

			message.channel.send({embed});
	}

// Check to see if registered.
	if(message.content == prefix + "checkreg"){
		var user = message.author.username;
		let author = message.author.id;
		let data = getJson();
		if(Object.keys(data).includes(author)){
			message.channel.send("@"+ user + " already registered, your discord ID is: " + author);
		} else {
			message.channel.send("You are not in the list, use **/register** command fist.");
		}
	}

// Register with the bot.
	if(message.content.startsWith("/register")){
		var user = message.author.username;
		var author = message.author.id;
		var address = args[1];

		if(web3.utils.isAddress(args[1])){
			var data = getJson();
			if(!Object.values(data).includes(address) && !Object.keys(data).includes(author)){
				data[author] = address;
				const embed = new Discord.RichEmbed()
					.setTitle("EGEM Discord Bot.")
					.setAuthor("TheEGEMBot", miscSettings.egemspin)

					.setColor(0x00FF0C)
					.setDescription("User Registration:")
					.setFooter(miscSettings.footerBranding, miscSettings.img32x32)
					.setThumbnail(miscSettings.img32shard)

					.setTimestamp()
					.setURL("https://github.com/TeamEGEM/EGEM-Bot")
					.addField("New User Registered:", user)
					.addField("Discord Id:", author);

					message.channel.send({embed});

				fs.writeFile(botSettings.path, JSON.stringify(data), (err) => {
				  if (err) throw err;
				  console.log('The file has been saved.');
				});

			} else {
				const embed = new Discord.RichEmbed()
					.setTitle("EGEM Discord Bot.")
					.setAuthor("TheEGEMBot", miscSettings.egemspin)

					.setColor(miscSettings.warningcolor)
					.setDescription("Registration Error:")
					.setFooter(miscSettings.footerBranding, miscSettings.img32x32)
					.setThumbnail(miscSettings.img32shard)

					.setTimestamp()
					.setURL("https://github.com/TeamEGEM/EGEM-Bot")
					.addField("User Already Registered", user)

					message.channel.send({embed});
			}
		} else {
			const embed = new Discord.RichEmbed()
				.setTitle("EGEM Discord Bot.")
				.setAuthor("TheEGEMBot", miscSettings.egemspin)

				.setColor(miscSettings.warningcolor)
				.setDescription("Registration Error:")
				.setFooter(miscSettings.footerBranding, miscSettings.img32x32)
				.setThumbnail(miscSettings.img32shard)

				.setTimestamp()
				.setURL("https://github.com/TeamEGEM/EGEM-Bot")
				.addField("Tried to register wrong address. Try another one.", "Correct format is **/register 0xAddress**")

				message.channel.send({embed});
		}
	}

// Change registration with bot.
	if(message.content.startsWith(prefix + "changereg")){
		var user = message.author.username;
		var author = message.author.id;
		var address = args[1];
		if(web3.utils.isAddress(args[1])){
			var data = getJson();
			if(Object.keys(data).includes(author)){
				if(address != data[author]){
					data[author] = address;
					fs.writeFile(botSettings.path, JSON.stringify(data), (err) => {
				  		if (err) throw err;
				  		console.log('The file has been changed.');
					});
					message.channel.send("@" + user + " changed register address to " + address);
				} else {
					message.channel.send("Use another address if you're trying to change your old one.")
				}
			} else {
				message.channel.send("You are not on the list, register your address via **/register** first.");
			}
		} else {
			message.channel.send("@"+user+" tried to register with wrong address. Correct format is **/register 0xAddress**");
		}
	}

// Lists the number of users that are registered.
	if(message.content == prefix + "list"){
		var data = getJson();
		const embed = new Discord.RichEmbed()
			.setTitle("EGEM Discord Bot.")
			.setAuthor("TheEGEMBot", miscSettings.egemspin)

			.setColor(miscSettings.okcolor)
			.setDescription("Registered Users:")
			.setFooter(miscSettings.footerBranding, miscSettings.img32x32)
			.setThumbnail(miscSettings.img32shard)

			.setTimestamp()
			.setURL("https://github.com/TeamEGEM/EGEM-Bot")
			.addField("Total registered users for raindrops.","**" + Object.keys(data).length+ "**.")

		message.channel.send({embed});

	}

// Shows all online users
	if(message.content == prefix + "onlinetotal"){
		if(!message.member.hasPermission('ADMINISTRATOR')){
			return message.channel.send("You cannot use '/onlinetotal' command");
		}
		var online = getOnline();
		message.channel.send("Total list of online users are **" + online+ "**.");
	}

// Shows online users for rain drops.
	if(message.content == prefix + "online"){
		if(!message.member.hasPermission('ADMINISTRATOR')){
			return message.channel.send("You cannot use '/online' command");
		}
		// registered users
		var data = getJson();
		// online users
		var onlineUsers = getOnline();
		// create online and register array
		var onlineAndRegister = Object.keys(data).filter(username => {return onlineUsers.indexOf(username)!=-1});

		message.channel.send("Total list of registered and online users are **" + onlineAndRegister+ "**.");
	}

// Start of the games section.

if(message.content.startsWith(prefix + "bnout ")){
	var bn = args[1];
	var bigN = web3.utils.toBN(bn).toString();
	console.log(bigN)
}


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
				.addField("This TX has been claimed, and is no longer valid. please send a new TX to the bot.", "Thank you for playing.")

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

						var winWeiAmount = (winAmount*Math.pow(10,18)).toString();
						var lossWeiAmount = (lossAmount*Math.pow(10,18)).toString();
						let roll = Math.floor((Math.random() * 10) + 1);
						let bot = web3.utils.toChecksumAddress(botSettings.address);
						let address = web3.utils.toChecksumAddress(args[2]);

						let safeBet = winAmount*1.01;
						let safeBet2 = Number(safeBet).toFixed(0);
						let botBalance2 = Number(botBalance).toFixed(0);

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
								.addField("Transaction not mined yet please wait.", "Thank you for playing.")

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
								.addField("Player's Bet: ", value)
								.addField("Bot Balance: ", botBalance)

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
								.addField("Address didn't pass checksum.", "Thank you for playing.")

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
								.addField("You can't claim this TX, please send a new TX to the bot.", "Thank you for playing.")

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
								.addField("The return address must match the TX address, prevents others from claiming.", "Thank you for playing.")

							return message.channel.send({embed});
						}

						if (roll >= 7) {
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
	if(amount > 2) {
		const embed = new Discord.RichEmbed()
			.setTitle("EGEM Discord Bot.")
			.setAuthor("TheEGEMBot", miscSettings.egemspin)

			.setColor(miscSettings.warningcolor)
			.setDescription("EGEM One Hand Of BlackJack Game:")
			.setFooter(miscSettings.footerBranding, miscSettings.img32x32)
			.setThumbnail(miscSettings.blackjack)

			.setTimestamp()
			.setURL("https://github.com/TeamEGEM/EGEM-Bot")
			.addField("Only noobs try to cheat, MAX 2 EGEM.", "Thank you.")

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
			let amount = (Math.random() * (0.200 - 0.0100) + 0.0100).toFixed(8);
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
      message.channel.send('');
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
					let amount = (Math.random() * (0.030 - 0.0150) + 0.0150).toFixed(8);
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

// Login the bot.
bot.login(botSettings.token);
