"use strict";
var request = require("request");
var fs = require("fs");

const PRICESITE2 = 'https://graviex.net/api/v2/tickers/egembtc';

var data = {};

function getGPrice(){
	request(PRICESITE2, (error, response)=>{
		try{
			var dataCoin = JSON.parse(response);
		} catch (e) {
			console.log("Api Graviex Problem: " + e);
			return
		}
		var gPrice1 = dataCoin["ticker"]["last"];
		var g24h1 = dataCoin["ticker"]["volbtc"];
		console.log(gPrice1);
		console.log(g24h1);

		fs.writeFile("data/gravprice.txt",gPrice1,(err)=>{
			if(err) throw err;
		});
		fs.writeFile("data/m24grav.txt",g24h1,(err)=>{
			if(err) throw err;
		});

	});
}
module.exports = getGPrice;
