"use strcit";
// Load the full build.
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

const price = require("./gets/btcprice.js");
const block = require("./gets/getblock.js");
const mprice = require("./gets/getprice.js");
const supply = require("./gets/getsup.js");

const img32x32 = "https://raw.githubusercontent.com/TeamEGEM/meta/master/images/32x32.png";
const img32shard = "https://raw.githubusercontent.com/TeamEGEM/meta/master/images/various/32.png";
const egemspin = "https://raw.githubusercontent.com/TeamEGEM/meta/master/images/animated/egem_gray_28.gif";

// update data
setInterval(price,300000);
setInterval(block,9000);
setInterval(mprice,27000);
setInterval(supply,9000);

let cooldown = new Set();
let cdseconds = 7200000;

const prefix = botSettings.prefix;

const bot = new Discord.Client({disableEveryone:true});

var web3 = new Web3();

web3.setProvider(new web3.providers.HttpProvider('http://localhost:16661'));

bot.on('ready', ()=>{
	console.log("EGEM Discord Bot is Online.");
});

function sendCoins(address,value,message,name){

	web3.eth.sendTransaction({
	    from: botSettings.address,
	    to: address,
	    gas: web3.utils.toHex(120000),
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
				.setAuthor("TheEGEMBot", egemspin)
				/*
				 * Alternatively, use "#00AE86", [0, 174, 134] or an integer number.
				 */
				.setColor(0x00AE86)
				.setDescription("User Tip:")
				.setFooter("© EGEM.io", img32x32)
				.setThumbnail(img32shard)
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
		.setAuthor("TheEGEMBot", egemspin)
		/*
		 * Alternatively, use "#00AE86", [0, 174, 134] or an integer number.
		 */
		.setColor(0x00AE86)
		.setDescription("Raindrops:")
		.setFooter("© EGEM.io", img32x32)
		.setThumbnail(img32shard)
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

function getJson(){
				return JSON.parse(fs.readFileSync('data/users.json'));
}
function getPrice(){
				return JSON.parse(fs.readFileSync('data/usdprice.txt'));
}
function getMPrice(){
				return JSON.parse(fs.readFileSync('data/mprice.txt'));
}
function get24h(){
				return JSON.parse(fs.readFileSync('data/m24h.txt'));
}
function getMPrice2(){
        return JSON.parse(fs.readFileSync('data/mprice2.txt'));
}
function get24h2(){
        return JSON.parse(fs.readFileSync('data/m24h2.txt'));
}
function getBlock(){
				return JSON.parse(fs.readFileSync('data/block.txt'));
}
function getSupply(){
        return JSON.parse(fs.readFileSync('data/supply.txt'));
}

const responseObject = {

}

bot.on('message',async message => {

	// Not admins cannot use bot in general channel
	if(message.channel.name === '🌐🗣-general' && !message.member.hasPermission('ADMINISTRATOR')) return;
	if(message.author.bot) return;
	if(message.channel.type === "dm") return;


	var message = message;
	let args = message.content.split(' ');

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

	if(message.content.startsWith(prefix + "rain")){
		if(!message.member.hasPermission('ADMINISTRATOR')){
			return message.channel.send("You cannot use '/rain' command");
		}
		var amount = Number(args[1]);
		if (!amount) return message.channel.send("Error - you've entered wrong amount");
		// main func
		raining(amount,message);
	}

	if(message.content.startsWith(prefix + "sprinkle")){
		if(!message.member.hasPermission('ADMINISTRATOR')){
			return message.channel.send("You cannot use '/rain' command");
		}
		var amount = Math.floor((Math.random() * 10) + 1);
		raining(amount,message);
	}

	if(message.content.startsWith(prefix + "downpour")){
		if(!message.member.hasPermission('ADMINISTRATOR')){
			return message.channel.send("You cannot use '/rain' command");
		}
		var amount = Math.floor((Math.random() * 100) + 10);
		raining(amount,message);
	}

	if(message.content.startsWith(prefix + "usertip ")){
		if(cooldown.has(message.author.id)) {
			const embed = new Discord.RichEmbed()
				.setTitle("EGEM Discord Bot.")
				.setAuthor("TheEGEMBot", egemspin)
				/*
				 * Alternatively, use "#00AE86", [0, 174, 134] or an integer number.
				 */
				.setColor(0x00AE86)
				.setDescription("User Tip:")
				.setFooter("© EGEM.io", img32x32)
				.setThumbnail(img32shard)
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
				.setAuthor("TheEGEMBot", egemspin)
				/*
				 * Alternatively, use "#00AE86", [0, 174, 134] or an integer number.
				 */
				.setColor(0x00AE86)
				.setDescription("User Tip:")
				.setFooter("© EGEM.io", img32x32)
				.setThumbnail(img32shard)
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
				}, cdseconds);
			} else {
				message.channel.send("This user is not registered.");
			}

    }
	}
	//

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

	if(responseObject[message.content]) {
    message.channel.send(responseObject[message.content]);
  }

	if(message.content === prefix + "block"){
		message.channel.send("Current EGEM blockchain height is: " + getBlock());
	}

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

	//roll the dice with lodash
	if(message.content.startsWith(prefix + "roll")){
		let array = ['1','2','3','4','5','6','7','8','9','10','11','12'];
		let number = _.sample(array);
		let word = randomWord();
		message.channel.send("The dice hit the table and you get " + number + ", And the random word for this roll is: " + word + ".");
	}

	if(message.content === prefix + "pools"){
		return message.channel.send(""
		+	"List of Known Pools: \n"
		+ "----------------------------------------------- \n"
		+ "Dev Pool (US): https://pool.egem.io \n"
		+ "Minerpool.net (US/EU/ASIA): http://egem.minerpool.net/ \n"
		+ "CoMining.io (US/EU/ASIA): https://comining.io/ \n"
		+ "Reverse Gainz: http://egem.reversegainz.info/ \n"
		+ "Protonmine: http://egem.protonmine.io/ \n"
		+ "Coins.Farm: https://coins.farm/pools/egem \n"
		+ "Dopeblocks: https://dopeblocks.com/ \n"
		+ "Clona.ru SOLO POOL: http://clona.ru/ \n"
		+ "UPOOL.IN:  http://egem.upool.in/ \n"
		+ "ETHASH.FARM: http://egem.ethash.farm/ \n"
		+ "p00l.org https://egem.p00l.org/\n"
		+ "BYLT.GQ  https://egem.bylt.gq/ \n"
		+ "XMINER.CF http://egem.xminer.cf/ \n"
		+ "-----------------------------------------------  \n"
		+ "Talk to a admin to get added to this list."
	);
	}

	if(message.content === prefix + "markets"){
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

	if(message.content.startsWith(prefix + "tx ")){
		let tx = args[1];
		web3.eth.getTransaction(args[1], (error,result)=>{
			if(!error){
				if(result !== null){
					let minedBlock = result["blockNumber"];
					let from = result["from"];
					let to = result["to"];
					let valueRaw = result["value"];
					let value = (valueRaw/Math.pow(10,18)).toFixed(8);
					let nonce = result["nonce"];
					message.channel.send("Transaction Lookup Results: \n"
						+ "```"
						+ "Mined in Block: " + minedBlock + ". \n"
						+ "From: " + from + ". \n"
						+ "To: " + to + ". \n"
						+ "Value: " + value + " EGEM \n"
						+ "Nonce: " + nonce + ". \n"
						+ "```"
					);
				} else {
					message.channel.send("Transaction result was null, might be a malformed attempt, please double check and retry.");
				}
			} else {
				message.channel.send("Oops, a error occurred with your tx lookup try again, its /tx <txhash>.");
			}
		})
	}

	if(message.content.startsWith(prefix + "getblock")){
		let block = args[1];
		web3.eth.getBlock(args[1], (error,result)=>{
			if(!error){
				if(result !== null){
					let phash = result["parentHash"];
					let hash = result["hash"];
					let number = result["number"];
					let timestamp = result["timestamp"];
					let dt = new Date(timestamp*1000);
					let miner = result["miner"];
					let gasUsed = result["gasUsed"];
					let size = result["size"];
					let nonce = result["nonce"];
					let uncles = result["uncles"];
					message.channel.send("Block Lookup Results: \n"
						+ "```"
						+ "Parent Hash: " + phash + ". \n"
						+ "Hash: " + hash + ". \n"
						+ "Number: " + number + ". \n"
						+ "Timestamp: " + dt + ". \n"
						+ "Gas Used: " + gasUsed + ". \n"
						+ "Size: " + size + ". \n"
						+ "Miner: " + miner + ". \n"
						+ "Nonce: " + nonce + ". \n"
						+ "```"
					);
				} else {
					message.channel.send("Block result was null, might be a malformed attempt, please double check and retry.");
				}
			} else {
				message.channel.send("Oops, a error occurred with your block lookup try again, its /getblock <number>.");
			}
		})
	}

	if(message.content.startsWith(prefix + "bal")){
		let price = getPrice()*getMPrice();
		let author = message.author.id;
		let address = args[1];
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
							.setAuthor("TheEGEMBot", egemspin)
							/*
							 * Alternatively, use "#00AE86", [0, 174, 134] or an integer number.
							 */
							.setColor(0x00AE86)
							.setDescription("Account Balance:")
							.setFooter("© EGEM.io", img32x32)
							.setThumbnail(img32shard)
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
		if(web3.utils.isAddress(args[1])){
			web3.eth.getBalance(args[1], (error,result)=>{
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
						.setAuthor("TheEGEMBot", egemspin)
						/*
						 * Alternatively, use "#00AE86", [0, 174, 134] or an integer number.
						 */
						.setColor(0x00AE86)
						.setDescription("Account Balance:")
						.setFooter("© EGEM.io", img32x32)
						.setThumbnail(img32shard)
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
						.setAuthor("TheEGEMBot", egemspin)
						/*
						 * Alternatively, use "#00AE86", [0, 174, 134] or an integer number.
						 */
						.setColor(0xFF0000)
						.setDescription("Account Balance:")
						.setFooter("© EGEM.io", img32x32)
						.setThumbnail(img32shard)
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
				.setAuthor("TheEGEMBot", egemspin)
				/*
				 * Alternatively, use "#00AE86", [0, 174, 134] or an integer number.
				 */
				.setColor(0xFF0000)
				.setDescription("Account Balance:")
				.setFooter("© EGEM.io", img32x32)
				.setThumbnail(img32shard)
				/*
				 * Takes a Date object, defaults to current date.
				 */
				.setTimestamp()
				.setURL("https://github.com/TeamEGEM/EGEM-Bot")
				.addField("Wrong address, or not registered.", "The command is /register <address> or to check a specific balance its /balance <address>.")

				message.channel.send({embed})
		}
	}

	if(message.content == prefix + "botinfo"){
		let txcount = await web3.eth.getTransactionCount("0x9b41c5d87deb2fedc2ef419411cf82e6827cbcbd");
		let balance = await web3.eth.getBalance(botSettings.address)/Math.pow(10,18);
		const embed = new Discord.RichEmbed()
		  .setTitle("EGEM Discord Bot.")
		  .setAuthor("TheEGEMBot", egemspin)
		  /*
		   * Alternatively, use "#00AE86", [0, 174, 134] or an integer number.
		   */
		  .setColor(0x00E5FF)
		  .setDescription("Current Bot Status:")
		  .setFooter("© EGEM.io", img32x32)
		  .setThumbnail(img32shard)
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

	if(message.content == prefix + "getid"){
		var user = message.author.username;
		let author = message.author.id;
		const embed = new Discord.RichEmbed()
			.setTitle("EGEM Discord Bot.")
			.setAuthor("TheEGEMBot", egemspin)
			/*
			 * Alternatively, use "#00AE86", [0, 174, 134] or an integer number.
			 */
			.setColor(0x00AE86)
			.setDescription("User's Discord Id:")
			.setFooter("© EGEM.io", img32x32)
			.setThumbnail(img32shard)
			/*
			 * Takes a Date object, defaults to current date.
			 */
			.setTimestamp()
			.setURL("https://github.com/TeamEGEM/EGEM-Bot")
			.addField("Username:", user)
			.addField("Discord Id:", author, true);

			message.channel.send({embed});
	}

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
					.setAuthor("TheEGEMBot", egemspin)
					/*
					 * Alternatively, use "#00AE86", [0, 174, 134] or an integer number.
					 */
					.setColor(0x00FF0C)
					.setDescription("User Registration:")
					.setFooter("© EGEM.io", img32x32)
					.setThumbnail(img32shard)
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
					.setAuthor("TheEGEMBot", egemspin)
					/*
					 * Alternatively, use "#00AE86", [0, 174, 134] or an integer number.
					 */
					.setColor(0xFF0000)
					.setDescription("Registration Error:")
					.setFooter("© EGEM.io", img32x32)
					.setThumbnail(img32shard)
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
				.setAuthor("TheEGEMBot", egemspin)
				/*
				 * Alternatively, use "#00AE86", [0, 174, 134] or an integer number.
				 */
				.setColor(0xFF0000)
				.setDescription("Registration Error:")
				.setFooter("© EGEM.io", img32x32)
				.setThumbnail(img32shard)
				/*
				 * Takes a Date object, defaults to current date.
				 */
				.setTimestamp()
				.setURL("https://github.com/TeamEGEM/EGEM-Bot")
				.addField("Tried to register wrong address. Try another one.", "Correct format is **/register 0xAddress**")

				message.channel.send({embed});
		}
	}

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

	//-------------------------------------
	if(message.content == prefix + "list"){
		var data = getJson();
		const embed = new Discord.RichEmbed()
			.setTitle("EGEM Discord Bot.")
			.setAuthor("TheEGEMBot", egemspin)
			/*
			 * Alternatively, use "#00AE86", [0, 174, 134] or an integer number.
			 */
			.setColor(0x00AE86)
			.setDescription("Registered Users:")
			.setFooter("© EGEM.io", img32x32)
			.setThumbnail(img32shard)
			/*
			 * Takes a Date object, defaults to current date.
			 */
			.setTimestamp()
			.setURL("https://github.com/TeamEGEM/EGEM-Bot")
			.addField("Total count for raindrops.","**" + Object.keys(data).length+ "**.")

		message.channel.send({embed});

	}

	if(message.content == prefix + "onlinetotal"){
		if(!message.member.hasPermission('ADMINISTRATOR')){
			return message.channel.send("You cannot use '/onlinetotal' command");
		}
		var online = getOnline();
		message.channel.send("Total list of online users are **" + online+ "**.");
	}

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


	if(message.content.startsWith(prefix + "coinhelp")){
		message.channel.send("EGEM BlockChain Commands:\n"+
			"```" + prefix+"bal <address> -  show EGEM balance on the following address \n"+
			prefix+"getid - this number is needed to use /usertip. \n"+
			prefix+"register <address> - saves user address and name to db. \n"+
			prefix+"changereg <address> - change your registered address.\n"+
			prefix+"checkreg - find whether you're registered or not.\n"+
			prefix+"usertip <userid> - tip a user or yourself every 2 hours. \n"+
			prefix+"block - shows the semi current block number (15sec updates). \n"+
			prefix+"getblock <number> - lookup the info of the block. \n"+
			prefix+"tx <txhash> - lookup the info of the transaction. \n"+
			prefix+"coin - Show the price/cap/supply." + "```"
		);
	}

	if(message.content.startsWith(prefix + "gamelist")){
		message.channel.send("EGEM Game List:\n"+
			"```" + prefix+"1in10game - simple game of guess the number. \n"+
			prefix+"1in100game - slightly harder numbers game." + "```"
		);
	}

	if(message.content.startsWith(prefix + "carhelp")){
		message.channel.send("EGEM Car List Commands:\n"+
			"```" + prefix+"lambo - how many EGEM for a Lamborghini Aventador. \n"+
			prefix+"bugatti - how many EGEM for a Bugatti Veyron. \n"+
			prefix+"bmw - how many EGEM for a BMW M6 Coupé. \n"+
			prefix+"ferrari - how many EGEM for a FERRARI 488 GTB. \n"+
			prefix+"mercedes - how many EGEM for a Mercedes-AMG GT Roadster. \n"+
			prefix+"tesla - how many EGEM for a Tesla Model X. \n"+
			prefix+"subaru - how many EGEM for a Subaru WRX STI. \n"+
			prefix+"porsche - how many EGEM for a Porsche 911. \n"+
			prefix+"prius - how many EGEM for a Toyota Prius V." + "```"
		);
	}

	if(message.content.startsWith(prefix + "adminhelp")){
		if(!message.member.hasPermission('ADMINISTRATOR')){
			return message.channel.send("You cannot use '/adminhelp' command");
		}
		message.channel.send("EGEM Admin Commands:\n"+
			"```" + prefix+"sendToAddress <address> <amount> - send EGEM to the following address\n"+
			prefix+"tip <name> <amount> send EGEM to the following user\n"+
			prefix+"rain <amount> - send EGEM to all registered and online address's.\n"+
			prefix+"sprinkle - send 1-10 EGEM to all registered and online address's.\n"+
			prefix+"downpour - send 10-100 EGEM to all registered and online address's.\n"+
			prefix+"online - see list of all online and registered users for raindrops.\n"+
			prefix+"onlinetotal - see the list of every online user.\n"+
			prefix+"forecast <amount> <numOfHrs> - rain will be after N hours." + "```"
		);
	}

	if(message.content === prefix + "help"){
		message.channel.send("EGEM General Commands:\n"+
			"```" + prefix+"egem - shows the what is EGEM info. \n"+
			prefix+"faq - common asked questions. \n"+
			prefix+"gamelist - list of games to play in games room. \n"+
			prefix+"pools - show list of known EGEM pools. \n"+
			prefix+"markets - show list of known place to BUY/SELL EGEM. \n"+
			prefix+"convert - get a list of realtime conversions from EGEM to another coin. \n"+
			prefix+"botinfo - shows bot address so anyone can fund it, and its balance. \n" +
			prefix+"roll - toss dice and returns a number from 1-12 and a random word.\n"+
			prefix+"coinhelp - EGEM Blockchain commands.\n"+
			prefix+"carhelp - List of cars and there EGEM required.\n"+
			prefix+"list - shows number of users registered for raindrops." + "```");
	}
})


bot.login(botSettings.token);
