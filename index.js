"use strcit";

// Settings and Requires
var getJSON = require('get-json');
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
const btcprice = require("./functions/btcprice.js");
const egemprice = require("./functions/getegemprice.js");
const block = require("./functions/getblock.js");
const supply = require("./functions/getsup.js");

// Update Data
setInterval(btcprice,60000);
setInterval(egemprice,60000);
setInterval(block,10000);
setInterval(supply,15000);

let cooldown = new Set();
let rollcooldown = new Set();
let trialcooldown = new Set();

// EtherGem web3
var web3 = new Web3();
web3.setProvider(new web3.providers.HttpProvider(miscSettings.web3provider));

const prefix = botSettings.prefix;
const bot = new Discord.Client({disableEveryone:true});

bot.on('ready', ()=>{
	console.log("**EGEM BOT** Discord Bot is Online.");
});

// Main sending function.
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
				.setDescription("Bot Transaction")
				.setFooter("© EGEM.io", miscSettings.img32x32)
				.setThumbnail(miscSettings.img32shard)
				/*
				 * Takes a Date object, defaults to current date.
				 */
				.setTimestamp()
				.setURL("https://github.com/TeamEGEM/EGEM-Bot")
				.addField("EGEM Sent:", "["+hash+"](https://explorer.egem.io/tx/" +hash+ ")")
				message.channel.send({embed})
		}

	})
	.on('error', console.error);
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
function getEgemPrice(){ return JSON.parse(fs.readFileSync('data/egemprice.txt'));}
function getJson(){ return JSON.parse(fs.readFileSync('data/users.json'));}
function getPrice(){ return JSON.parse(fs.readFileSync('data/usdprice.txt'));}
function getSupply(){ return JSON.parse(fs.readFileSync('data/supply.txt'));}
function getBlock(){ return JSON.parse(fs.readFileSync('./data/block.txt'));}


// Function to turn files into commands.
bot.on("message", message => {
	if(message.channel.name != '👾-the-egem-bot') return;
	//if(message.channel.name != 'bots') return;
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
	if(message.channel.name != '👾-the-egem-bot') return;
	//if(message.channel.name != 'bots') return;
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
			if(amount>100){
				message.channel.send("You can't send more than 100 EGEM.");
			} else {
				// main function
				message.channel.send("You try to send " + amount + " EGEM to " + address + " address.");
				sendCoins(address,weiAmount,message,1);
			}
		} else {
			message.channel.send("Wrong address to send.");
		}
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
		  /*
		   * Alternatively, use "#00AE86", [0, 174, 134] or an integer number.
		   */
		  .setColor(miscSettings.egemcolor)
		  .setDescription("Current Bot Status:")
		  .setFooter("© EGEM.io", miscSettings.img32x32)
		  .setThumbnail(miscSettings.img32shard)
		  /*
		   * Takes a Date object, defaults to current date.
		   */
		  .setTimestamp()
		  .setURL("https://github.com/TeamEGEM/EGEM-Bot")
		  .addField("Bot Address:", botSettings.address)
		  /*
		   * Inline fields may not display as inline if the thumbnail and/or image is too big.
		   */
		  .addField("Balance", Number(balance).toFixed(8), true)
		  /*
		   * Blank field, useful to create some space.
		   */
		  .addBlankField(true)
		  .addField("Transactions", Number(txcount), true);

		  message.channel.send({embed});
	}
