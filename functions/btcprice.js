"use strict";

var fs = require("fs");
var getJSON = require('get-json');

function getPrice(){
	var btcPrice = getJSON('https://api.coinmarketcap.com/v1/ticker/bitcoin/', function(error, response){
			var btcPrice = response[0]["price_usd"];

			console.log('**EGEM BOT** BTC Price has been logged to the file. ' + btcPrice +" USD");
			fs.writeFile("data/usdprice.txt",btcPrice,(err)=>{
				if(err) throw err;
			});

	})
}

module.exports = getPrice;
