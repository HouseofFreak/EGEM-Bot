"use strict";

const Discord = require("discord.js");
const botSettings = require("../config.json");
const miscSettings = require("../cfgs/settings.json");

function msgTest(){
  client.channels.get(438019162930151435).send('test message');
}

module.exports = msgTest;
