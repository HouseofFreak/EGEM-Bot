"use strict";

var fs = require("fs");
var getJSON = require('get-json');

function getSupply(){
	var blockHeight = getJSON('https://pool.egem.io/api/stats', function(error, response){
			var blockHeight = response["nodes"][0]["height"];
			var reward = "9";
			var result1 = blockHeight*reward;
			var resultFinal = result1 - 5000;

			console.log('**EGEM BOT** Supply has been logged to the file. ' + resultFinal);
			//write to data folder
			fs.writeFile("data/supply.txt",resultFinal,(err)=>{
				if(err) throw err;
			});
			//write to website
			fs.writeFile("/home/ubuntu/ridz/EGEM-Site/supply.txt",resultFinal,(err)=>{
				if(err) throw err;
			});
	})
}

module.exports = getSupply;
