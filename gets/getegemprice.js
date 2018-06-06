"use strict";

var fs = require("fs");
var getJSON = require('get-json');

function getEgemPrice(){
	var egemprice = getJSON('https://bitebtc.com/api/v1/ticker?market=egem_btc', function(error, response){
			egemprice = response.result.price;
			console.log('EtherGem price logged to file.');
			fs.writeFile("data/egemprice.txt",egemprice,(err)=>{
				if(err) throw err;
			});
	})
}

module.exports = getEgemPrice;
