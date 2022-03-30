"use strict";

const Discord = require("discord.js");
const {prefix, token} = require("./config.json");
const {commands} = require("./commands.js");
const client = new Discord.Client();

var cfg; //Config file
//var interactions; //Custom commands

const interaction = new Map();
const config = new Map();

const fs = require("fs");

fs.readFile("config.json", (err, data) => {
    if (err) throw err;
    cfg = JSON.parse(data);
});

// fs.readFile("interactions.json", (err, data) => {
    // if (err) throw err;
    // interactions = JSON.parse(data);
	// console.log(interactions);
// });

client.once("ready", () => {
	client.guilds.cache.forEach(server => {
		var interactionFileName = "interaction" + server.id + ".json";
		var configFileName = "settings" + server.id + ".json";
		if(fs.existsSync(interactionFileName))
		{
			fs.readFile(interactionFileName, (err, data) => {
				if (err) throw err;
				interaction.set(server.id, JSON.parse(data));
			});
		}
		else
		{
			var interactionTemplate = {hi: "Hello, world!"};
			let data = JSON.stringify(interactionTemplate, null, 4);
			fs.writeFile(interactionFileName, data, function(err) 
			{
				if(err) 
				{
					console.log(err);
				}
			});
			interaction.set(server.id, interactionTemplate);
		}
		
		if(fs.existsSync(configFileName))
		{
			fs.readFile(configFileName, (err, data) => {
				if (err) throw err;
				config.set(server.id, JSON.parse(data));
			});
		}
		else
		{
			var configTemplate = {prefix: "="};
			let data = JSON.stringify(configTemplate, null, 4);
			fs.writeFile(configFileName, data, function(err) 
			{
				if(err) 
				{
					console.log(err);
				}
			});
			config.set(server.id, configTemplate);
		}
	});
	console.log("Ready!");
});

function roido(message) {
	var value = Math.floor((Math.random() * 2) + 1);
	switch(value)
	{
		case 1: message.channel.send("roido is god"); break;
		case 2: message.channel.send("steroido"); break;
	}
}

client.on("message", message => {
	//console.log("Message: " + message.content);
	var settings = config.get(message.guild.id);
	
	if(message.content.startsWith(settings.prefix))
	{
		let args = message.content.slice(settings.prefix.length).trim().split(/ +/);
		let cmdName = args.shift().toLowerCase();
		let interactions = interaction.get(message.guild.id);
		console.log("Activated command: " + cmdName);
		commands.handle(cmdName, args, message, settings, interactions, interaction);
	}
	else if(message.author.id != "733517235301384282")
	{
		let interactions = interaction.get(message.guild.id);
		var key = message.content.toLowerCase();
		if(key in interactions)
		{
			if(Array.isArray(interactions[key]))
			{
				var arr = interactions[key];
				var value = Math.floor(Math.random() * arr.length);
				
				message.channel.send(arr[value]);
			}
			else
				message.channel.send(interactions[key]);
		}
	}
});

client.login(token);