// Status of the coin.
	if(message.content == prefix + "coin"){

		var block = getBlock();
		var supply = getBlock()*9-5000;
		var priceAvg = "W.I.P";
		var fPrice = getEgemPrice()*getPrice();
		var mCap = fPrice*supply;

		try {

			const embed = new Discord.RichEmbed()
				.setTitle("EGEM Discord Bot.")
				.setAuthor("TheEGEMBot", miscSettings.egemspin)
				/*
				 * Alternatively, use "#00AE86", [0, 174, 134] or an integer number.
				 */
				.setColor(miscSettings.egemcolor)
				.setDescription("Coin Status:")
				.setFooter("© EGEM.io", miscSettings.img32x32)
				.setThumbnail(miscSettings.img32shard)
				/*
				 * Takes a Date object, defaults to current date.
				 */
				.setTimestamp()
				.setURL("https://github.com/TeamEGEM/EGEM-Bot")
				.addField("Ticker:", miscSettings.tickerSymbol, true)

				.addField("Current Block:", "["+block+"](https://explorer.egem.io/block/" +block+ ")", true)
				.addField("Current Supply:", supply, true)
				.addField("Market Cap:", "$" +Number(mCap).toFixed(2)+" USD", true)
				.addField("USD Price:", await Number(fPrice).toFixed(4) + " USD", true)
				.addField("BTC Price:", getEgemPrice(), true)

				message.channel.send({embed});
		}
		catch(err) {
			console.log(err)
		}

	}
