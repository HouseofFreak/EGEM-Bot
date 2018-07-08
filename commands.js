"use strcit";

// Settings and Requires
var getJSON = require('get-json');
var _ = require('lodash');
const Web3 = require("web3");
const Discord = require("discord.js");
const BigNumber = require('bignumber.js');
const fs = require("fs");
const randomWord = require('random-word');
//const BN = require('bn.js');

const botSettings = require("./config.json");
const miscSettings = require("./cfgs/settings.json");
const botChans = require("./cfgs/botchans.json");

// EtherGem web3
var web3 = new Web3();
web3.setProvider(new web3.providers.HttpProvider(miscSettings.web3provider));

const prefix = botSettings.prefix;
const bot = new Discord.Client({disableEveryone:true});

bot.on('ready', ()=>{
	console.log("**COMMAND THREAD** is now Online.");
	bot.channels.get(botChans.botChannelId).send("**COMMAND THREAD** is now **Online.**");
});

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


// Login the bot.
bot.login(botSettings.token);
