import fs from "fs";
import path from "path";
import { Intents, Interaction, Message } from "discord.js";
import { Client } from "discordx";

//read config from config.json
interface IConfig{
    token: string
}
const config:IConfig = JSON.parse(fs.readFileSync(path.join(__dirname, 'config.json')).toString());

//creating the discordx Client
const client = new Client({
    prefix: "/",
    intents: [
      Intents.FLAGS.GUILDS,
      Intents.FLAGS.GUILD_MESSAGES,
      Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
      Intents.FLAGS.GUILD_VOICE_STATES,
    ],
    classes: [
      path.join(__dirname, "commands", "**/*.{ts,js}"),
      path.join(__dirname, "events", "**/*.{ts,js}"),
    ],
    silent: true,
});

//will be executed when the bot successfully started
client.once("ready", async()=>{
    console.log("Bot started");
});

//will be executed when someone reacts to a message
client.on("interactionCreate", (interaction: Interaction)=>{
    client.executeInteraction(interaction);
});

//will be executed when someone sends a message
client.on("messageCreate", (message: Message)=>{
    client.executeCommand(message);
});

//starts the bot with the token from config.json
client.login(config.token);
