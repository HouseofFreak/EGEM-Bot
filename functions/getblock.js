"use strict";

var fs = require("fs");
var getJSON = require('get-json');

function getBlock(){
	var blockHeight = getJSON('https://pool.egem.io/api/stats', function(error, response){
		if(!error){
			var blockHeight = response["nodes"][0]["height"];
			//console.log('**EGEM BOT** Block has been logged to the file. ' + blockHeight);
			fs.writeFile("data/block.txt",blockHeight,(err)=>{
				if(err) throw err;
			});
		} else {
			console.log('**EGEM BOT** EGEM BLOCK API ISSUE!');
		}
	})
}

module.exports = getBlock;