// Get discord user id.
	if(message.content == prefix + "getid"){
		var user = message.author.username;
		let author = message.author.id;
		const embed = new Discord.RichEmbed()
			.setTitle("EGEM Discord Bot.")
			.setAuthor("TheEGEMBot", miscSettings.egemspin)
			/*
			 * Alternatively, use "#00AE86", [0, 174, 134] or an integer number.
			 */
			.setColor(miscSettings.okcolor)
			.setDescription("User's Discord Id:")
			.setFooter("© EGEM.io", miscSettings.img32x32)
			.setThumbnail(miscSettings.img32shard)
			/*
			 * Takes a Date object, defaults to current date.
			 */
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
					/*
					 * Alternatively, use "#00AE86", [0, 174, 134] or an integer number.
					 */
					.setColor(0x00FF0C)
					.setDescription("User Registration:")
					.setFooter("© EGEM.io", miscSettings.img32x32)
					.setThumbnail(miscSettings.img32shard)
					/*
					 * Takes a Date object, defaults to current date.
					 */
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
					/*
					 * Alternatively, use "#00AE86", [0, 174, 134] or an integer number.
					 */
					.setColor(miscSettings.warningcolor)
					.setDescription("Registration Error:")
					.setFooter("© EGEM.io", miscSettings.img32x32)
					.setThumbnail(miscSettings.img32shard)
					/*
					 * Takes a Date object, defaults to current date.
					 */
					.setTimestamp()
					.setURL("https://github.com/TeamEGEM/EGEM-Bot")
					.addField("User Already Registered", user)

					message.channel.send({embed});
			}
		} else {
			const embed = new Discord.RichEmbed()
				.setTitle("EGEM Discord Bot.")
				.setAuthor("TheEGEMBot", miscSettings.egemspin)
				/*
				 * Alternatively, use "#00AE86", [0, 174, 134] or an integer number.
				 */
				.setColor(miscSettings.warningcolor)
				.setDescription("Registration Error:")
				.setFooter("© EGEM.io", miscSettings.img32x32)
				.setThumbnail(miscSettings.img32shard)
				/*
				 * Takes a Date object, defaults to current date.
				 */
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
			/*
			 * Alternatively, use "#00AE86", [0, 174, 134] or an integer number.
			 */
			.setColor(miscSettings.okcolor)
			.setDescription("Registered Users:")
			.setFooter("© EGEM.io", miscSettings.img32x32)
			.setThumbnail(miscSettings.img32shard)
			/*
			 * Takes a Date object, defaults to current date.
			 */
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

/*
* Time Trial Game.
*/

if(message.content == prefix + "timetrial"){
		if(trialcooldown.has(message.author.id)) {
		const embed = new Discord.RichEmbed()
			.setTitle("EGEM Discord Bot.")
			.setAuthor("TheEGEMBot", miscSettings.egemspin)
			/*
			 * Alternatively, use "#00AE86", [0, 174, 134] or an integer number.
			 */
			.setColor(miscSettings.warningcolor)
			.setDescription("EGEM Time Trial Game:")
			.setFooter("© EGEM.io", miscSettings.img32x32)
			.setThumbnail(miscSettings.dice32)
			/*
			 * Takes a Date object, defaults to current date.
			 */
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
			/*
			 * Alternatively, use "#00AE86", [0, 174, 134] or an integer number.
			 */
			.setColor(miscSettings.okcolor)
			.setDescription("EGEM Time Trial:")
			.setFooter("© EGEM.io", miscSettings.img32x32)
			.setThumbnail(miscSettings.img32shard)
			/*
			 * Takes a Date object, defaults to current date.
			 */
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
			let amount = (Math.random() * (0.020 - 0.0100) + 0.0100).toFixed(8);
			let weiAmount = amount*Math.pow(10,18);
			const embed = new Discord.RichEmbed()
				.setTitle("EGEM Discord Bot.")
				.setAuthor("TheEGEMBot", miscSettings.egemspin)
				/*
				 * Alternatively, use "#00AE86", [0, 174, 134] or an integer number.
				 */
				.setColor(miscSettings.okcolor)
				.setDescription("EGEM Time Trial Game:")
				.setFooter("© EGEM.io", miscSettings.img32x32)
				.setThumbnail(miscSettings.img32shard)
				/*
				 * Takes a Date object, defaults to current date.
				 */
				.setTimestamp()
				.setURL("https://github.com/TeamEGEM/EGEM-Bot")
				.addField("WINNER! "+ Number(amount)+" EGEM", "@" + message.author.username + " The correct number is: " +number)

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
				/*
				 * Alternatively, use "#00AE86", [0, 174, 134] or an integer number.
				 */
				.setColor(miscSettings.warningcolor)
				.setDescription("EGEM Time Trial Game:")
				.setFooter("© EGEM.io", miscSettings.img32x32)
				.setThumbnail(miscSettings.img32shard)
				/*
				 * Takes a Date object, defaults to current date.
				 */
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
			.addField("User Not Registered", user)

			message.channel.send({embed});
	}
	}

/*
* Dice Game.
*/

if(message.content.startsWith(prefix + "roll")){
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
      .addField("You need to wait 2 mins to roll again", "Thank you.")

      message.channel.send({embed})
		} else {
	    let number = Math.floor((Math.random() * 12) + 1)
	    let word = randomWord();

			var user = message.author.id;

			let data = getJson();
			if(Object.keys(data).includes(user)){
				let address = data[user];
				if(number >= 6) {
					let prize = "You won some coins! :trophy:";
					let amount = (Math.random() * (0.020 - 0.0100) + 0.0100).toFixed(8);
					let weiAmount = amount*Math.pow(10,18);
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
						.addField("Roll Prize:", prize)
						.addField("EGEM:", amount)

						.addField("And the random word for this roll is:", ":satellite: " +"["+word+"](https://www.google.ca/search?q=" +word+ ")", true);
						message.channel.send({embed})

						sendCoins(address,weiAmount,message,1); // main function
						// Adds the user to the set so that they can't talk for x
						rollcooldown.add(message.author.id);
						setTimeout(() => {
							// Removes the user from the set after a minute
							rollcooldown.delete(message.author.id);
						}, miscSettings.cdroll);
				} else {
					let prize = "Nothing, you need to roll a 6 or higher. :point_left:";
					let amount = "Zero";
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
						.addField("The dice hit the table and you get:", number)
						.addField("Roll Prize:", prize)
						.addField("EGEM:", amount)
						.addField("And the random word for this roll is:", ":satellite: " +"["+word+"](https://www.google.ca/search?q=" +word+ ")", true);

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
					.addField("User Not Registered", user)

					message.channel.send({embed});
			}
   }
}

})

// Login the bot.
bot.login(botSettings.token);
