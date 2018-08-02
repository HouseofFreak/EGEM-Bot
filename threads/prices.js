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

const botSettings = require("../config.json");
const miscSettings = require("../cfgs/settings.json");
const botChans = require("../cfgs/botchans.json");
const block = require("../functions/getblock.js");
const supply = require("../functions/getsup.js");

// Update Data
setInterval(block,miscSettings.blockDelay);
setInterval(supply,miscSettings.supplyDelay);

// Get data from files.
function getJson(){ return JSON.parse(fs.readFileSync('data/users.json'));}
function getTXJson(){ return JSON.parse(fs.readFileSync('data/txlist.json'));}
function getSupply(){ return JSON.parse(fs.readFileSync('data/supply.txt'));}
function getBlock(){ return JSON.parse(fs.readFileSync('./data/block.txt'));}

// EtherGem web3
var web3 = new Web3();
web3.setProvider(new web3.providers.HttpProvider(miscSettings.web3provider));

const prefix = botSettings.prefix;
const bot = new Discord.Client({disableEveryone:true});

bot.on('ready', ()=>{
	console.log("**PRICE THREAD** is now Online.");
	bot.channels.get(botChans.botChannelId).send("**PRICE THREAD** is now **Online.**");
});

// Thread console heartbeat
const threadHB = function sendHB(){
	console.log("**PRICE THREAD** is ACTIVE");
};
setInterval(threadHB,miscSettings.HBDelay);
bot.on('error', console.error);
// Login the bot.
bot.login(botSettings.token);
