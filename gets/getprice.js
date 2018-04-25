"use strict";
var request = require("request");
var fs = require("fs");

const PRICESITE = 'https://cryptofresh.com/api/asset/markets?asset=EGEM';

var data = {};

function getMPrice(){
	request(PRICESITE, (error, response, body)=>{
		try{
			var dataCoin = JSON.parse(body);
		} catch (e) {
			console.log("Api BTS Price Problem" + e);
			return
		}
		var mPrice1 = dataCoin["OPEN.BTC"]["price"];
		var m24h1 = dataCoin["OPEN.BTC"]["volume24"];
    var mPrice2 = dataCoin["BRIDGE.BTC"]["price"];
    var m24h2 = dataCoin["BRIDGE.BTC"]["volume24"];

		fs.writeFile("data/mprice.txt",mPrice1,(err)=>{
			if(err) throw err;
		});
		fs.writeFile("data/m24h.txt",m24h1,(err)=>{
			if(err) throw err;
		});
    fs.writeFile("data/mprice2.txt",mPrice2,(err)=>{
            if(err) throw err;
    });
    fs.writeFile("data/m24h2.txt",m24h2,(err)=>{
            if(err) throw err;
    });

	});
}
module.exports = getMPrice;
