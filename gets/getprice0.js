"use strict";
var request = require("request");
var fs = require("fs");

const PRICESITE2 = 'https://graviex.net/api/v2/tickers/egembtc';

var data = {};

function getGPrice(){
	request(PRICESITE2, (error, response, body)=>{
		try{
			var dataCoin = JSON.parse(body);
		} catch (e) {
			console.log("Api Graviex Problem" + e);
			return
		}
		var gPrice1 = dataCoin["ticker"]["last"];
		var g24h1 = dataCoin["ticker"]["volbtc"];

		fs.writeFile("data/gravprice.txt",gPrice1,(err)=>{
			if(err) throw err;
			console.log(err);
		});
		fs.writeFile("data/m24grav.txt",g24h1,(err)=>{
			if(err) throw err;
			console.log(err);
		});

	});
}
module.exports = getGPrice;
