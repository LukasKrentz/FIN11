//created by Kevin - (https://github.com/Kyukishi)

import fs from 'fs';
import path from 'path';

//read config from config.json
interface IConfig{
    token: string
    server: string
    channels: {
        whitelistedChannels: string[]
        blacklistedChannels: string[]
        logs: string
        todos: string
        polls: string
        alerts: string
    }
    allowAllChannels: number | boolean
}
const config:IConfig = JSON.parse(fs.readFileSync(path.join(__dirname, 'config.json')).toString());

export default config;