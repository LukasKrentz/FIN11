//created by Kevin - (https://github.com/Kyukishi)

import process from 'process';
import path from 'path';
import { Intents, Interaction, Message } from 'discord.js';
import { Client } from 'discordx';
import config from './config/config';

//catching errors globally
process.on('uncaughtException', function(err){
	console.error(err);
	try{
		const channel = client.channels.cache.find(channel => channel.id === config.channels.logs);

		if(typeof channel !== 'undefined')
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		(channel as any).send(`uncaughtException: ${err.message}`);
	}catch(e){console.error(e);}
});

//creating the discordx Client
const client = new Client({
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
    console.log('Bot started');
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