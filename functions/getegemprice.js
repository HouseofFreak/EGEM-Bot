"use strict";

var fs = require("fs");
var getJSON = require('get-json');

function getEgemPrice(){
	var egemprice = getJSON('https://bitebtc.com/api/v1/ticker?market=egem_btc', function(error, response){
			egemprice = response.result.price;
			console.log('**EGEM BOT** Price has been logged to the file. ' + egemprice);
			fs.writeFile("data/egemprice.txt",egemprice,(err)=>{
				if(err) throw err;
			});
	})
}

module.exports = getEgemPrice;
