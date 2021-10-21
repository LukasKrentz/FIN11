//created by Kevin - (https://github.com/Kyukishi)

import process from 'process';
import path from 'path';
import { Intents, Interaction, Message, MessageEmbed, TextChannel } from 'discord.js';
import { Client } from 'discordx';
import config from './config/config';
import { IGlobal } from './types/global';
declare const global: IGlobal;

global.channels = {
	whitelistedChannels: [],
	blacklistedChannels: [],
	logs: undefined,
	todos: undefined,
	polls: undefined,
	alerts: undefined,
};

//catching errors globally
process.on('uncaughtException', function(err){
	console.error(err);
	//send a discord message in the logs channel
	if(typeof channels.logs !== 'undefined'){
		const embed = new MessageEmbed()
			.setColor('#ff2d55')
			.setTitle(err.name)
			.setAuthor('uncaught exception')
			.addFields(
				{name: '\u200B', value: '\u200B'},
				{name: 'Message:', value: err.message},
				{name: '\u200B', value: '\u200B'}
			)
			.setTimestamp();
				
		if(typeof err.stack !== 'undefined'){
			embed.addFields(
				{name: 'Stacktrace:', value: err.stack},
				{name: '\u200B', value: '\u200B'}
			);
		}

		channels.logs.send({embeds: [embed]});
	}
});

//creating the discordx Client
global.client = new Client({
    prefix: '/',
    intents: [
		Intents.FLAGS.GUILDS,
		Intents.FLAGS.GUILD_MESSAGES,
		Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
		Intents.FLAGS.GUILD_VOICE_STATES,
    ],
    classes: [
		path.join(__dirname, 'commands', '**/*.{ts,js}'),
		path.join(__dirname, 'events', '**/*.{ts,js}'),
    ],
    silent: true,
});

//will be executed when the bot successfully started
client.once('ready', async()=>{
	//assigning channels from config.json to global.channels
	channels.whitelistedChannels = (()=>{
		const channelList: TextChannel[] = [];
		config.channels.whitelistedChannels.forEach(id=>{
			const channel = <TextChannel>client.channels.cache.find(channel => channel.id === id);
			if(typeof channel !== 'undefined')
				channelList.push(channel);
		});

		return channelList;
	})();
	channels.blacklistedChannels = (()=>{
		const channelList: TextChannel[] = [];
		config.channels.blacklistedChannels.forEach(id=>{
			const channel = <TextChannel>client.channels.cache.find(channel => channel.id === id);
			if(typeof channel !== 'undefined')
				channelList.push(channel);
		});

		return channelList;
	})();
	channels.logs = <TextChannel>client.channels.cache.find(channel => channel.id === config.channels.logs);
	channels.todos = <TextChannel>client.channels.cache.find(channel => channel.id === config.channels.todos);
	channels.polls = <TextChannel>client.channels.cache.find(channel => channel.id === config.channels.polls);
	channels.alerts = <TextChannel>client.channels.cache.find(channel => channel.id === config.channels.alerts);

	//adding "slash commands" to discord
	await client.clearApplicationCommands(config.server);
	await client.initApplicationCommands();
	await client.initApplicationPermissions();

    console.log('Bot started');
	const embed = new MessageEmbed()
		.setColor('#007bff')
		.setTitle('successfully started!')
		.setTimestamp();
	channels.logs?.send({embeds: [embed]});
});

//will be executed when someone reacts to a message
client.on('interactionCreate', (interaction: Interaction)=>{
	client.executeInteraction(interaction);
});

//will be executed when someone sends a message
client.on('messageCreate', (message: Message)=>{
	//checking if the server and commands are allowed in the channel
	if(message.guildId === config.server && (!(config.allowAllChannels === 0 || config.allowAllChannels === true) && (config.allowAllChannels > 1) ? !config.channels.blacklistedChannels.includes(message.channelId) : config.channels.whitelistedChannels.includes(message.channelId))){
		try{
			client.executeCommand(message);
		}catch(e){
			message.reply("sorry, I've run into an error. please wait until the dev-team fixed me :(");
		}
	}
});

//starts the bot with the token from config.json
client.login(config.token);