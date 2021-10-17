//created by Kevin - (https://github.com/Kyukishi)

import Global = NodeJS.Global;
import { TextChannel } from 'discord.js';
import { Client } from 'discordx';

interface IChannels{
    whitelistedChannels: TextChannel[]
    blacklistedChannels: TextChannel[]
    logs: TextChannel | undefined
    todos: TextChannel | undefined
    polls: TextChannel | undefined
    alerts: TextChannel | undefined
}

declare global{
    const channels:IChannels;
    const client:Client;
}

export interface IGlobal extends Global{
    channels:IChannels
    client:Client
}