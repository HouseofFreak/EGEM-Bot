"use strcit";

const Web3 = require("web3");
const Discord = require("discord.js");
const BigNumber = require('bignumber.js');
const Tx = require("ethereumjs-tx");
const ContractFactory = require("ethereum-contracts");
const solc = require("solc");
const fs = require("fs");
const randomWord = require('random-word');

const botSettings = require("./config.json");
const price = require("./price.js");
const block = require("./getblock.js");
const mprice = require("./getprice.js");
const rlist = require("./getlist.js");
const supply = require("./getsup.js");

// Load the full build.
var _ = require('lodash');

// update data
setInterval(price,300000);
setInterval(block,9000);
setInterval(mprice,9000);
setInterval(rlist,9000);
setInterval(supply,9000);

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
			let author = bot.users.find('username',name);
			author.send("Hi "+name+" , you are a lucky human. You just got " + fValue + " EGEM \n Check the following for your prize:\n  https://explorer.egem.io/tx/"+ hash);
		} else {
			message.channel.send("Tip was sent. \n Check hash: https://explorer.egem.io/tx/"+ hash)
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
	var onlineAndRegister = Object.keys(data).filter(username => {return onlineUsers.indexOf(username)!=-1});
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

	message.channel.send("It just **rained** on **" + Object.keys(latest).length + "** users. Check pm's." );

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
		var userName = users.get(val).username;
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
function getRlist(){
        return JSON.parse(fs.readFileSync('data/rlist.txt'));
}
function getSupply(){
        return JSON.parse(fs.readFileSync('data/supply.txt'));
}

const responseObject = {
  "ella": "Hey we don't talk about that coin in here.",
  "wat": "Say what?",
  "lol": "rofl",
	"when moon?": "When you stop asking, how about that."
}

bot.on('message',async message => {

	// Not admins cannot use bot in general channel
	if(message.channel.name === '🌐🗣-general' && !message.member.hasPermission('ADMINISTRATOR')) return;
	if(message.author.bot) return;
	//if(message.channel.type === "dm") return;


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
			if(amount>10){
				message.channel.send("You try to send more that 10 EGEM.");
			} else {
				// main function
				message.channel.send("You try to send " + amount + " EGEM to " + address + " address.");
				sendCoins(address,weiAmount,message,1);
			}
		} else {
			message.channel.send("Wrong address to send.");
		}
	}

	if(message.content.startsWith(prefix + "send ")){
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
			message.channel.send("You try to send " + amount+ " EGEM to @"+user  );
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
	//
	if(message.content.startsWith(prefix + "coming ")){
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

  if(message.content === prefix + "btslist"){
					var data = getRlist();
					var name = Object.keys(data);
          message.channel.send("List of Users on BITSHARES with EGEM. \n **" + name + "**.");
  }

	if(message.content === prefix + "coin"){
		let sup = getBlock()*9-5000;
		let price = getPrice();
		let priceAvg = price*getMPrice();
		message.channel.send("Coin Info: \n"+
		"```" + "Name: " + "EtherGem \n"
		+ "Ticker: " + "EGEM \n"
		+ "----------------------------------------------- \n"
		+ "open.BTC Price: " + "" + getMPrice() + " BTC" + " \n"
		+ "open.BTC 24h Vol: " + get24h()  + " BTC \n"
		+ "----------------------------------------------- \n"
    + "bridge.BTC Price: " + "" + getMPrice2() + " BTC" + " \n"
    + "bridge.BTC 24h Vol: " + get24h2()  + " BTC \n"
		+ "----------------------------------------------- \n"
		+ "Price AVG: $ " + Number(priceAvg).toFixed(4) + " USD \n"
		+ "EST Market CAP: $ " + Number(sup*priceAvg).toFixed(2) + " USD \n"
		+ "----------------------------------------------- \n"
		+ "Total Supply: " + Number(sup).toFixed(2) + " EGEM \n"
    + "Block Height: " + getBlock()
    + " ```"
	);
	}

	if(message.content === prefix + "lambo"){
		let price = getPrice()*getMPrice();
		let cost = "402995";
		let total = new Intl.NumberFormat('us-US').format(parseInt(cost/price));
		message.channel.send("You need " + total + " EGEM at the current price of " + "$" + price + " USD" + " to get a Lamborghini Aventador, Vroom Vroooom!");
	}

	if(message.content === prefix + "bugatti"){
		let price = getPrice()*getMPrice();
		let cost = "1902995";
		let total = new Intl.NumberFormat('us-US').format(parseInt(cost/price));
		message.channel.send("You need " + total + " EGEM at the current price of " + "$" + price + " USD" + " to get a Bugatti Veyron, Vroom Vroooom!");
	}

	if(message.content === prefix + "tesla"){
		let price = getPrice()*getMPrice();
		let cost = "80700";
		let total = new Intl.NumberFormat('us-US').format(parseInt(cost/price));
		message.channel.send("You need " + total + " EGEM at the current price of " + "$" + price + " USD" + " to get a Tesla Model X, Fshhhhhhhhhh Weeeeeee!");
	}

	if(message.content === prefix + "prius"){
		let price = getPrice()*getMPrice();
		let cost = "29850";
		let total = new Intl.NumberFormat('us-US').format(parseInt(cost/price));
		message.channel.send("You need " + total + " EGEM at the current price of " + "$" + price + " USD" + " to get a Toyota Prius V, Vroom Vroooom!");
	}

	if(message.content === prefix + "subaru"){
		let price = getPrice()*getMPrice();
		let cost = "49495";
		let total = new Intl.NumberFormat('us-US').format(parseInt(cost/price));
		message.channel.send("You need " + total + " EGEM at the current price of " + "$" + price + " USD" + " to get a Subaru WRX STI, Vroom Vroooom!");
	}

	if(message.content === prefix + "porsche"){
		let price = getPrice()*getMPrice();
		let cost = "92150";
		let total = new Intl.NumberFormat('us-US').format(parseInt(cost/price));
		message.channel.send("You need " + total + " EGEM at the current price of " + "$" + price + " USD" + " to get a Porsche 911, Vroom Vroooom!");
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
	if(message.content.startsWith(prefix + "rolldice")){
		let array = ['1','2','3','4','5','6','7','8','9','10','11','12'];
		let number = _.sample(array);
		let word = randomWord();
		message.channel.send("The dice hit the table and you get " + number + ", And the random word for this roll is: " + word + ".");
	}

	if(message.content === prefix + "pools"){
		return message.channel.send(", \n"
		+	"List of Known Pools: \n"
		+ "----------------------------------------------- \n"
		+ "Dev Pool (US): https://pool.egem.io \n"
		+ "Minerpool.net (US/EU/ASIA): http://egem.minerpool.net/ \n"
		+ "Reverse Gainz: http://egem.reversegainz.info/ \n"
		+ "Protonmine: http://egem.protonmine.io/ \n"
		+ "Coins.Farm: https://coins.farm/pools/egem \n"
		+ "Uncle Pool (HK): http://www.unclepool.com/ \n"
		+ "K2 Mining #1 (US) http://egem-us.k2mining.net \n"
		+ "-----------------------------------------------  \n"
		+ "Talk to a admin to get added to this list."
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

	if(message.content.startsWith(prefix + "balance")){
		let price = getPrice()*getMPrice();
		let author = message.author.username;
		let address = args[1];
		if(address == null){
			// show registered address balance
			let data = getJson();
			if(data[author]){
				web3.eth.getBalance(data[author], (error,result)=>{
					if(!error){
						var balance = (result/Math.pow(10,18)).toFixed(8);
						if(balance > 100000){
								message.channel.send("This balance has: **" + balance + "** EGEM (or *"+new Intl.NumberFormat('us-US').format(parseInt(balance*price))+" USD*), congrats, you are an EGEM Super Whale.");
						} else if(balance > 15000){
								message.channel.send("This balance has: **" + balance + "** EGEM (or *"+new Intl.NumberFormat('us-US').format(parseInt(balance*price))+" USD*), congrats, you are an EGEM Humpback Whale.");
						} else if(balance > 5000){
								message.channel.send("This balance has: **" + balance + "** EGEM (or *"+new Intl.NumberFormat('us-US').format(parseInt(balance*price))+" USD*), congrats, you are an EGEM Killer Whale.");
						} else if(balance > 1500){
								message.channel.send("This balance has: **" + balance + "** EGEM (or *"+new Intl.NumberFormat('us-US').format(parseInt(balance*price))+" USD*), congrats, you are an EGEM Shark.");
						} else if(balance > 750){
								message.channel.send("This balance has: **" + balance + "** EGEM (or *"+new Intl.NumberFormat('us-US').format(parseInt(balance*price))+" USD*), congrats, you are an EGEM Dolphin.");
						} else if(balance > 500){
								message.channel.send("This balance has: **" + balance + "** EGEM (or *"+new Intl.NumberFormat('us-US').format(parseInt(balance*price))+" USD*), congrats, you are an EGEM Puffer Fish.");
						} else if(balance > 250){
								message.channel.send("This balance has: **" + balance + "** EGEM (or *"+new Intl.NumberFormat('us-US').format(parseInt(balance*price))+" USD*), congrats, you are an EGEM Octopus.");
						} else if(balance > 100){
									message.channel.send("This balance has: **" + balance + "** EGEM (or *"+new Intl.NumberFormat('us-US').format(parseInt(balance*price))+" USD*), congrats, you are an EGEM Snow Crab.");
						} else if(balance > 50){
								message.channel.send("This balance has: **" + balance + "** EGEM (or *"+new Intl.NumberFormat('us-US').format(parseInt(balance*price))+" USD*), congrats, you are an EGEM Shrimp.");
						} else if(balance > 5){
								message.channel.send("This balance has: **" + balance + "** EGEM (or *"+new Intl.NumberFormat('us-US').format(parseInt(balance*price))+" USD*), congrats, you are an EGEM Plankton.");
						} else if(balance == 0){
								message.channel.send("This balance empty, it has: **" + balance + "** EGEM.");
						} else {
								message.channel.send("Your balance is **" + balance + "** EGEM (or *"+new Intl.NumberFormat('us-US').format(parseInt(balance*price))+" USD*), you need more EGEM to become something.");
						}
					}
				})
				return
			}
		}
		if(web3.utils.isAddress(args[1])){
			web3.eth.getBalance(args[1], (error,result)=>{
				if(!error){
					var balance = (result/Math.pow(10,18)).toFixed(8);
					if(balance > 100000){
							message.channel.send("This balance has: **" + balance + "** EGEM (or *"+new Intl.NumberFormat('us-US').format(parseInt(balance*price))+" USD*), congrats, you are an EGEM Super Whale.");
					} else if(balance > 15000){
							message.channel.send("This balance has: **" + balance + "** EGEM (or *"+new Intl.NumberFormat('us-US').format(parseInt(balance*price))+" USD*), congrats, you are an EGEM Humpback Whale.");
					} else if(balance > 5000){
							message.channel.send("This balance has: **" + balance + "** EGEM (or *"+new Intl.NumberFormat('us-US').format(parseInt(balance*price))+" USD*), congrats, you are an EGEM Killer Whale.");
					} else if(balance > 1500){
							message.channel.send("This balance has: **" + balance + "** EGEM (or *"+new Intl.NumberFormat('us-US').format(parseInt(balance*price))+" USD*), congrats, you are an EGEM Shark.");
					} else if(balance > 750){
							message.channel.send("This balance has: **" + balance + "** EGEM (or *"+new Intl.NumberFormat('us-US').format(parseInt(balance*price))+" USD*), congrats, you are an EGEM Dolphin.");
					} else if(balance > 500){
							message.channel.send("This balance has: **" + balance + "** EGEM (or *"+new Intl.NumberFormat('us-US').format(parseInt(balance*price))+" USD*), congrats, you are an EGEM Puffer Fish.");
					} else if(balance > 250){
							message.channel.send("This balance has: **" + balance + "** EGEM (or *"+new Intl.NumberFormat('us-US').format(parseInt(balance*price))+" USD*), congrats, you are an EGEM Octopus.");
					} else if(balance > 100){
								message.channel.send("This balance has: **" + balance + "** EGEM (or *"+new Intl.NumberFormat('us-US').format(parseInt(balance*price))+" USD*), congrats, you are an EGEM Snow Crab.");
					} else if(balance > 50){
							message.channel.send("This balance has: **" + balance + "** EGEM (or *"+new Intl.NumberFormat('us-US').format(parseInt(balance*price))+" USD*), congrats, you are an EGEM Shrimp.");
					} else if(balance > 5){
							message.channel.send("This balance has: **" + balance + "** EGEM (or *"+new Intl.NumberFormat('us-US').format(parseInt(balance*price))+" USD*), congrats, you are an EGEM Plankton.");
					} else if(balance == 0){
							message.channel.send("This balance empty, it has: **" + balance + "** EGEM.");
					} else {
							message.channel.send("Your balance is **" + balance + "** EGEM (or *"+new Intl.NumberFormat('us-US').format(parseInt(balance*price))+" USD*), you need more EGEM to become something.");
					}
				} else {
					message.channel.send("Oops, some problem occured with your address.");
				}
			})
		} else {
			message.channel.send("Wrong address, or not registered. The command is /register <address> or to check a specific balance its /balance <address>.");
		}
	}

	if(message.content === prefix + "fundbot"){
		let balance = await web3.eth.getBalance(botSettings.address)/Math.pow(10,18);
		message.channel.send("Bot address is " + botSettings.address + " with: **" + Number(balance).toFixed(8) + "** EGEM.");
	}

	if(message.content.startsWith("/register")){
		var author = message.author.username;
		var address = args[1];

		if(web3.utils.isAddress(args[1])){
			var data = getJson();
			if(!Object.values(data).includes(address) && !Object.keys(data).includes(author)){
				data[author] = address;
				message.channel.send("@" + author + " registered new address: " + address);

				fs.writeFile(botSettings.path, JSON.stringify(data), (err) => {
				  if (err) throw err;
				  console.log('The file has been saved.');
				});

			} else {
				message.channel.send("You have already registered.");
			}
		} else {
			message.channel.send("@" + author + " tried to register wrong address. Try another one. Correct format is **/register 0xAddress**");
		}
	}

	if(message.content.startsWith(prefix + "changeRegister")){
		var author = message.author.username;
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
					message.channel.send("@" + author + " changed register address to " + address);
				} else {
					message.channel.send("Use another address if you're trying to change your old one.")
				}
			} else {
				message.channel.send("You are not on the list, register your address via **/register** first.");
			}
		} else {
			message.channel.send("@"+author+" tried to register with wrong address. Correct format is **/register 0xAddress**");
		}
	}
	//-------------------------------------
	if(message.content == prefix + "list"){
		var data = getJson();
		message.channel.send("Total amount of registered users is **" + Object.keys(data).length+ "**.");

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

	if(message.content == prefix + "checkRegister"){
		let author = message.author.username;
		let data = getJson();
		if(Object.keys(data).includes(author)){
			message.channel.send("@"+author + " already registered.");
		} else {
			message.channel.send("You are not in the list, use **/register** command fist.");
		}
	}
	if(message.content.startsWith(prefix + "coinhelp")){
		message.channel.send("EGEM BlockChain Commands:\n"+
			"```" + prefix+"balance <address> -  show EGEM balance on the following address \n"+
			prefix+"block - shows the semi current block number (15sec updates). \n"+
			prefix+"getblock <number> - lookup the info of the block. \n"+
			prefix+"tx <txhash> - lookup the info of the transaction. \n"+
			prefix+"btslist - lookup who is holding EGEM on Bitshares. \n"+
			prefix+"coin - Show the price/cap/supply." + "```"
		);
	}

	if(message.content.startsWith(prefix + "carhelp")){
		message.channel.send("EGEM Car List Commands:\n"+
			"```" + prefix+"lambo - how many EGEM for a Lamborghini Aventador. \n"+
			prefix+"bugatti - how many EGEM for a Bugatti Veyron. \n"+
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
			prefix+"send <name> <amount> send EGEM to the following user\n"+
			prefix+"rain <amount> - send EGEM to all registered and online address's.\n"+
			prefix+"online - see list of all online and registered users for raindrops.\n"+
			prefix+"onlinetotal - see the list of every online user.\n"+
			prefix+"coming <amount> <numOfHrs> - rain will be after N hours." + "```"
		);
	}

	if(message.content === prefix + "help"){
		message.channel.send("EGEM General Commands:\n"+
			"```" + prefix+"egem - shows the what is EGEM info. \n"+
			prefix+"pools - show list of known EGEM pools. \n"+
			prefix+"fundbot - shows bot address so anyone can fund it, and its balance. \n" +
			prefix+"rolldice  -  returns a number from 1-12 and a random word.\n"+
			prefix+"register <address>  - saves user address and name to db. \n"+
			prefix+"changeRegister <address> -  change your registered address.\n"+
			prefix+"checkRegister -  find whether you're registered or not.\n"+
			prefix+"coinhelp -  EGEM Blockchain commands.\n"+
			prefix+"carhelp -  List of cars and there EGEM required.\n"+
			prefix+"adminhelp -  commands avaliable to admins.\n"+
			prefix+"list - shows number of users registered for raindrops." + "```");
	}
})


bot.login(botSettings.token);
