"use strict";
var request = require("request");
var fs = require("fs");

const BLOCKSITE = 'https://pool.egem.io/api/stats';

var data = {};

function getSupply(){
	request(BLOCKSITE, (error, response, body)=>{
		try{
			var dataCoin = JSON.parse(body);
		} catch (e) {
			console.log("Api Supply Problem: " + e);
			return
		}
		var blockH = dataCoin["nodes"][0]["height"];
		var reward = "9";
		var reduction1 = "5000";
		var blockH2 = blockH - reduction1;
		var result = blockH2*reward;

		fs.writeFile("/home/ubuntu/ridz/EGEM-Site/supply.txt",result,(err)=>{
			if(err) throw err;
		});
	});
}
module.exports = getSupply;
