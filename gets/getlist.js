"use strict";
var request = require("request");
var fs = require("fs");

const LISTSITE = 'https://cryptofresh.com/api/holders?asset=EGEM';

var data = {};

function getRlist(){
	request(LISTSITE, (error, response, body)=>{
		try{
			var dataCoin = JSON.parse(body);
		} catch (e) {
			console.log("Api Problem" + e);
			return
		}
		var rList = body.dataCoin;

		fs.writeFile("data/rlist.txt",body,(err)=>{
			if(err) throw err;
			//console.log('File with block was updated');
		});
	});
}
module.exports = getRlist;
