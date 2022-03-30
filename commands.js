"use strict";

const fs = require("fs");
const ytdl = require("discord-ytdl-core");
const osu = require('node-osu');

const queue = new Map();

const osuApi = new osu.Api("591ae251cbbd539245cd4329e5af250f0ce908cb", {
	notFoundAsError: true,
	completeScore: true,
	parseNumeric: false
});


var commands = 
{
	handle: function(cmdName, args, message, settings, interactions, interactionMap)
	{
		const serverQueue = queue.get(message.guild.id);
		switch(cmdName)
		{
			case "setnickname":
			{
				this.setUserNickname(message, args);
			} break;
			case "ping":
			{
				this.ping(message);
			} break;
			case "prefix":
			{
				this.changePrefix(message, args, settings);
			} break;
			case "help":
			{
				this.displayHelp(message, settings);
			} break;
			case "play":
			{
				// if(args.length == 1)
				// {
					// this.executeMusicPlayer(message, args, serverQueue);
				// }
				// else
				// {
					// return message.channel.send("Error: Too many or little arguments.");
				// }
			} break;
			case "skip":
			{
				// if(!message.member.voice.channel)
					// return message.channel.send("You have to be in a voice channel to stop the music!");
				// if(!serverQueue)
					// return message.channel.send("There is no song that I could skip!");
				// serverQueue.connection.dispatcher.end();
			} break;
			case "stop":
			{
				// if (!message.member.voice.channel)
					// return message.channel.send("You have to be in a voice channel to stop the music!");
				// serverQueue.songs = [];
				// serverQueue.connection.dispatcher.end();
			} break;
			case "i":
			case "interactions":
			{
				this.displayInteractions(message, interactions, args);
			} break;
			case "create":
			{
				//if(message.guild.id == "383883748523114497")
				//{
					this.createInteraction(interactions, message, args, settings, interactionMap);
				//}
			} break;
			case "modify":
			{
				//if(message.guild.id == "383883748523114497")
				//{
					this.modifyInteraction(interactions, message, args, settings, interactionMap);
				//}
			} break;
			case "add":
			{
				//if(message.guild.id == "383883748523114497")
				//{
					this.addInteractionResponse(interactions, message, args, settings, interactionMap);
				//}
			} break;
			case "remove":
			{
				this.removeInteraction(interactions, message, args, interactionMap);
			} break;
			case "delete":
			{
				//if(message.guild.id == "383883748523114497")
				//{
					this.deleteInteraction(interactions, message, args, settings, interactionMap);
				//}
			} break;
			case "rs":
			{
				//this.getRecentScore(message, args);
			} break;
			case "args_debug":
			{
				var msg = "";
				msg += "Command: " + cmdName + "\n";
				msg += "Arguments: " + args + "\n";
				msg += "Length: " + args.length + "\n";
				message.channel.send("```" + msg + "```");
			} break;
			case "flush":
			{
				this.flushMessages(message, args);
			} break;
			case "avatar":
			{
				this.displayUserAvatar(message, args);
			} break;
			default:
			{
				message.channel.send("Incorrect command. " + 
									 "To see a list of commands, enter: " + 
									 settings.prefix + "help");
			} break;
		}
	},
	ping: function(message) 
	{
		message.channel.send("Pong!");
	},
	changePrefix: function(message, args, settings) 
	{
		if(args.length == 1)
		{
			settings.prefix = args[0];
			message.channel.send("Successfully changed prefix to " + settings.prefix);
			let data = JSON.stringify(settings, null, 4);
			
			var fileName = "settings" + message.guild.id + ".json";
			fs.writeFile(fileName, data, function(err) 
			{
				if(err) 
				{
					console.log(err);
				}
			});
		}
		else
		{
			message.channel.send("Current prefix: " + settings.prefix);
			message.channel.send("To modify prefix, enter: " + 
								 settings.prefix + "prefix *character*");
			message.channel.send("Example: " + settings.prefix + "prefix =");
		}
	},
	setUserNickname: function(message, args)
	{
		message.channel.send("This does nothing at the moment.");
	},
	executeMusicPlayer: async function(message, args, serverQueue)
	{
		const voiceChannel = message.member.voice.channel;
		if(!voiceChannel)
		{
			return message.reply("Please join a voice channel first!");
		}
				
		// //console.log(args[0]);
		
		// const songInfo = await ytdl.getInfo(args[0]);
		// const song = 
		// {
			// title: songInfo.title,
			// url: songInfo.video_url
		// };

		// if (!serverQueue) 
		// {
			// const queueContruct = 
			// {
				// textChannel: message.channel,
				// voiceChannel: voiceChannel,
				// connection: null,
				// songs: [],
				// volume: 5,
				// playing: true
			// };

			// queueContruct.songs.push(song);
			// queue.set(message.guild.id, queueContruct);

			// try 
			// {
				// var connection = await voiceChannel.join();
				// queueContruct.connection = connection;
				// this.playMusic(message.guild, queueContruct.songs[0]);
			// } 
			// catch (err) 
			// {
				// console.log(err);
				// queue.delete(message.guild.id);
				// return message.channel.send(err);
			// }
		// } 
		// else 
		// {
			// serverQueue.songs.push(song);
			// return message.channel.send(`${song.title} has been added to the queue!`);
		// }
	},
	playMusic: function(guild, song)
	{
		const serverQueue = queue.get(guild.id);
		if (!song) 
		{
			serverQueue.voiceChannel.leave();
			queue.delete(guild.id);
			return;
		}

		const dispatcher = serverQueue.connection
		.play(ytdl(song.url))
		.on("finish", () => {
			serverQueue.songs.shift();
			this.playMusic(guild, serverQueue.songs[0]);
		}).on("error", error => console.error(error));
		dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
		serverQueue.textChannel.send(`Start playing: **${song.title}**`);
	},
	displayInteractions: function(message, interactions, args)
	{
		if(args.length == 1)
		{
			var key = args[0].toLowerCase();
			if(key in interactions)
			{
				return message.channel.send(interactions[key].toString());
			}
			else
			{
				return message.channel.send("Error: Interaction not found");
			}
		}
		var msgs = [];
		msgs.push("");
		var startIndex = 0;
		for(let key in interactions)
		{
			var line = key + " - " + interactions[key] + "\n";
			if(line.length + msgs[startIndex].length >= 2000)
			{
				msgs.push(line);
				startIndex++;
			}
			else
			{
				msgs[startIndex] += line;
			}
		}
		for(var i = 0; i < msgs.length; ++i)
			message.channel.send("```" + msgs[i] + "```");
	},
	createInteraction: function(interactions, message, args, settings, interactionMap) 
	{
		if(args.length >= 2)
		{
			var serverID = message.guild.id;
			var action = args.shift().toLowerCase();
			if(action in interactions)
			{
				return message.channel.send("Interaction already exist.\nTo add responses into an existing interaction use " + settings.prefix + "add.\nTo modify an interaction use " + settings.prefix + "modify.");
			}
			var response = args.join(' ');
			interactions[action] = response;
			message.channel.send("Successfully created new interaction: " + action);
			interactionMap.set(serverID, interactions)
			let data = JSON.stringify(interactions, null, 4);
			let fileName = "interaction" + serverID + ".json";
			fs.writeFile(fileName, data, function(err) 
			{
				if(err) 
				{
					console.log(err);
				}
			});
		}
		else
		{
			message.channel.send("Error: Too few arguements.");
			message.channel.send("Correct usage: " + settings.prefix + 
								 "create [interaction] [response]");
		}
	},
	modifyInteraction: function(interactions, message, args, settings, interactionMap)
	{
		if(args.length >= 3)
		{
			var action = args.shift().toLowerCase();
			if(action in interactions)
			{
				var index = parseInt(args[0]);
				if(Array.isArray(interactions[action]))
				{
					var arr = interactions[action];
					if(isNaN(index))
					{
						var response = args.join(' ');
						arr[0] = response;
						interactions[action] = arr;
					}
					else
					{
						if(index >= 0 && index < interactions[action].length)
						{
							args.shift();
							var response = args.join(' ');
							arr[index] = response;
							interactions[action] = arr;
						}
						else
						{
							return message.channel.send("Error: Incorrect index.");
						}
					}
				}
				else
				{
					var response = args.join(' ');
					interactions[action] = response;
				}
				var serverID = message.guild.id;
				interactionMap.set(serverID, interactions);
				
				let fileName = "interaction" + serverID + ".json";
				let data = JSON.stringify(interactions, null, 4);
				fs.writeFile(fileName, data, function(err) 
				{
					if(err) 
					{
						console.log(err);
					}
				});
				return message.channel.send("Successfully modified interaction: " + action + ".");
			}
			else
			{
				return message.channel.send("Error: Interaction does not exist.");
			}
		}
		else if(args.length == 2)
		{
			var action = args.shift().toLowerCase();
			if(action in interactions)
			{
				if(Array.isArray(interactions[action]))
				{
					var arr = interactions[action];
					arr[0] = args[0];
					interactions[action] = arr;
				}
				else
				{
					interactions[action] = args[0];
				}
				var serverID = message.guild.id;
				interactionMap.set(serverID, interactions);
				
				let fileName = "interaction" + serverID + ".json";
				let data = JSON.stringify(interactions, null, 4);
				fs.writeFile(fileName, data, function(err) 
				{
					if(err) 
					{
						console.log(err);
					}
				});
				return message.channel.send("Successfully modified interaction: " + action + ".");
			}
			else
			{
				return message.channel.send("Error: Interaction does not exist.");
			}
		}
		else
		{
			message.channel.send("Error: Too few arguments.");
			message.channel.send("Correct usage:```" + settings.prefix + 
								 "modify [interaction] [index(optional)] [response].\n" +
								 "If index is not specified, it will change the first value of the interaction.\n```" +
								 "**NOTE: Index starts from 0**");
		}
	},
	addInteractionResponse: function(interactions, message, args, settings, interactionMap)
	{
		if(args.length >= 2)
		{
			var action = args.shift().toLowerCase();
			var response = args.join(' ');
			if(action in interactions)
			{
				if(Array.isArray(interactions[action]))
				{
					interactions[action].push(response);
					console.log(interactions[action].toString());
				}
				else
				{
					var arr = [interactions[action]];
					console.log(arr.toString());
					arr.push(response);
					interactions[action] = arr;
				}
				var serverID = message.guild.id;
				interactionMap.set(serverID, interactions);
				
				let fileName = "interaction" + serverID + ".json";
				let data = JSON.stringify(interactions, null, 4);
				fs.writeFile(fileName, data, function(err) 
				{
					if(err) 
					{
						console.log(err);
					}
				});
				return message.channel.send("Successfully added a response into existing interaction: " + action + ".");
			}
			else
			{
				return message.channel.send("Error: Interaction does not exist.");
			}
		}
		else
		{
			return message.channel.send("Error: Too few arguements.\n" + 
										"Correct usage:```" + settings.prefix +
										"add [interaction] [response]```");
		}
	},
	removeInteraction : function(interactions, message, args, interactionMap)
	{
		if(args.length == 2)
		{
			var action = args.shift().toLowerCase();
			
			if(action in interactions)
			{
				var index = parseInt(args[0])
				if(Array.isArray(interactions[action]))
				{
					if(isNaN(index))
					{
						return message.channel.send("Error: Incorrect index.");
					}
					else
					{
						interactions[action].splice(index, 1);
						
						var serverID = message.guild.id;
						interactionMap.set(serverID, interactions);
						
						let fileName = "interaction" + serverID + ".json";
						let data = JSON.stringify(interactions, null, 4);
						fs.writeFile(fileName, data, function(err) 
						{
							if(err) 
							{
								console.log(err);
							}
						});
						
						return message.channel.send("Removed item at index " + index + ".");
					}
				}
				else
				{
					return message.channel.send("Error: Not an array.");
				}
			}
			else
				return message.channel.send("Error: Interaction not found.");
		}
	},
	deleteInteraction: function(interactions, message, args, settings, interactionMap) 
	{
		if(args.length == 1)
		{
			var key = args[0];
			if(key in interactions)
			{
				delete interactions[key];
				message.channel.send("Successfully deleted interaction: " + key);
				
				var serverID = message.guild.id;
				interactionMap.set(serverID, interactions);
				
				let fileName = "interaction" + serverID + ".json";
				let data = JSON.stringify(interactions, null, 4);
				fs.writeFile(fileName, data, function(err) 
				{
					if(err) 
					{
						console.log(err);
					}
				});
			}
			else
			{
				message.channel.send("Error: Interaction not found.");
			}
		}
		else
		{
			message.channel.send("Error: Too few arguements.");
			message.channel.send("Correct usage: " + settings.prefix + 
								 "delete [interaction]");
		}
	},
	getRecentScore: function(message, args)
	{
		if(args.length == 1)
		{
			var user = args[0];
			console.log(user);
			
			osuApi.getUserRecent({u: user}).then(scores => {
				var mostRecent = scores[0];
				
				const embed = new Discord.MessageEmbed()
				.setColor("0099ff")
				.setTitle(mostRecent.beatmap.title + " " + mostRecent.mods)
				.setDescription("by " + user)
				.addFields(
					{ name: '\u200B', value: '\u200B' },
					{ name: "Score", value: mostRecent.score, inline: true },
					{ name: "Accuracy", value: mostRecent.accuracy, inline: true},
					{ name: "PP", value: mostRecent.pp, inline: true }
				);
				
				message.channel.send(embed);
			});
		}
	},
	flushMessages: function(message, args)
	{
		if(message.member.hasPermission("ADMINISTRATOR"))
		{
			if(args.length == 1)
			{
				const amount = parseInt(args[0]) + 1;
				
				if(isNaN(amount))
				{
					return message.reply("Enter a valid number you fucktard");
				}
				else if(amount <= 1 || amount > 100)
				{
					return message.reply("Please enter a number between 1 and 99.");
				}
				else
				{
					message.channel.bulkDelete(amount, true).catch(err => 
					{
						console.error(err);
						return message.channel.send("Error: " + err);
					});
					message.channel.send("Deleted " + (amount-1) + " messages.");
				}
			}
		}
		else
		{
			return message.reply("You need administrator permission to use this command.");
		}
	},
	displayUserAvatar: function(message, args)
	{
		if(!args.length)
		{
			if (!message.mentions.users.size)
			{
				return message.channel.send(`Your avatar: <${message.author.displayAvatarURL(
				{ format: "png", dynamic: true })}>`);
			}
		}
		else
		{
			const avatarList = message.mentions.users.map(user => 
			{
				return `${user.username}'s avatar: <${user.displayAvatarURL({ format: "png", dynamic: true })}>`;
			});
			
			message.channel.send(avatarList);
		}
	},
	displayHelp: function(message, settings) 
	{
		message.channel.send("[" + settings.prefix + "]" + "[command] [arg...]");
		message.channel.send("```List of commands:\n" + 
							 "prefix - Changes command prefix.\n" + 
							 "help - Display a list of commands.\n" +
							 "interactions - Display a list of interactions.\n" +
							 "create - Create an interaction.\n" +
							 "modify - Modify an existing interaction.\n" +
							 "add - Add response to an existing interaction.\n" +
							 "delete - Delete an interaction.\n" +
							 "avatar - Display user's avatar.\n" +
							 "flush - Delete messages (ADMIN ONLY).\n" + 
							 "ping - Pong!\n" + 
							 "```");
	}
};

exports.commands = commands;